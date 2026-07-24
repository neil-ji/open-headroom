#!/usr/bin/env bash
# =============================================================================
# deploy.sh — Zero-downtime blue-green deployment for Headroom proxy
#
# Usage:
#   make deploy                  # deploy to the inactive slot
#   ACTIVE_COLOR=blue make deploy  # override active color detection
#
# Phases:
#   1. Determine active / inactive colors
#   2. Build Docker image for the inactive instance
#   3. Start the inactive instance
#   4. Wait for /readyz on the new instance
#   5. Reload Caddy to route traffic to the new instance
#   6. Drain in-flight requests on the old instance
#   7. Stop the old instance
#   8. Persist the new active color to .env
# =============================================================================

set -euo pipefail

SELF="$(basename "$0")"
cd "$(git rev-parse --show-toplevel)" 2>/dev/null || cd "$(dirname "$0")/.."

# ---------------------------------------------------------------------------
# Phase 1: Determine active / inactive colors
# ---------------------------------------------------------------------------
# Source .env for ACTIVE_COLOR if available; default to blue.
if [ -f .env ]; then
    set -a; source .env; set +a
fi
ACTIVE_COLOR="${ACTIVE_COLOR:-blue}"

if [ "$ACTIVE_COLOR" = "blue" ]; then
    INACTIVE_COLOR="green"
    INACTIVE_PORT="8789"
    ACTIVE_PORT="8788"
else
    INACTIVE_COLOR="blue"
    INACTIVE_PORT="8788"
    ACTIVE_PORT="8789"
fi

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "[${SELF}] Deploying: ${ACTIVE_COLOR} → ${INACTIVE_COLOR}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# ---------------------------------------------------------------------------
# Phase 2: Build the Docker image
# ---------------------------------------------------------------------------
echo ""
echo "[Phase 2/8] Building image for headroom-${INACTIVE_COLOR}..."
docker compose build "headroom-${INACTIVE_COLOR}"
echo "[Phase 2/8] Build complete."

# ---------------------------------------------------------------------------
# Phase 3: Start the inactive instance
# ---------------------------------------------------------------------------
echo ""
echo "[Phase 3/8] Starting headroom-${INACTIVE_COLOR}..."
docker compose up -d --force-recreate "headroom-${INACTIVE_COLOR}"
echo "[Phase 3/8] Container created from fresh image."

# ---------------------------------------------------------------------------
# Phase 4: Wait for /readyz on the new instance
# ---------------------------------------------------------------------------
echo ""
echo "[Phase 4/8] Waiting for /readyz on headroom-${INACTIVE_COLOR}:${INACTIVE_PORT}..."
STARTED_AT=$(date +%s)
TIMEOUT=120  # seconds

while true; do
    NOW=$(date +%s)
    ELAPSED=$((NOW - STARTED_AT))
    if [ "$ELAPSED" -ge "$TIMEOUT" ]; then
        echo ""
        echo "[${SELF}] ERROR: headroom-${INACTIVE_COLOR} did not become ready within ${TIMEOUT}s"
        echo "[${SELF}] Rolling back: stopping new instance..."
        docker compose stop "headroom-${INACTIVE_COLOR}"
        exit 1
    fi

    HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" "http://127.0.0.1:${INACTIVE_PORT}/readyz" 2>/dev/null) || true
    HTTP_CODE="${HTTP_CODE:-000}"
    if [ "$HTTP_CODE" = "200" ]; then
        echo "[Phase 4/8] headroom-${INACTIVE_COLOR} is ready (HTTP ${HTTP_CODE}, took ${ELAPSED}s)"
        break
    fi
    printf "  ... waiting (HTTP %s, %ss elapsed)\n" "$HTTP_CODE" "$ELAPSED"
    sleep 3
done

# ---------------------------------------------------------------------------
# Phase 5: Switch Caddy to the new instance
# ---------------------------------------------------------------------------
echo ""
echo "[Phase 5/8] Switching Caddy to headroom-${INACTIVE_COLOR}..."

# Replace the backend hostname in the Caddyfile.
# Use sed -i '' for macOS (BSD sed); Linux uses sed -i without the '' argument.
CADDYFILE="./Caddyfile"
if [ "$(uname)" = "Darwin" ]; then
    sed -i '' "s/headroom-${ACTIVE_COLOR}:8787/headroom-${INACTIVE_COLOR}:8787/" "$CADDYFILE"
else
    sed -i "s/headroom-${ACTIVE_COLOR}:8787/headroom-${INACTIVE_COLOR}:8787/" "$CADDYFILE"
fi

# The Caddyfile is bind-mounted — the sed above is already visible inside the container. No docker cp needed.
docker exec headroom-caddy caddy reload --config /etc/caddy/Caddyfile --force

echo "[Phase 5/8] Caddy reloaded — traffic now goes to headroom-${INACTIVE_COLOR}."

# ---------------------------------------------------------------------------
# Phase 6: Drain in-flight requests on the old instance
# ---------------------------------------------------------------------------
echo ""
echo "[Phase 6/8] Draining in-flight requests from headroom-${ACTIVE_COLOR} (5s)..."
sleep 5
echo "[Phase 6/8] Drain complete."

# ---------------------------------------------------------------------------
# Phase 7: Stop the old instance
# ---------------------------------------------------------------------------
echo ""
echo "[Phase 7/8] Stopping headroom-${ACTIVE_COLOR}..."
docker compose stop "headroom-${ACTIVE_COLOR}" --timeout 30
echo "[Phase 7/8] headroom-${ACTIVE_COLOR} stopped."

# ---------------------------------------------------------------------------
# Phase 8: Persist the new active color
# ---------------------------------------------------------------------------
echo ""
echo "[Phase 8/8] Persisting active color to .env..."
if [ -f .env ]; then
    if grep -q "^ACTIVE_COLOR=" .env; then
        if [ "$(uname)" = "Darwin" ]; then
            sed -i '' "s/^ACTIVE_COLOR=.*/ACTIVE_COLOR=${INACTIVE_COLOR}/" .env
        else
            sed -i "s/^ACTIVE_COLOR=.*/ACTIVE_COLOR=${INACTIVE_COLOR}/" .env
        fi
    else
        echo "ACTIVE_COLOR=${INACTIVE_COLOR}" >> .env
    fi
    echo "[Phase 8/8] .env updated: ACTIVE_COLOR=${INACTIVE_COLOR}"
else
    echo "[Phase 8/8] WARNING: .env not found. ACTIVE_COLOR is now ${INACTIVE_COLOR} (not persisted)"
    echo "Run 'echo ACTIVE_COLOR=${INACTIVE_COLOR} >> .env' to persist."
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "[${SELF}] === DEPLOY COMPLETE ==="
echo "[${SELF}] Active: ${INACTIVE_COLOR}  |  Standby: ${ACTIVE_COLOR}"
echo "[${SELF}] Next deploy will target headroom-${ACTIVE_COLOR}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
