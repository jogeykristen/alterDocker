const express = require("express");
const passport = require("./auth/login");
const { shortenUrl, redirect } = require("./url/shortUrl");
const {
  getUrlAnalytics,
  getOverallAnalytics,
} = require("./analytics/analytics");

const router = express.Router();

// Google Authentication Route
router.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

// Google OAuth Callback
router.get(
  "/google/callback",
  passport.authenticate("google", { failureRedirect: "/" }),
  (req, res) => {
    res.send(`Welcome, ${req.user.name}`);
  }
);

// Logout Route
router.get("/logout", (req, res) => {
  req.logout(() => {
    res.redirect("/");
  });
});

router.post("/shorten", shortenUrl);
router.get("/redirect/:shortUrl", redirect);

router.get("/analytics/:shortUrl", getUrlAnalytics);
router.get("/analytics/overall", getOverallAnalytics);

module.exports = router;
