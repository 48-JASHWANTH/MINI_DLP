import React, { useState, useEffect } from 'react';
import { getAnalytics } from '../api';
import './Dashboard.css';
import LoadingAnimation from './LoadingAnimation';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, ArcElement, PointElement, LineElement, Title, Tooltip, Legend, RadialLinearScale } from 'chart.js';
import { Bar, Pie, PolarArea, Line } from 'react-chartjs-2';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  PointElement,
  LineElement,
  RadialLinearScale,
  Title,
  Tooltip,
  Legend
);

const Dashboard = () => {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Chart options
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          color: '#f3f4f6',
          font: {
            size: 11
          }
        }
      },
      tooltip: {
        backgroundColor: 'rgba(17, 24, 39, 0.8)',
        titleColor: '#f3f4f6',
        bodyColor: '#f3f4f6',
        borderColor: '#4f46e5',
        borderWidth: 1,
        padding: 10,
        displayColors: true,
        usePointStyle: true
      }
    }
  };

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

  // Function to get file type icon
  const getFileTypeIcon = (fileType) => {
    if (!fileType) return '📄';
    const type = fileType.toLowerCase();
    if (type.includes('pdf')) return '📕';
    if (type.includes('doc') || type.includes('word')) return '📘';
    if (type.includes('xls') || type.includes('sheet')) return '📗';
    if (type.includes('ppt') || type.includes('presentation')) return '📙';
    if (type.includes('jpg') || type.includes('jpeg') || type.includes('png') || type.includes('image')) return '🖼️';
    if (type.includes('txt') || type.includes('text')) return '📝';
    return '📄';
  };

  if (loading) {
    return <LoadingAnimation message="Loading analytics dashboard..." />;
  }

  if (error) {
    return (
      <div className="dlp-dashboard__container dlp-dashboard__error">
        <div className="dlp-dashboard__error-icon">
          <i className="fas fa-exclamation-triangle"></i>
        </div>
        <p>{error}</p>
        <button 
          onClick={() => window.location.reload()} 
          className="dlp-dashboard__retry-button"
        >
          Try Again
        </button>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="dlp-dashboard__container dlp-dashboard__error">
        <div className="dlp-dashboard__error-icon">
          <i className="fas fa-exclamation-circle"></i>
        </div>
        <p>No analytics data available</p>
        <button 
          onClick={() => window.location.reload()} 
          className="dlp-dashboard__retry-button"
        >
          Refresh Data
        </button>
      </div>
    );
  }

  // Prepare data for charts
  // File type distribution chart
  const fileTypeData = {
    labels: Object.keys(analytics.fileTypeDistribution || {}),
    datasets: [
      {
        label: 'File Types',
        data: Object.values(analytics.fileTypeDistribution || {}),
        backgroundColor: [
          'rgba(255, 99, 132, 0.8)',
          'rgba(54, 162, 235, 0.8)',
          'rgba(255, 206, 86, 0.8)',
          'rgba(75, 192, 192, 0.8)',
          'rgba(153, 102, 255, 0.8)',
          'rgba(255, 159, 64, 0.8)',
        ],
        borderColor: [
          'rgba(255, 99, 132, 1)',
          'rgba(54, 162, 235, 1)',
          'rgba(255, 206, 86, 1)',
          'rgba(75, 192, 192, 1)',
          'rgba(153, 102, 255, 1)',
          'rgba(255, 159, 64, 1)',
        ],
        borderWidth: 1,
      },
    ],
  };

  // Monthly data chart
  const sortedMonths = Object.keys(analytics.processedByMonth || {}).sort();
  const monthlyData = {
    labels: sortedMonths,
    datasets: [
      {
        label: 'Documents Processed',
        data: sortedMonths.map(month => analytics.processedByMonth[month]),
        backgroundColor: 'rgba(75, 192, 192, 0.6)',
        borderColor: 'rgba(75, 192, 192, 1)',
        borderWidth: 1,
        fill: true,
        tension: 0.4,
      },
    ],
  };

  // Risk distribution chart
  const riskData = {
    labels: Object.keys(analytics.riskDistribution || {}),
    datasets: [
      {
        label: 'Risk Distribution',
        data: Object.values(analytics.riskDistribution || {}),
        backgroundColor: [
          'rgba(255, 99, 132, 0.8)',  // High - Red
          'rgba(255, 206, 86, 0.8)',  // Medium - Yellow
          'rgba(75, 192, 192, 0.8)',  // Low - Green
          'rgba(153, 102, 255, 0.8)', // Others - Purple
        ],
      },
    ],
  };

  // Top patterns chart
  const patternData = {
    labels: Object.keys(analytics.topDetectedPatterns || {}),
    datasets: [
      {
        label: 'Detection Count',
        data: Object.values(analytics.topDetectedPatterns || {}),
        backgroundColor: [
          'rgba(255, 99, 132, 0.7)',
          'rgba(54, 162, 235, 0.7)',
          'rgba(255, 206, 86, 0.7)',
          'rgba(75, 192, 192, 0.7)',
          'rgba(153, 102, 255, 0.7)',
          'rgba(255, 159, 64, 0.7)',
        ],
      },
    ],
  };

  return (
    <div className="dlp-dashboard__container">
      <h1 className="dlp-dashboard__title">Dashboard & Analytics</h1>
      
      <div className="dlp-dashboard__stats">
        <div className="dlp-dashboard__stat-card">
          <div className="dlp-dashboard__stat-icon">
            <i className="fas fa-file-alt"></i>
          </div>
          <div className="dlp-dashboard__stat-content">
            <div className="dlp-dashboard__stat-value">{analytics.totalDocuments || 0}</div>
            <div className="dlp-dashboard__stat-label">Total Documents</div>
          </div>
        </div>

        <div className="dlp-dashboard__stat-card">
          <div className="dlp-dashboard__stat-icon">
            <i className="fas fa-search"></i>
          </div>
          <div className="dlp-dashboard__stat-content">
            <div className="dlp-dashboard__stat-value">{analytics.totalPatterns || 0}</div>
            <div className="dlp-dashboard__stat-label">Custom Patterns</div>
          </div>
        </div>

        <div className="dlp-dashboard__stat-card">
          <div className="dlp-dashboard__stat-icon">
            <i className="fas fa-database"></i>
          </div>
          <div className="dlp-dashboard__stat-content">
            <div className="dlp-dashboard__stat-value">{formatBytes(analytics.totalStorageUsed || 0)}</div>
            <div className="dlp-dashboard__stat-label">Storage Used</div>
          </div>
        </div>

        <div className="dlp-dashboard__stat-card">
          <div className="dlp-dashboard__stat-icon">
            <i className="fas fa-file-medical-alt"></i>
          </div>
          <div className="dlp-dashboard__stat-content">
            <div className="dlp-dashboard__stat-value">{formatBytes(analytics.averageFileSize || 0)}</div>
            <div className="dlp-dashboard__stat-label">Avg. File Size</div>
          </div>
        </div>
      </div>

      <div className="dlp-dashboard__charts-grid">
        {/* File Type Distribution Chart */}
        <div className="dlp-dashboard__chart-card">
          <h2 className="dlp-dashboard__chart-title">File Types Distribution</h2>
          <div className="dlp-dashboard__chart-container">
            <Pie data={fileTypeData} options={chartOptions} />
          </div>
        </div>

        {/* Monthly Processing Chart */}
        <div className="dlp-dashboard__chart-card">
          <h2 className="dlp-dashboard__chart-title">Documents Processed By Month</h2>
          <div className="dlp-dashboard__chart-container">
            <Line data={monthlyData} options={chartOptions} />
          </div>
        </div>

        {/* Risk Distribution Chart */}
        <div className="dlp-dashboard__chart-card">
          <h2 className="dlp-dashboard__chart-title">Risk Level Distribution</h2>
          <div className="dlp-dashboard__chart-container">
            <PolarArea data={riskData} options={chartOptions} />
          </div>
        </div>

        {/* Top Detected Patterns */}
        <div className="dlp-dashboard__chart-card">
          <h2 className="dlp-dashboard__chart-title">Top Detected Patterns</h2>
          <div className="dlp-dashboard__chart-container">
            <Bar data={patternData} options={chartOptions} />
          </div>
        </div>
      </div>

      {/* Recent Files Section */}
      <div className="dlp-dashboard__recent-files">
        <h2 className="dlp-dashboard__section-title">Recent Files</h2>
        {analytics.recentFiles && analytics.recentFiles.length > 0 ? (
          <div className="dlp-dashboard__table-container">
            <table className="dlp-dashboard__table">
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
                    <td>
                      <span className="dlp-dashboard__file-icon">{getFileTypeIcon(file.type)}</span>
                      {file.name}
                    </td>
                    <td>{file.type}</td>
                    <td>{formatBytes(file.size)}</td>
                    <td>{formatDate(file.date)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="dlp-dashboard__no-data">
            <p>No recent files</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard; 