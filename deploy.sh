#!/usr/bin/env bash
set -euo pipefail

SERVER="cacotalk-ec2"
REMOTE_DIR="/home/ubuntu/cacotalk-messenger"
COMPOSE_FILE="docker-compose.prod.yml"

usage() { echo "Usage: $0 [all|fe|be]" >&2; exit 1; }

[[ $# -eq 1 ]] || usage
case "$1" in
    all) SERVICES=(fe be) ;;
    fe)  SERVICES=(fe) ;;
    be)  SERVICES=(be) ;;
    *)   usage ;;
esac

# Always run from the repo root, no matter where the script is invoked from.
cd "$(dirname "$0")"

log() { printf '\n==> %s\n' "$*"; }

# Reuse a single SSH connection for every ssh/rsync call (much faster).
SSH=(ssh -o ControlMaster=auto -o ControlPath=/tmp/cacotalk-deploy-%C -o ControlPersist=120)
RSYNC=(rsync -az -e "${SSH[*]}")

cleanup() { "${SSH[@]}" -O exit "$SERVER" >/dev/null 2>&1 || true; }
trap cleanup EXIT
trap 'echo "!! Deploy failed at line $LINENO" >&2' ERR

# --- Preflight: fail fast before spending minutes on a build ---------------

log "Checking connection to $SERVER"
"${SSH[@]}" "$SERVER" true

GIT_SHA=$(git rev-parse --short HEAD)
if [[ -n $(git status --porcelain) ]]; then
    echo "Warning: you have uncommitted changes." >&2
    read -rp "Deploy anyway? [y/N] " answer
    [[ $answer == [yY] ]] || exit 1
    GIT_SHA="${GIT_SHA}-dirty"
fi

# --- Build -------------------------------------------------------------------

build_be() {
    log "Building backend"
    (cd backend && ./gradlew clean bootJar --no-daemon)
}

build_fe() {
    log "Building frontend"
    (cd frontend && npm ci && npm run build)
}

# --- Upload ------------------------------------------------------------------

upload_be() {
    log "Uploading backend"
    "${SSH[@]}" "$SERVER" "mkdir -p '$REMOTE_DIR/backend/build/libs'"
    "${RSYNC[@]}" backend/Dockerfile "$SERVER:$REMOTE_DIR/backend/"
    "${RSYNC[@]}" --delete backend/build/libs/ "$SERVER:$REMOTE_DIR/backend/build/libs/"
}

upload_fe() {
    log "Uploading frontend"
    "${SSH[@]}" "$SERVER" "mkdir -p '$REMOTE_DIR/frontend/dist'"
    "${RSYNC[@]}" frontend/Dockerfile frontend/Caddyfile "$SERVER:$REMOTE_DIR/frontend/"
    "${RSYNC[@]}" --delete frontend/dist/ "$SERVER:$REMOTE_DIR/frontend/dist/"
}

# Build everything first, so a failed build never uploads half a deploy.
for s in "${SERVICES[@]}"; do "build_$s"; done

"${RSYNC[@]}" "$COMPOSE_FILE" "$SERVER:$REMOTE_DIR/"
for s in "${SERVICES[@]}"; do "upload_$s"; done

# --- Restart & verify --------------------------------------------------------

log "Restarting: ${SERVICES[*]} ($GIT_SHA)"
"${SSH[@]}" "$SERVER" "set -e
    cd '$REMOTE_DIR'
    docker compose -f '$COMPOSE_FILE' up -d --build --wait --wait-timeout 120 ${SERVICES[*]}
    echo '$(date -u +%FT%TZ) $GIT_SHA ${SERVICES[*]}' >> deploys.log
    docker image prune -f >/dev/null"

log "Done in ${SECONDS}s"