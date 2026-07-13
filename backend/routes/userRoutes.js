const express = require("express");
const userController = require("./../controllers/userController");
const authController = require("./../controllers/authController");
const router = express.Router();

// Email/lozinka registracija i login
router.post("/register", authController.register);
router.post("/login", authController.login);

// Google OAuth login (ranije je ova logika bila na /login)
router.post("/google-login", authController.googleLogin);

// Lista doktora - koristi se za prikaz imena doktora u izvještajima
// (dostupno svim prijavljenim korisnicima, ne otkriva osjetljive podatke)
router.get("/doctors", authController.protect, userController.getDoctors);

// Lista svih korisnika/pacijenata - samo za doktore ("Korisnici" sekcija)
router.get(
  "/",
  authController.protect,
  authController.restrictTo("doctor"),
  userController.getAllUsers,
);

router.get(
  "/:id",
  authController.protect,
  authController.restrictTo("doctor"),
  userController.getUser,
);

module.exports = router;
