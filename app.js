const express = require("express");
const morgan = require("morgan");
const productsRouter = require("./routes/productRouter");

const app = express();

app.use(morgan("dev"));
app.use(express.json());

app.use("/api/v1/products", productsRouter);

module.exports = app;
