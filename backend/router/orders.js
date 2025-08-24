const express = require("express");
const {
  getOrders,
  getOrdersByCategory,
  createOrders,
  chooseOrder,
} = require("../controller/orders");
const authentication = require("../middleware/authentication");

const ordersRouter = express.Router();

ordersRouter.get("/getOrders", authentication, getOrders);
ordersRouter.get(
  "/getOrders/category/:category_id",
  authentication,
  getOrdersByCategory
);
ordersRouter.post("/create", authentication, createOrders);
ordersRouter.post("/choose", authentication, chooseOrder);

module.exports = ordersRouter;
