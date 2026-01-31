// Main application logic
class TaskManager {
    constructor() {
        this.currentPage = 1;
        this.itemsPerPage = 10;
        this.currentFilters = {
            status: '',
            priority: '',
            sortBy: 'createdAt',
            sortOrder: 'desc'
        };
        this.editingTaskId = null;
        
        this.initializeApp();
    }

    // Initialize the application
    async initializeApp() {
        this.bindEventListeners();
        await this.loadTasks();
        await this.loadStats();
        this.checkApiHealth();
    }

    // Bind all event listeners
    bindEventListeners() {
        // Add task button
        document.getElementById('add-task-btn').addEventListener('click', () => {
            this.openTaskModal();
        });

        // Task form submission
        document.getElementById('task-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleTaskSubmit();
        });

        // Modal controls
        document.getElementById('close-modal').addEventListener('click', () => {
            this.closeTaskModal();
        });

        document.getElementById('cancel-btn').addEventListener('click', () => {
            this.closeTaskModal();
        });

        // Close modal when clicking outside
        document.getElementById('task-modal').addEventListener('click', (e) => {
            if (e.target === document.getElementById('task-modal')) {
                this.closeTaskModal();
            }
        });

        // Filter controls
        document.getElementById('status-filter').addEventListener('change', (e) => {
            this.currentFilters.status = e.target.value;
            this.currentPage = 1;
            this.loadTasks();
        });

        document.getElementById('priority-filter').addEventListener('change', (e) => {
            this.currentFilters.priority = e.target.value;
            this.currentPage = 1;
            this.loadTasks();
        });

