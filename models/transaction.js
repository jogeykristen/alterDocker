const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const Transaction = sequelize.define(
  "Transaction",
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    userId: { type: DataTypes.INTEGER, allowNull: false },
    type: {
      type: DataTypes.ENUM("deposit", "transfer", "withdraw"),
      allowNull: false,
    },
    amount: { type: DataTypes.FLOAT, allowNull: false },
    recipientId: { type: DataTypes.INTEGER, allowNull: true },
  },
  { timestamps: true }
);

module.exports = Transaction;
