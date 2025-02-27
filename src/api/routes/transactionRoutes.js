const express = require("express");
const router = express.Router();
const {
  addFunds,
  transferFunds,
  withdrawFunds,
  transactionHistory,
  validate,
} = require("../controller/transaction/transactionController");
const authMiddleware = require("../controller/auth/authMiddleware");

router.post("/addFunds", authMiddleware, validate("addFunds"), addFunds);

router.post(
  "/transferFunds",
  authMiddleware,
  validate("transferFunds"),
  transferFunds
);

router.post(
  "/withdrawFunds",
  authMiddleware,
  validate("withdrawFunds"),
  withdrawFunds
);

router.get("/transactionHistory", authMiddleware, transactionHistory);

module.exports = router;
