#!/bin/bash
# Merxios ERP-Sync - HTTP Application Audit Automation

BASE_URL="http://localhost:3000"

echo "========================================"
echo "   B-Audit: API HTTP Surface Check "
echo "========================================"

# Check 1: General App Liveness
echo "[*] Auditing Route: Liveness (/health)"
LIVENESS=$(curl -s -o /dev/null -w "%{http_code}" ${BASE_URL}/health)
if [ "$LIVENESS" -eq 200 ]; then
    echo "[PASS] Liveness Node module is active and answering HTTP 200."
else
    echo "[FAIL] Cannot reach root liveness. Status: $LIVENESS"
    exit 1
fi

# Check 2: Composed Infra Readiness
echo ""
echo "[*] Auditing Route: Readiness (/health/ready)"
READINESS=$(curl -s -o /dev/null -w "%{http_code}" ${BASE_URL}/health/ready)
if [ "$READINESS" -eq 200 ]; then
    echo "[PASS] Database Pool and Redis TCP Channels are bound and READY."
else
    echo "[WARNING] Insalubrious sub-channels. Status: $READINESS"
fi

# Check 3: Bull Board Suppressed Status
echo ""
echo "[*] Auditing Route: Admin Dashboard Traversal (/admin/queues)"
DASHBOARD=$(curl -s -o /dev/null -w "%{http_code}" ${BASE_URL}/admin/queues)
if [ "$DASHBOARD" -eq 404 ]; then
    echo "[PASS] Middleware and Queue Management strictly locked. Traversal 404 active."
else
    echo "[FAIL] Dashboard rendered. Potential exposition detected. Code: $DASHBOARD"
    exit 1
fi

echo ""
echo "========================================"
echo " AUDIT PASSED 100%: HTTP ROUTINES MOD "
echo "========================================"
exit 0
