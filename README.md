# 🎓 Presentation Room Booking System

A complete room booking system for university presentations built with Node.js, vanilla JavaScript, and Oracle SQL.

## ✨ Features

- **Student Features:**
  - View available presentation slots
  - Book rooms for specific time slots
  - Generate printable booking tokens
  - View booking history

- **Teacher Features:**
  - Create new rooms with time ranges
  - Auto-generate 30-minute slots
  - View all student bookings
  - Monitor room usage

- **System Features:**
  - Session-based authentication
  - Real-time slot availability
  - Responsive design
  - Print-friendly tokens

## 🛠️ Tech Stack

- **Frontend:** HTML5, CSS3, Vanilla JavaScript
- **Backend:** Node.js (http, url, fs, crypto modules)
- **Database:** Oracle SQL
- **Authentication:** Session cookies stored in Oracle
- **No frameworks or libraries (except oracledb)**

## 📁 Project Structure

```
presentation-room-booking/
├── public/
│   ├── css/
│   │   └── style.css          # Main stylesheet
│   ├── js/
│   │   └── script.js          # Utility functions
│   └── images/                # Image assets
├── views/
│   ├── index.html             # Home page
│   ├── login.html             # Login page
│   ├── register.html          # Registration page
│   ├── dashboard_student.html # Student dashboard
│   ├── dashboard_teacher.html # Teacher dashboard
│   └── token.html             # Printable token page
├── routes/
│   ├── auth.js                # Authentication routes
│   ├── student.js             # Student API routes
│   └── teacher.js             # Teacher API routes
├── db/
│   └── schema.sql             # Oracle database schema
├── app.js                     # Main server file
├── package.json               # Dependencies
└── README.md                  # This file
```

## 🚀 Quick Start

### Prerequisites

- Node.js (v14 or higher)
- Oracle Database (or Oracle Express Edition)
- Oracle Instant Client (for oracledb package)

### Installation

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd presentation-room-booking
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up Oracle Database:**
   - Install Oracle Database or Oracle Express Edition
   - Run the SQL schema from `db/schema.sql`
   - Note your connection details (host, port, service name, username, password)

4. **Configure database connection:**
   - Update the database connection in the route files
   - Replace mock data with actual Oracle queries

5. **Start the server:**
   ```bash
   npm start
   ```

6. **Access the application:**
   - Open your browser and go to `http://localhost:3000`

## 🗄️ Database Setup

### Oracle Schema

The system uses the following tables:

- **Students:** Student information and credentials
- **Teachers:** Teacher information and credentials  
- **Rooms:** Room availability and time ranges
- **Slots:** 30-minute time slots for each room
- **Bookings:** Student bookings with token codes
- **Sessions:** User authentication sessions

### Sample Data

The schema includes sample data for testing:
- Student: safin@university.edu / password123
- Teacher: smith@university.edu / password123

## 🔐 Authentication

- **Session-based:** Uses HTTP-only cookies for security
- **Role-based:** Separate student and teacher access
- **Auto-expiry:** Sessions expire after 24 hours

## 📱 User Interface

### Student Dashboard
- View available slots in a clean table format
- Book slots with one-click
- View booking history and tokens
- Print booking tokens

### Teacher Dashboard
- Create new rooms with date/time ranges
- Auto-generate 30-minute slots
- Monitor all bookings
- View room usage statistics

### Token System
- Unique token codes for each booking
- Print-friendly design
- Includes all booking details
- Signature sections for floor workers

## 🔧 API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `POST /api/auth/logout` - User logout
- `GET /api/auth/check` - Check session status

### Student Routes
- `GET /api/student/slots` - Get available slots
- `POST /api/student/book` - Book a slot
- `GET /api/student/bookings` - Get user's bookings

### Teacher Routes
- `POST /api/teacher/create-room` - Create new room
- `GET /api/teacher/bookings` - Get all bookings
- `GET /api/teacher/rooms` - Get room overview

## 🎨 Customization

### Styling
- Modify `public/css/style.css` for visual changes
- Responsive design with mobile-first approach
- Print-friendly token styling

### Functionality
- Add new features in the route files
- Extend the database schema as needed
- Modify slot duration (currently 30 minutes)

## 🚨 Security Considerations

- **Production Deployment:**
  - Use HTTPS
  - Implement proper password hashing (bcrypt)
  - Add rate limiting
  - Use environment variables for sensitive data
  - Implement proper input validation

- **Database Security:**
  - Use connection pooling
  - Implement prepared statements
  - Restrict database user permissions

## 🧪 Testing

### Demo Mode
The system includes mock data for testing without Oracle:
- No database connection required
- Sample users and rooms
- Full functionality demonstration

### Production Mode
- Connect to Oracle database
- Replace mock data with real queries
- Implement proper error handling

## 📋 Usage Examples

### Student Workflow
1. Register/Login as student
2. View available slots
3. Book desired time slot
4. Print or save token
5. Present token to floor worker

### Teacher Workflow
1. Login as teacher
2. Create new room with time range
3. System auto-generates 30-minute slots
4. Monitor student bookings
5. View room usage statistics

## 🐛 Troubleshooting

### Common Issues

1. **Port already in use:**
   ```bash
   # Change port in app.js or kill existing process
   lsof -ti:3000 | xargs kill -9
   ```

2. **Oracle connection errors:**
   - Verify Oracle service is running
   - Check connection credentials
   - Ensure Oracle Instant Client is installed

3. **Module not found errors:**
   ```bash
   npm install
   ```

### Debug Mode
Enable debug logging by setting environment variable:
```bash
DEBUG=* npm start
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Check the troubleshooting section
- Review the API documentation

## 🔮 Future Enhancements

- Email notifications
- Calendar integration
- Mobile app
- Advanced reporting
- Room equipment management
- Conflict resolution system

---

**Built with ❤️ for educational institutions** 