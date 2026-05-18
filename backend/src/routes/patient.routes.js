const express = require("express");

const router = express.Router();

const patientController = require("../controllers/patient.controller");


// GET ALL PATIENTS
router.get("/", patientController.getPatients);


// GET SINGLE PATIENT
router.get("/:id", patientController.getPatient);


// SEARCH PATIENT BY MOBILE
router.get("/mobile/:mobile", patientController.searchPatientByMobile);


// CREATE PATIENT
router.post("/", patientController.createPatient);


// UPDATE PATIENT
router.put("/:id", patientController.updatePatient);


// DELETE PATIENT
router.delete("/:id", patientController.deletePatient);


module.exports = router;