# 🗄️ Oracle Database Setup Guide

This guide will walk you through installing Oracle and connecting it to your Room Booking System.

## 🎯 **Quick Start (Recommended)**

### **Option 1: Docker Oracle (Easiest)**

```bash
# 1. Install Docker Desktop from https://www.docker.com/products/docker-desktop
# 2. Run Oracle in Docker:
docker run -d --name oracle-xe \
  -p 1521:1521 \
  -e ORACLE_PWD=yourpassword \
  -e ORACLE_CHARACTERSET=AL32UTF8 \
  oracleinanutshell/oracle-xe:11

# 3. Wait for Oracle to start (check logs):
docker logs oracle-xe

# 4. Test connection:
docker exec -it oracle-xe sqlplus system/yourpassword@//localhost:1521/XE
```

### **Option 2: Oracle Express Edition (XE)**

1. Download from [Oracle Downloads](https://www.oracle.com/database/technologies/xe-downloads.html)
2. Install with default settings
3. Set admin password during installation

## 🔧 **Step-by-Step Installation**

### **Step 1: Install Oracle Database**

#### **Windows:**
1. Download **Oracle Database 21c Express Edition**
2. Run installer as Administrator
3. Accept license agreement
4. Choose installation directory
5. Set **SYS** password (remember this!)
6. Choose port (default: 1521)
7. Wait for installation to complete

#### **macOS/Linux:**
```bash
# Download and extract
wget https://download.oracle.com/otn-pub/otn_software/db-free/OracleXE213_Win64.zip
unzip OracleXE213_Win64.zip

# Install dependencies
sudo apt-get install libaio1 libaio-dev

# Run installer
sudo ./runInstaller.sh
```

### **Step 2: Install Oracle Instant Client**

#### **Windows:**
1. Download from [Oracle Instant Client](https://www.oracle.com/database/technologies/instant-client/winx64-downloads.html)
2. Extract to `C:\oracle\instantclient_21_12`
3. Add to PATH: `C:\oracle\instantclient_21_12`

#### **macOS/Linux:**
```bash
# Download and extract
wget https://download.oracle.com/otn_software/instantclient/instantclient-basic-linux.x64-21.12.0.0.0.zip
unzip instantclient-basic-linux.x64-21.12.0.0.0.zip

# Move to /opt
sudo mv instantclient_21_12 /opt/

# Add to PATH
echo 'export PATH=/opt/instantclient_21_12:$PATH' >> ~/.bashrc
echo 'export LD_LIBRARY_PATH=/opt/instantclient_21_12:$LD_LIBRARY_PATH' >> ~/.bashrc
source ~/.bashrc
```

### **Step 3: Verify Oracle Installation**

```bash
# Check if Oracle service is running
# Windows:
services.msc  # Look for "OracleServiceXE"

# Test connection
sqlplus system/yourpassword@//localhost:1521/XE

# If successful, you'll see:
# SQL>
# Type 'exit' to quit
```

## 🚀 **Configure Your Application**

### **Step 1: Run Setup Script**

```bash
# Run the Oracle setup script
node setup-oracle.js
```

This will:
- ✅ Check Oracle installation
- ✅ Install dotenv package
- ✅ Create .env file
- ✅ Update package.json scripts

### **Step 2: Update Environment Variables**

Edit the `.env` file created:

```env
# Oracle Database Configuration
DB_USER=system
DB_PASSWORD=yourpassword
DB_CONNECT_STRING=localhost:1521/XE

# Optional: Oracle client directory
ORACLE_CLIENT_DIR=C:\oracle\instantclient_21_12

# Server configuration
PORT=3000
NODE_ENV=development
```

### **Step 3: Initialize Database**

```bash
# Create tables and sample data
npm run db:init
```

### **Step 4: Start Application with Oracle**

```bash
# Start with Oracle database
npm run start:oracle
```

## 🔍 **Troubleshooting**

### **Common Issues & Solutions**

#### **1. "ORA-12541: TNS:no listener"**
```bash
# Check if Oracle service is running
# Windows: services.msc
# Look for "OracleServiceXE" and "OracleOraDB21Home1TNSListener"

# Start services if stopped
net start OracleServiceXE
net start OracleOraDB21Home1TNSListener
```

#### **2. "ORA-12514: TNS:listener does not currently know of service"**
```bash
# Check service name in tnsnames.ora
# Usually located in: C:\app\client\product\21.0.0\client_1\network\admin\tnsnames.ora

# Default service name is usually XE
```

#### **3. "NJS-040: cannot load oracledb binary"**
```bash
# Install Oracle Instant Client
# Add to PATH environment variable
# Restart terminal/command prompt
```

#### **4. "ORA-01017: invalid username/password"**
```bash
# Verify credentials in .env file
# Test with sqlplus:
sqlplus system/yourpassword@//localhost:1521/XE
```

#### **5. "ORA-12505: TNS:listener does not currently know of SID"**
```bash
# Use service name instead of SID
# Change connection string from:
# localhost:1521:XE
# To:
# localhost:1521/XE
```

### **Debug Connection Issues**

```bash
# Enable debug logging
DEBUG=* npm run start:oracle

# Check Oracle logs
# Windows: Event Viewer > Windows Logs > Application
# Look for Oracle-related errors
```

## 📊 **Database Management**

### **Useful SQL Commands**

```sql
-- Connect to database
sqlplus system/yourpassword@//localhost:1521/XE

-- List all tables
SELECT table_name FROM user_tables;

-- Check table structure
DESCRIBE Students;

-- View sample data
SELECT * FROM Students;

-- Check connections
SELECT username, machine, program FROM v$session;

-- Exit SQL*Plus
EXIT;
```

### **Backup & Restore**

```bash
# Export data
expdp system/yourpassword@//localhost:1521/XE \
  directory=DATA_PUMP_DIR \
  dumpfile=room_booking.dmp \
  schemas=SYSTEM

# Import data
impdp system/yourpassword@//localhost:1521/XE \
  directory=DATA_PUMP_DIR \
  dumpfile=room_booking.dmp \
  schemas=SYSTEM
```

## 🔒 **Security Best Practices**

### **Production Deployment**

1. **Change default passwords**
2. **Use dedicated database user** (not SYSTEM)
3. **Enable network encryption**
4. **Restrict network access**
5. **Regular security updates**

### **Create Dedicated User**

```sql
-- Connect as SYSTEM
sqlplus system/yourpassword@//localhost:1521/XE

-- Create dedicated user
CREATE USER room_booking IDENTIFIED BY secure_password;

-- Grant necessary privileges
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

## 📱 **Testing Your Setup**

### **1. Test Database Connection**

```bash
npm run db:init
```

Expected output:
```
🚀 Starting database initialization...
✅ Table 1 created successfully
✅ Table 2 created successfully
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
4. Verify data is stored in Oracle

## 🎯 **Next Steps**

After successful Oracle setup:

1. ✅ **Test all features** with real database
2. ✅ **Customize database schema** if needed
3. ✅ **Add more sample data** for testing
4. ✅ **Implement production security** measures
5. ✅ **Set up monitoring** and backups

## 🆘 **Getting Help**

- **Oracle Documentation:** [docs.oracle.com](https://docs.oracle.com)
- **Oracle Community:** [community.oracle.com](https://community.oracle.com)
- **Stack Overflow:** Tag questions with `oracle` and `node.js`
- **GitHub Issues:** Create issue in this repository

---

**🎉 Congratulations! You now have a fully functional Room Booking System with Oracle Database!** 