// Database Initialization Script
const { executeQuery, initializeOracle } = require('./config');

// SQL statements to create tables (Oracle 11g compatible)
const createTables = [
    `-- Create sequences for auto-incrementing IDs
    CREATE SEQUENCE seq_teachers START WITH 1 INCREMENT BY 1`,
    
    `CREATE SEQUENCE seq_rooms START WITH 1 INCREMENT BY 1`,
    
    `CREATE SEQUENCE seq_slots START WITH 1 INCREMENT BY 1`,
    
    `CREATE SEQUENCE seq_bookings START WITH 1 INCREMENT BY 1`,
    
    `-- STUDENTS
    CREATE TABLE Students (
        student_id VARCHAR2(20) PRIMARY KEY,
        name VARCHAR2(100) NOT NULL,
        batch VARCHAR2(20),
        dept VARCHAR2(50),
        email VARCHAR2(100) UNIQUE NOT NULL,
        password VARCHAR2(100) NOT NULL
    )`,
    
    `-- TEACHERS (Oracle 11g compatible)
    CREATE TABLE Teachers (
        teacher_id NUMBER PRIMARY KEY,
        name VARCHAR2(100) NOT NULL,
        email VARCHAR2(100) UNIQUE NOT NULL,
        password VARCHAR2(100) NOT NULL
    )`,
    
    `-- ROOMS (Oracle 11g compatible)
    CREATE TABLE Rooms (
        room_id NUMBER PRIMARY KEY,
        room_no VARCHAR2(10) NOT NULL,
        date_available DATE NOT NULL,
        time_from TIMESTAMP NOT NULL,
        time_to TIMESTAMP NOT NULL
    )`,
    
    `-- SLOTS (30-minute slots, Oracle 11g compatible)
    CREATE TABLE Slots (
        slot_id NUMBER PRIMARY KEY,
        room_id NUMBER REFERENCES Rooms(room_id),
        slot_start TIMESTAMP NOT NULL,
        slot_end TIMESTAMP NOT NULL,
        is_booked CHAR(1) DEFAULT 'N'
    )`,
    
    `-- BOOKINGS (Oracle 11g compatible)
    CREATE TABLE Bookings (
        booking_id NUMBER PRIMARY KEY,
        slot_id NUMBER REFERENCES Slots(slot_id),
        student_id VARCHAR2(20) REFERENCES Students(student_id),
        booking_time TIMESTAMP DEFAULT SYSTIMESTAMP,
        token_code VARCHAR2(50) UNIQUE NOT NULL
    )`,
    
    `-- SESSIONS (for auth)
    CREATE TABLE Sessions (
        session_id VARCHAR2(50) PRIMARY KEY,
        user_id VARCHAR2(50),
        role VARCHAR2(10),
        created_at TIMESTAMP DEFAULT SYSTIMESTAMP
    )`
];

// Sample data
const sampleData = [
    `-- Insert sample student
    INSERT INTO Students (student_id, name, batch, dept, email, password) 
    VALUES ('CSE2025001', 'Safin', '2025', 'Computer Science', 'safin@university.edu', 'password123')`,
    
    `-- Insert sample teacher
    INSERT INTO Teachers (name, email, password) 
    VALUES ('Dr. Smith', 'smith@university.edu', 'password123')`,
    
    `-- Insert sample room
    INSERT INTO Rooms (room_no, date_available, time_from, time_to) 
    VALUES ('56', TO_DATE('2025-01-31', 'YYYY-MM-DD'), 
            TO_TIMESTAMP('2025-01-31 09:00:00', 'YYYY-MM-DD HH24:MI:SS'),
            TO_TIMESTAMP('2025-01-31 17:00:00', 'YYYY-MM-DD HH24:MI:SS'))`
];

