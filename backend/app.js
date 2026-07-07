const express = require("express");
const app = express();
const globalErrorHandler = require("./controllers/errorController");
const appError = require("./utils/appError");
const userRouter = require("./routes/userRoutes");
const appointmentRouter = require("./routes/appointmentRoutes");
const cors = require("cors");

app.use(express.json());

app.use(cors());

app.use("/api/v1/users", userRouter);
app.use("/api/v1/appointments", appointmentRouter);

app.use(globalErrorHandler);

module.exports = app;
