import React, { useMemo, useState } from "react";
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
  Sparkles,
  Shield,
  TrendingUp,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

const remindersData = [
  {
    id: 1,
    patientName: "Rahul Patil",
    mobile: "9876543210",
    medicine: "Metformin 500mg",
    nextRefillDate: "2026-05-12",
    status: "Pending",
    reminderType: "WhatsApp",
    doctorName: "Dr. Sharma",
  },
  {
    id: 2,
    patientName: "Sneha Kale",
    mobile: "9090909090",
    medicine: "BP Tablets",
    nextRefillDate: "2026-05-10",
    status: "Sent",
    reminderType: "WhatsApp",
    doctorName: "Dr. Joshi",
  },
  {
    id: 3,
    patientName: "Ajay Verma",
    mobile: "9988776655",
    medicine: "Vitamin D Capsules",
    nextRefillDate: "2026-05-09",
    status: "Failed",
    reminderType: "WhatsApp",
    doctorName: "Dr. Patil",
  },
  {
    id: 4,
    patientName: "Priya Deshmukh",
    mobile: "9765432109",
    medicine: "Antibiotics",
    nextRefillDate: "2026-05-15",
    status: "Pending",
    reminderType: "WhatsApp",
    doctorName: "Dr. Sharma",
  },
];

