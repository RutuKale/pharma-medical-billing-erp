import React, { useMemo, useState, useEffect } from "react";
import {
  Search,
  Receipt,
  Calendar,
  Download,
  Printer,
  Eye,
  XCircle,
  IndianRupee,
  Filter,
  Sparkles,
  Shield,
  TrendingUp,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

import axios from "axios";

const API_BASE = "http://localhost:5000/api";

const BillingHistory = () => {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [dateFilter, setDateFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const [bills, setBills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewingBill, setViewingBill] = useState(null);
  const [viewingItems, setViewingItems] = useState([]);

  const fetchBills = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_BASE}/bills`);
      if (res.data?.success) {
        // map backend fields to front-end friendly shape if needed
        const mapped = res.data.data.map((b) => ({
          id: b.bill_id,
          billNumber: b.bill_number,
          patientName: b.patient_name || b.patientName || "-",
          mobile: b.mobile_number || b.mobile || "-",
          date: b.created_at ? new Date(b.created_at).toISOString().slice(0, 10) : b.date || "-",
          amount: b.grand_total || b.amount || 0,
          paymentMode: b.payment_mode || "-",
          status: b.payment_status || "Completed",
        }));
        setBills(mapped);
      }
    } catch (error) {
      console.error("Failed to load bills:", error);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchBills();
  }, []);
  const filteredBills = useMemo(() => {
    return bills.filter((bill) => {
      const matchesSearch =
        bill.billNumber.toLowerCase().includes(search.toLowerCase()) ||
        bill.patientName.toLowerCase().includes(search.toLowerCase()) ||
        bill.mobile.includes(search);
      const matchesStatus = statusFilter === "All" || bill.status === statusFilter;
      const matchesDate = !dateFilter || bill.date === dateFilter;
      return matchesSearch && matchesStatus && matchesDate;
    });
  }, [bills, search, statusFilter, dateFilter]);

  // Pagination
  const totalPages = Math.ceil(filteredBills.length / itemsPerPage);
  const paginatedBills = filteredBills.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const stats = {
    totalBills: bills.length,
    totalSales: bills
      .filter((bill) => bill.status === "Completed")
      .reduce((acc, bill) => acc + Number(bill.amount || 0), 0),
    cancelledBills: bills.filter((bill) => bill.status === "Cancelled").length,
    todayBills: bills.filter((bill) => bill.date === new Date().toISOString().slice(0, 10)).length,
  };

  const viewBill = async (bill) => {
    try {
      const res = await axios.get(`${API_BASE}/bills/${bill.id}`);
      if (res.data?.success) {
        setViewingBill(res.data.bill || res.data.data || bill);
        setViewingItems(res.data.items || []);
      } else {
        alert(res.data?.message || "Unable to fetch bill details");
      }
    } catch (error) {
      console.error("Error fetching bill details:", error);
      alert("Error fetching bill details");
    }
  };

  const printBill = (bill) => {
    console.log("Print Bill:", bill);
  };

  const downloadBill = (bill) => {
    console.log("Download PDF:", bill);
  };

  const cancelBill = async (bill) => {
    const reason = prompt("Enter cancellation reason:");
    if (!reason) return;
    try {
      const res = await axios.delete(`${API_BASE}/bills/${bill.id}`, {
        data: { reason },
      });
      if (res.data?.success) {
        alert("Bill deleted successfully");
        fetchBills();
      } else {
        alert(res.data?.message || "Unable to delete bill");
      }
    } catch (error) {
      console.error("Error deleting bill:", error);
      alert(error.response?.data?.message || "Error deleting bill");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900">
      {/* Animated Background Pattern */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 -left-4 w-96 h-96 bg-blue-500/20 rounded-full filter blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 -right-4 w-96 h-96 bg-indigo-500/20 rounded-full filter blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute inset-0 opacity-[0.03]">
          <div className="h-full w-full bg-[linear-gradient(rgba(20,184,166,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(20,184,166,0.1)_1px,transparent_1px)] bg-[size:32px_32px]"></div>
        </div>
      </div>
      {/* Bill Details Modal */}
      {viewingBill && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
          <div className="bg-slate-900 w-[92%] md:w-3/4 lg:w-2/3 rounded-2xl border border-white/10 shadow-xl overflow-hidden">
            <div className="p-4 border-b border-white/10 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-white">Bill Details - {viewingBill.bill_number || viewingBill.billNumber}</h3>
              <button onClick={() => { setViewingBill(null); setViewingItems([]); }} className="text-gray-400 hover:text-white">Close</button>
            </div>
            <div className="p-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div>
                  <p className="text-xs text-gray-400">Patient</p>
                  <p className="text-white font-medium">{viewingBill.patient_name || viewingBill.patientName || "-"}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400">Mobile</p>
                  <p className="text-white font-medium">{viewingBill.mobile_number || viewingBill.mobile || "-"}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400">Date</p>
                  <p className="text-white font-medium">{viewingBill.created_at ? new Date(viewingBill.created_at).toLocaleString() : viewingBill.date}</p>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full min-w-[600px]">
                  <thead className="bg-slate-800/50 border-b border-white/10">
                    <tr>
                      <th className="text-left p-3 text-sm text-gray-400">Medicine</th>
                      <th className="text-left p-3 text-sm text-gray-400">Qty</th>
                      <th className="text-left p-3 text-sm text-gray-400">Price</th>
                      <th className="text-left p-3 text-sm text-gray-400">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {viewingItems.length > 0 ? (
                      viewingItems.map((it) => (
                        <tr key={it.bill_item_id || it.id} className="border-b border-white/5">
                          <td className="p-3 text-white">{it.medicine_name || it.name || it.medicine_id}</td>
                          <td className="p-3 text-white">{it.quantity}</td>
                          <td className="p-3 text-white">₹{it.price}</td>
                          <td className="p-3 text-white">₹{it.total}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td className="p-3 text-gray-400" colSpan={4}>No items available</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              <div className="mt-4 flex items-center justify-end gap-3">
                <div className="text-right">
                  <p className="text-xs text-gray-400">Total</p>
                  <p className="text-xl font-bold text-white">₹{viewingBill.grand_total || viewingBill.amount || 0}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="relative z-10 p-4 md:p-6">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-3">
              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-indigo-400 rounded-xl blur-lg opacity-75 group-hover:opacity-100 transition-opacity"></div>
                <div className="relative bg-gradient-to-br from-blue-500 to-indigo-600 p-2.5 rounded-xl shadow-lg">
                  <Receipt size={24} className="text-white" />
                </div>
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">
                  Billing History
                </h1>
                <p className="text-blue-300/70 text-sm mt-1">
                  View and manage all pharmacy billing records
                </p>
              </div>
            </div>
          </div>

          <div className="bg-indigo-500/10 border border-indigo-500/20 rounded-xl px-4 py-3 flex items-center gap-3 backdrop-blur-sm">
            <Shield size={18} className="text-indigo-400" />
            <p className="text-indigo-300/90 text-sm">
              Bills are permanently stored and can be reprinted anytime
            </p>
            <Sparkles size={16} className="text-indigo-400 animate-pulse" />
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5 mb-6">
          {/* Total Bills */}
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl shadow-xl p-5 hover:bg-white/10 transition-all duration-300 group">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Total Bills</p>
                <h2 className="text-3xl font-bold mt-2 bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">
                  {stats.totalBills}
                </h2>
              </div>
              <div className="bg-blue-500/20 p-4 rounded-2xl group-hover:scale-110 transition-transform duration-300">
                <Receipt size={24} className="text-blue-400" />
              </div>
            </div>
          </div>

          {/* Total Sales */}
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl shadow-xl p-5 hover:bg-white/10 transition-all duration-300 group">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Total Sales</p>
                <h2 className="text-3xl font-bold mt-2 bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">
                  ₹{stats.totalSales}
                </h2>
              </div>
              <div className="bg-green-500/20 p-4 rounded-2xl group-hover:scale-110 transition-transform duration-300">
                <IndianRupee size={24} className="text-green-400" />
              </div>
            </div>
          </div>

          {/* Cancelled Bills */}
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl shadow-xl p-5 hover:bg-white/10 transition-all duration-300 group">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Cancelled Bills</p>
                <h2 className="text-3xl font-bold mt-2 bg-gradient-to-r from-red-400 to-rose-400 bg-clip-text text-transparent">
                  {stats.cancelledBills}
                </h2>
              </div>
              <div className="bg-red-500/20 p-4 rounded-2xl group-hover:scale-110 transition-transform duration-300">
                <XCircle size={24} className="text-red-400" />
              </div>
            </div>
          </div>

          {/* Today's Bills */}
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl shadow-xl p-5 hover:bg-white/10 transition-all duration-300 group">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Today's Bills</p>
                <h2 className="text-3xl font-bold mt-2 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                  {stats.todayBills}
                </h2>
              </div>
              <div className="bg-purple-500/20 p-4 rounded-2xl group-hover:scale-110 transition-transform duration-300">
                <Calendar size={24} className="text-purple-400" />
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl shadow-xl p-5 mb-6">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
            {/* Search */}
            <div className="relative lg:col-span-2">
              <Search size={18} className="absolute left-3 top-3 text-gray-400" />
              <input
                type="text"
                placeholder="Search bill no, patient or mobile..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full bg-slate-800/50 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-white placeholder-gray-400 outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent transition-all"
              />
            </div>

            {/* Status Filter */}
            <div className="relative">
              <Filter size={18} className="absolute left-3 top-3 text-gray-400" />
              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full bg-slate-800/50 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-white outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent transition-all"
              >
                <option className="bg-slate-900">All</option>
                <option className="bg-slate-900">Completed</option>
                <option className="bg-slate-900">Cancelled</option>
              </select>
            </div>

            {/* Date Filter */}
            <div className="relative">
              <input
                type="date"
                value={dateFilter}
                onChange={(e) => {
                  setDateFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full bg-slate-800/50 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent transition-all"
              />
            </div>
          </div>
        </div>

        {/* Bills Table */}
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl shadow-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1200px]">
              <thead className="bg-slate-800/50 border-b border-white/10">
                <tr>
                  <th className="text-left p-4 text-sm font-semibold text-gray-300">
                    Bill No
                  </th>
                  <th className="text-left p-4 text-sm font-semibold text-gray-300">
                    Patient
                  </th>
                  <th className="text-left p-4 text-sm font-semibold text-gray-300">
                    Mobile
                  </th>
                  <th className="text-left p-4 text-sm font-semibold text-gray-300">
                    Date
                  </th>
                  <th className="text-left p-4 text-sm font-semibold text-gray-300">
                    Amount
                  </th>
                  <th className="text-left p-4 text-sm font-semibold text-gray-300">
                    Payment
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
                {paginatedBills.map((bill) => (
                  <tr
                    key={bill.id}
                    className="border-b border-white/5 hover:bg-white/5 transition-colors"
                  >
                    <td className="p-4 font-semibold text-blue-400">
                      {bill.billNumber}
                    </td>
                    <td className="p-4 text-white">{bill.patientName}</td>
                    <td className="p-4 text-gray-300">{bill.mobile}</td>
                    <td className="p-4 text-gray-300">{bill.date}</td>
                    <td className="p-4 font-semibold text-white">
                      ₹{bill.amount}
                    </td>
                    <td className="p-4">
                      <span className="bg-blue-500/20 text-blue-400 px-3 py-1 rounded-full text-xs border border-blue-500/30">
                        {bill.paymentMode}
                      </span>
                    </td>
                    <td className="p-4">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          bill.status === "Completed"
                            ? "bg-green-500/20 text-green-400 border border-green-500/30"
                            : "bg-red-500/20 text-red-400 border border-red-500/30"
                        }`}
                      >
                        {bill.status}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex flex-wrap gap-2">
                        <button
                          onClick={() => viewBill(bill)}
                          className="bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 p-2 rounded-lg transition-all duration-200 hover:scale-110"
                        >
                          <Eye size={16} />
                        </button>
                        <button
                          onClick={() => printBill(bill)}
                          className="bg-green-500/20 hover:bg-green-500/30 text-green-400 p-2 rounded-lg transition-all duration-200 hover:scale-110"
                        >
                          <Printer size={16} />
                        </button>
                        <button
                          onClick={() => downloadBill(bill)}
                          className="bg-purple-500/20 hover:bg-purple-500/30 text-purple-400 p-2 rounded-lg transition-all duration-200 hover:scale-110"
                        >
                          <Download size={16} />
                        </button>
                        {bill.status !== "Cancelled" && (
                          <button
                            onClick={() => cancelBill(bill)}
                            className="bg-red-500/20 hover:bg-red-500/30 text-red-400 p-2 rounded-lg transition-all duration-200 hover:scale-110"
                          >
                            <XCircle size={16} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {filteredBills.length === 0 && (
              <div className="text-center py-12">
                <AlertCircle className="mx-auto text-gray-400 mb-3" size={48} />
                <p className="text-gray-400">No bills found.</p>
              </div>
            )}
          </div>

          {/* Pagination */}
          {filteredBills.length > 0 && (
            <div className="border-t border-white/10 px-6 py-4 flex items-center justify-between">
              <p className="text-sm text-gray-400">
                Showing {(currentPage - 1) * itemsPerPage + 1} to{" "}
                {Math.min(currentPage * itemsPerPage, filteredBills.length)} of{" "}
                {filteredBills.length} entries
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
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

        {/* Information Panel */}
        <div className="mt-6 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl shadow-xl overflow-hidden">
          <div className="bg-gradient-to-r from-blue-500/10 to-indigo-500/10 px-6 py-4 border-b border-white/10">
            <div className="flex items-center gap-3">
              <div className="bg-blue-500/20 p-2 rounded-xl">
                <TrendingUp size={18} className="text-blue-400" />
              </div>
              <h2 className="text-lg font-semibold text-white">
                Billing History Features
              </h2>
            </div>
          </div>

          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
              {[
                "Search bills by patient, mobile, or bill number",
                "Download PDF invoice anytime",
                "Print bills directly from system",
                "Cancelled bills restore stock automatically",
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

export default BillingHistory;