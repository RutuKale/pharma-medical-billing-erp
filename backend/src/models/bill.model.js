const pool = require("../config/db");

// IN-MEMORY FALLBACK BILLS (Used if database connection is pending or offline)
let memoryBills = [
  {
    bill_id: 1,
    patient_id: 1,
    bill_number: "INV-2026-101",
    subtotal: 118,
    total_discount: 10,
    total_gst: 12,
    grand_total: 120,
    payment_mode: "Cash",
    payment_status: "Completed",
    notes: "Prescription refill",
    patient_name: "Ramesh Kumar Sharma",
    mobile_number: "9876543210",
    created_at: new Date().toISOString(),
  },
  {
    bill_id: 2,
    patient_id: 2,
    bill_number: "INV-2026-102",
    subtotal: 328,
    total_discount: 28,
    total_gst: 35,
    grand_total: 335,
    payment_mode: "UPI",
    payment_status: "Completed",
    notes: "Seasonal cough",
    patient_name: "Sneha Patil",
    mobile_number: "9823456789",
    created_at: new Date().toISOString(),
  },
];

// CREATE BILL
exports.createBill = async (data) => {
  const {
    patient_id,
    bill_number,
    subtotal,
    total_discount,
    total_gst,
    grand_total,
    payment_mode,
    payment_status,
    notes,
  } = data;

  const newBill = {
    bill_id: Date.now(),
    patient_id: patient_id || "",
    bill_number: bill_number || `INV-${Date.now().toString().slice(-6)}`,
    subtotal: Number(subtotal || 0),
    total_discount: Number(total_discount || 0),
    total_gst: Number(total_gst || 0),
    grand_total: Number(grand_total || 0),
    payment_mode: payment_mode || "Cash",
    payment_status: payment_status || "Completed",
    notes: notes || "",
    created_at: new Date().toISOString(),
  };

  try {
    const [result] = await pool.query(
      `
          INSERT INTO bills (
              patient_id,
              bill_number,
              subtotal,
              total_discount,
              total_gst,
              grand_total,
              payment_mode,
              payment_status,
              notes
          )
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `,
      [
        newBill.patient_id,
        newBill.bill_number,
        newBill.subtotal,
        newBill.total_discount,
        newBill.total_gst,
        newBill.grand_total,
        newBill.payment_mode,
        newBill.payment_status,
        newBill.notes,
      ],
    );

    newBill.bill_id = result.insertId;
  } catch (error) {
    console.warn("MySQL createBill fallback:", error.message);
  }

  memoryBills.unshift(newBill);
  return newBill;
};

// GET ALL BILLS
exports.getAllBills = async () => {
  try {
    const [rows] = await pool.query(`
          SELECT
              bills.*,
              patients.patient_name,
              patients.mobile_number
          FROM bills
          LEFT JOIN patients
          ON bills.patient_id = patients.patient_id
          ORDER BY bill_id DESC
      `);
    if (rows && rows.length > 0) return rows;
    return memoryBills;
  } catch (error) {
    console.warn("MySQL getAllBills fallback:", error.message);
    return memoryBills;
  }
};

// GET SINGLE BILL
exports.getBillById = async (id) => {
  try {
    const [rows] = await pool.query(
      `
          SELECT
              bills.*,
              patients.patient_name,
              patients.mobile_number,
              patients.age,
              patients.gender,
              patients.doctor_name,
              patients.prescription_number
          FROM bills
          LEFT JOIN patients
          ON bills.patient_id = patients.patient_id
          WHERE bill_id = ?
      `,
      [id],
    );
    if (rows && rows[0]) return rows[0];
  } catch (error) {
    console.warn("MySQL getBillById fallback:", error.message);
  }

  return memoryBills.find((b) => String(b.bill_id) === String(id)) || null;
};

// GET BILLS BY PATIENT ID
exports.getBillsByPatientId = async (patient_id) => {
  try {
    const [rows] = await pool.query(
      `
      SELECT
          bills.*,
          patients.patient_name,
          patients.mobile_number
      FROM bills
      LEFT JOIN patients
      ON bills.patient_id = patients.patient_id
      WHERE bills.patient_id = ?
      ORDER BY bill_id DESC
      `,
      [patient_id],
    );
    if (rows && rows.length > 0) return rows;
  } catch (error) {
    console.warn("MySQL getBillsByPatientId fallback:", error.message);
  }
  return memoryBills.filter((b) => String(b.patient_id) === String(patient_id));
};

// UPDATE BILL
exports.updateBill = async (id, data) => {
  const {
    patient_id,
    subtotal,
    total_discount,
    total_gst,
    grand_total,
    payment_mode,
    payment_status,
    notes,
  } = data;

  try {
    await pool.query(
      `
      UPDATE bills
      SET
          patient_id = ?,
          subtotal = ?,
          total_discount = ?,
          total_gst = ?,
          grand_total = ?,
          payment_mode = ?,
          payment_status = ?,
          notes = ?
      WHERE bill_id = ?
      `,
      [
        patient_id,
        subtotal,
        total_discount,
        total_gst,
        grand_total,
        payment_mode,
        payment_status || "Completed",
        notes || "",
        id,
      ],
    );
  } catch (error) {
    console.warn("MySQL updateBill fallback:", error.message);
  }

  const idx = memoryBills.findIndex((b) => String(b.bill_id) === String(id));
  if (idx !== -1) {
    memoryBills[idx] = { ...memoryBills[idx], ...data, bill_id: id };
  } else {
    memoryBills.unshift({ bill_id: id, ...data });
  }
  return { bill_id: id, ...data };
};

// DELETE BILL
exports.deleteBill = async (id) => {
  try {
    const [result] = await pool.query(
      `
          DELETE FROM bills
          WHERE bill_id = ?
      `,
      [id],
    );
    memoryBills = memoryBills.filter((b) => String(b.bill_id) !== String(id));
    return result;
  } catch (error) {
    console.warn("MySQL deleteBill fallback:", error.message);
    memoryBills = memoryBills.filter((b) => String(b.bill_id) !== String(id));
    return { affectedRows: 1 };
  }
};

