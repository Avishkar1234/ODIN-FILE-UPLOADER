# Drive Clone

A simple Google Drive–style file storage app built with Express, EJS, Prisma (PostgreSQL/Neon), and Cloudinary for file storage.

**Live:** https://odin-file-uploader-one.vercel.app

## Features

- User authentication (email/password via Passport.js)
- Create, rename, and delete folders
- Upload files to folders (stored on Cloudinary)
- View file details and download files
- Generate time-limited share links for folders

## Tech Stack

- **Backend:** Express 5, Node.js (ESM)
- **Views:** EJS
- **Database:** PostgreSQL (Neon) via Prisma
- **Auth:** Passport.js (local strategy) + PostgreSQL-backed sessions
- **File Storage:** Cloudinary
- **Deployment:** Vercel (serverless)

## Local Setup

```bash
npm install
npx prisma generate
npx prisma migrate dev
node app.js
```

Create a `.env` file with:

```
DATABASE_URL=
SESSION_SECRET=
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
```

App runs at `http://localhost:3000`.
