const catchAsync = require("./../utils/catchAsync");
const appError = require("../utils/appError");
const prisma = require("../prisma/hooks/userHooks");

exports.getAllAppointments = catchAsync(async (req, res, next) => {
  const appointments = await prisma.appointment.findMany({});

  if (!appointments) {
    return next(new appError("There are no usesrs, yet!", 404));
  }

  res.status(200).json({
    status: "success",
    result: users.length,
    data: users,
  });
});

exports.createAppointment = catchAsync(async (req, res, next) => {
  const { title, patient_id, doctor_id, start_time, status } = req.body;
  const patient = prisma.users.findUnique({ where: { id: patient_id } });
  const appointment = await prisma.users.create({
    data: {
      title: title,
      patient_id: patient_id,
      start_time: start_time,
      status: status,
    },
  });

  if (!appointment) {
    return next(new appError("There are no usesrs, yet!", 404));
  }

  res.status(200).json({
    status: "success",
    result: users.length,
    data: users,
  });
});
