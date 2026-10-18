import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import Pagination from "../../components/Pagination";
import {
  Package,
  Search,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  ArrowLeft,
  Clock3,
  Box,
  IndianRupee,
  XCircle,
  Layers,
  ChevronDown,
  CheckCircle2,
  ArrowRight,
  Filter,
  Download,
} from "lucide-react";
import API from "../../utils/api";
import DashboardSkeleton from "../../components/DashboardSkeleton";
import { exportToExcel } from "../../utils/excelExport";

const Stock = () => {
  const [medicines, setMedicines] = useState([]);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchMedicine, setSearchMedicine] = useState("");
  const [searchLog, setSearchLog] = useState("");
  const [movementType, setMovementType] = useState("All");

  const [currentPageMedicines, setCurrentPageMedicines] = useState(1);
  const [currentPageLogs, setCurrentPageLogs] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [medicinesRes, logsRes] = await Promise.all([
          API.get("/medicines"),
          API.get("/inventory"),
        ]);

        if (medicinesRes.data?.success) {
          setMedicines(medicinesRes.data.data);
        }

        if (logsRes.data?.success) {
          setLogs(logsRes.data.data);
        }
      } catch (error) {
        console.error("Error loading stock data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const formatCleanDate = (dateStr) => {
    if (!dateStr) return "-";
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    const months = [
      "Jan", "Feb", "Mar", "Apr", "May", "Jun",
      "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
    ];
    const day = String(d.getDate()).padStart(2, "0");
    const month = months[d.getMonth()];
    const year = d.getFullYear();
    return `${day} ${month} ${year}`;
  };

  const formatCleanTime = (dateStr) => {
    if (!dateStr) return "";
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return "";
    return d.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  const getExpiryStatus = (expiryDate) => {
    if (!expiryDate) {
      return {
        label: "N/A",
        color: "bg-slate-50 text-slate-500 border-slate-200",
      };
    }
    const today = new Date();
    const expiry = new Date(expiryDate);
    const diffTime = expiry - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      return {
        label: "Expired",
        color: "bg-rose-50 text-rose-600 border-rose-200",
      };
    }
    if (diffDays <= 30) {
      return {
        label: "Critical",
        color: "bg-amber-50 text-amber-600 border-amber-200",
      };
    }
    if (diffDays <= 90) {
      return {
        label: "Warning",
        color: "bg-yellow-50 text-yellow-700 border-yellow-200",
      };
    }
    return {
      label: "Safe",
      color: "bg-emerald-50 text-emerald-600 border-emerald-200",
    };
  };

  const getStockStatus = (stock, minStock) => {
    const s = Number(stock || 0);
    const min = Number(minStock || 0);
    if (s === 0) {
      return {
        label: "Out of Stock",
        color: "text-rose-600",
        badgeBg: "bg-rose-50 text-rose-600 border-rose-200",
        icon: <XCircle size={14} className="text-rose-500 shrink-0" />,
      };
    }
    if (s <= min) {
      return {
        label: "Low Stock",
        color: "text-amber-600",
        badgeBg: "bg-amber-50 text-amber-600 border-amber-200",
        icon: <AlertTriangle size={14} className="text-amber-500 shrink-0" />,
      };
    }
    return {
      label: "In Stock",
      color: "text-emerald-600",
      badgeBg: "bg-emerald-50 text-emerald-600 border-emerald-200",
      icon: <Package size={14} className="text-emerald-500 shrink-0" />,
    };
  };

  const filteredMedicines = useMemo(() => {
    return medicines.filter((medicine) => {
      const term = searchMedicine.toLowerCase();
      return (
        medicine.medicine_name?.toLowerCase().includes(term) ||
        medicine.batch_number?.toLowerCase().includes(term) ||
        medicine.category?.toLowerCase().includes(term)
      );
    });
  }, [medicines, searchMedicine]);

  const filteredLogs = useMemo(() => {
    return logs.filter((log) => {
      if (movementType !== "All" && log.movement_type !== movementType) {
        return false;
      }
      if (!searchLog) return true;
      const term = searchLog.toLowerCase();
      return (
        log.medicine_name?.toLowerCase().includes(term) ||
        String(log.medicine_id).includes(term) ||
        log.batch_number?.toLowerCase().includes(term) ||
        log.remarks?.toLowerCase().includes(term)
      );
    });
  }, [logs, movementType, searchLog]);

  const stats = useMemo(() => {
    const total = medicines.length;
    const outOfStock = medicines.filter(
      (item) => Number(item.quantity) === 0
    ).length;
    const lowStock = medicines.filter(
      (item) =>
        Number(item.quantity) > 0 &&
        Number(item.quantity) <= Number(item.min_stock || 0)
    ).length;
    const totalValue = medicines.reduce(
      (sum, item) =>
        sum + Number(item.selling_price || 0) * Number(item.quantity || 0),
      0
    );

    return { total, outOfStock, lowStock, totalValue };
  }, [medicines]);

  const paginatedMedicines = useMemo(() => {
    const startIndex = (currentPageMedicines - 1) * itemsPerPage;
    return filteredMedicines.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredMedicines, currentPageMedicines, itemsPerPage]);

  const totalPagesMedicines = Math.ceil(filteredMedicines.length / itemsPerPage);

  const paginatedLogs = useMemo(() => {
    const startIndex = (currentPageLogs - 1) * itemsPerPage;
    return filteredLogs.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredLogs, currentPageLogs, itemsPerPage]);

  const totalPagesLogs = Math.ceil(filteredLogs.length / itemsPerPage);

  const handleExportStockExcel = () => {
    exportToExcel({
      filename: "Medicine_Inventory_Stock_Report",
      sheetName: "Stock_Overview",
      data: filteredMedicines,
      columns: [
        { header: "Medicine Name", key: "medicine_name" },
        { header: "Category", key: "category", format: (v) => v || "General" },
        { header: "Batch Number", key: "batch_number", format: (v) => v || "-" },
        { header: "Current Stock", key: "quantity", format: (v) => Number(v || 0) },
        { header: "Min Stock Alert", key: "min_stock", format: (v) => Number(v || 10) },
        { header: "Price (₹)", key: "price", format: (v) => Number(v || 0).toFixed(2) },
        { header: "GST (%)", key: "gst_percentage", format: (v) => Number(v || 0) },
        { header: "Expiry Date", key: "expiry_date", format: (v) => v || "N/A" },
        { header: "Supplier Name", key: "supplier_name", format: (v) => v || "Not Assigned" },
        {
          header: "Stock Status",
          key: "quantity",
          format: (v, r) => {
            const s = Number(v || 0);
            const m = Number(r.min_stock || 10);
            return s === 0 ? "Out of Stock" : s <= m ? "Low Stock" : "In Stock";
          },
        },
      ],
      summaryTotals: {
        medicine_name: "TOTAL ITEMS",
        quantity: filteredMedicines.reduce((sum, item) => sum + Number(item.quantity || 0), 0),
      },
    });
  };

  if (loading) {
    return <DashboardSkeleton />;
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-[1600px] mx-auto space-y-6">
      {/* 1. HEADER SECTION */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
              <span>Stock Overview</span>
            </h1>
            <p className="text-slate-500 text-xs sm:text-sm mt-0.5">
              Real-time medicine stock levels driven by billing POS sales and inventory movement.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            type="button"
            onClick={handleExportStockExcel}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-semibold shadow-xs transition-colors"
          >
            <Download size={16} />
            <span>Export to Excel</span>
          </button>
          <Link
            to="/inventory"
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 rounded-xl text-sm font-semibold shadow-xs transition-colors"
          >
            <ArrowLeft size={16} />
            <span>Back to Inventory</span>
          </Link>
          <Link
            to="/inventory/stock-in"
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-semibold shadow-xs transition-colors"
          >
            <TrendingUp size={16} />
            <span>Stock In</span>
          </Link>
        </div>
      </div>

      {/* 2. STAT CARDS ROW */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Medicines */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-xs hover:shadow-sm transition-all flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                <Package size={20} />
              </div>
              <span className="text-sm font-medium text-slate-500">
                Total Medicines
              </span>
            </div>
          </div>
          <div className="mt-4">
            <h2 className="text-2xl lg:text-[28px] font-bold text-slate-900 tracking-tight">
              {stats.total.toLocaleString()}
            </h2>
          </div>
          <div className="flex items-center gap-2 mt-3 pt-1">
            <span className="inline-flex items-center gap-0.5 text-xs font-semibold px-2 py-0.5 rounded-full bg-blue-50 text-blue-600">
              Active in stock
            </span>
          </div>
        </div>

        {/* Low Stock */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-xs hover:shadow-sm transition-all flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-500 flex items-center justify-center font-bold">
                <AlertTriangle size={20} />
              </div>
              <span className="text-sm font-medium text-slate-500">
                Low Stock
              </span>
            </div>
          </div>
          <div className="mt-4">
            <h2 className="text-2xl lg:text-[28px] font-bold text-slate-900 tracking-tight">
              {stats.lowStock}
            </h2>
          </div>
          <div className="flex items-center gap-2 mt-3 pt-1">
            <span className="inline-flex items-center gap-0.5 text-xs font-semibold px-2 py-0.5 rounded-full bg-amber-50 text-amber-600">
              Below threshold
            </span>
          </div>
        </div>

        {/* Out Of Stock */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-xs hover:shadow-sm transition-all flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-500 flex items-center justify-center font-bold">
                <XCircle size={20} />
              </div>
              <span className="text-sm font-medium text-slate-500">
                Out of Stock
              </span>
            </div>
          </div>
          <div className="mt-4">
            <h2 className="text-2xl lg:text-[28px] font-bold text-slate-900 tracking-tight">
              {stats.outOfStock}
            </h2>
          </div>
          <div className="flex items-center gap-2 mt-3 pt-1">
            <span className="inline-flex items-center gap-0.5 text-xs font-semibold px-2 py-0.5 rounded-full bg-rose-50 text-rose-600">
              Critical restocking
            </span>
          </div>
        </div>

        {/* Inventory Value */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-xs hover:shadow-sm transition-all flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-500 flex items-center justify-center font-bold">
                <IndianRupee size={20} />
              </div>
              <span className="text-sm font-medium text-slate-500">
                Inventory Value
              </span>
            </div>
          </div>
          <div className="mt-4">
            <h2 className="text-2xl lg:text-[28px] font-bold text-slate-900 tracking-tight truncate">
              ₹
              {Number(stats.totalValue).toLocaleString("en-IN", {
                maximumFractionDigits: 0,
              })}
            </h2>
          </div>
          <div className="flex items-center gap-2 mt-3 pt-1">
            <span className="inline-flex items-center gap-0.5 text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-600">
              Current valuation
            </span>
          </div>
        </div>
      </div>

      {/* 3. MIDDLE SECTION: Medicine Stock Levels & Billing Stock Out */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
        {/* Medicine Stock Table */}
        <div className="xl:col-span-8 bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden flex flex-col">
          <div className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                <Layers size={18} />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-800 leading-tight">
                  Medicine Stock Levels
                </h3>
                <p className="text-xs text-slate-400">
                  Showing {paginatedMedicines.length} of {filteredMedicines.length} items
                </p>
              </div>
            </div>

            {/* Direct Search Bar */}
            <div className="relative w-full sm:w-64">
              <Search
                size={16}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                type="text"
                placeholder="Search stock..."
                value={searchMedicine}
                onChange={(e) => {
                  setSearchMedicine(e.target.value);
                  setCurrentPageMedicines(1);
                }}
                className="w-full bg-slate-50/80 border border-slate-200 rounded-xl pl-9 pr-3.5 py-2 text-xs text-slate-800 placeholder-slate-400 outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              />
              {searchMedicine && (
                <button
                  onClick={() => setSearchMedicine("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs"
                >
                  ✕
                </button>
              )}
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 text-[11px] font-semibold text-slate-400 uppercase tracking-wider bg-slate-50/60">
                  <th className="py-3 px-5 whitespace-nowrap">Medicine</th>
                  <th className="py-3 px-4 whitespace-nowrap">Stock Level</th>
                  <th className="py-3 px-4 whitespace-nowrap">Min Stock</th>
                  <th className="py-3 px-4 whitespace-nowrap">Selling Price</th>
                  <th className="py-3 px-4 whitespace-nowrap">Expiry Date</th>
                  <th className="py-3 px-5 text-right whitespace-nowrap">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {paginatedMedicines.map((medicine) => {
                  const initial = (medicine.medicine_name || medicine.name || "M")
                    .charAt(0)
                    .toUpperCase();
                  const expiryStatus = getExpiryStatus(
                    medicine.expiry_date || medicine.expiryDate || medicine.expiry
                  );
                  const stockStatus = getStockStatus(
                    medicine.quantity,
                    medicine.min_stock
                  );

                  return (
                    <tr
                      key={medicine.medicine_id || medicine.id}
                      className="hover:bg-slate-50/80 transition-colors"
                    >
                      <td className="py-3.5 px-5 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-xs shrink-0 shadow-2xs">
                            {initial}
                          </div>
                          <div>
                            <h4 className="font-semibold text-slate-800 text-sm leading-tight">
                              {medicine.medicine_name || medicine.name}
                            </h4>
                            <p className="text-[11px] text-slate-400 mt-0.5">
                              {medicine.category || "General"} {medicine.batch_number ? `• ${medicine.batch_number}` : ""}
                            </p>
                            {medicine.supplier_name && (
                              <p className="text-[10px] text-blue-600 font-medium mt-0.5">
                                Supplier: {medicine.supplier_name}
                              </p>
                            )}
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          {stockStatus.icon}
                          <span
                            className={`font-bold text-sm ${stockStatus.color}`}
                          >
                            {medicine.quantity}
                          </span>
                        </div>
                      </td>

                      <td className="py-3.5 px-4 whitespace-nowrap text-slate-500 font-medium">
                        {medicine.min_stock ?? "—"}
                      </td>

                      <td className="py-3.5 px-4 whitespace-nowrap font-bold text-slate-900 text-sm">
                        ₹
                        {Number(
                          medicine.selling_price || medicine.price || 0
                        ).toLocaleString("en-IN", {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </td>

                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <p className="font-medium text-slate-700">
                          {formatCleanDate(
                            medicine.expiry_date || medicine.expiryDate || medicine.expiry
                          )}
                        </p>
                        <span
                          className={`inline-block mt-1 px-2 py-0.5 rounded-full text-[10px] font-semibold border ${expiryStatus.color}`}
                        >
                          {expiryStatus.label}
                        </span>
                      </td>

                      <td className="py-3.5 px-5 text-right whitespace-nowrap">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold border ${stockStatus.badgeBg}`}
                        >
                          {stockStatus.label}
                        </span>
                      </td>
                    </tr>
                  );
                })}

                {filteredMedicines.length === 0 && (
                  <tr>
                    <td className="py-12 px-4 text-center text-slate-400" colSpan={6}>
                      <Package size={28} className="mx-auto text-slate-300 mb-2" />
                      <p className="text-sm font-semibold text-slate-600">No medicines found</p>
                      <p className="text-xs text-slate-400 mt-0.5">
                        Try modifying your search query.
                      </p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <Pagination
            currentPage={currentPageMedicines}
            totalPages={totalPagesMedicines}
            totalItems={filteredMedicines.length}
            itemsPerPage={itemsPerPage}
            onPageChange={setCurrentPageMedicines}
          />
        </div>

        {/* Billing Stock Out Tracker */}
        <div className="xl:col-span-4 bg-white rounded-2xl border border-slate-200/90 shadow-xs p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
              <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
                <TrendingDown size={18} />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-800 leading-tight">
                  Billing Stock Out
                </h3>
                <p className="text-xs text-slate-400">
                  Auto-deducted POS billing activity
                </p>
              </div>
            </div>

            <div className="mt-4 space-y-3">
              {logs
                .filter((log) => log.movement_type === "STOCK_OUT")
                .slice(0, 5)
                .map((log) => (
                  <div
                    key={log.inventory_log_id}
                    className="p-3.5 rounded-xl bg-slate-50/80 border border-slate-100 hover:border-slate-200 transition-all flex items-center justify-between gap-3"
                  >
                    <div className="min-w-0">
                      <h4 className="text-xs font-bold text-slate-800 truncate">
                        {log.medicine_name}
                      </h4>
                      <p className="text-[11px] text-slate-400 mt-0.5 truncate">
                        {log.remarks || "Dispensed via billing POS"}
                      </p>
                      <p className="text-[10px] text-slate-400 mt-1">
                        {formatCleanDate(log.created_at || log.createdAt || log.date)} •{" "}
                        {formatCleanTime(log.created_at || log.createdAt || log.date)}
                      </p>
                    </div>

                    <div className="shrink-0 text-right">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold bg-rose-50 text-rose-600 border border-rose-200">
                        -{log.quantity}
                      </span>
                    </div>
                  </div>
                ))}

              {logs.filter((log) => log.movement_type === "STOCK_OUT").length === 0 && (
                <div className="text-center py-10 px-4 text-slate-400">
                  <Box size={24} className="mx-auto text-slate-300 mb-2" />
                  <p className="text-xs text-slate-500 font-medium">
                    No billing stock-out records found yet.
                  </p>
                </div>
              )}
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Automated sync</span>
            <span className="font-semibold text-emerald-600 flex items-center gap-1">
              <CheckCircle2 size={13} />
              Active
            </span>
          </div>
        </div>
      </div>

      {/* 4. INVENTORY MOVEMENT LOG TABLE */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
        <div className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Clock3 size={18} />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-800 leading-tight">
                Inventory Movement Log
              </h3>
              <p className="text-xs text-slate-400">
                Audit trail of stock in additions and POS billing deductions
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Search Input */}
            <div className="relative">
              <Search
                size={16}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                type="text"
                value={searchLog}
                onChange={(e) => {
                  setSearchLog(e.target.value);
                  setCurrentPageLogs(1);
                }}
                placeholder="Search log history..."
                className="bg-slate-50/80 border border-slate-200 rounded-xl pl-9 pr-3.5 py-2 text-xs text-slate-800 placeholder-slate-400 outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all w-52 sm:w-64"
              />
            </div>

            {/* Movement Type Filter */}
            <div className="relative">
              <select
                value={movementType}
                onChange={(e) => {
                  setMovementType(e.target.value);
                  setCurrentPageLogs(1);
                }}
                className="bg-slate-50/80 border border-slate-200 rounded-xl pl-3.5 pr-8 py-2 text-xs font-medium text-slate-700 outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer appearance-none transition-all"
              >
                <option value="All">All Movements</option>
                <option value="STOCK_IN">Stock In (+)</option>
                <option value="STOCK_OUT">Stock Out (-)</option>
              </select>
              <ChevronDown
                size={14}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
              />
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 text-[11px] font-semibold text-slate-400 uppercase tracking-wider bg-slate-50/60">
                <th className="py-3 px-5 whitespace-nowrap">Timestamp</th>
                <th className="py-3 px-4 whitespace-nowrap">Medicine</th>
                <th className="py-3 px-4 whitespace-nowrap">Movement</th>
                <th className="py-3 px-4 whitespace-nowrap">Quantity</th>
                <th className="py-3 px-4 whitespace-nowrap">Stock Transition</th>
                <th className="py-3 px-5 text-right whitespace-nowrap">Remarks</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {paginatedLogs.map((log) => {
                const isStockIn = log.movement_type === "STOCK_IN";

                return (
                  <tr
                    key={log.inventory_log_id}
                    className="hover:bg-slate-50/80 transition-colors"
                  >
                    <td className="py-3.5 px-5 whitespace-nowrap">
                      <p className="font-semibold text-slate-800">
                        {formatCleanDate(
                          log.created_at || log.createdAt || log.date
                        )}
                      </p>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        {formatCleanTime(
                          log.created_at || log.createdAt || log.date
                        )}
                      </p>
                    </td>

                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span className="font-semibold text-slate-800">
                        {log.medicine_name}
                      </span>
                      {log.batch_number && (
                        <p className="text-[10px] text-slate-400 font-mono mt-0.5">
                          {log.batch_number}
                        </p>
                      )}
                    </td>

                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold border ${isStockIn
                            ? "bg-emerald-50 text-emerald-600 border-emerald-200"
                            : "bg-rose-50 text-rose-600 border-rose-200"
                          }`}
                      >
                        {isStockIn ? (
                          <TrendingUp size={12} />
                        ) : (
                          <TrendingDown size={12} />
                        )}
                        <span>{isStockIn ? "Stock In" : "Stock Out"}</span>
                      </span>
                    </td>

                    <td className="py-3.5 px-4 whitespace-nowrap font-bold text-slate-900 text-sm">
                      <span className={isStockIn ? "text-emerald-600" : "text-rose-600"}>
                        {isStockIn ? `+${log.quantity}` : `-${log.quantity}`}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 whitespace-nowrap text-slate-600">
                      <div className="flex items-center gap-1.5 font-medium">
                        <span className="text-slate-400">{log.previous_stock ?? "—"}</span>
                        <ArrowRight size={12} className="text-slate-300" />
                        <span className="font-bold text-slate-800">
                          {log.current_stock ?? "—"}
                        </span>
                      </div>
                    </td>

                    <td className="py-3.5 px-5 text-right whitespace-nowrap text-slate-500">
                      <span className="bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-100 text-[11px]">
                        {log.remarks || "Standard billing/inventory operation"}
                      </span>
                    </td>
                  </tr>
                );
              })}

              {filteredLogs.length === 0 && (
                <tr>
                  <td className="py-12 px-4 text-center text-slate-400" colSpan={6}>
                    <Clock3 size={28} className="mx-auto text-slate-300 mb-2" />
                    <p className="text-sm font-semibold text-slate-600">
                      No inventory movements found
                    </p>
                    <p className="text-xs text-slate-400 mt-0.5">
                      No records matched your movement type or search filter.
                    </p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <Pagination
          currentPage={currentPageLogs}
          totalPages={totalPagesLogs}
          totalItems={filteredLogs.length}
          itemsPerPage={itemsPerPage}
          onPageChange={setCurrentPageLogs}
        />
      </div>
    </div>
  );
};

export default Stock;
