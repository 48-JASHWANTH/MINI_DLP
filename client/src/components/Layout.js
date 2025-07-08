import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import MenuBar from './MenuBar';
import PatternForm from './PatternForm';
import PatternList from './PatternList';
import DocumentScanner from './DocumentScanner';
import UserProfile from './UserProfile';
import ProcessedFiles from './ProcessedFiles';
import Dashboard from './Dashboard';
import AboutMiniDLP from './AboutMiniDLP';
import TalkToPDF from './TalkToPDF';
import './Layout.css';

function Layout({ setIsAuthenticated }) {
  const [activeView, setActiveView] = useState('dashboard');
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const savedMode = localStorage.getItem('darkMode');
    return savedMode !== null ? JSON.parse(savedMode) : true;
  });
  const [patternRefreshTrigger, setPatternRefreshTrigger] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is authenticated
    const userInfo = localStorage.getItem('user-info');
    if (!userInfo) {
      navigate('/login');
    }
  }, [navigate]);

  useEffect(() => {
    localStorage.setItem('darkMode', JSON.stringify(isDarkMode));
  }, [isDarkMode]);

  const handleDashboardClick = () => {
    setActiveView('dashboard');
  };

  const handleFileUploadClick = () => {
    setActiveView('fileUpload');
  };

  const handleNewPatternClick = () => {
    setActiveView('newPattern');
  };
  
  const handleProcessedFilesClick = () => {
    setActiveView('processedFiles');
  };
  
  const handleProfileClick = () => {
    setActiveView('profile');
  };
  
  const handleAboutClick = () => {
    setActiveView('about');
  };
  
  const handleTalkToPdfClick = () => {
    setActiveView('talkToPdf');
  };

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
  };
  
  const handlePatternAdded = () => {
    // Trigger a refresh of the pattern list
    setPatternRefreshTrigger(prev => prev + 1);
  };

  const renderContent = () => {
    if (activeView === 'dashboard') {
      return <Dashboard />;
    } else if (activeView === 'fileUpload') {
      return <DocumentScanner />;
    } else if (activeView === 'profile') {
      return <UserProfile />;
    } else if (activeView === 'processedFiles') {
      return <ProcessedFiles />;
    } else if (activeView === 'about') {
      return <AboutMiniDLP />;
    } else if (activeView === 'talkToPdf') {
      return <TalkToPDF />;
    }
    return (
      <div className="pattern-management">
        <PatternForm 
          onPatternAdded={handlePatternAdded} 
        />
        <PatternList 
          refreshTrigger={patternRefreshTrigger} 
        />
      </div>
    );
  };

  return (
    <div className={`app ${isDarkMode ? 'dark' : ''}`}>
      <MenuBar 
        onDashboardClick={handleDashboardClick}
        onFileUploadClick={handleFileUploadClick}
        onNewPatternClick={handleNewPatternClick}
        onProcessedFilesClick={handleProcessedFilesClick}
        onProfileClick={handleProfileClick}
        onAboutClick={handleAboutClick}
        onTalkToPdfClick={handleTalkToPdfClick}
        setIsAuthenticated={setIsAuthenticated}
      />

      <main className="main-content">
        <div className="content-wrapper">
          {renderContent()}
        </div>
      </main>
    </div>
  );
}

export default Layout; 