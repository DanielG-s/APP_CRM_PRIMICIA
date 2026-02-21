# Merxios ERP-Sync - Security Architecture & Audit Report

## 1. Visão Geral da Arquitetura (QA/PROD)
A arquitetura do módulo de sincronização consiste em uma API NestJS (Backend), PostgreSQL (Persistence) e Redis (Message Broker/Queue via BullMQ).
Os ambientes de QA e PROD seguem paridade de infraestrutura baseada em containers (Docker/Docker Compose). O isolamento realocacional é executado via Docker Networks customizadas (`internal_network`).

## 2. Superfície Exposta (Portas e Rotas)
- **PostgreSQL**: Porta 5432 mapeada para operação de rede local interna.
- **Redis**: Opera nativamente na porta 6379, sendo acessível **apenas** dentro da `internal_network` do Docker. Não possui mapeamento (`ports`) para o Host Linux.
- **NodeJS Backend**: Porta de aplicação exposta para o Ingress/LB.
- **BullBoard Dashboard**: A interface de administração de filas não é registrada e nem carregada em memória na rota `/admin/queues` a menos que a flag explícita `ENABLE_BULLBOARD=true` seja fornecida no ambiente.

## 3. Proteção e Isolamento do Redis
O armazenamento de cache e mensageria é restrito por múltiplas camadas:
- **Port Binding**: O Redis opera em `0.0.0.0` para prover acesso à interface de rede do Container (eth0 Docker), mas como a porta não sofre mapeamento externo no host, conexões TCP de fora da bridge Docker são impossíveis.
- **Protected Mode**: Ativado via `protected-mode yes` obrigando uso de autenticação e mitigando varreduras de porta acidentais.
- **Autenticação**: Uso massivo da diretiva `requirepass` preenchida dinamicamente no boot-time via secrets engine.

## 4. Gestão de Segredos
Nenhum segredo ou credencial é injetado via `environment` no Compose do Redis, neutralizando vazamentos via comando `docker inspect`.
- **Mecanismo**: Docker Compose Secrets via Bind Mount Read-Only.
- **Localização no Host**: Os arquivos moram estritamente no Host (Ex: `/etc/merxios/secrets/redis_password`).
- **Controles Exigidos**: O arquivo `redis_password` não faz parte de repositórios versionados, pertence obrigatoriamente a `root:root` e sustenta restrição de leitura `chmod 600`.
- **Risco/Limitação**: Depende visceralmente da integridade de acesso root do Host EC2/VM. Níveis mais elevados exigem migração futura para AWS Secrets Manager via sidecars OCI ou Hashicorp Vault.

## 5. Política de Retenção de Dados em Fila
A higienização de filas ocorre intrinsecamente para preservar Memória RAM (Redis) e Storage (Postgres).
- **BullMQ Queue Lifecycle**: Configurações `removeOnComplete` (manter 100 max, max 24h age) e `removeOnFail` (manter 500 max, max 7d age).  
- **JobRun Persistence**: Entidades estruturadas da auditoria no PostgreSQL expiram ciclicamente via `QueueCleanupService` agendado para purgar registros de vida superior a configurável `RETENTION_DAYS_JOBRUN` (Default: 90 dias).

## 6. Auditoria Ativa e Logs (JobRun)
As trilhas de execução trafegam pelo fluxo do Worker limitando a emissão de Personally Identifiable Information (PII).
- Campos capturados: `queue`, `jobName`, `jobId`, `tenantId`, `status`, `startedAt`, `finishedAt`, `durationMs`, `attemptsMade`, `error`.
- **PII Sanitation**: Logs estruturados em payload JSON são retidos na coluna `safePayload`, excluindo metadados operacionais não logáveis (tokens, chaves transientes, nomes completos explícitos na fila sem precisão).

## 7. Controles de Disponibilidade
Monitoramento ativo é habilitado via `HealthController` injetado pelo orquestrador.
- **`GET /health`**: Timestamp e Liveness pulse do Worker NodeJS.
- **`GET /health/ready`**: Liveness probe composto consultando Database (`SELECT 1`) e Redis ping via BullMQ TCP connection. Em caso de insalubridade de infraestrutura, encerra com `HTTP 503 SERVICE UNAVAILABLE` informando o orquestrador para desviar roteamento / reiniciar a API.
- **Docker Healthcheck**: Monitoramento Docker-Native sobre o Redis usando cliente CLI isolado.

## 8. Controles de Concorrência e Operacional
Para abater Race Conditions e Burst Rates inter-tenant:
- **Distributed Locking**: Jobs executam com aquisição Lock atômica no Redis. A chave previne que um tenant rode a mesma categoria de sync mais de uma vez simultaneamente.
- **Lock Heartbeat Refresh**: Implementação LUA Script renovadora do lock a cada `N` segundos para Jobs processuais longos previnir expiração natural assíncrona.
- **Lua Release**: Deleção estrita usando token de autoria no release para não remover lock de terceiros em caso de atraso extremo.
- **Anti API Burst**: Hashing string algorítmico espalha tenants num slot limitável (ex: Janela de Modulo 1H a 2H) adicionado de um *Jitter* randômico (0-15s), barrando avalanches de requisições de dezenas de clientes aos provedores em blocos cronológicos iguais.

## 9. Matriz de Riscos Remanescentes

| Ameaça / Risco | Probabilidade | Impacto | Mitigação Vigente / Aceite |
| :--- | :--- | :--- | :--- |
| **Exposição Física de Host DB/Cache Segredos** | BAIXA | ALTO | Como implementado em Compose, Segredo baseia-se em Files. Vulnerabilidade requer exploração Privilege Root Existent. Aceito via política de restrição de acessos SSH corporativa direta. |
| **Exaustão de Connection Pool (DB)** | MÉDIA | MODERADA | Limitadores limitam *Workers globally concurrency* (`ERP_SYNC_CONCURRENCY`). Se estendido severamente por escalagem, causaria lock de portas. Mitigação requer inserção do componente PgBouncer na rede. |
| **API Rate-Limiting Outbound** | BAIXA/MÉDIA | MODERADA | Espalhamento via Jitter Randômico e Delay Modulo previne rajadas fixas. Ainda aplicável se base de lojistas ultrapassar subitamente as milhares de integrações para a mesma malha horária. |
