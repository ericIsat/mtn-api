const { v4: uuidv4 } = require('uuid');
const catalystSDK = require('zcatalyst-sdk-node');
const { Stratus } = require('@zcatalyst/stratus');

const TABLE_NAME = 'SharedFiles';

const getStratusObjectKeys = (country, fileId) => {
  const countrySlug = country.trim().toLowerCase().replace(/\s+/g, '-');
  const countryFolders = countrySlug === 'zambia'
    ? ['mtn-zambia', countrySlug]
    : [countrySlug];
  return countryFolders.map((folder) => `${folder}/${fileId}`);
};

const initializeCatalyst = (req) => {
  console.log('========== CATALYST INIT START ==========');
  try {
    const app = catalystSDK.initialize(req);
    console.log('✓ Catalyst initialized successfully');
    return app;
  } catch (error) {
    console.error('❌ Catalyst init failed:', error.message);
    throw error;
  }
};

// Upload file
const uploadFile = async (req, res) => {
  console.log('\n========== UPLOAD FILE START ==========');
  console.log('Timestamp:', new Date().toISOString());

  try {
    const { accessKey } = req.body;

    if (!accessKey) {
      console.error('❌ Access key is required');
      return res.status(401).json({
        success: false,
        message: 'Access key is required for uploads'
      });
    }

    console.log('✓ Checking if file exists...');
    if (!req.file) {
      console.error('❌ No file provided in request');
      return res.status(400).json({
        success: false,
        message: 'No file provided'
      });
    }

    console.log('✓ File received:', {
      fieldname: req.file.fieldname,
      originalname: req.file.originalname,
      encoding: req.file.encoding,
      mimetype: req.file.mimetype,
      size: req.file.size,
      path: req.file.path
    });

    console.log('✓ Initializing Catalyst SDK...');
    const catalystApp = initializeCatalyst(req);

    // Validate access key
    console.log('⏳ Validating access key...');
    console.log('Access key to validate:', accessKey);
    const apiKeyQuery = `SELECT * FROM APIKeys WHERE accesskey='${accessKey.replace(/'/g, "''")}'`;
    console.log('Query:', apiKeyQuery);
    const apiKeyResults = await catalystApp.zcql().executeZCQLQuery(apiKeyQuery);
    console.log('API key query results:', JSON.stringify(apiKeyResults, null, 2));

    if (!apiKeyResults || apiKeyResults.length === 0) {
      console.error('❌ Invalid API key');
      // Debug: fetch all keys to see what's in the database
      console.log('⏳ Fetching all API keys for debugging...');
      const allKeysQuery = `SELECT * FROM APIKeys`;
      const allKeys = await catalystApp.zcql().executeZCQLQuery(allKeysQuery);
      console.log('All API keys in database:', JSON.stringify(allKeys, null, 2));
      return res.status(401).json({
        success: false,
        message: 'Invalid API key'
      });
    }

    const apiKeyData = apiKeyResults[0].APIKeys || apiKeyResults[0];
    const mnoId = apiKeyData.mnoId;
    const country = apiKeyData.country;

    console.log(`✓ API key valid for MNO: ${mnoId}, Country: ${country}`);

    console.log(`✓ Accessing DataStore table: "${TABLE_NAME}"`);
    const table = catalystApp.datastore().table(TABLE_NAME);

    const fileId = uuidv4();
    const { filename, mimetype, size, buffer } = req.file;
    const uploadedBy = 'admin';
    const originalName = filename || 'unknown';

    console.log(`✓ Generated File ID: ${fileId}`);
    console.log(`✓ Uploading file: ${originalName} (${size} bytes)`);
    console.log(`✓ MIME type: ${mimetype}`);
    console.log(`✓ Uploaded by: ${uploadedBy}`);
    console.log(`✓ Country: ${country || 'Not specified'}`);
    console.log(`✓ Buffer size: ${buffer.length}`);

    console.log(`✓ File received: ${size} bytes`);

    // Upload to Stratus
    console.log(`⏳ Uploading file to Stratus bucket: api-mtn...`);
    let stratusPath = null;
    try {
      const stratus = new Stratus(catalystApp);
      const bucket = stratus.bucket('api-mtn');
      const [objectKey] = getStratusObjectKeys(country, fileId);

      const uploadOptions = {
        overwrite: true,
        contentType: mimetype
      };

      console.log(`📁 Object key: ${objectKey}`);
      console.log('Stratus destination:', JSON.stringify(bucket.toJSON()));
      await bucket.putObject(objectKey, buffer, uploadOptions);

      const objectExists = await bucket.headObject(objectKey, { throwErr: true });
      if (!objectExists) {
        throw new Error(`Stratus did not confirm the uploaded object: ${objectKey}`);
      }

      console.log('✓ Stratus confirmed the object exists');
      stratusPath = objectKey;
    } catch (error) {
      console.error('❌ Stratus upload error:', error.message);
      console.error('Error details:', JSON.stringify(error, null, 2));
      return res.status(500).json({
        success: false,
        message: 'Failed to upload file to Stratus',
        error: error.message
      });
    }

    const fileMetadata = {
      fileId,
      originalName: originalName,
      mimeType: mimetype,
      fileSize: size,
      uploadedBy,
      country: country,
      mnoId: mnoId,
      uploadedDate: new Date().toISOString(),
      status: 'Active'
    };

    console.log('⏳ Inserting metadata into DataStore...');
    console.log('Metadata to insert:', JSON.stringify(fileMetadata, null, 2));

    const result = await table.insertRow(fileMetadata);

    console.log('✓ File metadata stored successfully');
    console.log('Insert result:', JSON.stringify(result, null, 2));
    console.log('✓✓✓ UPLOAD COMPLETE ✓✓✓');

    res.status(201).json({
      success: true,
      message: 'File uploaded successfully',
      data: {
        fileId,
        originalName,
        fileSize: size,
        mimeType: mimetype,
        country: country,
        uploadedDate: fileMetadata.uploadedDate
      }
    });

  } catch (error) {
    console.error('\n❌❌❌ UPLOAD ERROR ❌❌❌');
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    console.error('Error code:', error.code);
    console.error('Error details:', JSON.stringify(error, null, 2));

    if (!res.headersSent) {
      res.status(500).json({
        success: false,
        message: 'Failed to upload file',
        error: error.message
      });
    }
  }

  console.log('========== UPLOAD FILE END ==========\n');
};

