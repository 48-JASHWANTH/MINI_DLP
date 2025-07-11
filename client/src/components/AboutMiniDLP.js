import React, { useState } from 'react';
import './AboutMiniDLP.css';

function AboutMiniDLP() {
  const [activeTab, setActiveTab] = useState('overview');

  // Feature data with descriptions and usage instructions
  const features = [
    {
      id: 'document-scanning',
      icon: 'fa-search',
      title: 'Document Scanner',
      description: 'The Document Scanner identifies sensitive information across various file formats including PDF, DOCX, XLSX, and plain text files.',
      usage: [
        'Upload a file using the file uploader or paste text directly into the text area',
        'Click the "Scan Document" button to initiate the scan',
        'Review identified patterns in the results section',
        'Save processed files with highlighted and masked versions of your document'
      ],
      benefit: 'Quickly identify sensitive information before sharing documents, preventing accidental data exposure.'
    },
    {
      id: 'custom-patterns',
      icon: 'fa-fingerprint',
      title: 'Custom Pattern Management',
      description: 'Create and manage your own custom patterns to detect organization-specific sensitive information.',
      usage: [
        'Navigate to the Pattern Management section',
        'Click "Add New Pattern" to create a custom detection rule',
        'Enter a descriptive name and a regular expression pattern',
        'Test your pattern with sample text before saving',
        'Enable or disable patterns as needed'
      ],
      benefit: 'Tailor detection to your specific needs with customized pattern recognition rules.'
    },
    {
      id: 'file-management',
      icon: 'fa-folder-open',
      title: 'Document Organization',
      description: 'Organize your scanned documents in folders for better management and quick access.',
      usage: [
        'Create folders to categorize your documents',
        'Save scanned documents to specific folders',
        'Search and filter documents by name, type, or scan results',
        'Access previously scanned documents from your dashboard'
      ],
      benefit: 'Keep track of all processed documents and maintain organized security records.'
    },
    {
      id: 'reports',
      icon: 'fa-chart-bar',
      title: 'Analytics Dashboard',
      description: 'Visualize your data protection status with comprehensive analytics on scanned documents.',
      usage: [
        'Access the Dashboard to view scan statistics',
        'Monitor the number of documents scanned over time',
        'Track the most common sensitive data types detected',
        'Generate reports for compliance documentation'
      ],
      benefit: 'Gain insights into potential data exposure risks and track security improvements over time.'
    },
    {
      id: 'pdf-interaction',
      icon: 'fa-file-pdf',
      title: 'Talk to PDF',
      description: 'Interact with your PDF documents using natural language to extract information and insights.',
      usage: [
        'Upload a PDF document to the Talk to PDF section',
        'Ask questions about the document content',
        'Receive AI-powered responses based on document context',
        'Export conversation history for documentation'
      ],
      benefit: 'Quickly extract insights from complex PDF documents without manual reading.'
    }
  ];
  
  return (
    <div className="dlp-about__container">
      <div className="dlp-about__card">
        <div className="dlp-about__header">
          <h2 className="dlp-about__title"><i className="fas fa-shield-alt"></i> About MINI-DLP</h2>
        </div>
        
        <div className="dlp-about__overview">
          <div className="dlp-about__logo-container">
            <img src="/images/mini-dlp-logo-exact.svg" alt="MINI-DLP Logo" className="dlp-about__logo" />
          </div>
          <div className="dlp-about__description">
            <h3 className="dlp-about__subtitle">Lightweight Data Loss Prevention</h3>
            <p>
              MINI-DLP is a comprehensive, educational Data Loss Prevention tool designed to detect and protect 
              sensitive information across multiple document formats. This application demonstrates how organizations can 
              identify PII (Personally Identifiable Information), financial data, and other confidential content 
              before it leaves secure environments.
            </p>
            <p>
              By providing robust scanning capabilities and visualization of potential data risks, MINI-DLP helps users 
              understand security compliance requirements like GDPR, HIPAA, and PCI DSS, while raising awareness about 
              the importance of protecting sensitive information in today's digital landscape.
            </p>
          </div>
        </div>

        {/* Feature Navigation Tabs */}
        <div className="dlp-about__nav-container">
          <div className="dlp-about__tabs">
            <button 
              className={`dlp-about__tab ${activeTab === 'overview' ? 'active' : ''}`} 
              onClick={() => setActiveTab('overview')}
            >
              <i className="fas fa-info-circle"></i> Overview
            </button>
            <button 
              className={`dlp-about__tab ${activeTab === 'features' ? 'active' : ''}`} 
              onClick={() => setActiveTab('features')}
            >
              <i className="fas fa-th-large"></i> Features
            </button>
            <button 
              className={`dlp-about__tab ${activeTab === 'usage' ? 'active' : ''}`} 
              onClick={() => setActiveTab('usage')}
            >
              <i className="fas fa-book"></i> Usage Guide
            </button>
          </div>
        </div>

        {/* Tab Content */}
        <div className="dlp-about__content">
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="dlp-about__section">
              <div className="dlp-about__highlights">
                <div className="dlp-about__highlight-item">
                  <div className="dlp-about__highlight-icon">
                    <i className="fas fa-lock"></i>
                  </div>
                  <h4>Data Protection</h4>
                  <p>Identify and secure sensitive information before it leaves your secure environment</p>
                </div>
                <div className="dlp-about__highlight-item">
                  <div className="dlp-about__highlight-icon">
                    <i className="fas fa-file-alt"></i>
                  </div>
                  <h4>Multiple Formats</h4>
                  <p>Support for PDF, DOCX, XLSX, and plain text document scanning</p>
                </div>
                <div className="dlp-about__highlight-item">
                  <div className="dlp-about__highlight-icon">
                    <i className="fas fa-user-shield"></i>
                  </div>
                  <h4>Compliance Ready</h4>
                  <p>Helps meet GDPR, HIPAA, and other regulatory requirements</p>
                </div>
              </div>
              
              <div className="dlp-about__tech-stack">
                <h3>Technology Stack</h3>
                <div className="dlp-about__tech-items">
                  <div className="dlp-about__tech-item">
                    <i className="fab fa-react"></i>
                    <span>React</span>
                  </div>
                  <div className="dlp-about__tech-item">
                    <i className="fab fa-node-js"></i>
                    <span>Node.js</span>
                  </div>
                  <div className="dlp-about__tech-item">
                    <i className="fas fa-database"></i>
                    <span>MongoDB</span>
                  </div>
                  <div className="dlp-about__tech-item">
                    <i className="fab fa-google"></i>
                    <span>Google Auth</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Features Tab */}
          {activeTab === 'features' && (
            <div className="dlp-about__section">
              <div className="dlp-about__features">
                {features.map(feature => (
                  <div className="dlp-about__feature-card" key={feature.id}>
                    <div className="dlp-about__feature-header">
                      <div className="dlp-about__feature-icon">
                        <i className={`fas ${feature.icon}`}></i>
                      </div>
                      <h3>{feature.title}</h3>
                    </div>
                    <div className="dlp-about__feature-body">
                      <p>{feature.description}</p>
                      <div className="dlp-about__feature-benefit">
                        <i className="fas fa-check-circle"></i>
                        <span>{feature.benefit}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Usage Guide Tab */}
          {activeTab === 'usage' && (
            <div className="dlp-about__section">
              <div className="dlp-about__usage-guides">
                {features.map(feature => (
                  <div className="dlp-about__usage-guide" key={feature.id}>
                    <div className="dlp-about__usage-header">
                      <i className={`fas ${feature.icon}`}></i>
                      <h3>{feature.title}</h3>
                    </div>
                    <div className="dlp-about__usage-steps">
                      <h4>How to use:</h4>
                      <ol>
                        {feature.usage.map((step, index) => (
                          <li key={index}>{step}</li>
                        ))}
                      </ol>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="dlp-about__footer">
          <div className="dlp-about__links">
            <a href="https://github.com/48-JASHWANTH/MINI_DLP" target="_blank" rel="noopener noreferrer" className="dlp-about__link">
              <i className="fab fa-github"></i> GitHub Repository
            </a>
            <a href="https://en.wikipedia.org/wiki/Data_loss_prevention_software" target="_blank" rel="noopener noreferrer" className="dlp-about__link">
              <i className="fas fa-book"></i> Learn More About DLP
            </a>
            <a href="https://owasp.org/www-community/controls/Sensitive_Data_Exposure" target="_blank" rel="noopener noreferrer" className="dlp-about__link">
              <i className="fas fa-shield-alt"></i> OWASP Security Guide
            </a>
          </div>
          <div className="dlp-about__copyright">
            <p>© {new Date().getFullYear()} MINI-DLP — Educational Data Loss Prevention Tool</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AboutMiniDLP; 