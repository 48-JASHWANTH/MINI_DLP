import React, { useState, useEffect } from 'react';
import { getAnalytics } from '../api';
import './Dashboard.css';
import LoadingAnimation from './LoadingAnimation';

const Dashboard = () => {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const userInfo = JSON.parse(localStorage.getItem('user-info'));
        if (!userInfo) {
          setError('User not authenticated');
          setLoading(false);
          return;
        }

        const response = await getAnalytics(userInfo.token);
        setAnalytics(response.data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching analytics:', err);
        setError('Failed to load analytics data');
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, []);

  const formatBytes = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  // Function to get risk color
  const getRiskColor = (riskLevel) => {
    switch (riskLevel) {
      case 'High':
        return 'var(--accent-danger)';
      case 'Medium':
        return 'var(--accent-warning)';
      case 'Low':
        return 'var(--accent-success)';
      default:
        return 'var(--accent-info)';
    }
  };

  if (loading) {
    return <LoadingAnimation message="Loading analytics..." />;
  }

  if (error) {
    return (
      <div className="dashboard-container error">
        <div className="error-icon">
          <i className="fas fa-exclamation-triangle"></i>
        </div>
        <p>{error}</p>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="dashboard-container error">
        <div className="error-icon">
          <i className="fas fa-exclamation-circle"></i>
        </div>
        <p>No analytics data available</p>
      </div>
    );
  }

  // Prepare data for file type chart
  const fileTypeLabels = Object.keys(analytics.fileTypeDistribution || {});
  const fileTypeCounts = fileTypeLabels.map(label => analytics.fileTypeDistribution[label]);
  
  // Prepare data for monthly processing chart
  const monthLabels = Object.keys(analytics.processedByMonth || {}).sort();
  const monthCounts = monthLabels.map(month => analytics.processedByMonth[month]);

  // Prepare data for risk distribution chart
  const riskLabels = Object.keys(analytics.riskDistribution || {});
  const riskCounts = riskLabels.map(label => analytics.riskDistribution[label]);

  // Prepare data for pattern detection chart
  const patternLabels = Object.keys(analytics.topDetectedPatterns || {});
  const patternCounts = patternLabels.map(label => analytics.topDetectedPatterns[label]);

  return (
    <div className="dashboard-container">
      <h1 className="dashboard-title">Dashboard & Analytics</h1>
      
      <div className="dashboard-stats">
        <div className="stat-card">
          <div className="stat-icon">
            <i className="fas fa-file-alt"></i>
          </div>
          <div className="stat-content">
            <div className="stat-value">{analytics.totalDocuments || 0}</div>
            <div className="stat-label">Total Documents</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">
            <i className="fas fa-search"></i>
          </div>
          <div className="stat-content">
            <div className="stat-value">{analytics.totalPatterns || 0}</div>
            <div className="stat-label">Custom Patterns</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">
            <i className="fas fa-database"></i>
          </div>
          <div className="stat-content">
            <div className="stat-value">{formatBytes(analytics.totalStorageUsed || 0)}</div>
            <div className="stat-label">Storage Used</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">
            <i className="fas fa-file-medical-alt"></i>
          </div>
          <div className="stat-content">
            <div className="stat-value">{formatBytes(analytics.averageFileSize || 0)}</div>
            <div className="stat-label">Avg. File Size</div>
          </div>
        </div>
      </div>

      <div className="dashboard-charts-container">
        <div className="dashboard-chart">
          <h2>File Types Distribution</h2>
          <div className="chart-container">
            {fileTypeLabels.length > 0 ? (
              <div className="bar-chart">
                {fileTypeLabels.map((label, index) => (
                  <div className="bar-group" key={label}>
                    <div 
                      className="barr" 
                      style={{ 
                        height: `${(fileTypeCounts[index] / Math.max(...fileTypeCounts)) * 100}%` 
                      }}
                    >
                      <span className="bar-value">{fileTypeCounts[index]}</span>
                    </div>
                    <span className="bar-label">{label}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="no-data">
                <p>No file type data available</p>
              </div>
            )}
          </div>
        </div>

        <div className="dashboard-chart">
          <h2>Documents Processed By Month</h2>
          <div className="chart-container">
            {monthLabels.length > 0 ? (
              <div className="bar-chart">
                {monthLabels.map((label, index) => (
                  <div className="bar-group" key={label}>
                    <div 
                      className="barr" 
                      style={{ 
                        height: `${(monthCounts[index] / Math.max(...monthCounts)) * 100}%` 
                      }}
                    >
                      <span className="bar-value">{monthCounts[index]}</span>
                    </div>
                    <span className="bar-label">{label}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="no-data">
                <p>No monthly data available</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="dashboard-charts-container">
        {/* Risk Level Distribution */}
        <div className="dashboard-chart">
          <h2>Risk Level Distribution</h2>
          <div className="chart-container">
            {riskLabels.length > 0 ? (
              <div className="bar-chart">
                {riskLabels.map((label, index) => (
                  <div className="bar-group" key={label}>
                    <div 
                      className="barr" 
                      style={{ 
                        height: `${(riskCounts[index] / Math.max(...riskCounts)) * 100}%`,
                        background: getRiskColor(label)
                      }}
                    >
                      <span className="bar-value">{riskCounts[index]}</span>
                    </div>
                    <span className="bar-label">{label}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="no-data">
                <p>No risk data available</p>
              </div>
            )}
          </div>
          <div className="risk-legend">
            {riskLabels.map(label => (
              <div className="risk-legend-item" key={label}>
                <div className="risk-legend-color" style={{ backgroundColor: getRiskColor(label) }}></div>
                <div className="risk-legend-label">{label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Detected Patterns */}
        <div className="dashboard-chart">
          <h2>Top Detected Patterns</h2>
          <div className="chart-container">
            {patternLabels.length > 0 ? (
              <div className="bar-chart">
                {patternLabels.map((label, index) => (
                  <div className="bar-group" key={label}>
                    <div 
                      className="barr" 
                      style={{ 
                        height: `${(patternCounts[index] / Math.max(...patternCounts)) * 100}%` 
                      }}
                    >
                      <span className="bar-value">{patternCounts[index]}</span>
                    </div>
                    <span className="bar-label">{label}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="no-data">
                <p>No pattern detection data available</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="recent-files-section">
        <h2>Recent Files</h2>
        {analytics.recentFiles && analytics.recentFiles.length > 0 ? (
          <div className="recent-files-table-container">
            <table className="recent-files-table">
              <thead>
                <tr>
                  <th>File Name</th>
                  <th>Type</th>
                  <th>Size</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {analytics.recentFiles.map((file, index) => (
                  <tr key={index}>
                    <td>{file.name}</td>
                    <td>{file.type}</td>
                    <td>{formatBytes(file.size)}</td>
                    <td>{formatDate(file.date)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="no-data">
            <p>No recent files</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard; 