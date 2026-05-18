const pool = require("../config/db");


// CREATE BILL ITEM
exports.createBillItem = async (data) => {

    const {
        bill_id,
        medicine_id,
        quantity,
        price,
        gst,
        discount,
        total
    } = data;

    const [result] = await pool.query(`
        INSERT INTO bill_items (
            bill_id,
            medicine_id,
            quantity,
            price,
            gst,
            discount,
            total
        )
        VALUES (?, ?, ?, ?, ?, ?, ?)
    `, [
        bill_id,
        medicine_id,
        quantity,
        price,
        gst,
        discount,
        total
    ]);

    return result;
};


// GET ITEMS BY BILL ID
exports.getBillItems = async (bill_id) => {

    const [rows] = await pool.query(`
        SELECT
            bill_items.*,
            medicines.medicine_name,
            medicines.batch_number
        FROM bill_items
        LEFT JOIN medicines
        ON bill_items.medicine_id = medicines.medicine_id
        WHERE bill_items.bill_id = ?
    `, [bill_id]);

    return rows;
};