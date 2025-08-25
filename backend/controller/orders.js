const { pool } = require("../models/db"); // Import the pool correctly

const createOrders = (req, res) => {
  const client_id = req.token.userId;
  const { category_id, title, description, budget, status, due_date } =
    req.body;

  const query = `
    INSERT INTO orders (client_id, category_id, title, description, budget, status, due_date)
    VALUES ($1, $2, $3, $4, $5, $6, $7)
    RETURNING *
  `;

  const values = [
    client_id,
    category_id,
    title,
    description,
    budget,
    status,
    due_date,
  ];

  pool
    .query(query, values)
    .then((result) => {
      res.status(201).json({
        success: true,
        message: "Order created successfully",
        order: result.rows[0],
      });
    })
    .catch((error) => {
      console.error("Error creating order:", error);
      res.status(500).json({ success: false, error: "Failed to create order" });
    });
};

const getOrders = (req, res) => {
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

  pool
    .query(query, [clientId])
    .then(({ rows }) => {
      res.status(200).json({ success: true, orders: rows });
    })
    .catch((error) => {
      console.error("Error fetching orders:", error);
      res.status(500).json({ success: false, error: "Internal server error" });
    });
};

const getOrdersByCategory = (req, res) => {
  const categoryId = parseInt(req.params.category_id);

  if (!categoryId || isNaN(categoryId)) {
    return res.status(400).json({
      success: false,
      error: "Bad Request: category_id must be a valid number",
    });
  }

  const query = `
    SELECT id, client_id, category_id, title, description, budget, status, created_at, due_date
    FROM orders
    WHERE category_id = $1
      AND is_deleted = FALSE
    ORDER BY created_at DESC
  `;

  pool
    .query(query, [categoryId])
    .then(({ rows }) => {
      res.status(200).json({ success: true, orders: rows });
    })
    .catch((error) => {
      console.error("Error fetching orders by category:", error);
      res.status(500).json({ success: false, error: "Internal server error" });
    });
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
      RETURNING *
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

const getOrderByid = async (req, res) => {
  try {
    const orderId = req.params.id;
    const query = `
      SELECT id, client_id, category_id, title, description, budget, status, created_at, due_date
      FROM orders
      WHERE id = $1 AND is_deleted = FALSE
    `;
    const { rows } = await pool.query(query, [orderId]);
    if (rows.length === 0) {
      return res.status(404).json({ success: false, error: "Order not found" });
    }
    return res.status(200).json({ success: true, order: rows[0] });
  } catch (error) {
    console.error("Error fetching order:", error);
    return res
      .status(500)
      .json({ success: false, error: "Internal server error" });
  }
};

const chooseOrder = (req, res) => {
  const freelancerId = req.token.userId;
  const { order_id } = req.body;

  if (!freelancerId || !order_id) {
    return res.status(400).json({
      success: false,
      message: "Missing freelancer_id or order_id",
    });
  }

  pool
    .query(
      `INSERT INTO order_assignments (order_id, freelancer_id, status)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [order_id, freelancerId, "assigned"]
    )
    .then((result) => {
      res.status(201).json({
        success: true,
        message: "Order assigned successfully",
        assignment: result.rows[0],
      });
    })
    .catch((error) => {
      console.error("Error assigning order:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error",
        error: error.message,
      });
    });
};

const viewOrders = (req, res) => {
  const query = `
    SELECT 
      o.*, 
      c.first_name AS client_first_name, c.email AS client_email,
      f.first_name AS freelancer_first_name, f.email AS freelancer_email,
    FROM orders o
    LEFT JOIN users c ON o.client_id = c.id
    LEFT JOIN order_assignments oa ON o.id = oa.order_id
    LEFT JOIN users f ON oa.freelancer_id = f.id
    WHERE o.is_deleted = FALSE
  `;

  pool
    .query(query)
    .then((result) => {
      res.json({ success: true, orders: result.rows });
    })
    .catch((error) => {
      res.status(500).json({
        success: false,
        message: "Error fetching orders",
        error: error.message,
      });
    });
};

module.exports = {
  getOrders,
  deleteOrder,
  createOrders,
  getOrdersByCategory,
  chooseOrder,
  getOrderByid,
  viewOrders,
};
