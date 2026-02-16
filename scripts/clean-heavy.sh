#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

# Heavy artifacts generated during build/dev runs.
HEAVY_PATHS=(
  "dist"
  "node_modules/.vite"
  "src-tauri/target"
)

removed_any=0
for path in "${HEAVY_PATHS[@]}"; do
  if [ -e "$path" ]; then
    rm -rf "$path"
    printf 'removed %s\n' "$path"
    removed_any=1
  fi
done

if [ "$removed_any" -eq 0 ]; then
  echo "No heavy build artifacts found."
fi
