import mysql from "mysql2/promise";

// Create a connection pool
const pool = mysql.createPool({
  host: "localhost",
  user: "root",
  password: "hurleybaba",
  database: "votedb",
  waitForConnections: true,
  connectionLimit: 10, // max number of connections
  queueLimit: 0, // unlimited queued requests
});

export default pool;
