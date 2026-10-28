const { useState, useEffect } = React;

// Use localhost for development, production URL for deployed version
const API_BASE_URL = window.location.hostname === 'localhost'
  ? 'http://localhost:3000/server/file_management_function'
  : 'https://secure-data-bridge-942310354.development.catalystserverless.com/server/file_management_function';

const countries = [
  'Kenya',
  'South Sudan',
  'Tanzania',
  'UAE',
  'Liberia',
  'Zambia',
  'DRC',
  'Rwanda',
  'Uganda'
];

// MNO Management Component
function MNOManagement({ onMNOCreated }) {
  const [mnoName, setMnoName] = useState('');
  const [mnoDesc, setMnoDesc] = useState('');
  const [mnos, setMnos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchMNOs();
  }, []);

  const fetchMNOs = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/mnos`);
      const data = await response.json();
      if (data.success) {
        setMnos(data.data || []);
      }
    } catch (error) {
      console.error('Failed to fetch MNOs:', error);
    }
  };

  const handleCreateMNO = async (e) => {
    e.preventDefault();
    if (!mnoName) {
      setMessage('MNO name is required');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/mnos`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: mnoName, description: mnoDesc })
      });

      const data = await response.json();
      if (data.success) {
        setMessage(`✓ MNO "${mnoName}" created successfully!`);
        setMnoName('');
        setMnoDesc('');
        fetchMNOs();
        onMNOCreated();
      } else {
        setMessage(`Error: ${data.message}`);
      }
    } catch (error) {
      setMessage(`Creation failed: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card">
      <h2>Create MNO</h2>

      <form onSubmit={handleCreateMNO} className="form-section">
        <div className="form-group">
          <label>MNO Name</label>
          <input
            type="text"
            value={mnoName}
            onChange={(e) => setMnoName(e.target.value)}
            placeholder="e.g., MTN, Airtel, Vodafone"
            disabled={loading}
          />
        </div>

        <div className="form-group">
          <label>Description</label>
          <input
            type="text"
            value={mnoDesc}
            onChange={(e) => setMnoDesc(e.target.value)}
            placeholder="Optional description"
            disabled={loading}
          />
        </div>

        <button type="submit" disabled={loading} className="btn btn-primary">
          {loading ? 'Creating...' : 'Create MNO'}
        </button>
      </form>

      {message && (
        <div className={`message ${message.includes('Error') ? 'error' : ''}`}>
          {message}
        </div>
      )}

      <div className="list-section">
        <h3>Registered MNOs</h3>
        {mnos.length === 0 ? (
          <div className="empty-state">No MNOs created yet</div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>MNO ID</th>
                <th>Description</th>
                <th>Created</th>
              </tr>
            </thead>
            <tbody>
              {mnos.map((mno) => (
                <tr key={mno.mnoId}>
                  <td className="font-semibold">{mno.name}</td>
                  <td className="font-mono text-xs">{mno.mnoId}</td>
                  <td>{mno.description || '-'}</td>
                  <td>{new Date(mno.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

// API Key Management Component
function APIKeyManagement({ refreshTrigger, onAPIKeyGenerated }) {
  const [mnoId, setMnoId] = useState('');
  const [country, setCountry] = useState('Zambia');
  const [mnos, setMnos] = useState([]);
  const [apiKeys, setApiKeys] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [copiedKey, setCopiedKey] = useState('');

  useEffect(() => {
    fetchMNOs();
    fetchAPIKeys();
  }, [refreshTrigger]);

  const fetchMNOs = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/mnos`);
      const data = await response.json();
      if (data.success) {
        setMnos(data.data || []);
      }
    } catch (error) {
      console.error('Failed to fetch MNOs:', error);
    }
  };

  const fetchAPIKeys = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/api-keys`);
      const data = await response.json();
      if (data.success) {
        setApiKeys(data.data || []);
      }
    } catch (error) {
      console.error('Failed to fetch API keys:', error);
    }
  };

  const handleGenerateKey = async (e) => {
    e.preventDefault();
    if (!mnoId || !country) {
      setMessage('MNO and country are required');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/api-keys`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mnoId, country })
      });

      const data = await response.json();
      if (data.success) {
        setMessage(`✓ API key generated successfully!`);
        setMnoId('');
        setCountry('Zambia');
        fetchAPIKeys();
        if (onAPIKeyGenerated) {
          onAPIKeyGenerated();
        }
      } else {
        setMessage(`Error: ${data.message}`);
      }
    } catch (error) {
      setMessage(`Generation failed: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(text);
    setTimeout(() => setCopiedKey(''), 2000);
  };

  return (
    <div className="card">
      <h2>Generate API Key</h2>

      <form onSubmit={handleGenerateKey} className="form-section">
        <div className="form-group">
          <label>Select MNO</label>
          <select
            value={mnoId}
            onChange={(e) => setMnoId(e.target.value)}
            required
            disabled={loading}
          >
            <option value="">-- Select MNO --</option>
            {mnos.map((mno) => (
              <option key={mno.mnoId} value={mno.mnoId}>
                {mno.name} (ID: {mno.mnoId})
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label>Country</label>
          <select
            value={country}
            onChange={(e) => setCountry(e.target.value)}
            required
            disabled={loading}
          >
            {countries.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>

        <button type="submit" disabled={loading} className="btn btn-primary">
          {loading ? 'Generating...' : 'Generate API Key'}
        </button>
      </form>

      {message && (
        <div className={`message ${message.includes('Error') ? 'error' : ''}`}>
          {message}
        </div>
      )}

      <div className="list-section">
        <h3>Generated Keys</h3>
        {apiKeys.length === 0 ? (
          <div className="empty-state">No API keys generated yet</div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>MNO Name</th>
                <th>Country</th>
                <th>Access Key</th>
                <th>Created</th>
                <th className="text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {apiKeys.map((key) => {
                const mno = mnos.find(m => m.mnoId === key.mnoId);
                return (
                  <tr key={key.apiKeyId}>
                    <td className="font-semibold">{mno ? mno.name : 'Unknown'}</td>
                    <td>
                      <span className="badge">{key.country}</span>
                    </td>
                    <td>
                      <code className="code-block">{key.accessKey}</code>
                    </td>
                    <td>{new Date(key.createdAt).toLocaleDateString()}</td>
                    <td className="text-right">
                      <button
                        type="button"
                        className="copy-btn-sm"
                        onClick={() => copyToClipboard(key.accessKey)}
                        title="Copy access key"
                      >
                        {copiedKey === key.accessKey ? '✓ Copied' : 'Copy'}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

// File Upload Component
function FileUpload({ onUploadSuccess, apiKeys, mnos, refreshTrigger }) {
  const [file, setFile] = useState(null);
  const [accessKey, setAccessKey] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    setAccessKey('');
  }, [refreshTrigger]);

  const getMNOName = (mnoId) => {
    const mno = mnos.find(m => m.mnoId === mnoId);
    return mno ? mno.name : mnoId.substring(0, 8) + '...';
  };

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) {
      setMessage('Please select a file');
      return;
    }
    if (!accessKey) {
      setMessage('Please select an access key');
      return;
    }

    setLoading(true);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('accessKey', accessKey);
    formData.append('uploadedBy', 'admin');

    try {
      const response = await fetch(`${API_BASE_URL}/api/files/upload`, {
        method: 'POST',
        body: formData
      });

      const data = await response.json();
      if (data.success) {
        setMessage(`✓ File "${file.name}" uploaded successfully!`);
        setFile(null);
        setAccessKey('');
        onUploadSuccess();
      } else {
        setMessage(`Error: ${data.message}`);
      }
    } catch (error) {
      setMessage(`Upload failed: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleUpload}>
      <div className="form-group">
        <label>Select Access Key</label>
        <select
          value={accessKey}
          onChange={(e) => setAccessKey(e.target.value)}
          required
          disabled={loading}
        >
          <option value="">-- Select access key --</option>
          {apiKeys.map((key) => (
            <option key={key.apiKeyId} value={key.accessKey}>
              {getMNOName(key.mnoId)} - {key.country}
            </option>
          ))}
        </select>
      </div>

      <div className="form-group">
        <label>Select File</label>
        <input
          type="file"
          onChange={handleFileChange}
          required
          disabled={loading}
        />
      </div>

      <button type="submit" disabled={loading} className="btn btn-primary">
        {loading ? 'Uploading...' : 'Upload File'}
      </button>

      {message && (
        <div className={`message ${message.includes('Error') ? 'error' : ''}`}>
          {message}
        </div>
      )}
    </form>
  );
}

