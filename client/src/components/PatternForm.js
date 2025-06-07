import React, { useState } from 'react';
import { addUserPattern } from '../api';
import './PatternForm.css';

function PatternForm({ isDarkMode, onPatternAdded }) {
  const [name, setName] = useState('');
  const [pattern, setPattern] = useState('');
  const [requiresValidation, setRequiresValidation] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);
    
    try {
      const userInfo = JSON.parse(localStorage.getItem('user-info'));
      if (!userInfo || !userInfo.token) {
        throw new Error('You must be logged in to add custom patterns');
      }
      
      await addUserPattern(userInfo.token, { 
        name, 
        pattern,
        requiresValidation 
      });
      
      setSuccess('Pattern saved successfully!');
      setName('');
      setPattern('');
      setRequiresValidation(false);
      
      // Notify parent component to refresh pattern list
      if (onPatternAdded) {
        onPatternAdded();
      }
    } catch (error) {
      console.error('Error saving pattern:', error);
      setError(error.response?.data?.error || 'Error saving pattern');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`pattern-form-card ${isDarkMode ? 'dark' : ''}`}>
      <h2 className="card-title">Add New Pattern</h2>
      
      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">{success}</div>}
      
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Pattern Name:</label>
          <input 
            type="text" 
            value={name} 
            onChange={(e) => setName(e.target.value)} 
            required 
            disabled={loading}
            placeholder="e.g., CreditCard, SSN, CustomID"
          />
        </div>
        
        <div className="form-group">
          <label>Regex Pattern:</label>
          <input 
            type="text" 
            value={pattern} 
            onChange={(e) => setPattern(e.target.value)} 
            required 
            disabled={loading}
            placeholder="e.g., \d{4}-\d{4}-\d{4}-\d{4}"
          />
          <p className="hint">Use regular expressions to define your pattern</p>
        </div>
        
        <div className="form-group checkbox-group">
          <label className="checkbox-label">
            <input 
              type="checkbox" 
              checked={requiresValidation} 
              onChange={(e) => setRequiresValidation(e.target.checked)} 
              disabled={loading}
            />
            Requires Validation
          </label>
          <p className="hint">Enable to apply validation checks for this pattern type</p>
        </div>
        
        <button 
          type="submit" 
          className="btn btn-primary" 
          disabled={loading}
        >
          {loading ? 'Saving...' : 'Save Pattern'}
        </button>
      </form>
    </div>
  );
}

export default PatternForm;