// Initialize database
async function initializeDatabase() {
    try {
        console.log('🚀 Starting database initialization...');
        
        // Create tables
        for (let i = 0; i < createTables.length; i++) {
            try {
                await executeQuery(createTables[i]);
                console.log(`✅ Table ${i + 1} created successfully`);
            } catch (error) {
                if (error.message.includes('ORA-00955')) {
                    console.log(`ℹ️  Table ${i + 1} already exists`);
                } else {
                    throw error;
                }
            }
        }
        
        // Insert sample data
        for (let i = 0; i < sampleData.length; i++) {
            try {
                await executeQuery(sampleData[i]);
                console.log(`✅ Sample data ${i + 1} inserted successfully`);
            } catch (error) {
                if (error.message.includes('ORA-00001')) {
                    console.log(`ℹ️  Sample data ${i + 1} already exists`);
                } else {
                    throw error;
                }
            }
        }
        
        // Create triggers for auto-incrementing IDs
        console.log('🔧 Creating triggers for auto-incrementing IDs...');
        
        const triggers = [
            `CREATE OR REPLACE TRIGGER tr_teachers_id
                BEFORE INSERT ON Teachers
                FOR EACH ROW
            BEGIN
                SELECT seq_teachers.NEXTVAL INTO :NEW.teacher_id FROM DUAL;
            END;`,
            
            `CREATE OR REPLACE TRIGGER tr_rooms_id
                BEFORE INSERT ON Rooms
                FOR EACH ROW
            BEGIN
                SELECT seq_rooms.NEXTVAL INTO :NEW.room_id FROM DUAL;
            END;`,
            
            `CREATE OR REPLACE TRIGGER tr_slots_id
                BEFORE INSERT ON Slots
                FOR EACH ROW
            BEGIN
                SELECT seq_slots.NEXTVAL INTO :NEW.slot_id FROM DUAL;
            END;`,
            
            `CREATE OR REPLACE TRIGGER tr_bookings_id
                BEFORE INSERT ON Bookings
                FOR EACH ROW
            BEGIN
                SELECT seq_bookings.NEXTVAL INTO :NEW.booking_id FROM DUAL;
            END;`
        ];
        
        for (let i = 0; i < triggers.length; i++) {
            try {
                await executeQuery(triggers[i]);
                console.log(`✅ Trigger ${i + 1} created successfully`);
            } catch (error) {
                console.log(`ℹ️  Trigger ${i + 1} already exists or failed: ${error.message}`);
            }
        }
        
        console.log('🎉 Database initialization completed successfully!');
        
    } catch (error) {
        console.error('❌ Database initialization failed:', error.message);
        throw error;
    }
}

// Generate slots for existing rooms
async function generateSlots() {
    try {
        console.log('🔄 Generating time slots for existing rooms...');
        
        // Get all rooms
        const rooms = await executeQuery('SELECT * FROM Rooms');
        
        for (const room of rooms.rows) {
            const roomId = room.ROOM_ID;
            const timeFrom = new Date(room.TIME_FROM);
            const timeTo = new Date(room.TIME_TO);
            
            // Generate 30-minute slots
            let currentTime = new Date(timeFrom);
            const slots = [];
            
            while (currentTime < timeTo) {
                const slotStart = new Date(currentTime);
                const slotEnd = new Date(currentTime.getTime() + 30 * 60 * 1000);
                
                if (slotEnd <= timeTo) {
                    slots.push({
                        room_id: roomId,
                        slot_start: slotStart,
                        slot_end: slotEnd
                    });
                }
                
                currentTime = slotEnd;
            }
            
            // Insert slots
            for (const slot of slots) {
                try {
                    await executeQuery(
                        'INSERT INTO Slots (room_id, slot_start, slot_end) VALUES (:room_id, :slot_start, :slot_end)',
                        [slot.room_id, slot.slot_start, slot.slot_end]
                    );
                } catch (error) {
                    if (!error.message.includes('ORA-00001')) {
                        throw error;
                    }
                }
            }
            
            console.log(`✅ Generated ${slots.length} slots for Room ${room.ROOM_NO}`);
        }
        
        console.log('🎯 Slot generation completed!');
        
    } catch (error) {
        console.error('❌ Slot generation failed:', error.message);
        throw error;
    }
}

// Main function
async function main() {
    try {
        console.log('🔗 Initializing Oracle connection...');
        await initializeOracle();
        
        await initializeDatabase();
        await generateSlots();
        console.log('\n🎊 Database setup complete! You can now use the application.');
        process.exit(0);
    } catch (error) {
        console.error('\n💥 Setup failed. Please check the error messages above.');
        process.exit(1);
    }
}

// Run if called directly
if (require.main === module) {
    main();
}

module.exports = {
    initializeDatabase,
    generateSlots
}; 