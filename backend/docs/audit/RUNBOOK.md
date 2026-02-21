# Merxios ERP-Sync - Runbook & Operational

## 1. Deploy PROD e QA

O serviço opera sob infraestrutura empacotada.

```bash
# Iniciar a infraestrutura (Postgres + Redis c/ Hardening Entrypoints)
# Pré-requisito: Variável root Redis Secrets preenchida
docker-compose -f docker-compose.prod.yml up -d --build

# Backend App / Worker (NodeJS env local/pm2 ou Container caso conteinerizado futuramente)
npm run build
NODE_ENV=production npm run start:prod
```

## 2. Rotacionar Segredo Redis (Passo Seguro)

Como segredos de host não mudam quente com compose em Swarm/Vaultless:

1. Modifique a chave root na máquina Host de destino:
   ```bash
   sudo echo "NOVA_SENHA_COMPLEXA_123!" > /etc/merxios/secrets/redis_password
   ```
2. Derrube e recrie a sub-infra de Cache forçando captura de entrypoint:
   ```bash
   docker-compose -f docker-compose.prod.yml stop redis
   docker-compose -f docker-compose.prod.yml rm -f redis
   docker-compose -f docker-compose.prod.yml up -d redis
   ```
3. Reinicie os conectores (NodeJS App Backend) para que puxem nova env correspondente no `PrismaService` / `BullMQ`.

## 3. Verificar Saúde Infra-Aplicacional

**A) Integridade dos Pipes (NodeJS)**
```bash
# Testa Liveness API
curl -i http://localhost:3000/health
# Testa Interconexões (BD & Broker)
curl -i http://localhost:3000/health/ready
```
**B) Diagnósticos Host Docker**
```bash
# Integridade Compose Reportada
docker ps --filter "name=Merxios_redis_prod"
# Ping Local Redis
docker exec Merxios_redis_prod redis-cli -a $(sudo cat /etc/merxios/secrets/redis_password) ping
```

## 4. Pausar e Retomar Filas (BullMQ)

A interface administrativa é fechada por padrão e não plugada na rede. Para atuar, defina a porta de gerência nas Variáveis de Produção, reestarte o Backend, ou opere via redis-cli puro (Não recomentado para non-devops).

**Ativando Surface API Temporariamente:**
Mude `.env` de Backend:
```env
ENABLE_BULLBOARD=true
BULLBOARD_USER=admin
BULLBOARD_PASS=adminsecretpass
```
*Acesse `/admin/queues` via credenciais e acione Pausa nas filas desejadas. Destrua as credenciais de `.env` após o ato mitigativo.*

## 5. Investigar Falhas Sistêmicas

**Busca Lógica (Erros contínuos - JobRuns):**
Conecte no banco em Read-Only e extraia o erro primário do Bull process worker:
```sql
SELECT "tenantId", "status", "jobName", "error", "durationMs" 
FROM "JobRun" 
WHERE status = 'FAILED' 
ORDER BY "startedAt" DESC LIMIT 50;
```

**Busca Infra (Queue travada / Redis Evictions):**
```bash
# Observar warnings da heap node ou crashes docker backend
pm2 logs backend
```

## 6. Reprocessar um Tenant Manualmente

Triggers manuais injetam jobs na fila ignorando Cron.

*(Requer script utilitário NodeJS atado à importação do `syncQueue.add()` apontando pra Tenant ID específico; caso disponível na suíte de scripts).*

## 7. Limpar Registros Antigos (JobRun Prune)

O serviço purga Jobs cronologicamente de forma automática sob cronograma (90 dias default). Em caso de alarme de storage estourado no DB PG:

```bash
# Redefina a retenção no config
export RETENTION_DAYS_JOBRUN=15
```
Ou exclua no Banco Diretamente (Manual Admin Interv.):
```sql
DELETE FROM "JobRun" WHERE "startedAt" < NOW() - INTERVAL '30 days';
```
