import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import {
  Package,
  Search,
  AlertTriangle,
  Shield,
  Sparkles,
  TrendingUp,
  TrendingDown,
  Calendar,
  ArrowLeft,
  Clock3,
  Copy,
  FileText,
  Box,
  BarChart3,
} from "lucide-react";

const MEDICINES_API = "http://localhost:5000/api/medicines";
const INVENTORY_LOG_API = "http://localhost:5000/api/inventory";

const Stock = () => {
  const [medicines, setMedicines] = useState([]);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [movementType, setMovementType] = useState("All");

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [medicinesRes, logsRes] = await Promise.all([
          axios.get(MEDICINES_API),
          axios.get(INVENTORY_LOG_API),
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

  const filteredMedicines = useMemo(() => {
    return medicines.filter((medicine) => {
      const term = search.toLowerCase();
      return (
        medicine.medicine_name?.toLowerCase().includes(term) ||
        medicine.batch_number?.toLowerCase().includes(term) ||
        medicine.category?.toLowerCase().includes(term)
      );
    });
  }, [medicines, search]);

  const filteredLogs = useMemo(() => {
    return logs.filter((log) => {
      if (movementType !== "All" && log.movement_type !== movementType) {
        return false;
      }
      if (!search) return true;
      const term = search.toLowerCase();
      return (
        log.medicine_name?.toLowerCase().includes(term) ||
        String(log.medicine_id).includes(term) ||
        log.batch_number?.toLowerCase().includes(term) ||
        log.remarks?.toLowerCase().includes(term)
      );
    });
  }, [logs, movementType, search]);

  const stats = useMemo(() => {
    const total = medicines.length;
    const outOfStock = medicines.filter((item) => Number(item.quantity) === 0).length;
    const lowStock = medicines.filter(
      (item) => Number(item.quantity) > 0 && Number(item.quantity) <= Number(item.min_stock || 0),
    ).length;
    const totalValue = medicines.reduce(
      (sum, item) => sum + Number(item.selling_price || 0) * Number(item.quantity || 0),
      0,
    );

    return { total, outOfStock, lowStock, totalValue };
  }, [medicines]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center">
        Loading stock information...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 -left-4 w-96 h-96 bg-blue-500/20 rounded-full filter blur-3xl"></div>
        <div className="absolute bottom-1/4 -right-4 w-96 h-96 bg-indigo-500/20 rounded-full filter blur-3xl"></div>
        <div className="absolute inset-0 opacity-5">
          <div className="h-full w-full bg-[linear-gradient(rgba(20,184,166,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(20,184,166,0.1)_1px,transparent_1px)] bg-[size:32px_32px]"></div>
        </div>
      </div>

      <div className="relative z-10 p-4 md:p-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-3">
              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-indigo-400 rounded-xl blur-lg opacity-75 group-hover:opacity-100 transition-opacity"></div>
                <div className="relative bg-gradient-to-br from-blue-500 to-indigo-600 p-2.5 rounded-xl shadow-lg">
                  <Package size={24} className="text-white" />
                </div>
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">
                  Stock Overview
                </h1>
                <p className="text-blue-300/70 text-sm mt-1">
                  Medicine stock levels driven by billing and inventory movement.
                </p>
              </div>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link
              to="/inventory"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10 border border-white/10 text-white hover:bg-white/15 transition"
            >
              <ArrowLeft size={16} />
              Back to Inventory
            </Link>
            <Link
              to="/inventory/stock-in"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-green-600 to-emerald-600 text-white hover:from-green-700 hover:to-emerald-700 transition"
            >
              <TrendingUp size={16} />
              Stock In
            </Link>
          </div>
        </div>

        <div className="mb-6 bg-indigo-500/10 border border-indigo-500/20 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3">
            <Shield size={18} className="text-indigo-400" />
            <div>
              <p className="text-white text-sm font-medium">Billing-driven Stock Changes</p>
              <p className="text-indigo-300 text-xs">Stock out updates are recorded from billing operations automatically.</p>
            </div>
          </div>
          <Sparkles size={18} className="text-indigo-400 animate-pulse" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
          <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
            <p className="text-gray-400 text-xs uppercase tracking-[0.2em]">Total Medicines</p>
            <p className="text-3xl font-bold text-white mt-3">{stats.total}</p>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
            <p className="text-gray-400 text-xs uppercase tracking-[0.2em]">Low Stock</p>
            <p className="text-3xl font-bold text-orange-400 mt-3">{stats.lowStock}</p>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
            <p className="text-gray-400 text-xs uppercase tracking-[0.2em]">Out of Stock</p>
            <p className="text-3xl font-bold text-red-400 mt-3">{stats.outOfStock}</p>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
            <p className="text-gray-400 text-xs uppercase tracking-[0.2em]">Inventory Value</p>
            <p className="text-3xl font-bold text-emerald-400 mt-3">₹{stats.totalValue.toLocaleString()}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-6">
          <div className="xl:col-span-2 bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
            <div className="border-b border-white/10 p-4">
              <h2 className="text-lg font-semibold text-white">Medicine Stock</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[720px]">
                <thead className="bg-slate-800/70 border-b border-white/10">
                  <tr>
                    <th className="text-left p-4 text-xs uppercase tracking-[0.18em] text-gray-400">Medicine</th>
                    <th className="text-left p-4 text-xs uppercase tracking-[0.18em] text-gray-400">Stock</th>
                    <th className="text-left p-4 text-xs uppercase tracking-[0.18em] text-gray-400">Min Stock</th>
                    <th className="text-left p-4 text-xs uppercase tracking-[0.18em] text-gray-400">Price</th>
                    <th className="text-left p-4 text-xs uppercase tracking-[0.18em] text-gray-400">Expiry</th>
                    <th className="text-left p-4 text-xs uppercase tracking-[0.18em] text-gray-400">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredMedicines.map((medicine) => {
                    const expiryDate = new Date(medicine.expiry_date || medicine.expiryDate || medicine.expiry);
                    const expiryDays = Math.ceil((expiryDate - new Date()) / (1000 * 60 * 60 * 24));
                    const expiryStatus = expiryDays < 0 ? "Expired" : expiryDays <= 30 ? "Critical" : expiryDays <= 90 ? "Warning" : "Safe";
                    return (
                      <tr key={medicine.medicine_id || medicine.id} className="border-b border-white/10 hover:bg-white/5 transition">
                        <td className="p-4">
                          <div className="font-medium text-white">{medicine.medicine_name || medicine.name}</div>
                          <div className="text-xs text-gray-400 mt-1">{medicine.batch_number || medicine.batch}</div>
                        </td>
                        <td className="p-4 text-white font-semibold">{medicine.quantity}</td>
                        <td className="p-4 text-gray-300">{medicine.min_stock ?? "-"}</td>
                        <td className="p-4 text-gray-300">₹{Number(medicine.selling_price || medicine.price || 0).toFixed(2)}</td>
                        <td className="p-4 text-gray-300">{medicine.expiry_date || medicine.expiry || "-"}</td>
                        <td className="p-4">
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${expiryStatus === "Expired" ? "bg-red-500/10 text-red-400 border border-red-500/20" : expiryStatus === "Critical" ? "bg-orange-500/10 text-orange-400 border border-orange-500/20" : expiryStatus === "Warning" ? "bg-yellow-500/10 text-yellow-400 border border-yellow-500/20" : "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"}`}>
                            {expiryStatus}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                  {filteredMedicines.length === 0 && (
                    <tr>
                      <td className="p-4 text-center text-gray-400" colSpan={6}>
                        No medicines match your search.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-2xl p-5 space-y-4">
            <div className="flex items-start gap-3">
              <div className="p-3 rounded-2xl bg-blue-500/10">
                <Box size={20} className="text-blue-400" />
              </div>
              <div>
                <h3 className="text-white font-semibold">Billing Stock Out</h3>
                <p className="text-gray-400 text-sm mt-1">
                  Stock out activity is generated from billing operations, not manual adjustments.
                </p>
              </div>
            </div>
            <div className="bg-slate-900/80 border border-white/10 rounded-2xl p-4">
              <p className="text-xs uppercase text-gray-400 tracking-[0.2em] mb-2">Last Billing Stock Outs</p>
              <div className="space-y-3">
                {logs.filter((log) => log.movement_type === "STOCK_OUT").slice(0, 4).map((log) => (
                  <div key={log.inventory_log_id} className="rounded-xl bg-white/5 p-3">
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-sm text-white font-semibold">{log.medicine_name}</span>
                      <span className="text-xs text-red-300">-{log.quantity}</span>
                    </div>
                    <p className="text-xs text-gray-400 mt-1">{log.remarks || "Sold via billing"}</p>
                  </div>
                ))}
                {logs.filter((log) => log.movement_type === "STOCK_OUT").length === 0 && (
                  <p className="text-sm text-gray-400">No billing stock-out records found yet.</p>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
          <div className="border-b border-white/10 p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold text-white">Inventory Movement Log</h2>
              <p className="text-sm text-gray-400 mt-1">Track stock in/out entries created from billing and stock adjustments.</p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <div className="relative">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search medicine, batch, remarks..."
                  className="bg-slate-900/80 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-white placeholder-gray-500 outline-none focus:ring-2 focus:ring-blue-500 transition"
                />
              </div>
              <select
                value={movementType}
                onChange={(e) => setMovementType(e.target.value)}
                className="bg-slate-900/80 border border-white/10 rounded-xl px-4 py-2.5 text-white outline-none focus:ring-2 focus:ring-blue-500 transition"
              >
                <option>All</option>
                <option>STOCK_IN</option>
                <option>STOCK_OUT</option>
              </select>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[960px]">
              <thead className="bg-slate-800/70 border-b border-white/10">
                <tr>
                  <th className="text-left p-4 text-xs uppercase tracking-[0.18em] text-gray-400">Date</th>
                  <th className="text-left p-4 text-xs uppercase tracking-[0.18em] text-gray-400">Medicine</th>
                  <th className="text-left p-4 text-xs uppercase tracking-[0.18em] text-gray-400">Type</th>
                  <th className="text-left p-4 text-xs uppercase tracking-[0.18em] text-gray-400">Quantity</th>
                  <th className="text-left p-4 text-xs uppercase tracking-[0.18em] text-gray-400">Previous</th>
                  <th className="text-left p-4 text-xs uppercase tracking-[0.18em] text-gray-400">Current</th>
                  <th className="text-left p-4 text-xs uppercase tracking-[0.18em] text-gray-400">Remarks</th>
                </tr>
              </thead>
              <tbody>
                {filteredLogs.map((log) => (
                  <tr key={log.inventory_log_id} className="border-b border-white/10 hover:bg-white/5 transition">
                    <td className="p-4 text-gray-300 text-sm">{new Date(log.created_at || log.createdAt || log.date || Date.now()).toLocaleString()}</td>
                    <td className="p-4 text-white font-medium">{log.medicine_name}</td>
                    <td className="p-4 text-sm text-white">
                      <span className={`px-2 py-1 rounded-full text-[11px] font-semibold ${log.movement_type === "STOCK_IN" ? "bg-emerald-500/10 text-emerald-300" : "bg-red-500/10 text-red-300"}`}>
                        {log.movement_type}
                      </span>
                    </td>
                    <td className="p-4 text-white">{log.quantity}</td>
                    <td className="p-4 text-gray-300">{log.previous_stock}</td>
                    <td className="p-4 text-gray-300">{log.current_stock}</td>
                    <td className="p-4 text-gray-400">{log.remarks || "-"}</td>
                  </tr>
                ))}
                {filteredLogs.length === 0 && (
                  <tr>
                    <td className="p-4 text-center text-gray-400" colSpan={7}>
                      No inventory movements found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Stock;
