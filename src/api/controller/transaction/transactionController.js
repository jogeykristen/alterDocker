const { Wallet, Transaction } = require("../../../../models");
const { constants, responseHelper } = require("../../helper");
const { check, validationResult } = require("express-validator");
const { convertCurrency } = require("../../utils/currencyConverter");
const rateLimiter = require("../auth/rateLimiter");
const { Op } = require("sequelize");

const MAX_DAILY_LIMIT = 10000;
const HIGH_VALUE_THRESHOLD = 5000;
const SUSPICIOUS_TIMEFRAME = 10 * 60 * 1000;

const addFunds = async (req, res) => {
  try {
    console.log("hiiii");
    const userId = req.user.userId;
    const { amount } = req.body;

    console.log("bef val =============", userId);

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return responseHelper(
        res,
        constants.statusCode.unprocessableEntity,
        errors.array(),
        [],
        "validation_error"
      );
    }

    console.log("afer val =============", userId);

    const wallet = await Wallet.findOne({ where: { userId } });
    if (!wallet) {
      return responseHelper(
        res,
        constants.statusCode.notFound,
        constants.messages.noWallet,
        [],
        "wallet_not_found"
      );
    }

    wallet.balance += parseFloat(amount);
    await wallet.save();

    await Transaction.create({ userId, type: "deposit", amount });

    return responseHelper(
      res,
      constants.statusCode.successCode,
      constants.messages.transactionSuccess,
      wallet,
      "fund_added_successfully"
    );
  } catch (error) {
    responseHelper(
      res,
      constants.statusCode.notFound,
      constants.messages.catchError,
      "error",
      "data_not_found"
    );
  }
};

const transferFunds = async (req, res) => {
  try {
    const senderId = req.user.userId;
    const { recipientId, amount } = req.body;
    console.log("before validation =", senderId);

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return responseHelper(
        res,
        constants.statusCode.unprocessableEntity,
        errors.array(),
        [],
        "validation_error"
      );
    }
    console.log("after validation =", senderId);

    const senderWallet = await Wallet.findOne({ where: { userId: senderId } });
    const recipientWallet = await Wallet.findOne({
      where: { userId: recipientId },
    });

    if (!senderWallet || !recipientWallet) {
      return responseHelper(
        res,
        constants.statusCode.notFound,
        constants.messages.noWallet,
        [],
        "user_not_found"
      );
    }

    if (senderWallet.balance < amount) {
      return responseHelper(
        res,
        constants.statusCode.unprocessableEntity,
        constants.messages.noRequiredBalance,
        [],
        "insufficient_fund"
      );
    }

    let finalAmount = parseFloat(amount);
    if (senderWallet.currency !== recipientWallet.currency) {
      finalAmount = await convertCurrency(
        finalAmount,
        senderWallet.currency,
        recipientWallet.currency
      );
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const dailyTransactions = await Transaction.findAll({
      where: {
        userId: senderId,
        createdAt: { [Op.gte]: today },
      },
    });

    const dailyTotal = dailyTransactions.reduce(
      (sum, txn) => sum + txn.amount,
      0
    );
    if (dailyTotal + finalAmount > MAX_DAILY_LIMIT) {
      return responseHelper(
        res,
        constants.statusCode.unprocessableEntity,
        "Daily transaction limit exceeded.",
        [],
        "transaction_limit_exceeded"
      );
    }

    const recentTransactions = await Transaction.findAll({
      where: {
        userId: senderId,
        createdAt: { [Op.gte]: new Date(Date.now() - SUSPICIOUS_TIMEFRAME) },
        amount: { [Op.gte]: HIGH_VALUE_THRESHOLD },
      },
    });

    if (recentTransactions.length >= 3) {
      return responseHelper(
        res,
        constants.statusCode.unprocessableEntity,
        "Suspicious activity detected. Please wait before making another large transaction.",
        [],
        "fraud_detected"
      );
    }

    senderWallet.balance -= parseFloat(amount);
    recipientWallet.balance += finalAmount;

    await senderWallet.save();
    await recipientWallet.save();

    await Transaction.create({
      userId: senderId,
      type: "transfer",
      amount,
      recipientId,
    });

    return responseHelper(
      res,
      constants.statusCode.successCode,
      constants.messages.fundTransfer,
      senderWallet,
      "fund_transferred_successfully"
    );
  } catch (error) {
    console.error("Transfer error:", error);
    responseHelper(
      res,
      constants.statusCode.notFound,
      constants.messages.catchError,
      "error",
      "data_not_found"
    );
  }
};

const withdrawFunds = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { amount } = req.body;

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return responseHelper(
        res,
        constants.statusCode.unprocessableEntity,
        errors.array(),
        [],
        "validation_error"
      );
    }

    const wallet = await Wallet.findOne({ where: { userId } });
    if (!wallet)
      return responseHelper(
        res,
        constants.statusCode.notFound,
        constants.messages.noWallet,
        [],
        "user_not_found"
      );

    if (wallet.balance < amount)
      return responseHelper(
        res,
        constants.statusCode.unprocessableEntity,
        constants.messages.noRequiredBalance,
        [],
        "insufficient_fund"
      );

    wallet.balance -= parseFloat(amount);
    await wallet.save();

    await Transaction.create({ userId, type: "withdraw", amount });

    return responseHelper(
      res,
      constants.statusCode.successCode,
      constants.messages.fundTransfer,
      wallet,
      "fund_withdrawn_successfully"
    );
  } catch (error) {
    responseHelper(
      res,
      constants.statusCode.notFound,
      constants.messages.catchError,
      "error",
      "data_not_found"
    );
  }
};

const transactionHistory = async (req, res) => {
  try {
    const userId = req.user.userId;

    const transactions = await Transaction.findAll({
      where: { userId },
      order: [["createdAt", "DESC"]],
    });

    if (!transactions.length) {
      return responseHelper(
        res,
        constants.statusCode.notFound,
        constants.messages.noTransaction,
        [],
        "no_transactions"
      );
    }

    return responseHelper(
      res,
      constants.statusCode.successCode,
      constants.messages.transactionHistorySuccess,
      transactions,
      "transaction_history_success"
    );
  } catch (error) {
    responseHelper(
      res,
      constants.statusCode.notFound,
      constants.messages.catchError,
      "error",
      "data_not_found"
    );
  }
};

const validate = (method) => {
  switch (method) {
    case "addFunds":
      return [
        check("amount")
          .notEmpty()
          .withMessage("Amount is required")
          .isFloat({ gt: 0 })
          .withMessage("Amount must be a positive number"),
      ];
    case "transferFunds":
      return [
        check("recipientId").notEmpty().withMessage("Recipient ID is required"),
        check("amount")
          .notEmpty()
          .withMessage("Amount is required")
          .isFloat({ gt: 0 })
          .withMessage("Amount must be a positive number"),
      ];
    case "withdrawFunds":
      return [
        check("amount")
          .notEmpty()
          .withMessage("Amount is required")
          .isFloat({ gt: 0 })
          .withMessage("Amount must be a positive number"),
      ];
  }
};

module.exports = {
  addFunds,
  transferFunds: rateLimiter(5, 60, transferFunds),
  withdrawFunds,
  transactionHistory,
  validate,
};
