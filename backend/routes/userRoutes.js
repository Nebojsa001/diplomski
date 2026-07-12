const express = require("express");
const userController = require("./../controllers/userController");
const authController = require("./../controllers/authController");
const router = express.Router();

// Email/lozinka registracija i login
router.post("/register", authController.register);
router.post("/login", authController.login);

// Google OAuth login (ranije je ova logika bila na /login)
router.post("/google-login", authController.googleLogin);

module.exports = router;
