import React, { useState, useEffect } from 'react';
import { 
  checkText, 
  uploadFile, 
  viewFile, 
  downloadFile, 
  getUserFolders, 
  createUserFolder, 
  saveProcessedFiles 
} from '../api';
import './DocumentScanner.css';
import LoadingAnimation from './LoadingAnimation';

function DocumentScanner() {
  const [document, setDocument] = useState('');
  const [results, setResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [fileName, setFileName] = useState('');
  const [processedFiles, setProcessedFiles] = useState(null);
  const [error, setError] = useState(null);
  const [showFileSaveConfirm, setShowFileSaveConfirm] = useState(false);
  const [tempProcessedFiles, setTempProcessedFiles] = useState(null);
  const [folders, setFolders] = useState([]);
  const [selectedFolderId, setSelectedFolderId] = useState('');
  const [showNewFolderForm, setShowNewFolderForm] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    // Check if device is mobile
    const checkMobile = () => {
      const mobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
      setIsMobile(mobile);
    };
    
    checkMobile();
    
    // Fetch folders when confirmation dialog is shown
    if (showFileSaveConfirm) {
      fetchUserFolders();
    }
  }, [showFileSaveConfirm]);

  const fetchUserFolders = async () => {
    try {
      const userInfo = JSON.parse(localStorage.getItem('user-info') || '{}');
      if (!userInfo.token) return;

      const response = await getUserFolders(userInfo.token);
      setFolders(response.data.folders || []);
    } catch (err) {
      console.error('Error fetching folders:', err);
      setError('Failed to load folders');
    }
  };

  const handleCreateFolder = async () => {
    if (!newFolderName.trim()) {
      setError('Please enter a folder name');
      return;
    }

    try {
      const userInfo = JSON.parse(localStorage.getItem('user-info') || '{}');
      
      const response = await createUserFolder(userInfo.token, { name: newFolderName });
      
      setFolders([...folders, response.data.folder]);
      setSelectedFolderId(response.data.folder._id);
      setNewFolderName('');
      setShowNewFolderForm(false);
    } catch (err) {
      console.error('Error creating folder:', err);
      setError('Failed to create folder');
    }
  };

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
    e.preventDefault(); // Prevent default browser behavior
    const file = e.target.files[0];
    
    if (!file) {
      return; // No file selected
    }
    
    const allowedTypes = [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'text/plain'
    ];
    
    // Check for mobile devices that might have different MIME types
    const isMobileDevice = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    const isAllowedMobileType = isMobileDevice && (
      file.type.includes('pdf') || 
      file.type.includes('word') || 
      file.type.includes('sheet') || 
      file.type.includes('excel') ||
      file.type.includes('text') ||
      file.name.match(/\.(pdf|docx|xlsx|txt)$/i)
    );
    
    if (file && (allowedTypes.includes(file.type) || isAllowedMobileType)) {
      setFileName(file.name);
      const formData = new FormData();
      formData.append('file', file);
      
      // Add folderId to formData if selected
      if (selectedFolderId) {
        formData.append('folderId', selectedFolderId);
      }
      
      setIsLoading(true);
      setError(null);
      
      try {
        // Get user token if available
        const userInfo = JSON.parse(localStorage.getItem('user-info') || '{}');
        const token = userInfo.token;
        
        // Pass the folder ID during upload
        const response = await uploadFile(formData, token, selectedFolderId);
        setDocument(response.data.text || '');
        
        // Show all patterns, both default and custom
        setResults(response.data.matches);
        
        // Store processed files temporarily
        setTempProcessedFiles({
          highlighted: response.data.highlightedFileId,
          masked: response.data.maskedFileId
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
  
  const handleSaveConfirm = async () => {
    try {
      const userInfo = JSON.parse(localStorage.getItem('user-info') || '{}');
      
      // If we have processed files, save them with folder information
      if (tempProcessedFiles) {
        // Only use saveProcessedFiles if the files were already processed without a folder
        await saveProcessedFiles(userInfo.token, {
          highlightedFileId: tempProcessedFiles.highlighted,
          maskedFileId: tempProcessedFiles.masked,
          folderId: selectedFolderId || null
        });
      }
      
      setProcessedFiles(tempProcessedFiles);
      setTempProcessedFiles(null);
      setShowFileSaveConfirm(false);
      setSelectedFolderId('');
    } catch (err) {
      console.error('Error saving files:', err);
      setError('Failed to save files');
    }
  };
  
  const handleSaveCancel = () => {
    setTempProcessedFiles(null);
    setShowFileSaveConfirm(false);
    setSelectedFolderId('');
    setShowNewFolderForm(false);
  };

  const handleDownload = (fileId) => {
    window.location.href = downloadFile(fileId);
  };

  const handleView = (fileId) => {
    window.open(viewFile(fileId), '_blank');
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
    <div className="scanner-container">
      {isLoading && <LoadingAnimation message="Scanning document..." />}
      <div className="scanner-card">
        <div className="scanner-header">
          <h2 className="scanner-title"><i className="fas fa-search"></i> DOCUMENT SCANNER</h2>
        </div>
        
        {error && <div className="error-message"><i className="fas fa-exclamation-circle"></i> {error}</div>}
        
        <div className="scanner-content">
          <div className="scanner-left">
            <div className="upload-section">
              <div className="file-upload-wrapper">
                <input
                  type="file"
                  accept=".pdf,.docx,.xlsx,.txt"
                  onChange={handleFileUpload}
                  className="file-input"
                  id="file-upload"
                  disabled={isLoading}
                  capture="environment"
                />
                <label htmlFor="file-upload" className={`file-upload-label ${isLoading ? 'disabled' : ''}`}>
                  <i className="fas fa-file-upload"></i>
                  {fileName ? fileName : 'Drop your file here or tap to upload'}
                </label>
              </div>
              {isMobile && (
                <button 
                  onClick={() => document.getElementById('file-upload').click()}
                  className="mobile-upload-button"
                  disabled={isLoading}
                >
                  <i className="fas fa-upload"></i> Select File
                </button>
              )}
            </div>

            <div className="text-section">
              <textarea
                value={document}
                onChange={(e) => setDocument(e.target.value)}
                placeholder="Enter text"
                className="scanner-textarea"
                disabled={isLoading}
              />
              <button 
                onClick={scanDocument} 
                className="scan-button"
                disabled={isLoading}
              >
                {isLoading ? <><i className="fas fa-spinner fa-spin"></i> Scanning...</> : <><i className="fas fa-search"></i> Scan</>}
              </button>
            </div>
          </div>
          
          <div className="scanner-right">
            <div className="results-section">
              <h3 className="results-title"><i className="fas fa-clipboard-list"></i> Results</h3>
              {results.length > 0 ? (
                <div className="results-container">
                  {results.map((result, index) => (
                    <div key={index} className={`result-card ${result.isCustom ? 'custom-pattern' : 'default-pattern'}`}>
                      <div className="pattern-header">
                        <h4 className="pattern-name"><i className="fas fa-fingerprint"></i> {result.patternName}</h4>
                        {result.isCustom ? 
                          <span className="pattern-badge custom"><i className="fas fa-user-edit"></i> Custom</span> :
                          <span className="pattern-badge default"><i className="fas fa-shield-alt"></i> Default</span>
                        }
                      </div>
                      {result.matches.map((match, matchIndex) => (
                        <div key={matchIndex} className="match-item">
                          <div className="match-line"><i className="fas fa-hashtag"></i> Line {match.line}</div>
                          <div className="match-content">
                            {highlightMatches(match.content, match.matches)}
                          </div>
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="no-results"><i className="fas fa-info-circle"></i> No matches found.</div>
              )}
            </div>
          </div>
        </div>
        
        {/* Processed Files Section */}
        {processedFiles && (
          <>
            <div className="section-separator"></div>
            <div className="processed-files">
              <h4><i className="fas fa-file-alt"></i> Processed Files</h4>
              <div className="file-actions">
                <div className="file-action-group">
                  <h5><i className="fas fa-highlighter"></i> Highlighted File</h5>
                  <div style={{ display: 'flex', justifyContent: 'center' }}>
                    <button onClick={() => handleView(processedFiles.highlighted)}><i className="fas fa-eye"></i> View</button>
                    <button onClick={() => handleDownload(processedFiles.highlighted)}><i className="fas fa-download"></i> Download</button>
                  </div>
                </div>
                
                <div className="file-action-group">
                  <h5><i className="fas fa-mask"></i> Masked File</h5>
                  <div style={{ display: 'flex', justifyContent: 'center' }}>
                    <button onClick={() => handleView(processedFiles.masked)}><i className="fas fa-eye"></i> View</button>
                    <button onClick={() => handleDownload(processedFiles.masked)}><i className="fas fa-download"></i> Download</button>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
        
        {/* Confirmation Dialog with Folder Selection */}
        {showFileSaveConfirm && (
          <div className="save-confirmation">
            <div className="confirmation-content">
              <h3><i className="fas fa-exclamation-triangle"></i> Sensitive Information Detected</h3>
              <div className="detection-summary">
                <p><i className="fas fa-info-circle"></i> We found {results.length} pattern match(es) in your document. Would you like to save the processed files?</p>
              </div>
              
              <div className="folder-selection">
                <h4><i className="fas fa-folder-open"></i> Select a folder to save files:</h4>
                <select 
                  value={selectedFolderId} 
                  onChange={(e) => setSelectedFolderId(e.target.value)}
                  className="folder-select"
                >
                  <option value=""><i className="fas fa-folder"></i> Root (No folder)</option>
                  {folders.map(folder => (
                    <option key={folder._id} value={folder._id}>
                      {folder.name}
                    </option>
                  ))}
                </select>
                
                {!showNewFolderForm ? (
                  <button 
                    className="new-folder-button" 
                    onClick={() => setShowNewFolderForm(true)}
                  >
                    <i className="fas fa-folder-plus"></i> Create New Folder
                  </button>
                ) : (
                  <div className="new-folder-form">
                    <input
                      type="text"
                      placeholder="Enter folder name"
                      value={newFolderName}
                      onChange={(e) => setNewFolderName(e.target.value)}
                    />
                    <div className="folder-form-buttons">
                      <button onClick={handleCreateFolder}><i className="fas fa-check"></i> Create</button>
                      <button onClick={() => setShowNewFolderForm(false)}><i className="fas fa-times"></i> Cancel</button>
                    </div>
                  </div>
                )}
              </div>
              
              <div className="confirmation-actions">
                <button className="btn-confirm" onClick={handleSaveConfirm}><i className="fas fa-save"></i> Save Files</button>
                <button className="btn-cancel" onClick={handleSaveCancel}><i className="fas fa-times"></i> Cancel</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default DocumentScanner;