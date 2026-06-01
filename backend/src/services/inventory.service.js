const pool = require("../config/db");

// REDUCE STOCK
exports.reduceStock = async (medicine_id, quantity) => {
  const [medicineRows] = await pool.query(
    `
        SELECT quantity
        FROM medicines
        WHERE medicine_id = ?
    `,
    [medicine_id],
  );

  const currentQuantity = medicineRows[0].quantity;

  const updatedQuantity = currentQuantity - quantity;

  await pool.query(
    `
        UPDATE medicines
        SET quantity = ?
        WHERE medicine_id = ?
    `,
    [updatedQuantity, medicine_id],
  );

  return updatedQuantity;
};

// ADD STOCK
exports.addStock = async (medicine_id, quantity) => {
  const [medicineRows] = await pool.query(
    `
        SELECT quantity
        FROM medicines
        WHERE medicine_id = ?
    `,
    [medicine_id],
  );

  const currentQuantity = medicineRows[0].quantity;

  const updatedQuantity = currentQuantity + quantity;

  await pool.query(
    `
        UPDATE medicines
        SET quantity = ?
        WHERE medicine_id = ?
    `,
    [updatedQuantity, medicine_id],
  );

  return updatedQuantity;
};

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
