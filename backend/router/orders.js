const express = require("express");
const {
  getOrders,
  getOrdersByCategory,
  createOrders,
  deleteOrder,
  getOrderByid,
} = require("../controller/orders");

const ordersRouter = express.Router();
const authentication = require("../middleware/authentication");
const authorization = require("../middleware/authorization");

ordersRouter.get("/getOrders", authentication, authorization("view_orders"), getOrders);
ordersRouter.get("/category/:category_id", authentication, getOrdersByCategory);
ordersRouter.post("/create", authentication, authorization("create_order"), createOrders);
ordersRouter.delete("/delete/:id", authentication, authorization("delete_order"), deleteOrder);
ordersRouter.get("/gerorder/:id",getOrderByid);


module.exports = ordersRouter;
