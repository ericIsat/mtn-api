# File Share API

The File Share API lets authorized MNO clients list and download files assigned to their country. Administrators upload files, which are stored as objects in Zoho Catalyst Stratus; file details and access relationships are stored separately in the Catalyst `SharedFiles` DataStore table.

## API base URL

```text
https://secure-data-bridge-942310354.development.catalystserverless.com/server/file_management_function
```

The examples below use the development deployment. Replace the base URL when using another Catalyst environment.

## Authentication

The administrator will share the API key generated for your MNO and country. Treat it as a secret and do not commit it to source control or share it publicly.

- File listing: pass `accessKey` as a query parameter.
- File download: pass `accessKey` as a query parameter.
- File upload: administrators pass `accessKey` as a multipart form field.

The API key determines the MNO and country scope; clients do not select another country by changing a URL parameter.

## List files

```bash
curl "https://secure-data-bridge-942310354.development.catalystserverless.com/server/file_management_function/api/files?accessKey=YOUR_ACCESS_KEY"
```

The response contains files associated with the API key's MNO and country:

```json
{
  "success": true,
  "message": "Files retrieved successfully",
  "count": 1,
  "data": [
    {
      "fileId": "67b25b8e-aa90-4370-af81-c7cc1d2750f0",
      "originalName": "Invoice.pdf",
      "fileSize": 113876,
      "mimeType": "application/pdf",
      "uploadedBy": "admin",
      "country": "Zambia",
      "uploadedDate": "2026-10-28T04:29:22.360Z",
      "status": "Active",
      "downloadUrl": "/api/files/67b25b8e-aa90-4370-af81-c7cc1d2750f0"
    }
  ]
}
```

## Download a file

Use the `fileId` from the listing response. The endpoint returns the file contents as an attachment.

```bash
curl -L -o Invoice.pdf \
  "https://secure-data-bridge-942310354.development.catalystserverless.com/server/file_management_function/api/files/67b25b8e-aa90-4370-af81-c7cc1d2750f0?accessKey=YOUR_ACCESS_KEY"
```

## Upload a file (administrator)

Send a multipart request with a `file` and the administrator-provided `accessKey`:

```bash
curl -X POST \
  -F "file=@Invoice.pdf" \
  -F "accessKey=YOUR_ACCESS_KEY" \
  "https://secure-data-bridge-942310354.development.catalystserverless.com/server/file_management_function/api/files/upload"
```

A successful upload returns HTTP `201` and a JSON response containing the file ID and metadata. The API reports success only after Stratus confirms that the uploaded object exists.

## File storage

File contents are stored in the Catalyst Stratus bucket `api-mtn`; metadata is stored in the Catalyst `SharedFiles` table. A `fileContent` value of `null` in DataStore is expected because the file bytes are in Stratus, not in the metadata row.

In the development environment, the bucket URL is:

```text
https://api-mtn-development.zohostratus.com
```

Objects are stored using country-specific prefixes:

| Country | Stratus object key |
|---------|--------------------|
| Zambia | `mtn-zambia/<fileId>` |
| South Sudan | `south-sudan/<fileId>` |
| Other countries | `<lowercase-country-name-with-hyphens>/<fileId>` |

For example, the object for file ID `67b25b8e-aa90-4370-af81-c7cc1d2750f0` in Zambia is stored at:

```text
https://api-mtn-development.zohostratus.com/mtn-zambia/67b25b8e-aa90-4370-af81-c7cc1d2750f0
```

Downloads resolve the object from Stratus using the file's metadata and return the original file content.

## Response codes

| Status | Meaning |
|--------|---------|
| `200` | File list retrieved or file downloaded |
| `201` | File and metadata uploaded successfully |
| `400` | Invalid request or missing file classification |
| `401` | Missing or invalid API key |
| `404` | No matching file metadata was found |
| `500` | Upload, download, or server error |

## Client documentation

See [CLIENT_README.md](./CLIENT_README.md) for client-focused usage instructions.
