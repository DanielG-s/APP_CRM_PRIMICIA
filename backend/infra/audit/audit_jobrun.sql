-- Merxios ERP-Sync - Audit Queries
-- Execute estas extrações sobre a base de dados PostgreSQL para fornecer dados aos agentes de compliance.

-- Query 1: Visualizar os Últimos 20 Execuções (Audit Trail Básico)
SELECT 
    id, 
    "queue", 
    "jobName", 
    "tenantId", 
    status, 
    "attemptsMade",
    "durationMs" 
FROM "JobRun" 
ORDER BY "startedAt" DESC 
LIMIT 20;

-- Query 2: Extrair Tenants com Falhas Recheadas nos Últimos 7 Dias
SELECT 
    "tenantId", 
    COUNT(id) AS "Failed_Jobs_Amount"
FROM "JobRun"
WHERE status = 'FAILED' 
  AND "startedAt" > NOW() - INTERVAL '7 days'
GROUP BY "tenantId"
ORDER BY "Failed_Jobs_Amount" DESC;

-- Query 3: Analisar Custos Processuais (Duração Média de Jobs/Mês)
SELECT 
    "jobName" AS "Routine_Type",
    trunc(AVG("durationMs")) AS "Avg_Duration_MS",
    MAX("durationMs") AS "Max_Duration_MS",
    COUNT(id) AS "Total_Processed_Runs"
FROM "JobRun"
WHERE "startedAt" > NOW() - INTERVAL '30 days'
GROUP BY "jobName";

-- Query 4: Extrator de Auditoria em Payload Neutro C-Level (Prova GDPR/LGPD Compliant)
-- Demonstração que SafePayload não vaza dados intrínsecos de clientes finais.
SELECT 
    id, 
    "tenantId", 
    "safePayload", 
    error
FROM "JobRun" 
WHERE "safePayload" IS NOT NULL
LIMIT 5;

-- Prune Administrativo (Hard Deletion Bypass - EMERGENCY ONLY)
-- DELETE FROM "JobRun" WHERE "startedAt" < NOW() - INTERVAL '30 days';
