const express = require("express");
const morgan = require("morgan");
const productsRouter = require("./routes/productRouter");
const errorsHandler = require("./middlewares/errorsHandler");
const AppError = require("./utils/appError");

const app = express();

app.use(morgan("dev"));
app.use(express.json());
app.use((req, res, next) => {
  // console.log(x);
  console.log("hello process");
  next();
});

app.use("/api/v1/products", productsRouter);

//handle error for router not found
app.all("*", (req, res, next) => {
  next(new AppError(`Invalid link: ${req.originalUrl} `, 404));
});
// console.log(x);
app.use(errorsHandler);

module.exports = app;
