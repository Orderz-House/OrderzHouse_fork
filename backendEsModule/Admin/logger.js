//(logging functions)
export const logAdminAction = async (userId, email, action, roleId, pool) => {
  try {
    const client = await pool.connect();
    try {
      await client.query(
        `INSERT INTO logs (user_id, email, role_id, action, created_at) 
         VALUES ($1, $2, $3, $4, NOW())`,
        [userId, email, roleId, action]
      );
    } finally {
      client.release();
    }
  } catch (error) {
    console.error("Logging error:", error.message);
  }
};
