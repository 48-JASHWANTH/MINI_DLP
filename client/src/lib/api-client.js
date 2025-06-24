import axios from "axios";

export const apiClient = axios.create({
    // baseURL: "https://mini-dlp-backend.onrender.com"
    baseURL: "http://localhost:9643"
});
