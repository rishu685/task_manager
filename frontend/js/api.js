// API Configuration
const API_BASE_URL = 'http://localhost:5000/api';

// API utility functions
class API {
    constructor() {
        this.baseUrl = API_BASE_URL;
    }

    // Get auth token from localStorage
    getAuthToken() {
        return localStorage.getItem('authToken');
    }

    // Get headers with auth token if available
    getHeaders(includeAuth = false) {
        const headers = {
            'Content-Type': 'application/json',
        };

        if (includeAuth) {
            const token = this.getAuthToken();
            if (token) {
                headers['Authorization'] = `Bearer ${token}`;
            }
        }

        return headers;
    }

    // Generic request method
    async request(endpoint, options = {}) {
        const url = `${this.baseUrl}${endpoint}`;
        const config = {
            ...options,
            headers: {
                ...this.getHeaders(options.includeAuth),
                ...options.headers,
            },
        };

        try {
            const response = await fetch(url, config);
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || `HTTP error! status: ${response.status}`);
            }

            return data;
        } catch (error) {
            console.error('API request failed:', error);
            throw error;
        }
    }

    // Task API methods
    async getTasks(params = {}) {
        const queryParams = new URLSearchParams();
        
        Object.entries(params).forEach(([key, value]) => {
            if (value !== null && value !== undefined && value !== '') {
                queryParams.append(key, value);
            }
        });

        const queryString = queryParams.toString();
        const endpoint = `/tasks${queryString ? `?${queryString}` : ''}`;
        
        return this.request(endpoint, { includeAuth: true });
    }

    async getTask(id) {
        return this.request(`/tasks/${id}`, { includeAuth: true });
    }

    async createTask(taskData) {
        return this.request('/tasks', {
            method: 'POST',
            body: JSON.stringify(taskData),
            includeAuth: true,
        });
    }

    async updateTask(id, taskData) {
        return this.request(`/tasks/${id}`, {
            method: 'PUT',
            body: JSON.stringify(taskData),
            includeAuth: true,
        });
    }

    async updateTaskStatus(id, status) {
        return this.request(`/tasks/${id}/status`, {
            method: 'PATCH',
            body: JSON.stringify({ status }),
            includeAuth: true,
        });
    }

    async deleteTask(id) {
        return this.request(`/tasks/${id}`, {
            method: 'DELETE',
            includeAuth: true,
        });
    }

    async getTaskStats() {
        return this.request('/tasks/stats/summary', { includeAuth: true });
    }

    // User API methods
    async register(userData) {
        return this.request('/users/register', {
            method: 'POST',
            body: JSON.stringify(userData),
        });
    }

    async login(credentials) {
        return this.request('/users/login', {
            method: 'POST',
            body: JSON.stringify(credentials),
        });
    }

    async getUserProfile() {
        return this.request('/users/profile', { includeAuth: true });
    }

    async updateUserProfile(userData) {
        return this.request('/users/profile', {
            method: 'PUT',
            body: JSON.stringify(userData),
            includeAuth: true,
        });
    }

    async changePassword(passwordData) {
        return this.request('/users/change-password', {
            method: 'POST',
            body: JSON.stringify(passwordData),
            includeAuth: true,
        });
    }

    // Health check
    async healthCheck() {
        return this.request('/health');
    }
}

// Create global API instance
const api = new API();

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { API, api };
}