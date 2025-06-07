import axios from "axios";

const authApi = axios.create({
  baseURL: "http://localhost:9643/auth",
});

const userApi = axios.create({
  baseURL: "http://localhost:9643/user",
});

const patternApi = axios.create({
  baseURL: "http://localhost:9643/user-patterns",
});

const apiApi = axios.create({
  baseURL: "http://localhost:9643/api",
});

// Auth endpoints
export const googleAuth = (code) => authApi.get(`/google?code=${code}`);

// User profile endpoints
export const getUserProfile = (token) => userApi.get('/profile', {
  headers: { Authorization: `Bearer ${token}` }
});

export const updateUserProfile = (token, userData) => userApi.put('/profile', userData, {
  headers: { Authorization: `Bearer ${token}` }
});

// User files endpoints
export const getUserFiles = (token) => userApi.get('/files', {
  headers: { Authorization: `Bearer ${token}` }
});

export const deleteUserFile = (token, fileId) => userApi.delete(`/files/${fileId}`, {
  headers: { Authorization: `Bearer ${token}` }
});

// User patterns endpoints
export const getUserPatterns = (token) => patternApi.get('/', {
  headers: { Authorization: `Bearer ${token}` }
});

export const addUserPattern = (token, patternData) => patternApi.post('/', patternData, {
  headers: { Authorization: `Bearer ${token}` }
});

export const updateUserPattern = (token, patternId, patternData) => patternApi.put(`/${patternId}`, patternData, {
  headers: { Authorization: `Bearer ${token}` }
});

export const deleteUserPattern = (token, patternId) => patternApi.delete(`/${patternId}`, {
  headers: { Authorization: `Bearer ${token}` }
});

// Document scanning endpoints
export const checkText = (text, token) => apiApi.post('/check-text', { text }, {
  headers: token ? { Authorization: `Bearer ${token}` } : {}
});

export const uploadFile = (formData, token) => apiApi.post('/upload-file', formData, {
  headers: {
    'Content-Type': 'multipart/form-data',
    ...(token ? { Authorization: `Bearer ${token}` } : {})
  }
});

export const viewFile = (filename) => `http://localhost:9643/api/view/${filename}`;
export const downloadFile = (filename) => `http://localhost:9643/api/download/${filename}`;