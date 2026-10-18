const express = require("express");

const router = express.Router();

const billingController = require("../controllers/billing.controller");

// GET ALL BILLS
router.get("/", billingController.getBills);

// GET PATIENT BILLS
router.get("/patient/:id", billingController.getPatientBills);
router.get("/patient/:id/bills", billingController.getPatientBills);

// GET SINGLE BILL
router.get("/:id", billingController.getBill);

// CREATE BILL
router.post("/", billingController.createBill);

// UPDATE BILL (Supports PUT, POST, PATCH across standard, update-prefixed, and patient routes)
router.put("/:id", billingController.updateBill);
router.post("/:id", billingController.updateBill);
router.patch("/:id", billingController.updateBill);

router.put("/update/:id", billingController.updateBill);
router.post("/update/:id", billingController.updateBill);
router.patch("/update/:id", billingController.updateBill);

router.put("/:id/update", billingController.updateBill);
router.post("/:id/update", billingController.updateBill);
router.patch("/:id/update", billingController.updateBill);

router.put("/patient/:patientId/:id", billingController.updateBill);
router.post("/patient/:patientId/:id", billingController.updateBill);
router.patch("/patient/:patientId/:id", billingController.updateBill);

router.put("/patient/:id", billingController.updateBill);
router.post("/patient/:id", billingController.updateBill);
router.patch("/patient/:id", billingController.updateBill);

// DELETE BILL
router.delete("/:id", billingController.deleteBill);

// RETURN BILL ALIAS
const expiryController = require("../controllers/expiry.controller");
router.post("/return-bill", expiryController.processReturnBill);
router.post("/return", expiryController.processReturnBill);

module.exports = router;

