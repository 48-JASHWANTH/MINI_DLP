import React from 'react';
import './AboutMiniDLP.css';

function AboutMiniDLP() {
  return (
    <div className="about-container">
      <div className="about-card">
        <div className="about-header">
          <h2 className="about-title"><i className="fas fa-shield-alt"></i> About MINI-DLP</h2>
        </div>
        
        <div className="about-content">
          <p className="about-description">
            MINI-DLP is a lightweight, educational Data Loss Prevention tool designed to detect and protect 
            sensitive information in various document formats. This project demonstrates how organizations can 
            identify PII (Personally Identifiable Information), financial data, and other confidential content 
            before it leaves secure environments. By scanning documents and providing visualization of potential 
            data risks, MINI-DLP helps users understand security compliance requirements like GDPR and HIPAA, 
            while raising awareness about the importance of protecting sensitive information in today's digital landscape.
          </p>
          
          <div className="about-links">
            <a href="https://github.com/ratnasree-patnaik/MINI-DLP" target="_blank" rel="noopener noreferrer" className="about-link">
              <i className="fab fa-github"></i> GitHub Repository
            </a>
            <a href="https://en.wikipedia.org/wiki/Data_loss_prevention_software" target="_blank" rel="noopener noreferrer" className="about-link">
              <i className="fas fa-book"></i> Learn More About DLP
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AboutMiniDLP; 