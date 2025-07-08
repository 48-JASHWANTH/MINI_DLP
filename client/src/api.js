import { apiClient } from "./lib/api-client";

// Auth endpoints
export const googleAuth = (code) => apiClient.get(`/auth/google?code=${code}`);

// User profile endpoints
export const getUserProfile = (token) => apiClient.get('/user/profile', {
  headers: { Authorization: `Bearer ${token}` }
});

export const updateUserProfile = (token, userData) => apiClient.put('/user/profile', userData, {
  headers: { Authorization: `Bearer ${token}` }
});

// User files endpoints
export const getUserFiles = (token) => apiClient.get('/user/files', {
  headers: { Authorization: `Bearer ${token}` }
});

export const deleteUserFile = (token, fileId) => apiClient.delete(`/user/files/${fileId}`, {
  headers: { Authorization: `Bearer ${token}` }
});

export const saveProcessedFiles = (token, fileData) => apiClient.post('/user/files/save', fileData, {
  headers: { Authorization: `Bearer ${token}` }
});

export const moveUserFile = (token, fileId, folderId) => apiClient.put(`/user/files/${fileId}/move`, 
  { folderId },
  { headers: { Authorization: `Bearer ${token}` }}
);

export const bulkMoveUserFiles = (token, fileIds, folderId) => apiClient.post(`/user/files/bulk-move`, 
  { fileIds, folderId },
  { headers: { Authorization: `Bearer ${token}` }}
);

// User folders endpoints
export const getUserFolders = (token) => apiClient.get('/user/folders', {
  headers: { Authorization: `Bearer ${token}` }
});

export const createUserFolder = (token, folderData) => apiClient.post('/user/folders', folderData, {
  headers: { Authorization: `Bearer ${token}` }
});

// User patterns endpoints
export const getUserPatterns = (token) => apiClient.get('/user-patterns', {
  headers: { Authorization: `Bearer ${token}` }
});

export const addUserPattern = (token, patternData) => apiClient.post('/user-patterns', patternData, {
  headers: { Authorization: `Bearer ${token}` }
});

export const updateUserPattern = (token, patternId, patternData) => apiClient.put(`/user-patterns/${patternId}`, patternData, {
  headers: { Authorization: `Bearer ${token}` }
});

export const deleteUserPattern = (token, patternId) => apiClient.delete(`/user-patterns/${patternId}`, {
  headers: { Authorization: `Bearer ${token}` }
});

// Document scanning endpoints
export const checkText = (text, token) => apiClient.post('/api/check-text', { text }, {
  headers: token ? { Authorization: `Bearer ${token}` } : {}
});

export const uploadFile = (formData, token, folderId) => {
  // Append folderId to formData if provided
  if (folderId) {
    formData.append('folderId', folderId);
  }
  
  return apiClient.post('/api/upload-file', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    }
  });
};

// Analytics endpoint
export const getAnalytics = (token) => apiClient.get('/api/analytics', {
  headers: { Authorization: `Bearer ${token}` }
});

export const askPdfQuestion = (token, fileName, question) => apiClient.post('api/talk-to-pdf', 
  { fileName, question },
  { headers: { Authorization: `Bearer ${token}` }}
);

export const viewFile = (fileId) => `${apiClient.defaults.baseURL}/api/view/${fileId}`;
export const downloadFile = (fileId) => `${apiClient.defaults.baseURL}/api/download/${fileId}`;