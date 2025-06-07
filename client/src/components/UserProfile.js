import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './UserProfile.css';

function UserProfile({ isDarkMode }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    phoneNumber: '',
    organization: ''
  });
  const [files, setFiles] = useState([]);
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchUserProfile();
    fetchUserFiles();
  }, []);

  const fetchUserProfile = async () => {
    try {
      setLoading(true);
      const userInfo = JSON.parse(localStorage.getItem('user-info'));
      if (!userInfo) {
        setError('User not authenticated');
        setLoading(false);
        return;
      }

      const response = await axios.get('http://localhost:9643/user/profile', {
        headers: {
          Authorization: `Bearer ${userInfo.token}`
        }
      });

      setUser(response.data.user);
      setFormData({
        name: response.data.user.name || '',
        phoneNumber: response.data.user.phoneNumber || '',
        organization: response.data.user.organization || ''
      });
      setLoading(false);
    } catch (err) {
      console.error('Error fetching profile:', err);
      setError('Failed to load user profile');
      setLoading(false);
    }
  };

  const fetchUserFiles = async () => {
    try {
      const userInfo = JSON.parse(localStorage.getItem('user-info'));
      if (!userInfo) return;

      const response = await axios.get('http://localhost:9643/user/files', {
        headers: {
          Authorization: `Bearer ${userInfo.token}`
        }
      });

      setFiles(response.data.files);
    } catch (err) {
      console.error('Error fetching files:', err);
    }
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const userInfo = JSON.parse(localStorage.getItem('user-info'));

      const response = await axios.put('http://localhost:9643/user/profile', formData, {
        headers: {
          Authorization: `Bearer ${userInfo.token}`
        }
      });

      setUser(response.data.user);
      setIsEditing(false);
      setSuccess('Profile updated successfully');
      setTimeout(() => setSuccess(''), 3000);
      setLoading(false);
    } catch (err) {
      console.error('Error updating profile:', err);
      setError('Failed to update profile');
      setLoading(false);
    }
  };

  const handleDeleteFile = async (fileId) => {
    if (!window.confirm('Are you sure you want to delete this file?')) return;
    
    try {
      const userInfo = JSON.parse(localStorage.getItem('user-info'));
      
      await axios.delete(`http://localhost:9643/user/files/${fileId}`, {
        headers: {
          Authorization: `Bearer ${userInfo.token}`
        }
      });
      
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

  const handleViewFile = (filename) => {
    window.open(`http://localhost:9643/api/view/${filename}`, '_blank');
  };

  const handleDownloadFile = (filename) => {
    window.location.href = `http://localhost:9643/api/download/${filename}`;
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

  if (loading && !user) {
    return (
      <div className={`profile-container ${isDarkMode ? 'dark' : ''}`}>
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Loading profile...</p>
        </div>
      </div>
    );
  }

  if (error && !user) {
    return (
      <div className={`profile-container ${isDarkMode ? 'dark' : ''}`}>
        <div className="error-message">
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`profile-container ${isDarkMode ? 'dark' : ''}`}>
      <div className="profile-card">
        <h2 className="profile-title">User Profile</h2>

        {success && <div className="success-message">{success}</div>}
        {error && <div className="error-message">{error}</div>}

        <div className="profile-header">
          {user?.image && (
            <div className="profile-image">
              <img src={user.image} alt={user.name} />
            </div>
          )}
          <div className="profile-info">
            {!isEditing ? (
              <>
                <h3>{user?.name}</h3>
                <p className="profile-email">{user?.email}</p>
                <p>{user?.phoneNumber || 'No phone number'}</p>
                <p>{user?.organization || 'No organization'}</p>
                <button className="edit-button" onClick={() => setIsEditing(true)}>
                  Edit Profile
                </button>
              </>
            ) : (
              <form onSubmit={handleSubmit} className="profile-form">
                <div className="form-group">
                  <label>Name</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Phone Number</label>
                  <input
                    type="text"
                    name="phoneNumber"
                    value={formData.phoneNumber}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="form-group">
                  <label>Organization</label>
                  <input
                    type="text"
                    name="organization"
                    value={formData.organization}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="form-buttons">
                  <button type="submit" className="save-button">
                    Save
                  </button>
                  <button
                    type="button"
                    className="cancel-button"
                    onClick={() => {
                      setIsEditing(false);
                      setFormData({
                        name: user?.name || '',
                        phoneNumber: user?.phoneNumber || '',
                        organization: user?.organization || ''
                      });
                    }}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>

        <div className="files-section">
          <h3 className="files-title">Processed Files</h3>
          
          {files.length === 0 ? (
            <p className="no-files">No processed files yet.</p>
          ) : (
            <div className="files-list">
              {files.map(file => (
                <div key={file._id} className="file-item">
                  <div className="file-info">
                    <h4>{file.originalName}</h4>
                    <p className="file-meta">
                      {formatFileSize(file.fileSize)} • {formatDate(file.processedAt)}
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
                      className="delete-button"
                      onClick={() => handleDeleteFile(file._id)}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default UserProfile; 