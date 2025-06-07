const express = require("express");
const { createProduct, getAllProducts, getProductById, deleteProduct, updateProduct, getallproductsbycategory, searchProductsByName } = require("../controllers/ProductController");
const { upload_product } = require("../middleware/upload");
const { checkAdmin, checkUser } = require("../middleware/auth");
const router = express.Router();

router.post("/products", upload_product, createProduct);
router.get("/products", getAllProducts);
router.get("/products/category/:category_id", getallproductsbycategory);
router.get("/products/:id", getProductById);
router.put("/products/:id", upload_product, checkAdmin, updateProduct);
router.delete("/products/:id", checkAdmin, deleteProduct);
router.get("/searching", searchProductsByName);

module.exports = router;
