---
name: Package install preference
description: User prefers npm install inside frontend/ directory, not pnpm from monorepo root
type: feedback
---

Use `npm install <pkg>` from inside `frontend/` directory.

**Why:** Monorepo uses pnpm at root but frontend has its own npm context.

**How to apply:** When installing frontend packages, run `cd frontend && npm install <pkg>`, not `pnpm add <pkg>` from root.
