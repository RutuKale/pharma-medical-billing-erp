import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import Pagination from "../../components/Pagination";
import {
  AlertTriangle,
  Search,
  CalendarClock,
  ShieldCheck,
  XCircle,
  RotateCcw,
  Trash2,
  Package,
  TrendingDown,
  ArrowLeft,
  Layers,
  X,
  CheckCircle2,
  Printer,
  Download,
  FileText,
  Building2,
  Eye,
  IndianRupee,
} from "lucide-react";
import Swal from "sweetalert2";
import API from "../../utils/api";
import DashboardSkeleton from "../../components/DashboardSkeleton";
import {
  printReturnBill as utilityPrintReturnBill,
  downloadReturnBillPDF as utilityDownloadReturnBillPDF,
} from "../../utils/billUtils";

const ExpiryAlerts = () => {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");
  const [selectedMedicine, setSelectedMedicine] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [medicinesData, setMedicinesData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Manufacturer Return Bill State
  const [showReturnModal, setShowReturnModal] = useState(false);
  const [selectedManufacturer, setSelectedManufacturer] = useState("");
  const [returnReason, setReturnReason] = useState("Expired / Near-Expiry Stock Return");
  const [returnItems, setReturnItems] = useState([]);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    fetchMedicines();
  }, []);

  const fetchMedicines = async () => {
    try {
      setLoading(true);
      const response = await API.get("/medicines");
      const medicines = response?.data?.data || [];

      const formattedData = medicines.map((medicine) => ({
        id: medicine.medicine_id || medicine._id,
        name: medicine.medicine_name,
        batch: medicine.batch_number,
        stock: Number(medicine.quantity ?? medicine.stock_quantity ?? 0),
        expiryDate: medicine.expiry_date,
        manufacturer: medicine.manufacturer,
        category: medicine.category,
        purchasePrice: Number(medicine.purchase_price || 0),
        sellingPrice: Number(medicine.selling_price || 0),
      }));

      setMedicinesData(formattedData);
    } catch (err) {
      console.error(err);
      setError("Failed to fetch medicines");
    } finally {
      setLoading(false);
    }
  };

  const formatCleanDate = (dateStr) => {
    if (!dateStr) return "-";
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    const months = [
      "Jan", "Feb", "Mar", "Apr", "May", "Jun",
      "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
    ];
    const day = String(d.getDate()).padStart(2, "0");
    const month = months[d.getMonth()];
    const year = d.getFullYear();
    return `${day} ${month} ${year}`;
  };

  const getDaysRemaining = (expiryDate) => {
    if (!expiryDate) return 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const expiry = new Date(expiryDate);
    return Math.ceil((expiry - today) / (1000 * 60 * 60 * 24));
  };

  const getMedicineStatus = (expiryDate) => {
    if (!expiryDate) {
      return {
        label: "Safe",
        color: "bg-emerald-50 text-emerald-600 border-emerald-200",
        badgeColor: "text-emerald-600",
        icon: <ShieldCheck size={14} className="text-emerald-500 shrink-0" />,
        severity: 1,
      };
    }

    const diffDays = getDaysRemaining(expiryDate);

    if (diffDays < 0) {
      return {
        label: "Expired",
        color: "bg-rose-50 text-rose-600 border-rose-200",
        badgeColor: "text-rose-600",
        icon: <XCircle size={14} className="text-rose-500 shrink-0" />,
        severity: 4,
      };
    }

    if (diffDays <= 30) {
      return {
        label: "Critical",
        color: "bg-amber-50 text-amber-600 border-amber-200",
        badgeColor: "text-amber-600",
        icon: <AlertTriangle size={14} className="text-amber-500 shrink-0" />,
        severity: 3,
      };
    }

    if (diffDays <= 90) {
      return {
        label: "Warning",
        color: "bg-yellow-50 text-yellow-700 border-yellow-200",
        badgeColor: "text-yellow-700",
        icon: <CalendarClock size={14} className="text-yellow-600 shrink-0" />,
        severity: 2,
      };
    }

    return {
      label: "Safe",
      color: "bg-emerald-50 text-emerald-600 border-emerald-200",
      badgeColor: "text-emerald-600",
      icon: <ShieldCheck size={14} className="text-emerald-500 shrink-0" />,
      severity: 1,
    };
  };

  const filteredMedicines = useMemo(() => {
    return medicinesData
      .filter((medicine) => {
        const status = getMedicineStatus(medicine.expiryDate);
        const term = search.toLowerCase();

        const matchesSearch =
          medicine.name?.toLowerCase().includes(term) ||
          medicine.batch?.toLowerCase().includes(term) ||
          medicine.manufacturer?.toLowerCase().includes(term) ||
          medicine.category?.toLowerCase().includes(term);

        const matchesFilter = filter === "All" || status.label === filter;

        return matchesSearch && matchesFilter;
      })
      .sort((a, b) => {
        const daysA = getDaysRemaining(a.expiryDate);
        const daysB = getDaysRemaining(b.expiryDate);
        return daysA - daysB;
      });
  }, [medicinesData, search, filter]);

  const paginatedMedicines = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredMedicines.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredMedicines, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(filteredMedicines.length / itemsPerPage);

  const stats = useMemo(() => {
    let expired = 0;
    let critical = 0;
    let warning = 0;
    let safe = 0;
    let totalValue = 0;
    let atRiskValue = 0;

    medicinesData.forEach((m) => {
      const status = getMedicineStatus(m.expiryDate);
      const val = (m.stock || 0) * (m.purchasePrice || 0);
      totalValue += val;

      if (status.label === "Expired") {
        expired++;
        atRiskValue += val;
      } else if (status.label === "Critical") {
        critical++;
        atRiskValue += val;
      } else if (status.label === "Warning") {
        warning++;
        atRiskValue += val;
      } else {
        safe++;
      }
    });

    return {
      total: medicinesData.length,
      expired,
      critical,
      warning,
      safe,
      totalValue,
      atRiskValue,
    };
  }, [medicinesData]);

  // Unique manufacturers with stock
  const manufacturers = useMemo(() => {
    const map = new Map();
    medicinesData.forEach((m) => {
      const mfr = m.manufacturer?.trim() || "Unknown Supplier";
      if (!map.has(mfr)) {
        map.set(mfr, {
          name: mfr,
          totalStock: 0,
          expiringCount: 0,
          expiredCount: 0,
        });
      }
      const entry = map.get(mfr);
      entry.totalStock += m.stock || 0;
      const days = getDaysRemaining(m.expiryDate);
      if (days < 0) entry.expiredCount++;
      else if (days <= 90) entry.expiringCount++;
    });
    return Array.from(map.values()).sort((a, b) => {
      // Prioritize manufacturers with expired/expiring items
      const scoreA = a.expiredCount * 10 + a.expiringCount;
      const scoreB = b.expiredCount * 10 + b.expiringCount;
      return scoreB - scoreA;
    });
  }, [medicinesData]);

  const openReturnModal = (initialManufacturer = "", specificMedicine = null) => {
    let targetMfr = initialManufacturer;
    if (!targetMfr && specificMedicine?.manufacturer) {
      targetMfr = specificMedicine.manufacturer;
    }
    if (!targetMfr && manufacturers.length > 0) {
      targetMfr = manufacturers[0].name;
    }
    setSelectedManufacturer(targetMfr);
    loadReturnItemsForManufacturer(targetMfr, specificMedicine);
    setShowReturnModal(true);
  };

  const loadReturnItemsForManufacturer = (mfrName, preselectedItem = null) => {
    if (!mfrName) {
      setReturnItems([]);
      return;
    }
    const matching = medicinesData.filter(
      (m) =>
        (m.manufacturer?.trim() || "Unknown Supplier").toLowerCase() ===
          mfrName.toLowerCase() && m.stock > 0
    );

    // Sort: expired first, then near-expiry, then safe
    const sorted = [...matching].sort(
      (a, b) => getDaysRemaining(a.expiryDate) - getDaysRemaining(b.expiryDate)
    );

    setReturnItems(
      sorted.map((m) => {
        const days = getDaysRemaining(m.expiryDate);
        const isExpiringSoon = days <= 90;
        const defaultQty =
          preselectedItem && preselectedItem.id === m.id
            ? m.stock
            : isExpiringSoon
            ? m.stock
            : 0;
        return {
          ...m,
          returnQuantity: defaultQty,
          selected: defaultQty > 0,
          total: defaultQty * (m.purchasePrice || 0),
        };
      })
    );
  };

  const handleManufacturerChange = (mfrName) => {
    setSelectedManufacturer(mfrName);
    loadReturnItemsForManufacturer(mfrName);
  };

  const handleReturnItemQtyChange = (medicineId, qty) => {
    setReturnItems((prev) =>
      prev.map((item) => {
        if (item.id !== medicineId) return item;
        const val = Number(qty);
        const validQty = Math.max(0, Math.min(item.stock, isNaN(val) ? 0 : val));
        return {
          ...item,
          returnQuantity: validQty,
          selected: validQty > 0,
          total: validQty * (item.purchasePrice || 0),
        };
      })
    );
  };

  const handleToggleSelectItem = (medicineId) => {
    setReturnItems((prev) =>
      prev.map((item) => {
        if (item.id !== medicineId) return item;
        const newSelected = !item.selected;
        const newQty = newSelected ? item.stock : 0;
        return {
          ...item,
          selected: newSelected,
          returnQuantity: newQty,
          total: newQty * (item.purchasePrice || 0),
        };
      })
    );
  };

  const selectedReturnItems = useMemo(() => {
    return returnItems.filter((i) => i.selected && i.returnQuantity > 0);
  }, [returnItems]);

  const returnTotals = useMemo(() => {
    const totalUnits = selectedReturnItems.reduce(
      (acc, i) => acc + (Number(i.returnQuantity) || 0),
      0
    );
    const totalAmount = selectedReturnItems.reduce(
      (acc, i) => acc + (Number(i.total) || 0),
      0
    );
    return { totalUnits, totalAmount };
  }, [selectedReturnItems]);

  const handlePrintReturnBill = () => {
    if (selectedReturnItems.length === 0) {
      return Swal.fire({
        icon: "warning",
        title: "No Items Selected",
        text: "Please select at least one medicine with return quantity greater than 0.",
        confirmButtonColor: "#2563eb",
      });
    }
    const returnData = {
      returnNoteNumber: `RET-${Date.now().toString().slice(-6)}`,
      date: new Date().toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }),
      manufacturer: selectedManufacturer || "Supplier",
      reason: returnReason,
      items: selectedReturnItems,
      totalUnits: returnTotals.totalUnits,
      totalAmount: returnTotals.totalAmount,
    };
    utilityPrintReturnBill(returnData);
  };

  const handleDownloadReturnBillPDF = () => {
    if (selectedReturnItems.length === 0) {
      return Swal.fire({
        icon: "warning",
        title: "No Items Selected",
        text: "Please select at least one medicine with return quantity greater than 0.",
        confirmButtonColor: "#2563eb",
      });
    }
    const returnData = {
      returnNoteNumber: `RET-${Date.now().toString().slice(-6)}`,
      date: new Date().toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }),
      manufacturer: selectedManufacturer || "Supplier",
      reason: returnReason,
      items: selectedReturnItems,
      totalUnits: returnTotals.totalUnits,
      totalAmount: returnTotals.totalAmount,
    };
    utilityDownloadReturnBillPDF(returnData);
  };

  const handleConfirmReturnAndDeductStock = async () => {
    if (selectedReturnItems.length === 0) {
      return Swal.fire({
        icon: "warning",
        title: "No Items Selected",
        text: "Please select at least one medicine with return quantity greater than 0.",
        confirmButtonColor: "#2563eb",
      });
    }

    const noteNumber = `RET-${Date.now().toString().slice(-6)}`;
    const result = await Swal.fire({
      title: "Confirm Return Bill & Deduct Stock?",
      html: `You are generating Return Bill <b>#${noteNumber}</b> for manufacturer <b>${selectedManufacturer}</b>.<br/><br/>
             Returning <b>${returnTotals.totalUnits} units</b> across <b>${selectedReturnItems.length} batches</b> with total credit claim of <b>₹${returnTotals.totalAmount.toFixed(2)}</b>.
             <br/><br/>Medicine stock will be automatically deducted from inventory.`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#2563eb",
      cancelButtonColor: "#64748b",
      confirmButtonText: "Yes, Confirm Return",
      cancelButtonText: "Cancel",
    });

    if (!result.isConfirmed) return;

    try {
      const response = await API.post("/expiry/return-bill", {
        manufacturer: selectedManufacturer,
        returnNoteNumber: noteNumber,
        reason: returnReason,
        items: selectedReturnItems.map((i) => ({
          medicine_id: i.id,
          returnQuantity: i.returnQuantity,
          purchasePrice: i.purchasePrice,
          total: i.total,
        })),
      });

      if (response.data?.success) {
        const returnData = {
          returnNoteNumber: noteNumber,
          date: new Date().toLocaleDateString("en-IN", {
            day: "2-digit",
            month: "short",
            year: "numeric",
          }),
          manufacturer: selectedManufacturer || "Supplier",
          reason: returnReason,
          items: selectedReturnItems,
          totalUnits: returnTotals.totalUnits,
          totalAmount: returnTotals.totalAmount,
        };

        await Swal.fire({
          icon: "success",
          title: "Return Bill Generated!",
          html: `Return Bill <b>#${noteNumber}</b> recorded successfully.<br/>Stock quantities have been deducted from inventory.`,
          confirmButtonColor: "#2563eb",
          showDenyButton: true,
          confirmButtonText: "Print Return Note",
          denyButtonText: "Done",
        }).then((choice) => {
          if (choice.isConfirmed) {
            utilityPrintReturnBill(returnData);
          }
        });

        setShowReturnModal(false);
        fetchMedicines();
      } else {
        Swal.fire({
          icon: "error",
          title: "Processing Failed",
          text: response.data?.message || "Could not process return bill.",
          confirmButtonColor: "#2563eb",
        });
      }
    } catch (err) {
      console.error(err);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: err.response?.data?.message || "Failed to process manufacturer return bill.",
        confirmButtonColor: "#2563eb",
      });
    }
  };

  const handleReturn = (medicine) => {
    openReturnModal(medicine.manufacturer, medicine);
  };

  const handleWriteOff = async (medicine) => {
    const result = await Swal.fire({
      title: "Write Off Medicine?",
      text: `Permanently write off ${medicine.name} (Batch: ${medicine.batch}) as expired disposal?`,
      icon: "warning",
      iconColor: "#ef4444",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#64748b",
      confirmButtonText: "Yes, Write Off",
      cancelButtonText: "Cancel",
    });

    if (result.isConfirmed) {
      Swal.fire({
        icon: "success",
        title: "Stock Written Off",
        text: `${medicine.name} recorded in disposal inventory.`,
        confirmButtonColor: "#10b981",
      });
      setShowModal(false);
    }
  };

  const handleViewDetails = (medicine) => {
    setSelectedMedicine(medicine);
    setShowModal(true);
  };

  const filterTabs = [
    { value: "All", label: "All Items" },
    { value: "Expired", label: "Expired", color: "rose" },
    { value: "Critical", label: "Critical (≤30d)", color: "amber" },
    { value: "Warning", label: "Warning (31-90d)", color: "yellow" },
    { value: "Safe", label: "Safe (>90d)", color: "emerald" },
  ];

  if (loading) {
    return <DashboardSkeleton />;
  }

  if (error) {
    return (
      <div className="p-8 text-center">
        <p className="text-rose-500 font-semibold">{error}</p>
        <button
          onClick={fetchMedicines}
          className="mt-3 px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-semibold"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-[1600px] mx-auto space-y-6">
      {/* 1. HEADER SECTION (No icon in header as requested) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <span>Expiry Alerts</span>
          </h1>
          <p className="text-slate-500 text-xs sm:text-sm mt-0.5">
            Monitor shelf-life expiry thresholds, protect patient safety, and audit at-risk stock valuation.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={() => openReturnModal()}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-semibold shadow-xs transition-colors"
          >
            <FileText size={16} />
            <span>Generate Return Bill</span>
          </button>

          <Link
            to="/inventory"
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 rounded-xl text-sm font-semibold shadow-xs transition-colors"
          >
            <ArrowLeft size={16} />
            <span>Back to Inventory</span>
          </Link>
        </div>
      </div>

      {/* 2. STAT CARDS ROW */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {/* Total Products */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-xs hover:shadow-sm transition-all flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                <Package size={18} />
              </div>
              <span className="text-xs font-semibold text-slate-500">
                Total Products
              </span>
            </div>
          </div>
          <div className="mt-4">
            <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
              {stats.total}
            </h2>
          </div>
          <div className="flex items-center gap-2 mt-2 pt-1">
            <span className="text-[11px] text-slate-400 font-medium">
              Registered in catalog
            </span>
          </div>
        </div>

        {/* Expired */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-xs hover:shadow-sm transition-all flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center font-bold">
                <XCircle size={18} />
              </div>
              <span className="text-xs font-semibold text-slate-500">
                Expired
              </span>
            </div>
          </div>
          <div className="mt-4">
            <h2 className="text-2xl font-bold text-rose-600 tracking-tight">
              {stats.expired}
            </h2>
          </div>
          <div className="flex items-center gap-2 mt-2 pt-1">
            <span className="inline-flex items-center gap-0.5 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-rose-50 text-rose-600">
              Needs write-off
            </span>
          </div>
        </div>

        {/* Critical (<= 30d) */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-xs hover:shadow-sm transition-all flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
                <AlertTriangle size={18} />
              </div>
              <span className="text-xs font-semibold text-slate-500">
                Critical (≤30d)
              </span>
            </div>
          </div>
          <div className="mt-4">
            <h2 className="text-2xl font-bold text-amber-600 tracking-tight">
              {stats.critical}
            </h2>
          </div>
          <div className="flex items-center gap-2 mt-2 pt-1">
            <span className="inline-flex items-center gap-0.5 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-amber-50 text-amber-600">
              Immediate action
            </span>
          </div>
        </div>

        {/* Warning (31-90d) */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-xs hover:shadow-sm transition-all flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-yellow-50 text-yellow-700 flex items-center justify-center font-bold">
                <CalendarClock size={18} />
              </div>
              <span className="text-xs font-semibold text-slate-500">
                Warning (31-90d)
              </span>
            </div>
          </div>
          <div className="mt-4">
            <h2 className="text-2xl font-bold text-yellow-700 tracking-tight">
              {stats.warning}
            </h2>
          </div>
          <div className="flex items-center gap-2 mt-2 pt-1">
            <span className="inline-flex items-center gap-0.5 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-yellow-50 text-yellow-700">
              Upcoming expiry
            </span>
          </div>
        </div>

        {/* Safe (>90d) */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-xs hover:shadow-sm transition-all flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                <ShieldCheck size={18} />
              </div>
              <span className="text-xs font-semibold text-slate-500">
                Safe (&gt;90d)
              </span>
            </div>
          </div>
          <div className="mt-4">
            <h2 className="text-2xl font-bold text-emerald-600 tracking-tight">
              {stats.safe}
            </h2>
          </div>
          <div className="flex items-center gap-2 mt-2 pt-1">
            <span className="inline-flex items-center gap-0.5 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-600">
              Healthy inventory
            </span>
          </div>
        </div>

        {/* At Risk Value */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-xs hover:shadow-sm transition-all flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
                <IndianRupee size={18} />
              </div>
              <span className="text-xs font-semibold text-slate-500">
                At-Risk Value
              </span>
            </div>
          </div>
          <div className="mt-4">
            <h2 className="text-2xl font-bold text-purple-600 tracking-tight truncate">
              ₹
              {Number(stats.atRiskValue).toLocaleString("en-IN", {
                maximumFractionDigits: 0,
              })}
            </h2>
          </div>
          <div className="flex items-center gap-2 mt-2 pt-1">
            <span className="inline-flex items-center gap-0.5 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-purple-50 text-purple-600">
              Expired &amp; near expiry
            </span>
          </div>
        </div>
      </div>

      {/* 3. FILTERS & SEARCH CARD */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/90 shadow-xs">
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
          {/* Direct Search Bar */}
          <div className="relative flex-1">
            <Search
              size={18}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              type="text"
              placeholder="Search by medicine, batch, or manufacturer..."
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

          {/* Filter Option Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            {filterTabs.map((tab) => (
              <button
                key={tab.value}
                onClick={() => {
                  setFilter(tab.value);
                  setCurrentPage(1);
                }}
                className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all ${
                  filter === tab.value
                    ? "bg-blue-600 text-white shadow-xs"
                    : "bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-200"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 4. EXPIRY CATALOG TABLE */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
        <div className="p-5 flex items-center justify-between border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Layers size={18} />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-800 leading-tight">
                Expiry Status Catalog
              </h3>
              <p className="text-xs text-slate-400">
                Showing {paginatedMedicines.length} of {filteredMedicines.length} medicines
              </p>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 text-[11px] font-semibold text-slate-400 uppercase tracking-wider bg-slate-50/60">
                <th className="py-3 px-5 whitespace-nowrap">Medicine Details</th>
                <th className="py-3 px-4 whitespace-nowrap">Manufacturer</th>
                <th className="py-3 px-4 whitespace-nowrap">Batch No</th>
                <th className="py-3 px-4 whitespace-nowrap">Stock Quantity</th>
                <th className="py-3 px-4 whitespace-nowrap">Expiry Date</th>
                <th className="py-3 px-4 whitespace-nowrap">Shelf Life Remaining</th>
                <th className="py-3 px-4 whitespace-nowrap">Status</th>
                <th className="py-3 px-5 text-right whitespace-nowrap">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {paginatedMedicines.map((medicine) => {
                const status = getMedicineStatus(medicine.expiryDate);
                const daysRemaining = getDaysRemaining(medicine.expiryDate);
                const initial = (medicine.name || "M").charAt(0).toUpperCase();

                return (
                  <tr
                    key={medicine.id}
                    className="hover:bg-slate-50/80 transition-colors group"
                  >
                    {/* Medicine */}
                    <td className="py-3.5 px-5 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-xs shrink-0 shadow-2xs">
                          {initial}
                        </div>
                        <div>
                          <h4 className="font-semibold text-slate-800 text-sm leading-tight group-hover:text-blue-600 transition-colors">
                            {medicine.name}
                          </h4>
                          <p className="text-[11px] text-slate-400 mt-0.5">
                            {medicine.category || "General"}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Manufacturer */}
                    <td className="py-3.5 px-4 whitespace-nowrap text-slate-600">
                      {medicine.manufacturer || "—"}
                    </td>

                    {/* Batch */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span className="font-mono text-xs text-slate-600 bg-slate-50 px-2 py-1 rounded-md border border-slate-200/80">
                        {medicine.batch || "—"}
                      </span>
                    </td>

                    {/* Stock */}
                    <td className="py-3.5 px-4 whitespace-nowrap font-bold text-slate-900 text-sm">
                      {medicine.stock} units
                    </td>

                    {/* Expiry Date */}
                    <td className="py-3.5 px-4 whitespace-nowrap font-medium text-slate-700">
                      {formatCleanDate(medicine.expiryDate)}
                    </td>

                    {/* Days Left */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span className={`font-semibold ${status.badgeColor}`}>
                        {daysRemaining < 0
                          ? "Expired"
                          : `${daysRemaining} days left`}
                      </span>
                    </td>

                    {/* Status Badge */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold border ${status.color}`}
                      >
                        {status.icon}
                        <span>{status.label}</span>
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-5 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleViewDetails(medicine)}
                          title="View Details"
                          className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition-colors shadow-2xs"
                        >
                          <Eye size={14} />
                        </button>

                        {status.label !== "Safe" && (
                          <>
                            <button
                              onClick={() => openReturnModal(medicine.manufacturer, medicine)}
                              title="Generate Return Bill"
                              className="w-8 h-8 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-600 flex items-center justify-center transition-colors shadow-2xs"
                            >
                              <RotateCcw size={14} />
                            </button>
                            <button
                              onClick={() => handleWriteOff(medicine)}
                              title="Write Off Stock"
                              className="w-8 h-8 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 flex items-center justify-center transition-colors shadow-2xs"
                            >
                              <Trash2 size={14} />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}

              {filteredMedicines.length === 0 && (
                <tr>
                  <td className="py-12 px-4 text-center text-slate-400" colSpan={8}>
                    <ShieldCheck size={28} className="mx-auto text-slate-300 mb-2" />
                    <p className="text-sm font-semibold text-slate-600">
                      No medicines match the selected filter
                    </p>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Try clearing search or choosing another status tab.
                    </p>
                    <button
                      onClick={() => {
                        setSearch("");
                        setFilter("All");
                      }}
                      className="mt-3 px-3 py-1.5 bg-blue-600 text-white rounded-xl text-xs font-semibold shadow-xs"
                    >
                      Reset Filters
                    </button>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={filteredMedicines.length}
          itemsPerPage={itemsPerPage}
          onPageChange={setCurrentPage}
        />
      </div>

      {/* 5. MEDICINE DETAIL MODAL */}
      {showModal && selectedMedicine && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity"
            onClick={() => setShowModal(false)}
          />

          <div className="relative z-10 w-full max-w-lg mx-auto">
            <div className="bg-white rounded-2xl p-6 shadow-xl border border-slate-200/90 animate-in fade-in zoom-in-95 duration-150">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-xs">
                    {(selectedMedicine.name || "M").charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-800">
                      Medicine Expiry Details
                    </h3>
                    <p className="text-xs text-slate-400 truncate max-w-[280px]">
                      {selectedMedicine.name}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowModal(false)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 bg-slate-50 rounded-xl">
                  <span className="text-[10px] text-slate-400 font-medium uppercase">
                    Category
                  </span>
                  <p className="font-semibold text-slate-800 mt-0.5">
                    {selectedMedicine.category || "General"}
                  </p>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl">
                  <span className="text-[10px] text-slate-400 font-medium uppercase">
                    Batch Number
                  </span>
                  <p className="font-mono font-semibold text-slate-800 mt-0.5">
                    {selectedMedicine.batch || "—"}
                  </p>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl">
                  <span className="text-[10px] text-slate-400 font-medium uppercase">
                    Manufacturer
                  </span>
                  <p className="font-semibold text-slate-800 mt-0.5 truncate">
                    {selectedMedicine.manufacturer || "—"}
                  </p>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl">
                  <span className="text-[10px] text-slate-400 font-medium uppercase">
                    Current Stock
                  </span>
                  <p className="font-bold text-slate-900 mt-0.5">
                    {selectedMedicine.stock} units
                  </p>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl">
                  <span className="text-[10px] text-slate-400 font-medium uppercase">
                    Expiry Date
                  </span>
                  <p className="font-semibold text-slate-800 mt-0.5">
                    {formatCleanDate(selectedMedicine.expiryDate)}
                  </p>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl">
                  <span className="text-[10px] text-slate-400 font-medium uppercase">
                    Days Remaining
                  </span>
                  <p className="font-bold text-rose-600 mt-0.5">
                    {getDaysRemaining(selectedMedicine.expiryDate) < 0
                      ? "Expired"
                      : `${getDaysRemaining(selectedMedicine.expiryDate)} days`}
                  </p>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl">
                  <span className="text-[10px] text-slate-400 font-medium uppercase">
                    Purchase Price
                  </span>
                  <p className="font-bold text-slate-800 mt-0.5">
                    ₹{Number(selectedMedicine.purchasePrice || 0).toFixed(2)}
                  </p>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl">
                  <span className="text-[10px] text-slate-400 font-medium uppercase">
                    Selling Price (MRP)
                  </span>
                  <p className="font-bold text-slate-800 mt-0.5">
                    ₹{Number(selectedMedicine.sellingPrice || 0).toFixed(2)}
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 mt-6 pt-3 border-t border-slate-100">
                <button
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 text-xs font-semibold transition-colors"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    setShowModal(false);
                    openReturnModal(selectedMedicine.manufacturer, selectedMedicine);
                  }}
                  className="px-4 py-2 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-600 text-xs font-semibold transition-colors"
                >
                  Generate Return Bill
                </button>
                <button
                  onClick={() => handleWriteOff(selectedMedicine)}
                  className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold transition-colors shadow-xs"
                >
                  Write Off
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 5. MANUFACTURER RETURN BILL MODAL */}
      {showReturnModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-slate-900/50 backdrop-blur-xs">
          <div
            className="fixed inset-0"
            onClick={() => setShowReturnModal(false)}
          />
          <div className="relative z-10 w-full max-w-4xl max-h-[90vh] flex flex-col bg-white border border-slate-200/90 rounded-2xl shadow-2xl overflow-hidden">
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/60 shrink-0">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-blue-100 text-blue-700">
                  <FileText size={20} />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    Manufacturer Return Bill / Debit Note
                  </h3>
                  <p className="text-xs text-slate-500">
                    Select a manufacturer to consolidate expiring/expired batches into a single return voucher.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowReturnModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 overflow-y-auto space-y-5">
              {/* Manufacturer & Reason Bar */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 rounded-xl bg-slate-50 border border-slate-200">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Manufacturer / Supplier <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <Building2
                      size={16}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
                    />
                    <select
                      value={selectedManufacturer}
                      onChange={(e) => handleManufacturerChange(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-sm text-slate-800 font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                    >
                      {manufacturers.map((m) => (
                        <option key={m.name} value={m.name}>
                          {m.name} ({m.expiredCount > 0 ? `${m.expiredCount} Expired, ` : ""}{m.totalStock} units available)
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Return Reason / Category
                  </label>
                  <select
                    value={returnReason}
                    onChange={(e) => setReturnReason(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  >
                    <option value="Expired / Near-Expiry Stock Return">
                      Expired / Near-Expiry Stock Return
                    </option>
                    <option value="Batch Recall by Manufacturer">
                      Batch Recall by Manufacturer
                    </option>
                    <option value="Damaged / Leakage in Transit">
                      Damaged / Leakage in Transit
                    </option>
                    <option value="Slow Moving / Excess Inventory">
                      Slow Moving / Excess Inventory
                    </option>
                  </select>
                </div>
              </div>

              {/* Items Table */}
              <div className="border border-slate-200 rounded-xl overflow-hidden">
                <div className="p-3 bg-slate-100/70 border-b border-slate-200 flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Batches from {selectedManufacturer || "Selected Manufacturer"} ({returnItems.length})
                  </span>
                  <span className="text-xs text-slate-500 font-medium">
                    Adjust return quantities for each batch below
                  </span>
                </div>

                <div className="max-h-64 overflow-y-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-slate-50 text-[11px] font-semibold text-slate-400 uppercase tracking-wider border-b border-slate-200">
                        <th className="py-2.5 px-3 w-8 text-center">Sel</th>
                        <th className="py-2.5 px-3">Medicine</th>
                        <th className="py-2.5 px-3">Batch</th>
                        <th className="py-2.5 px-3">Expiry</th>
                        <th className="py-2.5 px-3 text-center">Avail</th>
                        <th className="py-2.5 px-3 text-center w-28">Return Qty</th>
                        <th className="py-2.5 px-3 text-right">Cost (₹)</th>
                        <th className="py-2.5 px-3 text-right">Debit Amt (₹)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {returnItems.map((item) => {
                        const days = getDaysRemaining(item.expiryDate);
                        const isExpired = days < 0;
                        const isNear = days >= 0 && days <= 90;

                        return (
                          <tr
                            key={item.id}
                            className={`hover:bg-slate-50/70 transition-colors ${
                              item.selected ? "bg-blue-50/30" : ""
                            }`}
                          >
                            <td className="py-2.5 px-3 text-center">
                              <input
                                type="checkbox"
                                checked={Boolean(item.selected)}
                                onChange={() => handleToggleSelectItem(item.id)}
                                className="rounded text-blue-600 focus:ring-blue-500 h-4 w-4"
                              />
                            </td>
                            <td className="py-2.5 px-3 font-semibold text-slate-800">
                              {item.name}
                              {item.category && (
                                <span className="text-[10px] text-slate-400 block font-normal">
                                  {item.category}
                                </span>
                              )}
                            </td>
                            <td className="py-2.5 px-3 font-mono text-slate-600">
                              {item.batch || "—"}
                            </td>
                            <td className="py-2.5 px-3">
                              <span
                                className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                                  isExpired
                                    ? "bg-rose-100 text-rose-700"
                                    : isNear
                                    ? "bg-amber-100 text-amber-700"
                                    : "bg-slate-100 text-slate-600"
                                }`}
                              >
                                {formatCleanDate(item.expiryDate)}
                              </span>
                            </td>
                            <td className="py-2.5 px-3 text-center font-bold text-slate-700">
                              {item.stock}
                            </td>
                            <td className="py-2.5 px-3 text-center">
                              <input
                                type="number"
                                min="0"
                                max={item.stock}
                                value={item.returnQuantity}
                                onChange={(e) =>
                                  handleReturnItemQtyChange(item.id, e.target.value)
                                }
                                className="w-20 px-2 py-1 text-center font-bold text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500"
                              />
                            </td>
                            <td className="py-2.5 px-3 text-right text-slate-600">
                              ₹{Number(item.purchasePrice || 0).toFixed(2)}
                            </td>
                            <td className="py-2.5 px-3 text-right font-extrabold text-slate-900">
                              ₹{Number(item.total || 0).toFixed(2)}
                            </td>
                          </tr>
                        );
                      })}

                      {returnItems.length === 0 && (
                        <tr>
                          <td colSpan="8" className="py-8 text-center text-slate-400">
                            No batches with available stock found for this manufacturer.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Return Summary Bar */}
              <div className="p-4 rounded-xl bg-blue-50/60 border border-blue-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4 text-xs">
                  <div>
                    <span className="text-slate-500 block uppercase font-bold text-[10px]">
                      Selected Batches
                    </span>
                    <strong className="text-slate-900 text-sm">
                      {selectedReturnItems.length}
                    </strong>
                  </div>
                  <div className="h-6 w-px bg-blue-200" />
                  <div>
                    <span className="text-slate-500 block uppercase font-bold text-[10px]">
                      Total Return Units
                    </span>
                    <strong className="text-slate-900 text-sm">
                      {returnTotals.totalUnits} Units
                    </strong>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-slate-500 block uppercase font-bold text-[10px]">
                    Total Debit Note Value
                  </span>
                  <span className="text-xl font-extrabold text-blue-900">
                    ₹{returnTotals.totalAmount.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2.5 bg-slate-50/60 shrink-0">
              <button
                type="button"
                onClick={() => setShowReturnModal(false)}
                className="px-4 py-2 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-600 text-xs font-semibold transition-colors"
              >
                Cancel
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handlePrintReturnBill}
                  disabled={selectedReturnItems.length === 0}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 rounded-xl text-xs font-semibold shadow-xs transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Printer size={14} />
                  <span>Print Note</span>
                </button>
                <button
                  type="button"
                  onClick={handleDownloadReturnBillPDF}
                  disabled={selectedReturnItems.length === 0}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 rounded-xl text-xs font-semibold shadow-xs transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Download size={14} />
                  <span>Download PDF</span>
                </button>
                <button
                  type="button"
                  onClick={handleConfirmReturnAndDeductStock}
                  disabled={selectedReturnItems.length === 0}
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <CheckCircle2 size={15} />
                  <span>Confirm & Deduct Stock</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExpiryAlerts;
