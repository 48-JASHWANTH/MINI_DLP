import React, { useState, useEffect } from "react";
import { useGoogleLogin } from "@react-oauth/google";
import { googleAuth } from "../api";
import { useNavigate } from 'react-router-dom';
import "./GoogleLogin.css";
import LoadingAnimation from './LoadingAnimation';

function GoogleLogin() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isDarkMode, setIsDarkMode] = useState(true); // Default to dark mode for this design

  // Check for user preference for dark mode
  useEffect(() => {
    // Force dark mode for this specific design
    setIsDarkMode(true);
  }, []);

  const responseGoogle = async (authResult) => {
    setIsLoading(true);
    setError(null);
    
    try {
      if (authResult["code"]) {
        const result = await googleAuth(authResult["code"]);
        const { email, name, image } = result.data.user;
        const token = result.data.token;
        const obj = { email, name, image, token };
        
        localStorage.setItem("user-info", JSON.stringify(obj));
        
        // Check if this is a new or existing user (message from the server)
        const isNewUser = !result.data.isExistingUser; // Assuming backend adds this flag
        
        // Redirect to the layout page where the main app is (update this if your route differs)
        navigate('/layout');
      }
    } catch (err) {
      console.error("Error during authentication:", err);
      setError("Authentication failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };
  
  const googleLogin = useGoogleLogin({
    onSuccess: responseGoogle,
    onError: (error) => {
      console.error("Google login error:", error);
      setError("Google login failed. Please try again.");
      setIsLoading(false);
    },
    flow: "auth-code",
  });

  return (
    <div className="login-container dark">
      {/* Circuit pattern elements */}
      <div className="circuit-left"></div>
      <div className="circuit-right"></div>
      <div className="dot-grid-right"></div>
      
      <div className="login-content">
        <div className="app-title">MINI-DLP</div>
        <div className="login-subtitle">LOGIN</div>
        
        <div className="shield-icon">
          <svg viewBox="0 0 240 240" fill="none" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid meet">
            <defs>
              <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur stdDeviation="3" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
              <linearGradient id="shieldGradient" x1="120" y1="30" x2="120" y2="215" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#4CD6FF" stopOpacity="0.05" />
                <stop offset="50%" stopColor="#4CD6FF" stopOpacity="0.03" />
                <stop offset="100%" stopColor="#4CD6FF" stopOpacity="0.05" />
              </linearGradient>
              <linearGradient id="innerShieldGradient" x1="120" y1="70" x2="120" y2="185" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#4CD6FF" stopOpacity="0.08" />
                <stop offset="50%" stopColor="#4CD6FF" stopOpacity="0.05" />
                <stop offset="100%" stopColor="#4CD6FF" stopOpacity="0.08" />
              </linearGradient>
            </defs>
            
            {/* Outer Shield with fill and glow */}
            <path d="M120 30C78.5 50 60 57.25 40 70V135C40 167 73.5 196.75 120 215C166.5 196.75 200 167 200 135V70C180 57.25 161.5 50 120 30Z" 
              fill="url(#shieldGradient)"
              stroke="#4CD6FF" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" filter="url(#glow)"/>
            
            {/* Inner Shield with fill and glow */}
            <path d="M120 70C98.5 83 88 87.15 76 95V135C76 154.4 96.75 172.45 120 185C143.25 172.45 164 154.4 164 135V95C152 87.15 141.5 83 120 70Z" 
              fill="url(#innerShieldGradient)"
              stroke="#4CD6FF" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" filter="url(#glow)"/>
            
            {/* Checkmark with glow */}
            <path d="M100 135L114 149L140 123" stroke="#4CD6FF" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" filter="url(#glow)"/>
          </svg>
        </div>
        
        <div className="app-slogan">Protecting your data. Always.</div>
        
        <button 
          className="google-sign-in-btn" 
          onClick={() => {
            setIsLoading(true);
            googleLogin();
          }}
          disabled={isLoading}
        >
          <div className="google-icon">
            <svg width="18" height="18" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
          </div>
          <span className="btn-text">Sign in with Google</span>
        </button>
        
        {isLoading && <LoadingAnimation message="Authenticating..." />}
        
        {error && <p className="error-message">{error}</p>}
      </div>
    </div>
  );
}

export default GoogleLogin;
