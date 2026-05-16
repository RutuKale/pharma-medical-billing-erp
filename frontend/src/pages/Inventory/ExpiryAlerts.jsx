import React, { useMemo, useState } from "react";
import {
  AlertTriangle,
  Search,
  CalendarClock,
  ShieldCheck,
  XCircle,
  RotateCcw,
  Trash2,
  Filter,
  TrendingUp,
  TrendingDown,
  Package,
  Clock,
  Calendar,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Shield,
  Eye,
  Info,
} from "lucide-react";
import { Link } from "react-router-dom";

const medicinesData = [
  {
    id: 1,
    name: "Paracetamol 500mg",
    batch: "PCM101",
    stock: 120,
    expiryDate: "2026-01-15",
    manufacturer: "Micro Labs",
    category: "Tablet",
    purchasePrice: 25,
    sellingPrice: 35,
  },
  {
    id: 2,
    name: "Azithromycin",
    batch: "AZ220",
    stock: 25,
    expiryDate: "2025-06-10",
    manufacturer: "Cipla",
    category: "Antibiotic",
    purchasePrice: 85,
    sellingPrice: 120,
  },
  {
    id: 3,
    name: "Vitamin D Capsules",
    batch: "VD100",
    stock: 12,
    expiryDate: "2025-05-18",
    manufacturer: "Torrent",
    category: "Vitamin",
    purchasePrice: 140,
    sellingPrice: 180,
  },
  {
    id: 4,
    name: "Amoxicillin",
    batch: "AMX500",
    stock: 8,
    expiryDate: "2025-08-22",
    manufacturer: "Sun Pharma",
    category: "Antibiotic",
    purchasePrice: 70,
    sellingPrice: 95,
  },
  {
    id: 5,
    name: "Cough Syrup",
    batch: "CS101",
    stock: 30,
    expiryDate: "2025-05-01",
    manufacturer: "Mankind",
    category: "Syrup",
    purchasePrice: 85,
    sellingPrice: 110,
  },
];

