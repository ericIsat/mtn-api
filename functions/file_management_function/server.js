'use strict';
const express = require("express");
const cors = require("cors");

const app = express();

// Minimal middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Import routes
const fileRoutes = require('./src/routes/file.routes');
const mnoRoutes = require('./src/routes/mno.routes');
const apikeyRoutes = require('./src/routes/apikey.routes');

// Debug all requests
app.use((req, res, next) => {
  console.log(`\n🔍 REQUEST: ${req.method} ${req.path}`);
  console.log(`   Full URL: ${req.originalUrl}`);
  next();
});

// Health check
app.get('/health', (req, res) => {
  console.log('✓ Health check endpoint called');
  res.json({ status: 'healthy', timestamp: new Date().toISOString(), uptime: process.uptime() });
});

// File routes
app.use('/api/files', fileRoutes);

// MNO routes
app.use('/api/mnos', mnoRoutes);

// API Key routes
app.use('/api/api-keys', apikeyRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ success: false, message: "Not found" });
});

// Error handler
app.use((err, req, res, next) => {
  console.error("🚨 ERROR:", err.message, err.stack);
  res.status(500).json({ success: false, message: "Server error", error: err.message });
});

// Export for Catalyst AdvancedIO
module.exports = app;
