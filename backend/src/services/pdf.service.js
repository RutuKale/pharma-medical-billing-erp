const PDFDocument = require("pdfkit");
const fs = require("fs");
const path = require("path");

// GENERATE BILL PDF
exports.generateBillPDF = async (bill, items, patient) => {
  return new Promise((resolve, reject) => {
    try {
      const fileName = `bill-${bill.bill_number}.pdf`;

      const filePath = path.join(__dirname, "../uploads", fileName);

      const doc = new PDFDocument();

      const stream = fs.createWriteStream(filePath);

      doc.pipe(stream);

      // HEADER
      doc.fontSize(22).text("PharmaCare Pro", {
        align: "center",
      });

      doc.moveDown();

      // BILL DETAILS
      doc.fontSize(12).text(`Bill Number: ${bill.bill_number}`);

      doc.text(`Bill Date: ${bill.bill_date}`);

      doc.moveDown();

      // PATIENT DETAILS
      doc.text(`Patient: ${patient.patient_name}`);

      doc.text(`Mobile: ${patient.mobile_number}`);

      doc.moveDown();

      // TABLE HEADER
      doc.text("Medicine | Qty | Price | GST | Total");

      doc.moveDown();

      // ITEMS
      items.forEach((item) => {
        doc.text(
          `${item.medicine_name} | ${item.quantity} | ${item.price} | ${item.gst}% | ${item.total}`,
        );
      });

      doc.moveDown();

      // TOTALS
      doc.text(`Subtotal: ${bill.subtotal}`);

      doc.text(`Discount: ${bill.total_discount}`);

      doc.text(`GST: ${bill.total_gst}`);

      doc.text(`Grand Total: ${bill.grand_total}`);

      doc.end();

      stream.on("finish", () => {
        resolve({
          fileName,
          filePath,
        });
      });
    } catch (error) {
      reject(error);
    }
  });
};
