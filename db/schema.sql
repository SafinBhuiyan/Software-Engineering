-- STUDENTS
CREATE TABLE Students (
    student_id VARCHAR2(20) PRIMARY KEY,
    name VARCHAR2(100) NOT NULL,
    batch VARCHAR2(20),
    dept VARCHAR2(50),
    email VARCHAR2(100) UNIQUE NOT NULL,
    password VARCHAR2(100) NOT NULL
);

-- TEACHERS
CREATE TABLE Teachers (
    teacher_id NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    name VARCHAR2(100) NOT NULL,
    email VARCHAR2(100) UNIQUE NOT NULL,
    password VARCHAR2(100) NOT NULL
);

-- ROOMS
CREATE TABLE Rooms (
    room_id NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    room_no VARCHAR2(10) NOT NULL,
    date_available DATE NOT NULL,
    time_from TIMESTAMP NOT NULL,
    time_to TIMESTAMP NOT NULL
);

-- SLOTS (30-minute slots)
CREATE TABLE Slots (
    slot_id NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    room_id NUMBER REFERENCES Rooms(room_id),
    slot_start TIMESTAMP NOT NULL,
    slot_end TIMESTAMP NOT NULL,
    is_booked CHAR(1) DEFAULT 'N'
);

-- BOOKINGS
CREATE TABLE Bookings (
    booking_id NUMBER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    slot_id NUMBER REFERENCES Slots(slot_id),
    student_id VARCHAR2(20) REFERENCES Students(student_id),
    booking_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    token_code VARCHAR2(50) UNIQUE NOT NULL
);

-- SESSIONS (for auth)
CREATE TABLE Sessions (
    session_id VARCHAR2(50) PRIMARY KEY,
    user_id VARCHAR2(50),
    role VARCHAR2(10),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert sample data for testing
INSERT INTO Students (student_id, name, batch, dept, email, password) 
VALUES ('CSE2025001', 'Safin', '2025', 'Computer Science', 'safin@university.edu', 'password123');

INSERT INTO Teachers (name, email, password) 
VALUES ('Dr. Smith', 'smith@university.edu', 'password123'); 