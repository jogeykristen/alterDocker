const dotenv = require("dotenv");
dotenv.config();
const { Op } = require("sequelize");
const fs = require("fs");

const statusCode = {
  successCode: 200,
  notFound: 404,
  serverError: 500,
  forbidden: 403,
  unprocessableEntity: 422,
};

const messages = {
  userRegisteration: "user registered successfully",
  existingUser: "user already exists",
  catchError: "some  error occoured",
  noUserFound: "no user found with this email or password",
  userData: "user data fetched successfully",
  walletSuccess: "Wallet balance retrieved successfully",
  noWallet: "Wallet not found",
  noData: "No data found",
  transactionSuccess: "Funds added successfully",
  noRequiredBalance: "You dont have the required balance",
  fundTransfer: "Fund has been transffered successfully",
  noTransaction: "No transactions found",
  transactionHistorySuccess: "Transaction history retrieved successfully",
};

module.exports = {
  statusCode,
  messages,
};
