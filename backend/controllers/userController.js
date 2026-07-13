const catchAsync = require("./../utils/catchAsync");
// const APIFeatures = require("../utils/apiFeatures");
const appError = require("../utils/appError");

const prisma = require("../prisma/hooks/userHooks");

exports.getAllUsers = catchAsync(async (req, res, next) => {
  const { role } = req.query;

  const users = await prisma.user.findMany({
    where: role ? { role } : undefined,
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
      role: true,
      createdAt: true,
    },
    orderBy: {
      firstName: "asc",
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

//
// Lista doktora (koristi se za prikaz imena doktora u izvještajima)
//
exports.getDoctors = catchAsync(async (req, res, next) => {
  const doctors = await prisma.user.findMany({
    where: { role: "doctor" },
    select: {
      id: true,
      firstName: true,
      lastName: true,
    },
    orderBy: {
      firstName: "asc",
    },
  });

  res.status(200).json({
    status: "success",
    result: doctors.length,
    data: doctors,
  });
});

// 'exports.getProfile = catchAsync(async (req, res, next) => {
//   const user = await prisma.users.findUnique({
//     where: {
//       id: req.user.id,
//     },
//     select: {
//       id: true,
//       firstName: true,
//       lastName: true,
//       email: true,
//       role: true,
//       created_at: true,
//     },
//   });
//   if (!user) {
//     return next(new appError("User not found!", 404));
//   }
//   res.status(200).json({
//     status: "success",
//     data: user,
//   });
// });'

exports.getUser = catchAsync(async (req, res, next) => {
  const user = await prisma.user.findUnique({
    where: {
      id: req.params.id * 1, //convert string to number - id is number not string
    },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
      role: true,
      createdAt: true,
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
