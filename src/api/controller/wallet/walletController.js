const { Wallet } = require("../../../../models");
const { constants, responseHelper } = require("../../helper");

exports.getWalletBalance = async (req, res) => {
  try {
    const userId = req.user.userId;

    const wallet = await Wallet.findOne({ where: { userId } });

    if (!wallet) {
      return responseHelper(
        res,
        constants.statusCode.notFound,
        constants.messages.noWallet,
        [],
        "wallet_not_found"
      );
    }

    return responseHelper(
      res,
      constants.statusCode.successCode,
      constants.messages.walletSuccess,
      { balance: wallet.balance, currency: wallet.currency },
      "wallet_balance_fetched"
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
