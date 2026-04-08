import axios from 'axios';

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'https://fix-vehicle.vercel.app/api' || 'http://localhost:5000/api',
    headers: {
        'Content-Type': 'application/json',
    },
});

export default api;
