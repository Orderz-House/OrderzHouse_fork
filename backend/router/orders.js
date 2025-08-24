const express = require("express");
const {
  getOrders,
  getOrdersByCategory,
  createOrders,
  chooseOrder,
  deleteOrder,
  getOrderByid,
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
  authorization("delete_order"),
  deleteOrder
);

ordersRouter.get(
  "/getOrders/category/:category_id",
  authentication,
  getOrdersByCategory
);
ordersRouter.post("/create", authentication, createOrders);
ordersRouter.post("/choose", authentication, chooseOrder);
ordersRouter.get("/getorder/:id", authentication, getOrderByid);

module.exports = ordersRouter;
