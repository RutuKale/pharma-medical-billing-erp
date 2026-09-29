import React, { useMemo, useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import Pagination from "../../components/Pagination";
import {
  Search,
  Calendar,
  Download,
  Printer,
  Eye,
  XCircle,
  IndianRupee,
  Filter,
  TrendingUp,
  AlertCircle,
  Plus,
  Users,
  X,
  Clock,
  RotateCcw,
  CheckCircle2,
  Phone,
  FileText,
  Stethoscope,
  Banknote,
  Shield,
  Edit,
} from "lucide-react";
import Swal from "sweetalert2";
import apiClient from "../../utils/apiClient";
import {
  printBill as utilityPrintBill,
  downloadBillPDF as utilityDownloadBillPDF,
} from "../../utils/billUtils";

const BillingHistory = () => {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [dateFilter, setDateFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;
  const navigate = useNavigate();

  const [bills, setBills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewingBill, setViewingBill] = useState(null);
  const [viewingItems, setViewingItems] = useState([]);
  const [modalLoading, setModalLoading] = useState(false);

  const fetchBills = async () => {
    setLoading(true);
    try {
      const res = await apiClient.get(`/bills`);
      if (res.data?.success) {
        const mapped = res.data.data.map((b) => ({
          id: b.bill_id,
          billNumber: b.bill_number || b.billNumber || "-",
          patientName: b.patient_name || b.patientName || "-",
          mobile: b.mobile_number || b.mobile || "-",
          date: b.bill_date
            ? new Date(b.bill_date).toISOString().slice(0, 10)
            : b.created_at
              ? new Date(b.created_at).toISOString().slice(0, 10)
              : b.date || "-",
          amount: b.grand_total || b.amount || 0,
          paymentMode: b.payment_mode || "-",
          status: b.payment_status || "Completed",
          doctorName: b.doctor_name || "-",
          prescriptionNumber: b.prescription_number || "-",
        }));
        setBills(mapped);
      }
    } catch (error) {
      console.error("Failed to load bills:", error);
      Swal.fire({
        icon: "error",
        title: "Error Loading Invoices",
        text: "Unable to retrieve billing records from database.",
        confirmButtonColor: "#2563eb",
      });
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
        (bill.billNumber || "").toLowerCase().includes(search.toLowerCase()) ||
        (bill.patientName || "").toLowerCase().includes(search.toLowerCase()) ||
        (bill.mobile || "").includes(search);
      const matchesStatus =
        statusFilter === "All" || bill.status === statusFilter;
      const matchesDate = !dateFilter || bill.date === dateFilter;
      return matchesSearch && matchesStatus && matchesDate;
    });
  }, [bills, search, statusFilter, dateFilter]);

  // Pagination
  const totalPages = Math.ceil(filteredBills.length / itemsPerPage);
  const paginatedBills = filteredBills.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  const stats = useMemo(() => {
    const totalBills = bills.length;
    const completedBills = bills.filter((b) => b.status === "Completed");
    const totalSales = completedBills.reduce(
      (acc, bill) => acc + Number(bill.amount || 0),
      0,
    );
    const cancelledBills = bills.filter((b) => b.status === "Cancelled").length;
    const todayStr = new Date().toISOString().slice(0, 10);
    const todayBills = bills.filter((b) => b.date === todayStr).length;

    return { totalBills, totalSales, cancelledBills, todayBills };
  }, [bills]);

  const viewBill = async (bill) => {
    setModalLoading(true);
    setViewingBill(bill);
    setViewingItems([]);
    try {
      const res = await apiClient.get(`/bills/${bill.id}`);
      if (res.data?.success) {
        setViewingBill(res.data.bill || res.data.data || bill);
        setViewingItems(res.data.items || []);
      } else {
        Swal.fire({
          icon: "error",
          title: "Unable to Load Invoice",
          text: res.data?.message || "Could not fetch details for this bill.",
          confirmButtonColor: "#2563eb",
        });
      }
    } catch (error) {
      console.error("Error fetching bill details:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Failed to load complete bill items.",
        confirmButtonColor: "#2563eb",
      });
    } finally {
      setModalLoading(false);
    }
  };

  const fetchBillDetails = async (billId) => {
    try {
      const res = await apiClient.get(`/bills/${billId}`);
      if (res.data?.success) {
        const fullBill = res.data.bill || res.data.data;
        const items = res.data.items || [];

        return {
          invoiceNo: fullBill.bill_number,
          date: fullBill.bill_date
            ? new Date(fullBill.bill_date).toLocaleString()
            : fullBill.created_at
              ? new Date(fullBill.created_at).toLocaleString()
              : fullBill.date || "-",
          patient: {
            name: fullBill.patient_name || "-",
            mobile: fullBill.mobile_number || "-",
            doctorName: fullBill.doctor_name || "-",
            prescriptionNumber: fullBill.prescription_number || "-",
            age: fullBill.age || "-",
            gender: fullBill.gender || "-",
            patientId: fullBill.patient_id || "",
          },
          medicines: items.map((it) => ({
            name: it.medicine_name || it.name || it.medicine_id,
            batch: it.batch_number || "-",
            quantity: Number(it.quantity),
            price: Number(it.price),
            gst: Number(it.gst || 0),
            discount: Number(it.discount || 0),
            total: Number(it.total),
          })),
          paymentMode: fullBill.payment_mode || "-",
          totals: {
            subtotal: Number(fullBill.subtotal || 0),
            discountTotal: Number(fullBill.total_discount || 0),
            gstTotal: Number(fullBill.total_gst || 0),
            grandTotal: Number(fullBill.grand_total || 0),
          },
        };
      }
    } catch (error) {
      console.error("Error fetching bill details:", error);
    }
    return null;
  };

  const printBill = async (bill) => {
    const billData = await fetchBillDetails(bill.id);
    if (billData) {
      utilityPrintBill(billData);
    } else {
      Swal.fire({
        icon: "error",
        title: "Print Failed",
        text: "Failed to retrieve invoice details for printing.",
        confirmButtonColor: "#2563eb",
      });
    }
  };

  const downloadBill = async (bill) => {
    const billData = await fetchBillDetails(bill.id);
    if (billData) {
      utilityDownloadBillPDF(billData);
    } else {
      Swal.fire({
        icon: "error",
        title: "Download Failed",
        text: "Failed to retrieve invoice details for PDF export.",
        confirmButtonColor: "#2563eb",
      });
    }
  };

  const cancelBill = async (bill) => {
    const { value: reason } = await Swal.fire({
      title: "Cancel / Void Bill",
      text: `Enter reason for cancelling bill #${bill.billNumber}:`,
      input: "text",
      inputPlaceholder: "e.g. Returned items, Customer changed mind",
      showCancelButton: true,
      confirmButtonText: "Confirm Cancellation",
      cancelButtonText: "Dismiss",
      confirmButtonColor: "#e11d48",
      cancelButtonColor: "#64748b",
      inputValidator: (value) => {
        if (!value || !value.trim()) {
          return "Cancellation reason is required.";
        }
      },
    });

    if (!reason) return;

    try {
      const res = await apiClient.delete(`/bills/${bill.id}`, {
        data: { reason },
      });
      if (res.data?.success) {
        Swal.fire({
          icon: "success",
          title: "Bill Cancelled",
          text: "Invoice status updated to Cancelled and medicine stock has been restored.",
          confirmButtonColor: "#2563eb",
        });
        fetchBills();
      } else {
        Swal.fire({
          icon: "error",
          title: "Cancellation Failed",
          text: res.data?.message || "Unable to cancel bill.",
          confirmButtonColor: "#2563eb",
        });
      }
    } catch (error) {
      console.error("Error deleting bill:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: error.response?.data?.message || "Failed to process cancellation.",
        confirmButtonColor: "#2563eb",
      });
    }
  };

  const handleEditBill = (bill) => {
    if (bill.status === "Cancelled") {
      Swal.fire({
        icon: "warning",
        title: "Cannot Edit Cancelled Bill",
        text: "This bill has been cancelled/voided and cannot be edited.",
        confirmButtonColor: "#2563eb",
      });
      return;
    }
    navigate(`/billing?editBillId=${bill.id}`);
  };

  const resetFilters = () => {
    setSearch("");
    setStatusFilter("All");
    setDateFilter("");
    setCurrentPage(1);
  };

  const hasActiveFilters = Boolean(
    search || statusFilter !== "All" || dateFilter,
  );

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-[1600px] mx-auto space-y-6">
      {/* 1. HEADER SECTION (No icon next to title per design standards) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <span>Billing History</span>
          </h1>
          <p className="text-slate-500 text-xs sm:text-sm mt-0.5">
            Audit pharmacy transactions, view customer receipts, and manage invoice status.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <Link
            to="/billing"
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-semibold shadow-xs transition-colors"
          >
            <Plus size={16} />
            <span>New Billing</span>
          </Link>
          <Link
            to="/patients"
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 rounded-xl text-sm font-semibold shadow-xs transition-colors"
          >
            <Users size={16} className="text-slate-500" />
            <span>Patients</span>
          </Link>
        </div>
      </div>

      {/* 2. STAT CARDS ROW */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Bills */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-xs hover:shadow-sm transition-all flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Total Invoices
              </p>
              <p className="text-2xl font-bold text-slate-900 mt-2">
                {stats.totalBills}
              </p>
            </div>
            <div className="p-2.5 rounded-xl bg-blue-50 text-blue-600 border border-blue-100">
              <IndianRupee size={20} />
            </div>
          </div>
          <div className="mt-4 flex items-center gap-1.5 text-xs text-slate-500 font-medium">
            <span>All recorded pharmacy bills</span>
          </div>
        </div>

        {/* Total Sales */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-xs hover:shadow-sm transition-all flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Total Revenue
              </p>
              <p className="text-2xl font-bold text-slate-900 mt-2">
                ₹
                {stats.totalSales.toLocaleString("en-IN", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </p>
            </div>
            <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100">
              <TrendingUp size={20} />
            </div>
          </div>
          <div className="mt-4 flex items-center gap-1.5 text-xs text-emerald-600 font-medium">
            <CheckCircle2 size={13} />
            <span>Completed sales only</span>
          </div>
        </div>

        {/* Today's Bills */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-xs hover:shadow-sm transition-all flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Today's Bills
              </p>
              <p className="text-2xl font-bold text-slate-900 mt-2">
                {stats.todayBills}
              </p>
            </div>
            <div className="p-2.5 rounded-xl bg-purple-50 text-purple-600 border border-purple-100">
              <Calendar size={20} />
            </div>
          </div>
          <div className="mt-4 flex items-center gap-1.5 text-xs text-slate-500 font-medium">
            <Clock size={13} className="text-purple-500" />
            <span>Generated today</span>
          </div>
        </div>

        {/* Cancelled Bills */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-xs hover:shadow-sm transition-all flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Cancelled Bills
              </p>
              <p className="text-2xl font-bold text-slate-900 mt-2">
                {stats.cancelledBills}
              </p>
            </div>
            <div className="p-2.5 rounded-xl bg-rose-50 text-rose-600 border border-rose-100">
              <XCircle size={20} />
            </div>
          </div>
          <div className="mt-4 flex items-center gap-1.5 text-xs text-slate-500 font-medium">
            <span>Voided transactions</span>
          </div>
        </div>
      </div>

      {/* 3. SEARCH & FILTERS CARD */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/90 shadow-xs space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Search Bar */}
          <div className="relative flex-1">
            <Search
              size={16}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
            />
            <input
              type="text"
              placeholder="Search by Bill #, Patient name, or Mobile..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full bg-slate-50/60 border border-slate-200 rounded-xl pl-10 pr-10 py-2.5 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium"
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
              >
                <X size={15} />
              </button>
            )}
          </div>

          {/* Quick Filters */}
          <div className="flex items-center gap-2.5 flex-wrap">
            {/* Status Tabs */}
            <div className="flex items-center p-1 bg-slate-100 rounded-xl border border-slate-200/70">
              {["All", "Completed", "Cancelled"].map((status) => (
                <button
                  key={status}
                  type="button"
                  onClick={() => {
                    setStatusFilter(status);
                    setCurrentPage(1);
                  }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    statusFilter === status
                      ? "bg-white text-blue-600 shadow-xs"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  {status}
                </button>
              ))}
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
                className="bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              />
            </div>

            {/* Reset Filters */}
            {hasActiveFilters && (
              <button
                type="button"
                onClick={resetFilters}
                className="inline-flex items-center gap-1 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl text-xs font-semibold transition-colors"
                title="Reset all filters"
              >
                <RotateCcw size={13} />
                <span>Reset</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 4. BILLS TABLE CARD */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
        <div className="p-4 sm:p-5 flex items-center justify-between border-b border-slate-100">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              Invoices List
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Showing {filteredBills.length} recorded transactions
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[950px]">
            <thead>
              <tr className="border-b border-slate-100 text-[11px] font-semibold text-slate-400 uppercase tracking-wider bg-slate-50/60">
                <th className="py-3 px-4">Bill #</th>
                <th className="py-3 px-4">Patient</th>
                <th className="py-3 px-4">Mobile</th>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Payment</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Amount</th>
                <th className="py-3 px-4 text-center w-36">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {paginatedBills.map((bill) => (
                <tr
                  key={bill.id}
                  className="hover:bg-slate-50/60 transition-colors"
                >
                  <td className="py-3.5 px-4">
                    <span className="font-mono text-xs font-semibold px-2.5 py-1 rounded-md bg-blue-50 text-blue-700 border border-blue-100">
                      {bill.billNumber}
                    </span>
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="font-semibold text-slate-900">
                      {bill.patientName}
                    </div>
                    {bill.doctorName && bill.doctorName !== "-" && (
                      <div className="text-xs text-slate-400 mt-0.5 flex items-center gap-1">
                        <Stethoscope size={12} />
                        <span>Dr. {bill.doctorName}</span>
                      </div>
                    )}
                  </td>
                  <td className="py-3.5 px-4 text-slate-600 font-medium">
                    {bill.mobile}
                  </td>
                  <td className="py-3.5 px-4 text-slate-600 text-xs">
                    {bill.date && !isNaN(new Date(bill.date).getTime())
                      ? new Date(bill.date).toLocaleDateString("en-IN", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        })
                      : bill.date}
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-700">
                      <Banknote size={12} className="text-slate-400" />
                      {bill.paymentMode}
                    </span>
                  </td>
                  <td className="py-3.5 px-4">
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                        bill.status === "Completed"
                          ? "bg-emerald-50 text-emerald-700 border border-emerald-100"
                          : "bg-rose-50 text-rose-700 border border-rose-100"
                      }`}
                    >
                      {bill.status === "Completed" ? (
                        <CheckCircle2 size={12} />
                      ) : (
                        <XCircle size={12} />
                      )}
                      {bill.status}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right font-extrabold text-slate-900">
                    ₹{Number(bill.amount || 0).toFixed(2)}
                  </td>
                  <td className="py-3.5 px-4 text-center">
                    <div className="flex items-center justify-center gap-1">
                      <button
                        type="button"
                        onClick={() => viewBill(bill)}
                        className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="View details"
                      >
                        <Eye size={15} />
                      </button>
                      {bill.status !== "Cancelled" && (
                        <button
                          type="button"
                          onClick={() => handleEditBill(bill)}
                          className="p-1.5 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                          title="Edit Bill"
                        >
                          <Edit size={15} />
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => printBill(bill)}
                        className="p-1.5 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                        title="Print receipt"
                      >
                        <Printer size={15} />
                      </button>
                      <button
                        type="button"
                        onClick={() => downloadBill(bill)}
                        className="p-1.5 text-slate-400 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                        title="Download PDF"
                      >
                        <Download size={15} />
                      </button>
                      {bill.status !== "Cancelled" && (
                        <button
                          type="button"
                          onClick={() => cancelBill(bill)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                          title="Void / Cancel bill"
                        >
                          <XCircle size={15} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filteredBills.length === 0 && (
            <div className="text-center py-14 px-4 space-y-2">
              <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 mx-auto flex items-center justify-center">
                <IndianRupee size={24} />
              </div>
              <p className="text-sm font-semibold text-slate-700">
                No billing records found
              </p>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                {hasActiveFilters
                  ? "Try resetting your search query or status filters."
                  : "Start creating bills in the New Billing POS to record invoices here."}
              </p>
              {hasActiveFilters && (
                <button
                  type="button"
                  onClick={resetFilters}
                  className="mt-2 inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-blue-50 text-blue-600 rounded-xl text-xs font-semibold hover:bg-blue-100 transition-colors"
                >
                  <RotateCcw size={13} />
                  <span>Reset Filters</span>
                </button>
              )}
            </div>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="p-4 border-t border-slate-100 flex items-center justify-between">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalItems={filteredBills.length}
              itemsPerPage={itemsPerPage}
              onPageChange={setCurrentPage}
            />
          </div>
        )}
      </div>

      {/* 5. BILL DETAILS MODAL */}
      {viewingBill && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div
            className="fixed inset-0"
            onClick={() => {
              setViewingBill(null);
              setViewingItems([]);
            }}
          />
          <div className="relative z-10 bg-white w-full max-w-2xl rounded-2xl border border-slate-200 shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
            {/* Modal Header */}
            <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-blue-50 text-blue-600 border border-blue-100">
                  <IndianRupee size={18} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-slate-900 text-base">
                      Invoice Details
                    </h3>
                    <span className="font-mono text-xs font-semibold px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-100">
                      {viewingBill.bill_number || viewingBill.billNumber}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {viewingBill.bill_date
                      ? new Date(viewingBill.bill_date).toLocaleString("en-IN")
                      : viewingBill.created_at
                        ? new Date(viewingBill.created_at).toLocaleString("en-IN")
                        : viewingBill.date || "—"}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  setViewingBill(null);
                  setViewingItems([]);
                }}
                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 overflow-y-auto space-y-4">
              {/* Patient Info Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 p-3.5 rounded-xl bg-slate-50 border border-slate-100 text-xs">
                <div>
                  <span className="text-slate-400 block font-medium">Patient</span>
                  <span className="font-bold text-slate-800 mt-0.5 block truncate">
                    {viewingBill.patient_name || viewingBill.patientName || "—"}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block font-medium">Mobile</span>
                  <span className="font-semibold text-slate-800 mt-0.5 block">
                    {viewingBill.mobile_number || viewingBill.mobile || "—"}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block font-medium">Payment Mode</span>
                  <span className="font-semibold text-slate-800 mt-0.5 block">
                    {viewingBill.payment_mode || viewingBill.paymentMode || "—"}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block font-medium">Status</span>
                  <span
                    className={`font-bold mt-0.5 block ${
                      (viewingBill.payment_status || viewingBill.status) ===
                      "Completed"
                        ? "text-emerald-600"
                        : "text-rose-600"
                    }`}
                  >
                    {viewingBill.payment_status || viewingBill.status}
                  </span>
                </div>
              </div>

              {/* Items List */}
              <div className="border border-slate-200/90 rounded-xl overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 border-b border-slate-100 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                    <tr>
                      <th className="py-2.5 px-3">Medicine</th>
                      <th className="py-2.5 px-3 text-center">Qty</th>
                      <th className="py-2.5 px-3 text-right">Price</th>
                      <th className="py-2.5 px-3 text-right">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {modalLoading ? (
                      <tr>
                        <td colSpan={4} className="py-6 text-center text-slate-400">
                          Loading line items...
                        </td>
                      </tr>
                    ) : viewingItems.length > 0 ? (
                      viewingItems.map((item, idx) => (
                        <tr key={idx} className="hover:bg-slate-50/50">
                          <td className="py-2.5 px-3">
                            <div className="font-semibold text-slate-800">
                              {item.medicine_name || item.name || item.medicine_id}
                            </div>
                            {item.batch_number && (
                              <div className="text-[10px] text-slate-400 font-mono">
                                Batch: {item.batch_number}
                              </div>
                            )}
                          </td>
                          <td className="py-2.5 px-3 text-center font-bold text-slate-700">
                            {item.quantity}
                          </td>
                          <td className="py-2.5 px-3 text-right text-slate-600">
                            ₹{Number(item.price || 0).toFixed(2)}
                          </td>
                          <td className="py-2.5 px-3 text-right font-bold text-slate-900">
                            ₹{Number(item.total || 0).toFixed(2)}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={4} className="py-6 text-center text-slate-400">
                          No line items found.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Summary Breakdown */}
              <div className="p-3.5 rounded-xl bg-slate-50/70 border border-slate-100 space-y-1.5 text-xs">
                {viewingBill.subtotal !== undefined && (
                  <div className="flex justify-between text-slate-500">
                    <span>Subtotal</span>
                    <span className="font-medium text-slate-700">
                      ₹{Number(viewingBill.subtotal || 0).toFixed(2)}
                    </span>
                  </div>
                )}
                {viewingBill.total_discount !== undefined && Number(viewingBill.total_discount) > 0 && (
                  <div className="flex justify-between text-rose-600">
                    <span>Discount</span>
                    <span className="font-medium">
                      -₹{Number(viewingBill.total_discount || 0).toFixed(2)}
                    </span>
                  </div>
                )}
                {viewingBill.total_gst !== undefined && Number(viewingBill.total_gst) > 0 && (
                  <div className="flex justify-between text-slate-500">
                    <span>GST Tax</span>
                    <span className="font-medium text-slate-700">
                      +₹{Number(viewingBill.total_gst || 0).toFixed(2)}
                    </span>
                  </div>
                )}
                <div className="pt-2 border-t border-slate-200 flex justify-between items-baseline">
                  <span className="font-bold text-slate-800 text-sm">
                    Grand Total
                  </span>
                  <span className="font-extrabold text-slate-900 text-base">
                    ₹{Number(viewingBill.grand_total || viewingBill.amount || 0).toFixed(2)}
                  </span>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-slate-100 flex items-center justify-end gap-2.5 bg-slate-50/40">
              {viewingBill.status !== "Cancelled" && (
                <button
                  type="button"
                  onClick={() => handleEditBill(viewingBill)}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-800 rounded-xl text-xs font-semibold shadow-xs transition-colors"
                >
                  <Edit size={14} />
                  <span>Edit Bill</span>
                </button>
              )}
              <button
                type="button"
                onClick={() => printBill(viewingBill)}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 rounded-xl text-xs font-semibold shadow-xs transition-colors"
              >
                <Printer size={14} />
                <span>Print Bill</span>
              </button>
              <button
                type="button"
                onClick={() => downloadBill(viewingBill)}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 rounded-xl text-xs font-semibold shadow-xs transition-colors"
              >
                <Download size={14} />
                <span>Download PDF</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setViewingBill(null);
                  setViewingItems([]);
                }}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BillingHistory;