// File List Component
function FileList({ accessKey, apiKeys }) {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const selectedKeyInfo = apiKeys.find((k) => k.accessKey === accessKey);

  useEffect(() => {
    if (accessKey) {
      fetchFiles();
    }
  }, [accessKey]);

  const fetchFiles = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/files?accessKey=${accessKey}`);
      const data = await response.json();
      if (data.success) {
        setFiles(data.data || []);
        setCurrentPage(1);
      }
    } catch (error) {
      console.error('Failed to fetch files:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!accessKey) {
    return (
      <div className="empty-state">
        <p>Select an access key to view files</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="empty-state">
        <p>Loading files...</p>
      </div>
    );
  }

  if (files.length === 0) {
    return (
      <div className="empty-state">
        <p>No files uploaded for {selectedKeyInfo?.country}</p>
      </div>
    );
  }

  const totalPages = Math.ceil(files.length / itemsPerPage);
  const startIdx = (currentPage - 1) * itemsPerPage;
  const endIdx = startIdx + itemsPerPage;
  const paginatedFiles = files.slice(startIdx, endIdx);

  return (
    <>
      <div className="table-header">
        <h3>Files for {selectedKeyInfo?.country}</h3>
        <span className="page-info">Page {currentPage} of {totalPages}</span>
      </div>

      <table className="data-table">
        <thead>
          <tr>
            <th>Filename</th>
            <th>Country</th>
            <th>Size</th>
            <th>Type</th>
            <th>Uploaded</th>
          </tr>
        </thead>
        <tbody>
          {paginatedFiles.map((file) => (
            <tr key={file.fileId} title={`ID: ${file.fileId}`}>
              <td className="font-semibold">{file.originalName}</td>
              <td>
                <span className="badge">{file.country}</span>
              </td>
              <td className="text-right">{(parseInt(file.fileSize) / 1024).toFixed(2)} KB</td>
              <td className="text-xs text-muted">{file.mimeType}</td>
              <td className="text-xs">{new Date(file.uploadedDate).toLocaleDateString()}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {totalPages > 1 && (
        <div className="pagination">
          <button
            className="pagination-btn"
            onClick={() => setCurrentPage(currentPage - 1)}
            disabled={currentPage === 1}
          >
            ← Previous
          </button>
          <div className="pagination-numbers">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                className={`pagination-number ${page === currentPage ? 'active' : ''}`}
                onClick={() => setCurrentPage(page)}
              >
                {page}
              </button>
            ))}
          </div>
          <button
            className="pagination-btn"
            onClick={() => setCurrentPage(currentPage + 1)}
            disabled={currentPage === totalPages}
          >
            Next →
          </button>
        </div>
      )}
    </>
  );
}

// Sidebar Navigation
function Sidebar({ activeTab, onTabChange }) {
  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <h1>File Share</h1>
        <p>Admin Dashboard</p>
      </div>

      <nav className="sidebar-nav">
        <button
          className={`nav-item ${activeTab === 'mnos' ? 'active' : ''}`}
          onClick={() => onTabChange('mnos')}
        >
          MNO Management
        </button>

        <button
          className={`nav-item ${activeTab === 'keys' ? 'active' : ''}`}
          onClick={() => onTabChange('keys')}
        >
          API Keys
        </button>

        <button
          className={`nav-item ${activeTab === 'upload' ? 'active' : ''}`}
          onClick={() => onTabChange('upload')}
        >
          Upload Files
        </button>

        <button
          className={`nav-item ${activeTab === 'files' ? 'active' : ''}`}
          onClick={() => onTabChange('files')}
        >
          View Files
        </button>
      </nav>
    </aside>
  );
}

// Main App
function App() {
  const [activeTab, setActiveTab] = useState('mnos');
  const [apiKeys, setApiKeys] = useState([]);
  const [mnos, setMnos] = useState([]);
  const [selectedAccessKey, setSelectedAccessKey] = useState('');
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleMNOCreated = () => {
    setRefreshTrigger(refreshTrigger + 1);
  };

  const handleUploadSuccess = () => {
    setRefreshTrigger(refreshTrigger + 1);
  };

  const handleAPIKeyGenerated = () => {
    fetchAPIKeys();
  };

  const fetchAPIKeys = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/api-keys`);
      const data = await response.json();
      if (data.success) {
        setApiKeys(data.data || []);
      }
    } catch (error) {
      console.error('Failed to fetch API keys:', error);
    }
  };

  const fetchMNOs = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/mnos`);
      const data = await response.json();
      if (data.success) {
        setMnos(data.data || []);
      }
    } catch (error) {
      console.error('Failed to fetch MNOs:', error);
    }
  };

  useEffect(() => {
    fetchAPIKeys();
    fetchMNOs();
  }, [refreshTrigger]);

  return (
    <div className="app-layout">
      <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />

      <main className="main-content">
        <div className="content-wrapper">
          {activeTab === 'mnos' && (
            <div className="tab-content">
              <h2>MNO Management</h2>
              <MNOManagement onMNOCreated={handleMNOCreated} />
            </div>
          )}

          {activeTab === 'keys' && (
            <div className="tab-content">
              <h2>API Key Management</h2>
              <APIKeyManagement refreshTrigger={refreshTrigger} onAPIKeyGenerated={handleAPIKeyGenerated} />
            </div>
          )}

          {activeTab === 'upload' && (
            <div className="tab-content">
              <h2>Upload Files</h2>
              <div className="card">
                <FileUpload onUploadSuccess={handleUploadSuccess} apiKeys={apiKeys} mnos={mnos} refreshTrigger={refreshTrigger} />
              </div>
            </div>
          )}

          {activeTab === 'files' && (
            <div className="tab-content">
              <h2>View Files</h2>
              <div className="card">
                <div className="form-group">
                  <label>Select Access Key</label>
                  <select
                    value={selectedAccessKey}
                    onChange={(e) => setSelectedAccessKey(e.target.value)}
                  >
                    <option value="">-- Select access key to view files --</option>
                    {apiKeys.map((key) => {
                      const mno = mnos.find(m => m.mnoId === key.mnoId);
                      const mnoName = mno ? mno.name : key.mnoId.substring(0, 8) + '...';
                      return (
                        <option key={key.apiKeyId} value={key.accessKey}>
                          {mnoName} - {key.country}
                        </option>
                      );
                    })}
                  </select>
                </div>
              </div>

              {selectedAccessKey && (
                <div className="card">
                  <FileList accessKey={selectedAccessKey} apiKeys={apiKeys} />
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

ReactDOM.render(<App />, document.getElementById('root'));
