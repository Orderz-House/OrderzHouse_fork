const express = require("express");
const {
  getOrders,
  getOrdersByCategory,
  createOrders,
  chooseOrder,
  deleteOrder,
} = require("../controller/orders");

const ordersRouter = express.Router();
const authentication = require("../middleware/authentication");
const authorization = require("../middleware/authorization");

ordersRouter.get(
  "/getOrders",
  authentication,
  getOrders
);

ordersRouter.delete(
  "/delete/:id",
  authentication,
  deleteOrder
);

ordersRouter.get(
  "/getOrders/category/:category_id",
  authentication,
  getOrdersByCategory
);
ordersRouter.post("/create", authentication, createOrders);
ordersRouter.post("/choose", authentication, chooseOrder);

module.exports = ordersRouter;
