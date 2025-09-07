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

- **Python 3.8+** -
- **Node.js 16+** -
- **MySQL 8.0+** - 
- **Redis Server** - 

## 🚀 Installation & Setup

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/realchat.git
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

2. **Configure Environment Variables:**

# Copy environment file

     cp .env.example .env

#### Run Migrations

```bash
python manage.py makemigrations accounts
python manage.py migrate
```

#### Create Superuser (Optional)

```bash
python manage.py createsuperuser
```

#### Start Redis Server(Optional)

````bash
# Windows (if installed locally -->Optional)
redis-server

````
#### Start Backend Server
```bash
python manage.py runserver

````
 Frontend Setup (React)

#### Navigate to Frontend Directory
```bash
cd ../frontend
````

#### Install Dependencies

```bash
npm install
```

#### Configure Environment Variables
    cp .env.example .env

#### Start Frontend Development Server

```bash
npm run dev
```




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
