# File Share API - Client Documentation

Access files shared with your country via this API.


## Your Access

### Zambia Client
- **List Files:** `https://secure-data-bridge-942310354.development.catalystserverless.com/server/file_management_function/api/files?country=Zambia`
- **Download File:** `https://secure-data-bridge-942310354.development.catalystserverless.com/server/file_management_function/api/files/{fileId}`

### South Sudan Client
- **List Files:** `https://secure-data-bridge-942310354.development.catalystserverless.com/server/file_management_function/api/files?country=South%20Sudan`
- **Download File:** `https://secure-data-bridge-942310354.development.catalystserverless.com/server/file_management_function/api/files/{fileId}`

### Other Countries
Replace the country parameter in the URL with your country name:
- Kenya, South Sudan, Tanzania, UAE, Liberia, Zambia, DRC, Rwanda, Uganda

---

## How to Use

### Step 1: Get Your Files (GET Request)

```bash
curl "https://secure-data-bridge-942310354.development.catalystserverless.com/server/file_management_function/api/files?country=Zambia"
```

**Response Example:**
```json
{
  "success": true,
  "message": "Files retrieved successfully",
  "count": 2,
  "data": [
    {
      "fileId": "ee049497-964d-411d-b163-52249ac09ac5",
      "originalName": "Budget_2024.xlsx",
      "fileSize": 243744,
      "mimeType": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "uploadedBy": "admin",
      "country": "Zambia",
      "uploadedDate": "2026-10-15T06:50:36.706Z",
      "status": "Active"
    },
    {
      "fileId": "f1b2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c5d",
      "originalName": "Report_Q4.pdf",
      "fileSize": 512000,
      "mimeType": "application/pdf",
      "uploadedBy": "admin",
      "country": "Zambia",
      "uploadedDate": "2026-10-14T10:20:15.000Z",
      "status": "Active"
    }
  ]
}
```

### Step 2: Download File (GET Request)

Use the `fileId` from the files list to download:

```bash
curl "https://secure-data-bridge-942310354.development.catalystserverless.com/server/file_management_function/api/files/ee049497-964d-411d-b163-52249ac09ac5"
```

This returns the file metadata and download information. Use the `fileId` to download the actual file content.

---

## File Information

Each file in your response includes:

| Field | Description |
|-------|-------------|
| `fileId` | Unique identifier for the file |
| `originalName` | File name |
| `fileSize` | Size in bytes |
| `mimeType` | File type (e.g., application/pdf) |
| `uploadedBy` | Who uploaded the file |
| `country` | Country classification |
| `uploadedDate` | When the file was uploaded |
| `status` | File status (Active/Archived) |

---

## Response Codes

- **200** - Success (files retrieved)
- **400** - Bad request (invalid parameters)
- **404** - File not found
- **500** - Server error

---

## Need Help?

For technical issues or to request files, contact your account administrator.

---

**Last Updated**: 2026-10-15
