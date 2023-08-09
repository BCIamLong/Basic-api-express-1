const Product = require("../models/productModel");
const APIFeatures = require("../utils/apiFeatures");

const getAllProducts = async (req, res) => {
  try {
    const count = await Product.countDocuments({});
    const apiFeatures = new APIFeatures(Product.find(), req.query)
      .filter()
      .sort()
      .select()
      .pagination(count);
    const products = await apiFeatures.query;

    res.status(200).json({
      status: "success",
      results: products.length,
      dada: {
        products,
      },
    });
  } catch (err) {
    res.status(404).json({
      status: "Fails",
      message: "data not found",
      error: err.message,
    });
  }
};

const aliasTop6PremiumProduct = (req, _, next) => {
  req.query.limit = "6";
  req.query.sort = "-price";
  next();
};

module.exports = { getAllProducts, aliasTop6PremiumProduct };
