import "./App.css";
import { useState, useEffect } from 'react'
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import GoogleLogin from "./components/GoogleLogin";
import PageNotFound from "./components/PageNotFound";
import RefreshHandler from "./components/RefreshHandler";
import { GoogleOAuthProvider } from "@react-oauth/google";
import Layout from "./components/Layout";

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  // Check if user is authenticated on component mount
  useEffect(() => {
    const userInfo = localStorage.getItem("user-info");
    if (userInfo) {
      setIsAuthenticated(true);
    }
    setIsLoading(false);
  }, []);

  const GoogleAuthWrapper = () => {
    // If user is already authenticated, redirect to layout
    if (isAuthenticated && !isLoading) {
      return <Navigate to="/layout" />;
    }
    
    return (
      <GoogleOAuthProvider clientId={process.env.REACT_APP_GOOGLE_CLIENT_ID}>
        <GoogleLogin />
      </GoogleOAuthProvider>
    );
  };
  
  const PrivateRoute = ({ element }) => {
    if (isLoading) {
      // You could add a loading spinner here
      return <div className="loading-app">Loading...</div>;
    }
    return isAuthenticated ? element : <Navigate to="/login" />;
  };
  
  return (
    <BrowserRouter>
      <RefreshHandler setIsAuthenticated={setIsAuthenticated} />
      <Routes>
        <Route path="/login" element={<GoogleAuthWrapper />} />
        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="/layout" element={<PrivateRoute element={<Layout setIsAuthenticated={setIsAuthenticated} />} />} />
        <Route path="*" element={<PageNotFound />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
