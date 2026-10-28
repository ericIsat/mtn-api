const express = require('express');
const router = express.Router();
const mnoController = require('../controllers/mno.controller');

// Debug middleware
router.use((req, res, next) => {
  console.log(`🔑 API KEY ROUTE: ${req.method} ${req.path}`);
  next();
});

// API Key Endpoints
router.post('/', mnoController.generateAPIKey);
router.get('/', mnoController.getAllAPIKeys);

module.exports = router;
