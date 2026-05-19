# coach-tools

Coaching tools for La Grange Little League, self-hosted at coach.chrislanus.com.

## Tools

| Tool | Type | Description |
|------|------|-------------|
| `tools/practice-plan-generator` | Python CLI | Generates timed practice plans as .docx + .xlsx |
| `tools/game-day-lineup` | Python CLI | Generates game day position rotation docs |
| `tools/defense-responsibilities` | Web (React) | Interactive defensive assignments by situation |
| `docs/skills-rubric` | Document | Player skills evaluation rubric (.docx) |
| `docs/throwing-program` | Document | 8U pre-season throwing program (.docx) |

## Structure

```
coach-tools/
├── apps/web/          # Next.js — coach.chrislanus.com
├── tools/             # Python CLI tools
├── api/               # FastAPI — serves Python tools over HTTP
├── docs/              # Static documents
└── scripts/           # Setup and deployment scripts
```

## Development

```bash
# First-time setup
./scripts/setup.sh

# Run everything
./scripts/dev.sh

# Individual services
cd apps/web && npm run dev        # Next.js on :3010
cd api && uvicorn main:app --port 3011 --reload
```

## Deployment (lanbuntu)

```bash
./scripts/deploy.sh
```

Caddy handles SSL and reverse proxying. See `scripts/Caddyfile.snippet`
for the block to add to your existing Caddyfile.
