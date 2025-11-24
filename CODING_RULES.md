## Coding Rules and Dev Workflow

These rules govern how we build, run, and contribute to this project. The primary goal is reproducibility and simplicity. All local execution must use Docker.

### 1) Docker-First Policy (Mandatory)
- Always run services via Docker Compose.
- Never rely on host Python/Node installs for running the app.
- If a command would normally be run locally, run it inside the appropriate container instead.

Common commands:

```
docker compose up -d

docker compose logs -f backend
docker compose logs -f frontend

docker compose down
```

### 2) Backend (FastAPI) Inside Container
- Do not run `python` or `pip` on the host. Use the running backend container.

```
docker compose exec backend bash

# Inside container
pytest
alembic upgrade head
black . && isort . && flake8
```

### 3) Frontend (Next.js) Inside Container
- Do not run `npm`/`node` on the host for app tasks.

```
docker compose exec frontend sh

# Inside container
npm run dev
npm run build
npm run lint
```

### 4) Dependency Management
- Backend: update `backend/requirements.txt` and rebuild the backend image if dependencies change.
- Frontend: update `frontend/package.json` and rebuild the frontend image if dependencies change.

```
docker compose build backend
docker compose build frontend
```

### 5) Configuration & Secrets
- Use environment variables defined via Docker Compose.
- Do not commit secrets. Override via a local `.env` (not committed) or compose override file.
- JWT settings live in `backend/app/core/config.py` and should be sourced from env in production.

### 6) Database & Migrations
- Database is provided by the `postgres` service.
- Create/upgrade migrations inside the backend container only.

```
alembic revision -m "your message"
alembic upgrade head
```

### 7) Linting, Formatting, Type Safety
- Python: `black`, `isort`, `flake8` in backend container.
- TypeScript/JS: `eslint`/`tsc` in frontend container.
- Do not push code that fails lint/type checks.

**Troubleshooting JSX Syntax Errors:**
- If you encounter "Unexpected token" or similar JSX errors, use Prettier to pinpoint the issue:
  ```
  npx prettier --check path/to/file.tsx
  ```
- Common issue: Missing closing tags (e.g., `</div>`) in deeply nested JSX structures.
- Solution: Prettier will identify the exact line number. Manually trace the JSX structure to find unbalanced opening/closing tags.

### 8) Git & Reviews
- Keep edits focused and atomic.
- Include concise PR descriptions and testing steps.
- No large unrelated refactors in feature PRs.

### 9) Performance & Security
- Prefer stateless patterns (JWT already implemented).
- Validate all inputs at the API boundary.
- Never log secrets or tokens.

### 10) Local Development URLs
- Frontend: `http://localhost:3000`
- API: `http://localhost:8000` (docs at `/docs`)
- Compose sets `NEXT_PUBLIC_API_URL=http://localhost:8000` for the frontend.

---

Adhering to these rules ensures consistent environments for everyone and prevents host-specific build issues. All future tasks and scripts must follow this Docker-first workflow.






