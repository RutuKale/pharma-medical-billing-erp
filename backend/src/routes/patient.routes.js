const express = require("express");

const router = express.Router();

const patientController = require("../controllers/patient.controller");
const billingController = require("../controllers/billing.controller");

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

// PATIENT BILLS / BILL UPDATES
router.get("/:id/bills", billingController.getPatientBills);
router.get("/:id/bill", billingController.getPatientBills);

router.put("/:patientId/bills/:id", billingController.updateBill);
router.post("/:patientId/bills/:id", billingController.updateBill);
router.patch("/:patientId/bills/:id", billingController.updateBill);

router.put("/:patientId/bill/:id", billingController.updateBill);
router.post("/:patientId/bill/:id", billingController.updateBill);
router.patch("/:patientId/bill/:id", billingController.updateBill);

router.put("/bills/:id", billingController.updateBill);
router.post("/bills/:id", billingController.updateBill);
router.patch("/bills/:id", billingController.updateBill);

router.put("/bill/:id", billingController.updateBill);
router.post("/bill/:id", billingController.updateBill);
router.patch("/bill/:id", billingController.updateBill);

module.exports = router;

