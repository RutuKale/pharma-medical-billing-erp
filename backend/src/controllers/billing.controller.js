const Bill = require("../models/bill.model");
const BillItem = require("../models/billItem.model");
const pool = require("../config/db");

// CREATE BILL WITH ITEMS
exports.createBill = async (req, res) => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    const billData = req.body.bill;
    const items = req.body.items;
    const [billResult] = await connection.query(
      `
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
        `,
      [
        billData.patient_id,
        billData.bill_number,
        billData.subtotal,
        billData.total_discount,
        billData.total_gst,
        billData.grand_total,
        billData.payment_mode,
        billData.payment_status,
        billData.notes,
      ],
    );
    const bill_id = billResult.insertId;
    for (const item of items) {
      const [billItemResult] = await connection.query(
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
        [
          bill_id,
          item.medicine_id,
          item.quantity,
          item.price,
          item.gst,
          item.discount,
          item.total,
        ],
      );
      const bill_item_id = billItemResult.insertId;
      const [medicineRows] = await connection.query(
        `
                SELECT quantity
                FROM medicines
                WHERE medicine_id = ?
                FOR UPDATE
            `,
        [item.medicine_id],
      );
      if (medicineRows.length === 0) {
        throw new Error(`Medicine not found: ${item.medicine_id}`);
      }
      const previous_stock = medicineRows[0].quantity;
      const current_stock = previous_stock - item.quantity;
      if (current_stock < 0) {
        throw new Error(
          `Insufficient stock for medicine id ${item.medicine_id}`,
        );
      }
      await connection.query(
        `
                UPDATE medicines
                SET quantity = ?
                WHERE medicine_id = ?
            `,
        [current_stock, item.medicine_id],
      );
      await connection.query(
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
                VALUES (?, ?, 'STOCK_OUT', ?, ?, ?, ?)
            `,
        [
          item.medicine_id,
          bill_item_id,
          item.quantity,
          previous_stock,
          current_stock,
          "Sold via billing",
        ],
      );
    }
    await connection.commit();
    res.status(201).json({
      success: true,
      message: "Bill created successfully",
      bill_id,
    });
  } catch (error) {
    await connection.rollback();
    res.status(500).json({
      success: false,
      message: error.message,
    });
  } finally {
    connection.release();
  }
};

// GET ALL BILLS
exports.getBills = async (req, res) => {
  try {
    const bills = await Bill.getAllBills();
    res.status(200).json({
      success: true,
      count: bills.length,
      data: bills,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// GET SINGLE BILL WITH ITEMS
exports.getBill = async (req, res) => {
  try {
    const bill = await Bill.getBillById(req.params.id);
    const items = await BillItem.getBillItems(req.params.id);
    res.status(200).json({
      success: true,
      bill,
      items,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// DELETE BILL
exports.deleteBill = async (req, res) => {
  try {
    const result = await Bill.deleteBill(req.params.id);
    res.status(200).json({
      success: true,
      message: "Bill deleted successfully",
      data: result,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// UPDATE BILL WITH ITEMS
exports.updateBill = async (req, res) => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    const bill_id = req.params.id;
    const billData = req.body.bill;
    const newItems = req.body.items || [];

    // 1. Check if bill exists
    const [existingBills] = await connection.query(
      `SELECT * FROM bills WHERE bill_id = ?`,
      [bill_id]
    );
    if (existingBills.length === 0) {
      throw new Error(`Bill with ID ${bill_id} not found`);
    }

    // 2. Revert previous stock deductions for old items
    const [oldItems] = await connection.query(
      `SELECT * FROM bill_items WHERE bill_id = ?`,
      [bill_id]
    );
    for (const oldItem of oldItems) {
      await connection.query(
        `UPDATE medicines SET quantity = quantity + ? WHERE medicine_id = ?`,
        [oldItem.quantity, oldItem.medicine_id]
      );
    }

    // 3. Delete old bill items
    await connection.query(`DELETE FROM bill_items WHERE bill_id = ?`, [bill_id]);

    // 4. Insert new items and deduct stock
    for (const item of newItems) {
      const [billItemResult] = await connection.query(
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
        [
          bill_id,
          item.medicine_id,
          item.quantity,
          item.price,
          item.gst,
          item.discount,
          item.total,
        ]
      );
      const bill_item_id = billItemResult.insertId;

      const [medicineRows] = await connection.query(
        `SELECT quantity FROM medicines WHERE medicine_id = ? FOR UPDATE`,
        [item.medicine_id]
      );
      if (medicineRows.length === 0) {
        throw new Error(`Medicine not found: ${item.medicine_id}`);
      }
      const previous_stock = medicineRows[0].quantity;
      const current_stock = previous_stock - item.quantity;
      if (current_stock < 0) {
        throw new Error(`Insufficient stock for medicine id ${item.medicine_id}`);
      }
      await connection.query(
        `UPDATE medicines SET quantity = ? WHERE medicine_id = ?`,
        [current_stock, item.medicine_id]
      );

      await connection.query(
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
        VALUES (?, ?, 'STOCK_OUT', ?, ?, ?, ?)
        `,
        [
          item.medicine_id,
          bill_item_id,
          item.quantity,
          previous_stock,
          current_stock,
          "Sold via edited bill",
        ]
      );
    }

    // 5. Update bills table
    await connection.query(
      `
      UPDATE bills
      SET
          patient_id = ?,
          subtotal = ?,
          total_discount = ?,
          total_gst = ?,
          grand_total = ?,
          payment_mode = ?,
          payment_status = ?,
          notes = ?
      WHERE bill_id = ?
      `,
      [
        billData.patient_id,
        billData.subtotal,
        billData.total_discount,
        billData.total_gst,
        billData.grand_total,
        billData.payment_mode,
        billData.payment_status || "Completed",
        billData.notes || "",
        bill_id,
      ]
    );

    await connection.commit();
    res.status(200).json({
      success: true,
      message: "Bill updated successfully",
      bill_id,
    });
  } catch (error) {
    await connection.rollback();
    res.status(500).json({
      success: false,
      message: error.message,
    });
  } finally {
    connection.release();
  }
};
