const { default: mongoose } = require("mongoose");
const mogoose = require("mongoose");

const productSchema = new mogoose.Schema({
  name: {
    type: String,
    required: [true, "Name is required field"],
  },
  price: {
    type: Number,
    required: [true, "Price is required field"],
  },
  rating: {
    type: Number,
    default: 4.5,
  },
  author: {
    type: String,
  },
});

const Product = new mongoose.model("Product", productSchema);

module.exports = Product;
