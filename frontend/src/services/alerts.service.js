import apiService from './api.service';
import { API_ENDPOINTS } from '../config/api.config';

class AlertsService {
    async getAlerts(filters = {}) {
        try {
            const params = new URLSearchParams();

            if (filters.asset_id) params.append('asset_id', filters.asset_id);
            if (filters.alert_type) params.append('alert_type', filters.alert_type);
            if (filters.status) params.append('status', filters.status);

            const queryString = params.toString();
            const url = queryString
                ? `${API_ENDPOINTS.alerts.list}?${queryString}`
                : API_ENDPOINTS.alerts.list;

            const response = await apiService.get(url);
            return response;
        } catch (error) {
            throw error;
        }
    }

    async getAlert(id) {
        try {
            const response = await apiService.get(`${API_ENDPOINTS.alerts.show}/${id}`);
            return response;
        } catch (error) {
            throw error;
        }
    }

    async createAlert(alertData) {
        try {
            const response = await apiService.post(API_ENDPOINTS.alerts.create, alertData);
            return response;
        } catch (error) {
            throw error;
        }
    }

    async updateAlert(id, alertData) {
        try {
            const response = await apiService.put(
                `${API_ENDPOINTS.alerts.update}/${id}`,
                alertData
            );
            return response;
        } catch (error) {
            throw error;
        }
    }

    async deleteAlert(id) {
        try {
            const response = await apiService.delete(`${API_ENDPOINTS.alerts.delete}/${id}`);
            return response;
        } catch (error) {
            throw error;
        }
    }
}

export default new AlertsService();
