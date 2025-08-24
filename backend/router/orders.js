const express = require("express");
const {
  getOrders,
  getOrdersByCategory,
  createOrders,
} = require("../controller/orders");

const ordersRouter = express.Router();

ordersRouter.get("/getOrders", getOrders);
ordersRouter.get("/category/:category_id", getOrdersByCategory);
ordersRouter.post("/create", createOrders);

module.exports = ordersRouter;
