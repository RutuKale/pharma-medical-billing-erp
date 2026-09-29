import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import Pagination from "../../components/Pagination";
import {
  Users,
  Search,
  UserPlus,
  Phone,
  User,
  Calendar,
  FileText,
  BellRing,
  Edit,
  Trash2,
  CheckCircle2,
  XCircle,
  TrendingUp,
  AlertCircle,
  MapPin,
  Stethoscope,
  IndianRupee,
  X,
  Shield,
  RotateCcw,
} from "lucide-react";
import Swal from "sweetalert2";
import apiClient from "../../utils/apiClient";
import DashboardSkeleton from "../../components/DashboardSkeleton";

const API_URL = "/patients";

const Patients = () => {
  const [formData, setFormData] = useState({
    name: "",
    mobile: "",
    age: "",
    gender: "",
    address: "",
    doctorName: "",
    prescriptionNumber: "",
    remindersEnabled: true,
    notes: "",
  });
  const [search, setSearch] = useState("");
  const [reminderFilter, setReminderFilter] = useState("All");
  const [errors, setErrors] = useState({});
  const [currentPage, setCurrentPage] = useState(1);
  const [patientsData, setPatientsData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const itemsPerPage = 8;

  const fetchPatients = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get(API_URL);
      if (response.data.success) {
        setPatientsData(response.data.data);
      }
    } catch (error) {
      console.error("Fetch Patients Error:", error);
      Swal.fire({
        icon: "error",
        title: "Error Loading Patients",
        text: "Unable to retrieve patient register.",
        confirmButtonColor: "#2563eb",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPatients();
  }, []);

  const filteredPatients = useMemo(() => {
    return patientsData.filter((patient) => {
      const matchesSearch =
        patient.patient_name?.toLowerCase().includes(search.toLowerCase()) ||
        patient.mobile_number?.includes(search) ||
        (patient.doctor_name || "").toLowerCase().includes(search.toLowerCase());
      const matchesReminder =
        reminderFilter === "All" ||
        (reminderFilter === "Enabled" && patient.reminders_enabled) ||
        (reminderFilter === "Disabled" && !patient.reminders_enabled);

      return matchesSearch && matchesReminder;
    });
  }, [patientsData, search, reminderFilter]);

  // Pagination
  const totalPages = Math.ceil(filteredPatients.length / itemsPerPage);
  const paginatedPatients = filteredPatients.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
    if (errors[name]) {
      setErrors({ ...errors, [name]: "" });
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = "Patient name is required";
    if (!formData.mobile.trim()) newErrors.mobile = "Mobile number is required";
    if (formData.mobile.length !== 10)
      newErrors.mobile = "Enter a valid 10-digit mobile number";
    if (!formData.gender) newErrors.gender = "Please select gender";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      setSubmitting(true);

      const patientPayload = {
        patient_name: formData.name,
        mobile_number: formData.mobile,
        age: formData.age ? Number(formData.age) : null,
        gender: formData.gender,
        address: formData.address,
        doctor_name: formData.doctorName,
        prescription_number: formData.prescriptionNumber,
        reminders_enabled: formData.remindersEnabled,
        notes: formData.notes,
      };

      if (editMode) {
        await apiClient.put(
          `${API_URL}/${selectedPatient.patient_id}`,
          patientPayload,
        );

        await Swal.fire({
          title: "Patient Updated",
          text: "Patient details updated successfully.",
          icon: "success",
          confirmButtonColor: "#2563eb",
        });
      } else {
        await apiClient.post(API_URL, patientPayload);

        await Swal.fire({
          title: "Patient Registered",
          text: "New patient registered into pharmacy records.",
          icon: "success",
          confirmButtonColor: "#2563eb",
        });
      }

      fetchPatients();

      setFormData({
        name: "",
        mobile: "",
        age: "",
        gender: "",
        address: "",
        doctorName: "",
        prescriptionNumber: "",
        remindersEnabled: true,
        notes: "",
      });

      setEditMode(false);
      setSelectedPatient(null);
      setErrors({});
      setShowModal(false);
    } catch (error) {
      console.error(
        editMode ? "Update Patient Error:" : "Create Patient Error:",
        error,
      );

      Swal.fire({
        title: "Submission Error",
        text:
          error.response?.data?.message ||
          "Failed to save patient. Please check input values.",
        icon: "error",
        confirmButtonColor: "#2563eb",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const editPatient = (patient) => {
    setEditMode(true);
    setSelectedPatient(patient);

    setFormData({
      name: patient.patient_name || "",
      mobile: patient.mobile_number || "",
      age: patient.age || "",
      gender: patient.gender || "",
      address: patient.address || "",
      doctorName: patient.doctor_name || "",
      prescriptionNumber: patient.prescription_number || "",
      remindersEnabled: Boolean(patient.reminders_enabled),
      notes: patient.notes || "",
    });

    setErrors({});
    setShowModal(true);
  };

  const openNewPatientModal = () => {
    setEditMode(false);
    setSelectedPatient(null);
    setFormData({
      name: "",
      mobile: "",
      age: "",
      gender: "",
      address: "",
      doctorName: "",
      prescriptionNumber: "",
      remindersEnabled: true,
      notes: "",
    });
    setErrors({});
    setShowModal(true);
  };

  const deletePatient = async (patient) => {
    const result = await Swal.fire({
      title: "Delete Patient?",
      text: `Are you sure you want to remove "${patient.patient_name}" from the register?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#e11d48",
      cancelButtonColor: "#64748b",
      confirmButtonText: "Yes, Delete",
      cancelButtonText: "Cancel",
    });

    if (!result.isConfirmed) return;

    try {
      const response = await apiClient.delete(
        `${API_URL}/${patient.patient_id}`,
      );

      if (response.data.success) {
        await Swal.fire({
          title: "Deleted!",
          text: "Patient record has been deleted.",
          icon: "success",
          confirmButtonColor: "#2563eb",
        });

        fetchPatients();

        if (
          selectedPatient &&
          selectedPatient.patient_id === patient.patient_id
        ) {
          setEditMode(false);
          setSelectedPatient(null);
        }
      }
    } catch (error) {
      console.error("Delete Patient Error:", error);
      Swal.fire({
        title: "Delete Failed",
        text: error.response?.data?.message || "Failed to delete patient",
        icon: "error",
        confirmButtonColor: "#2563eb",
      });
    }
  };

  const stats = useMemo(() => {
    const totalPatients = patientsData.length;
    const activeReminders = patientsData.filter(
      (p) => p.reminders_enabled,
    ).length;
    const totalBills = patientsData.reduce(
      (acc, patient) => acc + (patient.total_bills || 0),
      0,
    );
    const doctors = [
      ...new Set(patientsData.map((p) => p.doctor_name).filter(Boolean)),
    ].length;

    return { totalPatients, activeReminders, totalBills, doctors };
  }, [patientsData]);

  if (loading) {
    return <DashboardSkeleton />;
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-[1600px] mx-auto space-y-6">
      {/* 1. HEADER SECTION (No icon next to title per design standards) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <span>Patient Register</span>
          </h1>
          <p className="text-slate-500 text-xs sm:text-sm mt-0.5">
            Manage pharmacy patient profiles, prescription history, and refill notifications.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={openNewPatientModal}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-semibold shadow-xs transition-colors"
          >
            <UserPlus size={16} />
            <span>Register Patient</span>
          </button>
          <Link
            to="/billing"
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 rounded-xl text-sm font-semibold shadow-xs transition-colors"
          >
            <IndianRupee size={16} className="text-slate-500" />
            <span>New Billing</span>
          </Link>
          <Link
            to="/reminders"
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 rounded-xl text-sm font-semibold shadow-xs transition-colors"
          >
            <BellRing size={16} className="text-slate-500" />
            <span>Reminders</span>
          </Link>
        </div>
      </div>

      {/* 2. STAT CARDS ROW */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Patients */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-xs hover:shadow-sm transition-all flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Total Patients
              </p>
              <p className="text-2xl font-bold text-slate-900 mt-2">
                {stats.totalPatients}
              </p>
            </div>
            <div className="p-2.5 rounded-xl bg-blue-50 text-blue-600 border border-blue-100">
              <Users size={20} />
            </div>
          </div>
          <div className="mt-4 flex items-center gap-1.5 text-xs text-slate-500 font-medium">
            <span>Registered customer base</span>
          </div>
        </div>

        {/* Active Reminders */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-xs hover:shadow-sm transition-all flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Active Reminders
              </p>
              <p className="text-2xl font-bold text-slate-900 mt-2">
                {stats.activeReminders}
              </p>
            </div>
            <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100">
              <BellRing size={20} />
            </div>
          </div>
          <div className="mt-4 flex items-center gap-1.5 text-xs text-emerald-600 font-medium">
            <CheckCircle2 size={13} />
            <span>Automated refill reminders</span>
          </div>
        </div>

        {/* Total Bills */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-xs hover:shadow-sm transition-all flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Recorded Invoices
              </p>
              <p className="text-2xl font-bold text-slate-900 mt-2">
                {stats.totalBills}
              </p>
            </div>
            <div className="p-2.5 rounded-xl bg-purple-50 text-purple-600 border border-purple-100">
              <FileText size={20} />
            </div>
          </div>
          <div className="mt-4 flex items-center gap-1.5 text-xs text-slate-500 font-medium">
            <span>Customer billing history</span>
          </div>
        </div>

        {/* Doctors Tracked */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-xs hover:shadow-sm transition-all flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Prescribing Doctors
              </p>
              <p className="text-2xl font-bold text-slate-900 mt-2">
                {stats.doctors}
              </p>
            </div>
            <div className="p-2.5 rounded-xl bg-amber-50 text-amber-600 border border-amber-100">
              <Stethoscope size={20} />
            </div>
          </div>
          <div className="mt-4 flex items-center gap-1.5 text-xs text-slate-500 font-medium">
            <span>Associated practitioners</span>
          </div>
        </div>
      </div>

      {/* 3. SEARCH & QUICK FILTER BAR */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/90 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search
              size={16}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
            />
            <input
              type="text"
              placeholder="Search by patient name, mobile, or doctor..."
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
          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex items-center p-1 bg-slate-100 rounded-xl border border-slate-200/70">
              {["All", "Enabled", "Disabled"].map((status) => (
                <button
                  key={status}
                  type="button"
                  onClick={() => {
                    setReminderFilter(status);
                    setCurrentPage(1);
                  }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    reminderFilter === status
                      ? "bg-white text-blue-600 shadow-xs"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  {status === "All" ? "All Patients" : `Reminders ${status}`}
                </button>
              ))}
            </div>

            {(search || reminderFilter !== "All") && (
              <button
                type="button"
                onClick={() => {
                  setSearch("");
                  setReminderFilter("All");
                  setCurrentPage(1);
                }}
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

      {/* 4. PATIENTS TABLE CARD */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
        <div className="p-4 sm:p-5 flex items-center justify-between border-b border-slate-100">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              Registered Patients List
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Showing {filteredPatients.length} patient records
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[950px]">
            <thead>
              <tr className="border-b border-slate-100 text-[11px] font-semibold text-slate-400 uppercase tracking-wider bg-slate-50/60">
                <th className="py-3 px-4">Patient Profile</th>
                <th className="py-3 px-4">Contact</th>
                <th className="py-3 px-4">Prescription & Doctor</th>
                <th className="py-3 px-4">Address</th>
                <th className="py-3 px-4">Remarks</th>
                <th className="py-3 px-4 text-center">Refill Reminders</th>
                <th className="py-3 px-4 text-center w-28">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {paginatedPatients.map((patient) => (
                <tr
                  key={patient.patient_id}
                  className="hover:bg-slate-50/60 transition-colors"
                >
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 border border-blue-100 font-bold flex items-center justify-center text-xs shrink-0">
                        {patient.patient_name
                          ? patient.patient_name.charAt(0).toUpperCase()
                          : "P"}
                      </div>
                      <div>
                        <div className="font-semibold text-slate-900">
                          {patient.patient_name}
                        </div>
                        <div className="text-xs text-slate-400 mt-0.5">
                          {patient.age ? `${patient.age} yrs` : "Age not specified"}{" "}
                          {patient.gender ? `• ${patient.gender}` : ""}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-1.5 text-slate-700 font-medium">
                      <Phone size={13} className="text-slate-400" />
                      <span>{patient.mobile_number}</span>
                    </div>
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="font-medium text-slate-800 text-xs">
                      {patient.prescription_number ? (
                        <span className="font-mono bg-slate-100 px-1.5 py-0.5 rounded text-slate-700">
                          Rx: {patient.prescription_number}
                        </span>
                      ) : (
                        <span className="text-slate-400">No Rx #</span>
                      )}
                    </div>
                    {patient.doctor_name && (
                      <div className="text-xs text-slate-400 mt-1 flex items-center gap-1">
                        <Stethoscope size={12} />
                        <span>Dr. {patient.doctor_name}</span>
                      </div>
                    )}
                  </td>
                  <td className="py-3.5 px-4 text-slate-600 text-xs max-w-[200px] truncate">
                    {patient.address ? (
                      <div className="flex items-center gap-1 truncate" title={patient.address}>
                        <MapPin size={13} className="text-slate-400 shrink-0" />
                        <span className="truncate">{patient.address}</span>
                      </div>
                    ) : (
                      <span className="text-slate-400">—</span>
                    )}
                  </td>
                  <td className="py-3.5 px-4 text-slate-600 text-xs max-w-[160px] truncate">
                    {patient.notes ? (
                      <span className="truncate block" title={patient.notes}>
                        {patient.notes}
                      </span>
                    ) : (
                      <span className="text-slate-400">—</span>
                    )}
                  </td>
                  <td className="py-3.5 px-4 text-center">
                    {patient.reminders_enabled ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-100">
                        <CheckCircle2 size={12} />
                        <span>Enabled</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-600 border border-slate-200">
                        <XCircle size={12} />
                        <span>Disabled</span>
                      </span>
                    )}
                  </td>
                  <td className="py-3.5 px-4 text-center">
                    <div className="flex items-center justify-center gap-1">
                      <button
                        type="button"
                        onClick={() => editPatient(patient)}
                        className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Edit Patient Details"
                      >
                        <Edit size={15} />
                      </button>
                      <button
                        type="button"
                        onClick={() => deletePatient(patient)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                        title="Delete Patient Record"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {filteredPatients.length === 0 && (
            <div className="text-center py-14 px-4 space-y-2">
              <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 mx-auto flex items-center justify-center">
                <Users size={24} />
              </div>
              <p className="text-sm font-semibold text-slate-700">
                No patients found
              </p>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                {search || reminderFilter !== "All"
                  ? "No matching records found. Try clearing your filters."
                  : "Start registering patients to build your customer profile register."}
              </p>
              <button
                type="button"
                onClick={openNewPatientModal}
                className="mt-2 inline-flex items-center gap-1.5 px-3.5 py-2 bg-blue-600 text-white rounded-xl text-xs font-semibold hover:bg-blue-700 transition-colors shadow-xs"
              >
                <UserPlus size={14} />
                <span>Register First Patient</span>
              </button>
            </div>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="p-4 border-t border-slate-100 flex items-center justify-between">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalItems={filteredPatients.length}
              itemsPerPage={itemsPerPage}
              onPageChange={setCurrentPage}
            />
          </div>
        )}
      </div>

      {/* 5. REGISTER / EDIT PATIENT MODAL */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div
            className="fixed inset-0"
            onClick={() => {
              setShowModal(false);
              setEditMode(false);
            }}
          />
          <div className="relative z-10 w-full max-w-2xl max-h-[92vh] overflow-y-auto bg-white border border-slate-200 shadow-2xl rounded-2xl p-6 space-y-5">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-blue-50 text-blue-600 border border-blue-100">
                  <UserPlus size={18} />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-base">
                    {editMode ? "Edit Patient Record" : "Register New Patient"}
                  </h3>
                  <p className="text-xs text-slate-500">
                    {editMode
                      ? "Update existing contact & prescription details."
                      : "Add patient profile for billing and automated refill tracking."}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setShowModal(false);
                  setEditMode(false);
                }}
                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Name */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Patient Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="e.g. Ramesh Kumar"
                    className={`w-full bg-slate-50/60 border rounded-xl px-3.5 py-2.5 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 transition-all ${
                      errors.name
                        ? "border-rose-400 focus:ring-rose-400/20"
                        : "border-slate-200 focus:ring-blue-500/20 focus:border-blue-500"
                    }`}
                  />
                  {errors.name && (
                    <p className="text-rose-600 text-xs mt-1">{errors.name}</p>
                  )}
                </div>

                {/* Mobile */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Mobile Number <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="mobile"
                    maxLength={10}
                    value={formData.mobile}
                    onChange={handleChange}
                    placeholder="10-digit mobile number"
                    className={`w-full bg-slate-50/60 border rounded-xl px-3.5 py-2.5 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 transition-all ${
                      errors.mobile
                        ? "border-rose-400 focus:ring-rose-400/20"
                        : "border-slate-200 focus:ring-blue-500/20 focus:border-blue-500"
                    }`}
                  />
                  {errors.mobile && (
                    <p className="text-rose-600 text-xs mt-1">{errors.mobile}</p>
                  )}
                </div>

                {/* Age */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Age
                  </label>
                  <input
                    type="number"
                    name="age"
                    min={0}
                    max={125}
                    value={formData.age}
                    onChange={handleChange}
                    placeholder="e.g. 35"
                    className="w-full bg-slate-50/60 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                  />
                </div>

                {/* Gender */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Gender <span className="text-rose-500">*</span>
                  </label>
                  <select
                    name="gender"
                    value={formData.gender}
                    onChange={handleChange}
                    className={`w-full bg-slate-50/60 border rounded-xl px-3.5 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 transition-all ${
                      errors.gender
                        ? "border-rose-400 focus:ring-rose-400/20"
                        : "border-slate-200 focus:ring-blue-500/20 focus:border-blue-500"
                    }`}
                  >
                    <option value="">Select Gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                  {errors.gender && (
                    <p className="text-rose-600 text-xs mt-1">{errors.gender}</p>
                  )}
                </div>

                {/* Doctor */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Prescribing Doctor
                  </label>
                  <input
                    type="text"
                    name="doctorName"
                    value={formData.doctorName}
                    onChange={handleChange}
                    placeholder="e.g. Dr. A. Sharma"
                    className="w-full bg-slate-50/60 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                  />
                </div>

                {/* Prescription Number */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Prescription Number
                  </label>
                  <input
                    type="text"
                    name="prescriptionNumber"
                    value={formData.prescriptionNumber}
                    onChange={handleChange}
                    placeholder="e.g. RX-2026-089"
                    className="w-full bg-slate-50/60 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-mono"
                  />
                </div>

                {/* Address */}
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Address
                  </label>
                  <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    placeholder="Street, locality, city"
                    className="w-full bg-slate-50/60 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                  />
                </div>

                {/* Notes */}
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Clinical Notes / Remarks
                  </label>
                  <textarea
                    name="notes"
                    rows={2}
                    value={formData.notes}
                    onChange={handleChange}
                    placeholder="Allergies, chronic condition tags, or patient remarks..."
                    className="w-full bg-slate-50/60 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 resize-none transition-all"
                  />
                </div>
              </div>

              {/* Refill Reminders Switch Card */}
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-lg bg-emerald-50 text-emerald-600 border border-emerald-100">
                    <BellRing size={16} />
                  </div>
                  <div>
                    <span className="font-semibold text-slate-900 text-xs block">
                      Refill Notifications
                    </span>
                    <span className="text-[11px] text-slate-500">
                      Enable automated medication refill reminders for this patient.
                    </span>
                  </div>
                </div>

                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    name="remindersEnabled"
                    checked={formData.remindersEnabled}
                    onChange={handleChange}
                    className="sr-only peer"
                  />
                  <div className="w-10 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setEditMode(false);
                  }}
                  className="px-4 py-2 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 rounded-xl text-xs font-semibold shadow-xs transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="inline-flex items-center gap-1.5 px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors disabled:opacity-50"
                >
                  <UserPlus size={15} />
                  <span>
                    {submitting
                      ? editMode
                        ? "Updating..."
                        : "Registering..."
                      : editMode
                        ? "Save Changes"
                        : "Register Patient"}
                  </span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Patients;
