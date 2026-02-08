# Documento de Requisitos de Integração ERP -> CRM (MERXIOS)

**Data:** 01/02/2026
**Responsável:** Arquiteto de Software (Antigravity)
**Contexto:** Definição dos contratos de dados necessários para alimentar o CRM a partir do ERP externo, garantindo funcionalidade plena dos módulos de Marketing (RFM, Campanhas) e Vendas.

---

## 1. Mapeamento de Entidades

O CRM possui uma estrutura enxuta focada em **Cliente** e **Transação**. Não mantemos uma tabela relacional estrita de Produtos (eles são armazenados como JSON nas transações), mas precisamos dos dados deles para segmentação.

### A. Entidade: Clientes (Customer)
**Destino CRM:** Tabela `Customer`
**Chave Única Sugerida:** `email` ou `cpf` (O schema usa `email` como único, mas o DTO pede CPF. *Decisão: Priorizar E-mail para Marketing, usar CPF para desduplicação se disponível*).

| Campo ERP (Sugestão) | Campo CRM (`Customer`) | Obrigatoriedade | Justificativa / Uso |
| :--- | :--- | :--- | :--- |
| `name` / `full_name` | `name` | **OBRIGATÓRIO** | Personalização de mensagens e busca. |
| `email` | `email` | **OBRIGATÓRIO** | Chave única (schema), canal de Email Marketing. |
| `phone` / `mobile` | `phone` | **CRÍTICO** | Canal WhatsApp (foco do CRM). |
| `birth_date` | `birthDate` | OPCIONAL | Automações de Aniversário. |
| `city` | `city` | OPCIONAL | Segmentação Geo (já usado no seed). |
| `state` | `state` | OPCIONAL | Segmentação Geo. |
| `created_at` | `createdAt` | **OBRIGATÓRIO** | Saber se é "Novo Cliente" (Recência do cadastro). |

> **Nota:** Os campos `totalSpent`, `ordersCount`, `lastOrderDate` e `rfmStatus` **NÃO** devem ser importados. Eles são campos calculados (derivados) pelo nosso backend ao processar as transações.

### B. Entidade: Vendas/Pedidos (Transactions)
**Destino CRM:** Tabela `Transaction`
**Gatilho:** Importar apenas pedidos com status "Pago/Concluído" (Vendas efetivas).

| Campo ERP (Sugestão) | Campo CRM (`Transaction`) | Obrigatoriedade | Justificativa / Uso |
| :--- | :--- | :--- | :--- |
| `order_id` / `code` | - | Opcional | Controle de idempotência (evitar duplicar vendas). |
| `customer_email` | `customerId` | **OBRIGATÓRIO** | Vínculo com a tabela Customer. |
| `created_at` / `date` | `date` | **OBRIGATÓRIO** | Cálculo de RFM (Recência). Vital para saber a última compra. |
| `total` / `amount` | `totalValue` | **OBRIGATÓRIO** | Cálculo de RFM (Monetary) e LTV. |
| `status` | `status` | **OBRIGATÓRIO** | Importar apenas `PAID` ou `COMPLETED`. Ignorar cancelados. |
| `channel` | `channel` | OPCIONAL | "Loja Física", "WhatsApp", "E-commerce". Útil para análise. |
| `items` (Lista) | `items` (JSON) | **CRÍTICO** | Necessário para saber O QUE foi comprado (Lógica de "Comprou X"). |

### C. Itens do Pedido (Dentro de Transaction)
**Destino CRM:** Coluna JSON `Transaction.items`

| Campo ERP | Campo JSON | Importância |
| :--- | :--- | :--- |
| `product_name` | `name` | Alta | Exibir no histórico do cliente. |
| `unit_price` | `price` | Média | Conferência de valor. |
| `category_name` | `category` | **Alta** | Segmentação (ex: "Quem comprou Calçados"). Visto em `seed.ts`. |

---

## 2. Dependências de Histórico e RFM

O arquivo `backend/prisma/seed.ts` define regras claras de RFM (Recency, Frequency, Monetary) que dependem diretamente do histórico de compras.

**Regras Atuais (Seed):**
*   **Champions:** Gasto > R$1500 + Compra nos últimos 30 dias.
*   **Leais:** Gasto > R$500 + Compra nos últimos 60 dias.
*   **Em Risco:** Sem comprar há mais de 90 dias.
*   **Novos:** Sem histórico suficiente.

**Requisito de Importação:**
Para que o segmento **"Em Risco"** funcione no 'Day 1', precisamos saber quem NÃO compra há 90 dias.
*   **Mínimo Absoluto:** Importar ultimos **6 meses** de vendas.
*   **Ideal (Recomendado):** Importar ultimos **12 a 24 meses** (1 a 2 anos). Isso permite calcular LTV real e identificar sazonalidade (ex: cliente que só compra no Natal).

---

## 3. Sugestão de Endpoints (API ERP)

Ao consultar a documentação do ERP, procure por endpoints que atendam aos padrões abaixo. Priorize endpoints que aceitem filtros de data (`since`, `created_after`) para permitir sincronização incremental futura (Polling).

### Prioridade 1: Sincronização de Vendas (Motor do RFM)
Procure por: `GET /orders`, `GET /sales`, `GET /transactions`
*   **Filtros Necessários:**
    *   `status`: (paid, completed)
    *   `date_min` / `date_max`: Para puxar histórico.
    *   `include_items`: true (Para vir o array de produtos).
    *   `include_customer`: true (Para vir dados do cliente junto, economizando requisições).

### Prioridade 2: Sincronização de Clientes (Base Cadastral)
Procure por: `GET /customers`, `GET /clients`
*   Caso o endpoint de vendas não traga detalhes completos do cliente (como telefone ou nascimento), precisaremos bater neste endpoint.
*   **Filtros:** `modified_since` (Para pegar apenas alterações de cadastro).

### Exemplo de Fluxo de Carga Inicial (Seed Real):
1.  **Iterar** endpoint de pedidos (`GET /orders`) retroativo (Jan/2025 até Hoje).
2.  Para cada pedido:
    *   Verificar se o cliente (email) já existe no CRM.
    *   Se não, criar `Customer` com os dados vindos no pedido.
    *   Se sim, atualizar dados cadastrais se mais recentes.
    *   Criar a `Transaction` vinculada.
3.  Após importar tudo, rodar rotina interna `calculateRFM()` (visto no final do loop do seed) para atualizar os status `Champions`, `Em Risco`, etc.
