# Security Questionnaire (B-Audit Ready Q&A)

Este documento centraliza as respostas corporativas (Vendor Assessment) aos inquéritos de segurança da plataforma ERP-Sync.

---

### Q1: "Como segredos são armazenados e rotacionados?"
**Resposta Técnica:** Os segredos vitais (ex: `REDIS_PASSWORD`) não habitam matrizes versionadas de código ou injetores de Variáveis de Ambiente padrão. Eles são entregues via mecanismo de **Docker Mount Secrets** restrito no provisionamento EC2. A superfície é blindada por níveis de permissão `chmod 600 root:root` atadas ao Host Linux isolando leituras.
**Limitações Atuais:** Não é utilizado cofres ativos (ex: Hashicorp Vault). Baseia-se em acesso IAM restrito à própria instância (Host-Level Trust).
**Evidência:** Arquivo `docker-compose.prod.yml` provando o bloco `secrets` e doc `EVIDENCE.md` [Parte 3].

### Q2: "Existe segregação de ambientes QA/PROD?"
**Resposta Técnica:** Sim. O isolamento lógico, conectivo e databased é segmentado através de declarações de Docker-Compose divergentes sob clusters separados. A ponte Node.js discerne seu comportamento pela key master `NODE_ENV`. O Host do Redis só é atrelado quando este flagrante exige.
**Evidência:** Arquivo `app.module.ts` declarando condicional para `REDIS_HOST`.

### Q3: "Quais portas ficam abertas?"
**Resposta Técnica:** Somente as portas destinadas a requisições de Front-Channel (Ex: `80/443 -> 3000`). Todas as portas intra-operacionais como a TCP `6379` do Message Broker (Redis) e a `5432` do Backend Data Store coexistem numa bridge local restrita (`internal_network`), não listadas publicamente via interfaces físicas.
**Evidência:** Configuração de `networks: driver: bridge` e ausência da sintaxe `ports:` no Compose.

### Q4: "Como previnem duplicidade de processamento?"
**Resposta Técnica:** Implementamos Atômicos baseados em `Distributed Locking` diretamente no núcleo em memória do Redis com chaves voláteis (TTL Heartbeat Renewed). Adicionalmente, inserimos determinismo por Job-Id.
**Mitigação Atuante:** Se rodadores Cron colidirem paralelos ao limite, o ID atômico expulsa duplicatas na base de origem, e o token Lua `lock_active` paralisa concorrência paralela indesejada.
**Evidência:** Trecho referenciado do núcleo em `sync.processor.ts` com scripts Lua Release.

### Q5: "Como lidam com falhas e retries?"
**Resposta Técnica:** Aplica-se Backoff exponencial integrado nos processadores. Filas com requisições caídas ou APIs ERPs indisponíveis reentram na malha incrementalmente.
**Mitigação:** Os Jobs que esgotam as N `attempts` caem na esteira Dead-Letter explícita logando como status `FAILED` persistido no Banco Relacional para trigger manual.
**Evidência:** Ver diretivas `{ attempts: 3, backoff: { type: 'exponential' } }` nos sync services.

### Q6: "Como auditar ações passadas?"
**Resposta Técnica:** Possuímos a malha de tabelas `JobRun` auditável por Data. O estado de partida `job.processedOn` é pinado junto a `durationMs` sem depender da hora de requisição enfileirado no Cron.
**Evidência:** Doc `EVIDENCE.md` [Parte 5 - Amostra SQL Dump].

### Q7: "Como garantem que PII não vai para logs/fila?"
**Resposta Técnica:** Descartamos payload em massa (JSON dumps de faturamento e chaves do Vtex). Os rastros de execução armazenam pontualmente dados operacionais na coluna `safePayload` atrelados ao identificador cego (`tenantId`).
**Limitações:** Dados no ERP dependem da ponte HTTPS com Vendor.
**Evidência:** Campo `safePayload` no schema Prisma.

### Q8: "Qual o plano de DR/backup do JobRun e BD?"
**Resposta Técnica:** Os dados persistentes do Sync são de trânsito (Filas Bull evaporam post-complete). O Log JobRun é guardado no disco Persistente do Postgres que obedece cronogramas de Retenção automatizados do Nodejs (90 Dias default purging) antes de ser rotacionado.
**Limitações:** Backup estrutural de EBS/RDS requer gestão extra do vendor de SRE externo.
**Evidência:** Modulo Nodejs `QueueCleanupService`. 

### Q9: "O que acontece se o worker Node cair no meio do fluxo?"
**Resposta Técnica:** O lock TTL Redis se esvai caso o Processo Heartbeat NodeJS trave ou se perca. Outro container restabelecido re-enfileira via Active state da Fila preservada pelo Redis storage. O Redis-Broker desvia para "Stalled Jobs" que reentram conforme tolerância sem travar a porta para novos jobs.
**Evidência:** Script de setInterval `heartbeatTimer` no Sync Processor.
