const express = require("express");
const userController = require("./../controllers/userController");
const authController = require("./../controllers/authController");
const router = express.Router();

router.post("/signup", authController.signup);
router.post("/login", authController.login);

router
  .route("/")
  .get(
    authController.protect,
    authController.restrictTo("doctor", "superadmin"),
    userController.getAllUsers
  );

router.get("/profile", authController.protect, userController.getProfile);
router.get(
  "/:id",
  authController.protect,
  authController.restrictTo("doctor", "superadmin"),
  userController.getUser
);

module.exports = router;
