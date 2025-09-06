import { Pool } from "pg";
import dotenv from "dotenv";

dotenv.config();

const fromUrl = process.env.DB_URL;
const shouldUseSsl = (process.env.DB_SSL || "true").toLowerCase() !== "false";

// Fallback to discrete env vars if DB_URL is not provided
const host = process.env.DB_HOST || process.env.PGHOST || "localhost";
const port = Number(process.env.DB_PORT || process.env.PGPORT || 5432);
const database = process.env.DB_NAME || process.env.PGDATABASE || undefined;
const user = process.env.DB_USER || process.env.PGUSER || undefined;
const password = process.env.DB_PASSWORD || process.env.PGPASSWORD || undefined;

const pool = new Pool(
  fromUrl
    ? {
        connectionString: fromUrl,
        ssl: shouldUseSsl ? { rejectUnauthorized: false } : false,
      }
    : {
        host,
        port,
        database,
        user,
        password,
        ssl: shouldUseSsl ? { rejectUnauthorized: false } : false,
      }
);

// ✅ Test connection right away
(async () => {
  try {
    const result = await pool.query("SELECT NOW()");
    console.log(
      "✅ Connected to PostgreSQL! Current time:",
      result.rows[0].now
    );
  } catch (err) {
    console.error("❌ DB connection error:", err.message);
  }
})();

export default pool;
export { pool };
