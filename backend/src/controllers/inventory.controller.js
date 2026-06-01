const Inventory = require("../models/inventory.model");

// GET ALL INVENTORY LOGS
exports.getInventoryLogs = async (req, res) => {
  try {
    const logs = await Inventory.getInventoryLogs();

    res.status(200).json({
      success: true,
      count: logs.length,
      data: logs,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// GET INVENTORY BY MEDICINE
exports.getInventoryByMedicine = async (req, res) => {
  try {
    const logs = await Inventory.getInventoryByMedicine(req.params.medicine_id);

    res.status(200).json({
      success: true,
      count: logs.length,
      data: logs,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// STOCK IN
exports.stockInMedicine = async (req, res) => {
  try {
    const { medicine_id, quantity, remarks } = req.body;

    const result = await Inventory.stockInMedicine(
      medicine_id,
      quantity,
      remarks,
    );

    res.status(201).json({
      success: true,
      message: "Stock added successfully",
      data: result,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// STOCK OUT
exports.stockOutMedicine = async (req, res) => {
  try {
    const { medicine_id, quantity, remarks } = req.body;

    const result = await Inventory.stockOutMedicine(
      medicine_id,
      quantity,
      remarks,
    );

    res.status(201).json({
      success: true,
      message: "Stock removed successfully",
      data: result,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
