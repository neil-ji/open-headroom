#!/usr/bin/env bash
# =============================================================================
# rollback.sh — Instant Caddy flip back to the standby Headroom instance
#
# Usage:
#   make rollback                  flip Caddy to the standby color
#
# This is the fastest recovery path when the active instance is misbehaving:
# it does NOT rebuild, restart, or touch containers — just flips the Caddy
# backend to the other color and reloads. The standby still runs the previous
# (known-good) image and takes over in under a second with zero dropped
# connections (Caddy graceful reload).
# =============================================================================

set -euo pipefail

SELF="$(basename "$0")"
cd "$(git rev-parse --show-toplevel)" 2>/dev/null || cd "$(dirname "$0")/.."

# --- Read current active color from Caddyfile --------------------------------
CADDYFILE="./Caddyfile"
CURRENT_BACKEND=$(grep -o 'headroom-[a-z]*:8787' "$CADDYFILE" | head -1 | cut -d: -f1)

if [ -z "$CURRENT_BACKEND" ]; then
    echo "[${SELF}] ERROR: could not detect current Caddy backend from $CADDYFILE"
    exit 1
fi

CURRENT_COLOR="${CURRENT_BACKEND#headroom-}"

if [ "$CURRENT_COLOR" = "blue" ]; then
    TARGET_COLOR="green"
else
    TARGET_COLOR="blue"
fi

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "[${SELF}] Rolling back: headroom-${CURRENT_COLOR} → headroom-${TARGET_COLOR}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# --- Ensure the standby is running ------------------------------------------
STANDBY_STATUS=$(docker compose ps --status running "headroom-${TARGET_COLOR}" 2>/dev/null || true)
if [ -z "$STANDBY_STATUS" ]; then
    echo "[${SELF}] Standby headroom-${TARGET_COLOR} is not running, starting it..."
    docker compose up -d "headroom-${TARGET_COLOR}"
    echo "[${SELF}] Waiting for headroom-${TARGET_COLOR} to be ready..."
    TARGET_PORT="$([ "$TARGET_COLOR" = "blue" ] && echo "8788" || echo "8789")"
    STARTED_AT=$(date +%s)
    TIMEOUT=60
    while true; do
        NOW=$(date +%s)
        if [ "$((NOW - STARTED_AT))" -ge "$TIMEOUT" ]; then
            echo "[${SELF}] ERROR: headroom-${TARGET_COLOR} did not become ready within ${TIMEOUT}s"
            exit 1
        fi
        if curl -sf -o /dev/null "http://127.0.0.1:${TARGET_PORT}/readyz" 2>/dev/null; then
            echo "[${SELF}] headroom-${TARGET_COLOR} is ready."
            break
        fi
        sleep 2
    done
else
    echo "[${SELF}] Standby headroom-${TARGET_COLOR} is already running."
fi

# --- Flip Caddy backend -----------------------------------------------------
if [ "$(uname)" = "Darwin" ]; then
    sed -i '' "s/headroom-${CURRENT_COLOR}:8787/headroom-${TARGET_COLOR}:8787/" "$CADDYFILE"
else
    sed -i "s/headroom-${CURRENT_COLOR}:8787/headroom-${TARGET_COLOR}:8787/" "$CADDYFILE"
fi

docker exec headroom-caddy caddy reload --config /etc/caddy/Caddyfile --force

# --- Update .env ------------------------------------------------------------
if [ -f .env ] && grep -q "^ACTIVE_COLOR=" .env; then
    if [ "$(uname)" = "Darwin" ]; then
        sed -i '' "s/^ACTIVE_COLOR=.*/ACTIVE_COLOR=${TARGET_COLOR}/" .env
    else
        sed -i "s/^ACTIVE_COLOR=.*/ACTIVE_COLOR=${TARGET_COLOR}/" .env
    fi
fi

echo ""
echo "[${SELF}] Rollback complete — traffic now on headroom-${TARGET_COLOR}."
echo "[${SELF}] The broken headroom-${CURRENT_COLOR} is still running for debugging."
echo "[${SELF}] To restart it:  docker compose up -d --force-recreate headroom-${CURRENT_COLOR}"
