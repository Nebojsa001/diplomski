const { PrismaClient, AppointmentStatus } = require("@prisma/client");
const prisma = new PrismaClient();

const catchAsync = require("./../utils/catchAsync");
const appError = require("./../utils/appError");

//
// (patient ili doctor može kreirati)
//
exports.createAppointment = catchAsync(async (req, res, next) => {
  const { title, date } = req.body;
  const userId = req.user.id;

  if (!date) {
    return next(new appError("Date is required!", 400));
  }

  const newDate = new Date(date);

  // 🚫 NE DOZVOLI REZERVACIJU U PROŠLOSTI
  if (newDate <= new Date()) {
    return next(new appError("Ne možete rezervisati termin u prošlosti.", 400));
  }

  // 🔥 30 MIN SLOT RULE
  const slotStart = new Date(newDate);
  const slotEnd = new Date(newDate);
  slotEnd.setMinutes(slotEnd.getMinutes() + 29);

  // 🔥 CHECK OVERLAP (IGNORIŠI OTKAZANE TERMINE)
  const existingAppointment = await prisma.appointment.findFirst({
    where: {
      date: {
        gte: slotStart,
        lte: slotEnd,
      },
      status: {
        not: AppointmentStatus.Cancelled,
      },
    },
  });

  if (existingAppointment) {
    return next(
      new appError(
        "Termin je zauzet! Izaberi drugi slot (30 min pravilo).",
        409,
      ),
    );
  }

  const appointment = await prisma.appointment.create({
    data: {
      title,
      date: newDate,
      userId,
    },
  });

  res.status(201).json({
    status: "success",
    data: appointment,
  });
});

//
// GET ALL APPOINTMENTS
// default: samo Waiting
//
exports.getAllAppointments = catchAsync(async (req, res, next) => {
  const { status, date, from, to, userId } = req.query;

  let dateFilter = {};
  // filtriranje po danu
  if (date) {
    const start = new Date(date);
    start.setHours(0, 0, 0, 0);

    const end = new Date(date);
    end.setHours(23, 59, 59, 999);

    dateFilter = {
      date: {
        gte: start,
        lte: end,
      },
    };
  } else if (from || to) {
    const range = {};

    if (from) {
      const start = new Date(from);
      start.setHours(0, 0, 0, 0);
      range.gte = start;
    }

    if (to) {
      const end = new Date(to);
      end.setHours(23, 59, 59, 999);
      range.lte = end;
    }

    dateFilter = { date: range };
  }

  const userFilter = userId ? { userId: Number(userId) } : {};

  const appointments = await prisma.appointment.findMany({
    where: {
      status: status || "Waiting",
      ...dateFilter,
      ...userFilter,
    },
    include: {
      user: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          role: true,
        },
      },
    },
    orderBy: {
      date: "asc",
    },
  });

  res.status(200).json({
    status: "success",
    results: appointments.length,
    data: appointments,
  });
});

exports.getAppointment = catchAsync(async (req, res, next) => {
  const appointment = await prisma.appointment.findUnique({
    where: {
      id: Number(req.params.id),
    },
    include: {
      user: true,
    },
  });

  if (!appointment) {
    return next(new appError("Appointment not found!", 404));
  }

  res.status(200).json({
    status: "success",
    data: appointment,
  });
});

exports.updateAppointment = catchAsync(async (req, res, next) => {
  const { title, date, status } = req.body;

  const appointment = await prisma.appointment.findUnique({
    where: {
      id: Number(req.params.id),
    },
  });

  if (!appointment) {
    return next(new appError("Appointment not found!", 404));
  }

  const updated = await prisma.appointment.update({
    where: {
      id: Number(req.params.id),
    },
    data: {
      title: title ?? appointment.title,
      date: date ? new Date(date) : appointment.date,
      status: status ?? appointment.status,
    },
    include: {
      user: true,
    },
  });

  res.status(200).json({
    status: "success",
    data: updated,
  });
});

// (Primi pacijenta)
//
exports.acceptAppointment = catchAsync(async (req, res, next) => {
  const appointment = await prisma.appointment.findUnique({
    where: {
      id: Number(req.params.id),
    },
  });

  if (!appointment) {
    return next(new appError("Appointment not found!", 404));
  }

  const updated = await prisma.appointment.update({
    where: {
      id: Number(req.params.id),
    },
    data: {
      status: "Completed",
    },
  });

  res.status(200).json({
    status: "success",
    data: updated,
  });
});

exports.cancelAppointment = catchAsync(async (req, res, next) => {
  const appointment = await prisma.appointment.findUnique({
    where: {
      id: Number(req.params.id),
    },
  });

  if (!appointment) {
    return next(new appError("Appointment not found!", 404));
  }

  if (req.user.role === "patient" && appointment.userId !== req.user.id) {
    return next(new appError("Nemaš dozvolu da otkažeš ovaj termin.", 403));
  }

  const updated = await prisma.appointment.update({
    where: {
      id: Number(req.params.id),
    },
    data: {
      status: "Cancelled",
    },
  });

  res.status(200).json({
    status: "success",
    data: updated,
  });
});

exports.getMyAppointments = catchAsync(async (req, res, next) => {
  const userId = req.user.id;
  const { date, from, to, status } = req.query;

  let where = {
    userId,
  };

  // Filter po datumu (ceo dan)
  if (date) {
    const start = new Date(date);
    start.setHours(0, 0, 0, 0);

    const end = new Date(date);
    end.setHours(23, 59, 59, 999);

    where.date = {
      gte: start,
      lte: end,
    };
  } else if (from || to) {
    // Filter po opsegu datuma (koristi se npr. za "Izvještaji")
    const range = {};

    if (from) {
      const start = new Date(from);
      start.setHours(0, 0, 0, 0);
      range.gte = start;
    }

    if (to) {
      const end = new Date(to);
      end.setHours(23, 59, 59, 999);
      range.lte = end;
    }

    where.date = range;
  }

  // Filter po statusu (npr. samo "Completed" za istoriju pregleda)
  if (status) {
    where.status = status;
  }

  const appointments = await prisma.appointment.findMany({
    where,
    include: {
      user: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          role: true,
        },
      },
    },
    orderBy: {
      date: "asc",
    },
  });

  res.status(200).json({
    status: "success",
    results: appointments.length,
    data: appointments,
  });
});
//
//  DELETE APPOINTMENT
//
exports.deleteAppointment = catchAsync(async (req, res, next) => {
  const appointment = await prisma.appointment.findUnique({
    where: {
      id: Number(req.params.id),
    },
  });

  if (!appointment) {
    return next(new appError("Appointment not found!", 404));
  }

  await prisma.appointment.delete({
    where: {
      id: Number(req.params.id),
    },
  });

  res.status(204).json({
    status: "success",
    data: null,
  });
});
