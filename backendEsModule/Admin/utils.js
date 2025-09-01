//utility functions
export const checkTableExists = async (tableName, pool) => {
  const client = await pool.connect();
  try {
    const result = await client.query(
      `SELECT table_name FROM information_schema.tables WHERE table_name = $1`,
      [tableName]
    );
    return result.rows.length > 0;
  } catch {
    return false;
  } finally {
    client.release();
  }
};