// Download file by ID
const downloadFile = async (req, res) => {
  console.log('\n========== DOWNLOAD FILE START ==========');
  const { fileId } = req.params;
  const { accessKey } = req.query;
  console.log('File ID:', fileId);

  try {
    if (!accessKey) {
      console.error('❌ Access key is required');
      return res.status(401).json({
        success: false,
        message: 'Access key is required'
      });
    }

    console.log('✓ Initializing Catalyst...');
    const catalystApp = initializeCatalyst(req);

    // Validate access key
    console.log('⏳ Validating access key...');
    console.log('Access key to validate:', accessKey);
    const apiKeyQuery = `SELECT * FROM APIKeys WHERE accesskey='${accessKey.replace(/'/g, "''")}'`;
    console.log('Query:', apiKeyQuery);
    const apiKeyResults = await catalystApp.zcql().executeZCQLQuery(apiKeyQuery);
    console.log('API key query results:', JSON.stringify(apiKeyResults, null, 2));

    if (!apiKeyResults || apiKeyResults.length === 0) {
      console.error('❌ Invalid API key');
      // Debug: fetch all keys to see what's in the database
      console.log('⏳ Fetching all API keys for debugging...');
      const allKeysQuery = `SELECT * FROM APIKeys`;
      const allKeys = await catalystApp.zcql().executeZCQLQuery(allKeysQuery);
      console.log('All API keys in database:', JSON.stringify(allKeys, null, 2));
      return res.status(401).json({
        success: false,
        message: 'Invalid API key'
      });
    }

    const apiKeyData = apiKeyResults[0].APIKeys || apiKeyResults[0];
    const mnoId = apiKeyData.mnoId;
    const country = apiKeyData.country;

    console.log(`✓ API key valid for MNO: ${mnoId}, Country: ${country}`);

    console.log(`⏳ Querying for file: ${fileId}`);
    const query = `SELECT * FROM ${TABLE_NAME} WHERE fileId='${fileId.replace(/'/g, "''")}' AND mnoId=${mnoId} AND country='${country}'`;
    console.log('Query:', query);
    const results = await catalystApp.zcql().executeZCQLQuery(query);
    console.log('Query results count:', results?.length);

    if (!results || results.length === 0) {
      console.error('❌ File not found in database');
      return res.status(404).json({
        success: false,
        message: 'File not found'
      });
    }

    const rawMetadata = results[0];
    const fileMetadata = rawMetadata.SharedFiles || rawMetadata;
    console.log(`✓ Found file: ${fileMetadata.originalName}`);
    console.log(`✓ File country: ${fileMetadata.country}`);

    if (!fileMetadata.country) {
      console.error('❌ File has no country classification');
      return res.status(400).json({
        success: false,
        message: 'File has no country classification'
      });
    }

    // Download from Stratus
    console.log(`⏳ Downloading file from Stratus...`);
    try {
      const stratus = new Stratus(catalystApp);
      const bucket = stratus.bucket('api-mtn');
      const objectKeys = getStratusObjectKeys(fileMetadata.country, fileId);
      let fileStream;
      let objectKey;

      for (const candidateKey of objectKeys) {
        try {
          fileStream = await bucket.getObject(candidateKey);
          objectKey = candidateKey;
          break;
        } catch (error) {
          console.warn(`⚠️ Stratus read failed for ${candidateKey}:`, error.message);
          if (candidateKey === objectKeys[objectKeys.length - 1]) {
            throw error;
          }
        }
      }

      console.log(`📁 Object key: ${objectKey}`);
      console.log('✓ File retrieved from Stratus');

      // Set response headers
      res.setHeader('Content-Type', fileMetadata.mimeType || 'application/octet-stream');
      res.setHeader('Content-Disposition', `attachment; filename="${fileMetadata.originalName}"`);
      res.setHeader('Content-Length', fileMetadata.fileSize);
      res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');

      // Pipe the stream to the response
      fileStream.pipe(res);

      fileStream.on('error', (err) => {
        console.error('❌ Stream error:', err.message);
        if (!res.headersSent) {
          res.status(500).json({
            success: false,
            message: 'Error downloading file',
            error: err.message
          });
        }
      });

      fileStream.on('end', () => {
        console.log('✓✓✓ FILE DOWNLOAD COMPLETE ✓✓✓');
      });
    } catch (error) {
      console.error('❌ Stratus download error:', error.message);
      console.error('Error details:', JSON.stringify(error, null, 2));
      return res.status(500).json({
        success: false,
        message: 'Failed to download file from Stratus',
        error: error.message
      });
    }

  } catch (error) {
    console.error('\n❌❌❌ DOWNLOAD ERROR ❌❌❌');
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);

    if (!res.headersSent) {
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve file metadata',
        error: error.message
      });
    }
  }

  console.log('========== DOWNLOAD FILE END ==========\n');
};

