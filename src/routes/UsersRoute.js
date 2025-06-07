const express = require("express");

const { registerUser, loginUser, getUserById, deleteUser, updateUser, updateAvatar, logout } = require("../controllers/UserController");
const { upload_avatar } = require("../middleware/upload");
const { checkAdmin, checkUser } = require("../middleware/auth");

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.get("/detail", checkUser, getUserById);
router.put("/update", checkUser, upload_avatar, updateUser);
router.delete("/:id", deleteUser);
router.put("/update-avatar", checkUser, upload_avatar, updateAvatar);
router.post("/logout", logout);

module.exports = router;

module.exports = router;