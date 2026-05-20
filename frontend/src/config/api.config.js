export const API_CONFIG = {
    baseURL: process.env.REACT_APP_API_URL || 'http://localhost:8000',
    timeout: parseInt(process.env.REACT_APP_API_TIMEOUT) || 30000,
    headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
    },
};

export const API_ENDPOINTS = {
    auth: {
        login: '/login',
        operatorLogin: '/operator-login',
        register: '/register',
        logout: '/logout',
        me: '/me',
    },
    dashboard: {
        index: '/dashboard',
    },
    alerts: {
        list: '/alerts',
        create: '/alerts',
        show: '/alerts',
        update: '/alerts',
        delete: '/alerts',
    },
};
