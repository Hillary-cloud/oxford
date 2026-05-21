import axios from 'axios';
window.axios = axios;

window.axios.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest';

/**
 * Global Response Interceptor
 * Handles 401 (Unauthorized), 403 (Forbidden), and 419 (Page Expired) errors
 * by forcing a page reload/redirect to login.
 */
window.axios.interceptors.response.use(
    response => response,
    error => {
        const status = error.response ? error.response.status : null;

        if (status === 401 || status === 403 || status === 419) {
            // Prevent infinite loops if already on login page
            if (!window.location.pathname.includes('/login')) {
                window.location.href = '/login';
            }
        }

        return Promise.reject(error);
    }
);
