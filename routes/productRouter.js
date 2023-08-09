const express = require("express");
const {
  getAllProducts,
  aliasTop6PremiumProduct,
} = require("../controllers/productController");

const router = express.Router();

router
  .route("/top-6-premium-products")
  .get(aliasTop6PremiumProduct, getAllProducts);

router.route("/").get(getAllProducts);

module.exports = router;
