# RealChat - Real-Time Chat Application 💬

A modern, real-time chat application built with Django Channels (WebSocket backend) and React (frontend), featuring user authentication, real-time messaging, file sharing, and cyberpunk-inspired UI design.

## ✨ Features

### 🔐 Authentication & User Management

- User Registration & Login with JWT Authentication
- Profile Management (Username, Email editing)
- Secure password reset functionality
- User online/offline status indicators

### 💬 Real-Time Chat

- Instant messaging with WebSocket connections
- Private one-on-one conversations
- Typing indicators
- Message timestamps
- Read/unread message status
- User search and chat initiation

### 📱 Mobile-First Design

- Fully responsive design with mobile navigation
- WhatsApp-like interface
- Cyberpunk/futuristic dark theme
- Smooth animations and transitions
- Mobile back navigation for seamless UX

### 🚀 Advanced Features

- File upload and sharing capabilities
- Real-time connection status indicators
- Username change propagation in real-time
- System messages for user activity
- Matrix rain background effects

## 🛠 Tech Stack

### Backend

- **Django 4.2+** - Web framework
- **Django REST Framework** - API development
- **Django Channels** - WebSocket support for real-time features
- **Redis** - Channel layer backend for WebSocket scaling
- **JWT Authentication** - Secure token-based auth
- **MySQL** - Primary database
- **Daphne** - ASGI server for Django Channels
- **Pillow** - Image processing for file uploads

### Frontend

- **React 18** - Modern UI library
- **Material-UI (MUI)** - Component library with custom theming
- **WebSocket API** - Real-time communication
- **React Router** - Client-side routing
- **Axios** - HTTP client for API calls
- **Context API** - State management
- **Custom CSS** - Cyberpunk theme with animations

## 📋 Prerequisites

Before running this project, make sure you have the following installed:

- **Python 3.8+** - [Download Python](https://www.python.org/downloads/)
- **Node.js 16+** - [Download Node.js](https://nodejs.org/)
- **MySQL 8.0+** - [Download MySQL](https://dev.mysql.com/downloads/)
- **Redis Server** - [Download Redis](https://redis.io/download) or use Docker
- **Git** - [Download Git](https://git-scm.com/downloads)

## 🚀 Installation & Setup

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/realchat.git
cd realchat/realtimechat
```

### 2. Backend Setup (Django)

#### Create Virtual Environment

```bash
cd backend

python -m venv venv
venv\Scripts\activate

```

#### Install Dependencies

```bash
pip install -r requirements.txt
```

#### Database Setup

1. **Create MySQL Database:**

```sql
CREATE DATABASE realchat_db;
CREATE USER 'realchat_user'@'localhost' IDENTIFIED BY 'your_password';
GRANT ALL PRIVILEGES ON realchat_db.* TO 'realchat_user'@'localhost';
FLUSH PRIVILEGES;
```

2. **Configure Environment Variables:**

# Copy environment file

     cp .env.example .env

#### Run Migrations

```bash
python manage.py makemigrations
python manage.py migrate
```

#### Create Superuser (Optional)

```bash
python manage.py createsuperuser
```

#### Start Redis Server

````bash
# Windows (if installed locally)
redis-server

#### Start Backend Server
```bash
# Development server with Daphne (supports WebSockets)
python manage.py runserver



### 3. Frontend Setup (React)

#### Navigate to Frontend Directory
```bash
cd ../frontend
````

#### Install Dependencies

```bash
npm install
```

#### Configure Environment Variables

Create a `.env` file in the `frontend` directory:

```env
# API Configuration
REACT_APP_API_URL=http://localhost:8000
REACT_APP_WS_URL=ws://localhost:8000

# App Configuration
REACT_APP_NAME=RealChat
REACT_APP_VERSION=1.0.0

# Development Settings
GENERATE_SOURCEMAP=false
```

#### Start Frontend Development Server

```bash
npm start
```

Frontend will be running at: `http://localhost:3000`

## 🔧 Development Workflow

### Running the Full Application

1. **Start Redis Server:**

   ```bash
   redis-server
   ```

2. **Start Backend (Terminal 1):**

   ```bash
   cd backend
   source venv/bin/activate  # or venv\Scripts\activate on Windows
   python manage.py runserver
   ```

3. **Start Frontend (Terminal 2):**

   ```bash
   cd frontend
   npm start
   ```

4. **Access Application:**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:8000
   - Admin Panel: http://localhost:8000/admin

### Testing the Real-Time Features

1. Register/Login with multiple users
2. Open multiple browser tabs or use incognito mode
3. Start conversations and test:
   - Real-time messaging
   - Typing indicators
   - Online/offline status
   - Username changes
   - File uploads

## 📱 Mobile Testing

1. **Test Responsive Design:**

   - Open Chrome DevTools
   - Toggle Device Toolbar (Ctrl+Shift+M)
   - Test various device sizes

2. **Test Mobile Navigation:**
   - Chat list view on mobile
   - Back navigation from chat to list
   - Touch interactions

## 🐛 Troubleshooting

### Common Issues

1. **WebSocket Connection Failed:**

   - Ensure Redis server is running
   - Check if port 8000 is not blocked
   - Verify `REDIS_URL` in backend `.env`

2. **Database Connection Error:**

   - Verify MySQL service is running
   - Check database credentials in `.env`
   - Ensure database exists

3. **CORS Errors:**

   - Verify `CORS_ALLOWED_ORIGINS` in backend `.env`
   - Check `REACT_APP_API_URL` in frontend `.env`

4. **Frontend Build Issues:**

   ```bash
   cd frontend
   rm -rf node_modules package-lock.json
   npm install
   ```

5. **Backend Migration Issues:**
   ```bash
   python manage.py makemigrations --empty accounts
   python manage.py makemigrations --empty chat
   python manage.py migrate
   ```

## 📚 API Documentation

### Authentication Endpoints

- `POST /api/auth/register/` - User registration
- `POST /api/auth/login/` - User login
- `POST /api/auth/logout/` - User logout
- `POST /api/auth/refresh/` - Token refresh

### Chat Endpoints

- `GET /api/chat/rooms/` - Get user's chat rooms
- `GET /api/chat/messages/<room_id>/` - Get messages for a room
- `POST /api/chat/search-users/` - Search for users

### WebSocket Endpoints

- `ws://localhost:8000/ws/chat/<room_id>/` - Real-time chat

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Commit changes: `git commit -m 'Add feature'`
4. Push to branch: `git push origin feature-name`
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👨‍💻 Author

Your Name - [Your GitHub](https://github.com/yourusername)

## 🙏 Acknowledgments

- Django Channels for WebSocket support
- Material-UI for the component library
- Redis for real-time message handling
- Inspiration from modern chat applications
