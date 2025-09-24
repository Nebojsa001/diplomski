const express = require("express");
const app = express();
const globalErrorHandler = require("./controllers/errorController");
const appError = require("./utils/appError");
const userRouter = require("./routes/userRoutes");

app.use(express.json());

app.use("/api/v1/users", userRouter);

// app.all("*", (req, res, next) => {
//   next(new appError(`Can't find ${req.originalUrl} on this server!`, 404));
// });

app.use(globalErrorHandler);

module.exports = app;
