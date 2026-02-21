# Arquitetura e Fluxo do Sistema de Filas (ERP-Sync)

Este documento foi elaborado para Desenvolvedores e Analistas de Sistema. O objetivo é descrever como funciona a infraestrutura de filas (BullMQ + Redis) responsável pela sincronização de dados entre os ERPs das lojas e o nosso banco de dados central (PostgreSQL).

---

## 1. Introdução à Infraestrutura Mínima

O sistema de processamento de background é composto por 3 engrenagens principais:
1. **NodeJS Backend (Produtores e Consumidores)**: A aplicação principal que agenda os jobs (Coloca na fila) e executa o trabalho em paralelo as rotas da API (Tira da fila).
2. **Redis (Message Broker / Cache)**: Serviço em memória ultrarrápido onde as mensagens da fila ficam armazenadas em trânsito. Usado para não sobrecarregar a memória da API.
3. **PostgreSQL (Database + JobRun)**: Onde os dados finais dos clientes/produtos são salvos e onde o histórico de auditoria (`JobRun`) guarda se um processamento deu certo ou errado.

A principal biblioteca que orquestra o trânsito entre o Node, o Banco e o Redis chama-se **BullMQ**.

---

## 2. Fluxo de Funcionamento (Data Flow)

O ciclo de vida de uma sincronização (ex: Produtos de milhares de Lojas) segue a seguinte ordem cronológica:

**A. Gatilho (Produtor)**
- A rotina é acionada via **CRON Job** agendado no código (Ex: `EVERY_DAY_AT_3AM` para clientes ou `0 4 * * *` para produtos).
- O NodeJS vai no banco de dados, busca **apenas** as lojas ativas (`isActive: true`), de forma paginada para não esgotar a RAM da API (traz em lotes de 100).
- Para **cada loja**, ele cria uma "Ficha" chamada `Job` contendo o `tenantId` (ID daquela loja).
- O sistema adiciona um **Delay Aleatório Distribuído (Jitter)** para impedir que 500 lojas consultem o sistema Millenium e salvem no banco exatamente no mesmo segundo. A loja 1 pode rodar no segundo 0, mas a loja 200 só rodará daqui a 35 minutos.
- A ficha é empurrada para o **Redis**, em uma fila chamada `erp-sync-queue`. Aqui o trabalho do Produtor acaba.

**B. Processamento (Consumidor)**
- O **SyncProcessor** (uma classe especial que escuta o Redis 24h por dia) puxa, por padrão (ou por configuração na Env `ERP_SYNC_CONCURRENCY`), as fichas `Job` da fila conforme vão ficando prontas (expirando o Delay Jitter distribuído).
- Ao puxar a ficha `sync-customers` da Loja X, ele **trava essa loja**. Ele cria um *Lock* no Redis para garantir: *"Ei, eu já estou processando essa loja X. Mais ninguém no mundo de outros datacenters ou containers faça isso simultaneamente"*. Se o script travar, há um "Heartbeat LUA" renovando esse lock para não ser destruído cedo demais.
- Ele faz o download de dados do Millenium, limpa e salva no Database via `upsert`.
- Ao finalizar (com sucesso ou falha total após tentativas), ele destrava o Redis (exclui o Lua Token Lock).

**C. Finalização e Auditoria**
- A Ficha sai do Redis. Por segurança à memória, temos limites intrínsecos no BullMQ para limpar (Pruning) as chaves temporárias prontas em curtos tempos (24 horas).
- Para termos um rastro humano perene, o NestJS ativa O *Event Trigger* `onCompleted` ou `onFailed` e salva fisicamente na tabela relacional `JobRun` do PostgreSQL os rastros: `durationMs`, status, timestamp real de inicio `processedOn`. Sem salvar PII (dados de clientes/produtos reais na fila). PII não entra em fila nem nos logs.

---

## 3. Segurança e Concorrência Multi-Tenant

Por arquitetura, vários clientes coexistem no banco. As seguintes garantias impedem que operações de clientes prejudiquem as dos outros clientes na rede:

*   **Prevenção contra 'Rajadas' (Rate/Burst Limits)**: 
    *   **Limiter BullMQ Global**: Controla quantos requests máximos aquela worker como um todo pode jogar nos ERPs globais por minuto (Ex: `max: 10, duration: 60000`).
    *   **Jitter e Hashing Local**: Uma técnica matemática impede que, caso rodem o CRON numa base de mil lojistas simultaneamente, chovam 1.000 requisições aos ERPs em 1 minuto. Elas são espalhadas aleatoriamente via hash-cap dentro de matrizes de horas longas e controladas pelas variáveis `ERP_SYNC_DELAY_PRODUCTS_MS_MAX` e `STEP`.
