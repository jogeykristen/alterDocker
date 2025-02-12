const response = (res, statusCode, message, data, statusText, extraParam) => {
  res.status(statusCode || 404).json({
    message: message || "Error! Something went wrong",
    status: statusCode || 404,
    data: data || {},
    statusText: statusText || {},
    extraParam,
  });
};

module.exports = response;
