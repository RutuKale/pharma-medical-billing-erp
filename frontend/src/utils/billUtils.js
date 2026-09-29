import Swal from "sweetalert2";
import html2pdf from "html2pdf.js";

// Helper to convert number to Indian Currency Words
const numberToWords = (num) => {
  if (!num || isNaN(num) || num <= 0) return "Zero Rupees Only";
  const a = [
    "", "One ", "Two ", "Three ", "Four ", "Five ", "Six ", "Seven ", "Eight ", "Nine ", "Ten ",
    "Eleven ", "Twelve ", "Thirteen ", "Fourteen ", "Fifteen ", "Sixteen ", "Seventeen ", "Eighteen ", "Nineteen ",
  ];
  const b = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"];

  const inWords = (n) => {
    let str = "";
    if (n > 99) {
      str += a[Math.floor(n / 100)] + "Hundred ";
      n %= 100;
    }
    if (n > 19) {
      str += b[Math.floor(n / 10)] + " " + a[n % 10];
    } else {
      str += a[n];
    }
    return str;
  };

  const rounded = Math.round(num);
  let crore = Math.floor(rounded / 10000000);
  let lakh = Math.floor((rounded % 10000000) / 100000);
  let thousand = Math.floor((rounded % 100000) / 1000);
  let hundred = rounded % 1000;

  let res = "";
  if (crore) res += inWords(crore) + "Crore ";
  if (lakh) res += inWords(lakh) + "Lakh ";
  if (thousand) res += inWords(thousand) + "Thousand ";
  if (hundred) res += inWords(hundred);

  return "Rupees " + res.trim() + " Only";
};

