// const shortid = require("shortid");
// const { constants, responseHelper } = require("../../helper");
// const { Url } = require("../../../../models");

// const shortFn = async (longUrl) => {
//   const shortUrl = await shortid.generate();
//   console.log("short function =========> ", shortUrl);
//   return shortUrl;
// };

// const shortenUrl = async (req, res) => {
//   try {
//     const { long_url, topic } = req.body;
//     const shortUrl = await shortFn(long_url);
//     console.log("shortUrl ======> ", shortUrl);
//     const data = await Url.create({
//       long_url,
//       short_url: shortUrl,
//       topic,
//     });
//     return responseHelper(
//       res,
//       constants.statusCode.successCode,
//       constants.messages.shortUrl,
//       data,
//       "url_short_success"
//     );
//   } catch (error) {
//     console.log("error ==========>", error);
//     //if (transaction) await transaction.rollback();
//     //const catchErrmsg2 = sequelizeError(error);
//     responseHelper(
//       res,
//       constants.statusCode.notFound,
//       constants.messages.shortError,
//       "error",
//       "data_not_found"
//     );
//   }
// };

// const redirect = async (req, res) => {
//   try {
//     const { shortUrl } = req.params;
//     const urlData = await Url.findOne({ where: { short_url: shortUrl } });
//     if (!urlData) {
//       return responseHelper(
//         res,
//         constants.statusCode.notFound,
//         constants.messages.noData,
//         [],
//         "no_data_found"
//       );
//     }
//     const data = {
//       long_url: urlData.long_url,
//     };
//     return responseHelper(
//       res,
//       constants.statusCode.successCode,
//       constants.messages.shortUrl,
//       data,
//       "url_short_success"
//     );
//   } catch (error) {
//     console.log("error ==========>", error);
//     //if (transaction) await transaction.rollback();
//     //const catchErrmsg2 = sequelizeError(error);
//     responseHelper(
//       res,
//       constants.statusCode.notFound,
//       constants.messages.shortError,
//       "error",
//       "data_not_found"
//     );
//   }
// };

// module.exports = {
//   shortenUrl,
//   redirect,
// };

const shortid = require("shortid");
const { constants, responseHelper } = require("../../helper");
const { Url } = require("../../../../models");
const redis = require("../../../../config/redis"); // Import Redis instance

const shortFn = async (longUrl) => {
  const shortUrl = await shortid.generate();
  console.log("short function =========> ", shortUrl);
  return shortUrl;
};

const shortenUrl = async (req, res) => {
  try {
    const { long_url, topic } = req.body;
    const shortUrl = await shortFn(long_url);
    console.log("shortUrl ======> ", shortUrl);

    // Store in DB
    const data = await Url.create({
      long_url,
      short_url: shortUrl,
      topic,
    });

    // Cache the short URL in Redis (Set TTL to 1 day)
    await redis.setex(`shortUrl:${shortUrl}`, 86400, long_url);

    return responseHelper(
      res,
      constants.statusCode.successCode,
      constants.messages.shortUrl,
      data,
      "url_short_success"
    );
  } catch (error) {
    console.log("error ==========>", error);
    responseHelper(
      res,
      constants.statusCode.notFound,
      constants.messages.shortError,
      "error",
      "data_not_found"
    );
  }
};

const redirect = async (req, res) => {
  try {
    const { shortUrl } = req.params;

    // Check Redis cache first
    const cachedLongUrl = await redis.get(`shortUrl:${shortUrl}`);
    if (cachedLongUrl) {
      console.log("Cache hit! Redirecting...");
      return responseHelper(
        res,
        constants.statusCode.successCode,
        constants.messages.shortUrl,
        { long_url_redis: cachedLongUrl },
        "url_short_success"
      );
    }

    // If not in cache, get from DB
    const urlData = await Url.findOne({ where: { short_url: shortUrl } });
    if (!urlData) {
      return responseHelper(
        res,
        constants.statusCode.notFound,
        constants.messages.noData,
        [],
        "no_data_found"
      );
    }

    // Cache in Redis for future requests
    await redis.setex(`shortUrl:${shortUrl}`, 86400, urlData.long_url);

    return responseHelper(
      res,
      constants.statusCode.successCode,
      constants.messages.shortUrl,
      { long_url: urlData.long_url },
      "url_short_success"
    );
  } catch (error) {
    console.log("error ==========>", error);
    responseHelper(
      res,
      constants.statusCode.notFound,
      constants.messages.shortError,
      "error",
      "data_not_found"
    );
  }
};

module.exports = {
  shortenUrl,
  redirect,
};
