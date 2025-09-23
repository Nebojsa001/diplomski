const catchAsync = require("./../utils/catchAsync");
// const APIFeatures = require("../utils/apiFeatures");
const appError = require("../utils/appError");

const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

exports.getAllUsers = catchAsync(async (req, res, next) => {
  //   const features = new APIFeatures(prisma.users, req.query);

  const users = await prisma.users.findMany({
    include: {
      tests: {
        include: {
          photo: true,
        },
      },
      credits: true,
    },
  });

  if (!users) {
    return next(new appError("There are no usesrs, yet!", 404));
  }

  res.status(200).json({
    status: "success",
    result: users.length,
    data: users,
  });
});

exports.getUser = catchAsync(async (req, res, next) => {
  const user = await prisma.users.findUnique({
    where: {
      id: req.user.id,
    },
    include: {
      tests: {
        include: {
          photo: true,
        },
      },
      credits: true,
    },
  });
  if (!user) {
    return next(new appError("User not found!", 404));
  }
  res.status(200).json({
    status: "success",
    data: user,
  });
});