const getHtmlTemplate = (billData) => {
  const patient = billData.patient || {};
  const totals = billData.totals || {};
  const medicines = billData.medicines || [];

  const subtotal = Number(totals.subtotal || 0);
  const discountTotal = Number(totals.discountTotal || 0);
  const gstTotal = Number(totals.gstTotal || 0);
  const grandTotal = Number(totals.grandTotal || 0);
  const cgst = (gstTotal / 2).toFixed(2);
  const sgst = (gstTotal / 2).toFixed(2);

  return `
    <style>
      @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
      
      @media print {
        body { margin: 0; padding: 0; background: #fff !important; }
        .print-wrapper { max-width: 100% !important; padding: 0 !important; margin: 0 !important; }
        .bill-container { border: none !important; }
      }

      .print-wrapper {
        font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif;
        font-size: 11px;
        color: #1e293b;
        max-width: 800px;
        margin: 0 auto;
        padding: 16px;
        line-height: 1.4;
        background: #fff;
      }
      
      .print-wrapper .bill-container {
        border: 1px solid #cbd5e1;
        background: #fff;
        border-radius: 4px;
        overflow: hidden;
      }
      
      /* Header */
      .print-wrapper .header {
        text-align: center;
        padding: 16px 20px 12px 20px;
        border-bottom: 2px solid #0f172a;
        background: #fafafa;
      }
      
      .print-wrapper .store-name {
        font-size: 22px;
        font-weight: 800;
        color: #0f172a;
        margin: 0 0 3px 0;
        letter-spacing: 0.5px;
        text-transform: uppercase;
      }
      
      .print-wrapper .store-tagline {
        font-size: 12px;
        font-weight: 600;
        color: #2563eb;
        margin: 0 0 4px 0;
      }
      
      .print-wrapper .store-contact {
        font-size: 11px;
        color: #475569;
        margin: 0;
      }

      .print-wrapper .tax-invoice-bar {
        background: #0f172a;
        color: #fff;
        padding: 4px 16px;
        display: flex;
        justify-content: space-between;
        align-items: center;
        font-size: 11px;
        font-weight: 700;
        letter-spacing: 0.8px;
        text-transform: uppercase;
      }
      
      /* Info Section */
      .print-wrapper .info-section {
        display: flex;
        justify-content: space-between;
        padding: 12px 18px;
        border-bottom: 1px solid #e2e8f0;
        background: #fff;
        gap: 20px;
      }
      
      .print-wrapper .info-block {
        flex: 1;
      }
      
      .print-wrapper .info-title {
        font-size: 10px;
        text-transform: uppercase;
        font-weight: 700;
        color: #64748b;
        margin-bottom: 6px;
        padding-bottom: 3px;
        border-bottom: 1px dashed #cbd5e1;
        letter-spacing: 0.5px;
      }
      
      .print-wrapper .info-row {
        display: flex;
        margin-bottom: 3px;
        font-size: 11px;
      }
      
      .print-wrapper .info-label {
        width: 105px;
        font-weight: 600;
        color: #475569;
      }
      
      .print-wrapper .info-value {
        flex: 1;
        color: #0f172a;
      }
      
      /* Table */
      .print-wrapper table {
        width: 100%;
        border-collapse: collapse;
      }
      
      .print-wrapper th {
        background-color: #f1f5f9;
        color: #0f172a;
        font-weight: 700;
        text-transform: uppercase;
        font-size: 10px;
        padding: 8px 10px;
        text-align: right;
        border-bottom: 1px solid #cbd5e1;
        letter-spacing: 0.4px;
      }
      
      .print-wrapper th.text-left { text-align: left; }
      .print-wrapper th.text-center { text-align: center; }
      
      .print-wrapper td {
        padding: 7px 10px;
        font-size: 11px;
        text-align: right;
        border-bottom: 1px solid #f1f5f9;
        vertical-align: middle;
      }
      
      .print-wrapper td.text-left { text-align: left; }
      .print-wrapper td.text-center { text-align: center; }
      
      .print-wrapper .medicine-name {
        font-weight: 700;
        color: #0f172a;
        font-size: 11px;
      }
      
      .print-wrapper .medicine-batch {
        font-size: 9.5px;
        color: #64748b;
        margin-top: 1px;
        font-family: monospace;
      }
      
      /* Summary Section */
      .print-wrapper .summary-section {
        display: flex;
        padding: 14px 18px;
        border-bottom: 1px solid #e2e8f0;
        gap: 20px;
        background: #fff;
      }
      
      .print-wrapper .terms-block {
        flex: 1.3;
        padding-right: 15px;
      }
      
      .print-wrapper .terms-title {
        font-weight: 700;
        font-size: 10px;
        text-transform: uppercase;
        color: #475569;
        margin-bottom: 4px;
      }
      
      .print-wrapper .terms-list {
        font-size: 9.5px;
        color: #64748b;
        padding-left: 14px;
        margin: 0;
        line-height: 1.45;
      }

      .print-wrapper .amount-words-box {
        margin-top: 10px;
        padding: 6px 10px;
        background: #f8fafc;
        border: 1px solid #e2e8f0;
        border-radius: 4px;
        font-size: 10px;
      }
      
      .print-wrapper .totals-block {
        flex: 1;
        background: #fafafa;
        padding: 10px 14px;
        border-radius: 4px;
        border: 1px solid #e2e8f0;
      }
      
      .print-wrapper .total-row {
        display: flex;
        justify-content: space-between;
        padding: 3px 0;
        font-size: 11px;
        color: #334155;
      }
      
      .print-wrapper .total-row.discount { color: #059669; font-weight: 600; }
      
      .print-wrapper .grand-total {
        display: flex;
        justify-content: space-between;
        padding: 8px 0 3px 0;
        margin-top: 6px;
        border-top: 2px dashed #94a3b8;
        font-size: 15px;
        font-weight: 800;
        color: #0f172a;
      }
      
      /* Footer */
      .print-wrapper .footer {
        padding: 12px 18px 16px 18px;
        background: #fff;
      }

      .print-wrapper .footer-top {
        display: flex;
        justify-content: space-between;
        align-items: flex-end;
      }
      
      .print-wrapper .thank-you {
        font-weight: 700;
        font-size: 12px;
        color: #2563eb;
        margin: 0 0 2px 0;
      }
      
      .print-wrapper .footer-note {
        font-size: 9.5px;
        color: #94a3b8;
        margin: 0;
      }
      
      .print-wrapper .signature-box {
        text-align: center;
      }
      
      .print-wrapper .signature-line {
        display: inline-block;
        width: 140px;
        border-top: 1px solid #0f172a;
        padding-top: 4px;
        font-size: 9.5px;
        font-weight: 600;
        color: #334155;
        text-align: center;
      }
    </style>

    <div class="print-wrapper">
      <div class="bill-container" id="bill-container-content">
        <!-- Store Header -->
        <div class="header">
          <h1 class="store-name">PharmaCare Pro</h1>
          <p class="store-tagline">Complete Retail Pharmacy & Healthcare Solutions</p>
          <p class="store-contact">
            Main Road, Akola, Maharashtra 444001 &bull; 
            Ph: +91 9876543210 &bull; 
            Email: pharmacy@gmail.com
          </p>
          <p class="store-contact" style="margin-top: 2px; font-weight: 600; color: #334155;">
            GSTIN: 27ABCDE1234F1Z5 &bull; 
            Drug Lic. No: MH-AKL-2023-DL8841
          </p>
        </div>

        <!-- Tax Invoice Sub-banner -->
        <div class="tax-invoice-bar">
          <span>TAX INVOICE / CASH MEMO</span>
          <span>Original for Recipient</span>
        </div>
        
        <!-- Info Section -->
        <div class="info-section">
          <!-- Patient Details -->
          <div class="info-block">
            <div class="info-title">Patient Details</div>
            <div class="info-row">
              <span class="info-label">Patient Name:</span>
              <span class="info-value"><b>${patient.name || patient.patient_name || "Walk-in Customer"}</b></span>
            </div>
            <div class="info-row">
              <span class="info-label">Contact Mobile:</span>
              <span class="info-value">${patient.mobile || patient.mobile_number || "-"}</span>
            </div>
            <div class="info-row">
              <span class="info-label">Age / Gender:</span>
              <span class="info-value">
                ${patient.age ? `${patient.age} Yrs` : "-"}${patient.gender ? ` / ${patient.gender}` : ""}
              </span>
            </div>
            <div class="info-row">
              <span class="info-label">Consulting Dr:</span>
              <span class="info-value">${patient.doctorName || patient.doctor_name || "Self / OTC"}</span>
            </div>
            <div class="info-row">
              <span class="info-label">Prescription No:</span>
              <span class="info-value" style="font-family: monospace;">
                ${patient.prescriptionNumber || patient.prescription_number || "-"}
              </span>
            </div>
          </div>
          
          <!-- Invoice Details -->
          <div class="info-block">
            <div class="info-title">Invoice Details</div>
            <div class="info-row">
              <span class="info-label">Invoice Number:</span>
              <span class="info-value" style="font-family: monospace; font-weight: 700; color: #2563eb;">
                ${billData.invoiceNo || billData.bill_number || "-"}
              </span>
            </div>
            <div class="info-row">
              <span class="info-label">Invoice Date:</span>
              <span class="info-value">${billData.date || new Date().toLocaleString()}</span>
            </div>
            <div class="info-row">
              <span class="info-label">Payment Mode:</span>
              <span class="info-value"><b>${billData.paymentMode || "Cash"}</b></span>
            </div>
            <div class="info-row">
              <span class="info-label">Payment Status:</span>
              <span class="info-value" style="color: #059669; font-weight: 700;">PAID</span>
            </div>
            <div class="info-row">
              <span class="info-label">Term / State:</span>
              <span class="info-value">Maharashtra (Code: 27)</span>
            </div>
          </div>
        </div>
        
        <!-- Items Table -->
        <table>
          <thead>
            <tr>
              <th class="text-center" width="5%">#</th>
              <th class="text-left" width="34%">Medicine / Description</th>
              <th class="text-center" width="13%">Batch No</th>
              <th class="text-center" width="10%">Exp Date</th>
              <th class="text-center" width="9%">Qty (Tab)</th>
              <th width="10%">Rate/Tab</th>
              <th width="7%">Dis%</th>
              <th width="6%">GST</th>
              <th width="11%">Amount</th>
            </tr>
          </thead>
          <tbody>
            ${medicines
              .map((item, index) => {
                const qty = Number(item.quantity || 0);
                const price = Number(item.price || 0);
                const discount = Number(item.discount || 0);
                const gst = Number(item.gst || 0);
                const total = Number(item.total || qty * price);

                // Format expiry date cleanly
                let expFormatted = "-";
                if (item.expiry) {
                  try {
                    const ed = new Date(item.expiry);
                    expFormatted = `${String(ed.getMonth() + 1).padStart(2, "0")}/${String(ed.getFullYear()).slice(-2)}`;
                  } catch (e) {
                    expFormatted = item.expiry;
                  }
                }

                return `
                  <tr>
                    <td class="text-center">${index + 1}</td>
                    <td class="text-left">
                      <div class="medicine-name">${item.name || item.medicine_name || "Medicine"}</div>
                      ${item.saltName ? `<div style="font-size: 9px; color: #64748b;">${item.saltName}</div>` : ""}
                    </td>
                    <td class="text-center font-mono">${item.batch || item.batch_number || "-"}</td>
                    <td class="text-center">${expFormatted}</td>
                    <td class="text-center"><b>${qty}</b></td>
                    <td>₹${price.toFixed(2)}</td>
                    <td>${discount > 0 ? `${discount}%` : "-"}</td>
                    <td>${gst > 0 ? `${gst}%` : "0%"}</td>
                    <td><b>₹${total.toFixed(2)}</b></td>
                  </tr>
                `;
              })
              .join("")}
          </tbody>
        </table>
        
        <!-- Summary Section -->
        <div class="summary-section">
          <div class="terms-block">
            <div class="terms-title">Terms & Conditions:</div>
            <ul class="terms-list">
              <li>Medicines once sold will only be accepted for return within 7 days with valid tax invoice.</li>
              <li>Schedule H, H1 & X drugs dispensed strictly on the prescription of a registered medical practitioner.</li>
              <li>Store medicines as per storage conditions mentioned on the packaging.</li>
              <li>Goods sold are for personal patient consumption only.</li>
            </ul>

            <div class="amount-words-box">
              <span style="font-weight: 700; color: #475569;">Amount in Words: </span>
              <span style="font-weight: 600; color: #0f172a;">${numberToWords(grandTotal)}</span>
            </div>
          </div>
          
          <div class="totals-block">
            <div class="total-row">
              <span>Subtotal:</span>
              <span style="font-weight: 600;">₹${subtotal.toFixed(2)}</span>
            </div>
            ${
              discountTotal > 0
                ? `
                <div class="total-row discount">
                  <span>Total Discount:</span>
                  <span>- ₹${discountTotal.toFixed(2)}</span>
                </div>
              `
                : ""
            }
            <div class="total-row">
              <span>CGST (Output):</span>
              <span>+ ₹${cgst}</span>
            </div>
            <div class="total-row">
              <span>SGST (Output):</span>
              <span>+ ₹${sgst}</span>
            </div>
            
            <div class="grand-total">
              <span>Net Amount:</span>
              <span style="color: #2563eb;">₹${grandTotal.toFixed(2)}</span>
            </div>
          </div>
        </div>
        
        <!-- Footer -->
        <div class="footer">
          <div class="footer-top">
            <div>
              <p class="thank-you">Thank you for your visit. Get Well Soon!</p>
              <p class="footer-note">This is a computerized tax invoice generated by PharmaCare Pro ERP.</p>
            </div>
            
            <div class="signature-box">
              <span class="signature-line">Authorized Pharmacist</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;
};

export const printBill = (billData) => {
  if (!billData) return;

  const printWindow = window.open("", "_blank");
  if (!printWindow) {
    Swal.fire({
      icon: "warning",
      title: "Popup Blocked",
      text: "Please allow popups in your browser to print the invoice.",
      confirmButtonColor: "#2563eb",
    });
    return;
  }

  const htmlContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>Invoice - ${billData.invoiceNo || "Bill"}</title>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </head>
      <body>
        ${getHtmlTemplate(billData)}
        <script>
          window.onload = function() {
            setTimeout(function() {
              window.print();
            }, 400);
          }
        </script>
      </body>
    </html>
  `;

  printWindow.document.write(htmlContent);
  printWindow.document.close();
};

