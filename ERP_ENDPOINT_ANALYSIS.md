# Análise de Aderência: Endpoint `pedido_venda/consulta`

**Status:** APROVADO COM RESSALVAS (AÇÃO NECESSÁRIA) ⚠️
**Endpoint:** `GET /api/millenium_eco/pedido_venda/consulta`

A análise do payload real (`pedidov=52`) revelou detalhes técnicos importantes que exigem tratativa no código de integração.

---

## 1. Desafios Identificados (Gaps Confirmados) 🛑

### A. Produto Sem Nome (Resolvido) ✅
**Descoberta do Usuário:** Endpoint `/api/millenium_eco/produtos/listavitrine`.
**Uso:** Podemos buscar detalhes do produto passando `produto={id}`.
*   **Campos Úteis:**
    *   `descricao1`: "TOP CORTININHA..." (Nome Curto)
    *   `nome_produto_site`: "TOP CORTININHA... MERIDA" (Nome Completo)
    *   `ncm`: Classificação fiscal (útil para Analytics avançado).
    *   `url_imagens`: (Se houver, podemos exibir foto do produto no CRM!).
*   **Estratégia:** Sync "Lazy". Se o produto não existir no banco do CRM, buscamos neste endpoint e salvamos.

### B. Cliente Opcional no Payload
No JSON de exemplo, o campo `dados_cliente` veio vazio (`[]`), mesmo com `cliente: 302`.
*   **Solução:** Lógica de Fallback.
    *   Se `dados_cliente` vier preenchido -> Usa.
    *   Se vier vazio -> Usar o ID `cliente: 302` e buscar em `GET /clientes?id=302`.

### C. Vendedor / Atendente
**Requisito:** Atrelar venda a uma atendente específica.
*   **Estratégia:** O CRM deve tentar mapear `Transaction.channel` ou um campo customizado `attendantName` com o valor de `nome_vendedor`. Se vier nulo, salvar como "Não Informado".

### D. Formato de Data (Microsoft JSON)
As datas vêm no formato ASP.NET AJAX antigo: `/Date(1552532400000-180)/`.
*   **Ação:** Implementar função `parseAspNetDate()`.

---

## 2. Estrategia de Sincronização Atualizada (Final)

### Fluxo de Código (SyncService)
1.  **Buscar Vendas** (`/pedido_venda/consulta`).
2.  **Iterar Itens:**
    *   Verificar se Produto ID (ex: 14) já existe no CRM.
    *   **Se NÃO existe:** Chamar `/produtos/listavitrine?produto=14`.
        *   Salvar Produto com Nome Real ("TOP CORTININHA...").
    *   **Se JÁ existe:** Usar nome do cache/banco.
3.  **Iterar Cliente:**
    *   Verificar dados. Se incompleto, chamar `/clientes/lista?cliente=ID`.
4.  **Salvar Transação.**

# Análise de Aderência: Endpoints Auxiliares

### 1. Clientes (`/clientes/lista`)
**Status:** APROVADO ✅
**Uso:** Fallback para dados de contato (Email/Telefone).

### 2. Produtos (`/produtos/listavitrine`)
**Status:** APROVADO ✅
**Uso:** Enriquecimento de cadastros (Nomes e Fotos).
**Parâmetros Chave:**
*   `produto={id}` e `vitrine={id}`.

### 3. Vitrines (`/vitrine/listatabelas`)
**Status:** INFORMATIVO ℹ️
**Ids Descobertos:**
*   `1`: PRIMICIA
*   `2`: PRIMICIA VTEX (Vamos usar este como padrão/env var).
