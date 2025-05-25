import pool from "../database.js";

const cleanExpiredTokens = async () => {
  try {
    await pool.query("DELETE FROM blacklisted_tokens WHERE expires_at < NOW()");
    console.log("Cleaned expired tokens");
  } catch (error) {
    console.error("Token cleanup failed:", error);
  }
};

setInterval(cleanExpiredTokens, 24 * 60 * 60 * 1000);
