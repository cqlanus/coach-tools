#!/usr/bin/env bash
# scripts/setup.sh
# First-time setup for lanbuntu. Run once after cloning the repo.
# Usage: ./scripts/setup.sh

set -euo pipefail

REPO_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
echo "Setting up coach-tools at $REPO_ROOT"

# ── Node.js ────────────────────────────────────────────────────────────────
if ! command -v node &>/dev/null; then
  echo "Installing Node.js via nvm..."
  curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
  export NVM_DIR="$HOME/.nvm"
  # shellcheck disable=SC1091
  [ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
  nvm install 20
  nvm use 20
  nvm alias default 20
else
  echo "Node $(node --version) already installed"
fi

# ── Python venv ────────────────────────────────────────────────────────────
echo "Setting up Python virtual environment for API..."
cd "$REPO_ROOT/api"
python3 -m venv .venv
# shellcheck disable=SC1091
source .venv/bin/activate
pip install --upgrade pip -q
pip install -r requirements.txt -q
deactivate
echo "Python venv ready at api/.venv"

# ── Next.js deps ───────────────────────────────────────────────────────────
echo "Installing Next.js dependencies..."
cd "$REPO_ROOT/apps/web"
npm install

# ── Output dirs ───────────────────────────────────────────────────────────
mkdir -p "$REPO_ROOT/api/outputs"

# ── Systemd services ───────────────────────────────────────────────────────
echo ""
echo "To install systemd services (run as root or with sudo):"
echo "  sudo cp $REPO_ROOT/scripts/systemd/coach-web.service /etc/systemd/system/"
echo "  sudo cp $REPO_ROOT/scripts/systemd/coach-api.service /etc/systemd/system/"
echo "  sudo systemctl daemon-reload"
echo "  sudo systemctl enable coach-web coach-api"
echo "  sudo systemctl start coach-web coach-api"
echo ""
echo "Add the Caddyfile snippet to your Caddyfile:"
echo "  cat $REPO_ROOT/scripts/Caddyfile.snippet"
echo ""
echo "Setup complete."
