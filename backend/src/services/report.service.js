const pool = require("../config/db");


// DAILY SALES REPORT
exports.getDailySalesReport = async () => {

    const [rows] = await pool.query(`
        SELECT
            DATE(bill_date) AS sales_date,
            COUNT(*) AS total_bills,
            SUM(grand_total) AS total_sales,
            SUM(total_gst) AS total_gst,
            SUM(total_discount) AS total_discount
        FROM bills
        GROUP BY DATE(bill_date)
        ORDER BY sales_date DESC
    `);

    return rows;
};


// SALES REPORT BETWEEN DATES
exports.getSalesReportByDate = async (
    start_date,
    end_date
) => {

    const [rows] = await pool.query(`
        SELECT
            bills.*,
            patients.patient_name,
            patients.mobile_number
        FROM bills
        LEFT JOIN patients
        ON bills.patient_id = patients.patient_id
        WHERE DATE(bills.bill_date)
        BETWEEN ? AND ?
        ORDER BY bills.bill_date DESC
    `, [
        start_date,
        end_date
    ]);

    return rows;
};


// LOW STOCK REPORT
exports.getLowStockReport = async () => {

    const [rows] = await pool.query(`
        SELECT *
        FROM medicines
        WHERE quantity <= min_stock
        ORDER BY quantity ASC
    `);

    return rows;
};


// CURRENT STOCK REPORT
exports.getCurrentStockReport = async () => {

    const [rows] = await pool.query(`
        SELECT
            medicine_name,
            category,
            batch_number,
            quantity,
            purchase_price,
            selling_price,
            expiry_date
        FROM medicines
        ORDER BY medicine_name ASC
    `);

    return rows;
};


// INVENTORY MOVEMENT REPORT
exports.getInventoryMovementReport = async () => {

    const [rows] = await pool.query(`
        SELECT
            inventory_logs.*,
            medicines.medicine_name
        FROM inventory_logs
        LEFT JOIN medicines
        ON inventory_logs.medicine_id = medicines.medicine_id
        ORDER BY inventory_logs.created_at DESC
    `);

    return rows;
};


// EXPIRY REPORT
exports.getExpiryReport = async () => {

    const [rows] = await pool.query(`
        SELECT
            medicine_name,
            batch_number,
            quantity,
            expiry_date,
            DATEDIFF(
                expiry_date,
                CURDATE()
            ) AS days_remaining
        FROM medicines
        WHERE expiry_date <= DATE_ADD(
            CURDATE(),
            INTERVAL 90 DAY
        )
        ORDER BY expiry_date ASC
    `);

    return rows;
};


// TOP SELLING MEDICINES
exports.getTopSellingMedicines = async () => {

    const [rows] = await pool.query(`
        SELECT
            medicines.medicine_name,
            SUM(bill_items.quantity)
            AS total_sold
        FROM bill_items
        LEFT JOIN medicines
        ON bill_items.medicine_id =
        medicines.medicine_id
        GROUP BY medicines.medicine_id
        ORDER BY total_sold DESC
        LIMIT 10
    `);

    return rows;
};