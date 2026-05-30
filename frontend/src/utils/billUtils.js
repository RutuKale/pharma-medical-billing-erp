import Swal from "sweetalert2";
import html2pdf from "html2pdf.js";

const getHtmlTemplate = (billData) => `
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
          
          .print-wrapper {
            font-family: 'Inter', Arial, sans-serif;
            font-size: 12px;
            color: #111827;
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
            line-height: 1.5;
            background: white;
          }
          
          .print-wrapper .bill-container {
            border: 1px solid #d1d5db;
            background: #fff;
          }
          
          /* Header */
          .print-wrapper .header {
            text-align: center;
            padding: 20px;
            border-bottom: 2px solid #1f2937;
          }
          
          .print-wrapper .store-name {
            font-size: 24px;
            font-weight: 700;
            color: #111827;
            margin: 0 0 5px 0;
            letter-spacing: 1px;
            text-transform: uppercase;
          }
          
          .print-wrapper .store-tagline {
            font-size: 14px;
            font-weight: 500;
            color: #4b5563;
            margin: 0 0 5px 0;
          }
          
          .print-wrapper .store-contact {
            font-size: 11px;
            color: #6b7280;
            margin: 0;
          }
          
          /* Info Section */
          .print-wrapper .info-section {
            display: flex;
            justify-content: space-between;
            padding: 15px 20px;
            border-bottom: 1px solid #e5e7eb;
          }
          
          .print-wrapper .info-block {
            flex: 1;
          }
          
          .print-wrapper .info-title {
            font-size: 10px;
            text-transform: uppercase;
            font-weight: 600;
            color: #6b7280;
            margin-bottom: 5px;
          }
          
          .print-wrapper .info-row {
            display: flex;
            margin-bottom: 3px;
          }
          
          .print-wrapper .info-label {
            width: 90px;
            font-weight: 600;
          }
          
          .print-wrapper .info-value {
            flex: 1;
          }
          
          /* Table */
          .print-wrapper table {
            width: 100%;
            border-collapse: collapse;
          }
          
          .print-wrapper th {
            background-color: #f3f4f6;
            color: #111827;
            font-weight: 600;
            text-transform: uppercase;
            font-size: 10px;
            padding: 10px 15px;
            text-align: right;
            border-bottom: 1px solid #d1d5db;
          }
          
          .print-wrapper th.text-left { text-align: left; }
          .print-wrapper th.text-center { text-align: center; }
          
          .print-wrapper td {
            padding: 10px 15px;
            font-size: 11px;
            text-align: right;
            border-bottom: 1px solid #e5e7eb;
            vertical-align: middle;
          }
          
          .print-wrapper td.text-left { text-align: left; }
          .print-wrapper td.text-center { text-align: center; }
          
          .print-wrapper .medicine-name {
            font-weight: 600;
            color: #111827;
            font-size: 12px;
          }
          
          .print-wrapper .medicine-batch {
            font-size: 10px;
            color: #6b7280;
            margin-top: 2px;
          }
          
          /* Summary Section */
          .print-wrapper .summary-section {
            display: flex;
            padding: 20px;
            border-bottom: 1px solid #e5e7eb;
          }
          
          .print-wrapper .terms-block {
            flex: 1.5;
            padding-right: 20px;
          }
          
          .print-wrapper .terms-title {
            font-weight: 600;
            font-size: 11px;
            margin-bottom: 5px;
          }
          
          .print-wrapper .terms-list {
            font-size: 10px;
            color: #6b7280;
            padding-left: 15px;
            margin: 0;
          }
          
          .print-wrapper .totals-block {
            flex: 1;
          }
          
          .print-wrapper .total-row {
            display: flex;
            justify-content: space-between;
            padding: 4px 0;
            font-size: 12px;
          }
          
          .print-wrapper .total-row.discount { color: #059669; }
          
          .print-wrapper .grand-total {
            display: flex;
            justify-content: space-between;
            padding: 10px 0;
            margin-top: 5px;
            border-top: 2px dashed #d1d5db;
            font-size: 16px;
            font-weight: 700;
          }
          
          /* Footer */
          .print-wrapper .footer {
            text-align: center;
            padding: 20px;
            background: #f9fafb;
          }
          
          .print-wrapper .thank-you {
            font-weight: 600;
            font-size: 14px;
            margin: 0 0 5px 0;
          }
          
          .print-wrapper .footer-note {
            font-size: 10px;
            color: #6b7280;
            margin: 0;
          }
          
          .print-wrapper .signature-box {
            margin-top: 40px;
            text-align: right;
            padding-right: 30px;
          }
          
          .print-wrapper .signature-line {
            display: inline-block;
            width: 150px;
            border-top: 1px solid #111827;
            padding-top: 5px;
            font-size: 10px;
            text-align: center;
          }
        </style>
        <div class="print-wrapper">
          <div class="bill-container" id="bill-container-content">
          <!-- Header -->
          <div class="header">
            <h1 class="store-name">Pharma Medical</h1>
            <p class="store-tagline">Complete Pharmacy & Healthcare Solutions</p>
            <p class="store-contact">123 Health Avenue, Medical District &bull; Ph: +91 9876543210 &bull; GSTIN: 27AADCP1234F1Z5</p>
          </div>
          
          <!-- Info Section -->
          <div class="info-section">
            <div class="info-block">
              <div class="info-title">Patient Details</div>
              <div class="info-row">
                <span class="info-label">Name:</span>
                <span class="info-value"><b>${billData.patient.name || 'Walk-in'}</b></span>
              </div>
              <div class="info-row">
                <span class="info-label">Mobile:</span>
                <span class="info-value">${billData.patient.mobile || '-'}</span>
              </div>
              <div class="info-row">
                <span class="info-label">Doctor:</span>
                <span class="info-value">${billData.patient.doctorName || 'Self / OTC'}</span>
              </div>
            </div>
            
            <div class="info-block">
              <div class="info-title">Invoice Details</div>
              <div class="info-row">
                <span class="info-label">Invoice No:</span>
                <span class="info-value"><b>${billData.invoiceNo}</b></span>
              </div>
              <div class="info-row">
                <span class="info-label">Date:</span>
                <span class="info-value">${billData.date}</span>
              </div>
              <div class="info-row">
                <span class="info-label">Payment:</span>
                <span class="info-value">${billData.paymentMode}</span>
              </div>
            </div>
          </div>
          
          <!-- Items Table -->
          <table>
            <thead>
              <tr>
                <th class="text-center" width="5%">#</th>
                <th class="text-left" width="35%">Particulars</th>
                <th class="text-center" width="10%">Qty</th>
                <th width="12%">Rate</th>
                <th width="12%">Dis.</th>
                <th width="10%">GST</th>
                <th width="16%">Amount</th>
              </tr>
            </thead>
            <tbody>
              ${billData.medicines.map((item, index) => `
                <tr>
                  <td class="text-center">${index + 1}</td>
                  <td class="text-left">
                    <div class="medicine-name">${item.name}</div>
                    <div class="medicine-batch">Batch: ${item.batch}</div>
                  </td>
                  <td class="text-center"><b>${item.quantity}</b></td>
                  <td>₹${item.price.toFixed(2)}</td>
                  <td>${item.discount}%</td>
                  <td>${item.gst}%</td>
                  <td><b>₹${item.total.toFixed(2)}</b></td>
                </tr>
              `).join('')}
            </tbody>
          </table>
          
          <!-- Summary -->
          <div class="summary-section">
            <div class="terms-block">
              <div class="terms-title">Terms & Conditions:</div>
              <ul class="terms-list">
                <li>Goods once sold will not be taken back or exchanged.</li>
                <li>Prescription medicines issued only against valid medical prescription.</li>
                <li>Subject to local jurisdiction only.</li>
                <li>Keep medicines in a cool, dry place.</li>
              </ul>
            </div>
            
            <div class="totals-block">
              <div class="total-row">
                <span>Sub Total:</span>
                <span>₹${billData.totals.subtotal.toFixed(2)}</span>
              </div>
              <div class="total-row discount">
                <span>Discount Saved:</span>
                <span>- ₹${billData.totals.discountTotal.toFixed(2)}</span>
              </div>
              <div class="total-row">
                <span>Add GST:</span>
                <span>+ ₹${billData.totals.gstTotal.toFixed(2)}</span>
              </div>
              
              <div class="grand-total">
                <span>Net Amount:</span>
                <span>₹${billData.totals.grandTotal.toFixed(2)}</span>
              </div>
            </div>
          </div>
          
          <!-- Footer -->
          <div class="footer">
            <p class="thank-you">Thank you for your visit. Get Well Soon!</p>
            <p class="footer-note">This is a computer generated invoice and does not require a physical signature.</p>
            
            <div class="signature-box">
              <span class="signature-line">Authorized Signatory</span>
            </div>
          </div>
        </div>
        </div>
      </div>
`;

