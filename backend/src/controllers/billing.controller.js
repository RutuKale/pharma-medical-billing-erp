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

        // CREATE BILL
        const billResult = await Bill.createBill(billData);

        const bill_id = billResult.insertId;

        // INSERT ITEMS
        for (const item of items) {

            await BillItem.createBillItem({
                bill_id,
                medicine_id: item.medicine_id,
                quantity: item.quantity,
                price: item.price,
                gst: item.gst,
                discount: item.discount,
                total: item.total
            });

            // REDUCE STOCK
            await connection.query(`
                UPDATE medicines
                SET quantity = quantity - ?
                WHERE medicine_id = ?
            `, [
                item.quantity,
                item.medicine_id
            ]);

        }

        await connection.commit();

        res.status(201).json({
            success: true,
            message: "Bill created successfully",
            bill_id
        });

    } catch (error) {

        await connection.rollback();

        res.status(500).json({
            success: false,
            message: error.message
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
            data: bills
        });

    } catch (error) {

        res.status(500).json({
            success: false,
            message: error.message
        });

    }

};


// GET SINGLE BILL WITH ITEMS
exports.getBill = async (req, res) => {

    try {

        const bill = await Bill.getBillById(req.params.id);

        const items = await BillItem.getBillItems(
            req.params.id
        );

        res.status(200).json({
            success: true,
            bill,
            items
        });

    } catch (error) {

        res.status(500).json({
            success: false,
            message: error.message
        });

    }

};


// DELETE BILL
exports.deleteBill = async (req, res) => {

    try {

        const result = await Bill.deleteBill(
            req.params.id
        );

        res.status(200).json({
            success: true,
            message: "Bill deleted successfully",
            data: result
        });

    } catch (error) {

        res.status(500).json({
            success: false,
            message: error.message
        });

    }

};