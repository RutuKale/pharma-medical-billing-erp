const Expiry = require("../models/expiry.model");

// GET EXPIRED MEDICINES
exports.getExpiredMedicines = async (req, res) => {
  try {
    const medicines = await Expiry.getExpiredMedicines();
    res.status(200).json({
      success: true,
      count: medicines.length,
      data: medicines,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// GET NEAR EXPIRY MEDICINES
exports.getNearExpiryMedicines = async (req, res) => {
  try {
    const medicines = await Expiry.getNearExpiryMedicines();
    res.status(200).json({
      success: true,
      count: medicines.length,
      data: medicines,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// GET SAFE MEDICINES
exports.getSafeMedicines = async (req, res) => {
  try {
    const medicines = await Expiry.getSafeMedicines();
    res.status(200).json({
      success: true,
      count: medicines.length,
      data: medicines,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// WRITE OFF MEDICINE
exports.writeOffMedicine = async (req, res) => {
  try {
    const result = await Expiry.writeOffMedicine(
      req.params.medicine_id,
      req.body.remarks,
    );
    res.status(200).json({
      success: true,
      message: "Medicine written off successfully",
      data: result,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// PROCESS RETURN BILL
exports.processReturnBill = async (req, res) => {
  try {
    const { manufacturer, items, reason, returnNoteNumber } = req.body;
    if (!items || !items.length) {
      return res.status(400).json({
        success: false,
        message: "No medicine items specified for return",
      });
    }

    const result = await Expiry.processReturnBill({
      manufacturer,
      items,
      reason,
      returnNoteNumber,
    });

    res.status(200).json({
      success: true,
      message: "Return bill processed and stock deducted successfully",
      data: result,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
