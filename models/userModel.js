const crypto = require("crypto");
const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcrypt");

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "User must have a name"],
  },
  email: {
    type: String,
    required: [true, "User must have  an email"],
    validate: [validator.isEmail, "Email must be email type"],
    unique: true,
  },
  role: {
    type: String,
    enum: ["user", "admin", "storage manager", "seller"],
    default: "user",
  },
  password: {
    type: String,
    required: [true, "User must have a password"],
    min: [8, "Password must have at least 8 characters"],
    select: false,
  },
  passwordConfirm: {
    type: String,
    required: [true, "Please fill password you just fill"],
    validate: {
      validator: function (val) {
        return val === this.password;
      },
      message: "Confirm password not correct, please check and try again",
    },
  },
  passwordChangedAt: Date,
  passwordResetToken: String,
  passwordResetTokenTime: Date,
  active: {
    type: Boolean,
    default: true,
  },
  reasonDeleteAccount: String,
});

//hashing password
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next(); // in the case we use save() to update data
  this.password = await bcrypt.hash(this.password, 12);
  this.passwordConfirm = undefined;

  if (this.isNew) return next();

  this.passwordChangedAt = Date.now() - 1000; // to ensure the passwordChangedAt < the timestamp of token issued when reset password
  next();
});

userSchema.pre(/^find/, function (next) {
  //filter all not active user out of output
  this.find({ active: { $ne: false } });
  next();
});

userSchema.methods.checkPassword = async function (currentPwd, hashPwd) {
  return await bcrypt.compare(currentPwd, hashPwd);
};

userSchema.methods.checkPasswordChangeAfter = function (JWTTimestamp) {
  if (this.passwordChangedAt)
    return Math.floor(Date.parse(this.passwordChangedAt) / 1000) > JWTTimestamp;

  return false;
};

userSchema.methods.createResetPwdToken = function () {
  const resetToken = crypto.randomBytes(48).toString("hex");

  this.passwordResetToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");
  this.passwordResetTokenTime = Date.now() + 12 * 60 * 1000;

  return resetToken;
};

const User = mongoose.model("User", userSchema);

module.exports = User;
