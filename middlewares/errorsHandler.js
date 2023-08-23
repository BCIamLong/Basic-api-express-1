const AppError = require("../utils/appError");

const sendErrorHandlerDev = (err, res) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || "error";

  res.status(err.statusCode).json({
    status: err.status,
    error: err,
    message: err.message,
    stack: err.stack,
  });
};

const sendErrorHandlerProd = (err, res) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || "error";
  console.log(err);
  if (err.isOperational)
    return res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
    });

  //programming, sever, packages,... and some orther error
  res.status(500).json({
    status: "error",
    message: "Something went wrong",
  });
};

const errorValidationHandler = err => {
  const message = Object.values(err.errors)
    .map(el => el.message)
    .join(". ");
  return new AppError(message, 400);
};

const errorCastHandler = err => {
  const message = `Invalid id: ${err.path}: ${err.value}`;
  return new AppError(message, 400);
};

const errorDuplicateHandler = err => {
  const message = `This ${
    Object.keys(err.keyValue)[0]
  } was exits, please use other data`;
  return new AppError(message, 400);
};

const errorJWTExpiredHandler = () =>
  new AppError("Your login turn was expired, please login again", 401);

const errorJWTHandler = () =>
  new AppError(
    "Your login turn not security, please contact with us to know detail", // for example when the payload in token maybe change by 3rd party
    401,
  );

module.exports = (err, req, res, next) => {
  if (process.env.NODE_ENV === "development") sendErrorHandlerDev(err, res);
  if (process.env.NODE_ENV === "production") {
    let errProd = { ...err };
    if (errProd._message && errProd._message === "Validation failed")
      errProd = errorValidationHandler(errProd);
    if (errProd.reason?.name === "BSONError")
      errProd = errorCastHandler(errProd);
    if (errProd.code === 11000) errProd = errorDuplicateHandler(errProd);
    if (errProd.name === "JsonWebTokenError") errProd = errorJWTHandler();
    if (errProd.name === "TokenExpiredError")
      errProd = errorJWTExpiredHandler();

    sendErrorHandlerProd(errProd, res);
  }
};
