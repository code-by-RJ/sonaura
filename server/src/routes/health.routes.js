const { Router } = require('express');
const { healthCheck } = require('../controllers/health.controller');

const router = Router();

// GET /api/health
router.get('/health', healthCheck);

module.exports = router;
