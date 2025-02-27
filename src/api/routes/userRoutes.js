const express = require("express");
const router = express.Router();
const {
  register,
  login,
  getProfile,
  validate,
} = require("../controller/user/userController");
const authMiddleware = require("../controller/auth/authMiddleware");

router.post("/register", validate("register"), register);
router.post("/login", validate("login"), login);
router.get("/profile", authMiddleware, getProfile);

module.exports = router;
