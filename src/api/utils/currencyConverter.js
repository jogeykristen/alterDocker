const axios = require("axios");

const EXCHANGE_RATE_API = "https://api.exchangerate-api.com/v4/latest/";

const convertCurrency = async (amount, fromCurrency, toCurrency) => {
  try {
    if (fromCurrency === toCurrency) return amount;

    const response = await axios.get(`${EXCHANGE_RATE_API}${fromCurrency}`);
    const exchangeRate = response.data.rates[toCurrency];

    if (!exchangeRate) throw new Error("Invalid currency code");

    return amount * exchangeRate;
  } catch (error) {
    console.error("Currency conversion failed:", error);
    return null;
  }
};

module.exports = { convertCurrency };
