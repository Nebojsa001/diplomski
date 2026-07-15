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

// primi pacijenta (Waiting -> InProgress)
router.patch(
  "/:id/start",
  authController.restrictTo("doctor"),
  appointmentController.startAppointment,
);

// završi pregled (InProgress -> Completed, upis dijagnoza/napomene, opciono kontrolni termin)
router.patch(
  "/:id/complete",
  authController.restrictTo("doctor"),
  appointmentController.completeAppointment,
);

// otkaži
router.patch(
  "/:id/cancel",
  authController.restrictTo("doctor", "patient"),
  appointmentController.cancelAppointment,
);

module.exports = router;
