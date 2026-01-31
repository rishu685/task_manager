# Task Management Web Application

A full-stack task management system built for the Full Stack Development Internship skill assessment. This application demonstrates proficiency in modern web development technologies including frontend, backend, database management, and system design.

!
## 🚀 Features

### Core Functionality
- **CRUD Operations**: Create, Read, Update, and Delete tasks
- **Task Management**: Title, Description, Status (Pending/In-Progress/Completed)
- **Priority Levels**: Low, Medium, High priority classification
- **Due Dates**: Optional due date tracking
- **Tags System**: Organize tasks with custom tags
- **Real-time Statistics**: Dashboard with task counts and status overview

### Bonus Features ✨
- **User Authentication**: Register/Login system with JWT tokens
- **Responsive Design**: Mobile-first responsive UI
- **Advanced Filtering**: Filter by status, priority, and sort options
- **Pagination**: Efficient handling of large task lists
- **Search & Sort**: Multiple sorting options and filtering capabilities
- **Toast Notifications**: User feedback for all operations
- **Loading States**: Visual feedback during API operations

### Technical Features
- **Security**: JWT authentication, input validation, rate limiting
- **Database**: MongoDB with Mongoose ODM
- **API Design**: RESTful API with comprehensive error handling
- **Modern UI**: CSS Grid, Flexbox, animations, and modern design patterns

## 🛠️ Technology Stack

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose
- **Authentication**: JWT (JSON Web Tokens)
- **Security**: Helmet, CORS, Rate Limiting, bcrypt
- **Validation**: Express-validator

### Frontend
- **Core**: HTML5, CSS3, Vanilla JavaScript
- **Design**: Responsive design with CSS Grid and Flexbox
- **Icons**: Font Awesome
- **Animations**: CSS transitions and keyframes

### Database
- **Primary**: MongoDB
- **ODM**: Mongoose for schema validation and queries
- **Indexes**: Optimized queries with strategic indexing

## 📁 Project Structure

```
task-management-app/
├── backend/
│   ├── models/
│   │   ├── Task.js          # Task schema and model
│   │   └── User.js          # User schema and model
│   ├── routes/
│   │   ├── tasks.js         # Task CRUD endpoints
│   │   └── users.js         # User auth endpoints
│   ├── middleware/
│   │   └── auth.js          # JWT authentication middleware
│   ├── server.js            # Express server setup
│   ├── package.json         # Backend dependencies
│   └── .env                 # Environment variables
├── frontend/
│   ├── css/
│   │   └── styles.css       # Main stylesheet
│   ├── js/
│   │   ├── api.js           # API communication layer
│   │   ├── auth.js          # Authentication management
│   │   └── app.js           # Main application logic
│   ├── index.html           # Main HTML file
│   └── package.json         # Frontend dependencies
├── .github/
│   └── copilot-instructions.md
└── README.md
```

## 🚦 Getting Started

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (local installation or MongoDB Atlas)
- npm or yarn package manager

### Installation

1. **Clone the repository**
   ```bash
   git clone (https://github.com/rishu685/task_manager)
   cd task-management-app
   ```

2. **Backend Setup**
   ```bash
   cd backend
   npm install
   ```

3. **Environment Configuration**
   Create a `.env` file in the backend directory:
   ```env
   NODE_ENV=development
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/task_management
   JWT_SECRET=your-super-secure-jwt-secret-key
   CORS_ORIGINS=http://localhost:3000,http://localhost:8080
   ```

4. **Database Setup**
   - **Local MongoDB**: Make sure MongoDB is running on your system
   - **MongoDB Atlas**: Replace `MONGODB_URI` with your Atlas connection string

5. **Start the Backend**
   ```bash
   npm run dev  # Development mode with nodemon
   # or
   npm start    # Production mode
   ```

6. **Frontend Setup**
   ```bash
   cd ../frontend
   # Serve using Python (recommended)
   python3 -m http.server 8080
   # or using Node.js http-server
   npx http-server -p 8080
   ```

7. **Access the Application**
   - Frontend: http://localhost:8080
   - Backend API: http://localhost:5000
   - API Health: http://localhost:5000/api/health

## 📖 API Documentation

### Base URL
```
http://localhost:5000/api
```

### Authentication
Include JWT token in the Authorization header:
```
Authorization: Bearer <your_jwt_token>
```

### Endpoints

#### Authentication Endpoints
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/users/register` | Register new user | No |
| POST | `/users/login` | Login user | No |
| GET | `/users/profile` | Get user profile | Yes |
| PUT | `/users/profile` | Update profile | Yes |
| POST | `/users/change-password` | Change password | Yes |

#### Task Endpoints
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/tasks` | Get all tasks (with pagination & filters) | Optional |
| GET | `/tasks/:id` | Get single task | Optional |
| POST | `/tasks` | Create new task | Optional |
| PUT | `/tasks/:id` | Update task | Optional |
| PATCH | `/tasks/:id/status` | Update task status only | Optional |
| DELETE | `/tasks/:id` | Delete task | Optional |
| GET | `/tasks/stats/summary` | Get task statistics | Optional |

