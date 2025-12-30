# SMS 2.0 - Deployment Guide

This guide describes how to deploy your "School Management System" online for free (or low cost).

We will split the deployment into three parts:
1.  **Database**: Managed PostgreSQL (e.g., Neon or Railway)
2.  **Backend**: Node.js API (e.g., Render)
3.  **Frontend**: React App (e.g., Vercel)

---

## 1. 🗄️ Database Setup (Neon / Railway)

You need a cloud database. We recommend **Neon** (generous free tier) or **Railway**.

1.  Sign up at [Neon.tech](https://neon.tech).
2.  Create a new project named `sms-db`.
3.  Copy the **Connection String** (It looks like `postgres://user:pass@host/neondb...`).
    *   *Keep this secret!*

---

## 2. ⚙️ Backend Deployment (Render)

We will host the Node.js API on **Render.com**.

1.  Sign up at [Render.com](https://render.com).
2.  Click **New +** -> **Web Service**.
3.  Connect your GitHub repository (`monishaashiva/sms`).
4.  **Settings**:
    *   **Root Directory**: `backend`
    *   **Build Command**: `npm install`
    *   **Start Command**: `npm start`
5.  **Environment Variables** (Scroll down to 'Advanced'):
    *   Add `DATABASE_URL` = (Paste your Neon/Railway connection string from Step 1)
    *   Add `JWT_SECRET` = (Create a strong random password)
    *   Add `NODE_ENV` = `production`
    *   Add `FRONTEND_URL` = (Leave empty for now, we will update it after frontend deploy)
6.  Click **Create Web Service**.
    *   Wait for it to deploy.
    *   Copy your new **Backend URL** (e.g., `https://sms-backend.onrender.com`).

---

## 3. 🌐 Frontend Deployment (Vercel)

We will host the React UI on **Vercel**.

1.  Sign up at [Vercel.com](https://vercel.com).
2.  Click **Add New...** -> **Project**.
3.  Import your GitHub repository (`sms`).
4.  **Configure Project**:
    *   **Framework Preset**: Vite
    *   **Root Directory**: Click "Edit" and select `frontend`.
5.  **Environment Variables**:
    *   Add `VITE_API_URL` = (Paste your Render Backend URL from Step 2 **and add `/api` at the end**)
        *   *Example: `https://sms-backend.onrender.com/api`*
6.  Click **Deploy**.
    *   Wait for the confetti! 🎉
    *   Copy your **Frontend URL** (e.g., `https://sms-project.vercel.app`).

---

## 4. 🔄 Final Wiring

Now that we have the Frontend URL, we need to tell the Backend about it (for CORS security).

1.  Go back to **Render** dashboard -> Your Backend Service -> **Environment**.
2.  Edit `FRONTEND_URL` and paste your **Vercel Frontend URL**.
3.  Save Changes (Render will auto-redeploy).

---

## 5. 🌱 Seeding Data (Cloud)

Your cloud database is empty! You need to push your tables and data to it.

1.  Open VS Code locally.
2.  In `backend/.env`, temporarily replace `DATABASE_URL` with your **Cloud Connection String** (from Step 1).
3.  Run:
    ```bash
    npx prisma db push
    npm run seed
    ```
4.  **Undo** the change in `.env` (put your local URL back) so distinct local development continues working.

**🚀 Done! Your project is now live on the internet.**
