import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import {
  BarChart3,
  IndianRupee,
  Package,
  AlertTriangle,
  FileText,
  Calendar,
  Download,
  TrendingUp,
  Search,
  Sparkles,
  Shield,
  TrendingDown,
  PieChart as PieChartIcon,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from "recharts";

const COLORS = ["#2563eb", "#16a34a", "#ca8a04", "#9333ea", "#dc2626"];

const Reports = () => {
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  const [salesData, setSalesData] = useState([]);
  const [categorySales, setCategorySales] = useState([]);
  const [topMedicines, setTopMedicines] = useState([]);
  const [lowStockData, setLowStockData] = useState([]);
  const [expiryData, setExpiryData] = useState([]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchReportsData();
  }, []);

  const fetchReportsData = async () => {
    try {
      setLoading(true);

      const [medicinesRes, billsRes] = await Promise.all([
        axios.get("http://localhost:5000/api/medicines"),
        axios.get("http://localhost:5000/api/bills"),
      ]);

      const medicines = medicinesRes?.data?.data || [];

      const bills = billsRes?.data?.data || [];

      // Weekly Sales Data
      const weeklySales = [
        { day: "Mon", sales: 12000 },
        { day: "Tue", sales: 18500 },
        { day: "Wed", sales: 15000 },
        { day: "Thu", sales: 21000 },
        { day: "Fri", sales: 24500 },
        { day: "Sat", sales: 28000 },
        { day: "Sun", sales: 19500 },
      ];

      setSalesData(weeklySales);

      // Category Sales
      const categoryMap = {};

      medicines.forEach((med) => {
        const category = med.category || "Others";

        if (!categoryMap[category]) {
          categoryMap[category] = 0;
        }

        categoryMap[category] += 1;
      });

      const categoryArray = Object.keys(categoryMap).map((key) => ({
        name: key,
        value: categoryMap[key],
      }));

      setCategorySales(categoryArray);

      // Top Medicines
      const topMeds = medicines.slice(0, 10).map((med) => ({
        id: med._id,
        medicine: med.medicine_name,
        sold: med.stock_quantity || 0,
        revenue: (med.stock_quantity || 0) * (Number(med.selling_price) || 0),
      }));

      setTopMedicines(topMeds);

      // Low Stock
      const lowStock = medicines
        .filter((med) => med.stock_quantity <= 10)
        .map((med) => ({
          id: med._id,
          medicine: med.medicine_name,
          stock: med.stock_quantity,
        }));

      setLowStockData(lowStock);

      // Expiry Alerts
      const expiry = medicines
        .filter((med) => med.expiry_date)
        .map((med) => ({
          id: med._id,
          medicine: med.medicine_name,
          expiry: med.expiry_date,
        }));

      setExpiryData(expiry);
    } catch (err) {
      console.error(err);
      setError("Failed to fetch reports data");
    } finally {
      setLoading(false);
    }
  };

  const filteredMedicines = useMemo(() => {
    return topMedicines.filter((item) =>
      item.medicine.toLowerCase().includes(search.toLowerCase()),
    );
  }, [topMedicines, search]);

  // Pagination
  const totalPages = Math.ceil(filteredMedicines.length / itemsPerPage);
  const paginatedMedicines = filteredMedicines.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  const stats = {
    totalSales: salesData.reduce(
      (sum, item) => sum + (Number(item.sales) || 0),
      0,
    ),
    totalBills: topMedicines.length,
    lowStock: lowStockData.length,
    expiringSoon: expiryData.length,
  };

  // Custom Tooltip for Charts
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-slate-800 border border-white/10 rounded-lg p-3 shadow-xl">
          <p className="text-gray-300 text-sm">{label}</p>
          <p className="text-green-400 font-semibold">
            ₹{payload[0].value.toLocaleString()}
          </p>
        </div>
      );
    }
    return null;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900 text-white">
        Loading reports...
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900 text-red-400">
        {error}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900">
      {/* Animated Background Pattern */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 -left-4 w-96 h-96 bg-blue-500/20 rounded-full filter blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 -right-4 w-96 h-96 bg-cyan-500/20 rounded-full filter blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute inset-0 opacity-[0.03]">
          <div className="h-full w-full bg-[linear-gradient(rgba(20,184,166,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(20,184,166,0.1)_1px,transparent_1px)] bg-[size:32px_32px]"></div>
        </div>
      </div>

      <div className="relative z-10 p-4 md:p-6">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-3">
              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-cyan-400 rounded-xl blur-lg opacity-75 group-hover:opacity-100 transition-opacity"></div>
                <div className="relative bg-gradient-to-br from-blue-500 to-cyan-600 p-2.5 rounded-xl shadow-lg">
                  <BarChart3 size={24} className="text-white" />
                </div>
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                  Reports & Analytics
                </h1>
                <p className="text-blue-300/70 text-sm mt-1">
                  Pharmacy sales, inventory, and billing insights
                </p>
              </div>
            </div>
          </div>

          <div className="flex gap-3">
            <div className="bg-indigo-500/10 border border-indigo-500/20 rounded-xl px-4 py-3 flex items-center gap-3 backdrop-blur-sm">
              <Shield size={18} className="text-indigo-400" />
              <p className="text-indigo-300/90 text-sm">Real-time analytics</p>
              <Sparkles size={16} className="text-indigo-400 animate-pulse" />
            </div>
            <button className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white px-5 py-3 rounded-xl flex items-center gap-2 transition-all duration-200 shadow-lg">
              <Download size={18} />
              Export Reports
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5 mb-6">
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl shadow-xl p-5 hover:bg-white/10 transition-all duration-300 group">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Total Sales</p>
                <h2 className="text-3xl font-bold mt-2 bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">
                  ₹{stats.totalSales.toLocaleString()}
                </h2>
              </div>
              <div className="bg-green-500/20 p-4 rounded-2xl group-hover:scale-110 transition-transform duration-300">
                <IndianRupee size={24} className="text-green-400" />
              </div>
            </div>
          </div>

          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl shadow-xl p-5 hover:bg-white/10 transition-all duration-300 group">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Total Bills</p>
                <h2 className="text-3xl font-bold mt-2 bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">
                  {stats.totalBills}
                </h2>
              </div>
              <div className="bg-blue-500/20 p-4 rounded-2xl group-hover:scale-110 transition-transform duration-300">
                <FileText size={24} className="text-blue-400" />
              </div>
            </div>
          </div>

          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl shadow-xl p-5 hover:bg-white/10 transition-all duration-300 group">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Low Stock</p>
                <h2 className="text-3xl font-bold mt-2 bg-gradient-to-r from-orange-400 to-red-400 bg-clip-text text-transparent">
                  {stats.lowStock}
                </h2>
              </div>
              <div className="bg-orange-500/20 p-4 rounded-2xl group-hover:scale-110 transition-transform duration-300">
                <Package size={24} className="text-orange-400" />
              </div>
            </div>
          </div>

          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl shadow-xl p-5 hover:bg-white/10 transition-all duration-300 group">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Expiring Soon</p>
                <h2 className="text-3xl font-bold mt-2 bg-gradient-to-r from-red-400 to-rose-400 bg-clip-text text-transparent">
                  {stats.expiringSoon}
                </h2>
              </div>
              <div className="bg-red-500/20 p-4 rounded-2xl group-hover:scale-110 transition-transform duration-300">
                <AlertTriangle size={24} className="text-red-400" />
              </div>
            </div>
          </div>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mb-6">
          {/* Sales Bar Chart */}
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl shadow-xl overflow-hidden">
            <div className="bg-gradient-to-r from-green-500/10 to-emerald-500/10 px-6 py-4 border-b border-white/10">
              <div className="flex items-center gap-3">
                <div className="bg-green-500/20 p-2 rounded-xl">
                  <TrendingUp size={20} className="text-green-400" />
                </div>
                <h2 className="text-lg font-semibold text-white">
                  Weekly Sales
                </h2>
              </div>
            </div>
            <div className="p-6">
              <div className="w-full min-w-0 h-[320px]">
                <ResponsiveContainer width="99%" height={320}>
                  <BarChart data={salesData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                    <XAxis dataKey="day" stroke="#94a3b8" />
                    <YAxis stroke="#94a3b8" />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar
                      dataKey="sales"
                      radius={[10, 10, 0, 0]}
                      fill="url(#barGradient)"
                    />
                    <defs>
                      <linearGradient
                        id="barGradient"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop offset="0%" stopColor="#10b981" />
                        <stop offset="100%" stopColor="#059669" />
                      </linearGradient>
                    </defs>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Category Pie Chart */}
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl shadow-xl overflow-hidden">
            <div className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 px-6 py-4 border-b border-white/10">
              <div className="flex items-center gap-3">
                <div className="bg-purple-500/20 p-2 rounded-xl">
                  <PieChartIcon size={20} className="text-purple-400" />
                </div>
                <h2 className="text-lg font-semibold text-white">
                  Category Sales
                </h2>
              </div>
            </div>
            <div className="p-6">
              <div className="w-full min-w-0 h-[320px]">
                <ResponsiveContainer width="99%" height={320}>
                  <PieChart>
                    <Pie
                      data={categorySales}
                      dataKey="value"
                      nameKey="name"
                      outerRadius={110}
                      label={({ name, percent }) =>
                        `${name} ${(percent * 100).toFixed(0)}%`
                      }
                      labelLine={false}
                    >
                      {categorySales.map((entry, index) => (
                        <Cell
                          key={`${entry.name}-${index}`}
                          fill={COLORS[index % COLORS.length]}
                          className="cursor-pointer hover:opacity-80 transition-opacity"
                        />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#1e293b",
                        border: "1px solid rgba(255,255,255,0.1)",
                        borderRadius: "0.75rem",
                        color: "#fff",
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>

        {/* Sales Trend Line Chart */}
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl shadow-xl overflow-hidden mb-6">
          <div className="bg-gradient-to-r from-blue-500/10 to-indigo-500/10 px-6 py-4 border-b border-white/10">
            <div className="flex items-center gap-3">
              <div className="bg-blue-500/20 p-2 rounded-xl">
                <Calendar size={20} className="text-blue-400" />
              </div>
              <h2 className="text-lg font-semibold text-white">Sales Trend</h2>
            </div>
          </div>
          <div className="p-6">
            <div className="w-full min-w-0 h-[320px]">
              <ResponsiveContainer width="99%" height={320}>
                <LineChart data={salesData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis dataKey="day" stroke="#94a3b8" />
                  <YAxis stroke="#94a3b8" />
                  <Tooltip content={<CustomTooltip />} />
                  <Line
                    type="monotone"
                    dataKey="sales"
                    stroke="#06b6d4"
                    strokeWidth={3}
                    dot={{ fill: "#06b6d4", strokeWidth: 2 }}
                    activeDot={{ r: 8, fill: "#06b6d4" }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Tables Section */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* Top Medicines Table */}
          <div className="xl:col-span-2 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl shadow-xl overflow-hidden">
            <div className="bg-gradient-to-r from-blue-500/10 to-indigo-500/10 px-6 py-4 border-b border-white/10">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                <div>
                  <h2 className="text-lg font-semibold text-white">
                    Top Selling Medicines
                  </h2>
                  <p className="text-sm text-gray-400 mt-1">
                    Most sold medicines by revenue
                  </p>
                </div>
                <div className="relative w-full lg:w-72">
                  <Search
                    size={18}
                    className="absolute left-3 top-3 text-gray-400"
                  />
                  <input
                    type="text"
                    placeholder="Search medicine..."
                    value={search}
                    onChange={(e) => {
                      setSearch(e.target.value);
                      setCurrentPage(1);
                    }}
                    className="w-full bg-slate-800/50 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-white placeholder-gray-400 outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent transition-all"
                  />
                </div>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full min-w-[700px]">
                <thead className="bg-slate-800/50 border-b border-white/10">
                  <tr>
                    <th className="text-left p-4 text-sm font-semibold text-gray-300">
                      Medicine
                    </th>
                    <th className="text-left p-4 text-sm font-semibold text-gray-300">
                      Sold Qty
                    </th>
                    <th className="text-left p-4 text-sm font-semibold text-gray-300">
                      Revenue
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedMedicines.map((item) => (
                    <tr
                      key={`${item.id}-${item.medicine}`}
                      className="border-b border-white/5 hover:bg-white/5 transition-colors"
                    >
                      <td className="p-4 font-medium text-white">
                        {item.medicine}
                      </td>
                      <td className="p-4 text-gray-300">{item.sold}</td>
                      <td className="p-4 font-semibold text-green-400">
                        ₹{item.revenue.toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {filteredMedicines.length === 0 && (
                <div className="text-center py-12">
                  <Package className="mx-auto text-gray-400 mb-3" size={48} />
                  <p className="text-gray-400">No medicines found.</p>
                </div>
              )}
            </div>

            {/* Pagination */}
            {filteredMedicines.length > 0 && (
              <div className="border-t border-white/10 px-6 py-4 flex items-center justify-between">
                <p className="text-sm text-gray-400">
                  Showing {(currentPage - 1) * itemsPerPage + 1} to{" "}
                  {Math.min(
                    currentPage * itemsPerPage,
                    filteredMedicines.length,
                  )}{" "}
                  of {filteredMedicines.length} entries
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() =>
                      setCurrentPage((prev) => Math.max(prev - 1, 1))
                    }
                    disabled={currentPage === 1}
                    className="p-2 rounded-lg bg-slate-800/50 border border-white/10 text-white hover:bg-white/5 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronLeft size={18} />
                  </button>
                  <span className="px-4 py-2 rounded-lg bg-blue-500/20 text-blue-400 border border-blue-500/30">
                    {currentPage}
                  </span>
                  <button
                    onClick={() =>
                      setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                    }
                    disabled={currentPage === totalPages}
                    className="p-2 rounded-lg bg-slate-800/50 border border-white/10 text-white hover:bg-white/5 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronRight size={18} />
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Side Panels */}
          <div className="space-y-6">
            {/* Low Stock Panel */}
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl shadow-xl overflow-hidden">
              <div className="bg-gradient-to-r from-orange-500/10 to-red-500/10 px-6 py-4 border-b border-white/10">
                <div className="flex items-center gap-3">
                  <div className="bg-orange-500/20 p-2 rounded-xl">
                    <TrendingDown size={20} className="text-orange-400" />
                  </div>
                  <h2 className="text-lg font-semibold text-white">
                    Low Stock Alert
                  </h2>
                </div>
              </div>
              <div className="p-5">
                <div className="space-y-4">
                  {lowStockData.map((item) => (
                    <div
                      key={`${item.id}-${item.medicine}`}
                      className="border border-white/10 rounded-xl p-4 hover:bg-white/5 transition-colors group"
                    >
                      <h3 className="font-semibold text-white group-hover:text-orange-400 transition-colors">
                        {item.medicine}
                      </h3>
                      <div className="flex items-center justify-between mt-2">
                        <p className="text-sm text-orange-400">
                          Only {item.stock} left
                        </p>
                        <div className="w-20 h-2 bg-slate-700 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-orange-500 to-red-500 rounded-full"
                            style={{ width: `${(item.stock / 10) * 100}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Expiry Alerts Panel */}
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl shadow-xl overflow-hidden">
              <div className="bg-gradient-to-r from-red-500/10 to-rose-500/10 px-6 py-4 border-b border-white/10">
                <div className="flex items-center gap-3">
                  <div className="bg-red-500/20 p-2 rounded-xl">
                    <AlertTriangle size={20} className="text-red-400" />
                  </div>
                  <h2 className="text-lg font-semibold text-white">
                    Expiry Alerts
                  </h2>
                </div>
              </div>
              <div className="p-5">
                <div className="space-y-4">
                  {expiryData.map((item) => {
                    const daysUntilExpiry = Math.ceil(
                      (new Date(item.expiry) - new Date()) /
                        (1000 * 60 * 60 * 24),
                    );
                    return (
                      <div
                        key={`${item.id}-${item.medicine}`}
                        className="border border-white/10 rounded-xl p-4 hover:bg-white/5 transition-colors group"
                      >
                        <h3 className="font-semibold text-white group-hover:text-red-400 transition-colors">
                          {item.medicine}
                        </h3>
                        <div className="flex items-center justify-between mt-2">
                          <p className="text-sm text-red-400">
                            Expires: {item.expiry}
                          </p>
                          <span className="text-xs bg-red-500/20 text-red-400 px-2 py-1 rounded-full">
                            {daysUntilExpiry} days left
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Information Panel */}
        <div className="mt-6 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl shadow-xl overflow-hidden">
          <div className="bg-gradient-to-r from-blue-500/10 to-indigo-500/10 px-6 py-4 border-b border-white/10">
            <div className="flex items-center gap-3">
              <div className="bg-blue-500/20 p-2 rounded-xl">
                <BarChart3 size={18} className="text-blue-400" />
              </div>
              <h2 className="text-lg font-semibold text-white">
                Reporting Features
              </h2>
            </div>
          </div>

          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
              {[
                "Daily and monthly sales tracking",
                "Inventory and low stock analytics",
                "Expiry and medicine movement reports",
                "Export reports for accounting and auditing",
              ].map((feature, index) => (
                <div
                  key={index}
                  className="border border-white/10 rounded-xl p-4 flex items-center gap-3 hover:bg-white/5 transition-colors group"
                >
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-400 group-hover:scale-150 transition-transform"></div>
                  <p className="text-gray-300 text-sm">{feature}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Reports;
