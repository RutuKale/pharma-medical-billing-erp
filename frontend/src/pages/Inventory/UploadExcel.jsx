import React, { useState, useCallback } from "react";
import { Link } from "react-router-dom";
import Pagination from "../../components/Pagination";
import apiClient from "../../utils/apiClient";
import Swal from "sweetalert2";
import * as XLSX from "xlsx";
import {
  UploadCloud,
  FileSpreadsheet,
  AlertCircle,
  CheckCircle2,
  Trash2,
  Download,
  Eye,
  EyeOff,
  AlertTriangle,
  TrendingUp,
  Database,
  ArrowLeft,
  Package,
  Layers,
  IndianRupee,
  HelpCircle,
  FileCheck,
} from "lucide-react";
import ButtonLoader from "../../components/ButtonLoader";

const API_URL = "/medicines/bulk";

const UploadExcel = () => {
  const [excelData, setExcelData] = useState([]);
  const [fileName, setFileName] = useState("");
  const [errors, setErrors] = useState([]);
  const [warnings, setWarnings] = useState([]);
  const [successMessage, setSuccessMessage] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [showPreview, setShowPreview] = useState(true);
  const [rowCount, setRowCount] = useState(0);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // REQUIRED HEADERS
  const requiredHeaders = [
    "medicineName",
    "saltName",
    "brandName",
    "manufacturer",
    "category",
    "purchasePrice",
    "sellingPrice",
    "batchNumber",
    "expiryDate",
    "quantity",
  ];

  const optionalHeaders = [
    "packSize",
    "unit",
    "supplierName",
    "supplierContact",
    "supplierMobile",
    "supplierEmail",
    "supplierAddress",
    "manufactureDate",
    "rackLocation",
    "minStock",
  ];

  // Header normalization map: map common variants to canonical keys
  const headerAliases = {
    medicineName: ["medicine name", "medicine", "name", "medicine_name"],
    saltName: ["salt name", "salt", "salt_name"],
    brandName: ["brand name", "brand", "brand_name"],
    manufacturer: ["manufacturer", "mfg", "maker"],
    category: ["category", "cat"],
    packSize: ["pack size", "packsize", "pack_size"],
    unit: ["unit"],
    purchasePrice: [
      "purchase price",
      "purchase_price",
      "cost",
      "purchaseprice",
    ],
    sellingPrice: [
      "selling price",
      "selling_price",
      "price",
      "mrp",
      "sellingprice",
    ],
    supplierName: [
      "supplier name",
      "supplier",
      "vendor name",
      "vendor",
      "supplier_name",
      "vendor_name",
    ],
    supplierContact: [
      "supplier contact",
      "contact person",
      "supplier_contact",
      "contact_person",
      "supplier contact person",
    ],
    supplierMobile: [
      "supplier mobile",
      "supplier phone",
      "supplier_mobile",
      "vendor mobile",
      "vendor phone",
      "supplier_phone",
      "mobile",
      "phone",
    ],
    supplierEmail: [
      "supplier email",
      "supplier_email",
      "vendor email",
      "email",
    ],
    supplierAddress: [
      "supplier address",
      "supplier_address",
      "vendor address",
      "address",
    ],
    batchNumber: [
      "batch number",
      "batch",
      "batch_number",
      "batchno",
      "batch_no",
    ],
    manufactureDate: [
      "manufacture date",
      "manufacture_date",
      "mfg_date",
      "manufacturedate",
    ],
    expiryDate: ["expiry date", "expiry", "expiry_date", "exp_date", "expdate"],
    quantity: ["quantity", "qty", "qnty"],
    rackLocation: ["rack location", "rack", "rack_location"],
    minStock: ["min stock", "min_stock", "minstock"],
  };

  const downloadTemplate = () => {
    const headers = [...requiredHeaders, ...optionalHeaders];
    const sampleData = [
      {
        medicineName: "Paracetamol 500mg",
        saltName: "Paracetamol",
        brandName: "Calpol",
        manufacturer: "GSK",
        category: "Tablet",
        purchasePrice: 10.0,
        sellingPrice: 15.0,
        batchNumber: "BAT123",
        expiryDate: "2027-12-31",
        quantity: 100,
        packSize: "10s",
        unit: "Strip",
        supplierName: "Apex Healthcare Ltd",
        supplierContact: "Rajesh Kumar",
        supplierMobile: "9876543210",
        supplierEmail: "apex@example.com",
        supplierAddress: "Plot 42, Pharma Industrial Estate, Mumbai",
        manufactureDate: "2026-05-01",
        rackLocation: "Rack A-1",
        minStock: 20,
      },
    ];

    const worksheet = XLSX.utils.json_to_sheet(sampleData, { header: headers });
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Template");
    XLSX.writeFile(workbook, "Medicine_Bulk_Upload_Template.xlsx");
  };

  const normalizeKey = (key) => {
    if (!key || typeof key !== "string") return null;
    const k = key.trim().toLowerCase();
    for (const canonical in headerAliases) {
      const variants = headerAliases[canonical];
      for (const v of variants) {
        if (k === v) return canonical;
      }
      if (k === canonical.toLowerCase()) return canonical;
    }
    const compact = k.replace(/[_\s]/g, "");
    for (const canonical in headerAliases) {
      if (compact === canonical.toLowerCase()) return canonical;
    }
    return null;
  };

  const normalizeParsedData = (rows) => {
    if (!Array.isArray(rows) || rows.length === 0) return [];

    const first = rows[0] || {};
    const originalKeys = Object.keys(first);
    const map = {};
    originalKeys.forEach((orig) => {
      const canonical = normalizeKey(orig);
      if (canonical) map[orig] = canonical;
    });

    return rows.map((row) => {
      const newRow = {};
      Object.keys(row).forEach((orig) => {
        const canonical = map[orig] || normalizeKey(orig) || orig;
        newRow[canonical] = row[orig];
      });
      return newRow;
    });
  };

  // HANDLE DRAG & DROP
  const handleDrag = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.name.match(/\.(xlsx|xls)$/)) {
        processFile(file);
      } else {
        setErrors(["Please upload a valid Excel file (.xlsx or .xls)"]);
      }
    }
  }, []);

  // PROCESS FILE
  const processFile = (file) => {
    setFileName(file.name);
    setErrors([]);
    setWarnings([]);
    setSuccessMessage("");
    setExcelData([]);
    setRowCount(0);
    setCurrentPage(1);

    const reader = new FileReader();
    reader.readAsBinaryString(file);

    reader.onload = (event) => {
      try {
        const binaryData = event.target.result;
        const workbook = XLSX.read(binaryData, { type: "binary" });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const parsedData = XLSX.utils.sheet_to_json(sheet);
        const normalized = normalizeParsedData(parsedData);
        validateExcelData(normalized);
      } catch (error) {
        console.error(error);
        setErrors([
          "Failed to parse Excel file. Please check the file format.",
        ]);
      }
    };

    reader.onerror = () => {
      setErrors(["Failed to read file. Please try again."]);
    };
  };

  // HANDLE FILE UPLOAD
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    processFile(file);
  };

  // VALIDATE DATA
  const validateExcelData = (data) => {
    let validationErrors = [];
    let validationWarnings = [];

    setRowCount(data.length);

    if (data.length === 0) {
      validationErrors.push(
        "Excel file is empty. Please add data to the file.",
      );
      setErrors(validationErrors);
      return;
    }

    if (data.length > 1000) {
      validationWarnings.push(
        `Large file detected (${data.length} rows). Upload may take some time.`,
      );
    }

    // CHECK HEADERS
    const headers = Object.keys(data[0] || {});
    const missingHeaders = requiredHeaders.filter(
      (header) => !headers.includes(header),
    );

    if (missingHeaders.length > 0) {
      missingHeaders.forEach((header) => {
        validationErrors.push(`Missing required column: "${header}"`);
      });
    }

    // CHECK ROWS
    let emptyRows = 0;
    let futureExpiryCount = 0;
    let today = new Date();
    today.setHours(0, 0, 0, 0);

    data.forEach((row, index) => {
      const rowNum = index + 2;

      if (!row.medicineName || !row.batchNumber) {
        emptyRows++;
      }

      if (!row.medicineName) {
        validationErrors.push(`Row ${rowNum}: Medicine name is required`);
      }

      if (!row.batchNumber) {
        validationErrors.push(`Row ${rowNum}: Batch number is required`);
      }

      if (
        row.quantity === undefined ||
        row.quantity === null ||
        row.quantity === ""
      ) {
        validationErrors.push(`Row ${rowNum}: Quantity is required`);
      } else if (isNaN(row.quantity) || Number(row.quantity) <= 0) {
        validationErrors.push(
          `Row ${rowNum}: Quantity must be a positive number`,
        );
      }

      if (!row.expiryDate) {
        validationErrors.push(`Row ${rowNum}: Expiry date is required`);
      } else {
        const expiryDate = new Date(row.expiryDate);

        if (isNaN(expiryDate.getTime())) {
          validationErrors.push(`Row ${rowNum}: Invalid expiry date format`);
        } else {
          expiryDate.setHours(0, 0, 0, 0);

          const todayDate = new Date();
          todayDate.setHours(0, 0, 0, 0);

          const threeMonthsLater = new Date(todayDate);
          threeMonthsLater.setMonth(threeMonthsLater.getMonth() + 3);

          if (expiryDate <= todayDate) {
            validationErrors.push(
              `Row ${rowNum}: Expiry date must be a future date`,
            );
          } else if (expiryDate <= threeMonthsLater) {
            futureExpiryCount++;
          }
        }
      }

      if (
        row.purchasePrice &&
        (isNaN(row.purchasePrice) || Number(row.purchasePrice) < 0)
      ) {
        validationErrors.push(
          `Row ${rowNum}: Purchase price must be a valid number`,
        );
      }

      if (
        row.sellingPrice &&
        (isNaN(row.sellingPrice) || Number(row.sellingPrice) < 0)
      ) {
        validationErrors.push(
          `Row ${rowNum}: Selling price must be a valid number`,
        );
      }

      if (
        row.purchasePrice &&
        row.sellingPrice &&
        Number(row.sellingPrice) <= Number(row.purchasePrice)
      ) {
        validationWarnings.push(
          `Row ${rowNum}: Selling price (₹${row.sellingPrice}) is less than or equal to purchase price (₹${row.purchasePrice})`,
        );
      }
    });

    if (emptyRows > 0) {
      validationWarnings.push(
        `${emptyRows} rows appear to have missing critical data.`,
      );
    }

    if (futureExpiryCount > 0) {
      validationWarnings.push(
        `${futureExpiryCount} products are expiring within 90 days.`,
      );
    }

    setErrors(validationErrors);
    setWarnings(validationWarnings);

    if (validationErrors.length === 0) {
      setExcelData(data);
      setSuccessMessage(
        `Successfully validated ${data.length} medicine records. Review the preview below before committing to inventory.`,
      );
    } else {
      setExcelData([]);
      setSuccessMessage("");
    }
  };

  // REMOVE FILE
  const removeFile = () => {
    setExcelData([]);
    setErrors([]);
    setWarnings([]);
    setFileName("");
    setSuccessMessage("");
    setRowCount(0);
    setCurrentPage(1);
    const input = document.getElementById("fileInput");
    if (input) input.value = "";
  };

  // SUBMIT
  const handleUpload = async () => {
    if (excelData.length === 0) {
      setErrors(["No data to upload. Please select a valid Excel file."]);
      return;
    }

    setIsUploading(true);
    setErrors([]);

    try {
      const response = await apiClient.post(API_URL, excelData);

      if (response.data?.success) {
        Swal.fire({
          icon: "success",
          title: "Upload Successful",
          text: `Successfully imported ${response.data.data?.insertedRows || excelData.length} medicines into inventory!`,
          confirmButtonColor: "#2563eb",
          customClass: {
            popup: "rounded-2xl shadow-xl",
            confirmButton: "px-5 py-2.5 rounded-xl font-semibold text-sm",
          },
        });
        removeFile();
      } else {
        setErrors([
          response.data?.message || "Upload failed. Please try again.",
        ]);
      }
    } catch (error) {
      console.error(error);
      setErrors([
        error.response?.data?.message ||
          "Upload failed. Please try again or contact support.",
      ]);
    } finally {
      setIsUploading(false);
    }
  };

  const getPreviewStats = () => {
    const totalQuantity = excelData.reduce(
      (sum, row) => sum + (parseInt(row.quantity, 10) || 0),
      0,
    );
    const totalValue = excelData.reduce(
      (sum, row) =>
        sum +
        (parseInt(row.quantity, 10) || 0) * (parseFloat(row.purchasePrice) || 0),
      0,
    );
    const categories = [
      ...new Set(excelData.map((row) => row.category).filter(Boolean)),
    ];
    return { totalQuantity, totalValue, categories: categories.length };
  };

  const previewStats = excelData.length > 0 ? getPreviewStats() : null;

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-[1600px] mx-auto space-y-6">
      {/* 1. HEADER SECTION (No icon next to title per design standards) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <span>Upload Excel</span>
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-xs sm:text-sm mt-0.5">
            Bulk import medicines, batch numbers, and stock pricing via spreadsheet.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={downloadTemplate}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 rounded-xl text-sm font-semibold shadow-xs transition-colors"
          >
            <Download size={16} className="text-slate-500 dark:text-slate-400" />
            <span>Download Template</span>
          </button>
          <Link
            to="/inventory"
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 rounded-xl text-sm font-semibold shadow-xs transition-colors"
          >
            <ArrowLeft size={16} className="text-slate-500 dark:text-slate-400" />
            <span>Back to Inventory</span>
          </Link>
        </div>
      </div>

      {/* 2. TEMPLATE FORMAT & GUIDANCE CARD */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 sm:p-6 border border-slate-200/90 dark:border-slate-800 shadow-xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 border border-blue-100 dark:border-blue-900/50">
              <FileSpreadsheet size={20} />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                Excel Template Format
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Format your spreadsheet columns to match required attributes for error-free parsing.
              </p>
            </div>
          </div>
          <button
            onClick={downloadTemplate}
            className="inline-flex items-center gap-2 text-xs font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 bg-blue-50/70 dark:bg-blue-950/40 hover:bg-blue-100/70 dark:hover:bg-blue-900/50 px-3 py-1.5 rounded-lg transition-colors w-fit"
          >
            <Download size={14} />
            Get Pre-Formatted .xlsx
          </button>
        </div>

        {/* Required Columns List */}
        <div>
          <div className="flex items-center gap-2 mb-2.5">
            <span className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
              Required Columns ({requiredHeaders.length})
            </span>
            <span className="text-[11px] text-slate-400 font-normal">
              — Must be present with non-empty values
            </span>
          </div>
          <div className="flex flex-wrap gap-2">
            {requiredHeaders.map((header) => (
              <span
                key={header}
                className="px-2.5 py-1 text-xs font-mono font-medium rounded-lg bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border border-blue-200/60 dark:border-blue-800/60"
              >
                {header}
              </span>
            ))}
          </div>
        </div>

        {/* Optional Columns List */}
        <div>
          <div className="flex items-center gap-2 mb-2.5">
            <span className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
              Optional Columns ({optionalHeaders.length})
            </span>
            <span className="text-[11px] text-slate-400 font-normal">
              — Additional inventory and supplier parameters
            </span>
          </div>
          <div className="flex flex-wrap gap-2">
            {optionalHeaders.map((header) => (
              <span
                key={header}
                className="px-2.5 py-1 text-xs font-mono font-medium rounded-lg bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700"
              >
                {header}
              </span>
            ))}
          </div>
        </div>

        {/* Fast Instructions Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs">
          <div className="p-3 rounded-xl bg-slate-50/70 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 space-y-1">
            <p className="font-semibold text-slate-800 dark:text-slate-200">Column Names</p>
            <p className="text-slate-500 dark:text-slate-400 leading-relaxed">
              Aliases like "Medicine", "Qty", or "MRP" are auto-normalized.
            </p>
          </div>
          <div className="p-3 rounded-xl bg-slate-50/70 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 space-y-1">
            <p className="font-semibold text-slate-800 dark:text-slate-200">Expiry Date</p>
            <p className="text-slate-500 dark:text-slate-400 leading-relaxed">
              Format as YYYY-MM-DD. Must be a valid future expiration date.
            </p>
          </div>
          <div className="p-3 rounded-xl bg-slate-50/70 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 space-y-1">
            <p className="font-semibold text-slate-800 dark:text-slate-200">Quantity & Price</p>
            <p className="text-slate-500 dark:text-slate-400 leading-relaxed">
              Quantity must be &gt; 0. Purchase and selling prices must be numeric.
            </p>
          </div>
          <div className="p-3 rounded-xl bg-slate-50/70 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 space-y-1">
            <p className="font-semibold text-slate-800 dark:text-slate-200">Supplier & Batch</p>
            <p className="text-slate-500 dark:text-slate-400 leading-relaxed">
              Supplier details are auto-linked; batch numbers segregate stock.
            </p>
          </div>
        </div>
      </div>

      {/* 3. UPLOAD DROPZONE CARD */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 sm:p-8 border border-slate-200/90 dark:border-slate-800 shadow-xs space-y-6">
        <div
          className={`border-2 border-dashed rounded-2xl p-8 sm:p-12 flex flex-col items-center justify-center text-center cursor-pointer transition-all duration-200 ${
            dragActive
              ? "border-blue-500 bg-blue-50/50 dark:bg-blue-950/20 scale-[0.99]"
              : "border-slate-300 dark:border-slate-700 hover:border-blue-400 dark:hover:border-blue-500 hover:bg-slate-50/50 dark:hover:bg-slate-800/30"
          }`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={() => document.getElementById("fileInput").click()}
        >
          <div className="w-16 h-16 rounded-2xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-4 shadow-xs border border-blue-100 dark:border-blue-900/50">
            <UploadCloud size={32} />
          </div>
          <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white mb-1">
            Upload Excel Spreadsheet
          </h3>
          <p className="text-slate-500 dark:text-slate-400 text-xs sm:text-sm max-w-md mb-2">
            Drag & drop your workbook here, or{" "}
            <span className="text-blue-600 dark:text-blue-400 font-semibold underline underline-offset-2">
              browse files
            </span>
          </p>
          <p className="text-[11px] font-medium text-slate-400">
            Supports .xlsx and .xls (Up to 1,000 medicine rows per batch)
          </p>
          <input
            id="fileInput"
            type="file"
            accept=".xlsx,.xls"
            onChange={handleFileUpload}
            className="hidden"
          />
        </div>

        {/* Selected File Details Bar */}
        {fileName && (
          <div className="bg-slate-50/70 dark:bg-slate-800/50 border border-slate-200/90 dark:border-slate-800 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-blue-600 dark:text-blue-400 shadow-xs">
                <FileSpreadsheet size={24} />
              </div>
              <div>
                <h4 className="font-bold text-slate-800 dark:text-slate-200 text-sm">{fileName}</h4>
                <div className="flex items-center gap-2 mt-0.5 text-xs">
                  <span className="text-slate-500 dark:text-slate-400 font-medium">
                    {rowCount} rows detected
                  </span>
                  <span className="text-slate-300 dark:text-slate-600">•</span>
                  {errors.length > 0 ? (
                    <span className="inline-flex items-center gap-1 text-rose-600 dark:text-rose-400 font-semibold">
                      <AlertCircle size={13} />
                      Validation Failed
                    </span>
                  ) : warnings.length > 0 ? (
                    <span className="inline-flex items-center gap-1 text-amber-600 dark:text-amber-400 font-semibold">
                      <AlertTriangle size={13} />
                      Valid with warnings
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-semibold">
                      <CheckCircle2 size={13} />
                      Ready to upload
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2.5">
              {excelData.length > 0 && (
                <button
                  onClick={() => setShowPreview(!showPreview)}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-semibold shadow-xs transition-colors"
                >
                  {showPreview ? (
                    <>
                      <EyeOff size={14} className="text-slate-500 dark:text-slate-400" />
                      <span>Hide Preview</span>
                    </>
                  ) : (
                    <>
                      <Eye size={14} className="text-slate-500 dark:text-slate-400" />
                      <span>Show Preview</span>
                    </>
                  )}
                </button>
              )}
              <button
                onClick={removeFile}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-white dark:bg-slate-900 hover:bg-rose-50 dark:hover:bg-rose-950/30 border border-slate-200 dark:border-slate-700 hover:border-rose-200 dark:hover:border-rose-800 text-rose-600 dark:text-rose-400 rounded-xl text-xs font-semibold shadow-xs transition-colors"
              >
                <Trash2 size={14} />
                <span>Remove</span>
              </button>
            </div>
          </div>
        )}

        {/* Success Alert */}
        {successMessage && (
          <div className="bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200/80 dark:border-emerald-800 rounded-xl p-4 flex items-start gap-3 text-emerald-800 dark:text-emerald-200">
            <CheckCircle2 size={18} className="text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
            <div className="text-xs sm:text-sm">
              <span className="font-bold">Validation Successful: </span>
              {successMessage}
            </div>
          </div>
        )}

        {/* Warnings Alert */}
        {warnings.length > 0 && (
          <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200/80 dark:border-amber-800 rounded-xl p-4 space-y-2">
            <div className="flex items-center gap-2 text-amber-800 dark:text-amber-200 text-xs sm:text-sm font-bold">
              <AlertTriangle size={16} className="text-amber-600 dark:text-amber-400" />
              <span>Warnings ({warnings.length})</span>
            </div>
            <ul className="space-y-1 text-xs text-amber-700 dark:text-amber-300 pl-6 list-disc max-h-36 overflow-y-auto">
              {warnings.map((warning, index) => (
                <li key={index}>{warning}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Errors Alert */}
        {errors.length > 0 && (
          <div className="bg-rose-50 dark:bg-rose-950/30 border border-rose-200/80 dark:border-rose-800 rounded-xl p-4 space-y-2">
            <div className="flex items-center gap-2 text-rose-800 dark:text-rose-200 text-xs sm:text-sm font-bold">
              <AlertCircle size={16} className="text-rose-600 dark:text-rose-400" />
              <span>Validation Errors ({errors.length})</span>
            </div>
            <ul className="space-y-1 text-xs text-rose-700 dark:text-rose-300 pl-6 list-disc max-h-48 overflow-y-auto">
              {errors.map((error, index) => (
                <li key={index}>{error}</li>
              ))}
            </ul>
          </div>
        )}

        {/* 4. STAT CARDS ROW (When file has parsed data) */}
        {excelData.length > 0 && previewStats && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
            {/* Total Medicines */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200/90 dark:border-slate-800 shadow-xs hover:shadow-sm transition-all flex flex-col justify-between">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    Total Rows
                  </p>
                  <p className="text-2xl font-bold text-slate-900 dark:text-white mt-2">
                    {excelData.length}
                  </p>
                </div>
                <div className="p-2.5 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 border border-blue-100 dark:border-blue-900/50">
                  <Database size={20} />
                </div>
              </div>
              <div className="mt-4 flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 font-medium">
                <FileCheck size={14} className="text-blue-500" />
                <span>Validated medicine items</span>
              </div>
            </div>

            {/* Total Quantity */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200/90 dark:border-slate-800 shadow-xs hover:shadow-sm transition-all flex flex-col justify-between">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    Total Quantity
                  </p>
                  <p className="text-2xl font-bold text-slate-900 dark:text-white mt-2">
                    {previewStats.totalQuantity.toLocaleString()}
                  </p>
                </div>
                <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900/50">
                  <Package size={20} />
                </div>
              </div>
              <div className="mt-4 flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 font-medium">
                <TrendingUp size={14} className="text-emerald-500" />
                <span>Units to be stocked in</span>
              </div>
            </div>

            {/* Estimated Purchase Value */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200/90 dark:border-slate-800 shadow-xs hover:shadow-sm transition-all flex flex-col justify-between">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    Estimated Cost
                  </p>
                  <p className="text-2xl font-bold text-slate-900 dark:text-white mt-2">
                    ₹
                    {previewStats.totalValue.toLocaleString("en-IN", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </p>
                </div>
                <div className="p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 border border-amber-100 dark:border-amber-900/50">
                  <IndianRupee size={20} />
                </div>
              </div>
              <div className="mt-4 flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 font-medium">
                <span>Calculated via purchase prices</span>
              </div>
            </div>

            {/* Categories */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200/90 dark:border-slate-800 shadow-xs hover:shadow-sm transition-all flex flex-col justify-between">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    Categories
                  </p>
                  <p className="text-2xl font-bold text-slate-900 dark:text-white mt-2">
                    {previewStats.categories}
                  </p>
                </div>
                <div className="p-2.5 rounded-xl bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400 border border-purple-100 dark:border-purple-900/50">
                  <Layers size={20} />
                </div>
              </div>
              <div className="mt-4 flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 font-medium">
                <span>Unique medicine categories</span>
              </div>
            </div>
          </div>
        )}

        {/* 5. PREVIEW TABLE SECTION */}
        {excelData.length > 0 && showPreview && (
          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-4">
            {(() => {
              const totalPages = Math.ceil(excelData.length / itemsPerPage);
              const startIndex = (currentPage - 1) * itemsPerPage;
              const paginatedData = excelData.slice(
                startIndex,
                startIndex + itemsPerPage,
              );

              return (
                <>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <h3 className="text-base font-bold text-slate-900 dark:text-white">
                        Data Preview
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                        Showing {startIndex + 1} to{" "}
                        {Math.min(startIndex + itemsPerPage, excelData.length)}{" "}
                        of {excelData.length} records
                      </p>
                    </div>

                    <button
                      onClick={handleUpload}
                      disabled={isUploading || errors.length > 0}
                      className="inline-flex items-center justify-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 dark:disabled:bg-slate-800 text-white rounded-xl text-sm font-semibold shadow-xs disabled:cursor-not-allowed transition-all"
                    >
                      {isUploading ? (
                        <ButtonLoader text="Uploading to Inventory..." />
                      ) : (
                        <>
                          <UploadCloud size={16} />
                          <span>Upload {excelData.length} Medicines</span>
                        </>
                      )}
                    </button>
                  </div>

                  {/* Standard System Table */}
                  <div className="border border-slate-200/90 dark:border-slate-800 rounded-2xl overflow-hidden bg-white dark:bg-slate-900 shadow-xs">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse min-w-[1050px]">
                        <thead>
                          <tr className="border-b border-slate-100 dark:border-slate-800 text-[11px] font-semibold text-slate-400 dark:text-slate-400 uppercase tracking-wider bg-slate-50/60 dark:bg-slate-800/50">
                            <th className="py-3 px-4 w-12 text-center">#</th>
                            <th className="py-3 px-4">Medicine</th>
                            <th className="py-3 px-4">Brand / Mfg</th>
                            <th className="py-3 px-4">Supplier</th>
                            <th className="py-3 px-4">Category</th>
                            <th className="py-3 px-4">Batch No</th>
                            <th className="py-3 px-4">Expiry Date</th>
                            <th className="py-3 px-4 text-right">Quantity</th>
                            <th className="py-3 px-4 text-right">Cost Price</th>
                            <th className="py-3 px-4 text-right">Sell Price</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-sm">
                          {paginatedData.map((row, index) => (
                            <tr
                              key={index}
                              className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors"
                            >
                              <td className="py-3 px-4 text-center text-xs font-medium text-slate-400">
                                {startIndex + index + 1}
                              </td>
                              <td className="py-3 px-4">
                                <div className="font-semibold text-slate-900 dark:text-white">
                                  {row.medicineName || "—"}
                                </div>
                                {row.saltName && (
                                  <div className="text-xs text-slate-400 font-normal truncate max-w-[200px]">
                                    {row.saltName}
                                  </div>
                                )}
                              </td>
                              <td className="py-3 px-4">
                                <div className="text-slate-800 dark:text-slate-200 font-medium">
                                  {row.brandName || "—"}
                                </div>
                                <div className="text-xs text-slate-400 font-normal">
                                  {row.manufacturer || "—"}
                                </div>
                              </td>
                              <td className="py-3 px-4">
                                <div className="font-medium text-slate-800 dark:text-slate-200">
                                  {row.supplierName || "—"}
                                </div>
                                {row.supplierMobile && (
                                  <div className="text-xs text-slate-400 font-normal">
                                    {row.supplierMobile}
                                  </div>
                                )}
                              </td>
                              <td className="py-3 px-4">
                                <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 border border-blue-100 dark:border-blue-900/50">
                                  {row.category || "General"}
                                </span>
                              </td>
                              <td className="py-3 px-4">
                                <span className="font-mono text-xs font-semibold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                                  {row.batchNumber || "—"}
                                </span>
                              </td>
                              <td className="py-3 px-4">
                                <span className="text-xs font-medium text-slate-600 dark:text-slate-300">
                                  {row.expiryDate
                                    ? new Date(row.expiryDate).toLocaleDateString("en-IN", {
                                        year: "numeric",
                                        month: "short",
                                        day: "numeric",
                                      })
                                    : "—"}
                                </span>
                              </td>
                              <td className="py-3 px-4 text-right font-bold text-slate-900 dark:text-white">
                                {Number(row.quantity || 0).toLocaleString()}
                              </td>
                              <td className="py-3 px-4 text-right text-slate-600 dark:text-slate-300 font-medium">
                                ₹{parseFloat(row.purchasePrice || 0).toFixed(2)}
                              </td>
                              <td className="py-3 px-4 text-right text-emerald-600 dark:text-emerald-400 font-bold">
                                ₹{parseFloat(row.sellingPrice || 0).toFixed(2)}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    {/* Pagination */}
                    {totalPages > 1 && (
                      <div className="p-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                        <Pagination
                          currentPage={currentPage}
                          totalPages={totalPages}
                          totalItems={excelData.length}
                          itemsPerPage={itemsPerPage}
                          onPageChange={setCurrentPage}
                        />
                      </div>
                    )}
                  </div>
                </>
              );
            })()}
          </div>
        )}
      </div>
    </div>
  );
};

export default UploadExcel;