const ExpiryAlerts = () => {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");
  const [showFilters, setShowFilters] = useState(false);
  const [selectedMedicine, setSelectedMedicine] = useState(null);
  const [showModal, setShowModal] = useState(false);

  // CALCULATE STATUS
  const getMedicineStatus = (expiryDate) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const expiry = new Date(expiryDate);

    const diffDays = Math.ceil((expiry - today) / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      return {
        label: "Expired",
        color: "bg-red-500/10 text-red-400 border-red-500/20",
        row: "bg-red-500/5",
        icon: <XCircle size={14} className="text-red-400" />,
        severity: 4,
      };
    }

    if (diffDays <= 30) {
      return {
        label: "Critical",
        color: "bg-orange-500/10 text-orange-400 border-orange-500/20",
        row: "bg-orange-500/5",
        icon: <AlertTriangle size={14} className="text-orange-400" />,
        severity: 3,
      };
    }

    if (diffDays <= 90) {
      return {
        label: "Warning",
        color: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
        row: "bg-yellow-500/5",
        icon: <CalendarClock size={14} className="text-yellow-400" />,
        severity: 2,
      };
    }

    return {
      label: "Safe",
      color: "bg-green-500/10 text-green-400 border-green-500/20",
      row: "",
      icon: <ShieldCheck size={14} className="text-green-400" />,
      severity: 1,
    };
  };

  const getDaysRemaining = (expiryDate) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const expiry = new Date(expiryDate);
    return Math.ceil((expiry - today) / (1000 * 60 * 60 * 24));
  };

  // FILTER DATA
  const filteredMedicines = useMemo(() => {
    return medicinesData
      .filter((medicine) => {
        const status = getMedicineStatus(medicine.expiryDate);

        const matchesSearch =
          medicine.name.toLowerCase().includes(search.toLowerCase()) ||
          medicine.batch.toLowerCase().includes(search.toLowerCase()) ||
          medicine.manufacturer.toLowerCase().includes(search.toLowerCase());

        const matchesFilter = filter === "All" || status.label === filter;

        return matchesSearch && matchesFilter;
      })
      .sort((a, b) => {
        const daysA = getDaysRemaining(a.expiryDate);
        const daysB = getDaysRemaining(b.expiryDate);
        return daysA - daysB;
      });
  }, [search, filter]);

  // STATS
  const stats = {
    total: medicinesData.length,
    expired: medicinesData.filter((m) => getMedicineStatus(m.expiryDate).label === "Expired").length,
    critical: medicinesData.filter((m) => getMedicineStatus(m.expiryDate).label === "Critical").length,
    warning: medicinesData.filter((m) => getMedicineStatus(m.expiryDate).label === "Warning").length,
    safe: medicinesData.filter((m) => getMedicineStatus(m.expiryDate).label === "Safe").length,
    totalValue: medicinesData.reduce((sum, m) => sum + m.stock * m.purchasePrice, 0),
    atRiskValue: medicinesData
      .filter((m) => {
        const status = getMedicineStatus(m.expiryDate);
        return status.label === "Critical" || status.label === "Warning" || status.label === "Expired";
      })
      .reduce((sum, m) => sum + m.stock * m.purchasePrice, 0),
  };

  const handleReturn = (medicine) => {
    console.log("Return medicine:", medicine);
    alert(`Return initiated for ${medicine.name}`);
  };

  const handleWriteOff = (medicine) => {
    console.log("Write off medicine:", medicine);
    alert(`${medicine.name} has been written off from inventory`);
  };

  const handleViewDetails = (medicine) => {
    setSelectedMedicine(medicine);
    setShowModal(true);
  };

  const StatusBadge = ({ status }) => (
    <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${status.color}`}>
      {status.label}
    </span>
  );

  const filterOptions = [
    { value: "All", label: "All Medicines", color: "gray" },
    { value: "Expired", label: "Expired", color: "red" },
    { value: "Critical", label: "Critical (≤30 days)", color: "orange" },
    { value: "Warning", label: "Warning (31-90 days)", color: "yellow" },
    { value: "Safe", label: "Safe (>90 days)", color: "green" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Animated Background Pattern */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 -left-4 w-96 h-96 bg-red-500/10 rounded-full filter blur-3xl"></div>
        <div className="absolute bottom-1/4 -right-4 w-96 h-96 bg-orange-500/10 rounded-full filter blur-3xl"></div>
        <div className="absolute inset-0 opacity-5">
          <div className="h-full w-full bg-[linear-gradient(rgba(20,184,166,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(20,184,166,0.1)_1px,transparent_1px)] bg-[size:32px_32px]"></div>
        </div>
      </div>

      <div className="relative z-10 p-4 md:p-6">
        {/* HEADER */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-3">
              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-r from-red-400 to-orange-400 rounded-xl blur-lg opacity-75 group-hover:opacity-100 transition-opacity"></div>
                <div className="relative bg-gradient-to-br from-red-500 to-orange-600 p-2 rounded-xl shadow-lg">
                  <AlertTriangle size={24} className="text-white" />
                </div>
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-red-400 to-orange-400 bg-clip-text text-transparent">
                  Expiry Alerts
                </h1>
                <p className="text-gray-400 text-sm mt-1">
                  Monitor medicines nearing expiry dates and take action
                </p>
              </div>
            </div>
          </div>

          <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 flex items-center gap-2">
            <Shield size={16} className="text-red-400" />
            <span className="text-red-400 text-sm font-medium">
              Expired medicines are automatically blocked from billing
            </span>
          </div>
        </div>

        {/* SECURITY BADGE */}
        <div className="mb-6 bg-amber-500/10 border border-amber-500/20 rounded-xl p-3 flex items-center gap-3">
          <div className="bg-amber-500/20 p-1.5 rounded-lg">
            <Calendar size={14} className="text-amber-400" />
          </div>
          <div>
            <p className="text-white text-xs font-medium">Expiry Management System</p>
            <p className="text-amber-300/70 text-xs">Real-time tracking • Automatic alerts • Compliance ready</p>
          </div>
          <Sparkles size={14} className="text-amber-400 ml-auto animate-pulse" />
        </div>

        {/* STATS CARDS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-6">
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-4 hover:bg-white/10 transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-xs">Total Products</p>
                <h2 className="text-2xl font-bold text-white mt-1">{stats.total}</h2>
              </div>
              <div className="p-2 rounded-lg bg-white/10">
                <Package size={18} className="text-gray-400" />
              </div>
            </div>
          </div>

          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-4 hover:bg-white/10 transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-xs">Expired</p>
                <h2 className="text-2xl font-bold text-red-400 mt-1">{stats.expired}</h2>
              </div>
              <div className="p-2 rounded-lg bg-red-500/20">
                <XCircle size={18} className="text-red-400" />
              </div>
            </div>
          </div>

          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-4 hover:bg-white/10 transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-xs">Critical (≤30d)</p>
                <h2 className="text-2xl font-bold text-orange-400 mt-1">{stats.critical}</h2>
              </div>
              <div className="p-2 rounded-lg bg-orange-500/20">
                <AlertTriangle size={18} className="text-orange-400" />
              </div>
            </div>
          </div>

          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-4 hover:bg-white/10 transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-xs">Warning (31-90d)</p>
                <h2 className="text-2xl font-bold text-yellow-400 mt-1">{stats.warning}</h2>
              </div>
              <div className="p-2 rounded-lg bg-yellow-500/20">
                <CalendarClock size={18} className="text-yellow-400" />
              </div>
            </div>
          </div>

          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-4 hover:bg-white/10 transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-xs">Safe (&gt;90d)</p>
                <h2 className="text-2xl font-bold text-green-400 mt-1">{stats.safe}</h2>
              </div>
              <div className="p-2 rounded-lg bg-green-500/20">
                <ShieldCheck size={18} className="text-green-400" />
              </div>
            </div>
          </div>

          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-4 hover:bg-white/10 transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-xs">At Risk Value</p>
                <h2 className="text-xl font-bold text-amber-400 mt-1">
                  ₹{stats.atRiskValue.toLocaleString()}
                </h2>
              </div>
              <div className="p-2 rounded-lg bg-amber-500/20">
                <TrendingDown size={18} className="text-amber-400" />
              </div>
            </div>
          </div>
        </div>

        {/* FILTERS SECTION */}
        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl mb-6 overflow-hidden">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="w-full px-5 py-3 flex items-center justify-between hover:bg-white/5 transition-colors"
          >
            <div className="flex items-center gap-2">
              <Filter size={16} className="text-orange-400" />
              <span className="text-gray-300 font-medium">Filters & Search</span>
              <span className="text-xs text-gray-500">
                ({filteredMedicines.length} medicines)
              </span>
            </div>
            {showFilters ? (
              <ChevronUp size={16} className="text-gray-400" />
            ) : (
              <ChevronDown size={16} className="text-gray-400" />
            )}
          </button>

          <div
            className={`transition-all duration-300 ${
              showFilters ? "p-5 pt-0 border-t border-white/10" : "max-h-0 hidden"
            }`}
          >
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="relative flex-1">
                <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                <input
                  type="text"
                  placeholder="Search medicine, batch or manufacturer..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full bg-white/10 border border-white/20 rounded-lg pl-10 pr-4 py-2.5 text-white placeholder-gray-400 outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                />
              </div>

              <div className="flex gap-2 flex-wrap">
                {filterOptions.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => setFilter(option.value)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                      filter === option.value
                        ? `bg-${option.color}-500/20 text-${option.color}-400 border border-${option.color}-500/30`
                        : "bg-white/10 text-gray-400 hover:text-white border border-white/10"
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* TABLE */}
        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1000px]">
              <thead className="bg-white/10 border-b border-white/10">
                <tr>
                  <th className="text-left p-4 text-sm font-semibold text-gray-300">Medicine</th>
                  <th className="text-left p-4 text-sm font-semibold text-gray-300">Manufacturer</th>
                  <th className="text-left p-4 text-sm font-semibold text-gray-300">Batch</th>
                  <th className="text-left p-4 text-sm font-semibold text-gray-300">Stock</th>
                  <th className="text-left p-4 text-sm font-semibold text-gray-300">Expiry Date</th>
                  <th className="text-left p-4 text-sm font-semibold text-gray-300">Days Left</th>
                  <th className="text-left p-4 text-sm font-semibold text-gray-300">Status</th>
                  <th className="text-left p-4 text-sm font-semibold text-gray-300">Actions</th>
                </tr>
              </thead>

              <tbody>
                {filteredMedicines.map((medicine) => {
                  const status = getMedicineStatus(medicine.expiryDate);
                  const daysRemaining = getDaysRemaining(medicine.expiryDate);

                  return (
                    <tr key={medicine.id} className={`border-b border-white/10 hover:bg-white/10 transition-all duration-200 ${status.row}`}>
                      <td className="p-4">
                        <div>
                          <h3 className="font-semibold text-white">{medicine.name}</h3>
                          <p className="text-xs text-gray-500 mt-0.5">{medicine.category}</p>
                        </div>
                      </td>
                      <td className="p-4 text-gray-300">{medicine.manufacturer}</td>
                      <td className="p-4 font-mono text-sm text-gray-400">{medicine.batch}</td>
                      <td className="p-4">
                        <span className="font-semibold text-white">{medicine.stock}</span>
                      </td>
                      <td className="p-4 text-gray-300">{medicine.expiryDate}</td>
                      <td className="p-4">
                        <span
                          className={`font-medium ${
                            daysRemaining < 0
                              ? "text-red-400"
                              : daysRemaining <= 30
                              ? "text-orange-400"
                              : daysRemaining <= 90
                              ? "text-yellow-400"
                              : "text-green-400"
                          }`}
                        >
                          {daysRemaining < 0 ? "Expired" : `${daysRemaining} days`}
                        </span>
                      </td>
                      <td className="p-4">
                        <StatusBadge status={status} />
                      </td>
                      <td className="p-4">
                        <div className="flex flex-wrap gap-2">
                          <button
                            onClick={() => handleViewDetails(medicine)}
                            className="p-2 rounded-lg bg-white/10 text-gray-400 hover:bg-white/20 hover:text-white transition-all duration-200"
                            title="View Details"
                          >
                            <Eye size={16} />
                          </button>
                          {status.label !== "Safe" && (
                            <>
                              <button
                                onClick={() => handleReturn(medicine)}
                                className="p-2 rounded-lg bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 transition-all duration-200"
                                title="Return to Supplier"
                              >
                                <RotateCcw size={16} />
                              </button>
                              <button
                                onClick={() => handleWriteOff(medicine)}
                                className="p-2 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-all duration-200"
                                title="Write Off"
                              >
                                <Trash2 size={16} />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {filteredMedicines.length === 0 && (
            <div className="text-center py-12">
              <div className="inline-flex items-center justify-center p-4 bg-white/10 rounded-full mb-4">
                <ShieldCheck size={32} className="text-gray-500" />
              </div>
              <p className="text-gray-400">No medicines found matching your criteria</p>
              <button
                onClick={() => {
                  setSearch("");
                  setFilter("All");
                }}
                className="mt-3 text-orange-400 hover:text-orange-300 text-sm"
              >
                Clear all filters
              </button>
            </div>
          )}
        </div>

        {/* INFO PANEL - Status Guide */}
        <div className="mt-6 bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6">
          <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Info size={18} className="text-orange-400" />
            Expiry Status Guide
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="border border-red-500/20 rounded-xl p-4 bg-red-500/5">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-2 h-2 bg-red-400 rounded-full"></div>
                <span className="text-red-400 font-medium text-sm">Expired</span>
              </div>
              <p className="text-sm text-gray-400">
                Already past expiry date. Automatically blocked from sale and billing.
              </p>
            </div>

            <div className="border border-orange-500/20 rounded-xl p-4 bg-orange-500/5">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-2 h-2 bg-orange-400 rounded-full"></div>
                <span className="text-orange-400 font-medium text-sm">Critical (≤30 days)</span>
              </div>
              <p className="text-sm text-gray-400">
                Expiring within next 30 days. Priority for returns or promotions.
              </p>
            </div>

            <div className="border border-yellow-500/20 rounded-xl p-4 bg-yellow-500/5">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
                <span className="text-yellow-400 font-medium text-sm">Warning (31-90 days)</span>
              </div>
              <p className="text-sm text-gray-400">
                Expiring within 31-90 days. Monitor and plan for stock movement.
              </p>
            </div>

            <div className="border border-green-500/20 rounded-xl p-4 bg-green-500/5">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                <span className="text-green-400 font-medium text-sm">Safe (&gt;90 days)</span>
              </div>
              <p className="text-sm text-gray-400">
                More than 90 days remaining. Regular stock with no immediate concern.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* DETAIL MODAL */}
      {showModal && selectedMedicine && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm" onClick={() => setShowModal(false)}>
          <div className="bg-slate-800 rounded-2xl max-w-md w-full border border-white/20 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="border-b border-white/10 p-5 flex justify-between items-center">
              <h3 className="text-lg font-semibold text-white">Medicine Details</h3>
              <button onClick={() => setShowModal(false)} className="p-1 rounded-lg hover:bg-white/10">
                <XCircle size={18} className="text-gray-400" />
              </button>
            </div>
            <div className="p-5 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-gray-400">Medicine Name</p>
                  <p className="text-white font-medium mt-1">{selectedMedicine.name}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400">Category</p>
                  <p className="text-white mt-1">{selectedMedicine.category}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400">Batch Number</p>
                  <p className="text-white font-mono text-sm mt-1">{selectedMedicine.batch}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400">Manufacturer</p>
                  <p className="text-white mt-1">{selectedMedicine.manufacturer}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400">Current Stock</p>
                  <p className="text-white font-semibold mt-1">{selectedMedicine.stock} units</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400">Expiry Date</p>
                  <p className="text-white mt-1">{selectedMedicine.expiryDate}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400">Purchase Price</p>
                  <p className="text-white mt-1">₹{selectedMedicine.purchasePrice}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400">Selling Price</p>
                  <p className="text-white mt-1">₹{selectedMedicine.sellingPrice}</p>
                </div>
              </div>
              <div className="pt-4 border-t border-white/10 flex gap-3">
                <button onClick={() => handleReturn(selectedMedicine)} className="flex-1 bg-blue-500/20 text-blue-400 py-2 rounded-lg hover:bg-blue-500/30 transition-colors">
                  Return Stock
                </button>
                <button onClick={() => handleWriteOff(selectedMedicine)} className="flex-1 bg-red-500/20 text-red-400 py-2 rounded-lg hover:bg-red-500/30 transition-colors">
                  Write Off
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