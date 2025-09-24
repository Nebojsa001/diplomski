const express = require("express");
const app = express();
const globalErrorHandler = require("./controllers/errorController");
const appError = require("./utils/appError");
const userRouter = require("./routes/userRoutes");
// const testRouter = require("./routes/testRoutes");
// const photoRouter = require("./routes/photoRoutes");
// const creditRouter = require("./routes/creditRoutes");
// const voteRouter = require("./routes/voteRoutes");
// const transactionRouter = require("./routes/transactionRoutes");
// const reportRouter = require("./routes/reportRoutes");

app.use(express.json());

app.use("/api/v1/users", userRouter);

// app.all("*", (req, res, next) => {
//   next(new appError(`Can't find ${req.originalUrl} on this server!`, 404));
// });

app.use(globalErrorHandler);

module.exports = app;
