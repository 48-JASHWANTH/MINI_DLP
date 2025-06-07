import React, { useState } from 'react';
import { checkText, uploadFile, viewFile, downloadFile } from '../api';
import './DocumentScanner.css';

function DocumentScanner({ isDarkMode }) {
  const [document, setDocument] = useState('');
  const [results, setResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [fileName, setFileName] = useState('');
  const [processedFiles, setProcessedFiles] = useState(null);
  const [error, setError] = useState(null);
  const [showFileSaveConfirm, setShowFileSaveConfirm] = useState(false);
  const [tempProcessedFiles, setTempProcessedFiles] = useState(null);

  const scanDocument = async () => {
    if (!document.trim()) {
      setError('Please enter some text');
      return;
    }

    setIsLoading(true);
    setError(null);
    
    try {
      // Get user token if available
      const userInfo = JSON.parse(localStorage.getItem('user-info') || '{}');
      const token = userInfo.token;
      
      const response = await checkText(document, token);
      // Show all patterns, both default and custom
      setResults(response.data.matches);
      
      // If we found sensitive information, show confirmation
      if (response.data.matches.length > 0) {
        setShowFileSaveConfirm(true);
      }
    } catch (error) {
      console.error('Error scanning document:', error);
      setError('Error scanning document. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    const allowedTypes = [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'text/plain'
    ];
    
    if (file && allowedTypes.includes(file.type)) {
      setFileName(file.name);
      const formData = new FormData();
      formData.append('file', file);
      
      setIsLoading(true);
      setError(null);
      
      try {
        // Get user token if available
        const userInfo = JSON.parse(localStorage.getItem('user-info') || '{}');
        const token = userInfo.token;
        
        const response = await uploadFile(formData, token);
        setDocument(response.data.text || '');
        
        // Show all patterns, both default and custom
        setResults(response.data.matches);
        
        // Store processed files temporarily
        setTempProcessedFiles({
          highlighted: response.data.highlightedFile,
          masked: response.data.maskedFile
        });
        
        // If we found sensitive information, show confirmation
        if (response.data.matches.length > 0) {
          setShowFileSaveConfirm(true);
        }
      } catch (error) {
        console.error('Error processing file:', error);
        setError(error.response?.data?.error || 'Error processing file');
      } finally {
        setIsLoading(false);
      }
    } else {
      setError('Please upload a supported file type (PDF, DOCX, XLSX, or TXT)');
    }
  };
  
  const handleSaveConfirm = () => {
    setProcessedFiles(tempProcessedFiles);
    setTempProcessedFiles(null);
    setShowFileSaveConfirm(false);
  };
  
  const handleSaveCancel = () => {
    setTempProcessedFiles(null);
    setShowFileSaveConfirm(false);
  };

  const handleDownload = (filename) => {
    window.location.href = downloadFile(filename);
  };

  const handleView = (filename) => {
    window.open(viewFile(filename), '_blank');
  };

  const highlightMatches = (content, matches) => {
    let highlightedContent = content;
    const sortedMatches = [...matches].sort((a, b) => b.length - a.length); // Sort by length to handle overlapping matches
    
    sortedMatches.forEach(match => {
      const regex = new RegExp(`(${match})`, 'gi');
      highlightedContent = highlightedContent.replace(regex, '<mark>$1</mark>');
    });
    
    return <div dangerouslySetInnerHTML={{ __html: highlightedContent }} />;
  };

  return (
    <div className={`scanner-container ${isDarkMode ? 'dark' : ''}`}>
      <div className="scanner-card">
        <h2 className="scanner-title">Document Scanner</h2>
        
        {error && <div className="error-message">{error}</div>}
        
        <div className="upload-section">
          <div className="file-upload-wrapper">
            <input
              type="file"
              accept=".pdf,.docx,.xlsx,.txt"
              onChange={handleFileUpload}
              className="file-input"
              id="file-upload"
              disabled={isLoading}
            />
            <label htmlFor="file-upload" className={`file-upload-label ${isLoading ? 'disabled' : ''}`}>
              {fileName || 'Choose file (PDF, DOCX, XLSX, or TXT)'}
            </label>
          </div>
        </div>

        <div className="text-section">
          <textarea
            value={document}
            onChange={(e) => setDocument(e.target.value)}
            placeholder="Paste your text here..."
            className="scanner-textarea"
            disabled={isLoading}
          />
          <button 
            onClick={scanDocument} 
            className="scan-button"
            disabled={isLoading}
          >
            {isLoading ? 'Scanning...' : 'Scan'}
          </button>
        </div>

        {isLoading && (
          <div className="loading-spinner">
            <div className="spinner"></div>
            <p>Processing...</p>
          </div>
        )}
        
        {/* Save Confirmation Dialog */}
        {showFileSaveConfirm && (
          <div className="save-confirmation">
            <div className="confirmation-content">
              <h3>Sensitive Information Detected</h3>
              <p>Sensitive information has been found in your document. Would you like to save the processed files?</p>
              <p className="detection-summary">
                <strong>{results.length} pattern types detected</strong> with a total of {results.reduce((sum, pattern) => sum + pattern.matches.length, 0)} instances.
              </p>
              <div className="confirmation-actions">
                <button onClick={handleSaveConfirm} className="btn-confirm">
                  Yes, Save Files
                </button>
                <button onClick={handleSaveCancel} className="btn-cancel">
                  No, Just Show Results
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="results-section">
          <h3 className="results-title">Results</h3>
          {results.length > 0 ? (
            <div className="results-container">
              {results.map((result, index) => (
                <div key={index} className={`result-card ${result.isCustom ? 'custom-pattern' : 'default-pattern'}`}>
                  <div className="pattern-header">
                    <h4 className="pattern-name">{result.patternName}</h4>
                    {result.isCustom ? 
                      <span className="pattern-badge custom">Custom</span> :
                      <span className="pattern-badge default">Default</span>
                    }
                  </div>
                  {result.matches.map((match, matchIndex) => (
                    <div key={matchIndex} className="match-item">
                      <div className="match-line">Line {match.line}</div>
                      <div className="match-content">
                        {highlightMatches(match.content, match.matches)}
                      </div>
                      <div className="match-found">
                        <strong>Matched words:</strong> {match.matches.join(', ')}
                      </div>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          ) : (
            <p className="no-results">No matches found.</p>
          )}

          {processedFiles && (
            <div className="processed-files">
              <h4>Processed Documents</h4>
              <div className="file-actions">
                <div className="file-action-group">
                  <h5>Highlighted Version</h5>
                  <button onClick={() => handleView(processedFiles.highlighted)}>
                    View
                  </button>
                  <button onClick={() => handleDownload(processedFiles.highlighted)}>
                    Download
                  </button>
                </div>
                <div className="file-action-group">
                  <h5>Masked Version</h5>
                  <button onClick={() => handleView(processedFiles.masked)}>
                    View
                  </button>
                  <button onClick={() => handleDownload(processedFiles.masked)}>
                    Download
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default DocumentScanner;