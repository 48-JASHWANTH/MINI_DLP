import axios from "axios";

export const apiClient = axios.create({
    baseURL: "https://mini-dlp-backend.onrender.com"
});
