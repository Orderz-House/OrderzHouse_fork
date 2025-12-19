import { Pool } from "pg";
import dotenv from "dotenv";

dotenv.config();

const fromUrl = process.env.DB_URL;
const shouldUseSsl = (process.env.DB_SSL || "true").toLowerCase() !== "false";

// 🔹 Config object
const config = fromUrl
  ? {
      connectionString: fromUrl,
      ssl: shouldUseSsl ? { rejectUnauthorized: false } : false,
    }
  : {
      host: process.env.DB_HOST || process.env.PGHOST || "localhost",
      port: Number(process.env.DB_PORT || process.env.PGPORT || 5432),
      database: process.env.DB_NAME || process.env.PGDATABASE,
      user: process.env.DB_USER || process.env.PGUSER,
      password: process.env.DB_PASSWORD || process.env.PGPASSWORD,
      ssl: shouldUseSsl ? { rejectUnauthorized: false } : false,
    };

// 🔹 Initialize pool
const pool = new Pool(config);

// Add event listeners for debugging
pool.on('connect', () => {
  console.log('✅ Database connection established');
});

pool.on('error', (err) => {
  console.error('❌ Database connection error:', err.message);
});

pool.on('remove', () => {
  console.log('⚠️ Database connection removed from pool');
});

// ✅ Test connection once at startup
(async () => {
  try {
    const result = await pool.query("SELECT NOW()");
    console.log("✅ Connected to PostgreSQL! Current time:", result.rows[0].now);
    console.log("📊 Pool stats - Total:", pool.totalCount, "Idle:", pool.idleCount, "Waiting:", pool.waitingCount);
  } catch (err) {
    console.error("❌ DB connection error:", err.message);
  }
})();

export default pool;