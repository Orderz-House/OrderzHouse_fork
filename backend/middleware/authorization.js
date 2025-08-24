const { connection } = require("../models/db");

const authorization = (string) => {
  return function (req, res, next) {
    const role_id = req.token.role;
    const data = [role_id, string];
    const query = `SELECT * FROM role_permission INNER JOIN permissions ON role_permission.permission_id = permissions.id WHERE role_permission.role_id = ($1) AND permissions.permission = ($2)`;
    connection
      .query(query, data)
      .then((result) => {
        if (result.rows.length) {
          next();
        } else {
          throw Error;
        }
      })
      .catch((err) => {
        res.status(400).json({ message: "unauthorized" });
      });
  };
};

module.exports = authorization;