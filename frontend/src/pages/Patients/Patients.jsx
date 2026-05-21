import React, { useEffect, useMemo, useState } from "react";
import {
  Users,
  Search,
  UserPlus,
  Phone,
  User,
  Calendar,
  FileText,
  BellRing,
  Eye,
  Edit,
  Trash2,
  CheckCircle2,
  XCircle,
  Sparkles,
  Shield,
  TrendingUp,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  Locate,
} from "lucide-react";
const API_URL = "/api/patients";
import Swal from "sweetalert2";
import API from "../../utils/api";

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
  const [errors, setErrors] = useState({});
  const [currentPage, setCurrentPage] = useState(1);
  const [patientsData, setPatientsData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const itemsPerPage = 4;

  const fetchPatients = async () => {
    try {
      setLoading(true);
      const response = await API.get(API_URL);
      if (response.data.success) {
        setPatientsData(response.data.data);
      }
    } catch (error) {
      console.error("Fetch Patients Error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPatients();
  }, []);

  const filteredPatients = useMemo(() => {
    return patientsData.filter(
      (patient) =>
        patient.patient_name?.toLowerCase().includes(search.toLowerCase()) ||
        patient.mobile_number?.includes(search),
    );
  }, [patientsData, search]);

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
      newErrors.mobile = "Enter valid 10-digit mobile number";
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
        age: Number(formData.age),
        gender: formData.gender,
        address: formData.address,
        doctor_name: formData.doctorName,
        prescription_number: formData.prescriptionNumber,
        reminders_enabled: formData.remindersEnabled,
        notes: formData.notes,
      };
      let response;

      // =========================
      // EDIT → PUT
      // =========================
      if (editMode) {
        response = await API.put(
          `${API_URL}/${selectedPatient.patient_id}`,
          patientPayload,
        );

        await Swal.fire({
          title: "Updated!",
          text: "Patient Updated Successfully",
          icon: "success",
          iconColor: "#22c55e",
          background: "#fff",
          color: "#000",
          confirmButtonColor: "#22c55e",
        });
      }

      // =========================
      // CREATE → POST
      // =========================
      else {
        response = await API.post(API_URL, patientPayload);

        await Swal.fire({
          title: "Success!",
          text: "Patient Registered Successfully",
          icon: "success",
          iconColor: "#22c55e",
          background: "#fff",
          color: "#000",
          confirmButtonColor: "#22c55e",
        });
      }

      // Refresh table
      fetchPatients();

      // Reset form
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

      // Reset edit state
      setEditMode(false);
      setSelectedPatient(null);
      setErrors({});
      setShowModal(false);
    } catch (error) {
      console.error(
        editMode ? "Update Patient Error:" : "Create Patient Error:",
        error,
      );

      if (error.response) {
        Swal.fire({
          title: "Error!",
          text: error.response.data.message,
          icon: "error",
          iconColor: "#ef4444",
          background: "#fff",
          color: "#000",
          confirmButtonColor: "#ef4444",
        });
      } else {
        Swal.fire({
          title: "Server Error!",
          text: "Something went wrong.",
          icon: "error",
          iconColor: "#ef4444",
          background: "#fff",
          color: "#000",
          confirmButtonColor: "#ef4444",
        });
      }
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
      remindersEnabled: patient.reminders_enabled || false,
      notes: patient.notes || "",
    });

    setShowModal(true);
  };

  const deletePatient = async (patient) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: `Delete ${patient.patient_name}?`,
      icon: "warning",
      iconColor: "#ff0000",
      color: "#000",
      background: "#ffffff",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#475569",
      confirmButtonText: "Yes, Delete",
      cancelButtonText: "Cancel",
    });

    if (!result.isConfirmed) return;

    try {
      const response = await API.delete(`${API_URL}/${patient.patient_id}`);

      if (response.data.success) {
        await Swal.fire({
          title: "Deleted!",
          text: "Patient Deleted Successfully",
          icon: "success",
          iconColor: "#22c55e",
          background: "#fff",
          color: "#000",
          confirmButtonColor: "#22c55e",
        });

        fetchPatients();

        if (
          selectedPatient &&
          selectedPatient.patient_id === patient.patient_id
        ) {
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
        }
      }
    } catch (error) {
      console.error("Delete Patient Error:", error);

      Swal.fire({
        title: "Error!",
        text: error.response?.data?.message || "Failed to delete patient",
        icon: "error",
        iconColor: "#ef4444",
        background: "#fff",
        color: "#000",
        confirmButtonColor: "#ef4444",
      });
    }
  };

  const stats = {
    totalPatients: patientsData.length,

    activeReminders: patientsData.filter((p) => p.reminders_enabled).length,

    totalBills: patientsData.reduce(
      (acc, patient) => acc + (patient.total_bills || 0),
      0,
    ),

    doctors: [...new Set(patientsData.map((p) => p.doctor_name))].length,
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading Patients...</div>
      </div>
    );
  }

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

      <div className="relative z-10 p-4 md:p-6">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-3">
              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-indigo-400 rounded-xl blur-lg opacity-75 group-hover:opacity-100 transition-opacity"></div>
                <div className="relative bg-gradient-to-br from-blue-500 to-indigo-600 p-2.5 rounded-xl shadow-lg">
                  <Users size={24} className="text-white" />
                </div>
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">
                  Patient Register
                </h1>
                <p className="text-blue-300/70 text-sm mt-1">
                  Manage pharmacy patients and refill reminders
                </p>
              </div>
            </div>
          </div>

          <div className="bg-indigo-500/10 border border-indigo-500/20 rounded-xl px-4 py-3 flex items-center gap-3 backdrop-blur-sm">
            <Shield size={18} className="text-indigo-400" />
            <p className="text-indigo-300/90 text-sm">
              Returning patients are auto-detected during billing
            </p>
            <Sparkles size={16} className="text-indigo-400 animate-pulse" />
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5 mb-6">
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl shadow-xl p-5 hover:bg-white/10 transition-all duration-300 group">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Total Patients</p>
                <h2 className="text-3xl font-bold mt-2 bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">
                  {stats.totalPatients}
                </h2>
              </div>
              <div className="bg-blue-500/20 p-4 rounded-2xl group-hover:scale-110 transition-transform duration-300">
                <Users size={24} className="text-blue-400" />
              </div>
            </div>
          </div>

          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl shadow-xl p-5 hover:bg-white/10 transition-all duration-300 group">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Active Reminders</p>
                <h2 className="text-3xl font-bold mt-2 bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">
                  {stats.activeReminders}
                </h2>
              </div>
              <div className="bg-green-500/20 p-4 rounded-2xl group-hover:scale-110 transition-transform duration-300">
                <BellRing size={24} className="text-green-400" />
              </div>
            </div>
          </div>

          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl shadow-xl p-5 hover:bg-white/10 transition-all duration-300 group">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Total Bills</p>
                <h2 className="text-3xl font-bold mt-2 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                  {stats.totalBills}
                </h2>
              </div>
              <div className="bg-purple-500/20 p-4 rounded-2xl group-hover:scale-110 transition-transform duration-300">
                <FileText size={24} className="text-purple-400" />
              </div>
            </div>
          </div>

          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl shadow-xl p-5 hover:bg-white/10 transition-all duration-300 group">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-400">Doctors</p>
                <h2 className="text-3xl font-bold mt-2 bg-gradient-to-r from-orange-400 to-red-400 bg-clip-text text-transparent">
                  {stats.doctors}
                </h2>
              </div>
              <div className="bg-orange-500/20 p-4 rounded-2xl group-hover:scale-110 transition-transform duration-300">
                <User size={24} className="text-orange-400" />
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6">
          {/* Patient Table */}
          <div className="xl:col-span-2 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl shadow-xl overflow-hidden">
            <div className="bg-gradient-to-r from-blue-500/10 to-indigo-500/10 px-6 py-4 border-b border-white/10">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                <div>
                  <h2 className="text-lg font-semibold text-white">
                    Registered Patients
                  </h2>
                  <p className="text-sm text-gray-400 mt-1">
                    Search and manage patient records
                  </p>
                </div>

                <div className="flex gap-3">
                  {/* Search */}
                  <div className="relative w-full lg:w-80">
                    <Search
                      size={18}
                      className="absolute left-3 top-3 text-gray-400"
                    />
                    <input
                      type="text"
                      placeholder="Search patient..."
                      value={search}
                      onChange={(e) => {
                        setSearch(e.target.value);
                        setCurrentPage(1);
                      }}
                      className="w-full bg-slate-800/50 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-white placeholder-gray-400 outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent transition-all"
                    />
                  </div>
                  {/* Add Patient Button */}
                  <button
                    onClick={() => {
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

                      setShowModal(true);
                    }}
                    className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white px-5 py-3 rounded-xl flex items-center justify-center gap-2 transition-all duration-200 shadow-lg whitespace-nowrap"
                  >
                    <UserPlus size={18} />
                    Add Patient
                  </button>
                </div>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full min-w-[900px]">
                <thead className="bg-slate-800/50 border-b border-white/10">
                  <tr>
                    <th className="text-left p-4 text-sm font-semibold text-gray-300">
                      Patient
                    </th>
                    <th className="text-left p-4 text-sm font-semibold text-gray-300">
                      Mobile
                    </th>
                    <th className="text-left p-4 text-sm font-semibold text-gray-300">
                      Address
                    </th>
                    <th className="text-left p-4 text-sm font-semibold text-gray-300">
                      Prescription Number
                    </th>
                    <th className="text-left p-4 text-sm font-semibold text-gray-300">
                      Doctor
                    </th>
                    <th className="text-left p-4 text-sm font-semibold text-gray-300">
                      Remark
                    </th>
                    <th className="text-left p-4 text-sm font-semibold text-gray-300">
                      Reminders
                    </th>
                    <th className="text-left p-4 text-sm font-semibold text-gray-300">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedPatients.map((patient) => (
                    <tr
                      key={patient.patient_id}
                      className="border-b border-white/5 hover:bg-white/5 transition-colors"
                    >
                      <td className="p-4">
                        <div>
                          <h3 className="font-semibold text-white">
                            {patient.patient_name}
                          </h3>
                          <p className="text-sm text-gray-400 mt-1">
                            {patient.age} yrs • {patient.gender}
                          </p>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2 text-gray-300">
                          <Phone size={16} className="text-gray-500" />
                          {patient.mobile_number}
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2 text-gray-300">
                          <Locate size={16} className="text-gray-500" />
                          {patient.address}
                        </div>
                      </td>
                      <td className="p-4 text-gray-300">
                        {patient.prescription_number}
                      </td>
                      <td className="p-4 text-gray-300">
                        {patient.doctor_name}
                      </td>
                      <td className="p-4 font-semibold text-white">
                        {patient.notes}
                      </td>
                      <td className="p-4">
                        {patient.reminders_enabled ? (
                          <span className="bg-green-500/20 text-green-400 px-3 py-1 rounded-full text-xs flex items-center gap-1 w-fit border border-green-500/30">
                            <CheckCircle2 size={14} />
                            Enabled
                          </span>
                        ) : (
                          <span className="bg-red-500/20 text-red-400 px-3 py-1 rounded-full text-xs flex items-center gap-1 w-fit border border-red-500/30">
                            <XCircle size={14} />
                            Disabled
                          </span>
                        )}
                      </td>
                      <td className="p-4">
                        <div className="flex gap-2">
                          <button
                            onClick={() => editPatient(patient)}
                            className="bg-yellow-500/20 hover:bg-yellow-500/30 text-yellow-400 p-2 rounded-lg transition-all duration-200 hover:scale-110"
                          >
                            <Edit size={16} />
                          </button>
                          <button
                            onClick={() => deletePatient(patient)}
                            className="bg-red-500/20 hover:bg-red-500/30 text-red-400 p-2 rounded-lg transition-all duration-200 hover:scale-110"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {filteredPatients.length === 0 && (
                <div className="text-center py-12">
                  <AlertCircle
                    className="mx-auto text-gray-400 mb-3"
                    size={48}
                  />
                  <p className="text-gray-400">No patients found.</p>
                </div>
              )}
            </div>

            {/* Pagination */}
            {filteredPatients.length > 0 && (
              <div className="border-t border-white/10 px-6 py-4 flex items-center justify-between">
                <p className="text-sm text-gray-400">
                  Showing {(currentPage - 1) * itemsPerPage + 1} to{" "}
                  {Math.min(
                    currentPage * itemsPerPage,
                    filteredPatients.length,
                  )}{" "}
                  of {filteredPatients.length} entries
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

          {/* Patient Modal */}
          {showModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
              <div className="w-full max-w-2xl max-h-[95vh] overflow-y-auto bg-slate-900 border border-white/10 rounded-2xl shadow-2xl">
                {/* Modal Header */}
                <div className="sticky top-0 bg-slate-900 border-b border-white/10 px-6 py-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="bg-green-500/20 p-2 rounded-xl">
                      <UserPlus size={20} className="text-green-400" />
                    </div>

                    <h2 className="text-lg font-semibold text-white">
                      {editMode ? "Edit Patient" : "Register Patient"}
                    </h2>
                  </div>

                  <button
                    onClick={() => {
                      setShowModal(false);
                      setEditMode(false);
                    }}
                    className="text-gray-400 hover:text-white text-2xl"
                  >
                    ×
                  </button>
                </div>

                {/* Modal Body */}
                <div className="p-6">
                  <form onSubmit={handleSubmit} className="space-y-5">
                    {/* Name */}
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-1">
                        Patient Name *
                      </label>

                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        placeholder="Enter patient name"
                        className={`w-full bg-slate-800/50 border rounded-xl px-4 py-2 text-white placeholder-gray-400 outline-none focus:ring-2 focus:border-transparent transition-all ${
                          errors.name
                            ? "border-red-500/50 focus:ring-red-500/50"
                            : "border-white/10 focus:ring-blue-500/50"
                        }`}
                      />

                      {errors.name && (
                        <p className="text-red-400 text-sm mt-1">
                          {errors.name}
                        </p>
                      )}
                    </div>

                    {/* Mobile */}
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-1">
                        Mobile Number *
                      </label>

                      <input
                        type="text"
                        name="mobile"
                        value={formData.mobile}
                        onChange={handleChange}
                        placeholder="Enter mobile number"
                        className={`w-full bg-slate-800/50 border rounded-xl px-4 py-2 text-white placeholder-gray-400 outline-none focus:ring-2 focus:border-transparent transition-all ${
                          errors.mobile
                            ? "border-red-500/50 focus:ring-red-500/50"
                            : "border-white/10 focus:ring-blue-500/50"
                        }`}
                      />

                      {errors.mobile && (
                        <p className="text-red-400 text-sm mt-1">
                          {errors.mobile}
                        </p>
                      )}
                    </div>

                    {/* Age + Gender */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">
                          Age
                        </label>

                        <input
                          type="number"
                          name="age"
                          value={formData.age}
                          onChange={handleChange}
                          placeholder="Enter age"
                          className="w-full bg-slate-800/50 border border-white/10 rounded-xl px-4 py-2 text-white placeholder-gray-400 outline-none focus:ring-2 focus:ring-blue-500/50"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">
                          Gender *
                        </label>

                        <select
                          name="gender"
                          value={formData.gender}
                          onChange={handleChange}
                          className={`w-full bg-slate-800/50 border rounded-xl px-4 py-2 text-white outline-none focus:ring-2 ${
                            errors.gender
                              ? "border-red-500/50 focus:ring-red-500/50"
                              : "border-white/10 focus:ring-blue-500/50"
                          }`}
                        >
                          <option value="" className="bg-slate-900">
                            Select Gender
                          </option>

                          <option className="bg-slate-900">Male</option>
                          <option className="bg-slate-900">Female</option>
                          <option className="bg-slate-900">Other</option>
                        </select>
                      </div>
                    </div>

                    {/* Doctor */}
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-1">
                        Doctor Name
                      </label>

                      <input
                        type="text"
                        name="doctorName"
                        value={formData.doctorName}
                        onChange={handleChange}
                        placeholder="Enter doctor name"
                        className="w-full bg-slate-800/50 border border-white/10 rounded-xl px-4 py-2 text-white placeholder-gray-400 outline-none focus:ring-2 focus:ring-blue-500/50"
                      />
                    </div>

                    {/* Prescription */}
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-1">
                        Prescription Number
                      </label>

                      <input
                        type="text"
                        name="prescriptionNumber"
                        value={formData.prescriptionNumber}
                        onChange={handleChange}
                        placeholder="Enter prescription number"
                        className="w-full bg-slate-800/50 border border-white/10 rounded-xl px-4 py-2 text-white placeholder-gray-400 outline-none focus:ring-2 focus:ring-blue-500/50"
                      />
                    </div>

                    {/* Address */}
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-1">
                        Address
                      </label>

                      <textarea
                        name="address"
                        value={formData.address}
                        onChange={handleChange}
                        placeholder="Enter patient address"
                        rows={2}
                        className="w-full bg-slate-800/50 border border-white/10 rounded-xl px-4 py-2 text-white placeholder-gray-400 outline-none focus:ring-2 focus:ring-blue-500/50 resize-none"
                      />
                    </div>

                    {/* Notes */}
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-1">
                        Remark
                      </label>

                      <textarea
                        name="notes"
                        value={formData.notes}
                        onChange={handleChange}
                        placeholder="Enter Patient Notes"
                        rows={2}
                        className="w-full bg-slate-800/50 border border-white/10 rounded-xl px-4 py-2 text-white placeholder-gray-400 outline-none focus:ring-2 focus:ring-blue-500/50"
                      />
                    </div>

                    {/* Reminder */}
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        name="remindersEnabled"
                        checked={formData.remindersEnabled}
                        onChange={handleChange}
                        className="w-5 h-5 rounded border-white/10 bg-slate-800/50 text-blue-600"
                      />

                      <label className="text-sm text-gray-300">
                        Enable WhatsApp refill reminders
                      </label>
                    </div>

                    {/* Buttons */}
                    <div className="flex justify-end gap-3 pt-2">
                      <button
                        type="submit"
                        disabled={submitting}
                        className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white px-4 py-3 rounded-xl flex items-center justify-center gap-2 transition-all duration-200 shadow-lg"
                      >
                        <UserPlus size={18} />

                        {editMode
                          ? submitting
                            ? "Updating..."
                            : "Update Patient"
                          : submitting
                            ? "Registering..."
                            : "Register Patient"}
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setShowModal(false);
                          setEditMode(false);
                        }}
                        className="px-5 py-3 rounded-xl border border-white/10 text-gray-300 hover:bg-white/5"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                </div>
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
                Patient Management Features
              </h2>
            </div>
          </div>

          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
              {[
                "Auto-detect returning patients during billing",
                "WhatsApp refill reminders supported",
                "Patient records stored permanently",
                "Search by patient name or mobile number",
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

export default Patients;
