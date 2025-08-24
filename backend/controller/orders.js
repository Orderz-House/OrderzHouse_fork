const pool = require("../models/db");

const getOrders = async (req, res) => {
  try {
    const clientId = req.token.userId;

    if (!clientId) {
      return res
        .status(401)
        .json({ success: false, error: "Unauthorized: client_id missing" });
    }

    const query = `
      SELECT id, client_id, category_id, title, description, budget, status, created_at, due_date
      FROM orders
      WHERE client_id = $1
      ORDER BY created_at DESC
    `;

    const { rows } = await pool.query(query, [clientId]);

    return res.status(200).json({ success: true, orders: rows });
  } catch (error) {
    console.error("Error fetching orders:", error);
    return res
      .status(500)
      .json({ success: false, error: "Internal server error" });
  }
};
const deleteOrder = async (req, res) => {
  try {
    const clientId = req.token.userId;
    const orderId = req.params.id;

    if (!clientId) {
      return res
        .status(401)
        .json({ success: false, error: "Unauthorized: client_id missing" });
    }

    const deleteQuery = `
      UPDATE orders
SET is_deleted = TRUE
WHERE id = $1 AND client_id = $2
RETURNING *;
    `;

    const { rows } = await pool.query(deleteQuery, [orderId, clientId]);

    if (rows.length === 0) {
      return res
        .status(404)
        .json({ success: false, error: "Order not found or unauthorized" });
    }

    return res.status(200).json({ success: true, message: "Order deleted" });
  } catch (error) {
    console.error("Error deleting order:", error);
    return res
      .status(500)
      .json({ success: false, error: "Internal server error" });
  }
};

module.exports = {
  getOrders,
  deleteOrder,
};