const Reminders = () => {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const filteredReminders = useMemo(() => {
    return remindersData.filter((reminder) => {
      const matchesSearch =
        reminder.patientName.toLowerCase().includes(search.toLowerCase()) ||
        reminder.mobile.includes(search) ||
        reminder.medicine.toLowerCase().includes(search.toLowerCase());
      const matchesStatus = statusFilter === "All" || reminder.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [search, statusFilter]);

  // Pagination
  const totalPages = Math.ceil(filteredReminders.length / itemsPerPage);
  const paginatedReminders = filteredReminders.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const stats = {
    total: remindersData.length,
    pending: remindersData.filter((r) => r.status === "Pending").length,
    sent: remindersData.filter((r) => r.status === "Sent").length,
    failed: remindersData.filter((r) => r.status === "Failed").length,
  };

  const sendReminder = (reminder) => {
    console.log("Send Reminder:", reminder);
    alert("Reminder sent successfully");
  };

  const resendReminder = (reminder) => {
    console.log("Resend Reminder:", reminder);
    alert("Reminder resent successfully");
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "Sent":
        return "bg-green-500/20 text-green-400 border-green-500/30";
      case "Pending":
        return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30";
      case "Failed":
        return "bg-red-500/20 text-red-400 border-red-500/30";
      default:
        return "";
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "Sent":
        return <CheckCircle2 size={14} />;
      case "Pending":
        return <Clock3 size={14} />;
      case "Failed":
        return <XCircle size={14} />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900">
      {/* Animated Background Pattern */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 -left-4 w-96 h-96 bg-purple-500/20 rounded-full filter blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 -right-4 w-96 h-96 bg-pink-500/20 rounded-full filter blur-3xl animate-pulse delay-1000"></div>
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
                <div className="absolute inset-0 bg-gradient-to-r from-purple-400 to-pink-400 rounded-xl blur-lg opacity-75 group-hover:opacity-100 transition-opacity"></div>
                <div className="relative bg-gradient-to-br from-purple-500 to-pink-600 p-2.5 rounded-xl shadow-lg">
                  <BellRing size={24} className="text-white" />
                </div>
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                  Reminder Tracker
                </h1>
                <p className="text-purple-300/70 text-sm mt-1">
                  Manage WhatsApp medicine refill reminders
                </p>
              </div>
            </div>
          </div>

          <div className="bg-purple-500/10 border border-purple-500/20 rounded-xl px-4 py-3 flex items-center gap-3 backdrop-blur-sm">
            <Shield size={18} className="text-purple-400" />
            <p className="text-purple-300/90 text-sm">
              Automated refill reminders improve patient retention
            </p>
            <Sparkles size={16} className="text-purple-400 animate-pulse" />
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5 mb-6">
          {/* Total Reminders */}
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl shadow-xl p-5 hover:bg-white/10 transition-all duration-300 group">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Total Reminders</p>
                <h2 className="text-3xl font-bold mt-2 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                  {stats.total}
                </h2>
              </div>
              <div className="bg-purple-500/20 p-4 rounded-2xl group-hover:scale-110 transition-transform duration-300">
                <BellRing size={24} className="text-purple-400" />
              </div>
            </div>
          </div>

          {/* Pending */}
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl shadow-xl p-5 hover:bg-white/10 transition-all duration-300 group">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Pending</p>
                <h2 className="text-3xl font-bold mt-2 bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent">
                  {stats.pending}
                </h2>
              </div>
              <div className="bg-yellow-500/20 p-4 rounded-2xl group-hover:scale-110 transition-transform duration-300">
                <Clock3 size={24} className="text-yellow-400" />
              </div>
            </div>
          </div>

          {/* Sent */}
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl shadow-xl p-5 hover:bg-white/10 transition-all duration-300 group">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Sent</p>
                <h2 className="text-3xl font-bold mt-2 bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">
                  {stats.sent}
                </h2>
              </div>
              <div className="bg-green-500/20 p-4 rounded-2xl group-hover:scale-110 transition-transform duration-300">
                <CheckCircle2 size={24} className="text-green-400" />
              </div>
            </div>
          </div>

          {/* Failed */}
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl shadow-xl p-5 hover:bg-white/10 transition-all duration-300 group">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Failed</p>
                <h2 className="text-3xl font-bold mt-2 bg-gradient-to-r from-red-400 to-rose-400 bg-clip-text text-transparent">
                  {stats.failed}
                </h2>
              </div>
              <div className="bg-red-500/20 p-4 rounded-2xl group-hover:scale-110 transition-transform duration-300">
                <XCircle size={24} className="text-red-400" />
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl shadow-xl p-5 mb-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Search */}
            <div className="relative lg:col-span-2">
              <Search size={18} className="absolute left-3 top-3 text-gray-400" />
              <input
                type="text"
                placeholder="Search patient, medicine or mobile..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full bg-slate-800/50 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-white placeholder-gray-400 outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-transparent transition-all"
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
                className="w-full bg-slate-800/50 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-white outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-transparent transition-all"
              >
                <option className="bg-slate-900">All</option>
                <option className="bg-slate-900">Pending</option>
                <option className="bg-slate-900">Sent</option>
                <option className="bg-slate-900">Failed</option>
              </select>
            </div>
          </div>
        </div>

        {/* Reminders Table */}
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl shadow-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1200px]">
              <thead className="bg-slate-800/50 border-b border-white/10">
                <tr>
                  <th className="text-left p-4 text-sm font-semibold text-gray-300">
                    Patient
                  </th>
                  <th className="text-left p-4 text-sm font-semibold text-gray-300">
                    Mobile
                  </th>
                  <th className="text-left p-4 text-sm font-semibold text-gray-300">
                    Medicine
                  </th>
                  <th className="text-left p-4 text-sm font-semibold text-gray-300">
                    Doctor
                  </th>
                  <th className="text-left p-4 text-sm font-semibold text-gray-300">
                    Next Refill
                  </th>
                  <th className="text-left p-4 text-sm font-semibold text-gray-300">
                    Type
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
                {paginatedReminders.map((reminder) => (
                  <tr
                    key={reminder.id}
                    className="border-b border-white/5 hover:bg-white/5 transition-colors"
                  >
                    <td className="p-4">
                      <h3 className="font-semibold text-white">
                        {reminder.patientName}
                      </h3>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2 text-gray-300">
                        <Phone size={16} className="text-gray-500" />
                        {reminder.mobile}
                      </div>
                    </td>
                    <td className="p-4 text-gray-300">{reminder.medicine}</td>
                    <td className="p-4 text-gray-300">{reminder.doctorName}</td>
                    <td className="p-4">
                      <div className="flex items-center gap-2 text-gray-300">
                        <CalendarClock size={16} className="text-gray-500" />
                        {reminder.nextRefillDate}
                      </div>
                    </td>
                    <td className="p-4">
                      <span className="bg-green-500/20 text-green-400 px-3 py-1 rounded-full text-xs flex items-center gap-1 w-fit border border-green-500/30">
                        <MessageCircle size={14} />
                        {reminder.reminderType}
                      </span>
                    </td>
                    <td className="p-4">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1 w-fit border ${getStatusBadge(
                          reminder.status
                        )}`}
                      >
                        {getStatusIcon(reminder.status)}
                        {reminder.status}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex flex-wrap gap-2">
                        {reminder.status === "Pending" && (
                          <button
                            onClick={() => sendReminder(reminder)}
                            className="bg-purple-500/20 hover:bg-purple-500/30 text-purple-400 p-2 rounded-lg transition-all duration-200 hover:scale-110"
                          >
                            <Send size={16} />
                          </button>
                        )}
                        {reminder.status === "Failed" && (
                          <button
                            onClick={() => resendReminder(reminder)}
                            className="bg-orange-500/20 hover:bg-orange-500/30 text-orange-400 p-2 rounded-lg transition-all duration-200 hover:scale-110"
                          >
                            <RotateCcw size={16} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {filteredReminders.length === 0 && (
              <div className="text-center py-12">
                <AlertCircle className="mx-auto text-gray-400 mb-3" size={48} />
                <p className="text-gray-400">No reminders found.</p>
              </div>
            )}
          </div>

          {/* Pagination */}
          {filteredReminders.length > 0 && (
            <div className="border-t border-white/10 px-6 py-4 flex items-center justify-between">
              <p className="text-sm text-gray-400">
                Showing {(currentPage - 1) * itemsPerPage + 1} to{" "}
                {Math.min(currentPage * itemsPerPage, filteredReminders.length)} of{" "}
                {filteredReminders.length} entries
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="p-2 rounded-lg bg-slate-800/50 border border-white/10 text-white hover:bg-white/5 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronLeft size={18} />
                </button>
                <span className="px-4 py-2 rounded-lg bg-purple-500/20 text-purple-400 border border-purple-500/30">
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
          <div className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 px-6 py-4 border-b border-white/10">
            <div className="flex items-center gap-3">
              <div className="bg-purple-500/20 p-2 rounded-xl">
                <TrendingUp size={18} className="text-purple-400" />
              </div>
              <h2 className="text-lg font-semibold text-white">
                Reminder System Features
              </h2>
            </div>
          </div>

          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
              {[
                "Automated WhatsApp refill reminders",
                "Track sent, pending, and failed reminders",
                "Manual resend support for failed reminders",
                "Reminder scheduling based on medicine usage",
              ].map((feature, index) => (
                <div
                  key={index}
                  className="border border-white/10 rounded-xl p-4 flex items-center gap-3 hover:bg-white/5 transition-colors group"
                >
                  <div className="w-1.5 h-1.5 rounded-full bg-purple-400 group-hover:scale-150 transition-transform"></div>
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

export default Reminders;