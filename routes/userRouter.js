const express = require("express");
const {
  signup,
  login,
  forgotPassword,
  resetPassword,
  // updatePassword,
  updatePassword2,
  protect,
} = require("../controllers/authController");
const {
  getAllUsers,
  updateMe,
  deleteMe,
} = require("../controllers/userController");

const router = express.Router();

router.patch("/update-me", protect, updateMe);
router.delete("/delete-me", protect, deleteMe);
router.patch("/update-current-password", protect, updatePassword2);

router.post("/forgot-password", forgotPassword);
router.patch("/reset-password/:token", resetPassword);

router.post("/signup", signup);
router.post("/login", login);

router.route("/").get(getAllUsers);

module.exports = router;
