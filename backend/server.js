const dotenv = require("dotenv");
// const { PrismaClient } = require("@prisma/client");

// const prisma = new PrismaClient();
const prisma = require("./prisma/hooks/userHooks");

async function checkDatabaseConnection() {
  try {
    await prisma.$connect();
    console.log("Database connection successful!");
  } catch (error) {
    console.error("Error connecting to the database:", error);
  }
}

checkDatabaseConnection();
const app = require("./app");
dotenv.config({ path: "./.env" });

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`App running on port ${port}, in ${process.env.NODE_ENV} mode`);
});