### Query Parameters for GET /tasks
- `status`: Filter by status (pending, in-progress, completed)
- `priority`: Filter by priority (low, medium, high)
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 10)
- `sortBy`: Sort field (createdAt, title, priority, dueDate)
- `sortOrder`: Sort direction (asc, desc)

### Example API Requests

**Create a Task**
```bash
curl -X POST http://localhost:5000/api/tasks \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{
    "title": "Complete project documentation",
    "description": "Write comprehensive README and API docs",
    "status": "pending",
    "priority": "high",
    "dueDate": "2024-02-15T10:00:00Z",
    "tags": ["documentation", "urgent"]
  }'
```

**Get Filtered Tasks**
```bash
curl "http://localhost:5000/api/tasks?status=pending&priority=high&page=1&limit=5"
```

## 🧪 Testing

### Manual Testing
1. **User Registration/Login**
   - Register with valid credentials
   - Login with registered user
   - Access protected routes

2. **Task Operations**
   - Create tasks with various priorities
   - Update task status and details
   - Delete tasks
   - Test filtering and pagination

3. **Error Handling**
   - Invalid API requests
   - Authentication failures
   - Database connection issues

### API Testing with Postman
Import the API endpoints into Postman and test all CRUD operations.

## 🚀 Deployment

### Backend Deployment (Heroku Example)
1. **Prepare for deployment**
   ```bash
   cd backend
   # Ensure start script is in package.json
   ```

2. **Deploy to Heroku**
   ```bash
   heroku create your-app-name
   heroku config:set NODE_ENV=production
   heroku config:set MONGODB_URI=<your_mongodb_atlas_uri>
   heroku config:set JWT_SECRET=<secure_random_string>
   git push heroku main
   ```

### Frontend Deployment (Netlify Example)
1. **Build for production**
   ```bash
   # Update API_BASE_URL in api.js to your deployed backend URL
   ```

2. **Deploy to Netlify**
   - Drag and drop the frontend folder to Netlify
   - Or connect to Git repository for automatic deployments

### Environment Variables for Production
```env
NODE_ENV=production
PORT=5000
MONGODB_URI=<your_production_mongodb_uri>
JWT_SECRET=<secure_random_string_minimum_32_characters>
CORS_ORIGINS=<your_frontend_domain>
```

## 🔒 Security Features

- **Password Hashing**: bcrypt with salt rounds
- **JWT Authentication**: Secure token-based auth
- **Input Validation**: Server-side validation for all inputs
- **Rate Limiting**: API rate limiting to prevent abuse
- **CORS Configuration**: Controlled cross-origin requests
- **Helmet**: Security headers
- **XSS Protection**: HTML escaping in frontend

## 🎨 Design Features

- **Responsive Design**: Works on desktop, tablet, and mobile
- **Modern UI**: Clean, professional interface
- **Animations**: Smooth transitions and hover effects
- **Accessibility**: Semantic HTML and keyboard navigation
- **Toast Notifications**: User feedback for all actions
- **Loading States**: Visual feedback during API calls

## 📊 Database Schema

### User Schema
```javascript
{
  username: String (required, unique, 3-30 chars)
  email: String (required, unique, valid email)
  password: String (required, hashed, min 6 chars)
  role: String (enum: 'user', 'admin', default: 'user')
  isActive: Boolean (default: true)
  createdAt: Date
  updatedAt: Date
}
```

### Task Schema
```javascript
{
  title: String (required, max 100 chars)
  description: String (optional, max 500 chars)
  status: String (enum: 'pending', 'in-progress', 'completed')
  priority: String (enum: 'low', 'medium', 'high')
  userId: ObjectId (ref: 'User', optional)
  dueDate: Date (optional)
  tags: [String] (array of tags)
  createdAt: Date
  updatedAt: Date
}
```

## 🛣️ Future Enhancements

- **Real-time Updates**: WebSocket integration for live updates
- **File Attachments**: Add file upload capability to tasks
- **Task Comments**: Comment system for task collaboration
- **Calendar View**: Calendar interface for due date management
- **Email Notifications**: Email reminders for due tasks
- **Team Collaboration**: Multiple users working on shared tasks
- **Data Export**: Export tasks to CSV/PDF
- **Dark Mode**: Theme switching capability
- **Mobile App**: React Native or Flutter mobile application

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.


## 🙏 Acknowledgments

- Express.js team for the excellent web framework
- MongoDB team for the robust database solution
- Font Awesome for the beautiful icons
- All the open-source contributors who made this project possible

---

**Built with ❤️ for the Full Stack Development Internship Assessment**
