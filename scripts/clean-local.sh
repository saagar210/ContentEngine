#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

# Fully reproducible local artifacts and caches.
LOCAL_PATHS=(
  "node_modules"
  "dist"
  "node_modules/.vite"
  "src-tauri/target"
  "coverage"
  ".turbo"
  ".cache"
  ".eslintcache"
)

removed_any=0
for path in "${LOCAL_PATHS[@]}"; do
  if [ -e "$path" ]; then
    rm -rf "$path"
    printf 'removed %s\n' "$path"
    removed_any=1
  fi
done

if [ "$removed_any" -eq 0 ]; then
  echo "No local reproducible caches found."
fi
