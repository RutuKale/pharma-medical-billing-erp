const pool = require("../config/db");

// GET ALL EXPIRED MEDICINES
exports.getExpiredMedicines = async () => {
  const [rows] = await pool.query(`
        SELECT *
        FROM medicines
        WHERE expiry_date < CURDATE()
        ORDER BY expiry_date ASC
    `);

  return rows;
};

// GET NEAR EXPIRY MEDICINES
exports.getNearExpiryMedicines = async () => {
  const [rows] = await pool.query(`
        SELECT *,
        DATEDIFF(expiry_date, CURDATE()) AS days_remaining
        FROM medicines
        WHERE expiry_date BETWEEN CURDATE()
        AND DATE_ADD(CURDATE(), INTERVAL 90 DAY)
        ORDER BY expiry_date ASC
    `);

  return rows;
};

// GET SAFE MEDICINES
exports.getSafeMedicines = async () => {
  const [rows] = await pool.query(`
        SELECT *,
        DATEDIFF(expiry_date, CURDATE()) AS days_remaining
        FROM medicines
        WHERE expiry_date > DATE_ADD(CURDATE(), INTERVAL 90 DAY)
        ORDER BY expiry_date ASC
    `);

  return rows;
};

// CREATE EXPIRY LOG
exports.createExpiryLog = async (data) => {
  const { medicine_id, expiry_status, days_remaining, action_taken, remarks } =
    data;

  const [result] = await pool.query(
    `
        INSERT INTO expiry_logs (
            medicine_id,
            expiry_status,
            days_remaining,
            action_taken,
            remarks
        )
        VALUES (?, ?, ?, ?, ?)
    `,
    [medicine_id, expiry_status, days_remaining, action_taken, remarks],
  );

  return result;
};

// WRITE OFF EXPIRED MEDICINE
exports.writeOffMedicine = async (medicine_id, remarks) => {
  // UPDATE MEDICINE STATUS
  await pool.query(
    `
        UPDATE medicines
        SET
            status = 'EXPIRED',
            quantity = 0
        WHERE medicine_id = ?
    `,
    [medicine_id],
  );

  // CREATE EXPIRY LOG
  const [result] = await pool.query(
    `
        INSERT INTO expiry_logs (
            medicine_id,
            expiry_status,
            days_remaining,
            action_taken,
            remarks
        )
        VALUES (?, 'EXPIRED', 0, 'WRITTEN_OFF', ?)
    `,
    [medicine_id, remarks],
  );

  return result;
};

// PROCESS RETURN BILL TO MANUFACTURER
exports.processReturnBill = async ({ manufacturer, items, reason, returnNoteNumber }) => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    for (const item of items) {
      const returnQty = Number(item.returnQuantity || 0);
      const medicineId = item.medicine_id || item.id;
      if (returnQty > 0 && medicineId) {
        await connection.query(
          `UPDATE medicines 
           SET quantity = GREATEST(0, quantity - ?) 
           WHERE medicine_id = ?`,
          [returnQty, medicineId]
        );

        try {
          await connection.query(
            `INSERT INTO expiry_logs (
                medicine_id,
                expiry_status,
                days_remaining,
                action_taken,
                remarks
            ) VALUES (?, 'RETURNED', 0, 'RETURN_BILL', ?)`,
            [
              medicineId,
              `Returned ${returnQty} units to manufacturer ${manufacturer || 'Supplier'}. Note: ${returnNoteNumber || '-'}. Reason: ${reason || 'Expiry return'}`
            ]
          );
        } catch (logErr) {
          console.warn("Could not insert expiry log:", logErr.message);
        }
      }
    }

    await connection.commit();
    return { success: true, count: items.length };
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
};
