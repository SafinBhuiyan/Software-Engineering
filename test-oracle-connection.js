// test-oracle-connection.js

const oracledb = require('oracledb');
// Enable Thick mode for Oracle 11g
oracledb.initOracleClient({ libDir: 'C:\\instantclient_23_9' }); // Update path if your Instant Client is elsewhere

async function testConnection() {
  try {
    await oracledb.createPool({
      user: 'SE',
      password: 'Se123456',
      connectString: '//oracle-202503-0.cloudclusters.net:10021/XE' // Change XE if your service name is different
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
