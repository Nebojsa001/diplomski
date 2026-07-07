const bcrypt = require("bcryptjs");
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

prisma.$use(async (params, next) => {
  if (
    params.model === "Users" &&
    (params.action === "create" || params.action === "update")
  ) {
    const data = params.args.data;

    //data.password_changed_at = `${Date.now() - 1000}`;

    if (!data.password) {
      return next(params);
    }

    if (data.password) {
      data.password = await bcrypt.hash(data.password, 12);
    }

    // if (params.action === "update" && data.password) {
    //   data.passwordChangedAt = new Date(Date.now() - 1000);
    // }
  }

  return next(params);
});

module.exports = prisma;
