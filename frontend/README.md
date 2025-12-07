# Contract Management — Frontend (Vite + React)

This is a minimal single-page frontend for the Contract Management project. It includes a Service Request submission form that you'll later connect to the backend and deploy to Vercel.

Quick start:

1. cd into the frontend folder

```bash
cd frontend
```

2. Install dependencies

```bash
npm install
```

3. Start dev server

```bash
npm run dev
```

When you're ready, provide the Vercel project link and I will connect this repo/deployment and adjust build/settings if needed.

Deployed site
 - Current Vercel URL: https://contract-management-opal.vercel.app

Vercel configuration
 - Project root for deployment: `frontend`
 - Build command: `npm run build`
 - Output directory: `dist`

Automatic deployment (CI)
 - A GitHub Actions workflow was added at `.github/workflows/vercel-deploy.yml` which will build the frontend and deploy to Vercel on pushes to `main`.
 - To enable it, add these GitHub repository secrets (Vercel dashboard provides values):
	 - `VERCEL_TOKEN`
	 - `VERCEL_ORG_ID`
	 - `VERCEL_PROJECT_ID`

If you prefer to let Vercel integrate directly with GitHub (recommended), go to your Vercel dashboard, import this repository, set the root to `frontend`, and confirm the build command and output directory above.
