import React, { useState, useCallback } from "react";
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
  Shield,
  Sparkles,
  XCircle,
  Eye,
  Table,
  AlertTriangle,
  TrendingUp,
  Database,
} from "lucide-react";

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
    "quantity"
  ];

  const optionalHeaders = [
    "packSize",
    "unit",
    "gst",
    "manufactureDate",
    "rackLocation",
    "minStock"
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
    purchasePrice: ["purchase price", "purchase_price", "cost", "purchaseprice"],
    sellingPrice: ["selling price", "selling_price", "price", "mrp", "sellingprice"],
    gst: ["gst"],
    batchNumber: ["batch number", "batch", "batch_number", "batchno", "batch_no"],
    manufactureDate: ["manufacture date", "manufacture_date", "mfg_date", "manufacturedate"],
    expiryDate: ["expiry date", "expiry", "expiry_date", "exp_date", "expdate"],
    quantity: ["quantity", "qty", "qnty"],
    rackLocation: ["rack location", "rack", "rack_location"],
    minStock: ["min stock", "min_stock", "minstock"]
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
        purchasePrice: 10.00,
        sellingPrice: 15.00,
        batchNumber: "BAT123",
        expiryDate: "2027-12-31",
        quantity: 100,
        packSize: "10s",
        unit: "Strip",
        gst: 12,
        manufactureDate: "2026-05-01",
        rackLocation: "Rack A-1",
        minStock: 20
      }
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
        setErrors(["Failed to parse Excel file. Please check the file format."]);
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
      validationErrors.push("Excel file is empty. Please add data to the file.");
      setErrors(validationErrors);
      return;
    }

    if (data.length > 1000) {
      validationWarnings.push(`Large file detected (${data.length} rows). Upload may take some time.`);
    }

    // CHECK HEADERS
    const headers = Object.keys(data[0] || {});
    const missingHeaders = requiredHeaders.filter(header => !headers.includes(header));

    if (missingHeaders.length > 0) {
      missingHeaders.forEach(header => {
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
      } else if (isNaN(row.quantity) || row.quantity <= 0) {
        validationErrors.push(`Row ${rowNum}: Quantity must be a positive number`);
      }

      if (!row.expiryDate) {
        validationErrors.push(`Row ${rowNum}: Expiry date is required`);
      } else {
        const expiryDate = new Date(row.expiryDate);

        if (isNaN(expiryDate.getTime())) {
          validationErrors.push(`Row ${rowNum}: Invalid expiry date format`);
        } else {
          // Remove time portion for accurate comparison
          expiryDate.setHours(0, 0, 0, 0);

          const todayDate = new Date();
          todayDate.setHours(0, 0, 0, 0);

          const threeMonthsLater = new Date(todayDate);
          threeMonthsLater.setMonth(threeMonthsLater.getMonth() + 3);

          if (expiryDate <= todayDate) {
            validationErrors.push(
              `Row ${rowNum}: Expiry date must be a future date`
            );
          } else if (expiryDate <= threeMonthsLater) {
            futureExpiryCount++;
          }
        }
      }

      if (row.purchasePrice && (isNaN(row.purchasePrice) || row.purchasePrice < 0)) {
        validationErrors.push(`Row ${rowNum}: Purchase price must be a valid number`);
      }

      if (row.sellingPrice && (isNaN(row.sellingPrice) || row.sellingPrice < 0)) {
        validationErrors.push(`Row ${rowNum}: Selling price must be a valid number`);
      }

      if (row.purchasePrice && row.sellingPrice && row.sellingPrice <= row.purchasePrice) {
        validationWarnings.push(`Row ${rowNum}: Selling price is less than or equal to purchase price`);
      }
    });

    if (emptyRows > 0) {
      validationWarnings.push(`${emptyRows} rows appear to have missing critical data.`);
    }

    if (futureExpiryCount > 0) {
      validationWarnings.push(`${futureExpiryCount} products are expiring within 90 days.`);
    }

    setErrors(validationErrors);
    setWarnings(validationWarnings);

    if (validationErrors.length === 0) {
      setExcelData(data);
      setSuccessMessage(`Successfully loaded ${data.length} medicine records. Please review the preview below before uploading.`);
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
      const response = await apiClient.post(
        API_URL,
        excelData
      );

      if (response.data?.success) {
        Swal.fire({
          icon: "success",
          title: "Upload Successful",
          text: `Successfully uploaded ${response.data.data.insertedRows || excelData.length} medicines to inventory!`,
          background: "#1e293b",
          color: "#fff"
        });
        removeFile();
      } else {
        setErrors([response.data?.message || "Upload failed. Please try again."]);
      }
    } catch (error) {
      console.error(error);
      setErrors([error.response?.data?.message || "Upload failed. Please try again or contact support."]);
    } finally {
      setIsUploading(false);
    }
  };

  const getPreviewStats = () => {
    const totalQuantity = excelData.reduce((sum, row) => sum + (parseInt(row.quantity) || 0), 0);
    const totalValue = excelData.reduce((sum, row) => sum + ((parseInt(row.quantity) || 0) * (parseFloat(row.purchasePrice) || 0)), 0);
    const categories = [...new Set(excelData.map(row => row.category).filter(Boolean))];
    return { totalQuantity, totalValue, categories: categories.length };
  };

  const previewStats = excelData.length > 0 ? getPreviewStats() : null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Animated Background Pattern */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 -left-4 w-96 h-96 bg-blue-500/10 rounded-full filter blur-3xl"></div>
        <div className="absolute bottom-1/4 -right-4 w-96 h-96 bg-indigo-500/10 rounded-full filter blur-3xl"></div>
        <div className="absolute inset-0 opacity-5">
          <div className="h-full w-full bg-[linear-gradient(rgba(20,184,166,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(20,184,166,0.1)_1px,transparent_1px)] bg-[size:32px_32px]"></div>
        </div>
      </div>

      <div className="relative z-10 p-4 md:p-6">
        {/* HEADER */}
        <div className="mb-6">
          <div className="flex items-center gap-3">
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-indigo-400 rounded-xl blur-lg opacity-75 group-hover:opacity-100 transition-opacity"></div>
              <div className="relative bg-gradient-to-br from-blue-500 to-indigo-600 p-2 rounded-xl shadow-lg">
                <UploadCloud size={24} className="text-white" />
              </div>
            </div>
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">
                Upload Excel
              </h1>
              <p className="text-gray-400 text-sm mt-1">
                Bulk import medicines inventory using Excel sheet
              </p>
            </div>
          </div>
        </div>

        {/* SECURITY BADGE */}
        <div className="mb-6 bg-blue-500/10 border border-blue-500/20 rounded-xl p-3 flex items-center gap-3">
          <div className="bg-blue-500/20 p-1.5 rounded-lg">
            <Shield size={14} className="text-blue-400" />
          </div>
          <div>
            <p className="text-white text-xs font-medium">Bulk Import System</p>
            <p className="text-blue-300/70 text-xs">Excel validation • Data preview • Batch processing</p>
          </div>
          <Sparkles size={14} className="text-blue-400 ml-auto animate-pulse" />
        </div>

        {/* TEMPLATE SECTION */}
        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl mb-6 overflow-hidden">
          <div className="p-6">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <FileSpreadsheet size={18} className="text-blue-400" />
                  <h2 className="text-lg font-semibold text-white">Excel Template Format</h2>
                </div>
                <p className="text-sm text-gray-400">
                  Ensure your Excel file contains all required columns for successful import
                </p>
              </div>

              <button
                onClick={downloadTemplate}
                className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white px-4 py-2.5 rounded-xl flex items-center gap-2 transition-all duration-200 shadow-lg shadow-blue-500/20 w-fit"
              >
                <Download size={18} />
                Download Sample Template
              </button>
            </div>

            {/* REQUIRED COLUMNS */}
            <div className="mt-5">
              <p className="text-xs text-gray-400 mb-3">Required Columns:</p>
              <div className="flex flex-wrap gap-2">
                {requiredHeaders.map((header, index) => (
                  <span
                    key={index}
                    className="bg-blue-500/10 border border-blue-500/20 rounded-lg px-3 py-1.5 text-sm font-mono text-blue-300"
                  >
                    {header}
                  </span>
                ))}
              </div>
              <p className="text-xs text-gray-500 mt-3">
                <span className="text-blue-400">Optional:</span> {optionalHeaders.join(", ")}
              </p>
            </div>
          </div>
        </div>

        {/* UPLOAD SECTION */}
        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl overflow-hidden">
          <div className="p-6">
            {/* DROPZONE */}
            <div
              className={`border-2 border-dashed rounded-2xl p-10 flex flex-col items-center justify-center text-center cursor-pointer transition-all duration-200 ${dragActive
                ? "border-blue-400 bg-blue-500/10"
                : "border-white/20 hover:border-blue-400/50 hover:bg-white/5"
                }`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              onClick={() => document.getElementById("fileInput").click()}
            >
              <div className="p-4 rounded-full bg-blue-500/20 mb-4">
                <UploadCloud size={48} className="text-blue-400" />
              </div>
              <h2 className="text-lg font-semibold text-white mb-2">
                Upload Excel File
              </h2>
              <p className="text-gray-400 text-sm mb-1">
                Drag & drop or click to browse
              </p>
              <p className="text-gray-500 text-xs">
                Supports .xlsx, .xls (Max 1000 rows)
              </p>
              <input
                id="fileInput"
                type="file"
                accept=".xlsx,.xls"
                onChange={handleFileUpload}
                className="hidden"
              />
            </div>

            {/* FILE INFO */}
            {fileName && (
              <div className="mt-6 border border-white/10 rounded-xl p-4 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 bg-white/5">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-green-500/20">
                    <FileSpreadsheet size={28} className="text-green-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-white">{fileName}</h3>
                    <p className="text-sm text-gray-400">
                      {rowCount} records • {errors.length > 0 ? "Contains errors" : "Ready for import"}
                    </p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => setShowPreview(!showPreview)}
                    className="bg-white/10 hover:bg-white/20 text-gray-300 px-4 py-2 rounded-xl flex items-center gap-2 transition-all duration-200"
                  >
                    <Eye size={16} />
                    {showPreview ? "Hide Preview" : "Show Preview"}
                  </button>
                  <button
                    onClick={removeFile}
                    className="bg-red-500/10 hover:bg-red-500/20 text-red-400 px-4 py-2 rounded-xl flex items-center gap-2 transition-all duration-200"
                  >
                    <Trash2 size={16} />
                    Remove
                  </button>
                </div>
              </div>
            )}

            {/* SUCCESS MESSAGE */}
            {successMessage && (
              <div className="mt-6 bg-green-500/10 border border-green-500/20 rounded-xl p-4 flex items-start gap-3">
                <CheckCircle2 size={20} className="text-green-400 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-green-400">Validation Successful</h3>
                  <p className="text-sm text-green-300/80 mt-1">{successMessage}</p>
                </div>
              </div>
            )}

            {/* WARNINGS */}
            {warnings.length > 0 && (
              <div className="mt-6 bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-4">
                <div className="flex items-center gap-3 mb-3">
                  <AlertTriangle size={18} className="text-yellow-400" />
                  <h2 className="font-semibold text-yellow-400">Warnings</h2>
                </div>
                <ul className="space-y-1 text-sm text-yellow-300/80">
                  {warnings.map((warning, index) => (
                    <li key={index}>• {warning}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* ERRORS */}
            {errors.length > 0 && (
              <div className="mt-6 bg-red-500/10 border border-red-500/20 rounded-xl p-4">
                <div className="flex items-center gap-3 mb-3">
                  <AlertCircle size={18} className="text-red-400" />
                  <h2 className="font-semibold text-red-400">Validation Errors</h2>
                </div>
                <ul className="space-y-1 text-sm text-red-300/80 max-h-48 overflow-y-auto">
                  {errors.map((error, index) => (
                    <li key={index}>• {error}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* PREVIEW STATS */}
            {excelData.length > 0 && previewStats && (
              <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-white/5 border border-white/10 rounded-xl p-3 flex items-center justify-between">
                  <div>
                    <p className="text-xs text-gray-400">Total Records</p>
                    <p className="text-xl font-bold text-white">{excelData.length}</p>
                  </div>
                  <Database size={20} className="text-blue-400" />
                </div>
                <div className="bg-white/5 border border-white/10 rounded-xl p-3 flex items-center justify-between">
                  <div>
                    <p className="text-xs text-gray-400">Total Quantity</p>
                    <p className="text-xl font-bold text-white">{previewStats.totalQuantity}</p>
                  </div>
                  <TrendingUp size={20} className="text-green-400" />
                </div>
                <div className="bg-white/5 border border-white/10 rounded-xl p-3 flex items-center justify-between">
                  <div>
                    <p className="text-xs text-gray-400">Categories</p>
                    <p className="text-xl font-bold text-white">{previewStats.categories}</p>
                  </div>
                  <Table size={20} className="text-indigo-400" />
                </div>
              </div>
            )}

            {/* PREVIEW TABLE */}
            {excelData.length > 0 && showPreview && (
              <div className="mt-8">
                <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
                  <div>
                    <h2 className="text-lg font-semibold text-white">Data Preview</h2>
                    <p className="text-sm text-gray-400">
                      First 10 rows of {excelData.length} records
                    </p>
                  </div>

                  <button
                    onClick={handleUpload}
                    disabled={isUploading}
                    className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white px-6 py-2.5 rounded-xl flex items-center gap-2 transition-all duration-200 shadow-lg shadow-blue-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isUploading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Uploading...
                      </>
                    ) : (
                      <>
                        <UploadCloud size={18} />
                        Upload to Inventory
                      </>
                    )}
                  </button>
                </div>

                <div className="overflow-x-auto border border-white/10 rounded-xl">
                  <table className="w-full min-w-[1200px]">
                    <thead className="bg-white/10 border-b border-white/10">
                      <tr>
                        <th className="text-left p-3 text-xs font-semibold text-gray-300">#</th>
                        {requiredHeaders.map((header, index) => (
                          <th key={index} className="text-left p-3 text-xs font-semibold text-gray-300">
                            {header}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {excelData.slice(0, 10).map((row, index) => (
                        <tr key={index} className="border-b border-white/10 hover:bg-white/5 transition-colors">
                          <td className="p-3 text-sm text-gray-400">{index + 1}</td>
                          {requiredHeaders.map((header, idx) => (
                            <td key={idx} className="p-3 text-sm text-gray-300">
                              {row[header] || <span className="text-gray-500">—</span>}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {excelData.length > 10 && (
                    <div className="p-3 text-center border-t border-white/10">
                      <p className="text-sm text-gray-400">
                        + {excelData.length - 10} more records
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* IMPORTANT INSTRUCTIONS */}
        <div className="mt-6 bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
          <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <AlertCircle size={18} className="text-blue-400" />
            Important Instructions
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="border border-white/10 rounded-xl p-4 bg-white/5">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-1.5 h-1.5 bg-blue-400 rounded-full"></div>
                <span className="text-sm font-medium text-gray-300">Column Names</span>
              </div>
              <p className="text-sm text-gray-400">Do not rename or modify required column headers</p>
            </div>

            <div className="border border-white/10 rounded-xl p-4 bg-white/5">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-1.5 h-1.5 bg-blue-400 rounded-full"></div>
                <span className="text-sm font-medium text-gray-300">Date Format</span>
              </div>
              <p className="text-sm text-gray-400">Expiry dates must be future dates (YYYY-MM-DD format)</p>
            </div>

            <div className="border border-white/10 rounded-xl p-4 bg-white/5">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-1.5 h-1.5 bg-blue-400 rounded-full"></div>
                <span className="text-sm font-medium text-gray-300">Numeric Values</span>
              </div>
              <p className="text-sm text-gray-400">Quantity and prices must be valid numbers</p>
            </div>

            <div className="border border-white/10 rounded-xl p-4 bg-white/5">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-1.5 h-1.5 bg-blue-400 rounded-full"></div>
                <span className="text-sm font-medium text-gray-300">Batch Numbers</span>
              </div>
              <p className="text-sm text-gray-400">Duplicate batch numbers will be flagged for review</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UploadExcel;