// List all files from DataStore metadata
const listFiles = async (req, res) => {
  console.log('\n========== LIST FILES START ==========');
  console.log('✓ listFiles function called');
  console.log('Request query:', req.query);

  try {
    const { accessKey } = req.query;

    if (!accessKey) {
      console.error('❌ Access key is required');
      return res.status(401).json({
        success: false,
        message: 'Access key is required'
      });
    }

    console.log('✓ Initializing Catalyst...');
    const catalystApp = initializeCatalyst(req);

    // Validate access key
    console.log('⏳ Validating access key...');
    console.log('Access key to validate:', accessKey);
    const apiKeyQuery = `SELECT * FROM APIKeys WHERE accesskey='${accessKey.replace(/'/g, "''")}'`;
    console.log('Query:', apiKeyQuery);
    const apiKeyResults = await catalystApp.zcql().executeZCQLQuery(apiKeyQuery);
    console.log('API key query results:', JSON.stringify(apiKeyResults, null, 2));

    if (!apiKeyResults || apiKeyResults.length === 0) {
      console.error('❌ Invalid API key');
      // Debug: fetch all keys to see what's in the database
      console.log('⏳ Fetching all API keys for debugging...');
      const allKeysQuery = `SELECT * FROM APIKeys`;
      const allKeys = await catalystApp.zcql().executeZCQLQuery(allKeysQuery);
      console.log('All API keys in database:', JSON.stringify(allKeys, null, 2));
      return res.status(401).json({
        success: false,
        message: 'Invalid API key'
      });
    }

    const apiKeyData = apiKeyResults[0].APIKeys || apiKeyResults[0];
    const mnoId = apiKeyData.mnoId;
    const country = apiKeyData.country;

    console.log(`✓ API key valid for MNO: ${mnoId}, Country: ${country}`);

    console.log(`⏳ Listing files from ${TABLE_NAME} table...`);
    let query = `SELECT * FROM ${TABLE_NAME} WHERE mnoId=${mnoId} AND country='${country}'`;
    query += ` ORDER BY uploadedDate DESC`;
    console.log('Query:', query);
    const results = await catalystApp.zcql().executeZCQLQuery(query);

    console.log(`✓ Found ${results.length} files`);

    // Extract data from nested SharedFiles object
    const files = results.map(result => {
      const file = result.SharedFiles || result;
      return {
        fileId: file.fileId,
        originalName: file.originalName,
        fileSize: file.fileSize,
        mimeType: file.mimeType,
        uploadedBy: file.uploadedBy,
        country: file.country,
        uploadedDate: file.uploadedDate,
        status: file.status,
        downloadUrl: `/api/files/${file.fileId}`
      };
    });

    console.log('Files data:', JSON.stringify(files, null, 2));

    res.status(200).json({
      success: true,
      message: 'Files retrieved successfully',
      count: files.length,
      data: files
    });

  } catch (error) {
    console.error('\n❌ LIST ERROR');
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);

    if (!res.headersSent) {
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve files',
        error: error.message
      });
    }
  }

  console.log('========== LIST FILES END ==========\n');
};

module.exports = {
  uploadFile,
  downloadFile,
  listFiles
};
