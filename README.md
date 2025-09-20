# Presentation Room Booking System

A simple presentation room booking system for university students and teachers, built with Node.js and mock data.

## 🚀 **Quick Start**

1. **Start the application:**
   ```bash
   npm start
   ```

2. **Access the application:**
   - Open your browser and go to `http://localhost:3000`

## ✨ **Features**

- **Student Features:**
  - Register and login
  - View available rooms and time slots
  - Book presentation slots
  - Generate printable booking tokens
  - View booking history

- **Teacher Features:**
  - Register and login
  - Create new rooms with time availability
  - Auto-generate 30-minute slots
  - View all bookings
  - Manage room availability

## 🛠️ **Tech Stack**

- **Frontend:** HTML5, CSS3, Vanilla JavaScript
- **Backend:** Node.js (http, url, fs, crypto modules)
- **Database:** Mock data (no external database required)
- **Authentication:** Session-based with cookies
- **Routing:** Manual implementation using Node.js http module

## 📁 **Project Structure**

```
presentation-room-booking/
├── app.js                 # Main server file
├── package.json           # Project configuration
├── README.md             # This file
├── routes/
│   ├── auth.js           # Authentication routes
│   ├── student.js        # Student-specific routes
│   └── teacher.js       # Teacher-specific routes
├── views/
│   ├── index.html        # Home page
│   ├── login.html        # Login page
│   ├── register.html     # Registration page
│   ├── dashboard_student.html  # Student dashboard
│   ├── dashboard_teacher.html  # Teacher dashboard
│   └── token.html        # Booking token page
└── public/
    ├── css/
    │   └── style.css     # Main stylesheet
    ├── js/
    │   └── script.js     # Frontend JavaScript
    └── images/           # Image assets
```

## 🔧 **API Endpoints**

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout

### Student Routes
- `GET /api/student/rooms` - Get available rooms
- `GET /api/student/slots/:roomId` - Get slots for a room
- `POST /api/student/book` - Book a slot
- `GET /api/student/bookings` - Get student's bookings
- `GET /api/student/token/:bookingId` - Get booking token

### Teacher Routes
- `POST /api/teacher/rooms` - Create a new room
- `GET /api/teacher/bookings` - Get all bookings
- `GET /api/teacher/rooms` - Get all rooms

## 🎉 **That's It!**

No complex setup, no database configuration, no Oracle installation required. Just run `npm start` and start using the application! 
