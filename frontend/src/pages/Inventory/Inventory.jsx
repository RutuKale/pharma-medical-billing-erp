import React, { useMemo, useState } from "react";
import { Link } from "react-router-dom";
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
} from "lucide-react";

const medicinesData = [
  {
    id: 1,
    name: "Paracetamol 500mg",
    salt: "Acetaminophen",
    brand: "Dolo",
    category: "Tablet",
    stock: 120,
    minStock: 20,
    price: 35,
    expiry: "2026-02-12",
    batch: "PCM101",
    manufacturer: "Micro Labs",
  },
  {
    id: 2,
    name: "Azithromycin",
    salt: "Azithromycin",
    brand: "Azee",
    category: "Antibiotic",
    stock: 8,
    minStock: 15,
    price: 120,
    expiry: "2025-06-15",
    batch: "AZ220",
    manufacturer: "Cipla",
  },
  {
    id: 3,
    name: "Vitamin D Syrup",
    salt: "Vitamin D3",
    brand: "Shelcal",
    category: "Vitamin",
    stock: 0,
    minStock: 10,
    price: 180,
    expiry: "2025-05-20",
    batch: "VD908",
    manufacturer: "Torrent",
  },
  {
    id: 4,
    name: "Amoxicillin",
    salt: "Amoxicillin",
    brand: "Mox",
    category: "Capsule",
    stock: 45,
    minStock: 10,
    price: 95,
    expiry: "2025-08-10",
    batch: "AMX500",
    manufacturer: "Sun Pharma",
  },
];

