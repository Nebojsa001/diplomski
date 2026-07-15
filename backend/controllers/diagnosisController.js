const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const catchAsync = require("./../utils/catchAsync");

exports.getAllDiagnoses = catchAsync(async (req, res, next) => {
  const diagnoses = await prisma.diagnosis.findMany({
    orderBy: { code: "asc" },
  });

  res.status(200).json({
    status: "success",
    results: diagnoses.length,
    data: diagnoses,
  });
});

exports.searchDiagnoses = catchAsync(async (req, res, next) => {
  const { q } = req.query;

  if (!q || q.trim().length === 0) {
    return res.status(200).json({
      status: "success",
      results: 0,
      data: [],
    });
  }

  const diagnoses = await prisma.diagnosis.findMany({
    where: {
      OR: [
        { code: { contains: q, mode: "insensitive" } },
        { name: { contains: q, mode: "insensitive" } },
      ],
    },
    orderBy: { code: "asc" },
    take: 20,
  });

  res.status(200).json({
    status: "success",
    results: diagnoses.length,
    data: diagnoses,
  });
});
