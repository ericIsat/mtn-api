const { v4: uuidv4 } = require('uuid');
const catalystSDK = require('zcatalyst-sdk-node');

const TABLE_MNOS = 'MNOs';
const TABLE_API_KEYS = 'APIKeys';

const initializeCatalyst = (req) => {
  try {
    return catalystSDK.initialize(req);
  } catch (error) {
    console.error('❌ Catalyst init failed:', error.message);
    throw error;
  }
};

// Create MNO
const createMNO = async (req, res) => {
  console.log('\n========== CREATE MNO START ==========');
  try {
    const { name, description } = req.body;

    if (!name) {
      return res.status(400).json({
        success: false,
        message: 'MNO name is required'
      });
    }

    console.log(`✓ Creating MNO: ${name}`);
    const catalystApp = initializeCatalyst(req);
    const table = catalystApp.datastore().table(TABLE_MNOS);

    const mnoData = {
      name,
      description: description || ''
    };

    console.log('⏳ Inserting MNO into DataStore...');
    const result = await table.insertRow(mnoData);

    console.log('✓ MNO created successfully');
    res.status(201).json({
      success: true,
      message: 'MNO created successfully',
      data: {
        mnoId: result.ROWID,
        name: result.name,
        description: result.description,
        createdAt: result.CREATEDTIME
      }
    });
  } catch (error) {
    console.error('❌ CREATE MNO ERROR:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to create MNO',
      error: error.message
    });
  }
  console.log('========== CREATE MNO END ==========\n');
};

// Generate API Key
const generateAPIKey = async (req, res) => {
  console.log('\n========== GENERATE API KEY START ==========');
  try {
    const { mnoId, country } = req.body;

    if (!mnoId || !country) {
      return res.status(400).json({
        success: false,
        message: 'mnoId and country are required'
      });
    }

    console.log(`✓ Generating API key for MNO: ${mnoId}, Country: ${country}`);
    const catalystApp = initializeCatalyst(req);

    // Verify MNO exists
    console.log('⏳ Verifying MNO...');
    const mnoQuery = `SELECT * FROM ${TABLE_MNOS}`;
    console.log('Query:', mnoQuery);
    const allMnoResults = await catalystApp.zcql().executeZCQLQuery(mnoQuery);
    console.log('All MNOs fetched:', allMnoResults.length);

    // Find the MNO by matching ROWID
    let mnoData = null;
    for (let result of allMnoResults) {
      const mno = result.MNOs || result;
      console.log(`Checking MNO ROWID: ${mno.ROWID} (type: ${typeof mno.ROWID}) vs ${mnoId} (type: ${typeof mnoId})`);
      if (mno.ROWID == mnoId || mno.ROWID === mnoId.toString()) {
        mnoData = mno;
        break;
      }
    }

    if (!mnoData) {
      console.error('❌ MNO not found in results');
      return res.status(404).json({
        success: false,
        message: 'MNO not found'
      });
    }

    console.log(`✓ MNO verified: ${mnoData.name}`);

    // Generate unique API key
    const accesskey = `sk_${mnoData.name.toLowerCase().replace(/\s+/g, '_')}_${country.toLowerCase().replace(/\s+/g, '_')}_${uuidv4().substring(0, 12)}`;

    const keyTable = catalystApp.datastore().table(TABLE_API_KEYS);
    const keyData = {
      accesskey,
      mnoId: mnoId.toString(),
      country
    };

    console.log('⏳ Inserting API key into DataStore...');
    console.log('Key data to insert:', JSON.stringify(keyData, null, 2));
    const result = await keyTable.insertRow(keyData);
    console.log('Insert result:', JSON.stringify(result, null, 2));

    console.log('✓ API key generated successfully');
    res.status(201).json({
      success: true,
      message: 'API key generated successfully',
      data: {
        apiKeyId: result.ROWID,
        accessKey: result.accesskey,
        mnoId: result.mnoId,
        country: result.country,
        createdAt: result.CREATEDTIME
      }
    });
  } catch (error) {
    console.error('❌ GENERATE API KEY ERROR:', error.message);
    console.error('Full error:', JSON.stringify(error, null, 2));
    console.error('Error stack:', error.stack);
    res.status(500).json({
      success: false,
      message: 'Failed to generate API key',
      error: error.message
    });
  }
  console.log('========== GENERATE API KEY END ==========\n');
};

// Get all MNOs
const getAllMNOs = async (req, res) => {
  console.log('\n========== GET ALL MNOs START ==========');
  try {
    const catalystApp = initializeCatalyst(req);
    const table = catalystApp.datastore().table(TABLE_MNOS);

    console.log('⏳ Fetching all MNOs...');
    const query = `SELECT * FROM ${TABLE_MNOS} ORDER BY CREATEDTIME DESC`;
    const results = await catalystApp.zcql().executeZCQLQuery(query);

    const mnos = results.map(result => {
      const mno = result.MNOs || result;
      return {
        mnoId: mno.ROWID,
        name: mno.name,
        description: mno.description,
        createdAt: mno.CREATEDTIME
      };
    });

    console.log(`✓ Found ${mnos.length} MNOs`);
    res.status(200).json({
      success: true,
      message: 'MNOs retrieved successfully',
      count: mnos.length,
      data: mnos
    });
  } catch (error) {
    console.error('❌ GET MNOs ERROR:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve MNOs',
      error: error.message
    });
  }
  console.log('========== GET ALL MNOs END ==========\n');
};

// Get all API Keys
const getAllAPIKeys = async (req, res) => {
  console.log('\n========== GET ALL API KEYS START ==========');
  try {
    const catalystApp = initializeCatalyst(req);

    console.log('⏳ Fetching all API keys...');
    const query = `SELECT * FROM ${TABLE_API_KEYS} ORDER BY CREATEDTIME DESC`;
    const results = await catalystApp.zcql().executeZCQLQuery(query);

    const keys = results.map(result => {
      const key = result.APIKeys || result;
      return {
        apiKeyId: key.ROWID,
        accessKey: key.accesskey,
        mnoId: key.mnoId,
        country: key.country,
        createdAt: key.CREATEDTIME
      };
    });

    console.log(`✓ Found ${keys.length} API keys`);
    res.status(200).json({
      success: true,
      message: 'API keys retrieved successfully',
      count: keys.length,
      data: keys
    });
  } catch (error) {
    console.error('❌ GET API KEYS ERROR:', error.message);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve API keys',
      error: error.message
    });
  }
  console.log('========== GET ALL API KEYS END ==========\n');
};

module.exports = {
  createMNO,
  generateAPIKey,
  getAllMNOs,
  getAllAPIKeys
};
