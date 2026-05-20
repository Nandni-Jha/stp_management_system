import apiService from './api.service';
import { API_ENDPOINTS } from '../config/api.config';
import { STORAGE_KEYS } from '../constants';

class AuthService {
    async login(credentials) {
        try {
            const response = await apiService.post(API_ENDPOINTS.auth.login, credentials);

            if (response.success && response.data) {
                this.setAuthData(response.data.token, response.data.user);
            }

            return response;
        } catch (error) {
            throw error;
        }
    }

    async register(userData) {
        try {
            const response = await apiService.post(API_ENDPOINTS.auth.register, userData);

            if (response.success && response.data) {
                this.setAuthData(response.data.token, response.data.user);
            }

            return response;
        } catch (error) {
            throw error;
        }
    }

    async logout() {
        try {
            await apiService.post(API_ENDPOINTS.auth.logout);
            this.clearAuthData();
        } catch (error) {
            this.clearAuthData();
            throw error;
        }
    }

    async getCurrentUser() {
        try {
            const response = await apiService.get(API_ENDPOINTS.auth.me);
            return response;
        } catch (error) {
            throw error;
        }
    }

    setAuthData(token, user) {
        localStorage.setItem(STORAGE_KEYS.TOKEN, token);
        localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
    }

    clearAuthData() {
        localStorage.removeItem(STORAGE_KEYS.TOKEN);
        localStorage.removeItem(STORAGE_KEYS.USER);
    }

    getToken() {
        return localStorage.getItem(STORAGE_KEYS.TOKEN);
    }

    getUser() {
        const user = localStorage.getItem(STORAGE_KEYS.USER);
        return user ? JSON.parse(user) : null;
    }

    isAuthenticated() {
        return !!this.getToken();
    }
}

export default new AuthService();
