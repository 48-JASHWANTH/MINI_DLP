// PatternList.js
import React, { useEffect, useState } from 'react';
import { getUserPatterns, deleteUserPattern } from '../api';
import './PatternList.css';
import LoadingAnimation from './LoadingAnimation';

function PatternList({ refreshTrigger }) {
  const [customPatterns, setCustomPatterns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  useEffect(() => {
    fetchPatterns();
  }, [refreshTrigger]); // Refetch when refreshTrigger changes

  const fetchPatterns = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const userInfo = JSON.parse(localStorage.getItem('user-info'));
      if (!userInfo || !userInfo.token) {
        throw new Error('You must be logged in to view patterns');
      }
      
      const response = await getUserPatterns(userInfo.token);
      setCustomPatterns(response.data.customPatterns || []);
    } catch (err) {
      console.error('Error fetching patterns:', err);
      setError(err.response?.data?.error || 'Error loading patterns');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (patternId) => {
    // Set confirm state to show confirmation UI
    if (deleteConfirm !== patternId) {
      setDeleteConfirm(patternId);
      return;
    }
    
    // User confirmed deletion, proceed
    try {
      setLoading(true);
      const userInfo = JSON.parse(localStorage.getItem('user-info'));
      if (!userInfo || !userInfo.token) {
        throw new Error('You must be logged in to delete patterns');
      }
      
      await deleteUserPattern(userInfo.token, patternId);
      fetchPatterns(); // Refresh patterns
      setDeleteConfirm(null);
    } catch (err) {
      console.error('Error deleting pattern:', err);
      setError(err.response?.data?.error || 'Error deleting pattern');
    } finally {
      setLoading(false);
    }
  };

  // Cancel delete confirmation
  const cancelDelete = () => {
    setDeleteConfirm(null);
  };

  if (loading && !customPatterns.length) {
    return <LoadingAnimation message="Loading patterns..." />;
  }

  return (
    <div className="pattern-list-container">
      {error && <div className="error-message"><i className="fas fa-exclamation-circle"></i> {error}</div>}
      
      <h2 className="section-title"><i className="fas fa-list"></i> Your Custom Patterns</h2>
      <div className="pattern-list">
        {customPatterns.length > 0 ? (
          customPatterns.map((pattern) => (
            <div key={pattern._id} className="pattern-item custom-pattern">
              <div className="pattern-info">
                <h3><i className="fas fa-fingerprint"></i> {pattern.name}</h3>
                <p className="pattern-text"><i className="fas fa-code"></i> {pattern.pattern}</p>
                <div className="pattern-meta">
                  <span className="pattern-badge custom"><i className="fas fa-user-edit"></i> Custom</span>
                  {pattern.requiresValidation && 
                    <span className="pattern-badge validation"><i className="fas fa-shield-alt"></i> Validation Enabled</span>
                  }
                </div>
              </div>
              <div className="pattern-actions">
                {deleteConfirm === pattern._id ? (
                  <div className="confirm-delete">
                    <span><i className="fas fa-question-circle"></i> Confirm delete?</span>
                    <button 
                      onClick={() => handleDelete(pattern._id)}
                      className="btn btn-confirm-delete"
                    >
                      <i className="fas fa-check"></i> Yes
                    </button>
                    <button 
                      onClick={cancelDelete}
                      className="btn btn-cancel-delete"
                    >
                      <i className="fas fa-times"></i> No
                    </button>
                  </div>
                ) : (
                  <button 
                    onClick={() => handleDelete(pattern._id)} 
                    className="btn btn-danger"
                    title="Delete pattern"
                  >
                    <i className="fas fa-trash"></i>
                  </button>
                )}
              </div>
            </div>
          ))
        ) : (
          <p className="no-patterns"><i className="fas fa-info-circle"></i> You haven't created any custom patterns yet.</p>
        )}
      </div>
    </div>
  );
}

export default PatternList;