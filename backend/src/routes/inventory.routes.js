const express = require("express");

const router = express.Router();

const inventoryController = require("../controllers/inventory.controller");

// GET ALL INVENTORY LOGS
router.get("/", inventoryController.getInventoryLogs);

// GET INVENTORY BY MEDICINE
router.get(
  "/medicine/:medicine_id",
  inventoryController.getInventoryByMedicine,
);

// STOCK IN
router.post("/stock-in", inventoryController.stockInMedicine);

// STOCK OUT
router.post("/stock-out", inventoryController.stockOutMedicine);

// RETURN BILL TO MANUFACTURER ALIAS
const expiryController = require("../controllers/expiry.controller");
router.post("/return-bill", expiryController.processReturnBill);
router.post("/return", expiryController.processReturnBill);

module.exports = router;
