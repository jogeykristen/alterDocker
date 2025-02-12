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
  shortUrl: "The url is shortend successfully",
  shortError: "some error occoured while make the url short",
  noData: "No data found",
};

module.exports = {
  statusCode,
  messages,
};
