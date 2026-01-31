// Authentication management
class AuthManager {
    constructor() {
        this.currentUser = null;
        this.authToken = localStorage.getItem('authToken');
        this.initializeAuth();
    }

    // Initialize authentication state
    initializeAuth() {
        if (this.authToken) {
            this.loadUserFromToken();
        }
        this.updateAuthUI();
    }

    // Load user info from stored token
    async loadUserFromToken() {
        try {
            const response = await api.getUserProfile();
            this.currentUser = response.user;
            this.updateAuthUI();
        } catch (error) {
            console.error('Failed to load user profile:', error);
            this.logout(); // Token might be invalid
        }
    }

    // Login user
    async login(email, password) {
        try {
            const response = await api.login({ email, password });
            
            this.authToken = response.token;
            this.currentUser = response.user;
            
            localStorage.setItem('authToken', this.authToken);
            localStorage.setItem('user', JSON.stringify(this.currentUser));
            
            this.updateAuthUI();
            this.showToast('Login successful!', 'success');
            
            return response;
        } catch (error) {
            this.showToast(error.message || 'Login failed', 'error');
            throw error;
        }
    }

    // Register new user
    async register(username, email, password) {
        try {
            const response = await api.register({ username, email, password });
            
            this.authToken = response.token;
            this.currentUser = response.user;
            
            localStorage.setItem('authToken', this.authToken);
            localStorage.setItem('user', JSON.stringify(this.currentUser));
            
            this.updateAuthUI();
            this.showToast('Registration successful!', 'success');
            
            return response;
        } catch (error) {
            this.showToast(error.message || 'Registration failed', 'error');
            throw error;
        }
    }

    // Logout user
    logout() {
        this.authToken = null;
        this.currentUser = null;
        
        localStorage.removeItem('authToken');
        localStorage.removeItem('user');
        
        this.updateAuthUI();
        this.showToast('Logged out successfully', 'success');
        
        // Reload tasks to show public tasks only
        if (window.taskManager) {
            window.taskManager.loadTasks();
        }
    }

    // Check if user is authenticated
    isAuthenticated() {
        return this.authToken && this.currentUser;
    }

    // Get current user
    getCurrentUser() {
        return this.currentUser;
    }

    // Update authentication UI
    updateAuthUI() {
        const loginBtn = document.getElementById('login-btn');
        const registerBtn = document.getElementById('register-btn');
        const logoutBtn = document.getElementById('logout-btn');
        const userInfo = document.getElementById('user-info');

        if (this.isAuthenticated()) {
            loginBtn.classList.add('hidden');
            registerBtn.classList.add('hidden');
            logoutBtn.classList.remove('hidden');
            userInfo.classList.remove('hidden');
            userInfo.textContent = `Welcome, ${this.currentUser.username}!`;
        } else {
            loginBtn.classList.remove('hidden');
            registerBtn.classList.remove('hidden');
            logoutBtn.classList.add('hidden');
            userInfo.classList.add('hidden');
            userInfo.textContent = '';
        }
    }

    // Show toast notification
    showToast(message, type = 'info') {
        if (window.showToast) {
            window.showToast(message, type);
        } else {
            console.log(`${type.toUpperCase()}: ${message}`);
        }
    }
}

// Auth modal management
class AuthModal {
    constructor(authManager) {
        this.authManager = authManager;
        this.modal = document.getElementById('auth-modal');
        this.form = document.getElementById('auth-form');
        this.isLoginMode = true;
        
        this.initializeModal();
    }

    initializeModal() {
        // Modal elements
        this.modalTitle = document.getElementById('auth-modal-title');
        this.usernameGroup = document.getElementById('username-group');
        this.submitBtn = document.getElementById('submit-auth-btn');
        this.switchLink = document.getElementById('switch-auth');
        this.switchText = document.getElementById('auth-switch-text');
        
        // Event listeners
        document.getElementById('login-btn').addEventListener('click', () => {
            this.showModal('login');
        });
        
        document.getElementById('register-btn').addEventListener('click', () => {
            this.showModal('register');
        });
        
        document.getElementById('logout-btn').addEventListener('click', () => {
            this.authManager.logout();
        });
        
        document.getElementById('close-auth-modal').addEventListener('click', () => {
            this.hideModal();
        });
        
        document.getElementById('cancel-auth-btn').addEventListener('click', () => {
            this.hideModal();
        });
        
        this.switchLink.addEventListener('click', (e) => {
            e.preventDefault();
            this.switchMode();
        });
        
        this.form.addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleSubmit();
        });
        
        // Close modal when clicking outside
        this.modal.addEventListener('click', (e) => {
            if (e.target === this.modal) {
                this.hideModal();
            }
        });
    }

    showModal(mode = 'login') {
        this.isLoginMode = mode === 'login';
        this.updateModalMode();
        this.modal.style.display = 'block';
        document.body.style.overflow = 'hidden';
        
        // Focus on first input
        setTimeout(() => {
            const firstInput = this.form.querySelector('input:not([type="hidden"])');
            if (firstInput) firstInput.focus();
        }, 100);
    }

    hideModal() {
        this.modal.style.display = 'none';
        document.body.style.overflow = '';
        this.form.reset();
    }

    switchMode() {
        this.isLoginMode = !this.isLoginMode;
        this.updateModalMode();
    }

    updateModalMode() {
        if (this.isLoginMode) {
            this.modalTitle.textContent = 'Login';
            this.usernameGroup.style.display = 'none';
            this.submitBtn.textContent = 'Login';
            this.switchText.innerHTML = 'Don\'t have an account? <a href="#" id="switch-auth">Register here</a>';
            document.getElementById('auth-username').removeAttribute('required');
        } else {
            this.modalTitle.textContent = 'Register';
            this.usernameGroup.style.display = 'block';
            this.submitBtn.textContent = 'Register';
            this.switchText.innerHTML = 'Already have an account? <a href="#" id="switch-auth">Login here</a>';
            document.getElementById('auth-username').setAttribute('required', 'required');
        }
        
        // Re-attach event listener for switch link
        document.getElementById('switch-auth').addEventListener('click', (e) => {
            e.preventDefault();
            this.switchMode();
        });
    }

    async handleSubmit() {
        const formData = new FormData(this.form);
        const email = formData.get('email');
        const password = formData.get('password');
        const username = formData.get('username');

        // Basic validation
        if (!email || !password) {
            this.showToast('Please fill in all required fields', 'error');
            return;
        }

        if (!this.isLoginMode && !username) {
            this.showToast('Please enter a username', 'error');
            return;
        }

        if (password.length < 6) {
            this.showToast('Password must be at least 6 characters long', 'error');
            return;
        }

        try {
            this.setLoading(true);
            
            if (this.isLoginMode) {
                await this.authManager.login(email, password);
            } else {
                await this.authManager.register(username, email, password);
            }
            
            this.hideModal();
            
            // Reload tasks after successful auth
            if (window.taskManager) {
                window.taskManager.loadTasks();
                window.taskManager.loadStats();
            }
        } catch (error) {
            console.error('Auth error:', error);
        } finally {
            this.setLoading(false);
        }
    }

    setLoading(loading) {
        this.submitBtn.disabled = loading;
        this.submitBtn.textContent = loading ? 'Please wait...' : 
            (this.isLoginMode ? 'Login' : 'Register');
    }

    showToast(message, type = 'info') {
        if (window.showToast) {
            window.showToast(message, type);
        } else {
            console.log(`${type.toUpperCase()}: ${message}`);
        }
    }
}

// Initialize auth when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.authManager = new AuthManager();
    window.authModal = new AuthModal(window.authManager);
});