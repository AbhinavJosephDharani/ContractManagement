# Connect Frontend to Backend

If you've deployed the backend at `https://contract-management-backend-rose.vercel.app/`, set this Environment Variable in Vercel for the frontend project (Project → Settings → Environment Variables):

- `VITE_API_BASE` = `https://contract-management-backend-rose.vercel.app`

Behavior
- When `VITE_API_BASE` is set, the frontend will POST to `${VITE_API_BASE}/requests` on submit.
- The frontend will call `${VITE_API_BASE}/health` to check connectivity. The App header displays connection status and includes a manual "Check" button.
- If `VITE_API_BASE` is not set or the backend is unreachable, the frontend falls back to storing requests in `localStorage`.

Deployment notes
- On Vercel: set the env var under Project → Settings → Environment Variables → Add New. Then redeploy the frontend project.
- Example value: `https://contract-management-backend-rose.vercel.app`
