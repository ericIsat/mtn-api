const express = require('express');
const busboy = require('busboy');
const router = express.Router();
const fs = require('fs');
const path = require('path');

// Import controller
const fileController = require('../controllers/file.controller');

/**
 * FILE ROUTES
 * Base path: /api/files
 */

// Debug middleware for file routes
router.use((req, res, next) => {
  console.log(`📁 FILE ROUTE: ${req.method} ${req.path}`);
  next();
});

// POST /api/files/upload - Upload file (Admin endpoint)
router.post('/upload', (req, res, next) => {
  const bb = busboy({ headers: req.headers });
  let fileData = null;
  let uploadedBy = 'admin';
  let country = '';

  bb.on('file', (fieldname, file, info) => {
    const chunks = [];
    file.on('data', (chunk) => {
      chunks.push(chunk);
    });
    file.on('end', () => {
      const buffer = Buffer.concat(chunks);
      fileData = {
        fieldname,
        filename: info.filename,
        encoding: info.encoding,
        mimetype: info.mimeType,
        size: buffer.length,
        buffer
      };
    });
    file.on('error', (err) => {
      console.error('❌ File stream error:', err);
    });
  });

  bb.on('field', (fieldname, val) => {
    if (fieldname === 'uploadedBy') {
      uploadedBy = val;
    } else if (fieldname === 'country') {
      country = val;
    }
  });

  bb.on('close', () => {
    if (fileData) {
      req.file = fileData;
      req.body = { uploadedBy, country };
      fileController.uploadFile(req, res);
    } else {
      res.status(400).json({ success: false, message: 'No file uploaded' });
    }
  });

  bb.on('error', (err) => {
    console.error('❌ Busboy error:', err);
    res.status(500).json({ success: false, message: 'Upload error', error: err.message });
  });

  req.pipe(bb);
});

// GET /api/files - List all files (Public)
router.get('/', fileController.listFiles);

// GET /api/files/:fileId - Download file by ID (Public)
router.get('/:fileId', fileController.downloadFile);

module.exports = router;
