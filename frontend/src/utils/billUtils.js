import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import Swal from "sweetalert2";

export const printBill = (billData) => {
  if (!billData) return;

  const printWindow = window.open("", "_blank");

  const medicineRows = billData.medicines
    .map(
      (item, index) => `
      <tr>
        <td>${index + 1}</td>
        <td>${item.name}</td>
        <td>${item.batch}</td>
        <td>${item.quantity}</td>
        <td>₹${item.price.toFixed(2)}</td>
        <td>${item.gst}%</td>
        <td>${item.discount}%</td>
        <td>₹${item.total.toFixed(2)}</td>
      </tr>
    `,
    )
    .join("");

  printWindow.document.write(`
    <html>
      <head>
        <title>Pharmacy Bill</title>

        <style>
          body {
            font-family: Arial, sans-serif;
            padding: 20px;
            color: #000;
          }

          .header {
            text-align: center;
            margin-bottom: 20px;
          }

          .title {
            font-size: 28px;
            font-weight: bold;
          }

          .section {
            margin-bottom: 20px;
          }

          table {
            width: 100%;
            border-collapse: collapse;
          }

          table, th, td {
            border: 1px solid #ccc;
          }

          th, td {
            padding: 10px;
            text-align: left;
          }

          th {
            background: #f3f4f6;
          }

          .totals {
            margin-top: 20px;
            width: 300px;
            margin-left: auto;
          }

          .totals div {
            display: flex;
            justify-content: space-between;
            margin-bottom: 8px;
          }

          .grand-total {
            font-size: 20px;
            font-weight: bold;
          }
        </style>
      </head>

      <body>
        <div class="header">
          <div class="title">PHARMA MEDICAL</div>
          <p>Medical & General Store</p>
        </div>

        <div class="section">
          <h3>Bill Information</h3>

          <p><strong>Invoice No:</strong> ${billData.invoiceNo}</p>
          <p><strong>Date:</strong> ${billData.date}</p>
          <p><strong>Payment Mode:</strong> ${billData.paymentMode}</p>
        </div>

        <div class="section">
          <h3>Patient Details</h3>

          <p><strong>Name:</strong> ${billData.patient.name}</p>
          <p><strong>Mobile:</strong> ${billData.patient.mobile}</p>
          <p><strong>Doctor:</strong> ${billData.patient.doctorName}</p>
          <p><strong>Prescription No:</strong> ${billData.patient.prescriptionNumber}</p>
        </div>

        <div class="section">
          <h3>Medicines</h3>

          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>Medicine</th>
                <th>Batch</th>
                <th>Qty</th>
                <th>Price</th>
                <th>GST</th>
                <th>Discount</th>
                <th>Total</th>
              </tr>
            </thead>

            <tbody>
              ${medicineRows}
            </tbody>
          </table>
        </div>

        <div class="totals">
          <div>
            <span>Subtotal:</span>
            <span>₹${billData.totals.subtotal.toFixed(2)}</span>
          </div>

          <div>
            <span>Discount:</span>
            <span>₹${billData.totals.discountTotal.toFixed(2)}</span>
          </div>

          <div>
            <span>GST:</span>
            <span>₹${billData.totals.gstTotal.toFixed(2)}</span>
          </div>

          <div class="grand-total">
            <span>Grand Total:</span>
            <span>₹${billData.totals.grandTotal.toFixed(2)}</span>
          </div>
        </div>

        <script>
          window.onload = function () {
            window.print();
          };
        </script>
      </body>
    </html>
  `);

  printWindow.document.close();
};

export const downloadBillPDF = (billData) => {
  if (!billData) return;

  const doc = new jsPDF();

  doc.setFontSize(22);
  doc.text("PHARMA MEDICAL", 70, 20);

  doc.setFontSize(12);
  doc.text("Medical & General Store", 78, 28);

  doc.line(10, 35, 200, 35);

  doc.setFontSize(14);
  doc.text("Bill Details", 14, 45);

  doc.setFontSize(11);

  doc.text(`Invoice No: ${billData.invoiceNo}`, 14, 55);
  doc.text(`Date: ${billData.date}`, 14, 62);
  doc.text(`Payment Mode: ${billData.paymentMode}`, 14, 69);

  doc.text(`Patient Name: ${billData.patient.name}`, 14, 83);
  doc.text(`Mobile: ${billData.patient.mobile}`, 14, 90);
  doc.text(`Doctor: ${billData.patient.doctorName}`, 14, 97);

  autoTable(doc, {
    startY: 110,

    head: [
      [
        "#",
        "Medicine",
        "Batch",
        "Qty",
        "Price",
        "GST",
        "Discount",
        "Total",
      ],
    ],

    body: billData.medicines.map((item, index) => [
      index + 1,
      item.name,
      item.batch,
      item.quantity,
      `₹${item.price.toFixed(2)}`,
      `${item.gst}%`,
      `${item.discount}%`,
      `₹${item.total.toFixed(2)}`,
    ]),
  });

  const finalY = doc.lastAutoTable.finalY + 15;

  doc.text(
    `Subtotal: ₹${billData.totals.subtotal.toFixed(2)}`,
    140,
    finalY,
  );

  doc.text(
    `Discount: ₹${billData.totals.discountTotal.toFixed(2)}`,
    140,
    finalY + 8,
  );

  doc.text(
    `GST: ₹${billData.totals.gstTotal.toFixed(2)}`,
    140,
    finalY + 16,
  );

  doc.setFontSize(14);

  doc.text(
    `Grand Total: ₹${billData.totals.grandTotal.toFixed(2)}`,
    130,
    finalY + 28,
  );

  doc.save(`${billData.invoiceNo}.pdf`);

  Swal.fire({
    icon: "success",
    title: "PDF Downloaded",
    text: "Bill PDF downloaded successfully",
    background: "#1e293b",
    color: "#fff",
    confirmButtonColor: "#22c55e",
  });
};