#!/usr/bin/env node

/**
 * Oracle Database Setup Script
 * This script helps you configure Oracle connection for the Room Booking System
 */

const fs = require('fs');
const path = require('path');

console.log('🎓 Oracle Database Setup for Room Booking System');
console.log('================================================\n');

// Check if Oracle is installed
function checkOracleInstallation() {
    console.log('🔍 Checking Oracle installation...');
    
    // Check if oracledb package is installed
    try {
        require('oracledb');
        console.log('✅ oracledb package is installed');
    } catch (error) {
        console.log('❌ oracledb package not found');
        console.log('💡 Run: npm install oracledb');
        return false;
    }
    
    return true;
}

// Create environment configuration
function createEnvConfig() {
    console.log('\n📝 Creating environment configuration...');
    
    const envContent = `# Oracle Database Configuration
# Update these values with your actual Oracle setup

# Database connection
DB_USER=system
DB_PASSWORD=yourpassword
DB_CONNECT_STRING=localhost:1521/XE

# Optional: Oracle client directory (if not in PATH)
# ORACLE_CLIENT_DIR=C:\\oracle\\instantclient_21_12

# Server configuration
PORT=3000
NODE_ENV=development
`;

    try {
        fs.writeFileSync('.env', envContent);
        console.log('✅ Created .env file');
        console.log('💡 Please update .env with your actual Oracle credentials');
    } catch (error) {
        console.log('❌ Failed to create .env file:', error.message);
    }
}

// Update package.json scripts
function updatePackageScripts() {
    console.log('\n📦 Updating package.json scripts...');
    
    try {
        const packagePath = path.join(__dirname, 'package.json');
        const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
        
        // Add database scripts
        packageJson.scripts = {
            ...packageJson.scripts,
            "db:init": "node db/init.js",
            "db:setup": "node setup-oracle.js",
            "start:oracle": "node -r dotenv/config app.js"
        };
        
        fs.writeFileSync(packagePath, JSON.stringify(packageJson, null, 2));
        console.log('✅ Updated package.json with database scripts');
    } catch (error) {
        console.log('❌ Failed to update package.json:', error.message);
    }
}

// Install dotenv for environment variables
function installDotenv() {
    console.log('\n📥 Installing dotenv package...');
    
    try {
        const { execSync } = require('child_process');
        execSync('npm install dotenv', { stdio: 'inherit' });
        console.log('✅ dotenv package installed');
    } catch (error) {
        console.log('❌ Failed to install dotenv:', error.message);
    }
}

// Main setup function
async function main() {
    console.log('🚀 Starting Oracle setup...\n');
    
    // Check Oracle installation
    if (!checkOracleInstallation()) {
        console.log('\n💥 Oracle setup cannot continue. Please install oracledb first.');
        process.exit(1);
    }
    
    // Install dotenv
    installDotenv();
    
    // Create environment config
    createEnvConfig();
    
    // Update package scripts
    updatePackageScripts();
    
    console.log('\n🎉 Oracle setup completed!');
    console.log('\n📋 Next steps:');
    console.log('1. Install Oracle Database or Oracle Express Edition');
    console.log('2. Update .env file with your Oracle credentials');
    console.log('3. Run: npm run db:init (to create tables)');
    console.log('4. Run: npm run start:oracle (to start with Oracle)');
    console.log('\n💡 For detailed instructions, see README.md');
}

// Run setup
if (require.main === module) {
    main().catch(console.error);
}

module.exports = { main }; 