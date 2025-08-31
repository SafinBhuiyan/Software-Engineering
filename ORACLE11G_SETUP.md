# 🗄️ Oracle 11g Setup Guide for Room Booking System

This guide is specifically designed for Oracle Database 11g installation and configuration.

## 🎯 **Oracle 11g Installation**

### **Step 1: Download Oracle 11g**
- **Standard Edition:** [Oracle 11g Downloads](https://www.oracle.com/database/technologies/oracle-database-software-downloads.html)
- **Express Edition (XE):** [Oracle 11g XE](https://www.oracle.com/database/technologies/express-edition/downloads.html)

### **Step 2: Install Oracle 11g**
1. **Run installer as Administrator**
2. **Choose installation type:** Desktop Class
3. **Database configuration:**
   - **Global Database Name:** `XE`
   - **SID:** `XE`
   - **Password:** Set admin password
4. **Installation location:** Default (`C:\app\oracle`)
5. **Wait for installation** (30-60 minutes)

### **Step 3: Verify Installation**
```bash
# Check Windows Services
services.msc
# Look for: OracleServiceXE, OracleOraDb11g_home1TNSListener

# Test connection
sqlplus system/yourpassword@//localhost:1521:XE
```

## 🔧 **Oracle 11g Configuration**

### **Update Your .env File**
```env
# Oracle 11g Database Configuration
DB_USER=system
DB_PASSWORD=yourpassword
DB_CONNECT_STRING=localhost:1521:XE

# Note: Oracle 11g uses SID notation (:)
# NOT service name notation (/)
```

### **Install Oracle Instant Client 11g**
1. Download from [Oracle Instant Client 11g](https://www.oracle.com/database/technologies/instant-client/winx64-downloads.html)
2. Extract to `C:\oracle\instantclient_11_2`
3. Add to PATH: `C:\oracle\instantclient_11_2`
4. Restart command prompt

## 🚀 **Setup Your Application**

### **Step 1: Run Oracle 11g Setup**
```bash
# Run the setup script
node setup-oracle.js
```

### **Step 2: Initialize Database**
```bash
# Create tables and sequences
npm run db:init
```

### **Step 3: Start with Oracle 11g**
```bash
# Start application with Oracle database
npm run start:oracle
```

## 🔍 **Oracle 11g Specific Features**

### **Sequences Instead of IDENTITY**
Oracle 11g uses sequences and triggers for auto-incrementing IDs:
```sql
-- Create sequence
CREATE SEQUENCE seq_teachers START WITH 1 INCREMENT BY 1;

-- Create trigger
CREATE OR REPLACE TRIGGER tr_teachers_id
    BEFORE INSERT ON Teachers
    FOR EACH ROW
BEGIN
    SELECT seq_teachers.NEXTVAL INTO :NEW.teacher_id FROM DUAL;
END;
/
```

### **SYSTIMESTAMP Instead of CURRENT_TIMESTAMP**
```sql
-- Oracle 11g compatible
booking_time TIMESTAMP DEFAULT SYSTIMESTAMP

-- NOT Oracle 12c+ syntax
booking_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP
```

## 🐛 **Oracle 11g Troubleshooting**

### **Common Issues**

#### **1. "ORA-12541: TNS:no listener"**
```bash
# Check Oracle services
services.msc
# Start: OracleServiceXE, OracleOraDb11g_home1TNSListener
```

#### **2. "NJS-040: cannot load oracledb binary"**
```bash
# Install Oracle Instant Client 11g
# Add to PATH: C:\oracle\instantclient_11_2
# Restart command prompt
```

#### **3. "ORA-00955: name is already being used"**
```bash
# Tables already exist, this is normal
# Run: npm run db:init (will skip existing tables)
```

#### **4. "ORA-12505: TNS:listener does not currently know of SID"**
```bash
# Use SID notation: localhost:1521:XE
# NOT service name: localhost:1521/XE
```

### **Connection String Format**
```bash
# Oracle 11g (SID notation)
localhost:1521:XE

# Oracle 12c+ (Service name notation)
localhost:1521/XE
```

## 📊 **Database Management**

### **Useful SQL Commands**
```sql
-- Connect to database
sqlplus system/yourpassword@//localhost:1521:XE

-- List sequences
SELECT sequence_name FROM user_sequences;

-- List triggers
SELECT trigger_name FROM user_triggers;

-- Check table structure
DESCRIBE Students;

-- View sample data
SELECT * FROM Students;

-- Exit
EXIT;
```

### **Backup & Restore**
```bash
# Export data (Oracle 11g)
exp system/yourpassword@//localhost:1521:XE \
  file=room_booking.dmp \
  owner=system

# Import data
imp system/yourpassword@//localhost:1521:XE \
  file=room_booking.dmp \
  fromuser=system \
  touser=system
```

## 🔒 **Security for Oracle 11g**

### **Create Dedicated User**
```sql
-- Connect as SYSTEM
sqlplus system/yourpassword@//localhost:1521:XE

-- Create user
CREATE USER room_booking IDENTIFIED BY secure_password;

-- Grant privileges
GRANT CONNECT, RESOURCE TO room_booking;
GRANT CREATE SESSION TO room_booking;
GRANT SELECT, INSERT, UPDATE, DELETE ON Students TO room_booking;
GRANT SELECT, INSERT, UPDATE, DELETE ON Teachers TO room_booking;
GRANT SELECT, INSERT, UPDATE, DELETE ON Rooms TO room_booking;
GRANT SELECT, INSERT, UPDATE, DELETE ON Slots TO room_booking;
GRANT SELECT, INSERT, UPDATE, DELETE ON Bookings TO room_booking;
GRANT SELECT, INSERT, UPDATE, DELETE ON Sessions TO room_booking;

-- Update .env file
DB_USER=room_booking
DB_PASSWORD=secure_password
```

## 📱 **Testing Your Oracle 11g Setup**

### **1. Test Database Connection**
```bash
npm run db:init
```

Expected output:
```
🚀 Starting database initialization...
✅ Table 1 created successfully
✅ Table 2 created successfully
🔧 Creating triggers for auto-incrementing IDs...
✅ Trigger 1 created successfully
...
🎉 Database initialization completed successfully!
```

### **2. Test Application**
```bash
npm run start:oracle
```

Expected output:
```
🔗 Oracle configuration loaded from environment
✅ Oracle connection pool created successfully
✅ Oracle connection test successful
Server running on http://localhost:3000
```

### **3. Test in Browser**
1. Open `http://localhost:3000`
2. Register/Login with test accounts
3. Create rooms and book slots
4. Verify data is stored in Oracle 11g

## 🎯 **Oracle 11g Advantages**

- ✅ **Stable and mature** database system
- ✅ **Wide compatibility** with existing systems
- ✅ **Good performance** for development
- ✅ **Comprehensive documentation** available
- ✅ **Free Express Edition** available

## 🆘 **Getting Help**

- **Oracle 11g Documentation:** [docs.oracle.com](https://docs.oracle.com/cd/E11882_01/index.htm)
- **Oracle Community:** [community.oracle.com](https://community.oracle.com)
- **Stack Overflow:** Tag with `oracle11g` and `node.js`

---

**🎉 Your Room Booking System is now configured for Oracle 11g!** 