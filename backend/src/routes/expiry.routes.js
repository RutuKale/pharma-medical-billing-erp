const express = require("express");

const router = express.Router();

const expiryController = require("../controllers/expiry.controller");

// EXPIRED MEDICINES
router.get("/expired", expiryController.getExpiredMedicines);

// NEAR EXPIRY
router.get("/near-expiry", expiryController.getNearExpiryMedicines);

// SAFE MEDICINES
router.get("/safe", expiryController.getSafeMedicines);

// WRITE OFF
router.put("/write-off/:medicine_id", expiryController.writeOffMedicine);

module.exports = router;
