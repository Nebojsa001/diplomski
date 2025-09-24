const jwt = require("jsonwebtoken");
const { promisify } = require("util");
const prisma = require("../prisma/hooks/userHooks");
const catchAsync = require("./../utils/catchAsync");
const appError = require("./../utils/appError");
const { correctPassword } = require("../utils/authUtils");

const signToken = (email) => {
  return jwt.sign({ email }, process.env.JWT_SECRET_KEY, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

const createSendToken = (user, statusCode, res) => {
  const token = signToken(user.email);
  user.password = undefined;

  res.status(statusCode).json({
    status: "success",
    token,
    data: {
      user,
    },
  });
};

exports.signup = catchAsync(async (req, res, next) => {
  let newUser;

  newUser = await prisma.users.create({
    data: {
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      email: req.body.email,
      password: req.body.password,
    },
  });

  createSendToken(newUser, 201, res);
});

exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  const user = await prisma.users.findUnique({
    where: { email: email },
  });
  if (!email || !password) {
    return next(
      new appError("Ensure that an email and password are provided!", 400)
    );
  }
  //candidate password, password in db
  if (!user || !(await correctPassword(password, user.password))) {
    return next(new appError("Invalid email or password", 401));
  }
  createSendToken(user, 200, res);
});

exports.protect = catchAsync(async (req, res, next) => {
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }
  if (!token) {
    return next(new appError("Log in!", 401));
  }

  const decoded = await promisify(jwt.verify)(
    token,
    process.env.JWT_SECRET_KEY
  );
  console.log(decoded);

  const user = await prisma.users.findUnique({
    where: { email: decoded.email },
  });

  if (!user) {
    return next(new appError("User not found!", 404));
  }
  req.user = user;
  next();
});

exports.restrictTo = (...roles) => {
  // PERMISIJE
  return (req, res, next) => {
    // roles ['doctor','superadmin','patient'].
    if (!roles.includes(req.user.role)) {
      return next(new appError("Nemate ovlaštenje za ovu akciju", 403));
    }
    next();
  };
};
