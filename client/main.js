const { useState, useEffect } = React;

const API_BASE_URL = 'https://secure-data-bridge-942310354.development.catalystserverless.com/server/file_management_function';

// File Upload Component
function FileUpload({ onUploadSuccess }) {
  const [file, setFile] = useState(null);
  const [country, setCountry] = useState('Zambia');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

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

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) {
      setMessage('Please select a file');
      return;
    }
    if (!country) {
      setMessage('Please select a country');
      return;
    }

    setLoading(true);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('country', country);
    formData.append('uploadedBy', 'admin');

    try {
      const response = await fetch(`${API_BASE_URL}/api/files/upload`, {
        method: 'POST',
        body: formData
      });

      const data = await response.json();
      if (data.success) {
        setMessage(`✓ File uploaded successfully!`);
        setFile(null);
        setCountry('Zambia');
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
    <div className="card">
      <h2>Upload File</h2>
      <form onSubmit={handleUpload}>
        <div className="form-group">
          <label>Country</label>
          <select
            value={country}
            onChange={(e) => setCountry(e.target.value)}
            required
            disabled={loading}
          >
            <option value="">-- Select a country --</option>
            {countries.map((c) => (
              <option key={c} value={c}>
                {c}
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
      </form>
      {message && (
        <div className={`message ${message.includes('Error') || message.includes('failed') ? 'error' : ''}`}>
          {message}
        </div>
      )}
    </div>
  );
}

// File List Component
function FileList({ files, loading, currentPage, itemsPerPage, onPageChange }) {
  if (loading) {
    return (
      <div className="card">
        <h2>Files</h2>
        <div className="empty-state">
          <p>Loading files...</p>
        </div>
      </div>
    );
  }

  if (files.length === 0) {
    return (
      <div className="card">
        <h2>Files</h2>
        <div className="empty-state">
          <p>No files found. Upload your first file to get started.</p>
        </div>
      </div>
    );
  }

  const totalPages = Math.ceil(files.length / itemsPerPage);
  const startIdx = (currentPage - 1) * itemsPerPage;
  const endIdx = startIdx + itemsPerPage;
  const paginatedFiles = files.slice(startIdx, endIdx);

  return (
    <div className="card">
      <div className="files-header">
        <h2>Files ({files.length})</h2>
        <span className="page-info">
          Page {currentPage} of {totalPages}
        </span>
      </div>
      <div className="file-list">
        {paginatedFiles.map((file) => (
          <div
            key={file.fileId}
            className="file-item"
            title={`ID: ${file.fileId}`}
          >
            <span className="file-name">{file.originalName}</span>
            <span className="file-country">{file.country || 'N/A'}</span>
            <span className="file-size">{(file.fileSize / 1024).toFixed(2)} KB</span>
            <span className="file-type">{file.mimeType}</span>
            <span className="file-date">
              {new Date(file.uploadedDate).toLocaleDateString()}
            </span>
          </div>
        ))}
      </div>

      {totalPages > 1 && (
        <div className="pagination">
          <button
            className="pagination-btn"
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
          >
            ← Previous
          </button>

          <div className="pagination-numbers">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                className={`pagination-number ${page === currentPage ? 'active' : ''}`}
                onClick={() => onPageChange(page)}
              >
                {page}
              </button>
            ))}
          </div>

          <button
            className="pagination-btn"
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
          >
            Next →
          </button>
        </div>
      )}
    </div>
  );
}

