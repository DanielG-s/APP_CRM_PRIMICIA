#!/bin/bash
# Merxios ERP-Sync - Redis B-Audit Automation

echo "=================================="
echo "    B-Audit: Redis Sandbox Check "
echo "=================================="

# Check 1: Invisible Password on Process Trace
echo "[*] Checking Docker Host Traces (docker ps)..."
if docker ps --no-trunc | grep Merxios_redis_prod | grep -q "requirepass"; then
    echo "[FAIL] Redis password is precipitately exposed on process list!"
    exit 1
else
    echo "[PASS] Process trace sanitized via explicit Entrypoint injection."
fi

# Check 2: Inner Linux process
echo ""
echo "[*] Checking Linux Inner Host Traces (ps aux)..."
if docker exec Merxios_redis_prod ps aux | grep -q "requirepass"; then
    echo "[FAIL] Internal Linux table is tracking password strings."
    exit 1
else
    echo "[PASS] Internal Linux host tables are pristine."
fi

# Check 3: Container Environment Variable Isolation
echo ""
echo "[*] Checking Docker Env Isolation (printenv)..."
if docker exec Merxios_redis_prod printenv | grep -q "REDIS_PASSWORD"; then
    echo "[FAIL] REDIS_PASSWORD resides inside active ENV structure!"
    exit 1
else
    echo "[PASS] Container ignores environment variable bindings for passwords."
fi

# Check 4: Container Secrets File verification
echo ""
echo "[*] Checking Secrets Target Location..."
if docker exec Merxios_redis_prod ls /run/secrets/redis_password > /dev/null 2>&1; then
    echo "[PASS] Native secret mount points verified at /run/secrets/."
else
    echo "[WARNING] Secret mount not found! Did you deploy with docker-compose secrets?"
    exit 1
fi

echo ""
echo "=================================="
echo " AUDIT PASSED 100%: REDIS MODULE "
echo "=================================="
exit 0
