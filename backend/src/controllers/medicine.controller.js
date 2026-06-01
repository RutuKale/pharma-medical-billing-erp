const Medicine = require("../models/medicine.model");

const parseDateValue = (value) => {
  if (!value) return null;

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return date.toISOString().split("T")[0];
};

const parseNumberValue = (value) => {
  if (value === undefined || value === null || value === "") return null;

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
};

const normalizeMedicineRow = (row) => ({
  medicine_name: row.medicineName || row.medicine_name || null,
  salt_name: row.saltName || row.salt_name || null,
  brand_name: row.brandName || row.brand_name || null,
  manufacturer: row.manufacturer || null,
  category: row.category || null,
  pack_size: row.packSize || row.pack_size || null,
  unit: row.unit || null,
  purchase_price: parseNumberValue(row.purchasePrice ?? row.purchase_price),
  selling_price: parseNumberValue(row.sellingPrice ?? row.selling_price),
  gst: parseNumberValue(row.gst),
  batch_number: row.batchNumber || row.batch_number || null,
  manufacture_date: parseDateValue(row.manufactureDate || row.manufacture_date),
  expiry_date: parseDateValue(row.expiryDate || row.expiry_date),
  quantity: parseNumberValue(row.quantity),
  rack_location: row.rackLocation || row.rack_location || null,
  min_stock: parseNumberValue(row.minStock ?? row.min_stock),
});

// GET ALL
exports.getMedicines = async (req, res) => {
  try {
    const medicines = await Medicine.getAllMedicines();

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

// GET SINGLE
exports.getMedicine = async (req, res) => {
  try {
    const medicine = await Medicine.getMedicineById(req.params.id);

    res.status(200).json({
      success: true,
      data: medicine,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
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
      data: result,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// BULK CREATE
exports.bulkCreateMedicines = async (req, res) => {
  try {
    const rows = Array.isArray(req.body) ? req.body : [];

    if (rows.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Request body must be a non-empty array of medicines.",
      });
    }

    const medicines = rows.map(normalizeMedicineRow);

    const invalidRows = medicines
      .map((row, index) => {
        if (
          !row.medicine_name ||
          !row.batch_number ||
          !row.expiry_date ||
          !row.quantity
        ) {
          return index + 1;
        }
        return null;
      })
      .filter(Boolean);

    if (invalidRows.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Missing required fields for rows: ${invalidRows.join(", ")}`,
      });
    }

    const result = await Medicine.bulkCreateMedicines(medicines);

    res.status(201).json({
      success: true,
      message: `${result.affectedRows || 0} medicines imported successfully`,
      data: {
        insertedRows: result.affectedRows || 0,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// UPDATE
exports.updateMedicine = async (req, res) => {
  try {
    const result = await Medicine.updateMedicine(req.params.id, req.body);

    res.status(200).json({
      success: true,
      message: "Medicine updated successfully",
      data: result,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
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
      data: result,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
