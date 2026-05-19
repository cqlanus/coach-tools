#!/usr/bin/env bash
# scripts/deploy.sh
# Pull latest changes and restart services on lanbuntu.
# Run from within the repo on lanbuntu, or call via ansible.

set -euo pipefail

REPO_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
echo "Deploying coach-tools from $REPO_ROOT"

# ── Pull ───────────────────────────────────────────────────────────────────
git pull --ff-only

# ── API ────────────────────────────────────────────────────────────────────
echo "Updating Python dependencies..."
cd "$REPO_ROOT/api"
source .venv/bin/activate
pip install -r requirements.txt -q
deactivate

# ── Web ────────────────────────────────────────────────────────────────────
echo "Building Next.js..."
cd "$REPO_ROOT/apps/web"
npm ci
npm run build

# ── Restart services ───────────────────────────────────────────────────────
echo "Restarting services..."
sudo systemctl restart coach-api
sudo systemctl restart coach-web

echo ""
echo "Deployed. Check status:"
echo "  sudo systemctl status coach-api coach-web"
