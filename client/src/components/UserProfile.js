import React, { useState, useEffect } from 'react';
import './UserProfile.css';
import { FaUser, FaEnvelope, FaPhone, FaCalendarAlt, FaMapMarkerAlt, FaCog, FaBuilding } from 'react-icons/fa';
import { getUserProfile, updateUserProfile } from '../api';

function UserProfile() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    phoneNumber: '',
    organization: '',
    dateOfBirth: '',
    address: ''
  });
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchUserProfile();
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

      const response = await getUserProfile(userInfo.token);

      setUser(response.data.user);
      setFormData({
        name: response.data.user.name || '',
        phoneNumber: response.data.user.phoneNumber || '',
        organization: response.data.user.organization || '',
        dateOfBirth: response.data.user.dateOfBirth || '',
        address: response.data.user.address || ''
      });
      setLoading(false);
    } catch (err) {
      console.error('Error fetching profile:', err);
      setError('Failed to load user profile');
      setLoading(false);
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

      const response = await updateUserProfile(userInfo.token, formData);

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

  if (loading && !user) {
    return (
      <div className="profile-container">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Loading profile...</p>
        </div>
      </div>
    );
  }

  if (error && !user) {
    return (
      <div className="profile-container">
        <div className="error-message">
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="profile-container">
      <div className="profile-card glow-card">
        <div className="profile-header-title">
          <FaCog className="profile-icon large-icon" />
          <h2 className="profile-title">MY ACCOUNT</h2>
        </div>

        {success && <div className="success-message">{success}</div>}
        {error && <div className="error-message">{error}</div>}

        {!isEditing ? (
          <div className="profile-details">
            <div className="profile-field">
              <div className="field-icon">
                <FaUser />
              </div>
              <div className="field-value">
                <h3>Full Name</h3>
                <p>{user?.name || 'Not provided'}</p>
              </div>
            </div>
            
            <div className="profile-field">
              <div className="field-icon">
                <FaEnvelope />
              </div>
              <div className="field-value">
                <h3>Email</h3>
                <p>{user?.email}</p>
              </div>
            </div>
            
            <div className="profile-field">
              <div className="field-icon">
                <FaPhone />
              </div>
              <div className="field-value">
                <h3>Phone Number</h3>
                <p>{user?.phoneNumber || 'Not provided'}</p>
              </div>
            </div>
            
            <div className="profile-field">
              <div className="field-icon">
                <FaCalendarAlt />
              </div>
              <div className="field-value">
                <h3>Date of Birth</h3>
                <p>{user?.dateOfBirth || 'Not provided'}</p>
              </div>
            </div>
            
            <div className="profile-field">
              <div className="field-icon">
                <FaMapMarkerAlt />
              </div>
              <div className="field-value">
                <h3>Address</h3>
                <p>{user?.address || 'Not provided'}</p>
              </div>
            </div>
            
            <button className="edit-button" onClick={() => setIsEditing(true)}>
              Edit Profile
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="profile-form">
            <div className="form-group">
              <label>
                <FaUser className="form-icon" /> Full Name
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
              />
            </div>
            
            <div className="form-group">
              <label>
                <FaEnvelope className="form-icon" /> Email
              </label>
              <input
                type="email"
                value={user?.email}
                disabled
                className="disabled-input"
              />
              <small>Email cannot be changed</small>
            </div>
            
            <div className="form-group">
              <label>
                <FaPhone className="form-icon" /> Phone Number
              </label>
              <input
                type="tel"
                name="phoneNumber"
                value={formData.phoneNumber}
                onChange={handleInputChange}
                placeholder="Enter your phone number"
              />
            </div>
            
            <div className="form-group">
              <label>
                <FaCalendarAlt className="form-icon" /> Date of Birth
              </label>
              <input
                type="date"
                name="dateOfBirth"
                value={formData.dateOfBirth}
                onChange={handleInputChange}
              />
            </div>
            
            <div className="form-group">
              <label>
                <FaMapMarkerAlt className="form-icon" /> Address
              </label>
              <textarea
                name="address"
                value={formData.address}
                onChange={handleInputChange}
                placeholder="Enter your address"
                rows={3}
              />
            </div>
            
            <div className="form-group">
              <label>
                <FaBuilding className="form-icon" /> Organization
              </label>
              <input
                type="text"
                name="organization"
                value={formData.organization}
                onChange={handleInputChange}
                placeholder="Enter your organization"
              />
            </div>
            
            <div className="form-buttons">
              <button type="submit" className="save-button">
                Save Changes
              </button>
              <button
                type="button"
                className="cancel-button"
                onClick={() => {
                  setIsEditing(false);
                  setFormData({
                    name: user?.name || '',
                    phoneNumber: user?.phoneNumber || '',
                    organization: user?.organization || '',
                    dateOfBirth: user?.dateOfBirth || '',
                    address: user?.address || ''
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
  );
}

export default UserProfile; 