const express = require("express");

const router = express.Router();

const billingController = require("../controllers/billing.controller");

// GET ALL BILLS
router.get("/", billingController.getBills);

// GET SINGLE BILL
router.get("/:id", billingController.getBill);

// CREATE BILL
router.post("/", billingController.createBill);

// DELETE BILL
router.delete("/:id", billingController.deleteBill);

module.exports = router;
