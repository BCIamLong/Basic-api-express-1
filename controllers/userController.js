const User = require("../models/userModel");
const APIFeatures = require("../utils/apiFeatures");
const AppError = require("../utils/appError");
const asyncCatch = require("../utils/asyncCatch");

const getAllUsers = asyncCatch(async (req, res, next) => {
  const count = await User.countDocuments({});
  const apiFeatures = new APIFeatures(User.find(), req.query)
    .filter()
    .sort()
    .select()
    .pagination(count);
  const users = await apiFeatures.query;

  res.status(200).json({
    status: "success",
    results: users.length,
    dada: {
      users,
    },
  });
});

const getUser = asyncCatch(async (req, res, next) => {
  const user = await User.findById(req.params.id);
  if (!user) return next(new AppError("This user not exists", 400));
  res.status(200).json({
    status: "success",
    dada: {
      user,
    },
  });
});
const createUser = asyncCatch(async (req, res, next) => {
  const user = await User.create(req.body);
  res.status(200).json({
    status: "success",
    dada: {
      user,
    },
  });
});
const deleteUser = asyncCatch(async (req, res, next) => {
  const user = await User.findByIdAndDelete(req.params.id);
  if (!user) return next(new AppError("This user not exists", 400));
  res.status(200).json({
    status: "success",
    dada: {
      user,
    },
  });
});

const updateUser = asyncCatch(async (req, res, next) => {
  const user = await User.findByIdAndUpdate(req.params.id, req.body);
  if (!user) return next(new AppError("This user not exists", 400));
  res.status(200).json({
    status: "success",
    dada: {
      user,
    },
  });
});

const filterObject = (ob, ...fields) => {
  const fiteredOb = {};
  Object.keys(ob).forEach(field => {
    if (fields.includes(field)) fiteredOb[field] = ob[field];
  });
  return fiteredOb;
};

const updateMe = asyncCatch(async (req, res, next) => {
  const filteredOb = filterObject(req.body, "name", "email");

  const userUpdate = await User.findByIdAndUpdate(req.user.id, filteredOb, {
    new: true,
    runValidators: true,
  });

  res.status(201).json({
    status: "success",
    data: {
      user: userUpdate,
    },
  });
});

const deleteMe = asyncCatch(async (req, res, next) => {
  const { reason, password } = req.body;
  if (!reason)
    return next(
      new AppError("Please choose your reason to delete this accout", 400),
    );
  if (!password)
    return next(new AppError("Please re-enter your password to confirm", 400));

  const { user } = req;
  const check = await user.checkPassword(password, user.password);
  if (!check) return next(new AppError("Your password is not correct", 400));

  user.active = false;
  user.reasonDeleteAccount = reason;
  await user.save({ validateBeforeSave: false });

  res.status(204).json({
    status: "success",
    data: null,
  });
});

module.exports = {
  getAllUsers,
  getUser,
  createUser,
  updateUser,
  deleteUser,
  updateMe,
  deleteMe,
};
