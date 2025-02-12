const express = require("express");
const dotenv = require("dotenv").config();
const swaggerUi = require("swagger-ui-express");
//const swaggerDocument = require("./swagger");
const rateLimit = require("express-rate-limit");
//const passport = require("passport");
const session = require("express-session");
const cors = require("cors");
const setupSwagger = require("./swagger");
const redis = require("../../config/redis");

const passport = require("../api/controller/auth/login"); // Import passport config
const db = require("../../models"); // Import Sequelize models
const authRoutes = require("../api/controller/router"); // Import routes

const { sequelize, connectDB } = require("../api/config/db");

const app = express();
app.use(express.json());
app.use(cors());

const PORT = process.env.PORT || 3000;

app.use(
  session({
    secret: "your-secret-key", // Secret to sign the session ID cookie
    resave: false, // Don't save session if unmodified
    saveUninitialized: false, // Don't create a session until something is stored
    cookie: { secure: false }, // Set to true if you're using HTTPS
  })
);

// Initialize Passport and restore authentication state, if any, from the session.
app.use(passport.initialize());
app.use(passport.session());

app.use("/auth", authRoutes);
connectDB().then(() => {
  sequelize
    .sync({ force: false })
    .then(() => {
      console.log("Database synchronized successfully");
    })
    .catch((err) => {
      console.error("Database sync error:", err);
    });
});
setupSwagger(app);
redis.on("connect", () => {
  console.log("✅ Redis connected");
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Swagger Docs available at http://localhost:${PORT}/api-docs`);
});

//app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));
