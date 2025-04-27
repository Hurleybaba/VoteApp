import mysql from "mysql2/promise";

// Create a connection pool
const pool = mysql.createPool({
  host: "localhost",
  user: "root",
  password: "hurleybaba",
  database: "test",
  waitForConnections: true,
  connectionLimit: 10, // max number of connections
  queueLimit: 0, // unlimited queued requests
});

async function queryDatabase() {
  try {
    const [results] = await pool.execute(
      "SELECT * FROM `table` WHERE `name` = ? AND `age` > ?",
      ["Rick C-137", 53]
    );

    console.log(results);
  } catch (err) {
    console.error(err);
  }
}

// Run the function
queryDatabase();
