const express = require("express");
const {
  getOrders,
  getOrdersByCategory,
  createOrders,
  chooseOrder,
} = require("../controller/orders");
const authentication = require("../middleware/authentication");

const ordersRouter = express.Router();
const authentication = require("../middleware/authentication");
const authorization = require("../middleware/authorization");

ordersRouter.get("/getOrders", authentication, authorization("view_orders"), getOrders);
ordersRouter.get("/category/:category_id", authentication, getOrdersByCategory);
ordersRouter.post("/create", authentication, authorization("create_order"), createOrders);
ordersRouter.delete("/delete/:id", authentication, authorization("delete_order"), deleteOrder);
ordersRouter.get("/gerorder/:id",getOrderByid);

ordersRouter.get("/getOrders", authentication, getOrders);
ordersRouter.get(
  "/getOrders/category/:category_id",
  authentication,
  getOrdersByCategory
);
ordersRouter.post("/create", authentication, createOrders);
ordersRouter.post("/choose", authentication, chooseOrder);

module.exports = ordersRouter;
