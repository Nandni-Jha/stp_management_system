import axios from 'axios';
import { API_CONFIG } from '../config/api.config';
import { STORAGE_KEYS } from '../constants';

class ApiService {
    constructor() {
        this.api = axios.create({
            baseURL: API_CONFIG.baseURL,
            timeout: API_CONFIG.timeout,
            headers: API_CONFIG.headers,
        });

        this.setupInterceptors();
    }

    setupInterceptors() {
        this.api.interceptors.request.use(
            (config) => {
                const token = localStorage.getItem(STORAGE_KEYS.TOKEN);
                if (token) {
                    config.headers.Authorization = `Bearer ${token}`;
                }
                return config;
            },
            (error) => {
                return Promise.reject(error);
            }
        );

        this.api.interceptors.response.use(
            (response) => {
                return response.data;
            },
            (error) => {
                if (error.response?.status === 401) {
                    localStorage.removeItem(STORAGE_KEYS.TOKEN);
                    localStorage.removeItem(STORAGE_KEYS.USER);
                    window.location.href = '/login';
                }

                const errorMessage = error.response?.data?.message || 'An error occurred';
                const errorDetails = error.response?.data?.errors || null;

                return Promise.reject({
                    message: errorMessage,
                    errors: errorDetails,
                    status: error.response?.status,
                });
            }
        );
    }

    get(url, config = {}) {
        return this.api.get(url, config);
    }

    post(url, data = {}, config = {}) {
        return this.api.post(url, data, config);
    }

    put(url, data = {}, config = {}) {
        return this.api.put(url, data, config);
    }

    delete(url, config = {}) {
        return this.api.delete(url, config);
    }

    patch(url, data = {}, config = {}) {
        return this.api.patch(url, data, config);
    }
}

export default new ApiService();
