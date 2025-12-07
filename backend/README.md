# Backend — Contract Management

This is a minimal Express + SQLite backend used for development. It exposes simple endpoints to accept and list service requests.

Run locally:

```bash
cd backend
npm install
npm run start
# or for dev with auto-reload:
npm run dev
```

API endpoints:
- `POST /requests` — Accepts JSON service request body. Returns the saved record.
- `GET /requests` — List recent requests (limit 100).
- `GET /requests/:id` — Get a request by id.

Notes:
- The database file `data.sqlite` is created in the `backend/` folder.
- This backend is intended for local development. For production you should pick a managed DB and deploy to a proper server or platform.
