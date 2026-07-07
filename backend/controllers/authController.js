const jwt = require("jsonwebtoken");
const { promisify } = require("util");
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const catchAsync = require("./../utils/catchAsync");
const appError = require("./../utils/appError");
const { verifyGoogleToken } = require("../utils/authUtils");
const { log } = require("console");

exports.createUser = catchAsync(async (req, res, next) => {
  let idToken = req.body.credential;
  let payload;
  let authProvider = "GOOGLE";

  payload = await verifyGoogleToken(idToken);
  console.log(payload);

  const userExist = await prisma.user.findFirst({
    where: {
      sub: payload.sub,
    },
  });

  if (userExist) {
    res.status(200).json({
      status: "success",
      message: "User logged in successfully!",
      user: userExist,
      idToken,
    });
    return next();
  }

  console.log(payload);

  const user = await prisma.user.create({
    //create the new user
    data: {
      email: payload.email,
      sub: payload.sub,
      firstName: payload.given_name,
      lastName: payload.family_name || "Default",
    },
  });
  if (!user) {
    return next(new appError("Registration faild!", 400));
  }

  res.status(200).json({
    status: "success",
    message: "User created successfully!",
    user,
    idToken,
  });
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

  // const decoded = await promisify(jwt.verify)(
  //   token,
  //   process.env.JWT_SECRET_KEY,
  // );
  // console.log(decoded);
  const payload = await verifyGoogleToken(token);
  console.log(payload);

  const user = await prisma.user.findUnique({
    where: { sub: payload.sub },
  });
  console.log(user);

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
