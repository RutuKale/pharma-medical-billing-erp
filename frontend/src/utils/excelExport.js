import * as XLSX from "xlsx";
import Swal from "sweetalert2";

/**
 * Sanitizes values to prevent Excel Formula Injection (CSV / XLSX Injection).
 * If a text value begins with =, +, -, @, or \t, prepend a single quote.
 */
export const sanitizeForExcel = (val) => {
  if (val === null || val === undefined) return "";
  if (typeof val === "number" || typeof val === "boolean") return val;
  const str = String(val);
  if (/^[=+\-@\t\r]/.test(str)) {
    return `'${str}`;
  }
  return str;
};

/**
 * Automatically calculates column widths based on cell content length
 */
const calculateColWidths = (rows) => {
  if (!rows || rows.length === 0) return [];
  const colWidths = [];
  rows.forEach((row) => {
    Object.keys(row).forEach((key, colIdx) => {
      const valStr = String(row[key] ?? "");
      const headerLen = String(key).length;
      const contentLen = valStr.length;
      const maxLen = Math.max(headerLen, contentLen);
      colWidths[colIdx] = Math.min(
        Math.max(colWidths[colIdx] || 10, maxLen + 3),
        50
      );
    });
  });
  return colWidths.map((w) => ({ wch: w }));
};

/**
 * Exports data to an Excel-compatible .xlsx file
 * @param {Object} options
 * @param {string} options.filename - Base filename without extension
 * @param {string} [options.sheetName="Sheet1"] - Sheet title (max 31 chars)
 * @param {Array<Object>} options.data - Rows to export
 * @param {Array<{header: string, key: string, format?: (val: any, row: any) => any}>} [options.columns]
 * @param {Object} [options.summaryTotals] - Optional summary totals row
 */
export const exportToExcel = ({
  filename = "Export",
  sheetName = "Report",
  data = [],
  columns = null,
  summaryTotals = null,
}) => {
  if (!data || data.length === 0) {
    Swal.fire({
      icon: "info",
      title: "No Data to Export",
      text: "There are no records matching your selected filters to export.",
      confirmButtonColor: "#2563eb",
    });
    return false;
  }

  try {
    let formattedRows = [];

    if (columns && columns.length > 0) {
      formattedRows = data.map((item) => {
        const row = {};
        columns.forEach((col) => {
          let val = col.format ? col.format(item[col.key], item) : item[col.key];
          row[col.header] = sanitizeForExcel(val);
        });
        return row;
      });
    } else {
      formattedRows = data.map((item) => {
        const row = {};
        Object.keys(item).forEach((k) => {
          row[k] = sanitizeForExcel(item[k]);
        });
        return row;
      });
    }

    // Append summary totals row if provided
    if (summaryTotals && typeof summaryTotals === "object") {
      const summaryRow = {};
      const firstCol = columns ? columns[0].header : Object.keys(formattedRows[0] || {})[0];
      if (columns) {
        columns.forEach((col) => {
          summaryRow[col.header] = summaryTotals[col.key] !== undefined
            ? sanitizeForExcel(summaryTotals[col.key])
            : "";
        });
      } else {
        Object.keys(formattedRows[0] || {}).forEach((k) => {
          summaryRow[k] = summaryTotals[k] !== undefined
            ? sanitizeForExcel(summaryTotals[k])
            : "";
        });
      }
      summaryRow[firstCol] = summaryRow[firstCol] || "TOTAL SUMMARY";
      formattedRows.push(summaryRow);
    }

    const ws = XLSX.utils.json_to_sheet(formattedRows);
    ws["!cols"] = calculateColWidths(formattedRows);

    const wb = XLSX.utils.book_new();
    const cleanSheetName = (sheetName || "Report").slice(0, 31);
    XLSX.utils.book_append_sheet(wb, ws, cleanSheetName);

    const dateStr = new Date().toISOString().slice(0, 10);
    const safeFilename = `${filename.replace(/[^a-zA-Z0-9_-]/g, "_")}_${dateStr}.xlsx`;

    XLSX.writeFile(wb, safeFilename);

    Swal.fire({
      icon: "success",
      title: "Report Exported",
      text: `Successfully generated and downloaded ${safeFilename} (${data.length} records).`,
      timer: 2500,
      showConfirmButton: false,
    });
    return true;
  } catch (err) {
    console.error("Excel export error:", err);
    Swal.fire({
      icon: "error",
      title: "Export Failed",
      text: err.message || "An error occurred while generating the Excel spreadsheet.",
      confirmButtonColor: "#2563eb",
    });
    return false;
  }
};

/**
 * Exports a multi-sheet workbook for comprehensive reporting
 * @param {string} filename
 * @param {Array<{sheetName: string, data: Array<Object>, columns?: Array<any>, summaryTotals?: Object}>} sheets
 */
export const exportMultiSheetExcel = ({ filename = "Comprehensive_Report", sheets = [] }) => {
  if (!sheets || sheets.length === 0) return false;

  try {
    const wb = XLSX.utils.book_new();
    let totalExportedRecords = 0;

    sheets.forEach((sheet) => {
      const { sheetName = "Sheet", data = [], columns = null, summaryTotals = null } = sheet;
      let formattedRows = [];

      if (!data || data.length === 0) {
        formattedRows = [{ Status: "No records found matching current criteria" }];
      } else {
        totalExportedRecords += data.length;
        if (columns && columns.length > 0) {
          formattedRows = data.map((item) => {
            const row = {};
            columns.forEach((col) => {
              let val = col.format ? col.format(item[col.key], item) : item[col.key];
              row[col.header] = sanitizeForExcel(val);
            });
            return row;
          });
        } else {
          formattedRows = data.map((item) => {
            const row = {};
            Object.keys(item).forEach((k) => {
              row[k] = sanitizeForExcel(item[k]);
            });
            return row;
          });
        }

        if (summaryTotals) {
          const summaryRow = {};
          const firstCol = columns ? columns[0].header : Object.keys(formattedRows[0] || {})[0];
          if (columns) {
            columns.forEach((col) => {
              summaryRow[col.header] = summaryTotals[col.key] !== undefined
                ? sanitizeForExcel(summaryTotals[col.key])
                : "";
            });
          }
          summaryRow[firstCol] = summaryRow[firstCol] || "TOTAL SUMMARY";
          formattedRows.push(summaryRow);
        }
      }

      const ws = XLSX.utils.json_to_sheet(formattedRows);
      ws["!cols"] = calculateColWidths(formattedRows);
      const cleanName = sheetName.slice(0, 31).replace(/[\\/?*[\]]/g, "_");
      XLSX.utils.book_append_sheet(wb, ws, cleanName);
    });

    const dateStr = new Date().toISOString().slice(0, 10);
    const safeFilename = `${filename.replace(/[^a-zA-Z0-9_-]/g, "_")}_${dateStr}.xlsx`;
    XLSX.writeFile(wb, safeFilename);

    Swal.fire({
      icon: "success",
      title: "Comprehensive Workbook Exported",
      text: `Successfully exported ${sheets.length} report sheets (${totalExportedRecords} total records) to ${safeFilename}.`,
      timer: 3000,
      showConfirmButton: false,
    });
    return true;
  } catch (err) {
    console.error("Multi-sheet Excel export error:", err);
    Swal.fire({
      icon: "error",
      title: "Export Failed",
      text: err.message || "Failed to generate multi-sheet Excel file.",
      confirmButtonColor: "#2563eb",
    });
    return false;
  }
};
