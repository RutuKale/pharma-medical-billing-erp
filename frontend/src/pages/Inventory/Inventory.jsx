import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Pagination from "../../components/Pagination";
import {
  Search,
  Plus,
  AlertTriangle,
  Package,
  Clock3,
  XCircle,
  Trash2,
  SquarePen,
  ChevronDown,
  ChevronUp,
  TrendingUp,
  TrendingDown,
  Printer,
  Download,
  Menu,
  X,
  IndianRupee,
  Layers,
  ArrowUpDown,
  CheckCircle2,
} from "lucide-react";
import Swal from "sweetalert2";
import apiClient from "../../utils/apiClient";
import DashboardSkeleton from "../../components/DashboardSkeleton";

const API_URL = "/medicines";
const INVENTORY_API = "/inventory";

const Inventory = () => {
  const [medicinesData, setMedicinesData] = useState([]);
  const [loading, setLoading] = useState(true);

  // Stock In / Out Modal State
  const [isStockModalOpen, setIsStockModalOpen] = useState(false);
  const [stockType, setStockType] = useState("IN"); // "IN" or "OUT"
  const [stockQuantity, setStockQuantity] = useState(1);
  const [stockRemarks, setStockRemarks] = useState("");
  const [stockMedicineId, setStockMedicineId] = useState(null);
  const [stockMedicineName, setStockMedicineName] = useState("");

  // Filters & Sorting
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [sortBy, setSortBy] = useState("medicine_name");
  const [sortOrder, setSortOrder] = useState("asc");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [selectedIds, setSelectedIds] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const navigate = useNavigate();

  const categories = useMemo(() => {
    return [
      "All",
      ...new Set(
        medicinesData.map((medicine) => medicine.category).filter(Boolean)
      ),
    ];
  }, [medicinesData]);

  const fetchMedicines = async () => {
    setSelectedIds([]);
    try {
      setLoading(true);
      const response = await apiClient.get(API_URL);
      if (response.data.success) {
        setMedicinesData(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching medicines:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMedicines();
  }, []);

  const handleEdit = (medicine) => {
    navigate("/inventory/add-medicine", {
      state: {
        editMode: true,
        medicineData: medicine,
      },
    });
  };

  const openStockModal = (medicine, type) => {
    setStockMedicineId(medicine.medicine_id);
    setStockMedicineName(medicine.medicine_name || "Medicine");
    setStockType(type === "in" ? "IN" : "OUT");
    setStockQuantity(1);
    setStockRemarks("");
    setIsStockModalOpen(true);
  };

  const closeStockModal = () => {
    setIsStockModalOpen(false);
    setStockMedicineId(null);
    setStockMedicineName("");
  };

  const submitStockChange = async () => {
    const quantity = Number(stockQuantity) || 0;
    if (quantity <= 0) {
      return Swal.fire({
        icon: "warning",
        title: "Invalid Quantity",
        text: "Quantity must be greater than 0",
        confirmButtonColor: "#2563eb",
      });
    }

    try {
      const endpoint = stockType === "IN" ? "stock-in" : "stock-out";
      const response = await apiClient.post(`${INVENTORY_API}/${endpoint}`, {
        medicine_id: stockMedicineId,
        quantity,
        remarks: stockRemarks,
      });

      if (response.data.success) {
        Swal.fire({
          icon: "success",
          title: `Stock ${stockType === "IN" ? "Added" : "Deducted"}`,
          text: response.data.message || "Operation successful",
          confirmButtonColor: "#10b981",
        });
        closeStockModal();
        fetchMedicines();
      }
    } catch (error) {
      console.error("Stock change failed", error);
      Swal.fire({
        icon: "error",
        title: "Operation Failed",
        text: error.response?.data?.message || "Unable to update stock",
        confirmButtonColor: "#ef4444",
      });
    }
  };

  const handleDelete = async (medicineId) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to recover this medicine!",
      icon: "warning",
      iconColor: "#ef4444",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#64748b",
      confirmButtonText: "Yes, delete it",
      cancelButtonText: "Cancel",
    });

    if (!result.isConfirmed) return;

    try {
      const response = await apiClient.delete(`${API_URL}/${medicineId}`);
      if (response.data.success) {
        Swal.fire({
          title: "Deleted!",
          text: "Medicine deleted successfully.",
          icon: "success",
          confirmButtonColor: "#10b981",
        });
        fetchMedicines();
      }
    } catch (error) {
      Swal.fire({
        title: "Error!",
        text: "Failed to delete medicine.",
        icon: "error",
        confirmButtonColor: "#ef4444",
      });
    }
  };

  const handleDeleteSelected = async () => {
    if (selectedIds.length === 0) return;
    const result = await Swal.fire({
      title: `Delete ${selectedIds.length} medicine(s)?`,
      text: "Selected medicines will be permanently deleted.",
      icon: "warning",
      iconColor: "#ef4444",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#64748b",
      confirmButtonText: `Yes, delete (${selectedIds.length})`,
      cancelButtonText: "Cancel",
    });

    if (!result.isConfirmed) return;

    try {
      await Promise.all(
        selectedIds.map((id) => apiClient.delete(`${API_URL}/${id}`))
      );
      Swal.fire({
        icon: "success",
        title: "Deleted!",
        text: `${selectedIds.length} medicines removed.`,
        confirmButtonColor: "#10b981",
      });
      fetchMedicines();
    } catch (error) {
      console.error(error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Failed to delete selected medicines",
        confirmButtonColor: "#ef4444",
      });
    }
  };

  const handleDeleteAll = async () => {
    const result = await Swal.fire({
      title: "Delete ALL medicines?",
      text: "This action cannot be undone. All inventory records will be cleared.",
      icon: "warning",
      iconColor: "#ef4444",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#64748b",
      confirmButtonText: "Yes, Delete Everything",
      cancelButtonText: "Cancel",
    });
    if (!result.isConfirmed) return;
    try {
      await Promise.all(
        medicinesData.map((m) =>
          apiClient.delete(`${API_URL}/${m.medicine_id}`)
        )
      );
      Swal.fire({
        title: "Deleted!",
        text: "All medicines deleted successfully.",
        icon: "success",
        confirmButtonColor: "#10b981",
      });
      fetchMedicines();
    } catch (error) {
      Swal.fire({
        title: "Error!",
        text: "Failed to delete all medicines.",
        icon: "error",
        confirmButtonColor: "#ef4444",
      });
    }
  };

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
    if (stock === 0) {
      return {
        label: "Out of Stock",
        color: "text-rose-600",
        badgeBg: "bg-rose-50 text-rose-600 border-rose-200",
        icon: <XCircle size={14} className="text-rose-500 shrink-0" />,
      };
    }
    if (stock <= minStock) {
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

  const handleExportCSV = () => {
    if (!filteredMedicines.length) return;
    const headers = [
      "Medicine Name",
      "Brand",
      "Salt",
      "Manufacturer",
      "Category",
      "Stock",
      "Min Stock",
      "Price",
      "Expiry Date",
      "Batch Number",
    ];
    const rows = filteredMedicines.map((m) => [
      `"${(m.medicine_name || "").replace(/"/g, '""')}"`,
      `"${(m.brand_name || "").replace(/"/g, '""')}"`,
      `"${(m.salt_name || "").replace(/"/g, '""')}"`,
      `"${(m.manufacturer || "").replace(/"/g, '""')}"`,
      `"${(m.category || "").replace(/"/g, '""')}"`,
      m.quantity || 0,
      m.min_stock || 0,
      m.selling_price || 0,
      `"${m.expiry_date || ""}"`,
      `"${(m.batch_number || "").replace(/"/g, '""')}"`,
    ]);
    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute(
      "download",
      `inventory_catalog_${new Date().toISOString().split("T")[0]}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrint = () => {
    window.print();
  };

  // Filtered and Sorted Medicines
  const filteredMedicines = useMemo(() => {
    let filtered = medicinesData.filter((medicine) => {
      const q = search.toLowerCase();
      const matchesSearch =
        medicine.medicine_name?.toLowerCase().includes(q) ||
        medicine.salt_name?.toLowerCase().includes(q) ||
        medicine.brand_name?.toLowerCase().includes(q) ||
        medicine.manufacturer?.toLowerCase().includes(q);

      const matchesCategory =
        category === "All" || medicine.category === category;

      return matchesSearch && matchesCategory;
    });

    filtered.sort((a, b) => {
      let aVal = a[sortBy];
      let bVal = b[sortBy];

      if (sortBy === "selling_price" || sortBy === "quantity") {
        aVal = Number(aVal) || 0;
        bVal = Number(bVal) || 0;
      }

      if (sortBy === "expiry_date") {
        aVal = new Date(aVal || 0);
        bVal = new Date(bVal || 0);
      }

      if (aVal < bVal) return sortOrder === "asc" ? -1 : 1;
      if (aVal > bVal) return sortOrder === "asc" ? 1 : -1;

      return 0;
    });

    return filtered;
  }, [medicinesData, search, category, sortBy, sortOrder]);

  const totalPages =
    itemsPerPage === "All"
      ? 1
      : Math.ceil(filteredMedicines.length / itemsPerPage);

  const paginatedMedicines = useMemo(() => {
    if (itemsPerPage === "All") return filteredMedicines;
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredMedicines.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredMedicines, currentPage, itemsPerPage]);

  // Dynamic Statistics
  const stats = useMemo(() => {
    const today = new Date();
    let expiringSoonCount = 0;

    medicinesData.forEach((m) => {
      if (m.expiry_date) {
        const exp = new Date(m.expiry_date);
        const diffDays = Math.ceil((exp - today) / (1000 * 60 * 60 * 24));
        if (diffDays > 0 && diffDays <= 30) {
          expiringSoonCount++;
        }
      }
    });

    return {
      total: medicinesData.length,
      lowStock: medicinesData.filter(
        (m) => m.quantity <= m.min_stock && m.quantity > 0
      ).length,
      outOfStock: medicinesData.filter((m) => m.quantity === 0).length,
      expiringSoon: expiringSoonCount,
      totalValue: medicinesData.reduce(
        (sum, m) =>
          sum + (Number(m.selling_price) || 0) * (Number(m.quantity) || 0),
        0
      ),
    };
  }, [medicinesData]);

  const handleSort = (column) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(column);
      setSortOrder("asc");
    }
  };

  const SortIcon = ({ column }) => {
    if (sortBy !== column) {
      return <ArrowUpDown size={12} className="inline ml-1 opacity-40" />;
    }
    return sortOrder === "asc" ? (
      <ChevronUp size={13} className="inline ml-1 text-blue-600 font-bold" />
    ) : (
      <ChevronDown size={13} className="inline ml-1 text-blue-600 font-bold" />
    );
  };

  if (loading) {
    return <DashboardSkeleton />;
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-[1600px] mx-auto space-y-6">
      {/* 1. STOCK IN / STOCK OUT MODAL */}
      {isStockModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity"
            onClick={closeStockModal}
          />

          <div className="relative z-10 w-full max-w-md mx-auto">
            <div className="bg-white rounded-2xl p-6 shadow-xl border border-slate-200/90 animate-in fade-in zoom-in-95 duration-150">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2.5">
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                      stockType === "IN"
                        ? "bg-emerald-50 text-emerald-600"
                        : "bg-amber-50 text-amber-600"
                    }`}
                  >
                    {stockType === "IN" ? (
                      <TrendingUp size={18} />
                    ) : (
                      <TrendingDown size={18} />
                    )}
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-800">
                      {stockType === "IN" ? "Stock In" : "Stock Out"}
                    </h3>
                    <p className="text-xs text-slate-400 truncate max-w-[240px]">
                      {stockMedicineName}
                    </p>
                  </div>
                </div>
                <button
                  onClick={closeStockModal}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="mt-4 space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Quantity
                  </label>
                  <input
                    type="number"
                    min={1}
                    step={1}
                    value={stockQuantity}
                    onChange={(e) => setStockQuantity(Number(e.target.value))}
                    className="w-full bg-slate-50/80 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-900 outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Remarks / Reason <span className="text-slate-400 font-normal">(optional)</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Received new shipment or expired disposal"
                    value={stockRemarks}
                    onChange={(e) => setStockRemarks(e.target.value)}
                    className="w-full bg-slate-50/80 border border-slate-200 rounded-xl px-3.5 py-2.5 text-slate-900 placeholder-slate-400 outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm transition-all"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 mt-6 pt-3 border-t border-slate-100">
                <button
                  onClick={closeStockModal}
                  className="px-4 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 text-sm font-semibold transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={submitStockChange}
                  className={`px-4 py-2 rounded-xl text-white text-sm font-semibold shadow-xs transition-colors ${
                    stockType === "IN"
                      ? "bg-emerald-600 hover:bg-emerald-700"
                      : "bg-blue-600 hover:bg-blue-700"
                  }`}
                >
                  Confirm {stockType === "IN" ? "Stock In" : "Stock Out"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2. HEADER SECTION */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <span>Inventory Management</span>
          </h1>
          <p className="text-slate-500 text-xs sm:text-sm mt-1">
            Track medicine stock levels, batch numbers, expiry dates, and catalog pricing.
          </p>
        </div>

        {/* Desktop Action Buttons */}
        <div className="hidden sm:flex items-center gap-2.5">
          <button
            onClick={handleExportCSV}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 rounded-xl text-sm font-semibold shadow-xs transition-colors"
          >
            <Download size={16} className="text-slate-500" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={handlePrint}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 rounded-xl text-sm font-semibold shadow-xs transition-colors"
          >
            <Printer size={16} className="text-slate-500" />
            <span>Print</span>
          </button>

          <Link
            to="/inventory/add-medicine"
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-semibold shadow-xs transition-colors"
          >
            <Plus size={18} strokeWidth={2.5} />
            <span>Add Medicine</span>
          </Link>
        </div>

        {/* Mobile Menu Button */}
        <div className="sm:hidden flex justify-end">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2.5 rounded-xl bg-white border border-slate-200 text-slate-700 shadow-xs"
          >
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile Action Dropdown */}
      {mobileMenuOpen && (
        <div className="sm:hidden p-4 bg-white border border-slate-200/90 rounded-2xl shadow-xs space-y-2.5 animate-in slide-in-from-top-2">
          <Link
            to="/inventory/add-medicine"
            className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-semibold shadow-xs transition-colors"
          >
            <Plus size={18} />
            <span>Add Medicine</span>
          </Link>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={handleExportCSV}
              className="inline-flex items-center justify-center gap-2 px-3 py-2 bg-white border border-slate-200 text-slate-700 rounded-xl text-sm font-semibold shadow-xs"
            >
              <Download size={16} />
              <span>Export</span>
            </button>
            <button
              onClick={handlePrint}
              className="inline-flex items-center justify-center gap-2 px-3 py-2 bg-white border border-slate-200 text-slate-700 rounded-xl text-sm font-semibold shadow-xs"
            >
              <Printer size={16} />
              <span>Print</span>
            </button>
          </div>
        </div>
      )}

      {/* 3. STAT CARDS ROW */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
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
              Active in catalog
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
              Below min level
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
              Needs restocking
            </span>
          </div>
        </div>

        {/* Expiring Soon */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-xs hover:shadow-sm transition-all flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
                <Clock3 size={20} />
              </div>
              <span className="text-sm font-medium text-slate-500">
                Expiring Soon
              </span>
            </div>
          </div>
          <div className="mt-4">
            <h2 className="text-2xl lg:text-[28px] font-bold text-slate-900 tracking-tight">
              {stats.expiringSoon}
            </h2>
          </div>
          <div className="flex items-center gap-2 mt-3 pt-1">
            <span className="inline-flex items-center gap-0.5 text-xs font-semibold px-2 py-0.5 rounded-full bg-purple-50 text-purple-600">
              Within 30 days
            </span>
          </div>
        </div>

        {/* Total Inventory Value */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-xs hover:shadow-sm transition-all flex flex-col justify-between sm:col-span-2 lg:col-span-1">
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
              Total stock valuation
            </span>
          </div>
        </div>
      </div>

      {/* 4. FILTERS & SEARCH CARD */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/90 shadow-xs">
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
          {/* Search Bar - Direct Input as requested */}
          <div className="relative flex-1">
            <Search
              size={18}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              type="text"
              placeholder="Search by medicine name, salt, brand, or manufacturer..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full bg-slate-50/80 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-slate-800 placeholder-slate-400 outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm transition-all"
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs"
              >
                Clear
              </button>
            )}
          </div>

          {/* Category & Per Page Dropdowns */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative">
              <select
                value={category}
                onChange={(e) => {
                  setCategory(e.target.value);
                  setCurrentPage(1);
                }}
                className="bg-slate-50/80 border border-slate-200 rounded-xl pl-3.5 pr-8 py-2.5 text-slate-700 outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer text-sm font-medium appearance-none transition-all"
              >
                {categories.map((cat, index) => (
                  <option key={index} value={cat}>
                    {cat === "All" ? "All Categories" : cat}
                  </option>
                ))}
              </select>
              <ChevronDown
                size={14}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
              />
            </div>

            <div className="relative">
              <select
                value={itemsPerPage}
                onChange={(e) => {
                  setItemsPerPage(
                    e.target.value === "All" ? "All" : Number(e.target.value)
                  );
                  setCurrentPage(1);
                }}
                className="bg-slate-50/80 border border-slate-200 rounded-xl pl-3.5 pr-8 py-2.5 text-slate-700 outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer text-sm font-medium appearance-none transition-all"
              >
                <option value={10}>10 per page</option>
                <option value={20}>20 per page</option>
                <option value={50}>50 per page</option>
                <option value={100}>100 per page</option>
                <option value="All">All Items</option>
              </select>
              <ChevronDown
                size={14}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
              />
            </div>

            {/* Quick Bulk Actions */}
            {selectedIds.length > 0 ? (
              <button
                onClick={handleDeleteSelected}
                className="inline-flex items-center gap-1.5 px-3.5 py-2.5 bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 rounded-xl text-xs font-semibold transition-colors shadow-2xs"
              >
                <Trash2 size={14} />
                <span>Delete Selected ({selectedIds.length})</span>
              </button>
            ) : (
              <button
                onClick={handleDeleteAll}
                className="inline-flex items-center gap-1.5 px-3.5 py-2.5 bg-white hover:bg-rose-50 text-slate-500 hover:text-rose-600 border border-slate-200 hover:border-rose-200 rounded-xl text-xs font-medium transition-colors shadow-2xs"
                title="Delete all medicines"
              >
                <Trash2 size={14} />
                <span>Clear All</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 5. DESKTOP INVENTORY TABLE */}
      <div className="hidden lg:block bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
        <div className="p-5 flex items-center justify-between border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Layers size={18} />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-800 leading-tight">
                Medicine Inventory Catalog
              </h3>
              <p className="text-xs text-slate-400">
                Showing {paginatedMedicines.length} of {filteredMedicines.length} medicines
              </p>
            </div>
          </div>

          {selectedIds.length > 0 && (
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-blue-50 text-blue-600 text-xs font-semibold">
              <CheckCircle2 size={14} />
              <span>{selectedIds.length} item(s) selected</span>
            </div>
          )}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 text-[11px] font-semibold text-slate-400 uppercase tracking-wider bg-slate-50/60">
                <th className="py-3 px-5 whitespace-nowrap w-12">
                  <input
                    type="checkbox"
                    className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer w-4 h-4"
                    checked={
                      selectedIds.length === filteredMedicines.length &&
                      filteredMedicines.length > 0
                    }
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedIds(
                          filteredMedicines.map((m) => m.medicine_id)
                        );
                      } else {
                        setSelectedIds([]);
                      }
                    }}
                  />
                </th>
                <th
                  className="py-3 px-4 whitespace-nowrap cursor-pointer hover:text-slate-700 transition-colors"
                  onClick={() => handleSort("medicine_name")}
                >
                  Medicine Details <SortIcon column="medicine_name" />
                </th>
                <th
                  className="py-3 px-4 whitespace-nowrap cursor-pointer hover:text-slate-700 transition-colors"
                  onClick={() => handleSort("category")}
                >
                  Category <SortIcon column="category" />
                </th>
                <th
                  className="py-3 px-4 whitespace-nowrap cursor-pointer hover:text-slate-700 transition-colors"
                  onClick={() => handleSort("quantity")}
                >
                  Stock Level <SortIcon column="quantity" />
                </th>
                <th
                  className="py-3 px-4 whitespace-nowrap cursor-pointer hover:text-slate-700 transition-colors"
                  onClick={() => handleSort("selling_price")}
                >
                  Price <SortIcon column="selling_price" />
                </th>
                <th
                  className="py-3 px-4 whitespace-nowrap cursor-pointer hover:text-slate-700 transition-colors"
                  onClick={() => handleSort("expiry_date")}
                >
                  Expiry Date <SortIcon column="expiry_date" />
                </th>
                <th className="py-3 px-4 whitespace-nowrap">Batch No</th>
                <th className="py-3 px-4 whitespace-nowrap">Status</th>
                <th className="py-3 px-5 text-right whitespace-nowrap">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {paginatedMedicines.map((medicine) => {
                const expiryStatus = getExpiryStatus(medicine.expiry_date);
                const stockStatus = getStockStatus(
                  medicine.quantity,
                  medicine.min_stock
                );
                const initial = (medicine.medicine_name || "M")
                  .charAt(0)
                  .toUpperCase();

                return (
                  <tr
                    key={medicine.medicine_id}
                    className="hover:bg-slate-50/80 transition-colors group"
                  >
                    {/* Checkbox */}
                    <td className="py-3.5 px-5 whitespace-nowrap">
                      <input
                        type="checkbox"
                        className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer w-4 h-4"
                        checked={selectedIds.includes(medicine.medicine_id)}
                        onChange={(e) => {
                          const checked = e.target.checked;
                          setSelectedIds((prev) =>
                            checked
                              ? [...prev, medicine.medicine_id]
                              : prev.filter((id) => id !== medicine.medicine_id)
                          );
                        }}
                      />
                    </td>

                    {/* Medicine details with avatar */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-xs shrink-0 shadow-2xs">
                          {initial}
                        </div>
                        <div>
                          <h4 className="font-semibold text-slate-800 text-sm leading-tight group-hover:text-blue-600 transition-colors">
                            {medicine.medicine_name}
                          </h4>
                          <p className="text-[11px] text-slate-400 mt-0.5">
                            {medicine.brand_name || "Generic"}{" "}
                            {medicine.salt_name ? `• ${medicine.salt_name}` : ""}
                          </p>
                          {medicine.manufacturer && (
                            <p className="text-[10px] text-slate-400/90 mt-0.5">
                              {medicine.manufacturer}
                            </p>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Category */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span className="inline-block px-2.5 py-1 rounded-lg text-[11px] font-medium bg-slate-100 text-slate-700">
                        {medicine.category || "General"}
                      </span>
                    </td>

                    {/* Stock Level */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        {stockStatus.icon}
                        <span
                          className={`font-bold text-sm ${stockStatus.color}`}
                        >
                          {medicine.quantity}
                        </span>
                        {medicine.min_stock !== undefined && (
                          <span className="text-[11px] text-slate-400">
                            / min {medicine.min_stock}
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Price */}
                    <td className="py-3.5 px-4 whitespace-nowrap font-bold text-slate-900 text-sm">
                      ₹{Number(medicine.selling_price || 0).toLocaleString("en-IN", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </td>

                    {/* Expiry Date */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <p className="font-medium text-slate-700">
                        {formatCleanDate(medicine.expiry_date)}
                      </p>
                      <span
                        className={`inline-block mt-1 px-2 py-0.5 rounded-full text-[10px] font-semibold border ${expiryStatus.color}`}
                      >
                        {expiryStatus.label}
                      </span>
                    </td>

                    {/* Batch Number */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span className="font-mono text-xs text-slate-600 bg-slate-50 px-2 py-1 rounded-md border border-slate-200/80">
                        {medicine.batch_number || "—"}
                      </span>
                    </td>

                    {/* Stock Status Badge */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold border ${stockStatus.badgeBg}`}
                      >
                        {stockStatus.label}
                      </span>
                    </td>

                    {/* Action Buttons */}
                    <td className="py-3.5 px-5 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleEdit(medicine)}
                          title="Edit Medicine"
                          className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 flex items-center justify-center transition-colors shadow-2xs"
                        >
                          <SquarePen size={14} />
                        </button>

                        <button
                          onClick={() => openStockModal(medicine, "in")}
                          title="Stock In (+)"
                          className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 hover:bg-emerald-100 flex items-center justify-center transition-colors shadow-2xs"
                        >
                          <TrendingUp size={14} />
                        </button>

                        <button
                          onClick={() => openStockModal(medicine, "out")}
                          title="Stock Out (-)"
                          className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 hover:bg-amber-100 flex items-center justify-center transition-colors shadow-2xs"
                        >
                          <TrendingDown size={14} />
                        </button>

                        <button
                          onClick={() => handleDelete(medicine.medicine_id)}
                          title="Delete Medicine"
                          className="w-8 h-8 rounded-lg bg-rose-50 text-rose-600 hover:bg-rose-100 flex items-center justify-center transition-colors shadow-2xs"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Empty State */}
        {filteredMedicines.length === 0 && (
          <div className="text-center py-16 px-4">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 mb-3">
              <Package size={24} />
            </div>
            <h4 className="text-base font-bold text-slate-800">
              No medicines found
            </h4>
            <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
              No medicine matched your current search filters. Try modifying your search term or category.
            </p>
            <button
              onClick={() => {
                setSearch("");
                setCategory("All");
              }}
              className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold transition-colors shadow-xs"
            >
              Reset Filters
            </button>
          </div>
        )}
      </div>

      {/* 6. MOBILE & TABLET CARD VIEW (visible on smaller screens) */}
      <div className="lg:hidden space-y-3.5">
        {paginatedMedicines.map((medicine) => {
          const expiryStatus = getExpiryStatus(medicine.expiry_date);
          const stockStatus = getStockStatus(
            medicine.quantity,
            medicine.min_stock
          );
          const initial = (medicine.medicine_name || "M")
            .charAt(0)
            .toUpperCase();

          return (
            <div
              key={medicine.medicine_id}
              className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-xs hover:shadow-sm transition-all"
            >
              {/* Header with Title and Actions */}
              <div className="flex justify-between items-start gap-2 mb-3">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-xs shrink-0">
                    {initial}
                  </div>
                  <div className="min-w-0">
                    <h4 className="font-semibold text-slate-800 text-sm truncate">
                      {medicine.medicine_name}
                    </h4>
                    <p className="text-[11px] text-slate-400 truncate">
                      {medicine.brand_name || "Generic"}{" "}
                      {medicine.salt_name ? `• ${medicine.salt_name}` : ""}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={() => handleEdit(medicine)}
                    title="Edit"
                    className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center"
                  >
                    <SquarePen size={13} />
                  </button>
                  <button
                    onClick={() => openStockModal(medicine, "in")}
                    title="Stock In"
                    className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center"
                  >
                    <TrendingUp size={13} />
                  </button>
                  <button
                    onClick={() => openStockModal(medicine, "out")}
                    title="Stock Out"
                    className="w-7 h-7 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center"
                  >
                    <TrendingDown size={13} />
                  </button>
                  <button
                    onClick={() => handleDelete(medicine.medicine_id)}
                    title="Delete"
                    className="w-7 h-7 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>

              {/* Grid of Key Info */}
              <div className="grid grid-cols-2 gap-2.5 pt-2 border-t border-slate-100 text-xs">
                <div>
                  <span className="text-[10px] text-slate-400 font-medium uppercase">
                    Category
                  </span>
                  <p className="font-medium text-slate-700 mt-0.5">
                    {medicine.category || "General"}
                  </p>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-medium uppercase">
                    Batch No
                  </span>
                  <p className="font-mono text-slate-700 mt-0.5">
                    {medicine.batch_number || "—"}
                  </p>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-medium uppercase">
                    Price
                  </span>
                  <p className="font-bold text-slate-900 text-sm mt-0.5">
                    ₹{Number(medicine.selling_price || 0).toFixed(2)}
                  </p>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-medium uppercase">
                    Stock
                  </span>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    {stockStatus.icon}
                    <span className={`font-bold ${stockStatus.color}`}>
                      {medicine.quantity} units
                    </span>
                  </div>
                </div>
                <div className="col-span-2 flex items-center justify-between pt-1">
                  <div className="text-[11px] text-slate-500">
                    Expiry: <span className="font-medium text-slate-700">{formatCleanDate(medicine.expiry_date)}</span>
                  </div>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${expiryStatus.color}`}
                  >
                    {expiryStatus.label}
                  </span>
                </div>
              </div>
            </div>
          );
        })}

        {filteredMedicines.length === 0 && (
          <div className="text-center py-12 px-4 bg-white rounded-2xl border border-slate-200/90 shadow-xs">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 mb-3">
              <Package size={24} />
            </div>
            <h4 className="text-base font-bold text-slate-800">
              No medicines found
            </h4>
            <p className="text-xs text-slate-400 mt-1">
              Try adjusting your search criteria or category filter.
            </p>
            <button
              onClick={() => {
                setSearch("");
                setCategory("All");
              }}
              className="mt-3 text-blue-600 hover:text-blue-700 text-xs font-semibold"
            >
              Clear filters
            </button>
          </div>
        )}
      </div>

      {/* 7. PAGINATION CONTROLS */}
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        totalItems={filteredMedicines.length}
        itemsPerPage={itemsPerPage}
        onPageChange={setCurrentPage}
      />
    </div>
  );
};

export default Inventory;
