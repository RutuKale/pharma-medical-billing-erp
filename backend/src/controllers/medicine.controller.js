const Medicine = require("../models/medicine.model");


// GET ALL
exports.getMedicines = async (req, res) => {
    try {

        const medicines = await Medicine.getAllMedicines();

        res.status(200).json({
            success: true,
            count: medicines.length,
            data: medicines
        });

    } catch (error) {

        res.status(500).json({
            success: false,
            message: error.message
        });

    }
};


// GET SINGLE
exports.getMedicine = async (req, res) => {
    try {

        const medicine = await Medicine.getMedicineById(req.params.id);

        res.status(200).json({
            success: true,
            data: medicine
        });

    } catch (error) {

        res.status(500).json({
            success: false,
            message: error.message
        });

    }
};


// CREATE
exports.createMedicine = async (req, res) => {
    try {

        const result = await Medicine.createMedicine(req.body);

        res.status(201).json({
            success: true,
            message: "Medicine added successfully",
            data: result
        });

    } catch (error) {

        res.status(500).json({
            success: false,
            message: error.message
        });

    }
};


// UPDATE
exports.updateMedicine = async (req, res) => {
    try {

        const result = await Medicine.updateMedicine(
            req.params.id,
            req.body
        );

        res.status(200).json({
            success: true,
            message: "Medicine updated successfully",
            data: result
        });

    } catch (error) {

        res.status(500).json({
            success: false,
            message: error.message
        });

    }
};


// DELETE
exports.deleteMedicine = async (req, res) => {
    try {

        const result = await Medicine.deleteMedicine(req.params.id);

        res.status(200).json({
            success: true,
            message: "Medicine deleted successfully",
            data: result
        });

    } catch (error) {

        res.status(500).json({
            success: false,
            message: error.message
        });

    }
};