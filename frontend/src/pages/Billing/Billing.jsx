import React, { useEffect, useMemo, useState } from "react";
import {
  Search,
  User,
  Receipt,
  Plus,
  Trash2,
  Edit,
  Calculator,
  IndianRupee,
  AlertTriangle,
  Printer,
  Download,
  Sparkles,
  Shield,
  Activity,
  Clock,
  TrendingUp,
} from "lucide-react";
import Swal from "sweetalert2";
import { printBill, downloadBillPDF } from "../../utils/billUtils";
import API from "../../utils/api";

const Billing = () => {
  const [patient, setPatient] = useState({
    patientId: "",
    name: "",
    mobile: "",
    age: "",
    gender: "",
    doctorName: "",
    prescriptionNumber: "",
  });
  const [patients, setPatients] = useState([]);
  const [selectedPatientId, setSelectedPatientId] = useState("");
  const [search, setSearch] = useState("");
  const [selectedMedicine, setSelectedMedicine] = useState(null);
  const [quantity, setQuantity] = useState("");
  const [discount, setDiscount] = useState("");
  const [billItems, setBillItems] = useState([]);
  const [paymentMode, setPaymentMode] = useState("Cash");
  const [medicinesData, setMedicinesData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingItemId, setEditingItemId] = useState(null);
  const [editQuantity, setEditQuantity] = useState(1);
  const [editDiscount, setEditDiscount] = useState(0);

  const fetchPatients = async () => {
    try {
      const response = await API.get("/api/patients");
      setPatients(response.data.data || []);
    } catch (error) {
      console.error(error);
      Swal.fire({
        icon: "error",
        title: "Failed to Load Patients",
        text: "Unable to fetch patient records",
        background: "#1e293b",
        color: "#fff",
        confirmButtonColor: "#ef4444",
      });
    }
  };

  const fetchMedicines = async () => {
    try {
      setLoading(true);
      const response = await API.get("/api/medicines");
      const formattedMedicines = response.data.data.map((medicine) => ({
        id: medicine.medicine_id,
        name: medicine.medicine_name,
        batch: medicine.batch_number,
        price: Number(medicine.selling_price),
        gst: Number(medicine.gst),
        stock: Number(medicine.quantity),
        expiry: medicine.expiry_date,
      }));
      setMedicinesData(formattedMedicines);
    } catch (error) {
      console.error(error);
      Swal.fire({
        icon: "error",
        title: "Failed to Load Medicines",
        text: "Unable to fetch medicine inventory",
        background: "#1e293b",
        color: "#fff",
        confirmButtonColor: "#ef4444",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMedicines();
    fetchPatients();
  }, []);

  const filteredMedicines = useMemo(() => {
    return medicinesData.filter((medicine) =>
      medicine.name.toLowerCase().includes(search.toLowerCase()),
    );
  }, [search, medicinesData]);

  const isExpired = (expiryDate) => {
    return new Date(expiryDate) < new Date();
  };

  const addMedicineToBill = () => {
    if (!selectedMedicine) return;
    if (isExpired(selectedMedicine.expiry)) {
      Swal.fire({
        icon: "error",
        title: "Expired Medicine",
        text: "Expired medicines cannot be billed.",
        background: "#1e293b",
        color: "#fff",
      });
      return;
    }
    if (quantity <= 0) {
      Swal.fire({
        icon: "warning",
        title: "Invalid Quantity",
        text: "Quantity must be greater than 0",
        background: "#1e293b",
        color: "#fff",
      });
      return;
    }
    if (quantity > selectedMedicine.stock) {
      Swal.fire({
        icon: "error",
        title: "Insufficient Stock",
        text: `Only ${selectedMedicine.stock} items available`,
        background: "#1e293b",
        color: "#fff",
      });
      return;
    }
    const price = Number(selectedMedicine.price);
    const qty = Number(quantity);
    const gst = Number(selectedMedicine.gst);
    const discountPercent = Number(discount);
    const subtotal = price * qty;
    const discountAmount = (subtotal * discountPercent) / 100;
    const taxableAmount = subtotal - discountAmount;
    const gstAmount = (taxableAmount * gst) / 100;
    const finalTotal = taxableAmount + gstAmount;
    const newItem = {
      medicine_id: selectedMedicine.id,
      id: selectedMedicine.id,
      name: selectedMedicine.name,
      batch: selectedMedicine.batch,
      quantity: qty,
      price,
      gst,
      discount: discountPercent,
      subtotal,
      discountAmount,
      gstAmount,
      total: finalTotal,
    };

    const existingItem = billItems.find(
      (item) => item.id === selectedMedicine.id,
    );

    if (existingItem) {
      Swal.fire({
        icon: "warning",
        title: "Medicine Already Added",
        text: "Remove the medicine and add again with new quantity",
        background: "#1e293b",
        color: "#fff",
      });
      return;
    }
    setBillItems([...billItems, newItem]);
    setSearch("");
    setSelectedMedicine(null);
    setQuantity("");
    setDiscount("");
  };

  const removeItem = (id) => {
    setBillItems(billItems.filter((item) => item.id !== id));
  };

  const handlePatientSelect = (e) => {
    const patientId = e.target.value;
    setSelectedPatientId(patientId);
    const selectedPatient = patients.find(
      (p) => p.patient_id === Number(patientId),
    );

    if (selectedPatient) {
      setPatient({
        patientId: selectedPatient.patient_id,
        name: selectedPatient.patient_name || "",
        mobile: selectedPatient.mobile_number || "",
        age: selectedPatient.age || "",
        gender: selectedPatient.gender || "",
        doctorName: selectedPatient.doctor_name || "",
        prescriptionNumber: selectedPatient.prescription_number || "",
      });
    }
  };

  const totals = useMemo(() => {
    let subtotal = 0;
    let gstTotal = 0;
    let discountTotal = 0;
    let grandTotal = 0;

    billItems.forEach((item) => {
      subtotal += item.subtotal;
      gstTotal += item.gstAmount;
      discountTotal += item.discountAmount;
      grandTotal += item.total;
    });

    return {
      subtotal,
      gstTotal,
      discountTotal,
      grandTotal,
    };
  }, [billItems]);

  const generateBillData = () => {
    if (!patient.patientId) {
      Swal.fire({
        icon: "warning",
        title: "Patient Required",
        text: "Please select patient",
        background: "#1e293b",
        color: "#fff",
      });

      return null;
    }

    if (billItems.length === 0) {
      Swal.fire({
        icon: "warning",
        title: "No Medicines Added",
        text: "Please add medicines to bill",
        background: "#1e293b",
        color: "#fff",
      });

      return null;
    }

    return {
      invoiceNo: `INV-${Date.now()}`,
      date: new Date().toLocaleString(),
      patient,
      medicines: billItems,
      paymentMode,
      totals,
    };
  };

  const handlePrintBill = () => {
    const billData = generateBillData();

    if (!billData) return;

    printBill(billData);
  };

  const handleDownloadPDF = () => {
    const billData = generateBillData();

    if (!billData) return;

    downloadBillPDF(billData);
  };

  const generateBill = () => {
    const billData = generateBillData();
    if (!billData) return;
    Swal.fire({
      icon: "success",
      title: "Bill Generated",
      text: "Bill generated successfully",
      background: "#1e293b",
      color: "#fff",
      confirmButtonColor: "#22c55e",
    });
  };

  const editItem = (id) => {
    const itemToEdit = billItems.find((item) => item.id === id);
    if (!itemToEdit) return;
    setEditingItemId(id);
    setEditQuantity(itemToEdit.quantity || 1);
    setEditDiscount(itemToEdit.discount || 0);
    setIsEditOpen(true);
  };

  const closeEditModal = () => {
    setIsEditOpen(false);
    setEditingItemId(null);
  };

  const saveEdit = () => {
    const quantity = Number(editQuantity) || 0;
    const discount = Number(editDiscount) || 0;

    if (quantity <= 0) {
      return Swal.fire({
        icon: "warning",
        title: "Invalid Quantity",
        text: "Quantity must be greater than 0",
        background: "#1e293b",
        color: "#fff",
      });
    }

    if (discount < 0 || discount > 100) {
      return Swal.fire({
        icon: "warning",
        title: "Invalid Discount",
        text: "Discount must be between 0 and 100",
        background: "#1e293b",
        color: "#fff",
      });
    }

    const updatedItems = billItems.map((item) => {
      if (item.id !== editingItemId) return item;

      const subtotal = item.price * quantity;
      const discountAmount = (subtotal * discount) / 100;
      const taxableAmount = subtotal - discountAmount;
      const gstAmount = (taxableAmount * item.gst) / 100;
      const total = taxableAmount + gstAmount;

      return {
        ...item,
        quantity,
        discount,
        subtotal,
        discountAmount,
        gstAmount,
        total,
      };
    });

    setBillItems(updatedItems);
    closeEditModal();

    Swal.fire({
      icon: "success",
      title: "Medicine Updated",
      text: "Medicine details updated successfully",
      background: "#1e293b",
      color: "#fff",
      confirmButtonColor: "#22c55e",
    });
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

      {isEditOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm"
            onClick={closeEditModal}
          />

          <div className="relative z-10 w-full max-w-md mx-auto">
            <div className="bg-slate-800 border border-white/10 rounded-2xl p-6 text-white shadow-xl">
              <h3 className="text-lg font-semibold mb-4">Edit Medicine</h3>

              <label className="text-sm text-gray-300">Quantity</label>
              <input
                type="number"
                min={1}
                step={1}
                value={editQuantity}
                onChange={(e) => setEditQuantity(Number(e.target.value))}
                className="w-full bg-slate-900/60 border border-white/10 rounded-xl px-3 py-2 text-white placeholder-gray-400 outline-none focus:ring-2 focus:ring-blue-500/40 mt-2 mb-4"
              />

              <label className="text-sm text-gray-300">Discount %</label>
              <input
                type="number"
                min={0}
                max={100}
                step={0.01}
                value={editDiscount}
                onChange={(e) => setEditDiscount(Number(e.target.value))}
                className="w-full bg-slate-900/60 border border-white/10 rounded-xl px-3 py-2 text-white placeholder-gray-400 outline-none focus:ring-2 focus:ring-purple-500/40 mt-2"
              />

              <div className="flex items-center justify-end gap-3 mt-6">
                <button
                  onClick={closeEditModal}
                  className="px-4 py-2 rounded-xl bg-transparent border border-white/10 text-gray-300 hover:bg-white/5 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={saveEdit}
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-green-600 to-emerald-600 text-white hover:from-green-700 hover:to-emerald-700 transition"
                >
                  Update
                </button>
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
                  New Billing
                </h1>
                <p className="text-blue-300/70 text-sm mt-1">
                  Create pharmacy patient bill
                </p>
              </div>
            </div>
          </div>

          <div className="bg-indigo-500/10 border border-indigo-500/20 rounded-xl px-4 py-3 flex items-center gap-3 backdrop-blur-sm">
            <Shield size={18} className="text-indigo-400" />
            <p className="text-indigo-300/90 text-sm">
              Stock automatically reduces after successful billing
            </p>
            <Sparkles size={16} className="text-indigo-400 animate-pulse" />
          </div>
        </div>

       <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 relative">
          {/* LEFT SECTION */}
          <div className="xl:col-span-2 space-y-6 relative overflow-visible">
            {/* Patient Info Card */}
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl shadow-xl overflow-hidden relative z-0">
              <div className="bg-gradient-to-r from-blue-500/10 to-indigo-500/10 px-6 py-4 border-b border-white/10">
                <div className="flex items-center gap-3">
                  <div className="bg-blue-500/20 p-2 rounded-xl">
                    <User size={20} className="text-blue-400" />
                  </div>
                  <h2 className="text-lg font-semibold text-white">
                    Patient Details
                  </h2>
                </div>
              </div>

              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <select
                    value={selectedPatientId}
                    onChange={handlePatientSelect}
                    className="bg-slate-800/50 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent transition-all"
                  >
                    <option value="" className="bg-slate-900">
                      Select Patient *
                    </option>

                    {patients.map((patient) => (
                      <option
                        key={patient.patient_id}
                        value={patient.patient_id}
                        className="bg-slate-900"
                      >
                        {patient.patient_name} - {patient.mobile_number}
                      </option>
                    ))}
                  </select>
                  <input
                    type="text"
                    placeholder="Mobile Number *"
                    value={patient.mobile}
                    // onChange={(e) =>
                    //   setPatient({ ...patient, mobile: e.target.value })
                    // }
                    readOnly
                    className="bg-slate-800/50 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-400 outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent transition-all"
                  />
                  <input
                    type="number"
                    placeholder="Age"
                    value={patient.age}
                    // onChange={(e) =>
                    //   setPatient({ ...patient, age: e.target.value })
                    // }
                    readOnly
                    className="bg-slate-800/50 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-400 outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent transition-all"
                  />
                  <select
                    value={patient.gender}
                    // onChange={(e) =>
                    //   setPatient({ ...patient, gender: e.target.value })
                    // }
                    readOnly
                    className="bg-slate-800/50 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent transition-all"
                  >
                    <option value="" className="bg-slate-900">
                      Select Gender
                    </option>
                    <option className="bg-slate-900">Male</option>
                    <option className="bg-slate-900">Female</option>
                    <option className="bg-slate-900">Other</option>
                  </select>
                  <input
                    type="text"
                    placeholder="Doctor Name"
                    value={patient.doctorName}
                    // onChange={(e) =>
                    //   setPatient({ ...patient, doctorName: e.target.value })
                    // }
                    readOnly
                    className="bg-slate-800/50 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-400 outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent transition-all"
                  />
                  <input
                    type="text"
                    placeholder="Prescription Number"
                    value={patient.prescriptionNumber}
                    // onChange={(e) =>
                    //   setPatient({
                    //     ...patient,
                    //     prescriptionNumber: e.target.value,
                    //   })
                    // }
                    readOnly
                    className="bg-slate-800/50 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-400 outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent transition-all"
                  />
                </div>
              </div>
            </div>

            {/* Add Medicine Card */}
           <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl shadow-xl overflow-visible relative z-50">
              <div className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 px-6 py-4 border-b border-white/10">
                <div className="flex items-center gap-3">
                  <div className="bg-purple-500/20 p-2 rounded-xl">
                    <Search size={20} className="text-purple-400" />
                  </div>
                  <h2 className="text-lg font-semibold text-white">
                    Add Medicines
                  </h2>
                </div>
              </div>

              <div className="p-6">
                {/* Search */}
                <div className="relative mb-5">
                  <Search
                    size={18}
                    className="absolute left-3 top-3 text-gray-400"
                  />
                  <input
                    type="text"
                    placeholder="Search medicine..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full bg-slate-800/50 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-white placeholder-gray-400 outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-transparent transition-all"
                  />

                  {search && (
                   <div className="absolute left-0 right-0 top-full mt-2 bg-slate-800 border border-white/10 rounded-xl shadow-2xl w-full max-h-72 overflow-y-auto backdrop-blur-xl custom-scrollbar z-[99999]">
                      {loading ? (
                        <div className="p-4 text-center text-gray-400">
                          Loading medicines...
                        </div>
                      ) : filteredMedicines.length > 0 ? (
                        filteredMedicines.map((medicine) => (
                          <button
                            type="button"
                            key={medicine.id}
                            onClick={() => {
                              setSelectedMedicine(medicine);
                              setSearch(medicine.name);
                            }}
                            className="w-full text-left p-4 hover:bg-white/5 transition-colors duration-200 border-b border-white/10"
                          >
                            <div className="flex items-center justify-between">
                              <div>
                                <h3 className="font-medium text-white">
                                  {medicine.name}
                                </h3>
                                <p className="text-sm text-gray-400 mt-1">
                                  Stock: {medicine.stock}
                                </p>
                              </div>
                              {medicine.stock === 0 && (
                                <span className="bg-red-500/20 text-red-400 px-3 py-1 rounded-full text-xs border border-red-500/30">
                                  Out Of Stock
                                </span>
                              )}
                            </div>
                          </button>
                        ))
                      ) : (
                        <div className="p-4 text-center text-gray-400">
                          No medicines found
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Selected Medicine */}
                {selectedMedicine && (
                  <div className="border border-white/10 rounded-2xl p-5 bg-slate-800/30 backdrop-blur-sm">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div>
                        <p className="text-sm text-gray-400">Price</p>
                        <h3 className="font-semibold text-white mt-1">
                          ₹{selectedMedicine.price}
                        </h3>
                      </div>
                      <div>
                        <p className="text-sm text-gray-400">GST</p>
                        <h3 className="font-semibold text-white mt-1">
                          {selectedMedicine.gst}%
                        </h3>
                      </div>
                      <div>
                        <p className="text-sm text-gray-400">Stock</p>
                        <h3 className="font-semibold text-white mt-1">
                          {selectedMedicine.stock}
                        </h3>
                      </div>
                      <div>
                        <p className="text-sm text-gray-400">Batch</p>
                        <h3 className="font-semibold text-white mt-1">
                          {selectedMedicine.batch}
                        </h3>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-5">
                      <input
                        type="number"
                        placeholder="Quantity"
                        value={quantity}
                        onChange={(e) => setQuantity(Number(e.target.value))}
                        className="bg-slate-800/50 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-400 outline-none focus:ring-2 focus:ring-purple-500/50"
                      />
                      <input
                        type="number"
                        placeholder="Discount %"
                        value={discount}
                        onChange={(e) => setDiscount(Number(e.target.value))}
                        className="bg-slate-800/50 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-400 outline-none focus:ring-2 focus:ring-purple-500/50"
                      />
                      <button
                        onClick={addMedicineToBill}
                        type="button"
                        className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-xl px-4 py-3 flex items-center justify-center gap-2 transition-all duration-200 shadow-lg"
                      >
                        <Plus size={18} />
                        Add To Bill
                      </button>
                    </div>

                    {isExpired(selectedMedicine.expiry) && (
                      <div className="mt-4 bg-red-500/10 border border-red-500/20 rounded-xl p-4 flex items-center gap-3 backdrop-blur-sm">
                        <AlertTriangle className="text-red-400" size={22} />
                        <p className="text-red-400 text-sm">
                          Expired medicines cannot be billed.
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Bill Table */}
           <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl shadow-xl overflow-visible relative z-0">
              <div className="bg-gradient-to-r from-green-500/10 to-emerald-500/10 px-6 py-4 border-b border-white/10">
                <h2 className="text-lg font-semibold text-white">Bill Items</h2>
              </div>

              <div className="overflow-x-auto relative z-0">
                <table className="w-full min-w-[900px]">
                  <thead className="bg-slate-800/50 border-b border-white/10">
                    <tr>
                      <th className="text-left p-4 text-sm font-semibold text-gray-300">
                        Medicine
                      </th>
                      <th className="text-left p-4 text-sm font-semibold text-gray-300">
                        Qty
                      </th>
                      <th className="text-left p-4 text-sm font-semibold text-gray-300">
                        Price
                      </th>
                      <th className="text-left p-4 text-sm font-semibold text-gray-300">
                        GST
                      </th>
                      <th className="text-left p-4 text-sm font-semibold text-gray-300">
                        Discount
                      </th>
                      <th className="text-left p-4 text-sm font-semibold text-gray-300">
                        Total
                      </th>
                      <th className="text-left p-4 text-sm font-semibold text-gray-300">
                        Action
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {billItems.map((item) => {
                      const total = item.total;
                      return (
                        <tr
                          key={item.id}
                          className="border-b border-white/5 hover:bg-white/5 transition-colors"
                        >
                          <td className="p-4 font-medium text-white">
                            {item.name}
                          </td>
                          <td className="p-4 text-gray-300">{item.quantity}</td>
                          <td className="p-4 text-gray-300">
                            ₹{item.price.toFixed(2)}
                          </td>
                          <td className="p-4 text-gray-300">
                            {item.gst}%<br />
                            <span className="text-xs text-green-400">
                              ₹{item.gstAmount.toFixed(2)}
                            </span>
                          </td>
                          <td className="p-4 text-gray-300">
                            {item.discount}%<br />
                            <span className="text-xs text-red-400">
                              ₹{item.discountAmount.toFixed(2)}
                            </span>
                          </td>
                          <td className="p-4 font-semibold text-white">
                            ₹{item.total.toFixed(2)}
                          </td>
                          <td className="p-4">
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => editItem(item.id)}
                                className="bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 p-2 rounded-lg transition-all"
                              >
                                <Edit size={16} />
                              </button>

                              <button
                                onClick={() => removeItem(item.id)}
                                className="bg-red-500/20 hover:bg-red-500/30 text-red-400 p-2 rounded-lg transition-all"
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

                {billItems.length === 0 && (
                  <div className="text-center py-12 text-gray-400">
                    No medicines added.
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* RIGHT SECTION */}
          <div className="space-y-6">
            {/* Bill Summary */}
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl shadow-xl overflow-hidden sticky top-6">
              <div className="bg-gradient-to-r from-green-500/10 to-emerald-500/10 px-6 py-4 border-b border-white/10">
                <div className="flex items-center gap-3">
                  <div className="bg-green-500/20 p-2 rounded-xl">
                    <Calculator size={20} className="text-green-400" />
                  </div>
                  <h2 className="text-lg font-semibold text-white">
                    Bill Summary
                  </h2>
                </div>
              </div>

              <div className="p-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <p className="text-gray-400">Subtotal</p>
                    <h3 className="font-semibold text-white">
                      ₹{totals.subtotal.toFixed(2)}
                    </h3>
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="text-gray-400">Discount</p>
                    <h3 className="font-semibold text-red-400">
                      - ₹{totals.discountTotal.toFixed(2)}
                    </h3>
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="text-gray-400">GST</p>
                    <h3 className="font-semibold text-white">
                      ₹{totals.gstTotal.toFixed(2)}
                    </h3>
                  </div>
                  <div className="border-t border-white/10 pt-4 flex items-center justify-between">
                    <h2 className="text-lg font-bold text-white">
                      Grand Total
                    </h2>
                    <h2 className="text-2xl font-bold bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">
                      ₹{totals.grandTotal.toFixed(2)}
                    </h2>
                  </div>
                </div>

                <div className="mt-6">
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Payment Mode
                  </label>
                  <select
                    value={paymentMode}
                    onChange={(e) => setPaymentMode(e.target.value)}
                    className="w-full bg-slate-800/50 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:ring-2 focus:ring-green-500/50 focus:border-transparent transition-all"
                  >
                    <option className="bg-slate-900">Cash</option>
                    <option className="bg-slate-900">UPI</option>
                    <option className="bg-slate-900">Card</option>
                    <option className="bg-slate-900">Insurance</option>
                    <option className="bg-slate-900">Credit</option>
                  </select>
                </div>

                <div className="space-y-3 mt-6">
                  <button
                    onClick={generateBill}
                    className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white px-4 py-3 rounded-xl flex items-center justify-center gap-2 transition-all duration-200 shadow-lg"
                  >
                    <Receipt size={18} />
                    Generate Bill
                  </button>
                  <button
                    onClick={handlePrintBill}
                    className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-4 py-3 rounded-xl flex items-center justify-center gap-2 transition-all duration-200 shadow-lg"
                  >
                    <Printer size={18} />
                    Print Bill
                  </button>
                  <button
                    onClick={handleDownloadPDF}
                    className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-4 py-3 rounded-xl flex items-center justify-center gap-2 transition-all duration-200 shadow-lg"
                  >
                    <Download size={18} />
                    Download PDF
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Billing;
