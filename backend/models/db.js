const { Pool } = require("pg");
const connectionString = process.env.DB_URL;
const pool = new Pool({
  connectionString,
  ssl: {
    rejectUnauthorized: false,
  },
});

// Only connect if not running tests
if (process.env.NODE_ENV !== "test") {
  pool
    .connect()
    .then((res) => {
      console.log(`DB connected to ${res.database}`);
    })
    .catch((err) => {
      console.log(err);
    });
}

module.exports = {pool};
