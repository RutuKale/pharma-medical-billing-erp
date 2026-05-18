const ReportService = require("../services/report.service");


// DAILY SALES REPORT
exports.getDailySalesReport = async (req, res) => {

    try {

        const report = await ReportService.getDailySalesReport();

        res.status(200).json({
            success: true,
            count: report.length,
            data: report
        });

    } catch (error) {

        res.status(500).json({
            success: false,
            message: error.message
        });

    }

};


// SALES REPORT BETWEEN DATES
exports.getSalesReportByDate = async (req, res) => {

    try {

        const {
            start_date,
            end_date
        } = req.query;

        const report = await ReportService.getSalesReportByDate(
            start_date,
            end_date
        );

        res.status(200).json({
            success: true,
            count: report.length,
            data: report
        });

    } catch (error) {

        res.status(500).json({
            success: false,
            message: error.message
        });

    }

};


// LOW STOCK REPORT
exports.getLowStockReport = async (req, res) => {

    try {

        const report = await ReportService.getLowStockReport();

        res.status(200).json({
            success: true,
            count: report.length,
            data: report
        });

    } catch (error) {

        res.status(500).json({
            success: false,
            message: error.message
        });

    }

};


// CURRENT STOCK REPORT
exports.getCurrentStockReport = async (req, res) => {

    try {

        const report = await ReportService.getCurrentStockReport();

        res.status(200).json({
            success: true,
            count: report.length,
            data: report
        });

    } catch (error) {

        res.status(500).json({
            success: false,
            message: error.message
        });

    }

};


// INVENTORY MOVEMENT REPORT
exports.getInventoryMovementReport = async (req, res) => {

    try {

        const report = await ReportService.getInventoryMovementReport();

        res.status(200).json({
            success: true,
            count: report.length,
            data: report
        });

    } catch (error) {

        res.status(500).json({
            success: false,
            message: error.message
        });

    }

};


// EXPIRY REPORT
exports.getExpiryReport = async (req, res) => {

    try {

        const report = await ReportService.getExpiryReport();

        res.status(200).json({
            success: true,
            count: report.length,
            data: report
        });

    } catch (error) {

        res.status(500).json({
            success: false,
            message: error.message
        });

    }

};


// TOP SELLING MEDICINES
exports.getTopSellingMedicines = async (req, res) => {

    try {

        const report = await ReportService.getTopSellingMedicines();

        res.status(200).json({
            success: true,
            count: report.length,
            data: report
        });

    } catch (error) {

        res.status(500).json({
            success: false,
            message: error.message
        });

    }

};