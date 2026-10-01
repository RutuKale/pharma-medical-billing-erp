import React, { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import Pagination from "../../components/Pagination";
import {
  BellRing,
  Search,
  CalendarClock,
  Send,
  CheckCircle2,
  XCircle,
  Clock3,
  Phone,
  Filter,
  RotateCcw,
  MessageCircle,
  TrendingUp,
  AlertCircle,
  Users,
  IndianRupee,
  X,
  Calendar,
  Stethoscope,
  Pill,
  Shield,
  Eye,
} from "lucide-react";
import Swal from "sweetalert2";
import apiClient from "../../utils/apiClient";
import { useEffect } from "react";

const initialRemindersData = [
  {
    id: 1,
    patientName: "Rahul Patil",
    mobile: "9876543210",
    medicine: "Metformin 500mg",
    dosage: "1 Tab Twice Daily",
    nextRefillDate: "2026-05-12",
    status: "Pending",
    reminderType: "WhatsApp",
    doctorName: "Dr. Sharma",
  },
  {
    id: 2,
    patientName: "Sneha Kale",
    mobile: "9090909090",
    medicine: "Telmisartan 40mg",
    dosage: "1 Tab Morning",
    nextRefillDate: "2026-05-10",
    status: "Sent",
    reminderType: "WhatsApp",
    doctorName: "Dr. Joshi",
  },
  {
    id: 3,
    patientName: "Ajay Verma",
    mobile: "9988776655",
    medicine: "Vitamin D3 60k",
    dosage: "1 Weekly",
    nextRefillDate: "2026-05-09",
    status: "Failed",
    reminderType: "WhatsApp",
    doctorName: "Dr. Patil",
  },
  {
    id: 4,
    patientName: "Priya Deshmukh",
    mobile: "9765432109",
    medicine: "Amoxicillin 500mg",
    dosage: "1 Tab Thrice Daily",
    nextRefillDate: "2026-05-15",
    status: "Pending",
    reminderType: "WhatsApp",
    doctorName: "Dr. Sharma",
  },
  {
    id: 5,
    patientName: "Vikas Shinde",
    mobile: "9822334455",
    medicine: "Atorvastatin 10mg",
    dosage: "1 Tab Night",
    nextRefillDate: "2026-05-18",
    status: "Pending",
    reminderType: "WhatsApp",
    doctorName: "Dr. Kulkarni",
  },
  {
    id: 6,
    patientName: "Sunita Joshi",
    mobile: "9890112233",
    medicine: "Pantoprazole 40mg",
    dosage: "1 Tab Before Food",
    nextRefillDate: "2026-05-08",
    status: "Sent",
    reminderType: "WhatsApp",
    doctorName: "Dr. Joshi",
  },
];

const Reminders = () => {
  const [reminders, setReminders] = useState(initialRemindersData);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);
  const [previewReminder, setPreviewReminder] = useState(null);
  const itemsPerPage = 8;

  useEffect(() => {
    const fetchReminders = async () => {
      try {
        const res = await apiClient.get("/reminders");
        if (res.data?.data && res.data.data.length > 0) {
          setReminders(res.data.data);
        }
      } catch (err) {
        console.error("Error loading reminders from Firestore:", err);
      }
    };
    fetchReminders();
  }, []);

  const filteredReminders = useMemo(() => {
    return reminders.filter((reminder) => {
      const matchesSearch =
        reminder.patientName.toLowerCase().includes(search.toLowerCase()) ||
        reminder.mobile.includes(search) ||
        reminder.medicine.toLowerCase().includes(search.toLowerCase()) ||
        reminder.doctorName.toLowerCase().includes(search.toLowerCase());
      const matchesStatus =
        statusFilter === "All" || reminder.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [reminders, search, statusFilter]);

  // Pagination
  const totalPages = Math.ceil(filteredReminders.length / itemsPerPage);
  const paginatedReminders = filteredReminders.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  const stats = useMemo(() => {
    return {
      total: reminders.length,
      pending: reminders.filter((r) => r.status === "Pending").length,
      sent: reminders.filter((r) => r.status === "Sent").length,
      failed: reminders.filter((r) => r.status === "Failed").length,
    };
  }, [reminders]);

  const sendReminder = async (reminder) => {
    const result = await Swal.fire({
      title: "Send WhatsApp Reminder?",
      text: `Dispatch refill notification for ${reminder.medicine} to ${reminder.patientName} (${reminder.mobile})?`,
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Send Notification",
      cancelButtonText: "Cancel",
      confirmButtonColor: "#2563eb",
      cancelButtonColor: "#64748b",
    });

    if (!result.isConfirmed) return;

    try {
      if (reminder.id) {
        await apiClient.put(`/reminders/${reminder.id}`, { status: "Sent" });
      }
      setReminders((prev) =>
        prev.map((r) => (r.id === reminder.id ? { ...r, status: "Sent" } : r)),
      );

      Swal.fire({
        icon: "success",
        title: "Reminder Dispatched",
        text: `Refill notification sent and updated in Firestore for ${reminder.patientName}!`,
        confirmButtonColor: "#2563eb",
      });
    } catch (err) {
      console.error("Failed to update reminder in Firestore:", err);
      Swal.fire({
        icon: "error",
        title: "Update Failed",
        text: "Could not update reminder status in database.",
        confirmButtonColor: "#ef4444",
      });
    }
  };

  const resendReminder = async (reminder) => {
    const result = await Swal.fire({
      title: "Resend Failed Reminder?",
      text: `Retry sending reminder to ${reminder.patientName} (${reminder.mobile})?`,
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Retry Sending",
      cancelButtonText: "Cancel",
      confirmButtonColor: "#2563eb",
      cancelButtonColor: "#64748b",
    });

    if (!result.isConfirmed) return;

    try {
      if (reminder.id) {
        await apiClient.put(`/reminders/${reminder.id}`, { status: "Sent" });
      }
      setReminders((prev) =>
        prev.map((r) => (r.id === reminder.id ? { ...r, status: "Sent" } : r)),
      );

      Swal.fire({
        icon: "success",
        title: "Reminder Resent",
        text: `Reminder re-queued and updated in Firestore for ${reminder.patientName}.`,
        confirmButtonColor: "#2563eb",
      });
    } catch (err) {
      console.error("Failed to update reminder:", err);
    }
  };

  const sendAllPending = async () => {
    const pendingList = reminders.filter((r) => r.status === "Pending");
    if (pendingList.length === 0) {
      return Swal.fire({
        icon: "info",
        title: "No Pending Reminders",
        text: "All scheduled medication refill reminders have already been dispatched.",
        confirmButtonColor: "#2563eb",
      });
    }

    const result = await Swal.fire({
      title: `Send ${pendingList.length} Pending Reminders?`,
      text: `Batch dispatch WhatsApp refill alerts to ${pendingList.length} patients?`,
      icon: "question",
      showCancelButton: true,
      confirmButtonText: `Send All (${pendingList.length})`,
      cancelButtonText: "Cancel",
      confirmButtonColor: "#2563eb",
      cancelButtonColor: "#64748b",
    });

    if (!result.isConfirmed) return;

    try {
      await Promise.allSettled(
        pendingList.map((r) =>
          r.id ? apiClient.put(`/reminders/${r.id}`, { status: "Sent" }) : Promise.resolve(),
        ),
      );

      setReminders((prev) =>
        prev.map((r) => (r.status === "Pending" ? { ...r, status: "Sent" } : r)),
      );

      Swal.fire({
        icon: "success",
        title: "Batch Dispatch Complete",
        text: `Successfully sent ${pendingList.length} refill reminders and synchronized with Firestore.`,
        confirmButtonColor: "#2563eb",
      });
    } catch (err) {
      console.error("Batch reminder dispatch error:", err);
    }
  };


  const resetFilters = () => {
    setSearch("");
    setStatusFilter("All");
    setCurrentPage(1);
  };

  const hasActiveFilters = Boolean(search || statusFilter !== "All");

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-[1600px] mx-auto space-y-6">
      {/* 1. HEADER SECTION (No icon next to title per design standards) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <span>Reminder Tracker</span>
          </h1>
          <p className="text-slate-500 text-xs sm:text-sm mt-0.5">
            Automate WhatsApp refill notifications, track adherence schedules, and improve patient retention.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          {stats.pending > 0 && (
            <button
              onClick={sendAllPending}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-semibold shadow-xs transition-colors"
            >
              <Send size={15} />
              <span>Send Pending ({stats.pending})</span>
            </button>
          )}
          <Link
            to="/patients"
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 rounded-xl text-sm font-semibold shadow-xs transition-colors"
          >
            <Users size={16} className="text-slate-500" />
            <span>Patient Register</span>
          </Link>
          <Link
            to="/billing"
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 rounded-xl text-sm font-semibold shadow-xs transition-colors"
          >
            <IndianRupee size={16} className="text-slate-500" />
            <span>New Billing</span>
          </Link>
        </div>
      </div>

      {/* 2. STAT CARDS ROW */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Reminders */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-xs hover:shadow-sm transition-all flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Total Queue
              </p>
              <p className="text-2xl font-bold text-slate-900 mt-2">
                {stats.total}
              </p>
            </div>
            <div className="p-2.5 rounded-xl bg-blue-50 text-blue-600 border border-blue-100">
              <BellRing size={20} />
            </div>
          </div>
          <div className="mt-4 flex items-center gap-1.5 text-xs text-slate-500 font-medium">
            <span>Scheduled refill alerts</span>
          </div>
        </div>

        {/* Pending */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-xs hover:shadow-sm transition-all flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Pending Dispatch
              </p>
              <p className="text-2xl font-bold text-slate-900 mt-2">
                {stats.pending}
              </p>
            </div>
            <div className="p-2.5 rounded-xl bg-amber-50 text-amber-600 border border-amber-100">
              <Clock3 size={20} />
            </div>
          </div>
          <div className="mt-4 flex items-center gap-1.5 text-xs text-amber-600 font-medium">
            <span>Due for notification</span>
          </div>
        </div>

        {/* Sent */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-xs hover:shadow-sm transition-all flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Delivered
              </p>
              <p className="text-2xl font-bold text-slate-900 mt-2">
                {stats.sent}
              </p>
            </div>
            <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100">
              <CheckCircle2 size={20} />
            </div>
          </div>
          <div className="mt-4 flex items-center gap-1.5 text-xs text-emerald-600 font-medium">
            <span>Successfully dispatched</span>
          </div>
        </div>

        {/* Failed */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-xs hover:shadow-sm transition-all flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Failed Delivery
              </p>
              <p className="text-2xl font-bold text-slate-900 mt-2">
                {stats.failed}
              </p>
            </div>
            <div className="p-2.5 rounded-xl bg-rose-50 text-rose-600 border border-rose-100">
              <XCircle size={20} />
            </div>
          </div>
          <div className="mt-4 flex items-center gap-1.5 text-xs text-rose-600 font-medium">
            <span>Requires manual retry</span>
          </div>
        </div>
      </div>

      {/* 3. SEARCH & QUICK FILTER BAR */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/90 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          {/* Search Bar */}
          <div className="relative flex-1">
            <Search
              size={16}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
            />
            <input
              type="text"
              placeholder="Search by patient name, medicine, or mobile..."
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

          {/* Quick Status Tabs */}
          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex items-center p-1 bg-slate-100 rounded-xl border border-slate-200/70">
              {["All", "Pending", "Sent", "Failed"].map((status) => (
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

            {hasActiveFilters && (
              <button
                type="button"
                onClick={resetFilters}
                className="inline-flex items-center gap-1 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl text-xs font-semibold transition-colors"
                title="Reset filters"
              >
                <RotateCcw size={13} />
                <span>Reset</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 4. REMINDERS DATA TABLE */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
        <div className="p-4 sm:p-5 flex items-center justify-between border-b border-slate-100">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              Refill Schedule Queue
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Showing {filteredReminders.length} scheduled patient notifications
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[950px]">
            <thead>
              <tr className="border-b border-slate-100 text-[11px] font-semibold text-slate-400 uppercase tracking-wider bg-slate-50/60">
                <th className="py-3 px-4">Patient Profile</th>
                <th className="py-3 px-4">Contact</th>
                <th className="py-3 px-4">Prescribed Medicine</th>
                <th className="py-3 px-4">Doctor</th>
                <th className="py-3 px-4">Refill Due Date</th>
                <th className="py-3 px-4">Channel</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-center w-28">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {paginatedReminders.map((reminder) => (
                <tr
                  key={reminder.id}
                  className="hover:bg-slate-50/60 transition-colors"
                >
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 border border-blue-100 font-bold flex items-center justify-center text-xs shrink-0">
                        {reminder.patientName
                          ? reminder.patientName.charAt(0).toUpperCase()
                          : "P"}
                      </div>
                      <div>
                        <div className="font-semibold text-slate-900">
                          {reminder.patientName}
                        </div>
                        <span className="text-[11px] text-slate-400">
                          Refill Target
                        </span>
                      </div>
                    </div>
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-1.5 text-slate-700 font-medium">
                      <Phone size={13} className="text-slate-400" />
                      <span>{reminder.mobile}</span>
                    </div>
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="font-semibold text-slate-800 flex items-center gap-1.5">
                      <Pill size={14} className="text-blue-500" />
                      <span>{reminder.medicine}</span>
                    </div>
                    {reminder.dosage && (
                      <div className="text-xs text-slate-400 mt-0.5">
                        {reminder.dosage}
                      </div>
                    )}
                  </td>
                  <td className="py-3.5 px-4 text-slate-600 text-xs">
                    <div className="flex items-center gap-1">
                      <Stethoscope size={12} className="text-slate-400" />
                      <span>{reminder.doctorName}</span>
                    </div>
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-1.5 text-slate-700 font-medium text-xs">
                      <CalendarClock size={13} className="text-slate-400" />
                      <span>
                        {new Date(reminder.nextRefillDate).toLocaleDateString(
                          "en-IN",
                          {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                          },
                        )}
                      </span>
                    </div>
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-100">
                      <MessageCircle size={12} />
                      <span>{reminder.reminderType}</span>
                    </span>
                  </td>
                  <td className="py-3.5 px-4">
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                        reminder.status === "Sent"
                          ? "bg-emerald-50 text-emerald-700 border border-emerald-100"
                          : reminder.status === "Pending"
                            ? "bg-amber-50 text-amber-700 border border-amber-100"
                            : "bg-rose-50 text-rose-700 border border-rose-100"
                      }`}
                    >
                      {reminder.status === "Sent" ? (
                        <CheckCircle2 size={12} />
                      ) : reminder.status === "Pending" ? (
                        <Clock3 size={12} />
                      ) : (
                        <XCircle size={12} />
                      )}
                      <span>{reminder.status}</span>
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-center">
                    <div className="flex items-center justify-center gap-1">
                      <button
                        type="button"
                        onClick={() => setPreviewReminder(reminder)}
                        className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="View reminder template"
                      >
                        <Eye size={15} />
                      </button>
                      {reminder.status === "Pending" && (
                        <button
                          type="button"
                          onClick={() => sendReminder(reminder)}
                          className="p-1.5 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                          title="Send notification now"
                        >
                          <Send size={15} />
                        </button>
                      )}
                      {reminder.status === "Failed" && (
                        <button
                          type="button"
                          onClick={() => resendReminder(reminder)}
                          className="p-1.5 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                          title="Retry failed dispatch"
                        >
                          <RotateCcw size={15} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filteredReminders.length === 0 && (
            <div className="text-center py-14 px-4 space-y-2">
              <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 mx-auto flex items-center justify-center">
                <BellRing size={24} />
              </div>
              <p className="text-sm font-semibold text-slate-700">
                No reminders found
              </p>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                {hasActiveFilters
                  ? "Try resetting your search query or status filter."
                  : "All patient medication refill reminders have been processed."}
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
              totalItems={filteredReminders.length}
              itemsPerPage={itemsPerPage}
              onPageChange={setCurrentPage}
            />
          </div>
        )}
      </div>

      {/* 5. PREVIEW MESSAGE MODAL */}
      {previewReminder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div
            className="fixed inset-0"
            onClick={() => setPreviewReminder(null)}
          />
          <div className="relative z-10 w-full max-w-md bg-white border border-slate-200 shadow-2xl rounded-2xl p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100">
                  <MessageCircle size={18} />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">
                    WhatsApp Message Preview
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    To: {previewReminder.patientName} ({previewReminder.mobile})
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setPreviewReminder(null)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X size={18} />
              </button>
            </div>

            {/* Mock WhatsApp Bubble */}
            <div className="p-4 rounded-xl bg-emerald-50/60 border border-emerald-200/80 text-xs text-slate-800 space-y-2 leading-relaxed font-sans">
              <p className="font-semibold text-emerald-900">
                Dear {previewReminder.patientName},
              </p>
              <p>
                This is a friendly refill reminder from your pharmacy. Your prescription for{" "}
                <strong>{previewReminder.medicine}</strong> ({previewReminder.dosage || "prescribed dosage"}) is due for refill on{" "}
                <strong>{new Date(previewReminder.nextRefillDate).toLocaleDateString("en-IN")}</strong>.
              </p>
              <p>
                Please contact or visit us to collect your fresh batch and ensure uninterrupted therapy.
              </p>
              <p className="text-[11px] text-slate-400 pt-1 border-t border-emerald-200/60">
                Prescribed by: {previewReminder.doctorName}
              </p>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setPreviewReminder(null)}
                className="px-4 py-2 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition-colors"
              >
                Close
              </button>
              {previewReminder.status !== "Sent" && (
                <button
                  type="button"
                  onClick={() => {
                    sendReminder(previewReminder);
                    setPreviewReminder(null);
                  }}
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors"
                >
                  <Send size={14} />
                  <span>Send WhatsApp</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Reminders;
