const pool = require("../config/db");

// Auto-initialize suppliers table if it doesn't exist
const ensureTable = async () => {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS suppliers (
        supplier_id INT AUTO_INCREMENT PRIMARY KEY,
        supplier_name VARCHAR(255) NOT NULL,
        contact_person VARCHAR(255),
        mobile VARCHAR(20) NOT NULL,
        email VARCHAR(255),
        address TEXT,
        gst_number VARCHAR(50),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_supplier_mobile (mobile)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);
  } catch (err) {
    console.error("Error creating suppliers table in MySQL:", err.message);
  }
};
ensureTable();

exports.getAllSuppliers = async () => {
  try {
    await ensureTable();
    const [rows] = await pool.query(`SELECT * FROM suppliers ORDER BY supplier_id DESC`);
    return rows;
  } catch (err) {
    console.warn("MySQL getAllSuppliers fallback:", err.message);
    return [];
  }
};

exports.getSupplierById = async (id) => {
  try {
    await ensureTable();
    const [rows] = await pool.query(`SELECT * FROM suppliers WHERE supplier_id = ?`, [id]);
    return rows[0];
  } catch (err) {
    return null;
  }
};

exports.getSupplierByMobile = async (mobile) => {
  try {
    await ensureTable();
    const [rows] = await pool.query(`SELECT * FROM suppliers WHERE mobile = ?`, [mobile]);
    return rows[0];
  } catch (err) {
    return null;
  }
};

exports.createSupplier = async (data) => {
  await ensureTable();
  const {
    supplier_name,
    name,
    contact_person,
    contactPerson,
    mobile,
    mobile_number,
    email,
    address,
    gst_number,
    gstNumber,
  } = data;

  const finalName = (supplier_name || name || "").trim();
  const finalContact = (contact_person || contactPerson || "").trim();
  const finalMobile = (mobile || mobile_number || "").trim();
  const finalEmail = (email || "").trim();
  const finalAddress = (address || "").trim();
  const finalGst = (gst_number || gstNumber || "").trim().toUpperCase();

  // Check duplicate
  if (finalMobile) {
    const existing = await exports.getSupplierByMobile(finalMobile);
    if (existing) {
      return { ...existing, _alreadyExists: true };
    }
  }

  const [result] = await pool.query(
    `INSERT INTO suppliers (supplier_name, contact_person, mobile, email, address, gst_number) VALUES (?, ?, ?, ?, ?, ?)`,
    [finalName, finalContact, finalMobile, finalEmail, finalAddress, finalGst]
  );

  return {
    supplier_id: result.insertId,
    id: result.insertId,
    supplier_name: finalName,
    contact_person: finalContact,
    mobile: finalMobile,
    email: finalEmail,
    address: finalAddress,
    gst_number: finalGst,
  };
};
