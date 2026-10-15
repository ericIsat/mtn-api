# File Share API

A Zoho Catalyst serverless API for file upload and download with public access.

## Overview

- **Admin**: Upload files via POST endpoint
- **External Users**: Download files via GET endpoint (no auth required)
- **Storage**: Files stored in Catalyst File Store, metadata in DataStore

## Setup

### 1. Create DataStore Table

Go to Catalyst Console → Data Store → Tables and create a new table:

**Table Name**: `SharedFiles`

**Columns**:
| Column | Type | Properties |
|--------|------|-----------|
| `fileId` | Var Char (36) | ✅ Unique, ✅ Mandatory |
| `originalName` | Var Char (255) | ✅ Mandatory |
| `mimeType` | Var Char (100) | - |
| `fileSize` | Number | - |
| `uploadedBy` | Var Char (255) | - |
| `uploadedDate` | Var Char (30) | - |
| `status` | Var Char (20) | - |

### 2. Install Dependencies

```bash
cd functions/file_management_function
npm install
```

### 3. Deploy

```bash
catalyst deploy
```

## API Endpoints

### Upload File (Admin)
```
POST /api/files/upload
Content-Type: multipart/form-data

Parameters:
- file: (required) File to upload
- uploadedBy: (optional) Admin identifier, defaults to 'admin'
```

### List All Files (Public)
```
GET /api/files
```

### Download File (Public)
```
GET /api/files/:fileId
```

### Health Check
```
GET /health
```

## File Limits
- Maximum file size: 50MB
- File storage: Catalyst File Store (shared_files folder)

## Console Logs

Detailed console logging is included for debugging:
- File upload tracking
- Catalyst initialization steps
- DataStore operations
- File Store operations
- Error details with full stack traces
