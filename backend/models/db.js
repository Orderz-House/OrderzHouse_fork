const { Pool } = require("pg");
const connectionString = process.env.DB_URL;
const pool = new Pool({
  connectionString,
  ssl: {
    rejectUnauthorized: false,
  },
});
pool
  .connect()
  .then((res) => {
    console.log(`DB connected to ${res.database}`);
  })
  .catch((err) => {
    console.log(err);
  });
const createTable = (req, res) => {
  pool
    .query(
      `=
`
    )
    .then((result) => {
      res.json({
        message: "created",
      });
    })
    .catch((err) => {
      res.json({
        err: err.message,
      });
    });
};
// createTable()

module.exports = {pool};
