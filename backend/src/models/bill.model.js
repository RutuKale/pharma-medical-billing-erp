const pool = require("../config/db");


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
        notes
    } = data;

    const [result] = await pool.query(`
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
    `, [
        patient_id,
        bill_number,
        subtotal,
        total_discount,
        total_gst,
        grand_total,
        payment_mode,
        payment_status,
        notes
    ]);

    return result;
};


// GET ALL BILLS
exports.getAllBills = async () => {

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

    return rows;
};


// GET SINGLE BILL
exports.getBillById = async (id) => {

    const [rows] = await pool.query(`
        SELECT
            bills.*,
            patients.patient_name,
            patients.mobile_number
        FROM bills
        LEFT JOIN patients
        ON bills.patient_id = patients.patient_id
        WHERE bill_id = ?
    `, [id]);

    return rows[0];
};


// DELETE BILL
exports.deleteBill = async (id) => {

    const [result] = await pool.query(`
        DELETE FROM bills
        WHERE bill_id = ?
    `, [id]);

    return result;
};