const { default: mongoose } = require("mongoose");
const mogoose = require("mongoose");

const productSchema = new mogoose.Schema({
  title: {
    type: String,
    required: [true, "Product must have a title"],
  },
  description: {
    type: String,
    required: [true, "Product must have a description"],
  },
  category: {
    type: String,
    required: [true, "Product must have category"],
  },
  brand: {
    type: String,
    required: [true, "Product must have a brand"],
  },
  thumbnail: {
    type: String,
    required: [true, "Product must have a image"],
  },
  images: [String],
  price: {
    type: Number,
    required: [true, "Price is required field"],
  },
  rating: {
    type: Number,
    default: 4.5,
  },
  discountPercentage: {
    type: Number,
    default: 0,
  },
  createdAt: {
    type: Date,
    default: Date.now(),
  },
});

const Product = new mongoose.model("Product", productSchema);

module.exports = Product;
