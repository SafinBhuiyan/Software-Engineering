// db/oracle.js
const oracledb = require('oracledb');

// Enable Thick mode for Oracle 11g
oracledb.initOracleClient({ libDir: 'C:\\instantclient_23_9' }); // Update path if needed

const dbConfig = {
  user: 'SYSTEM',
  password: 'admin1234',
  connectString: 'localhost/ORCL', // Update if your service name is different
};

async function getConnection() {
  return oracledb.getConnection(dbConfig);
}

async function execute(query, params = []) {
  let connection;
  try {
    connection = await getConnection();
    const result = await connection.execute(query, params, { outFormat: oracledb.OUT_FORMAT_OBJECT });
    return result.rows;
  } catch (err) {
    console.error('DB Error:', err);
    throw err;
  } finally {
    if (connection) {
      try { await connection.close(); } catch (e) { /* ignore */ }
    }
  }
}

module.exports = { execute };