*   **Locks Atômicos vs Duplicidade Paralela**: Mesmo que o DevOps rode script duas vezes sem querer ou existam dois Containers NodeJS idênticos ligados juntos, o sistema de chaves e expirações (`PEXPIRE / LUA scripts`) do Redis impedem processamento simultâneo cruzando as threads. Só há `1` Job daquele Loja processando de cada vez.
*   **Isolamento Ambiental**: Banco e Variáveis em Dockers não expõem senhas para o `docker ps` e comandos afins devido ao uso restrito de montagens de *Docker Secrets files*.

---

## 4. O Sistema de Retentativas e Retenção (Garbage Collection)

- **Backoffs Geométricos**: Se o ERP Millennium da "Loja X" der erro ou estourar `Timeout`, a linha de base não aborta integralmente. O BullMQ insere o Job na "Geladeira" com tentativa exponencial (Ex: Tentativa 1 em 1 minuto, Tentativa 2 em 2 minutos, Tentativa 3 final em 4 minutos).
- Se na última estourar as "Tentativas Máximas" pré-estipuladas (default = 3 vezes), ele joga para Dead-Letter State (FAILED) loga e encerra a linha daquela loja (Pulando para o próximo vizinho). O Log no banco ficará visível o motivo (Failed com o log API returned status).
- **Auto-Limpeza Automática CRON**: Analisando logs passados, o banco pode crescer ad inifinitum. Com o `QueueCleanupService`, diariamente, registros da Tabela `JobRun` cuja idade exceda 90 dias (ou `RETENTION_DAYS_JOBRUN` .env configurado customizado) são executados um SQL de *Hard Delete* bypass auto-higienizando armazenamento morto permanente. 

---

## 5. Ações Manuais, Operações e Dúvidas Frequentes

### P: Qual Painel UI Existe para Olhar essas Filas em Tempo Real?
**Resposta**: É o "BullBoard". Contudo, **ele é mantido desligado por razões de Segurança Perimetral em Produção**.
- **Para ligar e acessar manualmente (Por DEVs/DEVOPS apenas):** No servidor em produção, modifique as variáveis: `ENABLE_BULLBOARD="true"`, adicione `BULLBOARD_USER="adm"` e `BULLBOARD_PASS="suasenhasupersecreta"`. Reinicie a API (`npm pm2 restart / app`). A interface viverá no caminho global `http://sua-api.com/admin/queues`, pedindo autenticação rígida.
- **Após atuar/investigar o problema**: Delete e retorne o config flag original `ENABLE_BULLBOARD="false"`.

### P: Como acompanho as demoras sem essa Interface?
**Resposta**: Basta usar Queries e Gráficos no banco da tabela de Auditoria Persistente de Long Term `JobRun`. Use simples query de select (Como demonstrado por nós em **`infra/audit/audit_jobrun.sql`**). Lá consta Média MS, Erros Massivos por Lojista, e Tenants que empacaram.

### P: O Redis Morreu ou Resetou Memoria, as Coisas Voltam?
**Resposta**: Os CRONS reciclam diários. Filas de memórias em Redis perdem "Delay" momentâneos se ele cair do ar em pico de processamento (Ele reinicializa com DB esvaziado, por padrão o persistence RDB não garante nanosegundos exatos do ponto da queda). Quando os CRONs rodarem de noite, todo o processo auto-estabilizará novamente buscando registros para aquele dia, ignorando logs faltantes não processados outrora na memória apagada da RAM efêmera do redis. 

### P: O processo caiu da API durante um Flete API pesado!
**Resposta**: Ele fará *Timeout Heartbeat Lua* expirar. Cerca de Meio Ciclo (`ERP_SYNC_LOCK_TTL_SECONDS`). Depois ele destrava a Loja Órfã, e na Próxima Rodada Volta à normalidade, ou outro nodejs rodando assume o Fletch (Rescue Stalled worker feature from BullMQ).

---

## 6. Diagrama de Variáveis CRÍTICAS (Exemplo .env)

As parametrizações ajustáveis sem mudar Código de Commit encontram-se expostas via Shell para manipulação DevOps/Admins:

| Variável .ENV Recomendada | Tipo | Explicação Tática/Uso Operacional |
| :--- | :--- | :--- |
| `ERP_SYNC_CONCURRENCY` | Int | Quantos processamentos o NodeJS irá retirar simultaneamente da Fila (Default 1). Aumentar isto (3, por ex) irá sobrecarregar paralelamente Pool Prisma Database + Millenium. Requere PgBouncer p/ alto pool. |
| `ERP_SYNC_LOCK_TTL_SECONDS` | Segundos | Demora tolerado antes de "roubarem a loja bloqueada". (Padrão 2Hs, só modifique se o millenium congelar mais que duas horas importando) |
| `ERP_SYNC_DELAY_CUSTOMERS_MS_MAX` | MS | Janela máxima (o teto, Ex: "todas rodam num loop de max 3600000ms"). Acima entra na malha das primeiras reatrasando o teto temporal para aliviar estouros. |
| `ENABLE_BULLBOARD` | String Boolean | Flag crítica `"true"/"false"` autorizando montar a porta HTTP Admin restrita ao host. |
