const Supplier = require("../models/supplier.model");

exports.getSuppliers = async (req, res) => {
  try {
    const suppliers = await Supplier.getAllSuppliers();
    res.status(200).json({
      success: true,
      count: suppliers.length,
      data: suppliers,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.getSupplier = async (req, res) => {
  try {
    const supplier = await Supplier.getSupplierById(req.params.id);
    if (!supplier) {
      return res.status(404).json({
        success: false,
        message: "Supplier not found",
      });
    }
    res.status(200).json({
      success: true,
      data: supplier,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

exports.createSupplier = async (req, res) => {
  try {
    const { supplier_name, name, mobile, mobile_number } = req.body;
    const finalName = supplier_name || name;
    const finalMobile = mobile || mobile_number;

    if (!finalName || !finalName.trim()) {
      return res.status(400).json({
        success: false,
        message: "Supplier name is required",
      });
    }

    const cleanMobile = (finalMobile || "").replace(/\D/g, "");
    if (!cleanMobile || cleanMobile.length !== 10) {
      return res.status(400).json({
        success: false,
        message: "A valid 10-digit mobile number is required",
      });
    }

    const created = await Supplier.createSupplier(req.body);
    res.status(201).json({
      success: true,
      message: created._alreadyExists ? "Supplier already exists (linked)" : "Supplier created successfully",
      data: created,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
