import React, { useState, useEffect } from "react";
import { useGoogleLogin } from "@react-oauth/google";
import { googleAuth } from "../api";
import { useNavigate } from 'react-router-dom';
import "./GoogleLogin.css";

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
            <svg viewBox="0 0 18 18" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid meet">
              <path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.615z"/>
              <path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z"/>
              <path fill="#FBBC05" d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z"/>
              <path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z"/>
            </svg>
          </div>
          <span className="btn-text">Sign in with Google</span>
        </button>
        
        {isLoading && (
          <div className="loading-spinner">
            <div className="spinner"></div>
            <p>Authenticating...</p>
          </div>
        )}
        
        {error && <p className="error-message">{error}</p>}
      </div>
    </div>
  );
}

export default GoogleLogin;
