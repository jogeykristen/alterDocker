const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");
const User = require("./user");

const Wallet = sequelize.define(
  "Wallet",
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      unique: true,
      references: { model: User, key: "id" },
    },
    balance: { type: DataTypes.FLOAT, defaultValue: 0 },
    currency: { type: DataTypes.STRING, allowNull: false, defaultValue: "USD" },
  },
  {
    timestamps: true,
  }
);

module.exports = Wallet;
