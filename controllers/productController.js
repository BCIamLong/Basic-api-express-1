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

//Middleware format request catefory
const formatBrandReq = (req, res, next) => {
  req.params.brand =
    req.params.brand.charAt(0).toUpperCase() + req.params.brand.slice(1);
  // req.params.brand = req.params.brand.replace(
  //   req.params.brand.charAt(0),
  //   req.params.brand.charAt(0).toUpperCase(),
  // );
  next();
};

const checkReq = (req, res, next) => {
  req.body = "ok";
  next();
};
//GET STATISTICS OF PHONE BASED ON BRAND, CATEGORY
const getProductStats = async (req, res) => {
  try {
    const { brand, category } = req.params;
    const stats = await Product.aggregate([
      // {
      //   $match: { brand: `${brand}`, category: `${category}` },
      // },
      {
        $group: {
          _id: { brand: `${brand}`, category: `${category}` },
          avgPrice: { $avg: "$price" },
          avgRating: { $avg: "$rating" },
          avgDiscount: { $avg: "$discountPercentage" },
          maxPrice: { $max: "$price" },
          minPrice: { $min: "$price" },
          maxRating: { $max: "$rating" },
          minRating: { $min: "$rating" },
          maxDiscount: { $max: "$discountPercentage" },
          minDiscount: { $min: "$discountPercentage" },
          totalProduct: { $sum: 1 },
          totalPrice: { $sum: "$price" },
        },
      },
      {
        $project: {
          _id: 0,
          info: "$_id",
          avgPrice: 1,
          avgRating: 1,
          avgDiscount: 1,
          maxPrice: 1,
          minPrice: 1,
          maxRating: 1,
          minRating: 1,
          maxDiscount: 1,
          minDiscount: 1,
          totalProduct: 1,
          totalPrice: 1,
        },
      },
    ]);

    res.status(200).json({
      status: "Success",
      results: stats.length,
      data: {
        stats,
      },
    });
  } catch (err) {
    res.status(400).json({
      status: "Fails",
      message: "Can'\t request",
      error: err.message,
    });
  }
};

module.exports = {
  getAllProducts,
  aliasTop6PremiumProduct,
  getProductStats,
  formatBrandReq,
  checkReq,
};
