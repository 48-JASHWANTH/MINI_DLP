import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import MenuBar from './MenuBar';
import PatternForm from './PatternForm';
import PatternList from './PatternList';
import DocumentScanner from './DocumentScanner';
import UserProfile from './UserProfile';
import './Layout.css';

function Layout({ setIsAuthenticated }) {
  const [activeView, setActiveView] = useState('fileUpload');
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

  const handleFileUploadClick = () => {
    setActiveView('fileUpload');
  };

  const handleNewPatternClick = () => {
    setActiveView('newPattern');
  };
  
  const handleProfileClick = () => {
    setActiveView('profile');
  };

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
  };
  
  const handlePatternAdded = () => {
    // Trigger a refresh of the pattern list
    setPatternRefreshTrigger(prev => prev + 1);
  };

  const renderContent = () => {
    if (activeView === 'fileUpload') {
      return <DocumentScanner isDarkMode={isDarkMode} />;
    } else if (activeView === 'profile') {
      return <UserProfile isDarkMode={isDarkMode} />;
    }
    return (
      <div className="pattern-management">
        <PatternForm 
          isDarkMode={isDarkMode} 
          onPatternAdded={handlePatternAdded} 
        />
        <PatternList 
          isDarkMode={isDarkMode} 
          refreshTrigger={patternRefreshTrigger} 
        />
      </div>
    );
  };

  return (
    <div className={`app ${isDarkMode ? 'dark' : ''}`}>
      <MenuBar 
        onFileUploadClick={handleFileUploadClick}
        onNewPatternClick={handleNewPatternClick}
        onProfileClick={handleProfileClick}
        isDarkMode={isDarkMode}
        onToggleDarkMode={toggleDarkMode}
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