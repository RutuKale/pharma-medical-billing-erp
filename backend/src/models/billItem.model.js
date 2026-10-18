const pool = require("../config/db");

let memoryBillItems = {
  1: [
    {
      bill_item_id: 1,
      bill_id: 1,
      medicine_id: 1,
      medicine_name: "Paracetamol 500mg",
      batch_number: "PCM-2026-A1",
      quantity: 2,
      price: 25.0,
      gst: 12,
      discount: 10,
      total: 50.0,
    },
    {
      bill_item_id: 2,
      bill_id: 1,
      medicine_id: 2,
      medicine_name: "Amoxicillin 250mg",
      batch_number: "AMX-2026-B4",
      quantity: 1,
      price: 68.0,
      gst: 12,
      discount: 0,
      total: 68.0,
    },
  ],
  2: [
    {
      bill_item_id: 3,
      bill_id: 2,
      medicine_id: 3,
      medicine_name: "Azithromycin 500mg",
      batch_number: "AZI-2025-C9",
      quantity: 2,
      price: 115.0,
      gst: 12,
      discount: 28,
      total: 230.0,
    },
  ],
};

// CREATE BILL ITEM
exports.createBillItem = async (data) => {
  const { bill_id, medicine_id, quantity, price, gst, discount, total } = data;

  try {
    const [result] = await pool.query(
      `
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
      `,
      [bill_id, medicine_id, quantity, price, gst, discount, total],
    );

    return result;
  } catch (error) {
    console.warn("MySQL createBillItem fallback:", error.message);
    const item = {
      bill_item_id: Date.now(),
      bill_id,
      medicine_id,
      quantity,
      price,
      gst,
      discount,
      total,
    };
    if (!memoryBillItems[bill_id]) memoryBillItems[bill_id] = [];
    memoryBillItems[bill_id].push(item);
    return { insertId: item.bill_item_id };
  }
};

// GET ITEMS BY BILL ID
exports.getBillItems = async (bill_id) => {
  try {
    const [rows] = await pool.query(
      `
          SELECT
              bill_items.*,
              medicines.medicine_name,
              medicines.batch_number
          FROM bill_items
          LEFT JOIN medicines
          ON bill_items.medicine_id = medicines.medicine_id
          WHERE bill_items.bill_id = ?
      `,
      [bill_id],
    );

    if (rows && rows.length > 0) return rows;
  } catch (error) {
    console.warn("MySQL getBillItems fallback:", error.message);
  }

  return memoryBillItems[bill_id] || [];
};

