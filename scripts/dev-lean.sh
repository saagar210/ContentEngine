#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

choose_port() {
  local candidate
  for candidate in 1420 1421 1422 1423 1424 1425; do
    if ! lsof -nP -iTCP:"$candidate" -sTCP:LISTEN >/dev/null 2>&1; then
      echo "$candidate"
      return 0
    fi
  done
  return 1
}

PORT="${LEAN_DEV_PORT:-}"
if [ -z "$PORT" ]; then
  if ! PORT="$(choose_port)"; then
    echo "Unable to find a free dev port in 1420-1425. Set LEAN_DEV_PORT manually."
    exit 1
  fi
fi

LEAN_ROOT="$(mktemp -d "${TMPDIR:-/tmp}/contentengine-lean.XXXXXX")"
export CARGO_TARGET_DIR="$LEAN_ROOT/cargo-target"
export VITE_CACHE_DIR="$LEAN_ROOT/vite-cache"

CONFIG_JSON=$(cat <<EOF
{"build":{"beforeDevCommand":"pnpm dev --host 127.0.0.1 --port $PORT --strictPort","devUrl":"http://127.0.0.1:$PORT"}}
EOF
)

cleanup() {
  rm -rf "$LEAN_ROOT"
  bash "$ROOT_DIR/scripts/clean-heavy.sh" >/dev/null 2>&1 || true
}
trap cleanup EXIT INT TERM

echo "Lean dev temp dir: $LEAN_ROOT"
echo "Lean dev URL: http://127.0.0.1:$PORT"
echo "Cache strategy: CARGO_TARGET_DIR + VITE cache are temporary for this run."

pnpm tauri dev -c "$CONFIG_JSON" "$@"
