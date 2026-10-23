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
  const [rows] = await pool.query(
    `
        SELECT * FROM medicines
        WHERE medicine_id = ?
    `,
    [id],
  );

  return rows[0];
};

// GET MEDICINES BY SUPPLIER
exports.getMedicinesBySupplier = async (supplierId) => {
  const [rows] = await pool.query(
    `
        SELECT * FROM medicines
        WHERE supplier_id = ?
        ORDER BY medicine_id DESC
    `,
    [supplierId],
  );

  return rows;
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
    min_stock,
    supplier_id,
    supplier_name,
    supplier_contact,
    supplier_mobile,
    supplier_email,
    supplier_address,
    supplier_gst,
  } = data;

  const [result] = await pool.query(
    `
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
            min_stock,
            supplier_id,
            supplier_name,
            supplier_contact,
            supplier_mobile,
            supplier_email,
            supplier_address,
            supplier_gst
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `,
    [
      medicine_name,
      salt_name,
      brand_name,
      manufacturer,
      category,
      pack_size,
      unit,
      purchase_price,
      selling_price,
      gst || 0,
      batch_number,
      manufacture_date,
      expiry_date,
      quantity,
      rack_location,
      min_stock || 0,
      supplier_id || null,
      supplier_name || null,
      supplier_contact || null,
      supplier_mobile || null,
      supplier_email || null,
      supplier_address || null,
      supplier_gst || null,
    ],
  );

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
    "min_stock",
    "supplier_id",
    "supplier_name",
    "supplier_contact",
    "supplier_mobile",
    "supplier_email",
    "supplier_address",
    "supplier_gst",
  ];

  const values = dataArray.map((row) =>
    columns.map((column) => {
      if (column === "gst") return row.gst || 0;
      return Object.prototype.hasOwnProperty.call(row, column) ? row[column] : null;
    }),
  );

  const [result] = await pool.query(
    `
        INSERT INTO medicines (
            ${columns.join(",\n            ")}
        )
        VALUES ?
    `,
    [values],
  );

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
    status,
    supplier_id,
    supplier_name,
    supplier_contact,
    supplier_mobile,
    supplier_email,
    supplier_address,
    supplier_gst,
  } = data;

  const [result] = await pool.query(
    `
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
            status = ?,
            supplier_id = ?,
            supplier_name = ?,
            supplier_contact = ?,
            supplier_mobile = ?,
            supplier_email = ?,
            supplier_address = ?,
            supplier_gst = ?
        WHERE medicine_id = ?
    `,
    [
      medicine_name,
      salt_name,
      brand_name,
      manufacturer,
      category,
      pack_size,
      unit,
      purchase_price,
      selling_price,
      gst || 0,
      batch_number,
      manufacture_date,
      expiry_date,
      quantity,
      rack_location,
      min_stock || 0,
      status || "ACTIVE",
      supplier_id || null,
      supplier_name || null,
      supplier_contact || null,
      supplier_mobile || null,
      supplier_email || null,
      supplier_address || null,
      supplier_gst || null,
      id,
    ],
  );

  return result;
};

// DELETE MEDICINE
exports.deleteMedicine = async (id) => {
  const [result] = await pool.query(
    `
        DELETE FROM medicines
        WHERE medicine_id = ?
    `,
    [id],
  );

  return result;
};
