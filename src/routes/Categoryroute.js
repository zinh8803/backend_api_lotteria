const express = require("express");
const { createCategory, getAllCategories, getCategoryById, updateCategory, deleteCategory } = require("../controllers/CategoryController");
const { upload_category } = require("../middleware/upload");
const { checkAdmin } = require("../middleware/auth");

const router = express.Router();

router.get("/categories", getAllCategories);
router.post("/categories", upload_category,checkAdmin, createCategory);
router.get("/categories/:id", getCategoryById); 
router.put("/categories/:id", upload_category,checkAdmin, updateCategory); 
router.delete("/categories/:id",checkAdmin ,deleteCategory); 

module.exports = router;
