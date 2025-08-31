// Oracle Database Configuration
const oracledb = require('oracledb');

// Database connection configuration
const dbConfig = {
    user: process.env.DB_USER || 'system',
    password: process.env.DB_PASSWORD || 'admin1234',
    connectString: process.env.DB_CONNECT_STRING || 'XE',
    
    // Connection pool settings
    poolMin: 2,
    poolMax: 10,
    poolIncrement: 1,
    
    // Oracle 11g specific settings
    events: false,  // Disable events for Oracle 11g compatibility
    
    // Optional: Set Oracle client directory if needed
    // libDir: 'C:\\oracle\\instantclient_11_2'
};

// Initialize Oracle client
async function initializeOracle() {
    try {
        // Set Oracle client directory if needed
        // oracledb.initOracleClient({ libDir: 'C:\\oracle\\instantclient_11_2' });
        
        console.log('🔍 Trying to connect to Oracle 11g...');
        console.log(`📡 Connection string: ${dbConfig.connectString}`);
        
        // Try different connection methods for Oracle 11g
        let connection;
        
        // Method 1: Try with current config
        try {
            await oracledb.createPool(dbConfig);
            console.log('✅ Oracle connection pool created successfully');
            
            connection = await oracledb.getConnection();
            await connection.close();
            console.log('✅ Oracle connection test successful');
            return;
        } catch (error) {
            console.log(`⚠️  Method 1 failed: ${error.message}`);
        }
        
        // Method 2: Try without pool (direct connection)
        try {
            console.log('🔄 Trying direct connection...');
            connection = await oracledb.getConnection(dbConfig);
            await connection.close();
            console.log('✅ Direct Oracle connection successful');
            
            // Now create pool
            await oracledb.createPool(dbConfig);
            console.log('✅ Oracle connection pool created successfully');
            return;
        } catch (error) {
            console.log(`⚠️  Method 2 failed: ${error.message}`);
        }
        
        // Method 3: Try with different connection string format
        try {
            console.log('🔄 Trying alternative connection format...');
            const altConfig = {
                ...dbConfig,
                connectString: dbConfig.connectString.replace(':', '/')
            };
            
            connection = await oracledb.getConnection(altConfig);
            await connection.close();
            console.log('✅ Alternative connection successful');
            
            // Update config and create pool
            dbConfig.connectString = altConfig.connectString;
            await oracledb.createPool(dbConfig);
            console.log('✅ Oracle connection pool created successfully');
            return;
        } catch (error) {
            console.log(`⚠️  Method 3 failed: ${error.message}`);
        }
        
        throw new Error('All connection methods failed');
        
    } catch (error) {
        console.error('❌ Oracle initialization failed:', error.message);
        console.log('💡 Make sure Oracle is running and credentials are correct');
        console.log('💡 Check if Oracle Instant Client is installed and in PATH');
        throw error;
    }
}

// Get connection from pool
async function getConnection() {
    try {
        return await oracledb.getConnection();
    } catch (error) {
        console.error('❌ Failed to get database connection:', error.message);
        throw error;
    }
}

// Execute query with parameters
async function executeQuery(sql, binds = [], options = {}) {
    let connection;
    try {
        connection = await getConnection();
        
        const result = await connection.execute(sql, binds, {
            outFormat: oracledb.OUT_FORMAT_OBJECT,
            autoCommit: true,
            ...options
        });
        
        return result;
    } catch (error) {
        console.error('❌ Query execution failed:', error.message);
        throw error;
    } finally {
        if (connection) {
            try {
                await connection.close();
            } catch (error) {
                console.error('❌ Failed to close connection:', error.message);
            }
        }
    }
}

// Close connection pool
async function closePool() {
    try {
        await oracledb.getPool().close();
        console.log('✅ Oracle connection pool closed');
    } catch (error) {
        console.error('❌ Failed to close connection pool:', error.message);
    }
}

module.exports = {
    initializeOracle,
    getConnection,
    executeQuery,
    closePool,
    dbConfig
}; 