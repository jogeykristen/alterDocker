const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const { User } = require("../../../../models"); // Import User model

passport.use(
  new GoogleStrategy({}, async (accessToken, refreshToken, profile, done) => {
    try {
      // Find or create the user in the database
      let user = await User.findOne({ where: { googleId: profile.id } });
      if (!user) {
        user = await User.create({
          googleId: profile.id,
          email: profile.emails[0].value,
          name: profile.displayName,
          profilePicture: profile.photos[0].value,
        });
      }
      return done(null, user);
    } catch (error) {
      return done(error, null);
    }
  })
);

// Serialize user to store in session
passport.serializeUser((user, done) => {
  done(null, user.id);
});

// Deserialize user from session
passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findByPk(id);
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

module.exports = passport;