export const downloadBillPDF = (billData) => {
  if (!billData) return;

  const tempDiv = document.createElement("div");
  tempDiv.innerHTML = getHtmlTemplate(billData);
  tempDiv.style.position = "absolute";
  tempDiv.style.left = "-9999px";
  tempDiv.style.top = "-9999px";
  document.body.appendChild(tempDiv);

  const opt = {
    margin: [8, 8, 8, 8],
    filename: `${billData.invoiceNo || "Invoice"}.pdf`,
    image: { type: "jpeg", quality: 0.98 },
    html2canvas: { scale: 2, useCORS: true },
    jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
  };

  html2pdf()
    .set(opt)
    .from(tempDiv.firstElementChild)
    .save()
    .then(() => {
      document.body.removeChild(tempDiv);
      Swal.fire({
        icon: "success",
        title: "PDF Downloaded",
        text: "Invoice PDF saved successfully.",
        confirmButtonColor: "#2563eb",
        timer: 2000,
        showConfirmButton: false,
      });
    })
    .catch((err) => {
      console.error(err);
      if (document.body.contains(tempDiv)) {
        document.body.removeChild(tempDiv);
      }
    });
};

// ==========================================
// SUPPLIER RETURN BILL / DEBIT NOTE TEMPLATE
// ==========================================
export const getReturnBillHtmlTemplate = (returnData) => {
  const pharmacyName = localStorage.getItem("pharmacy_name") || "PHARMA MEDICAL & GENERAL STORE";
  const pharmacyAddress = localStorage.getItem("pharmacy_address") || "123 Healthcare Avenue, Medical District, Pune - 411001";
  const pharmacyContact = localStorage.getItem("pharmacy_phone") || "+91 98765 43210";
  const pharmacyGst = localStorage.getItem("pharmacy_gst") || "27ABCDE1234F1Z5";
  const pharmacyDl = localStorage.getItem("pharmacy_dl") || "MH-PZ1-123456 / MH-PZ2-123457";

  const {
    returnNoteNumber = "RET-" + Date.now().toString().slice(-6),
    date = new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }),
    manufacturer = "Supplier / Manufacturer",
    reason = "Expired & Near-Expiry Stock Return",
    items = [],
    totalUnits = 0,
    totalAmount = 0,
  } = returnData;

  const words = numberToWords(totalAmount);

  return `
    <style>
      @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
      @media print {
        body { margin: 0; padding: 0; background: #fff !important; }
        .print-wrapper { max-width: 100% !important; padding: 0 !important; margin: 0 !important; }
      }
      * { box-sizing: border-box; }
      body {
        font-family: 'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
        color: #1e293b;
        background: #f8fafc;
        margin: 0;
        padding: 20px;
        -webkit-print-color-adjust: exact;
        print-color-adjust: exact;
      }
      .bill-container {
        max-width: 820px;
        margin: 0 auto;
        background: #ffffff;
        border: 1px solid #e2e8f0;
        border-radius: 12px;
        padding: 32px;
        box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05);
      }
      .header {
        border-bottom: 2px solid #0284c7;
        padding-bottom: 16px;
        margin-bottom: 20px;
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
      }
      .pharmacy-name { font-size: 20px; font-weight: 800; color: #0f172a; text-transform: uppercase; letter-spacing: 0.5px; }
      .pharmacy-sub { font-size: 11px; color: #475569; margin-top: 4px; line-height: 1.5; }
      .doc-badge {
        background: #f0fdf4;
        border: 1.5px solid #22c55e;
        color: #15803d;
        padding: 6px 14px;
        border-radius: 8px;
        font-weight: 800;
        font-size: 13px;
        text-align: right;
        text-transform: uppercase;
        letter-spacing: 0.5px;
      }
      .info-grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 16px;
        background: #f8fafc;
        border: 1px solid #e2e8f0;
        border-radius: 8px;
        padding: 14px 18px;
        margin-bottom: 20px;
        font-size: 12px;
      }
      .info-block p { margin: 3px 0; }
      .info-label { color: #64748b; font-weight: 600; width: 110px; display: inline-block; }
      .items-table {
        width: 100%;
        border-collapse: collapse;
        font-size: 11.5px;
        margin-bottom: 20px;
      }
      .items-table th {
        background: #f1f5f9;
        color: #334155;
        font-weight: 700;
        text-transform: uppercase;
        font-size: 10px;
        letter-spacing: 0.5px;
        padding: 9px 10px;
        border-top: 1px solid #cbd5e1;
        border-bottom: 1px solid #cbd5e1;
      }
      .items-table td {
        padding: 9px 10px;
        border-bottom: 1px solid #f1f5f9;
      }
      .text-right { text-align: right; }
      .text-center { text-align: center; }
      .font-mono { font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace; }
      .totals-wrap {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        border-top: 2px solid #e2e8f0;
        padding-top: 14px;
        margin-bottom: 24px;
      }
      .words-box { max-width: 55%; font-size: 11px; color: #475569; }
      .words-title { font-weight: 700; text-transform: uppercase; font-size: 10px; color: #64748b; margin-bottom: 2px; }
      .totals-table { width: 280px; font-size: 12px; }
      .totals-table tr td { padding: 4px 0; }
      .totals-table .grand-row td {
        font-size: 14px;
        font-weight: 800;
        color: #0f172a;
        border-top: 1.5px solid #0284c7;
        padding-top: 8px;
      }
      .signatures {
        display: flex;
        justify-content: space-between;
        padding-top: 40px;
        margin-top: 20px;
        border-top: 1px dashed #cbd5e1;
        font-size: 11px;
        color: #475569;
      }
      .sign-line {
        border-top: 1px solid #94a3b8;
        width: 180px;
        text-align: center;
        padding-top: 4px;
        font-weight: 600;
      }
    </style>

    <div class="print-wrapper">
      <div class="bill-container">
        <div class="header">
          <div>
            <div class="pharmacy-name">${pharmacyName}</div>
            <div class="pharmacy-sub">
              ${pharmacyAddress}<br />
              Phone: ${pharmacyContact} | GSTIN: ${pharmacyGst} | D.L. No: ${pharmacyDl}
            </div>
          </div>
          <div style="text-align: right;">
            <div class="doc-badge">STOCK RETURN NOTE / DEBIT MEMO</div>
            <div style="font-size: 11px; color: #64748b; margin-top: 6px;">
              Ref: <strong style="color: #0f172a;" class="font-mono">${returnNoteNumber}</strong>
            </div>
          </div>
        </div>

        <div class="info-grid">
          <div class="info-block">
            <p><span class="info-label">RETURN TO:</span> <strong>${manufacturer}</strong></p>
            <p><span class="info-label">REASON:</span> <span>${reason}</span></p>
            <p><span class="info-label">DOC TYPE:</span> <span>Manufacturer Expiry Claim / Debit Note</span></p>
          </div>
          <div class="info-block">
            <p><span class="info-label">DATE:</span> <strong>${date}</strong></p>
            <p><span class="info-label">TOTAL ITEMS:</span> <strong>${items.length} Batches</strong></p>
            <p><span class="info-label">TOTAL UNITS:</span> <strong>${totalUnits} Units</strong></p>
          </div>
        </div>

        <table class="items-table">
          <thead>
            <tr>
              <th class="text-center" style="width: 32px;">#</th>
              <th>Medicine Description</th>
              <th class="font-mono">Batch</th>
              <th>Expiry</th>
              <th class="text-center">Avail Qty</th>
              <th class="text-center" style="background: #e0f2fe; color: #0369a1;">Return Qty</th>
              <th class="text-right">Rate (₹)</th>
              <th class="text-right">Debit Total (₹)</th>
            </tr>
          </thead>
          <tbody>
            ${items
              .map(
                (item, idx) => `
              <tr>
                <td class="text-center" style="color: #64748b;">${idx + 1}</td>
                <td>
                  <strong>${item.name}</strong>
                  ${item.category ? `<div style="font-size: 10px; color: #64748b;">${item.category}</div>` : ""}
                </td>
                <td class="font-mono">${item.batch || "-"}</td>
                <td>${item.expiryDate ? new Date(item.expiryDate).toLocaleDateString("en-IN", { month: "short", year: "numeric" }) : "-"}</td>
                <td class="text-center">${item.stock}</td>
                <td class="text-center" style="font-weight: 700; color: #0284c7;">${item.returnQuantity}</td>
                <td class="text-right">₹${Number(item.purchasePrice || item.price || 0).toFixed(2)}</td>
                <td class="text-right" style="font-weight: 700;">₹${Number(item.total || 0).toFixed(2)}</td>
              </tr>
            `
              )
              .join("")}
          </tbody>
        </table>

        <div class="totals-wrap">
          <div class="words-box">
            <div class="words-title">Total Claim In Words:</div>
            <div style="font-weight: 700; color: #1e293b;">${words}</div>
            <p style="font-size: 10px; color: #64748b; margin-top: 8px;">
              * Note: The aforementioned medicines are returned due to shelf-life expiry or near-expiry regulations. Please issue credit note / replacement stock as per standard distribution terms.
            </p>
          </div>
          <table class="totals-table">
            <tr>
              <td style="color: #64748b;">Total Units Returned:</td>
              <td class="text-right font-mono" style="font-weight: 600;">${totalUnits}</td>
            </tr>
            <tr class="grand-row">
              <td>Total Debit Value:</td>
              <td class="text-right font-mono">₹${Number(totalAmount).toFixed(2)}</td>
            </tr>
          </table>
        </div>

        <div class="signatures">
          <div>
            <div class="sign-line">Authorized Pharmacist Signature</div>
            <div style="text-align: center; font-size: 9.5px; color: #94a3b8; margin-top: 2px;">Dispensing In-Charge</div>
          </div>
          <div>
            <div class="sign-line">Supplier / Driver Acknowledgement</div>
            <div style="text-align: center; font-size: 9.5px; color: #94a3b8; margin-top: 2px;">Name, Signature & Stamp</div>
          </div>
        </div>
      </div>
    </div>
  `;
};

