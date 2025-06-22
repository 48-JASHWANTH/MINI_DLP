import React from 'react';
import { useNavigate } from "react-router-dom";
import './PageNotFound.css';

function PageNotFound() {
  const navigate = useNavigate();
  
  return (
    <div className="not-found-container">
      <div className="bottom-shape"></div>
      <div className="not-found-content">
        <h1 className="not-found-title">404</h1>
        <h2 className="not-found-subtitle">Page not found</h2>
        <p className="not-found-text">
          The page you are looking for<br />doesn't exist.
        </p>
        <button 
          className="not-found-button"
          onClick={() => navigate('/login')}
        >
          Back to Login
        </button>
      </div>
    </div>
  );
}

export default PageNotFound;