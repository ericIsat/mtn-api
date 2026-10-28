# File Share API - Client Guide

Your administrator will share the API key issued for your MNO and country. Use it to list and download your files; the key determines your access scope.

## API base URL

```text
https://secure-data-bridge-942310354.development.catalystserverless.com/server/file_management_function
```

Replace this URL if you are using a different Catalyst environment.

## List files

Pass your API key as the `accessKey` query parameter:

```bash
curl "https://secure-data-bridge-942310354.development.catalystserverless.com/server/file_management_function/api/files?accessKey=YOUR_ACCESS_KEY"
```

The response includes each file's `fileId`, original name, size, MIME type, country, upload date, status, and a relative download URL.

## Download a file

Use a `fileId` from the list response and include the same API key:

```bash
curl -L -o Invoice.pdf \
  "https://secure-data-bridge-942310354.development.catalystserverless.com/server/file_management_function/api/files/FILE_ID?accessKey=YOUR_ACCESS_KEY"
```

The endpoint returns the file contents as an attachment.

## Storage details

File contents are stored in the Catalyst Stratus bucket `api-mtn`; Catalyst DataStore contains the file metadata. For example, a Zambia file is stored under `mtn-zambia/<fileId>`, and a South Sudan file under `south-sudan/<fileId>`. A null `fileContent` value in the metadata row is expected.

## Security

Treat your API key as a password. Do not publish it, commit it to source control, or share it in screenshots or logs.

For administrator upload instructions, storage details, and response codes, see the [project README](./README.md).
