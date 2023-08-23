const { promisify } = require("util");
const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const User = require("../models/userModel");
const asyncCatch = require("../utils/asyncCatch");
const AppError = require("../utils/appError");
const sendEmail = require("../utils/email");

const signToken = user =>
  jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });

const senJWT = (res, statusCode, user) => {
  const token = signToken(user);

  res.status(statusCode).json({
    status: "success",
    token,
  });
};
const signup = asyncCatch(async (req, res, next) => {
  const { name, email, password, passwordConfirm } = req.body;
  if (!name || !email || !password || !passwordConfirm)
    return next(new AppError("Info you fill not correct please check again"));

  const newUser = User.create({
    name,
    email,
    password,
    passwordConfirm,
  });
  // const token = signToken(newUser);

  // res.status(200).json({
  //   status: "success",
  //   token,
  // });
  senJWT(res, 200, newUser);
});

const login = asyncCatch(async (req, res, next) => {
  const { email, password } = req.body;
  if (!email || !password)
    return next(new AppError("Pleas fill email and password", 400));

  const user = await User.findOne({ email }).select("+password");
  const correct = await user?.checkPassword(password, user.password);

  if (!user || !correct)
    return next(
      new AppError("Email or password invalid, please check again", 401),
    );

  // const token = signToken(user);
  // res.status(200).json({
  //   status: "success",
  //   token,
  // });
  senJWT(res, 200, user);
});

const protect = asyncCatch(async (req, res, next) => {
  if (
    !req.headers.authorization ||
    !req.headers.authorization.startsWith("Bearer")
  )
    return next(new AppError("Please login to get access", 401));
  const token = req.headers.authorization.split(" ")[1];
  if (!token) return next(new AppError("Please login to get access", 401));

  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

  const currentUser = await User.findById(decoded.id).select("+password");
  if (!currentUser)
    return next(
      new AppError(
        "This user hasn't been exists, please contac with us to know detail", // maybe the user use app with ileague action so this account be ban(forbidden) => admin deleted this user
        401,
      ),
    );

  if (currentUser.checkPasswordChangeAfter(decoded.iat))
    // if user changed password => old token not avaliable => if user use old token to access he will be loggout and must to login again
    return next(
      new AppError(
        "This user recently changed password, please login again to get access",
        401,
      ),
    );
  console.log(currentUser);
  req.user = currentUser; // save it in request for the next middlewar can manipulate data, req can travel in middleware stack so we can use it like tranposter data
  next();
});

const restrictTo =
  (...roles) =>
  (req, res, next) => {
    if (!roles.includes(req.user.role))
      return next(
        new AppError("You don't have permisstion to get this access", 403),
      );

    next();
  };

const forgotPassword = asyncCatch(async (req, res, next) => {
  const { email } = req.body;
  if (!email) return next(new AppError("Please fill your email", 400));
  const user = await User.findOne({ email });
  if (!user)
    return next(
      new AppError("Your email is not correct please try again", 401),
    );

  //create random token and save encrypt token into DB
  const resetToken = user.createResetPwdToken();

  try {
    await user.save({ validateBeforeSave: false });
    const message = `Forgot your password please click this link ${req.protocol}://${req.hostname}:3000${req.originalUrl}/${resetToken} to reset your password, if you didn't for got password just ignore this mail`;

    const subject = "This is your reset password token (valid in 10 minutes)";

    sendEmail({
      email,
      subject,
      message,
    });

    res.status(200).json({
      status: "success",
      message: "Sent mail to your email, please check",
    });
  } catch (err) {
    user.passwordResetToken = undefined;
    user.passwordResetTokenTime = undefined;
    console.log(err);
    await user.save();
  }
});

const resetPassword = asyncCatch(async (req, res, next) => {
  //!first we need check the token is expires? if it's we don't render this page for user instead we render the annouce for user that's this token is expired
  //get token and check token
  // const { token } = req.params;
  const passwordResetToken = crypto
    .createHash("sha256")
    .update(req.params.token)
    .digest("hex");

  // const user = User.findOne({ passwordResetToken: checkToken });
  // if (!user)
  //   return next(new AppError("Your token was invalid or expired", 401));

  const user = await User.findOne({
    passwordResetToken,
    passwordResetTokenTime: { $gt: Date.now() },
  });

  if (!user)
    return next(new AppError("Your token was invalid or expired", 401));

  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  user.passwordResetToken = undefined;
  user.passwordResetTokenTime = undefined;

  await user.save();

  // const token = signToken(user); //some time this sign token maybe faster than the user.save() then the password ChangedAt will > time token issued => you will be loggout because before we check if passwordChangedAt > decoded.iat => use rencently change password, right

  // res.status(200).json({
  //   status: "success",
  //   token,
  // });
  senJWT(res, 200, user);
});

const updatePassword = asyncCatch(async (req, res, next) => {
  const { currentPassword } = req.body;
  if (!currentPassword)
    return next(
      new AppError("Please fill your current password to confirm", 400),
    );

  //!way1:
  // const { user } = req;
  const user = await User.findById(req.user._id).select("+password");
  const check = await user.checkPassword(currentPassword, user.password);

  // const user = await User.findOne({ password: currentPassword });
  if (!check)
    return next(
      new AppError(
        "Your password is not correct, please check and try again",
        403,
      ),
    );

  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  await user.save();
  senJWT(res, 201, user);
});

const updatePassword2 = asyncCatch(async (req, res, next) => {
  const { currentPassword } = req.body;
  if (!currentPassword)
    return next(
      new AppError("Please fill your current password to confirm", 400),
    );

  const { user } = req;
  const check = await user.checkPassword(currentPassword, user.password);

  // const user = await User.findOne({ password: currentPassword });
  if (!check)
    return next(
      new AppError(
        "Your password is not correct, please check and try again",
        403,
      ),
    );

  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  await user.save();
  senJWT(res, 201, user);
});

module.exports = {
  signup,
  login,
  protect,
  restrictTo,
  forgotPassword,
  resetPassword,
  updatePassword,
  updatePassword2,
};
