import React, { useState } from 'react';
import { addUserPattern } from '../api';
import './PatternForm.css';
import LoadingAnimation from './LoadingAnimation';

function PatternForm({ onPatternAdded }) {
  const [name, setName] = useState('');
  const [pattern, setPattern] = useState('');
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
        requiresValidation: true // Always set to true by default
      });
      
      setSuccess('Pattern saved successfully!');
      setName('');
      setPattern('');
      
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
    <div className="pattern-form-container">
      {loading && <LoadingAnimation message="Saving pattern..." />}
      <h2 className="section-title"><i className="fas fa-plus-circle"></i> Create New Pattern</h2>
      
      {error && <div className="error-message"><i className="fas fa-exclamation-circle"></i> {error}</div>}
      {success && <div className="success-message"><i className="fas fa-check-circle"></i> {success}</div>}
      
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label><i className="fas fa-tag"></i> Pattern Name:</label>
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
          <label><i className="fas fa-code"></i> Regex Pattern:</label>
          <input 
            type="text" 
            value={pattern} 
            onChange={(e) => setPattern(e.target.value)} 
            required 
            disabled={loading}
            placeholder="e.g., \d{4}-\d{4}-\d{4}-\d{4}"
          />
          <p className="hint"><i className="fas fa-info-circle"></i> Use regular expressions to define your pattern. Validation will be automatically applied.</p>
        </div>
        
        <button 
          type="submit" 
          className="btn btn-primary" 
          disabled={loading}
        >
          {loading ? <><i className="fas fa-spinner fa-spin"></i> Saving...</> : <><i className="fas fa-save"></i> Save Pattern</>}
        </button>
      </form>
    </div>
  );
}

export default PatternForm;