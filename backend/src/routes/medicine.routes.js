const express = require("express");

const router = express.Router();

const medicineController = require("../controllers/medicine.controller");


// GET ALL
router.get("/", medicineController.getMedicines);


// GET SINGLE
router.get("/:id", medicineController.getMedicine);


// CREATE
router.post("/", medicineController.createMedicine);
router.post("/bulk", medicineController.bulkCreateMedicines);


// UPDATE
router.put("/:id", medicineController.updateMedicine);


// DELETE
router.delete("/:id", medicineController.deleteMedicine);


module.exports = router;