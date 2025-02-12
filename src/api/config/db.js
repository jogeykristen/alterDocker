// const { Sequelize } = require("sequelize");
// const dotenv = require("dotenv");

// dotenv.config();

// const sequelize = new Sequelize(
//   process.env.DB_NAME,
//   process.env.DB_USER,
//   process.env.DB_PASS,
//   {
//     host: process.env.DB_HOST,
//     dialect: "postgres",
//     logging: false,
//   }
// );

// async function connectDB() {
//   try {
//     await sequelize.authenticate();
//     console.log("Database connected successfully");
//   } catch (error) {
//     console.error("Database connection error:", error);
//     process.exit(1);
//   }
// }

// module.exports = { sequelize, connectDB };

const { Sequelize } = require("sequelize");
const dotenv = require("dotenv");

dotenv.config();

const config = require("../../../config/config")[
  process.env.NODE_ENV || "development"
];

const sequelize = new Sequelize(
  config.database,
  config.username,
  config.password,
  {
    host: config.host,
    dialect: config.dialect,
    logging: false,
  }
);

async function connectDB() {
  try {
    await sequelize.authenticate();
    console.log("✅ Database connected successfully");
  } catch (error) {
    console.error("❌ Database connection error:", error);
    process.exit(1);
  }
}

module.exports = { sequelize, connectDB };
