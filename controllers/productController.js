const Product = require("../models/productModel");
const APIFeatures = require("../utils/apiFeatures");
const AppError = require("../utils/appError");
const asyncCatch = require("../utils/asyncCatch");

const getAllProducts = asyncCatch(async (req, res) => {
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
});

const getProduct = asyncCatch(async (req, res, next) => {
  const tour = await Product.findById(req.params.id);

  if (!tour) return next(new AppError("Invalid id", 404));
  res.status(200).json({
    status: "success",
    data: {
      tour,
    },
  });
});

const createProduct = asyncCatch(async (req, res, next) => {
  const tour = await Product.create(req.body);
  res.status(200).json({
    status: "success",
    data: {
      tour,
    },
  });
});

const updateProduct = asyncCatch(async (req, res, next) => {
  const tour = await Product.findOneAndUpdate(
    { _id: req.params.id },
    req.body,
    {
      runValidators: true,
    },
  );
  if (!tour) return next(new AppError("Invalid id", 404));
  res.status(201).json({
    status: "success",
    data: {
      tour,
    },
  });
});

const deleteProduct = asyncCatch(async (req, res, next) => {
  const tour = await Product.findOneAndDelete({ _id: req.params.id });
  if (!tour) return next(new AppError("Invalid id", 404));
  res.status(204).json({
    status: "success",
    data: null,
  });
});

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
const getProductStats = asyncCatch(async (req, res) => {
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
});

module.exports = {
  getAllProducts,
  aliasTop6PremiumProduct,
  getProductStats,
  formatBrandReq,
  checkReq,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
};
