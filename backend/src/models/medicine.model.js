const pool = require("../config/db");


// GET ALL MEDICINES
exports.getAllMedicines = async () => {
    const [rows] = await pool.query(`
        SELECT * FROM medicines
        ORDER BY medicine_id DESC
    `);

    return rows;
};


// GET SINGLE MEDICINE
exports.getMedicineById = async (id) => {
    const [rows] = await pool.query(`
        SELECT * FROM medicines
        WHERE medicine_id = ?
    `, [id]);

    return rows[0];
};


// ADD MEDICINE
exports.createMedicine = async (data) => {

    const {
        medicine_name,
        salt_name,
        brand_name,
        manufacturer,
        category,
        pack_size,
        unit,
        purchase_price,
        selling_price,
        gst,
        batch_number,
        manufacture_date,
        expiry_date,
        quantity,
        rack_location,
        min_stock
    } = data;

    const [result] = await pool.query(`
        INSERT INTO medicines (
            medicine_name,
            salt_name,
            brand_name,
            manufacturer,
            category,
            pack_size,
            unit,
            purchase_price,
            selling_price,
            gst,
            batch_number,
            manufacture_date,
            expiry_date,
            quantity,
            rack_location,
            min_stock
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
        medicine_name,
        salt_name,
        brand_name,
        manufacturer,
        category,
        pack_size,
        unit,
        purchase_price,
        selling_price,
        gst,
        batch_number,
        manufacture_date,
        expiry_date,
        quantity,
        rack_location,
        min_stock
    ]);

    return result;
};


// BULK CREATE MEDICINES
exports.bulkCreateMedicines = async (dataArray) => {
    if (!Array.isArray(dataArray) || dataArray.length === 0) {
        return { affectedRows: 0 };
    }

    const columns = [
        "medicine_name",
        "salt_name",
        "brand_name",
        "manufacturer",
        "category",
        "pack_size",
        "unit",
        "purchase_price",
        "selling_price",
        "gst",
        "batch_number",
        "manufacture_date",
        "expiry_date",
        "quantity",
        "rack_location",
        "min_stock"
    ];

    const values = dataArray.map((row) =>
        columns.map((column) =>
            Object.prototype.hasOwnProperty.call(row, column)
                ? row[column]
                : null
        )
    );

    const [result] = await pool.query(`
        INSERT INTO medicines (
            ${columns.join(",\n            ")}
        )
        VALUES ?
    `, [values]);

    return result;
};


// UPDATE MEDICINE
exports.updateMedicine = async (id, data) => {

    const {
        medicine_name,
        salt_name,
        brand_name,
        manufacturer,
        category,
        pack_size,
        unit,
        purchase_price,
        selling_price,
        gst,
        batch_number,
        manufacture_date,
        expiry_date,
        quantity,
        rack_location,
        min_stock,
        status
    } = data;

    const [result] = await pool.query(`
        UPDATE medicines
        SET
            medicine_name = ?,
            salt_name = ?,
            brand_name = ?,
            manufacturer = ?,
            category = ?,
            pack_size = ?,
            unit = ?,
            purchase_price = ?,
            selling_price = ?,
            gst = ?,
            batch_number = ?,
            manufacture_date = ?,
            expiry_date = ?,
            quantity = ?,
            rack_location = ?,
            min_stock = ?,
            status = ?
        WHERE medicine_id = ?
    `, [
        medicine_name,
        salt_name,
        brand_name,
        manufacturer,
        category,
        pack_size,
        unit,
        purchase_price,
        selling_price,
        gst,
        batch_number,
        manufacture_date,
        expiry_date,
        quantity,
        rack_location,
        min_stock,
        status,
        id
    ]);

    return result;
};


// DELETE MEDICINE
exports.deleteMedicine = async (id) => {

    const [result] = await pool.query(`
        DELETE FROM medicines
        WHERE medicine_id = ?
    `, [id]);

    return result;
};