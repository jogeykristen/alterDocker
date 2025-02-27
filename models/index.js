const sequelize = require("../config/db");
const User = require("./user");
const Wallet = require("./wallet");
const Transaction = require("./transaction");

User.hasOne(Wallet, { foreignKey: "userId", onDelete: "CASCADE" });
Wallet.belongsTo(User, { foreignKey: "userId", onDelete: "CASCADE" });
Transaction.belongsTo(User, { foreignKey: "userId", onDelete: "CASCADE" });
Wallet.hasMany(Transaction, { foreignKey: "userId" });

const syncDatabase = async () => {
  try {
    await sequelize.sync({ alter: true });
    console.log("Database synced successfully.");
  } catch (error) {
    console.error("Database sync failed:", error);
  }
};

module.exports = { User, Wallet, Transaction, syncDatabase };
