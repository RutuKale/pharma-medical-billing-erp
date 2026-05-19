import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Search,
  Plus,
  AlertTriangle,
  Package,
  Clock3,
  XCircle,
  Trash2,
  SquarePen,
  Filter,
  ChevronDown,
  ChevronUp,
  Shield,
  Sparkles,
  TrendingUp,
  TrendingDown,
  Printer,
  Download,
  Menu,
  X,
} from "lucide-react";
const API_URL = "http://localhost:5000/api/medicines";
import axios from "axios";
import Swal from "sweetalert2";

const Inventory = () => {
  const [medicinesData, setMedicinesData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedMedicine, setSelectedMedicine] = useState(null);

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState("medicine_name");
  const [sortOrder, setSortOrder] = useState("asc");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  const categories = [
    "All",
    ...new Set(
      medicinesData.map((medicine) => medicine.category).filter(Boolean),
    ),
  ];

  const fetchMedicines = async () => {
    try {
      setLoading(true);

      const response = await axios.get(API_URL);

      if (response.data.success) {
        setMedicinesData(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching medicines:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchSingleMedicine = async (id) => {
    try {
      const response = await axios.get(`${API_URL}/${id}`);
      if (response.data.success) {
        setSelectedMedicine(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching single medicine:", error);
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

 const handleDelete = async (medicineId) => {
  const result = await Swal.fire({
    title: "Are you sure?",
    text: "You won't be able to recover this medicine!",
    icon: "warning",
    iconColor: "#ef4444", 
    background: "#fff",
    color: "#000",
    showCancelButton: true,
    confirmButtonColor: "#ef4444",
    cancelButtonColor: "#64748b",
    confirmButtonText: "Yes, Delete It!",
    cancelButtonText: "Cancel",
  });

  if (!result.isConfirmed) return;

  try {
    const response = await axios.delete(`${API_URL}/${medicineId}`);
    if (response.data.success) {
      Swal.fire({
        title: "Deleted!",
        text: "Medicine deleted successfully.",
        icon: "success",
        iconColor: "#22c55e",
        background: "#fff",
        color: "#000",
        confirmButtonColor: "#22c55e",
      });
      fetchMedicines();
    }
  } catch (error) {
    Swal.fire({
      title: "Error!",
      text: "Failed to delete medicine.",
      icon: "error",
      iconColor: "#ef4444",
      background: "linear-gradient(to right, #141e30, #243b55)",
      color: "#ffffff",
      confirmButtonColor: "#ef4444",
    });
  }
};

  const getExpiryStatus = (expiryDate) => {
    const today = new Date();
    const expiry = new Date(expiryDate);
    const diffTime = expiry - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      return {
        label: "Expired",
        color: "bg-red-500/10 text-red-400 border-red-500/20",
      };
    }

    if (diffDays <= 30) {
      return {
        label: "Critical",
        color: "bg-orange-500/10 text-orange-400 border-orange-500/20",
      };
    }

    if (diffDays <= 90) {
      return {
        label: "Warning",
        color: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
      };
    }

    return {
      label: "Safe",
      color: "bg-green-500/10 text-green-400 border-green-500/20",
    };
  };

  const getStockStatus = (stock, minStock) => {
    if (stock === 0) {
      return {
        label: "Out of Stock",
        color: "text-red-400",
        icon: <XCircle size={14} className="text-red-400" />,
      };
    }
    if (stock <= minStock) {
      return {
        label: "Low Stock",
        color: "text-orange-400",
        icon: <AlertTriangle size={14} className="text-orange-400" />,
      };
    }
    return {
      label: "In Stock",
      color: "text-green-400",
      icon: <Package size={14} className="text-green-400" />,
    };
  };

  const filteredMedicines = useMemo(() => {
    let filtered = medicinesData.filter((medicine) => {
      const matchesSearch =
        medicine.medicine_name?.toLowerCase().includes(search.toLowerCase()) ||
        medicine.salt_name?.toLowerCase().includes(search.toLowerCase()) ||
        medicine.brand_name?.toLowerCase().includes(search.toLowerCase()) ||
        medicine.manufacturer?.toLowerCase().includes(search.toLowerCase());

      const matchesCategory =
        category === "All" || medicine.category === category;

      return matchesSearch && matchesCategory;
    });

    filtered.sort((a, b) => {
      let aVal = a[sortBy];
      let bVal = b[sortBy];

      if (sortBy === "selling_price" || sortBy === "quantity") {
        aVal = Number(aVal);
        bVal = Number(bVal);
      }

      if (sortBy === "expiry_date") {
        aVal = new Date(aVal);
        bVal = new Date(bVal);
      }

      if (aVal < bVal) return sortOrder === "asc" ? -1 : 1;
      if (aVal > bVal) return sortOrder === "asc" ? 1 : -1;

      return 0;
    });

    return filtered;
  }, [medicinesData, search, category, sortBy, sortOrder]);

  const stats = {
    total: medicinesData.length,

    lowStock: medicinesData.filter(
      (m) => m.quantity <= m.min_stock && m.quantity > 0,
    ).length,

    outOfStock: medicinesData.filter((m) => m.quantity === 0).length,

    totalValue: medicinesData.reduce(
      (sum, m) => sum + m.selling_price * m.quantity,
      0,
    ),
  };

  const handleSort = (column) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(column);
      setSortOrder("asc");
    }
  };

  if (loading) {
    return <div className="text-white p-10">Loading medicines...</div>;
  }

  const SortIcon = ({ column }) => {
    if (sortBy !== column) return null;
    return sortOrder === "asc" ? (
      <ChevronUp size={14} className="inline ml-1" />
    ) : (
      <ChevronDown size={14} className="inline ml-1" />
    );
  };

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

      <div className="relative z-10 p-4 sm:p-5 md:p-6 lg:p-8">
        {/* HEADER */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-white">
              Inventory Management
            </h1>
            <p className="text-gray-400 text-xs sm:text-sm mt-1">
              Manage medicines, stock, expiry alerts and inventory
            </p>
          </div>

          {/* Desktop Action Buttons */}
          <div className="hidden sm:flex gap-3">
            <button className="px-3 sm:px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-gray-300 hover:bg-white/10 transition-all duration-200 flex items-center gap-2 text-sm sm:text-base">
              <Download size={18} />
              Export
            </button>
            <button className="px-3 sm:px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-gray-300 hover:bg-white/10 transition-all duration-200 flex items-center gap-2 text-sm sm:text-base">
              <Printer size={18} />
              Print
            </button>
            <Link
              to="/inventory/add-medicine"
              className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white px-3 sm:px-4 py-2 rounded-lg flex items-center gap-2 transition-all duration-200 shadow-lg shadow-blue-500/20 text-sm sm:text-base"
            >
              <Plus size={18} />
              Add Medicine
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <div className="sm:hidden flex justify-end">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg bg-white/5 border border-white/10 text-gray-300"
            >
              {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {/* Mobile Action Buttons Dropdown */}
        {mobileMenuOpen && (
          <div className="sm:hidden mb-6 p-4 bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl space-y-3 animate-in slide-in-from-top-2">
            <button className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-gray-300 hover:bg-white/10 transition-all duration-200 flex items-center justify-center gap-2">
              <Download size={18} />
              Export
            </button>
            <button className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-gray-300 hover:bg-white/10 transition-all duration-200 flex items-center justify-center gap-2">
              <Printer size={18} />
              Print
            </button>
            <Link
              to="/inventory/add-medicine"
              className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white px-4 py-2 rounded-lg flex items-center justify-center gap-2 transition-all duration-200"
            >
              <Plus size={18} />
              Add Medicine
            </Link>
          </div>
        )}

        {/* STATS CARDS - Responsive Grid */}
        <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3 sm:gap-4 mb-6">
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-4 sm:p-5 hover:bg-white/10 transition-all duration-300 group">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-gray-400 text-xs sm:text-sm">
                  Total Medicines
                </p>
                <h2 className="text-xl sm:text-2xl font-bold text-white mt-1">
                  {stats.total}
                </h2>
                <p className="text-[10px] sm:text-xs text-blue-400 mt-2">
                  Active products
                </p>
              </div>
              <div className="p-2 sm:p-3 rounded-xl bg-teal-500/20 group-hover:scale-110 transition-transform">
                <Package className="text-teal-400" size={18} />
              </div>
            </div>
          </div>

          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-4 sm:p-5 hover:bg-white/10 transition-all duration-300 group">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-gray-400 text-xs sm:text-sm">Low Stock</p>
                <h2 className="text-xl sm:text-2xl font-bold text-orange-400 mt-1">
                  {stats.lowStock}
                </h2>
                <p className="text-[10px] sm:text-xs text-gray-500 mt-2">
                  Below minimum level
                </p>
              </div>
              <div className="p-2 sm:p-3 rounded-xl bg-orange-500/20 group-hover:scale-110 transition-transform">
                <AlertTriangle className="text-orange-400" size={18} />
              </div>
            </div>
          </div>

          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-4 sm:p-5 hover:bg-white/10 transition-all duration-300 group">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-gray-400 text-xs sm:text-sm">Out Of Stock</p>
                <h2 className="text-xl sm:text-2xl font-bold text-red-400 mt-1">
                  {stats.outOfStock}
                </h2>
                <p className="text-[10px] sm:text-xs text-gray-500 mt-2">
                  Need restocking
                </p>
              </div>
              <div className="p-2 sm:p-3 rounded-xl bg-red-500/20 group-hover:scale-110 transition-transform">
                <XCircle className="text-red-400" size={18} />
              </div>
            </div>
          </div>

          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-4 sm:p-5 hover:bg-white/10 transition-all duration-300 group">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-gray-400 text-xs sm:text-sm">
                  Expiring Soon
                </p>
                <h2 className="text-xl sm:text-2xl font-bold text-yellow-400 mt-1">
                  {stats.expiringSoon}
                </h2>
                <p className="text-[10px] sm:text-xs text-gray-500 mt-2">
                  Within 30 days
                </p>
              </div>
              <div className="p-2 sm:p-3 rounded-xl bg-yellow-500/20 group-hover:scale-110 transition-transform">
                <Clock3 className="text-yellow-400" size={18} />
              </div>
            </div>
          </div>

          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-4 sm:p-5 hover:bg-white/10 transition-all duration-300 group col-span-1 xs:col-span-2 lg:col-span-1">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-gray-400 text-xs sm:text-sm">
                  Inventory Value
                </p>
                <h2 className="text-xl sm:text-2xl font-bold text-indigo-400 mt-1">
                  ₹{stats.totalValue.toLocaleString()}
                </h2>
                <p className="text-[10px] sm:text-xs text-gray-500 mt-2">
                  Total stock value
                </p>
              </div>
              <div className="p-2 sm:p-3 rounded-xl bg-pink-500/20 group-hover:scale-110 transition-transform">
                <TrendingUp className="text-pink-400" size={18} />
              </div>
            </div>
          </div>
        </div>

        {/* SECURITY BADGE */}
        <div className="mb-6 bg-indigo-500/10 border border-indigo-500/20 rounded-xl p-3 flex flex-wrap items-center gap-3">
          <div className="bg-indigo-500/20 p-1.5 rounded-lg">
            <Shield size={14} className="text-indigo-400" />
          </div>
          <div className="flex-1 min-w-[180px]">
            <p className="text-white text-xs font-medium">
              Secure Inventory Data
            </p>
            <p className="text-indigo-300/70 text-[10px] sm:text-xs">
              Real-time stock tracking • Batch management • GST compliant
            </p>
          </div>
          <Sparkles
            size={14}
            className="text-indigo-400 animate-pulse flex-shrink-0"
          />
        </div>

        {/* FILTERS SECTION */}
        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl mb-6 overflow-hidden">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="w-full px-4 py-3 flex items-center justify-between hover:bg-white/5 transition-colors"
          >
            <div className="flex items-center gap-2">
              <Filter size={16} className="text-blue-400" />
              <span className="text-gray-300 font-medium text-sm sm:text-base">
                Filters & Search
              </span>
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
              showFilters ? "p-4 border-t border-white/10" : "max-h-0 hidden"
            }`}
          >
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search
                  size={18}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                />
                <input
                  type="text"
                  placeholder="Search medicine, salt, brand or manufacturer..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full bg-white/10 border border-white/20 rounded-lg pl-10 pr-4 py-2.5 text-white placeholder-gray-400 outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-sm sm:text-base"
                />
              </div>

              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="bg-white/10 border border-white/20 rounded-lg px-4 py-2.5 text-white outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer text-sm sm:text-base"
              >
                {categories.map((cat, index) => (
                  <option key={index} value={cat} className="bg-slate-800">
                    {cat}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* DESKTOP TABLE VIEW (hidden on mobile) */}
        <div className="hidden lg:block bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[800px]">
              <thead className="bg-white/10 border-b border-white/10">
                <tr>
                  <th
                    className="text-left p-4 text-sm font-semibold text-gray-300 cursor-pointer hover:text-blue-400 transition-colors"
                    onClick={() => handleSort("name")}
                  >
                    Medicine <SortIcon column="name" />
                  </th>
                  <th
                    className="text-left p-4 text-sm font-semibold text-gray-300 cursor-pointer hover:text-blue-400 transition-colors"
                    onClick={() => handleSort("category")}
                  >
                    Category <SortIcon column="category" />
                  </th>
                  <th
                    className="text-left p-4 text-sm font-semibold text-gray-300 cursor-pointer hover:text-blue-400 transition-colors"
                    onClick={() => handleSort("stock")}
                  >
                    Stock <SortIcon column="stock" />
                  </th>
                  <th
                    className="text-left p-4 text-sm font-semibold text-gray-300 cursor-pointer hover:text-blue-400 transition-colors"
                    onClick={() => handleSort("price")}
                  >
                    Price <SortIcon column="price" />
                  </th>
                  <th
                    className="text-left p-4 text-sm font-semibold text-gray-300 cursor-pointer hover:text-blue-400 transition-colors"
                    onClick={() => handleSort("expiry")}
                  >
                    Expiry <SortIcon column="expiry" />
                  </th>
                  <th className="text-left p-4 text-sm font-semibold text-gray-300">
                    Batch
                  </th>
                  <th className="text-left p-4 text-sm font-semibold text-gray-300">
                    Status
                  </th>
                  <th className="text-left p-4 text-sm font-semibold text-gray-300">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody>
                {filteredMedicines.map((medicine) => {
                  const expiryStatus = getExpiryStatus(medicine.expiry_date);
                  const stockStatus = getStockStatus(
                    medicine.quantity,
                    medicine.min_stock,
                  );

                  return (
                    <tr
                      key={medicine.medicine_id}
                      className="border-b border-white/10 hover:bg-white/10 transition-all duration-200 group"
                    >
                      <td className="p-4">
                        <div>
                          <h3 className="font-semibold text-white">
                            {medicine.medicine_name}
                          </h3>
                          <p className="text-sm text-gray-400">
                            {medicine.brand_name} • {medicine.salt_name}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            {medicine.manufacturer}
                          </p>
                        </div>
                      </td>

                      <td className="p-4">
                        <span className="px-2 py-1 rounded-lg text-xs bg-white/10 text-gray-300">
                          {medicine.category}
                        </span>
                      </td>

                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          {stockStatus.icon}
                          <span
                            className={`font-semibold ${stockStatus.color}`}
                          >
                            {medicine.quantity}
                          </span>
                          {medicine.quantity <= medicine.min_stock &&
                            medicine.quantity > 0 && (
                              <span className="text-xs text-gray-500">
                                / {medicine.min_stock}
                              </span>
                            )}
                        </div>
                      </td>

                      <td className="p-4">
                        <span className="text-white font-medium">
                          ₹{medicine.selling_price}
                        </span>
                      </td>

                      <td className="p-4 text-gray-300">
                        {medicine.expiry_date}
                      </td>

                      <td className="p-4">
                        <span className="font-mono text-xs text-gray-400">
                          {medicine.batch_number}
                        </span>
                      </td>

                      <td className="p-4">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold border ${expiryStatus.color}`}
                        >
                          {expiryStatus.label}
                        </span>
                      </td>

                      <td className="p-4">
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleEdit(medicine)}
                            className="p-2 rounded-lg bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 transition-all duration-200 group-hover:scale-110"
                          >
                            <SquarePen size={16} />
                          </button>
                          <button
                            onClick={() => handleDelete(medicine.medicine_id)}
                            className="p-2 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-all duration-200 group-hover:scale-110"
                          >
                            <Trash2 size={16} />
                          </button>
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
                <Package size={32} className="text-gray-500" />
              </div>
              <p className="text-gray-400">
                No medicines found matching your criteria
              </p>
              <button
                onClick={() => {
                  setSearch("");
                  setCategory("All");
                }}
                className="mt-3 text-blue-400 hover:text-blue-300 text-sm"
              >
                Clear all filters
              </button>
            </div>
          )}
        </div>

        {/* MOBILE & TABLET CARD VIEW (visible on smaller screens) */}
        <div className="lg:hidden space-y-4">
          {filteredMedicines.map((medicine) => {
            const expiryStatus = getExpiryStatus(medicine.expiry_date);
            const stockStatus = getStockStatus(
              medicine.quantity,
              medicine.min_stock,
            );

            return (
              <div
                key={medicine.medicine_id}
                className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-4 hover:bg-white/10 transition-all duration-200"
              >
                {/* Header with name and actions */}
                <div className="flex justify-between items-start mb-3">
                  <div className="flex-1">
                    <h3 className="font-semibold text-white text-base sm:text-lg">
                      {medicine.medicine_name}
                    </h3>
                    <p className="text-xs sm:text-sm text-gray-400">
                      {medicine.brand_name} • {medicine.salt_name}
                    </p>
                  </div>
                  <div className="flex gap-2 ml-2">
                    <button
                      onClick={() => handleEdit(medicine)}
                      className="p-2 rounded-lg bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 transition-all duration-200"
                    >
                      <SquarePen size={16} />
                    </button>
                    <button
                      onClick={() => handleDelete(medicine.medicine_id)}
                      className="p-2 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-all duration-200"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>

                {/* Details Grid */}
                <div className="grid grid-cols-2 gap-3 mb-3">
                  <div>
                    <p className="text-gray-500 text-xs">Category</p>
                    <span className="inline-block px-2 py-0.5 rounded-lg text-xs bg-white/10 text-gray-300 mt-1">
                      {medicine.category}
                    </span>
                  </div>
                  <div>
                    <p className="text-gray-500 text-xs">Batch</p>
                    <p className="text-gray-300 text-xs sm:text-sm font-mono mt-1">
                      {medicine.batch_number}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-500 text-xs">Manufacturer</p>
                    <p className="text-gray-300 text-xs sm:text-sm mt-1">
                      {medicine.manufacturer}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-500 text-xs">Price</p>
                    <p className="text-white font-medium text-sm sm:text-base mt-1">
                      ₹{medicine.selling_price}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-500 text-xs">Stock Status</p>
                    <div className="flex items-center gap-2 mt-1">
                      {stockStatus.icon}
                      <span
                        className={`font-semibold text-sm ${stockStatus.color}`}
                      >
                        {medicine.quantity} units
                      </span>
                      {medicine.quantity <= medicine.min_stock &&
                        medicine.quantity > 0 && (
                          <span className="text-xs text-gray-500">
                            (Min: {medicine.min_stock})
                          </span>
                        )}
                    </div>
                  </div>
                  <div>
                    <p className="text-gray-500 text-xs">Expiry</p>
                    <div className="flex flex-col gap-1 mt-1">
                      <p className="text-gray-300 text-xs sm:text-sm">
                        {medicine.expiry_date}
                      </p>
                      <span
                        className={`inline-block w-fit px-2 py-0.5 rounded-full text-[10px] font-semibold border ${expiryStatus.color}`}
                      >
                        {expiryStatus.label}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}

          {filteredMedicines.length === 0 && (
            <div className="text-center py-12 bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl">
              <div className="inline-flex items-center justify-center p-4 bg-white/10 rounded-full mb-4">
                <Package size={32} className="text-gray-500" />
              </div>
              <p className="text-gray-400 text-sm">
                No medicines found matching your criteria
              </p>
              <button
                onClick={() => {
                  setSearch("");
                  setCategory("All");
                }}
                className="mt-3 text-blue-400 hover:text-blue-300 text-sm"
              >
                Clear all filters
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Inventory;
