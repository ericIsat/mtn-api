'use strict';
const express = require("express");
const cors = require("cors");

const app = express();

// Minimal middleware
app.use(cors());

// Import routes
const fileRoutes = require('./src/routes/file.routes');

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'healthy', timestamp: new Date().toISOString(), uptime: process.uptime() });
});

// File routes
app.use('/api/files', fileRoutes);

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
