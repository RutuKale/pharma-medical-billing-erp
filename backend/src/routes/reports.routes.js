const express = require("express");

const router = express.Router();

const reportsController = require("../controllers/reports.controller");


// DAILY SALES REPORT
router.get(
    "/daily-sales",
    reportsController.getDailySalesReport
);


// SALES REPORT BY DATE
router.get(
    "/sales",
    reportsController.getSalesReportByDate
);


// LOW STOCK REPORT
router.get(
    "/low-stock",
    reportsController.getLowStockReport
);


// CURRENT STOCK REPORT
router.get(
    "/stock",
    reportsController.getCurrentStockReport
);


// INVENTORY MOVEMENT REPORT
router.get(
    "/inventory-movement",
    reportsController.getInventoryMovementReport
);


// EXPIRY REPORT
router.get(
    "/expiry",
    reportsController.getExpiryReport
);


// TOP SELLING MEDICINES
router.get(
    "/top-selling",
    reportsController.getTopSellingMedicines
);


module.exports = router;