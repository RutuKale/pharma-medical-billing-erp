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

    let patient_id = billData.patient_id || null;
    let autoRegisteredPatient = null;

    // Auto-register patient if not already registered
    if (!patient_id && (billData.patient_name || billData.mobile_number)) {
      const patientName = (billData.patient_name || "Walk-in Patient").trim();
      const mobileNumber = (billData.mobile_number || "").replace(/\D/g, "");

      if (mobileNumber) {
        const [existing] = await connection.query(
          "SELECT * FROM patients WHERE mobile_number = ? LIMIT 1",
          [mobileNumber]
        );
        if (existing && existing.length > 0) {
          patient_id = existing[0].patient_id;
          autoRegisteredPatient = existing[0];
        }
      }

      if (!patient_id) {
        const [patientResult] = await connection.query(
          `INSERT INTO patients (patient_name, mobile_number, age, gender, doctor_name, prescription_number, address)
           VALUES (?, ?, ?, ?, ?, ?, ?)`,
          [
            patientName,
            mobileNumber,
            billData.age ? Number(billData.age) : null,
            billData.gender || null,
            billData.doctor_name || null,
            billData.prescription_number || null,
            billData.address || null,
          ]
        );
        patient_id = patientResult.insertId;
        autoRegisteredPatient = {
          patient_id,
          patient_name: patientName,
          mobile_number: mobileNumber,
          age: billData.age || null,
          gender: billData.gender || null,
          doctor_name: billData.doctor_name || null,
          prescription_number: billData.prescription_number || null,
          address: billData.address || null,
        };
      }
    }

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
        patient_id,
        billData.bill_number,
        billData.subtotal,
        billData.total_discount || 0,
        billData.total_gst || 0,
        billData.grand_total,
        billData.payment_mode || "Cash",
        billData.payment_status || "Completed",
        billData.notes || "",
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
      patient_id,
      patient: autoRegisteredPatient,
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

// GET BILLS FOR A PATIENT
exports.getPatientBills = async (req, res) => {
  try {
    const patient_id = req.params.id || req.params.patientId;
    const bills = await Bill.getBillsByPatientId(patient_id);
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

// UPDATE BILL WITH ITEMS
exports.updateBill = async (req, res) => {
  const bill_id =
    req.params.id ||
    req.params.billId ||
    req.body.bill_id ||
    req.body.id ||
    req.body.bill?.bill_id;
  const billData = req.body.bill || req.body || {};
  const newItems = req.body.items || billData.items || [];

  try {
    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();

      // 1. Check if bill exists
      const [existingBills] = await connection.query(
        `SELECT * FROM bills WHERE bill_id = ?`,
        [bill_id],
      );

      // 2. Revert previous stock deductions for old items if bill exists in DB
      if (existingBills.length > 0) {
        const [oldItems] = await connection.query(
          `SELECT * FROM bill_items WHERE bill_id = ?`,
          [bill_id],
        );
        for (const oldItem of oldItems) {
          await connection.query(
            `UPDATE medicines SET quantity = quantity + ? WHERE medicine_id = ?`,
            [oldItem.quantity, oldItem.medicine_id],
          );
        }

        // 3. Delete old bill items
        await connection.query(`DELETE FROM bill_items WHERE bill_id = ?`, [bill_id]);
      }

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
            item.medicine_id || item.id,
            item.quantity,
            item.price,
            item.gst || 0,
            item.discount || 0,
            item.total,
          ],
        );
        const bill_item_id = billItemResult.insertId;

        const [medicineRows] = await connection.query(
          `SELECT quantity FROM medicines WHERE medicine_id = ? FOR UPDATE`,
          [item.medicine_id || item.id],
        );
        if (medicineRows.length > 0) {
          const previous_stock = medicineRows[0].quantity;
          const current_stock = Math.max(0, previous_stock - item.quantity);
          await connection.query(
            `UPDATE medicines SET quantity = ? WHERE medicine_id = ?`,
            [current_stock, item.medicine_id || item.id],
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
              item.medicine_id || item.id,
              bill_item_id,
              item.quantity,
              previous_stock,
              current_stock,
              "Sold via edited bill",
            ],
          );
        }
      }

      // 5. Update bills table
      if (existingBills.length > 0) {
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
            billData.patient_id || existingBills[0].patient_id,
            billData.subtotal !== undefined ? billData.subtotal : existingBills[0].subtotal,
            billData.total_discount !== undefined ? billData.total_discount : existingBills[0].total_discount,
            billData.total_gst !== undefined ? billData.total_gst : existingBills[0].total_gst,
            billData.grand_total !== undefined ? billData.grand_total : existingBills[0].grand_total,
            billData.payment_mode || existingBills[0].payment_mode,
            billData.payment_status || existingBills[0].payment_status || "Completed",
            billData.notes !== undefined ? billData.notes : existingBills[0].notes || "",
            bill_id,
          ],
        );
      }

      await connection.commit();
      return res.status(200).json({
        success: true,
        message: "Bill updated successfully",
        bill_id,
        data: { bill_id, ...billData, items: newItems },
      });
    } catch (txError) {
      await connection.rollback();
      throw txError;
    } finally {
      connection.release();
    }
  } catch (error) {
    console.warn("MySQL updateBill fallback to Bill model:", error.message);
    const updated = await Bill.updateBill(bill_id, { ...billData, items: newItems });
    return res.status(200).json({
      success: true,
      message: "Bill updated successfully",
      bill_id,
      data: updated,
    });
  }
};
