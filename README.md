# SONAURA — Audio Ecommerce

> Production-grade audio ecommerce — headphones, earbuds, speakers.
> React 19 + Node.js full-stack | JWT auth | Razorpay | Cloudinary | MongoDB Atlas

## Project Structure

```
sonaura/
├── client/          # React 19 + Vite (Phase 3)
└── server/          # Node.js + Express REST API
    └── src/
        ├── config/       # DB connection
        ├── controllers/  # Route handlers
        ├── middleware/   # Auth, error, upload
        ├── models/       # Mongoose schemas
        ├── routes/       # Express routers
        ├── validators/   # Zod schemas
        └── utils/        # Helpers
```

## Quick Start (Backend)

```bash
cd server
cp .env.example .env
npm install
npm run dev
# Health check: GET http://localhost:5000/api/health
```

## Dev Phases

| Phase | Description | Status |
|-------|-------------|--------|
| 0 | Foundation & Setup | Done |
| 1 | Auth System | Pending |
| 2 | Products + Categories API | Pending |
| 3 | Frontend Foundation | Pending |
| 4 | Core Pages | Pending |
| 5 | Checkout + Razorpay | Pending |
| 6 | User Dashboard | Pending |
| 7 | Admin Panel | Pending |
| 8 | Security + Deploy | Pending |