// Client Sharing Component
function ClientSharing() {
  const [copiedText, setCopiedText] = useState('');
  const baseUrl = 'https://secure-data-bridge-942310354.catalystserverless.com';

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

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setCopiedText(text);
    setTimeout(() => setCopiedText(''), 2000);
  };

  const getApiUrl = (country) => {
    const countryParam = country.replace(/\s+/g, '%20');
    return `${baseUrl}/server/file_management_function/api/files?country=${countryParam}`;
  };

  const getDownloadUrl = (country) => {
    const countryParam = country.replace(/\s+/g, '%20');
    return `${baseUrl}/server/file_management_function/api/files/{fileId}`;
  };

  return (
    <div className="card">
      <h2>Share with Clients</h2>
      <p style={{ color: '#64748b', marginBottom: '20px', fontSize: '0.95em' }}>
        Copy and send these links to your clients
      </p>

      <div className="sharing-list">
        {countries.map((country) => (
          <div key={country} className="sharing-item">
            <div className="sharing-country-header">
              <h3>{country}</h3>
            </div>

            <div className="sharing-endpoint">
              <label>API Endpoint (GET Request):</label>
              <div className="sharing-link-group">
                <input
                  type="text"
                  readOnly
                  value={getApiUrl(country)}
                  className="sharing-input"
                />
                <button
                  className="copy-btn"
                  onClick={() => copyToClipboard(getApiUrl(country))}
                >
                  {copiedText === getApiUrl(country) ? '✓ Copied' : 'Copy'}
                </button>
              </div>
            </div>

            <div className="sharing-endpoint">
              <label>Download File (GET Request):</label>
              <div className="sharing-link-group">
                <input
                  type="text"
                  readOnly
                  value={getDownloadUrl(country)}
                  className="sharing-input"
                />
                <button
                  className="copy-btn"
                  onClick={() => copyToClipboard(getDownloadUrl(country))}
                >
                  {copiedText === getDownloadUrl(country) ? '✓ Copied' : 'Copy'}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Main App
function App() {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState('');
  const [countries, setCountries] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [showSharing, setShowSharing] = useState(false);
  const itemsPerPage = 10;

  const fetchFiles = async (country = '') => {
    setLoading(true);
    setCurrentPage(1);
    try {
      const url = country
        ? `${API_BASE_URL}/api/files?country=${country}`
        : `${API_BASE_URL}/api/files`;

      const response = await fetch(url);
      const data = await response.json();

      if (data.success) {
        setFiles(data.data || []);
        // Extract unique countries
        const uniqueCountries = [...new Set(data.data?.map(f => f.country).filter(Boolean))];
        setCountries(uniqueCountries);
      }
    } catch (error) {
      console.error('Error fetching files:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFiles();
  }, []);

  const handleCountryFilter = (country) => {
    setSelectedCountry(country);
    fetchFiles(country);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="app">
      <header className="header">
        <h1>File Management</h1>
        <p>Upload and manage files across different countries</p>
      </header>

      <main className="container">
        <div className="tabs-header">
          <button
            className={`tab-btn ${!showSharing ? 'active' : ''}`}
            onClick={() => setShowSharing(false)}
          >
            Files
          </button>
          <button
            className={`tab-btn ${showSharing ? 'active' : ''}`}
            onClick={() => setShowSharing(true)}
          >
            Share with Clients
          </button>
        </div>

        {!showSharing ? (
          <>
            <FileUpload onUploadSuccess={() => fetchFiles(selectedCountry)} />

            <div className="card">
              <h2>Filter by Country</h2>
              <div className="country-filters">
                <button
                  className={`filter-btn ${selectedCountry === '' ? 'active' : ''}`}
                  onClick={() => handleCountryFilter('')}
                >
                  All Countries
                </button>
                {countries.map((country) => (
                  <button
                    key={country}
                    className={`filter-btn ${selectedCountry === country ? 'active' : ''}`}
                    onClick={() => handleCountryFilter(country)}
                  >
                    {country}
                  </button>
                ))}
              </div>
            </div>

            <FileList
              files={files}
              loading={loading}
              currentPage={currentPage}
              itemsPerPage={itemsPerPage}
              onPageChange={handlePageChange}
            />
          </>
        ) : (
          <ClientSharing />
        )}
      </main>

      <footer className="footer">
        <p>File Share API v1.0</p>
      </footer>
    </div>
  );
}

// Render app
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);