export const printReturnBill = (returnData) => {
  if (!returnData) return;

  const printWindow = window.open("", "_blank");
  if (!printWindow) {
    Swal.fire({
      icon: "warning",
      title: "Popup Blocked",
      text: "Please allow popups to print the return bill.",
      confirmButtonColor: "#2563eb",
    });
    return;
  }

  const htmlContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>Stock Return Note - ${returnData.returnNoteNumber || "DebitNote"}</title>
      </head>
      <body>
        ${getReturnBillHtmlTemplate(returnData)}
        <script>
          window.onload = function() {
            setTimeout(function() {
              window.print();
            }, 400);
          }
        </script>
      </body>
    </html>
  `;

  printWindow.document.write(htmlContent);
  printWindow.document.close();
};

export const downloadReturnBillPDF = (returnData) => {
  if (!returnData) return;

  const tempDiv = document.createElement("div");
  tempDiv.innerHTML = getReturnBillHtmlTemplate(returnData);
  tempDiv.style.position = "absolute";
  tempDiv.style.left = "-9999px";
  tempDiv.style.top = "-9999px";
  document.body.appendChild(tempDiv);

  const opt = {
    margin: [8, 8, 8, 8],
    filename: `${returnData.returnNoteNumber || "Return_Note"}.pdf`,
    image: { type: "jpeg", quality: 0.98 },
    html2canvas: { scale: 2, useCORS: true },
    jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
  };

  html2pdf()
    .set(opt)
    .from(tempDiv.firstElementChild)
    .save()
    .then(() => {
      document.body.removeChild(tempDiv);
      Swal.fire({
        icon: "success",
        title: "PDF Exported",
        text: "Return Note PDF downloaded successfully.",
        confirmButtonColor: "#2563eb",
        timer: 2000,
        showConfirmButton: false,
      });
    })
    .catch((err) => {
      console.error(err);
      if (document.body.contains(tempDiv)) {
        document.body.removeChild(tempDiv);
      }
    });
};

