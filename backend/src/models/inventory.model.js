const pool = require("../config/db");

// CREATE INVENTORY LOG
exports.createInventoryLog = async (data) => {
  const {
    medicine_id,
    bill_item_id,
    movement_type,
    quantity,
    previous_stock,
    current_stock,
    remarks,
  } = data;

  const [result] = await pool.query(
    `
        INSERT INTO inventory_logs (
            medicine_id,
            bill_item_id,
            movement_type,
            quantity,
            previous_stock,
            current_stock,
            remarks
        )
        VALUES (?, ?, ?, ?, ?, ?, ?)
    `,
    [
      medicine_id,
      bill_item_id,
      movement_type,
      quantity,
      previous_stock,
      current_stock,
      remarks,
    ],
  );

  return result;
};

// GET ALL INVENTORY LOGS
exports.getInventoryLogs = async () => {
  const [rows] = await pool.query(`
        SELECT
            inventory_logs.*,
            medicines.medicine_name,
            medicines.batch_number
        FROM inventory_logs
        LEFT JOIN medicines
        ON inventory_logs.medicine_id = medicines.medicine_id
        ORDER BY inventory_log_id DESC
    `);

  return rows;
};

// GET INVENTORY BY MEDICINE
exports.getInventoryByMedicine = async (medicine_id) => {
  const [rows] = await pool.query(
    `
        SELECT
            inventory_logs.*,
            medicines.medicine_name
        FROM inventory_logs
        LEFT JOIN medicines
        ON inventory_logs.medicine_id = medicines.medicine_id
        WHERE inventory_logs.medicine_id = ?
        ORDER BY inventory_log_id DESC
    `,
    [medicine_id],
  );

  return rows;
};

// STOCK IN
exports.stockInMedicine = async (medicine_id, quantity, remarks) => {
  // GET CURRENT STOCK
  const [medicineRows] = await pool.query(
    `
        SELECT quantity
        FROM medicines
        WHERE medicine_id = ?
    `,
    [medicine_id],
  );

  const previous_stock = medicineRows[0].quantity;

  const current_stock = previous_stock + quantity;

  // UPDATE STOCK
  await pool.query(
    `
        UPDATE medicines
        SET quantity = ?
        WHERE medicine_id = ?
    `,
    [current_stock, medicine_id],
  );

  // CREATE LOG
  const [result] = await pool.query(
    `
        INSERT INTO inventory_logs (
            medicine_id,
            movement_type,
            quantity,
            previous_stock,
            current_stock,
            remarks
        )
        VALUES (?, 'STOCK_IN', ?, ?, ?, ?)
    `,
    [medicine_id, quantity, previous_stock, current_stock, remarks],
  );

  return result;
};

// STOCK OUT
exports.stockOutMedicine = async (medicine_id, quantity, remarks) => {
  // GET CURRENT STOCK
  const [medicineRows] = await pool.query(
    `
        SELECT quantity
        FROM medicines
        WHERE medicine_id = ?
    `,
    [medicine_id],
  );

  const previous_stock = medicineRows[0].quantity;

  const current_stock = previous_stock - quantity;

  // UPDATE STOCK
  await pool.query(
    `
        UPDATE medicines
        SET quantity = ?
        WHERE medicine_id = ?
    `,
    [current_stock, medicine_id],
  );

  // CREATE LOG
  const [result] = await pool.query(
    `
        INSERT INTO inventory_logs (
            medicine_id,
            movement_type,
            quantity,
            previous_stock,
            current_stock,
            remarks
        )
        VALUES (?, 'STOCK_OUT', ?, ?, ?, ?)
    `,
    [medicine_id, quantity, previous_stock, current_stock, remarks],
  );

  return result;
};
