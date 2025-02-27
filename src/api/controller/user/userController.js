const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { User, Wallet } = require("../../../../models");
const { constants, responseHelper } = require("../../helper");
const { check, validationResult } = require("express-validator");

exports.validateRequest = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }
  next();
};

const JWT_SECRET = "your_secret_key";

exports.register = async (req, res) => {
  try {
    const { name, email, password, currency } = req.body;

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

    const existingUser = await User.findOne({ where: { email } });
    if (existingUser)
      return responseHelper(
        res,
        constants.statusCode.unprocessableEntity,
        constants.messages.existingUser,
        [],
        "user_already_exists"
      );

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await User.create({
      name,
      email,
      password: hashedPassword,
      currency,
    });

    await Wallet.create({ userId: newUser.id, balance: 0, currency });

    return responseHelper(
      res,
      constants.statusCode.successCode,
      constants.messages.userRegisteration,
      newUser,
      "user_registered_successfully"
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

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

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

    const user = await User.findOne({ where: { email } });
    if (!user)
      return responseHelper(
        res,
        constants.statusCode.unprocessableEntity,
        constants.messages.noUserFound,
        [],
        "no_user_found"
      );

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return responseHelper(
        res,
        constants.statusCode.unprocessableEntity,
        constants.messages.noUserFound,
        [],
        "no_user_found"
      );

    const token = jwt.sign({ userId: user.id, email: user.email }, JWT_SECRET, {
      expiresIn: "1h",
    });

    return responseHelper(
      res,
      constants.statusCode.successCode,
      constants.messages.userRegisteration,
      token,
      "user_loggedIn_successfully"
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

exports.getProfile = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.userId, {
      attributes: { exclude: ["password"] },
    });
    if (!user) {
      return responseHelper(
        res,
        constants.statusCode.unprocessableEntity,
        constants.messages.noUserFound,
        [],
        "no_user_found"
      );
    }

    return responseHelper(
      res,
      constants.statusCode.successCode,
      constants.messages.userData,
      user,
      "user_details_fetched_successfully"
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

exports.validate = (method) => {
  switch (method) {
    case "register": {
      return [
        check("name")
          .notEmpty()
          .withMessage("Name cannot be empty")
          .isLength({ min: 2, max: 50 })
          .withMessage("Name must be between 2 and 50 characters"),
        check("email")
          .notEmpty()
          .withMessage("Email cannot be empty")
          .isEmail()
          .withMessage("Invalid email format"),
        check("password")
          .notEmpty()
          .withMessage("Password cannot be empty")
          .isLength({ min: 6 })
          .withMessage("Password must be at least 6 characters long"),
        check("currency")
          .notEmpty()
          .withMessage("Currency cannot be empty")
          .isIn(["USD", "EUR", "INR"])
          .withMessage("Currency must be USD, EUR, or INR"),
      ];
    }
    case "login": {
      return [
        check("email")
          .notEmpty()
          .withMessage("Email cannot be empty")
          .isEmail()
          .withMessage("Invalid email format"),
        check("password").notEmpty().withMessage("Password cannot be empty"),
      ];
    }
  }
};
