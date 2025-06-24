import React from 'react';
import './LoadingAnimation.css';

const LoadingAnimation = ({ message = "Loading..." }) => {
  return (
    <div className="loading-container">
      <div className="loading-content">
        <div className="loading-logo">
          <svg width="80" height="80" viewBox="0 0 240 240" fill="none" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="shieldGradient" x1="120" y1="0" x2="120" y2="240" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#4CD6FF" />
                <stop offset="100%" stopColor="#0A1626" />
              </linearGradient>
              <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="4" result="blur" />
                <feFlood floodColor="#4CD6FF" floodOpacity="0.7" result="color"/>
                <feComposite in="color" in2="blur" operator="in" result="glow"/>
                <feMerge>
                  <feMergeNode in="glow"/>
                  <feMergeNode in="SourceGraphic"/>
                </feMerge>
              </filter>
            </defs>
            <path className="shield-path" d="M120 20L40 60V140C40 178.66 75.82 213.78 120 230C164.18 213.78 200 178.66 200 140V60L120 20Z" 
              fill="url(#shieldGradient)" 
              stroke="#4CD6FF" 
              strokeWidth="6" 
              filter="url(#glow)" />
            <path className="checkmark-path" d="M80 120L110 150L160 100" 
              stroke="#4CD6FF" 
              strokeWidth="8" 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              filter="url(#glow)" />
          </svg>
        </div>
        <div className="loading-pulse"></div>
        <div className="loading-message">{message}</div>
        <div className="loading-bars">
          <div className="bar"></div>
          <div className="bar"></div>
          <div className="bar"></div>
          <div className="bar"></div>
          <div className="bar"></div>
        </div>
      </div>
    </div>
  );
};

export default LoadingAnimation; 