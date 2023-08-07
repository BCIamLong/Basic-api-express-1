const Product = require("../models/productModel");

const getAllProduct = async (_, res) => {
  try {
    const products = await Product.find();

    res.status(200).json({
      status: "success",
      dada: {
        products,
      },
    });
  } catch (err) {
    res.status(404).json({
      status: "Fails",
      message: "data not found",
    });
  }
};

module.exports = { getAllProduct };
