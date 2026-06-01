const Patient = require("../models/patient.model");

// GET ALL
exports.getPatients = async (req, res) => {
  try {
    const patients = await Patient.getAllPatients();

    res.status(200).json({
      success: true,
      count: patients.length,
      data: patients,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// GET SINGLE
exports.getPatient = async (req, res) => {
  try {
    const patient = await Patient.getPatientById(req.params.id);

    res.status(200).json({
      success: true,
      data: patient,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// SEARCH BY MOBILE
exports.searchPatientByMobile = async (req, res) => {
  try {
    const patient = await Patient.getPatientByMobile(req.params.mobile);

    res.status(200).json({
      success: true,
      data: patient,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// CREATE
exports.createPatient = async (req, res) => {
  try {
    const result = await Patient.createPatient(req.body);

    res.status(201).json({
      success: true,
      message: "Patient created successfully",
      data: result,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// UPDATE
exports.updatePatient = async (req, res) => {
  try {
    const result = await Patient.updatePatient(req.params.id, req.body);

    res.status(200).json({
      success: true,
      message: "Patient updated successfully",
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
exports.deletePatient = async (req, res) => {
  try {
    const result = await Patient.deletePatient(req.params.id);

    res.status(200).json({
      success: true,
      message: "Patient deleted successfully",
      data: result,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
