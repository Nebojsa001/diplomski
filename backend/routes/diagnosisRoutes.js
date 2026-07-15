const express = require("express");

const diagnosisController = require("./../controllers/diagnosisController");
const authController = require("./../controllers/authController");

const router = express.Router();

router.use(authController.protect);
router.get("/search", diagnosisController.searchDiagnoses);
router.get("/", diagnosisController.getAllDiagnoses);

module.exports = router;
