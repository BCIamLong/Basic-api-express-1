const { default: mongoose } = require("mongoose");
const mogoose = require("mongoose");
const validator = require("validator");

const productSchema = new mogoose.Schema(
  {
    //https://mongoosejs.com/docs/validation.html#built-in-validators
    title: {
      type: String,
      // match: /^[a-zA-Z0-9]{4,10}$/,
      required: [true, "Product must have a title"],
      trim: true,
      minLength: [10, "title must to have greater than 10 characters"],
      maxLength: 30,
    },
    description: {
      type: String,
      required: [true, "Product must have a description"],
      trim: true,
      minLength: 12,
    },
    category: {
      type: String,
      required: [true, "Product must have category"],
      trim: true,
      minLength: 3,
    },
    brand: {
      type: String,
      required: [true, "Product must have a brand"],
      trim: true,
      minLength: 3,
    },
    thumbnail: {
      type: String,
      required: [true, "Product must have a thumbnail"],
      trim: true,
    },
    images: [String],
    price: {
      type: Number,
      required: [true, "Price is required field"],
      max: 100000,
      min: 100,
    },
    rating: {
      type: Number,
      default: 4.5,
      max: [5, "Rating is less than 5"],
    },
    discountPercentage: {
      type: Number,
      default: 0,
    },
    createdAt: {
      type: Date,
      default: Date.now(),
    },
  },
  {
    toJSON: { virtuals: true },
  },
);

productSchema.virtual("discountPrice").get(function () {
  return Math.round(this.price - this.price * (this.discountPercentage / 100));
});

productSchema.virtual("currency").get(function () {
  return [
    { dollar: this.price },
    { VND: this.price * 20000 },
    { KWR: this.price * 1300 },
  ];
});

const Product = new mongoose.model("Product", productSchema);

module.exports = Product;
