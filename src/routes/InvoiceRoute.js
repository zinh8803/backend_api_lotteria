// orderRoute.js
const express = require("express");
const router = express.Router();
const { getallinvoice } = require("../controllers/InvoiceController");
const { checkUser } = require("../middleware/auth");



router.get("/", getallinvoice);

module.exports = router;