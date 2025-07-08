import React, { useState, useEffect, useRef } from 'react';
import './TalkToPDF.css';
import { getUserFiles, askPdfQuestion } from '../api';
import LoadingAnimation from './LoadingAnimation';

function TalkToPDF() {
  const [files, setFiles] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [question, setQuestion] = useState('');
  const [chatHistory, setChatHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingFiles, setLoadingFiles] = useState(true);
  const [error, setError] = useState(null);
  const chatEndRef = useRef(null);

  useEffect(() => {
    fetchUserFiles();
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [chatHistory]);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchUserFiles = async () => {
    try {
      setLoadingFiles(true);
      const userInfo = JSON.parse(localStorage.getItem('user-info'));
      if (!userInfo) {
        setError('User not authenticated');
        setLoadingFiles(false);
        return;
      }

      const response = await getUserFiles(userInfo.token);
      // Filter only PDF files
      const pdfFiles = response.data.files.filter(file => 
        file.fileType === '.pdf'
      );
      setFiles(pdfFiles);
      setLoadingFiles(false);
    } catch (err) {
      console.error('Error fetching files:', err);
      setError('Failed to load files');
      setLoadingFiles(false);
    }
  };

  const handleFileSelect = (file) => {
    setSelectedFile(file);
    // Clear chat history when switching files
    setChatHistory([]);
  };

  const handleQuestionChange = (e) => {
    setQuestion(e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedFile || !question.trim()) return;

    try {
      setLoading(true);
      const userInfo = JSON.parse(localStorage.getItem('user-info'));

      // Add user question to chat history
      const userMessage = { role: 'user', content: question };
      setChatHistory(prevHistory => [...prevHistory, userMessage]);
      
      // Reset question input
      setQuestion('');

      // Call API to get answer
      const response = await askPdfQuestion(userInfo.token, selectedFile._id, question);
      
      // Add AI response to chat history
      const aiMessage = { role: 'assistant', content: response.data.answer };
      setChatHistory(prevHistory => [...prevHistory, aiMessage]);
      
      setLoading(false);
    } catch (err) {
      console.error('Error asking question:', err);
      setError('Failed to get answer');
      setLoading(false);
      
      // Add error message to chat history
      const errorMessage = { role: 'system', content: 'Failed to get answer. Please try again.' };
      setChatHistory(prevHistory => [...prevHistory, errorMessage]);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className="talk-to-pdf-container">
      <div className="talk-to-pdf-header">
        <h1>Talk to PDF</h1>
        <p>Select a PDF and ask questions about its content</p>
      </div>

      <div className="talk-to-pdf-content">
        <div className="pdf-selector">
          <h2>Select a PDF</h2>
          {loadingFiles ? (
            <LoadingAnimation message="Loading PDFs..." />
          ) : files.length === 0 ? (
            <p className="no-files-message">No PDF files found. Please upload PDFs first.</p>
          ) : (
            <div className="file-list">
              {files.map(file => (
                <div
                  key={file._id}
                  className={`file-item ${selectedFile?._id === file._id ? 'selected' : ''}`}
                  onClick={() => handleFileSelect(file)}
                >
                  <div className="file-icon">📄</div>
                  <div className="file-details">
                    <div className="file-name">{file.originalName}</div>
                    <div className="file-info">
                      <span className="file-date">{formatDate(file.createdAt)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="chat-container">
          {selectedFile ? (
            <>
              <div className="selected-file-header">
                <h2>Chatting with: {selectedFile.originalName}</h2>
              </div>
              
              <div className="chat-messages">
                {chatHistory.length === 0 && (
                  <div className="empty-chat-message">
                    <p>Ask a question about this PDF to get started.</p>
                  </div>
                )}
                
                {chatHistory.map((message, index) => (
                  <div key={index} className={`chat-message ${message.role}`}>
                    <div className="message-content">{message.content}</div>
                  </div>
                ))}
                
                {loading && (
                  <div className="chat-message system">
                    <div className="typing-indicator">
                      <span></span>
                      <span></span>
                      <span></span>
                    </div>
                  </div>
                )}
                
                <div ref={chatEndRef} />
              </div>
              
              <form className="chat-input-form" onSubmit={handleSubmit}>
                <input
                  type="text"
                  value={question}
                  onChange={handleQuestionChange}
                  placeholder="Ask a question about the PDF..."
                  disabled={loading}
                />
                <button type="submit" disabled={!question.trim() || loading}>
                  {loading ? 'Processing...' : 'Send'}
                </button>
              </form>
            </>
          ) : (
            <div className="select-file-prompt">
              <div className="prompt-content">
                <h2>Select a PDF to start chatting</h2>
                <p>Choose a PDF from the list on the left to ask questions about its content.</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default TalkToPDF; 