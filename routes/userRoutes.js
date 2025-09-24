const express = require("express");
const userController = require("./../controllers/userController");
const authController = require("./../controllers/authController");
const router = express.Router();

router.post("/signup", authController.signup);
router.post("/login", authController.login);

router
  .route("/users")
  .get(
    authController.protect,
    authController.restrictTo("doctor, superadmin"),
    userController.getAllUsers
  );

module.exports = router;
