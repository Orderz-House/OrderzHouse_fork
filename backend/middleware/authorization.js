const { pool } = require("../models/db");

const authorization = (permission) => {
  return async (req, res, next) => {
    try { 
      const role_id = req.token.role;

      const query = `
        SELECT 1
        FROM role_permission 
        INNER JOIN permissions 
          ON role_permission.permission_id = permissions.id
        WHERE role_permission.role_id = $1 
          AND permissions.permission = $2
        LIMIT 1
      `;
      console.log("POOL IS:", pool);

      const result = await pool.query(query, [role_id, permission]);

      if (result.rows.length) {
        return next();
      }

      return res.status(403).json({ message: "unauthorized" });
    } catch (err) {
      console.error("Authorization error:", err);
      return res.status(500).json({ message: "server error" });
    }
  };
};

module.exports = authorization;
