const express = require('express');
const router = express.Router();
const mnoController = require('../controllers/mno.controller');

// Debug middleware
router.use((req, res, next) => {
  console.log(`📱 MNO ROUTE: ${req.method} ${req.path}`);
  next();
});

// MNO Endpoints (Admin)
router.post('/', mnoController.createMNO);
router.get('/', mnoController.getAllMNOs);

module.exports = router;
