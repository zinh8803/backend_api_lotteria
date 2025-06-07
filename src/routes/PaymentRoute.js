const express = require('express');
const router = express.Router();
const vnpayController = require('../controllers/PaymentController');

router.post('/create_payment_url', vnpayController.createPayment);
router.get('/vnpay-return', vnpayController.vnpayReturn);
module.exports = router;
