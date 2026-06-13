// ─── Load env first — before anything else ───────────────────────────────────
require('dotenv').config();

const express   = require('express');
const helmet    = require('helmet');
const cors      = require('cors');
const morgan    = require('morgan');
const rateLimit = require('express-rate-limit');
const mongoSanitize = require('express-mongo-sanitize');
const xss       = require('xss-clean');
const hpp       = require('hpp');

const healthRoutes   = require('./routes/health.routes');
const { globalErrorHandler } = require('./middleware/errorHandler');

const app = express();

// ─── Trust proxy (required for rate limiting behind Render/Nginx) ─────────────
app.set('trust proxy', 1);

// ─── Security: HTTP headers ──────────────────────────────────────────────────
app.use(helmet());

// ─── Security: CORS ──────────────────────────────────────────────────────────
// Strict origin whitelist — no wildcard (*) in production
const allowedOrigins = [
  process.env.CLIENT_URL || 'http://localhost:5173',
];

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (Postman, server-to-server)
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) return callback(null, true);
      callback(new Error(`CORS blocked: ${origin} not in allowlist`));
    },
    credentials: true,           // Allow httpOnly cookies
    optionsSuccessStatus: 200,   // Safari compatibility
  })
);

// ─── Rate limiting ───────────────────────────────────────────────────────────
// Global: 100 req / 15 min per IP
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many requests from this IP. Please try again after 15 minutes.',
  },
});
app.use('/api', globalLimiter);

// Auth routes rate limiter is added in Phase 1 (applied per router)
// Payment routes rate limiter is added in Phase 5

// ─── Body parsing ────────────────────────────────────────────────────────────
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// ─── Data sanitization ───────────────────────────────────────────────────────
// 1. NoSQL injection: strips $ and . from req.body / params / query
app.use(mongoSanitize());

// 2. XSS: strips HTML tags from all string inputs
app.use(xss());

// 3. HTTP Parameter Pollution: blocks ?sort=price&sort=rating attacks
//    Whitelist the query params our API intentionally allows as arrays
app.use(
  hpp({
    whitelist: [
      'sort',
      'fields',
      'page',
      'limit',
      'brand',
      'category',
      'connectivity',
      'color',
    ],
  })
);

// ─── Request logging ─────────────────────────────────────────────────────────
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  // Production: combined format, skip auth routes to avoid logging tokens
  app.use(
    morgan('combined', {
      skip: (req) => req.path.startsWith('/api/auth'),
    })
  );
}

// ─── API Routes ──────────────────────────────────────────────────────────────
app.use('/api', healthRoutes);

// Phase 1 — auth routes     → /api/auth
// Phase 2 — product routes  → /api/products
// Phase 2 — category routes → /api/categories
// Phase 3+ — more routes added here as phases complete

// ─── 404 Catch-all ───────────────────────────────────────────────────────────
app.all('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.method} ${req.originalUrl} not found`,
  });
});

// ─── Global Error Handler (must be last middleware) ──────────────────────────
app.use(globalErrorHandler);

module.exports = app;
