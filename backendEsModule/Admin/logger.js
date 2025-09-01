//(logging functions)
export const logAdminAction = async (userId, email, action, pool) => {
  try {
    const client = await pool.connect();
    
    try {
      await client.query(
        `INSERT INTO logs (user_id, action, created_at) 
         VALUES ($1, $2, NOW())`,
        [userId, action]
      );
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Logging error:', error.message);
  }
};