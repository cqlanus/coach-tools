#!/usr/bin/env bash
# scripts/dev.sh
# Start Next.js and FastAPI side-by-side for local development.
# Ctrl-C stops both.

set -euo pipefail

REPO_ROOT="$(cd "$(dirname "$0")/.." && pwd)"

# ── FastAPI ────────────────────────────────────────────────────────────────
echo "Starting FastAPI on :3011..."
cd "$REPO_ROOT/api"
source .venv/bin/activate
uvicorn main:app --port 3011 --reload &
API_PID=$!

# ── Next.js ────────────────────────────────────────────────────────────────
echo "Starting Next.js on :3010..."
cd "$REPO_ROOT/apps/web"
npm run dev &
WEB_PID=$!

# ── Cleanup on exit ────────────────────────────────────────────────────────
cleanup() {
  echo ""
  echo "Stopping services..."
  kill $API_PID $WEB_PID 2>/dev/null || true
}
trap cleanup EXIT INT TERM

echo ""
echo "  Web: http://localhost:3010"
echo "  API: http://localhost:3011"
echo "  API docs: http://localhost:3011/docs"
echo ""
wait