        document.getElementById('sort-by').addEventListener('change', (e) => {
            this.currentFilters.sortBy = e.target.value;
            this.currentPage = 1;
            this.loadTasks();
        });

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.closeTaskModal();
                document.getElementById('auth-modal').style.display = 'none';
            }
        });
    }

    // Load tasks from API
    async loadTasks() {
        try {
            this.showLoading(true);
            
            const params = {
                page: this.currentPage,
                limit: this.itemsPerPage,
                sortBy: this.currentFilters.sortBy,
                sortOrder: this.currentFilters.sortOrder
            };

            if (this.currentFilters.status) {
                params.status = this.currentFilters.status;
            }

            if (this.currentFilters.priority) {
                params.priority = this.currentFilters.priority;
            }

            const response = await api.getTasks(params);
            this.renderTasks(response.tasks);
            this.renderPagination(response.pagination);
        } catch (error) {
            console.error('Failed to load tasks:', error);
            this.showError('Failed to load tasks. Please try again.');
            this.renderTasks([]);
        } finally {
            this.showLoading(false);
        }
    }

    // Load task statistics
    async loadStats() {
        try {
            const stats = await api.getTaskStats();
            this.renderStats(stats);
        } catch (error) {
            console.error('Failed to load stats:', error);
            // Don't show error for stats, just use defaults
            this.renderStats({
                totalTasks: 0,
                statusStats: { pending: 0, 'in-progress': 0, completed: 0 }
            });
        }
    }

    // Render tasks in the UI
    renderTasks(tasks) {
        const taskList = document.getElementById('task-list');
        
        if (tasks.length === 0) {
            taskList.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-clipboard-list"></i>
                    <h3>No tasks found</h3>
                    <p>Create your first task to get started!</p>
                </div>
            `;
            return;
        }

        taskList.innerHTML = tasks.map(task => this.createTaskHTML(task)).join('');
        
        // Bind task action listeners
        this.bindTaskActionListeners();
    }

    // Create HTML for a single task
    createTaskHTML(task) {
        const createdDate = new Date(task.createdAt).toLocaleDateString();
        const updatedDate = new Date(task.updatedAt).toLocaleDateString();
        const dueDate = task.dueDate ? new Date(task.dueDate).toLocaleDateString() : null;
        
        const tags = task.tags && task.tags.length > 0 ? 
            `<div class="task-tags">
                ${task.tags.map(tag => `<span class="tag">${this.escapeHtml(tag)}</span>`).join('')}
            </div>` : '';

        const dueDateHTML = dueDate ? 
            `<div><i class="fas fa-calendar-due"></i> Due: ${dueDate}</div>` : '';

        return `
            <div class="task-item ${task.status}" data-task-id="${task._id}">
                <div class="task-header">
                    <h3 class="task-title">${this.escapeHtml(task.title)}</h3>
                    <div class="task-meta">
                        <span class="status-badge ${task.status}">${task.status.replace('-', ' ')}</span>
                        <span class="priority-badge ${task.priority}">${task.priority}</span>
                    </div>
                </div>
                
                ${task.description ? 
                    `<p class="task-description">${this.escapeHtml(task.description)}</p>` : ''}
                
                ${tags}
                
                <div class="task-dates">
                    <div><i class="fas fa-plus"></i> Created: ${createdDate}</div>
                    <div><i class="fas fa-edit"></i> Updated: ${updatedDate}</div>
                    ${dueDateHTML}
                </div>
                
                <div class="task-actions">
                    <button class="btn btn-success btn-small status-btn" data-status="completed" title="Mark as Completed">
                        <i class="fas fa-check"></i>
                    </button>
                    <button class="btn btn-primary btn-small status-btn" data-status="in-progress" title="Mark as In Progress">
                        <i class="fas fa-play"></i>
                    </button>
                    <button class="btn btn-secondary btn-small status-btn" data-status="pending" title="Mark as Pending">
                        <i class="fas fa-pause"></i>
                    </button>
                    <button class="btn btn-primary btn-small edit-btn" title="Edit Task">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-danger btn-small delete-btn" title="Delete Task">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        `;
    }

    // Bind event listeners for task actions
    bindTaskActionListeners() {
        // Status change buttons
        document.querySelectorAll('.status-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                const taskItem = e.target.closest('.task-item');
                const taskId = taskItem.dataset.taskId;
                const newStatus = e.target.dataset.status || e.target.closest('.status-btn').dataset.status;
                this.updateTaskStatus(taskId, newStatus);
            });
        });

        // Edit buttons
        document.querySelectorAll('.edit-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                const taskItem = e.target.closest('.task-item');
                const taskId = taskItem.dataset.taskId;
                this.editTask(taskId);
            });
        });

        // Delete buttons
        document.querySelectorAll('.delete-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                const taskItem = e.target.closest('.task-item');
                const taskId = taskItem.dataset.taskId;
                this.deleteTask(taskId);
            });
        });
    }

    // Render task statistics
    renderStats(stats) {
        document.getElementById('total-tasks').textContent = stats.totalTasks || 0;
        document.getElementById('pending-tasks').textContent = stats.statusStats?.pending || 0;
        document.getElementById('progress-tasks').textContent = stats.statusStats?.['in-progress'] || 0;
        document.getElementById('completed-tasks').textContent = stats.statusStats?.completed || 0;
    }

    // Render pagination controls
    renderPagination(pagination) {
        const paginationContainer = document.getElementById('pagination');
        
        if (pagination.total <= 1) {
            paginationContainer.innerHTML = '';
            return;
        }

        let paginationHTML = `
            <button ${pagination.current === 1 ? 'disabled' : ''} 
                    onclick="taskManager.goToPage(${pagination.current - 1})">
                <i class="fas fa-chevron-left"></i> Previous
            </button>
        `;

        // Page numbers
        const startPage = Math.max(1, pagination.current - 2);
        const endPage = Math.min(pagination.total, pagination.current + 2);

        if (startPage > 1) {
            paginationHTML += `<button onclick="taskManager.goToPage(1)">1</button>`;
            if (startPage > 2) {
                paginationHTML += `<span>...</span>`;
            }
        }

        for (let i = startPage; i <= endPage; i++) {
            paginationHTML += `
                <button ${i === pagination.current ? 'class="active"' : ''} 
                        onclick="taskManager.goToPage(${i})">
                    ${i}
                </button>
            `;
        }

        if (endPage < pagination.total) {
            if (endPage < pagination.total - 1) {
                paginationHTML += `<span>...</span>`;
            }
            paginationHTML += `<button onclick="taskManager.goToPage(${pagination.total})">${pagination.total}</button>`;
        }

        paginationHTML += `
            <button ${pagination.current === pagination.total ? 'disabled' : ''} 
                    onclick="taskManager.goToPage(${pagination.current + 1})">
                Next <i class="fas fa-chevron-right"></i>
            </button>
        `;

        paginationContainer.innerHTML = paginationHTML;
    }

    // Go to specific page
    goToPage(page) {
        this.currentPage = page;
        this.loadTasks();
    }

    // Open task modal for adding/editing
    openTaskModal(task = null) {
        const modal = document.getElementById('task-modal');
        const modalTitle = document.getElementById('modal-title');
        const submitBtn = document.getElementById('submit-btn');
        const form = document.getElementById('task-form');
        
        // Reset form
        form.reset();
        this.editingTaskId = null;

        if (task) {
            // Edit mode
            modalTitle.textContent = 'Edit Task';
            submitBtn.textContent = 'Update Task';
            this.editingTaskId = task._id;
            
            // Populate form
            document.getElementById('task-title').value = task.title;
            document.getElementById('task-description').value = task.description || '';
            document.getElementById('task-status').value = task.status;
            document.getElementById('task-priority').value = task.priority;
            
            if (task.dueDate) {
                const dueDate = new Date(task.dueDate);
                const localISOTime = new Date(dueDate.getTime() - dueDate.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
                document.getElementById('task-due-date').value = localISOTime;
            }
            
            document.getElementById('task-tags').value = task.tags ? task.tags.join(', ') : '';
        } else {
            // Add mode
            modalTitle.textContent = 'Add New Task';
            submitBtn.textContent = 'Add Task';
        }

        modal.style.display = 'block';
        document.body.style.overflow = 'hidden';
        
        // Focus on title input
        setTimeout(() => {
            document.getElementById('task-title').focus();
        }, 100);
    }

    // Close task modal
    closeTaskModal() {
        const modal = document.getElementById('task-modal');
        modal.style.display = 'none';
        document.body.style.overflow = '';
        this.editingTaskId = null;
    }

    // Handle task form submission
    async handleTaskSubmit() {
        const form = document.getElementById('task-form');
        const formData = new FormData(form);
        
        const taskData = {
            title: formData.get('title').trim(),
            description: formData.get('description').trim(),
            status: formData.get('status'),
            priority: formData.get('priority'),
            dueDate: formData.get('dueDate') || null,
            tags: formData.get('tags').split(',').map(tag => tag.trim()).filter(tag => tag)
        };

        // Basic validation
        if (!taskData.title) {
            this.showToast('Please enter a task title', 'error');
            return;
        }

        try {
            this.showLoading(true);
            
            if (this.editingTaskId) {
                await api.updateTask(this.editingTaskId, taskData);
                this.showToast('Task updated successfully!', 'success');
            } else {
                await api.createTask(taskData);
                this.showToast('Task created successfully!', 'success');
            }
            
            this.closeTaskModal();
            await this.loadTasks();
            await this.loadStats();
        } catch (error) {
            console.error('Failed to save task:', error);
            this.showToast(error.message || 'Failed to save task', 'error');
        } finally {
            this.showLoading(false);
        }
    }

    // Update task status
    async updateTaskStatus(taskId, status) {
        try {
            await api.updateTaskStatus(taskId, status);
            this.showToast(`Task marked as ${status.replace('-', ' ')}!`, 'success');
            await this.loadTasks();
            await this.loadStats();
        } catch (error) {
            console.error('Failed to update task status:', error);
            this.showToast(error.message || 'Failed to update task status', 'error');
        }
    }

    // Edit task
    async editTask(taskId) {
        try {
            const task = await api.getTask(taskId);
            this.openTaskModal(task);
        } catch (error) {
            console.error('Failed to load task for editing:', error);
            this.showToast(error.message || 'Failed to load task', 'error');
        }
    }

    // Delete task
    async deleteTask(taskId) {
        if (!confirm('Are you sure you want to delete this task? This action cannot be undone.')) {
            return;
        }

        try {
            await api.deleteTask(taskId);
            this.showToast('Task deleted successfully!', 'success');
            await this.loadTasks();
            await this.loadStats();
        } catch (error) {
            console.error('Failed to delete task:', error);
            this.showToast(error.message || 'Failed to delete task', 'error');
        }
    }

    // Show loading overlay
    showLoading(show = true) {
        const overlay = document.getElementById('loading-overlay');
        overlay.style.display = show ? 'flex' : 'none';
    }

    // Show error message
    showError(message) {
        this.showToast(message, 'error');
    }

    // Escape HTML to prevent XSS
    escapeHtml(text) {
        const map = {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#039;'
        };
        return text.replace(/[&<>"']/g, m => map[m]);
    }

    // Check API health
    async checkApiHealth() {
        try {
            await api.healthCheck();
            console.log('✅ API is healthy');
        } catch (error) {
            console.error('❌ API health check failed:', error);
            this.showToast('Unable to connect to the server. Some features may not work properly.', 'warning');
        }
    }
}

// Toast notification system
class ToastManager {
    constructor() {
        this.container = document.getElementById('toast-container');
        this.toastId = 0;
    }

    show(message, type = 'info', duration = 5000) {
        const toastId = ++this.toastId;
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.innerHTML = `
            <i class="fas fa-${this.getIcon(type)}"></i>
            <span>${message}</span>
        `;

        this.container.appendChild(toast);

        // Auto remove after duration
        setTimeout(() => {
            this.remove(toast);
        }, duration);

        // Click to remove
        toast.addEventListener('click', () => {
            this.remove(toast);
        });

        return toastId;
    }

    remove(toast) {
        if (toast && toast.parentNode) {
            toast.style.animation = 'toastSlideIn 0.3s ease reverse';
            setTimeout(() => {
                if (toast.parentNode) {
                    toast.parentNode.removeChild(toast);
                }
            }, 300);
        }
    }

    getIcon(type) {
        const icons = {
            success: 'check-circle',
            error: 'exclamation-triangle',
            warning: 'exclamation-circle',
            info: 'info-circle'
        };
        return icons[type] || icons.info;
    }
}

// Global toast function
window.showToast = (message, type, duration) => {
    if (!window.toastManager) {
        window.toastManager = new ToastManager();
    }
    return window.toastManager.show(message, type, duration);
};

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.taskManager = new TaskManager();
    window.toastManager = new ToastManager();
    
    console.log('🚀 Task Management Application initialized');
});