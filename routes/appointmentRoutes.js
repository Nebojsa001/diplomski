const express = require("express");

const appointmentController = require("./../controllers/appointmentController");
const authController = require("./../controllers/authController");
const { auth } = require("google-auth-library");

const router = express.Router();

router.use(authController.protect);

router.route("/my").get(appointmentController.getMyAppointments);

router
  .route("/")
  .get(appointmentController.getAllAppointments)
  .post(appointmentController.createAppointment);

router
  .route("/:id")
  .get(appointmentController.getAppointment)
  .patch(appointmentController.updateAppointment)
  .delete(
    authController.restrictTo("doctor"),
    appointmentController.deleteAppointment,
  );

// primi pacijenta
router.patch(
  "/:id/accept",
  authController.restrictTo("doctor"),
  appointmentController.acceptAppointment,
);

// otkaži
router.patch(
  "/:id/cancel",
  authController.restrictTo("doctor", "patient"),
  appointmentController.cancelAppointment,
);

module.exports = router;
