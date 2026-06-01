const pool = require("../config/db");

// GET ALL PATIENTS
exports.getAllPatients = async () => {
  const [rows] = await pool.query(`
        SELECT * FROM patients
        ORDER BY patient_id DESC
    `);

  return rows;
};

// GET SINGLE PATIENT
exports.getPatientById = async (id) => {
  const [rows] = await pool.query(
    `
        SELECT * FROM patients
        WHERE patient_id = ?
    `,
    [id],
  );

  return rows[0];
};

// SEARCH PATIENT BY MOBILE
exports.getPatientByMobile = async (mobile) => {
  const [rows] = await pool.query(
    `
        SELECT * FROM patients
        WHERE mobile_number = ?
    `,
    [mobile],
  );

  return rows[0];
};

// CREATE PATIENT
exports.createPatient = async (data) => {
  const {
    patient_name,
    mobile_number,
    age,
    gender,
    doctor_name,
    prescription_number,
    address,
    notes,
  } = data;

  const [result] = await pool.query(
    `
        INSERT INTO patients (
            patient_name,
            mobile_number,
            age,
            gender,
            doctor_name,
            prescription_number,
            address,
            notes
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `,
    [
      patient_name,
      mobile_number,
      age,
      gender,
      doctor_name,
      prescription_number,
      address,
      notes,
    ],
  );

  return result;
};

// UPDATE PATIENT
exports.updatePatient = async (id, data) => {
  const {
    patient_name,
    mobile_number,
    age,
    gender,
    doctor_name,
    prescription_number,
    address,
    notes,
  } = data;

  const [result] = await pool.query(
    `
        UPDATE patients
        SET
            patient_name = ?,
            mobile_number = ?,
            age = ?,
            gender = ?,
            doctor_name = ?,
            prescription_number = ?,
            address = ?,
            notes = ?
        WHERE patient_id = ?
    `,
    [
      patient_name,
      mobile_number,
      age,
      gender,
      doctor_name,
      prescription_number,
      address,
      notes,
      id,
    ],
  );

  return result;
};

// DELETE PATIENT
exports.deletePatient = async (id) => {
  const [result] = await pool.query(
    `
        DELETE FROM patients
        WHERE patient_id = ?
    `,
    [id],
  );

  return result;
};
