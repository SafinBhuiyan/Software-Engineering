-- Oracle 11g Compatible Schema
-- Note: Oracle 11g doesn't support IDENTITY columns, so we use sequences instead

-- Create sequences for auto-incrementing IDs
CREATE SEQUENCE seq_teachers START WITH 1 INCREMENT BY 1;
CREATE SEQUENCE seq_rooms START WITH 1 INCREMENT BY 1;
CREATE SEQUENCE seq_slots START WITH 1 INCREMENT BY 1;
CREATE SEQUENCE seq_bookings START WITH 1 INCREMENT BY 1;

-- STUDENTS
CREATE TABLE Students (
    student_id VARCHAR2(20) PRIMARY KEY,
    name VARCHAR2(100) NOT NULL,
    batch VARCHAR2(20),
    dept VARCHAR2(50),
    email VARCHAR2(100) UNIQUE NOT NULL,
    password VARCHAR2(100) NOT NULL
);

-- TEACHERS (Oracle 11g compatible)
CREATE TABLE Teachers (
    teacher_id NUMBER PRIMARY KEY,
    name VARCHAR2(100) NOT NULL,
    email VARCHAR2(100) UNIQUE NOT NULL,
    password VARCHAR2(100) NOT NULL
);

-- ROOMS (Oracle 11g compatible)
CREATE TABLE Rooms (
    room_id NUMBER PRIMARY KEY,
    room_no VARCHAR2(10) NOT NULL,
    date_available DATE NOT NULL,
    time_from TIMESTAMP NOT NULL,
    time_to TIMESTAMP NOT NULL
);

-- SLOTS (30-minute slots, Oracle 11g compatible)
CREATE TABLE Slots (
    slot_id NUMBER PRIMARY KEY,
    room_id NUMBER REFERENCES Rooms(room_id),
    slot_start TIMESTAMP NOT NULL,
    slot_end TIMESTAMP NOT NULL,
    is_booked CHAR(1) DEFAULT 'N'
);

-- BOOKINGS (Oracle 11g compatible)
CREATE TABLE Bookings (
    booking_id NUMBER PRIMARY KEY,
    slot_id NUMBER REFERENCES Slots(slot_id),
    student_id VARCHAR2(20) REFERENCES Students(student_id),
    booking_time TIMESTAMP DEFAULT SYSTIMESTAMP,
    token_code VARCHAR2(50) UNIQUE NOT NULL
);

-- SESSIONS (for auth)
CREATE TABLE Sessions (
    session_id VARCHAR2(50) PRIMARY KEY,
    user_id VARCHAR2(50),
    role VARCHAR2(10),
    created_at TIMESTAMP DEFAULT SYSTIMESTAMP
);

-- Create triggers to auto-increment IDs
CREATE OR REPLACE TRIGGER tr_teachers_id
    BEFORE INSERT ON Teachers
    FOR EACH ROW
BEGIN
    SELECT seq_teachers.NEXTVAL INTO :NEW.teacher_id FROM DUAL;
END;
/

CREATE OR REPLACE TRIGGER tr_rooms_id
    BEFORE INSERT ON Rooms
    FOR EACH ROW
BEGIN
    SELECT seq_rooms.NEXTVAL INTO :NEW.room_id FROM DUAL;
END;
/

CREATE OR REPLACE TRIGGER tr_slots_id
    BEFORE INSERT ON Slots
    FOR EACH ROW
BEGIN
    SELECT seq_slots.NEXTVAL INTO :NEW.slot_id FROM DUAL;
END;
/

CREATE OR REPLACE TRIGGER tr_bookings_id
    BEFORE INSERT ON Bookings
    FOR EACH ROW
BEGIN
    SELECT seq_bookings.NEXTVAL INTO :NEW.booking_id FROM DUAL;
END;
/

-- Insert sample data
INSERT INTO Students (student_id, name, batch, dept, email, password) 
VALUES ('CSE2025001', 'Safin', '2025', 'Computer Science', 'safin@university.edu', 'password123');

INSERT INTO Teachers (name, email, password) 
VALUES ('Dr. Smith', 'smith@university.edu', 'password123');

-- Insert sample room
INSERT INTO Rooms (room_no, date_available, time_from, time_to) 
VALUES ('56', TO_DATE('2025-01-31', 'YYYY-MM-DD'), 
        TO_TIMESTAMP('2025-01-31 09:00:00', 'YYYY-MM-DD HH24:MI:SS'),
        TO_TIMESTAMP('2025-01-31 17:00:00', 'YYYY-MM-DD HH24:MI:SS'));

-- Commit the changes
COMMIT; 