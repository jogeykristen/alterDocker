require("dotenv").config();
const express = require("express");
const { syncDatabase } = require("../../models");
const userRoutes = require("../api/routes/userRoutes");
const walletRoutes = require("../api/routes/walletRoutes");
const transactionRoutes = require("../api/routes/transactionRoutes");

const app = express();
app.use(express.json());

app.use("/users", userRoutes);
app.use("/wallet", walletRoutes);
app.use("/transaction", transactionRoutes);

syncDatabase().then(() => {
  app.listen(process.env.PORT, () =>
    console.log(`Server running on port ${process.env.PORT}`)
  );
});
