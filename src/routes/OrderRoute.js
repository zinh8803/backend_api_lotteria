// orderRoute.js
const express = require("express");
const router = express.Router();
const orderController = require("../controllers/OrderController");
const { checkUser } = require("../middleware/auth");


router.post("/", orderController.createOrder);

router.post("/:id/user=:user_id", orderController.cancelOrder);

router.get("/user", checkUser, orderController.getUserOrders);
router.get("/detail=:id", orderController.getOrderById);
router.get("/", orderController.getAllOrders);

module.exports = router;