export const printBill = (billData) => {
  if (!billData) return;

  const printWindow = window.open("", "_blank");
  const htmlContent = getHtmlTemplate(billData) + `
    <script>
      window.onload = function() {
        setTimeout(function() {
          window.print();
        }, 500);
      }
    </script>
  `;

  printWindow.document.write(htmlContent);
  printWindow.document.close();
};

export const downloadBillPDF = (billData) => {
  if (!billData) return;
  
  // We'll create a temporary div to hold the HTML
  const tempDiv = document.createElement("div");
  tempDiv.innerHTML = getHtmlTemplate(billData);
  // Hide it off-screen
  tempDiv.style.position = "absolute";
  tempDiv.style.left = "-9999px";
  tempDiv.style.top = "-9999px";
  document.body.appendChild(tempDiv);
  
  // Configure html2pdf
  const opt = {
    margin: 10,
    filename: `${billData.invoiceNo}.pdf`,
    image: { type: 'jpeg', quality: 0.98 },
    html2canvas: { scale: 2 },
    jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
  };
  
  // Generate and save
  html2pdf().set(opt).from(tempDiv.firstElementChild).save().then(() => {
    document.body.removeChild(tempDiv);
    Swal.fire({
      icon: "success",
      title: "PDF Downloaded",
      text: "Bill PDF downloaded successfully",
      background: "#1e293b",
      color: "#fff",
      confirmButtonColor: "#22c55e",
    });
  });
};