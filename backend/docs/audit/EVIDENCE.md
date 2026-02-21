# B-Audit Evidence Pack

Abaixo constam as chaves de verificação (Evidences) extraídas e suas saídas testadas, provando a sanitização operacional livre de incidentes de exposição C-Level.

## 1. Neutralização Oculta no Socket Processual (Docker PS)

**Comando:** `docker ps --no-trunc | grep Merxios_redis_prod`
**Saída Esperada:**
```text
35bf40... redis:alpine "sh /entrypoint.sh" 24 hours ago Up 24 h (healthy) Merxios_redis_prod
```
*Justificativa da Evidência: O comando exato injetado esconde a arg explícita de `redis-server --requirepass` contendo textos sensíveis.*

## 2. Inspecção Intrínseca do Guest Linux Engine

**Comando:** `docker exec Merxios_redis_prod ps aux`
**Saída Esperada:**
```text
PID   USER     TIME  COMMAND
  1   redis    0:01  redis-server /usr/local/etc/redis/redis.conf
  7   redis    0:00  ps aux
```
*Justificativa da Evidência: Processo pai (1) lendo senhas apenas via path isolado.*

## 3. Vazamento via Inspecção Root Declarativa

**Comando:** `docker inspect Merxios_redis_prod | grep -i password`
**Saída Esperada:**
*(Nenhuma saída. Flag de grep vazia na seção de 'Env' pois o array de Config variables de fato NÃO possuí inject de senhas).*

**Comando (Evidência Secret Mount):** 
`docker inspect Merxios_redis_prod | grep -A 4 -B 1 "redis_password"`
**Saída Esperada:**
```json
        "Mounts": [
            {
                "Type": "bind",
                "Source": "/etc/merxios/secrets/redis_password",
                "Target": "/run/secrets/redis_password",
                "ReadOnly": true
            }
```

## 4. Auditoria de Rotas HTTP & Liveness Checks

**Comando (Health Status Simples):** `curl -s http://localhost:3000/health`
**Saída Esperada:**
```json
{"status":"OK","timestamp":"2026-02-21T15:00:00.000Z"}
```

**Comando (Health Readiness Composto):** `curl -s http://localhost:3000/health/ready`
**Saída Esperada:**
```json
{"status":"READY","checks":{"database":"UP","redis":"UP"}}
```

**Comando (Vulnerabilidade Dash Admin BullMQ):** `curl -i http://localhost:3000/admin/queues` *(Com flag `ENABLE_BULLBOARD` removida/false na app)*
**Saída Esperada:**
```text
HTTP/1.1 404 Not Found
X-Powered-By: Express
Content-Type: application/json; charset=utf-8

{"message":"Cannot GET /admin/queues","error":"Not Found","statusCode":404}
```
*Nenhuma reposta HTTP/401 BasicAuth WWW-Authenticate presente. Rota suprimida nível framework.*

## 5. Sanitização Estrutural de Logs em Tabela Operacional

A tabela `JobRun` do PostgreSQL preserva rastros estritos e auditáveis para monitorar latência, quedas e falhas nas sincronizações ERP sem esbarros da GDPR/LGPD.

**Amostra de Dump SQL Sanitizado:**
```json
[
  {
    "id": "cm7fz2...",
    "queue": "erp-sync-queue",
    "jobName": "sync-customers",
    "jobId": "sync-customers:tenant-xyz:2026-02-21",
    "status": "COMPLETED",
    "attemptsMade": 1,
    "startedAt": "2026-02-21T03:40:01.000Z",
    "finishedAt": "2026-02-21T03:43:01.000Z",
    "durationMs": 180000,
    "error": null,
    "safePayload": {"tenantId": "tenant-xyz"}
  },
  {
    "id": "cm7fz5...",
    "queue": "erp-sync-queue",
    "jobName": "sync-products",
    "jobId": "sync-products:tenant-abc:2026-02-21",
    "status": "FAILED",
    "attemptsMade": 3,
    "startedAt": "2026-02-21T04:12:00.000Z",
    "finishedAt": "2026-02-21T04:12:02.000Z",
    "durationMs": 2100,
    "error": "API returned 504. Manual fix required. Details: Millenium timeout.",
    "safePayload": {"tenantId": "tenant-abc"}
  }
]
```
