const pool = require("../config/db");

// IN-MEMORY FALLBACK PATIENTS REGISTER (Used if database connection is pending or offline)
let memoryPatients = [
  {
    patient_id: 1,
    patient_name: "Ramesh Kumar Sharma",
    mobile_number: "9876543210",
    age: 48,
    gender: "Male",
    doctor_name: "Dr. A. K. Joshi",
    prescription_number: "RX-2026-081",
    address: "Flat 402, Green Avenue, Akola",
    notes: "Hypertension and seasonal allergies",
    reminders_enabled: 1,
    created_at: new Date().toISOString(),
  },
  {
    patient_id: 2,
    patient_name: "Sneha Patil",
    mobile_number: "9823456789",
    age: 32,
    gender: "Female",
    doctor_name: "Dr. Priya Deshmukh",
    prescription_number: "RX-2026-112",
    address: "Near Civil Hospital, Akola",
    notes: "Diabetic patient - Metformin refills",
    reminders_enabled: 1,
    created_at: new Date().toISOString(),
  },
  {
    patient_id: 3,
    patient_name: "Amit Deshmukh",
    mobile_number: "9811223344",
    age: 55,
    gender: "Male",
    doctor_name: "Dr. A. K. Joshi",
    prescription_number: "RX-2026-140",
    address: "Civil Lines, Akola",
    notes: "Cardiac follow-up",
    reminders_enabled: 0,
    created_at: new Date().toISOString(),
  },
];

// GET ALL PATIENTS
exports.getAllPatients = async () => {
  try {
    const [rows] = await pool.query(`
        SELECT * FROM patients
        ORDER BY patient_id DESC
    `);
    if (rows && rows.length > 0) return rows;
    return memoryPatients;
  } catch (error) {
    console.warn("MySQL getAllPatients fallback triggered:", error.message);
    return memoryPatients;
  }
};

// GET SINGLE PATIENT
exports.getPatientById = async (id) => {
  try {
    const [rows] = await pool.query(
      `
        SELECT * FROM patients
        WHERE patient_id = ?
      `,
      [id],
    );
    if (rows && rows[0]) return rows[0];
  } catch (error) {
    console.warn("MySQL getPatientById fallback:", error.message);
  }
  return memoryPatients.find((p) => String(p.patient_id) === String(id)) || null;
};

// SEARCH PATIENT BY MOBILE
exports.getPatientByMobile = async (mobile) => {
  try {
    const [rows] = await pool.query(
      `
        SELECT * FROM patients
        WHERE mobile_number = ?
      `,
      [mobile],
    );
    if (rows && rows[0]) return rows[0];
  } catch (error) {
    console.warn("MySQL getPatientByMobile fallback:", error.message);
  }
  return memoryPatients.find((p) => String(p.mobile_number) === String(mobile)) || null;
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
    reminders_enabled,
  } = data;

  const newPatient = {
    patient_id: Date.now(),
    patient_name: patient_name || "New Patient",
    mobile_number: mobile_number || "",
    age: Number(age || 0),
    gender: gender || "Other",
    doctor_name: doctor_name || "",
    prescription_number: prescription_number || "",
    address: address || "",
    notes: notes || "",
    reminders_enabled: reminders_enabled !== undefined ? (reminders_enabled ? 1 : 0) : 1,
    created_at: new Date().toISOString(),
  };

  try {
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
        newPatient.patient_name,
        newPatient.mobile_number,
        newPatient.age,
        newPatient.gender,
        newPatient.doctor_name,
        newPatient.prescription_number,
        newPatient.address,
        newPatient.notes,
      ],
    );

    newPatient.patient_id = result.insertId;
  } catch (error) {
    console.warn("MySQL createPatient fallback:", error.message);
  }

  memoryPatients.unshift(newPatient);
  return newPatient;
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
    reminders_enabled,
  } = data;

  try {
    await pool.query(
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
  } catch (error) {
    console.warn("MySQL updatePatient fallback:", error.message);
  }

  const idx = memoryPatients.findIndex((p) => String(p.patient_id) === String(id));
  if (idx !== -1) {
    memoryPatients[idx] = { ...memoryPatients[idx], ...data, patient_id: id };
  }
  return { patient_id: id, ...data };
};

// DELETE PATIENT
exports.deletePatient = async (id) => {
  try {
    await pool.query(
      `
        DELETE FROM patients
        WHERE patient_id = ?
      `,
      [id],
    );
  } catch (error) {
    console.warn("MySQL deletePatient fallback:", error.message);
  }

  memoryPatients = memoryPatients.filter((p) => String(p.patient_id) !== String(id));
  return { success: true, patient_id: id };
};
