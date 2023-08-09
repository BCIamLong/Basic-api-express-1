const fs = require("fs");
const dotenv = require("dotenv");
const mogoose = require("mongoose");
const { default: mongoose } = require("mongoose");
const Product = require("../models/productModel");

dotenv.config({ path: "./config.env" });

const products = JSON.parse(fs.readFileSync(`${__dirname}/products.json`));

// const DB_CLOUD = process.env.DATABASE.replace('<PASSWORD>', process.env.PASSWORD);
const DB_LOCAL = process.env.DATABASE_LOCAL;
(async () => {
  try {
    await mogoose.connect(DB_LOCAL);
    console.log("Connect DB success");
  } catch (err) {
    console.log(err);
  }
})();

const importData = async (model, data) => {
  try {
    await model.insertMany(data);
    console.log("Import data success");
  } catch (err) {
    console.log(err);
  }
  mogoose.connection.close();
};
const deleteData = async (model) => {
  try {
    await model.deleteMany();
    console.log("Delete data success");
  } catch (err) {
    console.log(err);
  }
  mongoose.connection.close();
};

if (process.argv[2] === "--import-products") importData(Product, products);
if (process.argv[2] === "--delete-products") deleteData(Product);
