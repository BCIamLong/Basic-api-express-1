const express = require("express");
const {
  getAllProducts,
  aliasTop6PremiumProduct,
  getProductStats,
  formatBrandReq,
  checkReq,
  createProduct,
  updateProduct,
  deleteProduct,
  getProduct,
} = require("../controllers/productController");

const router = express.Router();
// router.use(formatBrandReq);//why your put middleware it's not work because in this time we don't catch to route /products-stats/:brand/:category so brand and catefory not defined so it's undefind and return error
// router.use(checkReq);

router
  .route("/top-6-premium-products")
  .get(aliasTop6PremiumProduct, getAllProducts);

router
  .route("/products-stats/:brand/:category")
  .get(formatBrandReq, getProductStats); // you should give it here

router.route("/").get(getAllProducts).post(createProduct);
router.route("/:id").get(getProduct).patch(updateProduct).delete(deleteProduct);

module.exports = router;