const Inventory = () => {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState("name");
  const [sortOrder, setSortOrder] = useState("asc");

  const categories = [
    "All",
    "Tablet",
    "Capsule",
    "Antibiotic",
    "Vitamin",
  ];

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
        medicine.name.toLowerCase().includes(search.toLowerCase()) ||
        medicine.salt.toLowerCase().includes(search.toLowerCase()) ||
        medicine.brand.toLowerCase().includes(search.toLowerCase()) ||
        medicine.manufacturer.toLowerCase().includes(search.toLowerCase());

      const matchesCategory =
        category === "All" || medicine.category === category;

      return matchesSearch && matchesCategory;
    });

    // Sort
    filtered.sort((a, b) => {
      let aVal = a[sortBy];
      let bVal = b[sortBy];

      if (sortBy === "price" || sortBy === "stock") {
        aVal = Number(aVal);
        bVal = Number(bVal);
      }

      if (sortBy === "expiry") {
        aVal = new Date(aVal);
        bVal = new Date(bVal);
      }

      if (aVal < bVal) return sortOrder === "asc" ? -1 : 1;
      if (aVal > bVal) return sortOrder === "asc" ? 1 : -1;
      return 0;
    });

    return filtered;
  }, [search, category, sortBy, sortOrder]);

  const stats = {
    total: medicinesData.length,
    lowStock: medicinesData.filter(
      (m) => m.stock <= m.minStock && m.stock > 0
    ).length,
    outOfStock: medicinesData.filter((m) => m.stock === 0).length,
    expiringSoon: medicinesData.filter((m) => {
      const expiry = new Date(m.expiry);
      const today = new Date();

      const diffDays = Math.ceil(
        (expiry - today) / (1000 * 60 * 60 * 24)
      );

      return diffDays <= 30 && diffDays >= 0;
    }).length,
    totalValue: medicinesData.reduce((sum, m) => sum + m.price * m.stock, 0),
  };

  const handleSort = (column) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(column);
      setSortOrder("asc");
    }
  };

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

      <div className="relative z-10 p-4 md:p-6">
        {/* HEADER */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-white">
            {/* bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent */}
              Inventory Management
            </h1>
            <p className="text-gray-400 text-sm mt-1">
              Manage medicines, stock, expiry alerts and inventory
            </p>
          </div>

          <div className="flex gap-3">
            <button className="px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-gray-300 hover:bg-white/10 transition-all duration-200 flex items-center gap-2">
              <Download size={18} />
              Export
            </button>
            <button className="px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-gray-300 hover:bg-white/10 transition-all duration-200 flex items-center gap-2">
              <Printer size={18} />
              Print
            </button>
            <Link
              to="/inventory/add-medicine"
              className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-all duration-200 shadow-lg shadow-blue-500/20"
            >
              <Plus size={18} />
              Add Medicine
            </Link>
          </div>
        </div>

        {/* STATS CARDS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-4 mb-6">
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-5 hover:bg-white/10 transition-all duration-300 group">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-gray-400 text-sm">Total Medicines</p>
                <h2 className="text-2xl font-bold text-white mt-1">
                  {stats.total}
                </h2>
                <p className="text-xs text-blue-400 mt-2">
                  Active products
                </p>
              </div>
              <div className="p-3 rounded-xl bg-teal-500/20 group-hover:scale-110 transition-transform">
                <Package className="text-teal-400" size={20} />
              </div>
            </div>
          </div>

          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-5 hover:bg-white/10 transition-all duration-300 group">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-gray-400 text-sm">Low Stock</p>
                <h2 className="text-2xl font-bold text-orange-400 mt-1">
                  {stats.lowStock}
                </h2>
                <p className="text-xs text-gray-500 mt-2">
                  Below minimum level
                </p>
              </div>
              <div className="p-3 rounded-xl bg-orange-500/20 group-hover:scale-110 transition-transform">
                <AlertTriangle className="text-orange-400" size={20} />
              </div>
            </div>
          </div>

          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-5 hover:bg-white/10 transition-all duration-300 group">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-gray-400 text-sm">Out Of Stock</p>
                <h2 className="text-2xl font-bold text-red-400 mt-1">
                  {stats.outOfStock}
                </h2>
                <p className="text-xs text-gray-500 mt-2">
                  Need restocking
                </p>
              </div>
              <div className="p-3 rounded-xl bg-red-500/20 group-hover:scale-110 transition-transform">
                <XCircle className="text-red-400" size={20} />
              </div>
            </div>
          </div>

          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-5 hover:bg-white/10 transition-all duration-300 group">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-gray-400 text-sm">Expiring Soon</p>
                <h2 className="text-2xl font-bold text-yellow-400 mt-1">
                  {stats.expiringSoon}
                </h2>
                <p className="text-xs text-gray-500 mt-2">
                  Within 30 days
                </p>
              </div>
              <div className="p-3 rounded-xl bg-yellow-500/20 group-hover:scale-110 transition-transform">
                <Clock3 className="text-yellow-400" size={20} />
              </div>
            </div>
          </div>

          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-5 hover:bg-white/10 transition-all duration-300 group">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-gray-400 text-sm">Inventory Value</p>
                <h2 className="text-2xl font-bold text-indigo-400 mt-1">
                  ₹{stats.totalValue.toLocaleString()}
                </h2>
                <p className="text-xs text-gray-500 mt-2">
                  Total stock value
                </p>
              </div>
              <div className="p-3 rounded-xl bg-pink-500/20 group-hover:scale-110 transition-transform">
                <TrendingUp className="text-pink-400" size={20} />
              </div>
            </div>
          </div>
        </div>

        {/* SECURITY BADGE */}
        <div className="mb-6 bg-indigo-500/10 border border-indigo-500/20 rounded-xl p-3 flex items-center gap-3">
          <div className="bg-indigo-500/20 p-1.5 rounded-lg">
            <Shield size={14} className="text-indigo-400" />
          </div>
          <div>
            <p className="text-white text-xs font-medium">Secure Inventory Data</p>
            <p className="text-indigo-300/70 text-xs">Real-time stock tracking • Batch management • GST compliant</p>
          </div>
          <Sparkles size={14} className="text-indigo-400 ml-auto animate-pulse" />
        </div>

        {/* FILTERS SECTION */}
        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl mb-6 overflow-hidden">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="w-full px-4 py-3 flex items-center justify-between hover:bg-white/5 transition-colors"
          >
            <div className="flex items-center gap-2">
              <Filter size={16} className="text-blue-400" />
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
              showFilters ? "p-4 border-t border-white/10" : "max-h-0 hidden"
            }`}
          >
            <div className="flex flex-col lg:flex-row gap-4">
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
                  className="w-full bg-white/10 border border-white/20 rounded-lg pl-10 pr-4 py-2.5 text-white placeholder-gray-400 outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
              </div>

              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="bg-white/10 border border-white/20 rounded-lg px-4 py-2.5 text-white outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
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

        {/* TABLE */}
        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1000px]">
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
                  const expiryStatus = getExpiryStatus(medicine.expiry);
                  const stockStatus = getStockStatus(medicine.stock, medicine.minStock);

                  return (
                    <tr
                      key={medicine.id}
                      className="border-b border-white/10 hover:bg-white/10 transition-all duration-200 group"
                    >
                      <td className="p-4">
                        <div>
                          <h3 className="font-semibold text-white">
                            {medicine.name}
                          </h3>
                          <p className="text-sm text-gray-400">
                            {medicine.brand} • {medicine.salt}
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
                          <span className={`font-semibold ${stockStatus.color}`}>
                            {medicine.stock}
                          </span>
                          {medicine.stock <= medicine.minStock && medicine.stock > 0 && (
                            <span className="text-xs text-gray-500">
                              / {medicine.minStock}
                            </span>
                          )}
                        </div>
                      </td>

                      <td className="p-4">
                        <span className="text-white font-medium">
                          ₹{medicine.price}
                        </span>
                      </td>

                      <td className="p-4 text-gray-300">{medicine.expiry}</td>

                      <td className="p-4">
                        <span className="font-mono text-xs text-gray-400">
                          {medicine.batch}
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
                          <button className="p-2 rounded-lg bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 transition-all duration-200 group-hover:scale-110">
                            <SquarePen size={16} />
                          </button>
                          <button className="p-2 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-all duration-200 group-hover:scale-110">
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
              <p className="text-gray-400">No medicines found matching your criteria</p>
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