const express = require("express");
const router = express.Router();
const {
  getWalletBalance,
  validateRequest,
} = require("../controller/wallet/walletController");
const authMiddleware = require("../controller/auth/authMiddleware");

router.get("/getBalance", authMiddleware, getWalletBalance);

module.exports = router;
