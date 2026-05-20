import apiService from './api.service';
import { API_ENDPOINTS } from '../config/api.config';

class DashboardService {
    async getDashboardData() {
        try {
            const response = await apiService.get(API_ENDPOINTS.dashboard.index);
            return response;
        } catch (error) {
            throw error;
        }
    }
}

export default new DashboardService();
