// test-oracle-connection.js

const oracledb = require('oracledb');
// Enable Thick mode for Oracle 11g
// oracledb.initOracleClient({ libDir: 'C:\\instantclient_23_9' }); // Update path if your Instant Client is elsewhere

async function testConnection() {
  try {
    await oracledb.createPool({
      user: 'SYSTEM',
      password: 'oracle123',
      connectString: 'localhost:1521/XEPDB1'
    });
    const connection = await oracledb.getConnection();
    const result = await connection.execute('SELECT 1 FROM DUAL');
    console.log('Connection successful:', result.rows);
    await connection.close();
    await oracledb.getPool().close();
  } catch (err) {
    console.error('Connection failed:', err);
  }
}

testConnection();
