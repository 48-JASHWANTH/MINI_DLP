import React, { useState, useEffect } from 'react';
import './ProcessedFiles.css';
import { 
  getUserFiles, 
  getUserFolders, 
  createUserFolder, 
  deleteUserFile, 
  moveUserFile,
  bulkMoveUserFiles,
  viewFile,
  downloadFile
} from '../api';

function ProcessedFiles() {
  const [files, setFiles] = useState([]);
  const [folders, setFolders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState('');
  const [newFolderName, setNewFolderName] = useState('');
  const [showNewFolderForm, setShowNewFolderForm] = useState(false);
  const [selectedFileId, setSelectedFileId] = useState(null);
  const [selectedFolderId, setSelectedFolderId] = useState(null);
  const [showMoveModal, setShowMoveModal] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [selectAll, setSelectAll] = useState(false);
  const [showBulkMoveModal, setShowBulkMoveModal] = useState(false);
  const [currentFolder, setCurrentFolder] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [fileTypeFilter, setFileTypeFilter] = useState('');

  useEffect(() => {
    fetchUserFiles();
    fetchUserFolders();
  }, []);

  useEffect(() => {
    if (selectAll) {
      const visibleFiles = getVisibleFiles();
      setSelectedFiles(visibleFiles.map(file => file._id));
    } else if (selectedFiles.length === getVisibleFiles().length) {
      setSelectedFiles([]);
    }
  }, [selectAll]);

  const fetchUserFiles = async () => {
    try {
      setLoading(true);
      const userInfo = JSON.parse(localStorage.getItem('user-info'));
      if (!userInfo) {
        setError('User not authenticated');
        setLoading(false);
        return;
      }

      const response = await getUserFiles(userInfo.token);
      setFiles(response.data.files);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching files:', err);
      setError('Failed to load files');
      setLoading(false);
    }
  };

  const fetchUserFolders = async () => {
    try {
      const userInfo = JSON.parse(localStorage.getItem('user-info'));
      if (!userInfo) return;

      const response = await getUserFolders(userInfo.token);
      setFolders(response.data.folders || []);
    } catch (err) {
      console.error('Error fetching folders:', err);
      setError('Failed to load folders');
    }
  };

  const handleCreateFolder = async (e) => {
    e.preventDefault();
    if (!newFolderName.trim()) {
      setError('Please enter a folder name');
      setTimeout(() => setError(null), 3000);
      return;
    }

    try {
      const userInfo = JSON.parse(localStorage.getItem('user-info'));
      
      const response = await createUserFolder(userInfo.token, { name: newFolderName });
      
      setFolders([...folders, response.data.folder]);
      setSuccess('Folder created successfully');
      setNewFolderName('');
      setShowNewFolderForm(false);
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.error('Error creating folder:', err);
      setError('Failed to create folder');
      setTimeout(() => setError(null), 3000);
    }
  };

  const handleDeleteFile = async (fileId) => {
    if (!window.confirm('Are you sure you want to delete this file?')) return;
    
    try {
      const userInfo = JSON.parse(localStorage.getItem('user-info'));
      
      await deleteUserFile(userInfo.token, fileId);
      
      // Update files list after deletion
      setFiles(files.filter(file => file._id !== fileId));
      setSuccess('File deleted successfully');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.error('Error deleting file:', err);
      setError('Failed to delete file');
      setTimeout(() => setError(null), 3000);
    }
  };

  const handleBulkDelete = async () => {
    if (selectedFiles.length === 0) return;
    if (!window.confirm(`Are you sure you want to delete ${selectedFiles.length} file(s)?`)) return;
    
    try {
      const userInfo = JSON.parse(localStorage.getItem('user-info'));
      
      for (const fileId of selectedFiles) {
        await deleteUserFile(userInfo.token, fileId);
      }
      
      // Update files list after deletion
      setFiles(files.filter(file => !selectedFiles.includes(file._id)));
      setSelectedFiles([]);
      setSelectAll(false);
      setSuccess(`${selectedFiles.length} file(s) deleted successfully`);
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.error('Error deleting files:', err);
      setError('Failed to delete files');
      setTimeout(() => setError(null), 3000);
    }
  };

  const handleMoveFile = async () => {
    if (!selectedFileId) return;
    
    try {
      const userInfo = JSON.parse(localStorage.getItem('user-info'));
      
      await moveUserFile(userInfo.token, selectedFileId, selectedFolderId);
      
      // Update file in the local state
      const updatedFiles = files.map(file => 
        file._id === selectedFileId ? { ...file, folderId: selectedFolderId } : file
      );
      
      setFiles(updatedFiles);
      setShowMoveModal(false);
      setSelectedFileId(null);
      setSelectedFolderId(null);
      setSuccess('File moved successfully');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.error('Error moving file:', err);
      setError('Failed to move file');
      setTimeout(() => setError(null), 3000);
    }
  };

  const handleBulkMove = async () => {
    if (selectedFiles.length === 0) return;
    
    try {
      const userInfo = JSON.parse(localStorage.getItem('user-info'));
      
      await bulkMoveUserFiles(userInfo.token, selectedFiles, selectedFolderId);
      
      // Update files in the local state
      const updatedFiles = files.map(file => 
        selectedFiles.includes(file._id) ? { ...file, folderId: selectedFolderId } : file
      );
      
      setFiles(updatedFiles);
      setShowBulkMoveModal(false);
      setSelectedFiles([]);
      setSelectAll(false);
      setSelectedFolderId(null);
      setSuccess(`${selectedFiles.length} file(s) moved successfully`);
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.error('Error moving files:', err);
      setError('Failed to move files');
      setTimeout(() => setError(null), 3000);
    }
  };

  const handleViewFile = (fileId) => {
    window.open(viewFile(fileId), '_blank');
  };

  const handleDownloadFile = (fileId) => {
    window.location.href = downloadFile(fileId);
  };

  const toggleFileSelection = (fileId) => {
    if (selectedFiles.includes(fileId)) {
      setSelectedFiles(selectedFiles.filter(id => id !== fileId));
    } else {
      setSelectedFiles([...selectedFiles, fileId]);
    }
  };

  const handleSelectAll = () => {
    setSelectAll(!selectAll);
  };

  const handleFolderClick = (folderId) => {
    setCurrentFolder(folderId);
    setSelectedFiles([]);
    setSelectAll(false);
  };

  const handleBackToAllFiles = () => {
    setCurrentFolder(null);
    setSelectedFiles([]);
    setSelectAll(false);
  };

  const getFileExtensionIcon = (fileType) => {
    const iconMap = {
      '.pdf': '📄',
      '.docx': '📝',
      '.xlsx': '📊',
      '.txt': '📃',
    };
    return iconMap[fileType] || '📁';
  };

  const getVisibleFiles = () => {
    // Filter files based on search term, file type, and current folder
    return files.filter(file => {
      // If a folder is selected, only show files from that folder
      if (currentFolder && file.folderId !== currentFolder) {
        return false;
      }
      
      // If we're in the main view (no folder selected), only show files without a folderId
      if (!currentFolder && file.folderId) {
        return false;
      }
      
      // Apply search term filter if provided
      if (searchTerm && !file.originalName.toLowerCase().includes(searchTerm.toLowerCase())) {
        return false;
      }
      
      // Apply file type filter if selected
      if (fileTypeFilter && file.fileType !== fileTypeFilter) {
        return false;
      }
      
      return true;
    });
  };

  const getUniqueFileTypes = () => {
    const fileTypes = new Set(files.map(file => file.fileType));
    return Array.from(fileTypes);
  };

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return 'Unknown size';
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return `${(bytes / Math.pow(1024, i)).toFixed(2)} ${sizes[i]}`;
  };

  const renderFolders = () => {
    // Don't show folders when we're inside a folder
    if (currentFolder) return null;
    
    if (folders.length === 0) return null;
    
    const filteredFolders = searchTerm
      ? folders.filter(folder => 
          folder.name.toLowerCase().includes(searchTerm.toLowerCase()))
      : folders;
    
    if (filteredFolders.length === 0) return null;
    
    return (
      <div className="folders-section">
        <h3>Folders</h3>
        <div className="folders-list">
          {filteredFolders.map(folder => {
            const folderFileCount = files.filter(file => file.folderId === folder._id).length;
            return (
              <div 
                key={folder._id} 
                className="folder-item"
                onClick={() => handleFolderClick(folder._id)}
              >
                <div className="folder-icon">📁</div>
                <div className="folder-name">{folder.name}</div>
                <div className="folder-count">
                  {folderFileCount} files
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const renderBreadcrumb = () => {
    if (!currentFolder) return null;
    
    const folder = folders.find(f => f._id === currentFolder);
    if (!folder) return null;
    
    return (
      <div className="breadcrumb">
        <span onClick={handleBackToAllFiles} className="breadcrumb-home">All Files</span>
        <span className="breadcrumb-separator">›</span>
        <span className="breadcrumb-current">{folder.name}</span>
      </div>
    );
  };

  const renderSearchAndFilters = () => {
    const fileTypes = getUniqueFileTypes();
    
    return (
      <div className="search-filter-container">
        <div className="search-box">
          <input
            type="text"
            placeholder="Search files..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="filter-box">
          <select 
            value={fileTypeFilter} 
            onChange={(e) => setFileTypeFilter(e.target.value)}
          >
            <option value="">All file types</option>
            {fileTypes.map(type => (
              <option key={type} value={type}>
                {type.replace('.', '').toUpperCase()}
              </option>
            ))}
          </select>
        </div>
      </div>
    );
  };

  const renderBulkActionToolbar = () => {
    const visibleFiles = getVisibleFiles();
    const hasVisibleFiles = visibleFiles.length > 0;
    const hasSelectedFiles = selectedFiles.length > 0;
    
    return (
      <div className="bulk-action-toolbar">
        <div className="selection-controls">
          <label className="select-all-label">
            <input 
              type="checkbox" 
              checked={selectAll}
              onChange={handleSelectAll}
              disabled={!hasVisibleFiles}
            />
            Select All
          </label>
          <span className="selected-count">
            {selectedFiles.length} file(s) selected
          </span>
        </div>
        <div className="bulk-actions">
          <button 
            className="bulk-action-button"
            disabled={!hasSelectedFiles}
            onClick={() => setShowBulkMoveModal(true)}
          >
            Move to Folder
          </button>
          <button 
            className="bulk-action-button delete"
            disabled={!hasSelectedFiles}
            onClick={handleBulkDelete}
          >
            Delete Selected
          </button>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="processed-files-container">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Loading files...</p>
        </div>
      </div>
    );
  }

  const visibleFiles = getVisibleFiles();

  return (
    <div className="processed-files-container">
      <div className="processed-files-card">
        <h2 className="processed-files-title">Processed Files</h2>

        {success && <div className="success-message">{success}</div>}
        {error && <div className="error-message">{error}</div>}

        {renderBreadcrumb()}
        
        {renderSearchAndFilters()}

        <div className="folder-management">
          <button 
            className="create-folder-button"
            onClick={() => setShowNewFolderForm(!showNewFolderForm)}
          >
            + Create New Folder
          </button>
          
          {showNewFolderForm && (
            <form className="new-folder-form" onSubmit={handleCreateFolder}>
              <input
                type="text"
                placeholder="Folder name"
                value={newFolderName}
                onChange={(e) => setNewFolderName(e.target.value)}
              />
              <button type="submit">Create</button>
              <button 
                type="button" 
                className="cancel"
                onClick={() => setShowNewFolderForm(false)}
              >
                Cancel
              </button>
            </form>
          )}
        </div>

        {renderFolders()}

        {visibleFiles.length === 0 ? (
          <p className="no-files">
            {searchTerm || fileTypeFilter ? 'No files match your search criteria.' : 'No files in this location.'}
          </p>
        ) : (
          <>
            {renderBulkActionToolbar()}
            <div className="files-list">
              {visibleFiles.map(file => (
                <div key={file._id} className="file-item">
                  <div className="file-selection">
                    <input 
                      type="checkbox"
                      checked={selectedFiles.includes(file._id)}
                      onChange={() => toggleFileSelection(file._id)}
                    />
                  </div>
                  <div className="file-info">
                    <div className="file-icon-name">
                      <span className="file-icon">{getFileExtensionIcon(file.fileType)}</span>
                      <h4>{file.originalName}</h4>
                    </div>
                    <p className="file-meta">
                      {formatFileSize(file.fileSize)} • {formatDate(file.processedAt)} • 
                      <span className="file-type-badge">
                        {file.fileType.replace('.', '').toUpperCase()}
                      </span>
                    </p>
                  </div>
                  <div className="file-actions">
                    <div className="version-actions">
                      <h5>Highlighted:</h5>
                      <button onClick={() => handleViewFile(file.highlightedVersion)}>View</button>
                      <button onClick={() => handleDownloadFile(file.highlightedVersion)}>Download</button>
                    </div>
                    <div className="version-actions">
                      <h5>Masked:</h5>
                      <button onClick={() => handleViewFile(file.maskedVersion)}>View</button>
                      <button onClick={() => handleDownloadFile(file.maskedVersion)}>Download</button>
                    </div>
                    <button
                      className="move-button"
                      onClick={() => {
                        setSelectedFileId(file._id);
                        setShowMoveModal(true);
                      }}
                    >
                      Move
                    </button>
                    <button
                      className="delete-button"
                      onClick={() => handleDeleteFile(file._id)}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Move file modal */}
      {showMoveModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Move to Folder</h3>
            <div className="folder-select">
              <select 
                value={selectedFolderId || ''} 
                onChange={(e) => setSelectedFolderId(e.target.value)}
              >
                <option value="">None (Root Level)</option>
                {folders.map(folder => (
                  <option key={folder._id} value={folder._id}>
                    {folder.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="modal-actions">
              <button onClick={handleMoveFile}>Move</button>
              <button 
                className="cancel" 
                onClick={() => {
                  setShowMoveModal(false);
                  setSelectedFileId(null);
                  setSelectedFolderId(null);
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bulk move modal */}
      {showBulkMoveModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Move {selectedFiles.length} File(s) to Folder</h3>
            <div className="folder-select">
              <select 
                value={selectedFolderId || ''} 
                onChange={(e) => setSelectedFolderId(e.target.value)}
              >
                <option value="">None (Root Level)</option>
                {folders.map(folder => (
                  <option key={folder._id} value={folder._id}>
                    {folder.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="modal-actions">
              <button onClick={handleBulkMove}>Move</button>
              <button 
                className="cancel" 
                onClick={() => {
                  setShowBulkMoveModal(false);
                  setSelectedFolderId(null);
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ProcessedFiles; 