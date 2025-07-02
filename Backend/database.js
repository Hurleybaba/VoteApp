import mysql from "mysql2/promise";
import {config} from "dotenv";
config();

const pool = mysql.createPool(process.env.DATABASE_URL);

export default pool;
