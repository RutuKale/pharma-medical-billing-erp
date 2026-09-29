import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Search,
  Save,
  Truck,
  Calendar,
  AlertCircle,
  ArrowLeft,
  Building2,
  Hash,
  MapPin,
  IndianRupee,
  FileText,
  TrendingUp,
  CheckCircle2,
  X,
  Package,
  RotateCcw,
  ShieldCheck,
  Layers,
  Boxes,
} from "lucide-react";
import Swal from "sweetalert2";
import API from "../../utils/api";

const InputField = ({
  label,
  name,
  type = "text",
  placeholder,
  required,
  icon: Icon,
  value,
  onChange,
  error,
}) => (
  <div className="w-full">
    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
      {label} {required && <span className="text-blue-500 font-bold">*</span>}
    </label>
    <div className="relative">
      {Icon && (
        <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
          <Icon size={16} />
        </div>
      )}
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className={`w-full bg-slate-50/80 border rounded-xl ${
          Icon ? "pl-10" : "pl-3.5"
        } pr-3.5 py-2.5 text-sm text-slate-900 placeholder-slate-400 outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
          error
            ? "border-rose-400 focus:ring-rose-400 bg-rose-50/20"
            : "border-slate-200 hover:border-slate-300"
        }`}
      />
    </div>
    {error && (
      <p className="text-rose-500 text-xs mt-1 flex items-center gap-1 font-medium">
        <AlertCircle size={12} className="shrink-0" />
        <span>{error}</span>
      </p>
    )}
  </div>
);

const TextAreaField = ({
  label,
  name,
  rows = 3,
  placeholder,
  icon: Icon,
  value,
  onChange,
}) => (
  <div className="w-full">
    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
      {label}
    </label>
    <div className="relative">
      {Icon && (
        <div className="absolute left-3.5 top-3 text-slate-400 pointer-events-none">
          <Icon size={16} />
        </div>
      )}
      <textarea
        rows={rows}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className={`w-full bg-slate-50/80 border border-slate-200 hover:border-slate-300 rounded-xl ${
          Icon ? "pl-10" : "pl-3.5"
        } pr-3.5 py-2.5 text-sm text-slate-900 placeholder-slate-400 outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none`}
      />
    </div>
  </div>
);

const StockIn = () => {
  const [medicinesData, setMedicinesData] = useState([]);
  const [search, setSearch] = useState("");
  const [selectedMedicine, setSelectedMedicine] = useState(null);
  const [showResults, setShowResults] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    supplierName: "",
    invoiceNumber: "",
    quantity: "",
    purchasePrice: "",
    batchNumber: "",
    manufactureDate: "",
    expiryDate: "",
    rackLocation: "",
    notes: "",
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    const fetchMedicines = async () => {
      try {
        const response = await API.get("/medicines");
        if (response.data?.success) {
          const mapped = response.data.data.map((medicine) => ({
            id: medicine.medicine_id,
            name: medicine.medicine_name,
            batch: medicine.batch_number,
            currentStock: Number(medicine.quantity),
            category: medicine.category || medicine.medicine_category || "",
            unit: medicine.unit || "Unit",
            sellingPrice: Number(medicine.selling_price || 0),
          }));
          setMedicinesData(mapped);
        }
      } catch (error) {
        console.error("Error fetching medicines:", error);
      }
    };

    fetchMedicines();
  }, []);

  const filteredMedicines = useMemo(() => {
    if (!search.trim()) return [];
    return medicinesData.filter((medicine) =>
      medicine.name.toLowerCase().includes(search.toLowerCase())
    );
  }, [medicinesData, search]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!selectedMedicine) {
      newErrors.medicine = "Please select a medicine from catalog";
    }

    if (!formData.supplierName.trim()) {
      newErrors.supplierName = "Supplier name is required";
    }

    if (!formData.quantity) {
      newErrors.quantity = "Quantity is required";
    } else if (parseInt(formData.quantity, 10) <= 0) {
      newErrors.quantity = "Quantity must be greater than 0";
    }

    if (!formData.purchasePrice) {
      newErrors.purchasePrice = "Purchase price is required";
    } else if (parseFloat(formData.purchasePrice) <= 0) {
      newErrors.purchasePrice = "Purchase price must be greater than 0";
    }

    if (!formData.batchNumber.trim()) {
      newErrors.batchNumber = "Batch number is required";
    }

    if (!formData.expiryDate) {
      newErrors.expiryDate = "Expiry date is required";
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const expiry = new Date(formData.expiryDate);

    if (formData.expiryDate && expiry <= today) {
      newErrors.expiryDate = "Expiry date must be in the future";
    }

    if (formData.manufactureDate && formData.expiryDate) {
      const manufacture = new Date(formData.manufactureDate);
      if (manufacture >= expiry) {
        newErrors.manufactureDate =
          "Manufacture date must be before expiry date";
      }
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsSubmitting(true);

    const stockInData = {
      medicine_id: selectedMedicine.id,
      quantity: parseInt(formData.quantity, 10),
      remarks: `${formData.supplierName} | Invoice: ${
        formData.invoiceNumber || "N/A"
      } | Batch: ${formData.batchNumber}${
        formData.notes ? ` | Notes: ${formData.notes}` : ""
      }`,
    };

    try {
      const response = await API.post("/inventory/stock-in", stockInData);
      if (response.data?.success) {
        await Swal.fire({
          icon: "success",
          title: "Stock Received!",
          text: `Successfully added ${formData.quantity} units to ${selectedMedicine.name}`,
          confirmButtonColor: "#2563eb",
        });

        // Reset
        setSelectedMedicine(null);
        setFormData({
          supplierName: "",
          invoiceNumber: "",
          quantity: "",
          purchasePrice: "",
          batchNumber: "",
          manufactureDate: "",
          expiryDate: "",
          rackLocation: "",
          notes: "",
        });
        setSearch("");
        setShowResults(false);
      } else {
        await Swal.fire({
          icon: "error",
          title: "Operation Failed",
          text: response.data?.message || "Unable to add stock",
          confirmButtonColor: "#ef4444",
        });
      }
    } catch (error) {
      console.error("Stock in error:", error);
      await Swal.fire({
        icon: "error",
        title: "Error",
        text: error.response?.data?.message || "Failed to record stock entry",
        confirmButtonColor: "#ef4444",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = async () => {
    const result = await Swal.fire({
      title: "Reset Stock Entry?",
      text: "All entered information will be cleared.",
      icon: "warning",
      iconColor: "#f59e0b",
      showCancelButton: true,
      confirmButtonColor: "#2563eb",
      cancelButtonColor: "#64748b",
      confirmButtonText: "Yes, Reset",
      cancelButtonText: "Cancel",
    });

    if (result.isConfirmed) {
      setSelectedMedicine(null);
      setFormData({
        supplierName: "",
        invoiceNumber: "",
        quantity: "",
        purchasePrice: "",
        batchNumber: "",
        manufactureDate: "",
        expiryDate: "",
        rackLocation: "",
        notes: "",
      });
      setSearch("");
      setShowResults(false);
      setErrors({});
    }
  };

  const handleSelectMedicine = (medicine) => {
    setSelectedMedicine(medicine);
    setSearch(medicine.name);
    setShowResults(false);
    setFormData((prev) => ({
      ...prev,
      batchNumber: medicine.batch || prev.batchNumber,
    }));
    if (errors.medicine) {
      setErrors((prev) => ({ ...prev, medicine: "" }));
    }
  };

  const handleClearSelectedMedicine = () => {
    setSelectedMedicine(null);
    setSearch("");
  };

  const parsedQty = parseInt(formData.quantity, 10) || 0;
  const parsedPrice = parseFloat(formData.purchasePrice) || 0;
  const totalValue = parsedQty > 0 && parsedPrice > 0 ? parsedQty * parsedPrice : 0;
  const updatedStock = selectedMedicine
    ? selectedMedicine.currentStock + parsedQty
    : 0;

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-[1600px] mx-auto space-y-6">
      {/* 1. HEADER SECTION (no icon in header as requested) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <span>Stock In</span>
          </h1>
          <p className="text-slate-500 text-xs sm:text-sm mt-0.5">
            Receive and record incoming medicine inventory stock from wholesale suppliers.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Link
            to="/inventory"
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 rounded-xl text-sm font-semibold shadow-xs transition-colors"
          >
            <ArrowLeft size={16} />
            <span>Back to Inventory</span>
          </Link>
          <Link
            to="/inventory/stock"
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 rounded-xl text-sm font-semibold shadow-xs transition-colors"
          >
            <Package size={16} />
            <span>Stock Overview</span>
          </Link>
        </div>
      </div>

      {/* 2. MAIN FORM CONTENT */}
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
          {/* LEFT SECTION (xl:col-span-8): Main Stock Receipt Card */}
          <div className="xl:col-span-8 bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
            {/* Card Header Banner */}
            <div className="p-5 sm:p-6 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-slate-800 leading-tight">
                  Receive Inward Stock
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Select a registered catalog medicine and supply receipt details.
                </p>
              </div>

              <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-600 text-xs font-semibold">
                <ShieldCheck size={14} />
                <span>Verified Stock In</span>
              </div>
            </div>

            <div className="p-5 sm:p-6 space-y-6">
              {/* MEDICINE SEARCH & SELECTION */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Select Medicine <span className="text-blue-500 font-bold">*</span>
                </label>
                <div className="relative">
                  <Search
                    size={16}
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
                  />
                  <input
                    type="text"
                    placeholder="Type to search medicine by name..."
                    value={search}
                    onChange={(e) => {
                      setSearch(e.target.value);
                      setShowResults(true);
                      if (errors.medicine) {
                        setErrors((prev) => ({ ...prev, medicine: "" }));
                      }
                    }}
                    onFocus={() => setShowResults(true)}
                    className={`w-full bg-slate-50/80 border rounded-xl pl-10 pr-10 py-2.5 text-sm text-slate-900 placeholder-slate-400 outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                      errors.medicine
                        ? "border-rose-400 focus:ring-rose-400 bg-rose-50/20"
                        : "border-slate-200 hover:border-slate-300"
                    }`}
                  />
                  {selectedMedicine && (
                    <button
                      type="button"
                      onClick={handleClearSelectedMedicine}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
                    >
                      <X size={15} />
                    </button>
                  )}
                </div>

                {/* Search Results Dropdown Overlay */}
                {showResults && search && !selectedMedicine && (
                  <div className="relative">
                    <div className="absolute z-30 mt-2 w-full bg-white border border-slate-200 rounded-2xl shadow-xl max-h-64 overflow-y-auto divide-y divide-slate-100">
                      {filteredMedicines.length > 0 ? (
                        filteredMedicines.map((medicine) => (
                          <button
                            type="button"
                            key={medicine.id}
                            onClick={() => handleSelectMedicine(medicine)}
                            className="w-full text-left p-3.5 hover:bg-slate-50 transition-colors flex items-center justify-between group"
                          >
                            <div className="min-w-0">
                              <h4 className="font-semibold text-slate-800 text-sm group-hover:text-blue-600 transition-colors truncate">
                                {medicine.name}
                              </h4>
                              <p className="text-xs text-slate-400 mt-0.5">
                                Category: {medicine.category || "General"} • Batch:{" "}
                                {medicine.batch || "N/A"}
                              </p>
                            </div>
                            <div className="shrink-0 text-right ml-3">
                              <span className="inline-block px-2.5 py-1 rounded-lg text-xs font-bold bg-slate-100 text-slate-700">
                                Stock: {medicine.currentStock} {medicine.unit}
                              </span>
                            </div>
                          </button>
                        ))
                      ) : (
                        <div className="p-5 text-center">
                          <p className="text-xs text-slate-500">
                            No matching medicines found in catalog.
                          </p>
                          <Link
                            to="/inventory/add-medicine"
                            className="text-xs font-semibold text-blue-600 hover:underline mt-1.5 inline-block"
                          >
                            + Register New Medicine
                          </Link>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Selected Medicine Pill */}
                {selectedMedicine && (
                  <div className="mt-2.5 p-3 rounded-xl bg-blue-50/70 border border-blue-100 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold text-xs shrink-0">
                        ✓
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-800">
                          {selectedMedicine.name}
                        </p>
                        <p className="text-[11px] text-slate-500">
                          Current Stock:{" "}
                          <span className="font-semibold text-blue-600">
                            {selectedMedicine.currentStock} {selectedMedicine.unit}
                          </span>{" "}
                          • Batch: {selectedMedicine.batch || "N/A"}
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={handleClearSelectedMedicine}
                      className="text-xs text-blue-600 hover:text-blue-700 font-semibold"
                    >
                      Change
                    </button>
                  </div>
                )}

                {errors.medicine && (
                  <p className="text-rose-500 text-xs mt-1.5 flex items-center gap-1 font-medium">
                    <AlertCircle size={12} className="shrink-0" />
                    <span>{errors.medicine}</span>
                  </p>
                )}
              </div>

              <hr className="border-slate-100" />

              {/* SUPPLIER & INVOICE */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                  <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Supplier & Purchase Bill
                  </h3>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <InputField
                    label="Supplier Name"
                    name="supplierName"
                    value={formData.supplierName}
                    onChange={handleChange}
                    error={errors.supplierName}
                    placeholder="e.g. Apollo Wholesale Distributors"
                    required
                    icon={Building2}
                  />

                  <InputField
                    label="Supplier Invoice / Bill No."
                    name="invoiceNumber"
                    value={formData.invoiceNumber}
                    onChange={handleChange}
                    placeholder="e.g. INV-2026-889"
                    icon={FileText}
                  />
                </div>
              </div>

              <hr className="border-slate-100" />

              {/* STOCK QUANTITY & PRICING */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                  <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Batch Stock & Pricing
                  </h3>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <InputField
                    label="Quantity Received"
                    name="quantity"
                    type="number"
                    value={formData.quantity}
                    onChange={handleChange}
                    error={errors.quantity}
                    placeholder="Number of units added"
                    required
                    icon={Boxes}
                  />

                  <InputField
                    label="Purchase Price Per Unit (₹)"
                    name="purchasePrice"
                    type="number"
                    value={formData.purchasePrice}
                    onChange={handleChange}
                    error={errors.purchasePrice}
                    placeholder="Cost per unit"
                    required
                    icon={IndianRupee}
                  />

                  <InputField
                    label="Batch Number"
                    name="batchNumber"
                    value={formData.batchNumber}
                    onChange={handleChange}
                    error={errors.batchNumber}
                    placeholder="e.g. BATCH-7781"
                    required
                    icon={Hash}
                  />

                  <InputField
                    label="Rack / Shelf Location"
                    name="rackLocation"
                    value={formData.rackLocation}
                    onChange={handleChange}
                    placeholder="e.g. Rack C-04, Shelf 1"
                    icon={MapPin}
                  />
                </div>
              </div>

              <hr className="border-slate-100" />

              {/* DATES */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                  <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Manufacturing & Expiry
                  </h3>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <InputField
                    label="Manufacturing Date"
                    name="manufactureDate"
                    type="date"
                    value={formData.manufactureDate}
                    onChange={handleChange}
                    error={errors.manufactureDate}
                    icon={Calendar}
                  />

                  <InputField
                    label="Expiry Date"
                    name="expiryDate"
                    type="date"
                    value={formData.expiryDate}
                    onChange={handleChange}
                    error={errors.expiryDate}
                    required
                    icon={Calendar}
                  />
                </div>
              </div>

              {/* NOTES */}
              <TextAreaField
                label="Notes / Remarks"
                name="notes"
                rows={2}
                value={formData.notes}
                onChange={handleChange}
                placeholder="Optional notes regarding this shipment, batch packaging, or condition..."
                icon={FileText}
              />
            </div>

            {/* Form Footer */}
            <div className="p-5 sm:p-6 bg-slate-50/60 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="flex items-center gap-2 text-xs text-slate-400">
                <CheckCircle2 size={15} className="text-emerald-500" />
                <span>Inventory counts will automatically update upon saving.</span>
              </div>

              <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
                <button
                  type="button"
                  onClick={handleReset}
                  className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 rounded-xl text-sm font-semibold shadow-xs transition-colors"
                >
                  <RotateCcw size={15} />
                  <span>Reset</span>
                </button>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="inline-flex items-center justify-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-semibold shadow-xs transition-colors disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Saving Stock...</span>
                    </>
                  ) : (
                    <>
                      <Save size={16} />
                      <span>Save Stock Entry</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* RIGHT SECTION (xl:col-span-4): Live Stock Preview Card */}
          <div className="xl:col-span-4 space-y-6">
            <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-5 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                  <h3 className="text-base font-bold text-slate-800 leading-tight">
                    Stock In Preview
                  </h3>
                  <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full">
                    Live Calculation
                  </span>
                </div>

                {selectedMedicine ? (
                  <div className="mt-4 space-y-4">
                    {/* Medicine Identity */}
                    <div className="p-3.5 rounded-xl bg-slate-50/80 border border-slate-100">
                      <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                        Selected Medicine
                      </span>
                      <h4 className="text-base font-bold text-slate-800 mt-0.5">
                        {selectedMedicine.name}
                      </h4>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Category: {selectedMedicine.category || "General"}
                      </p>
                    </div>

                    {/* Stock Transition Card */}
                    <div className="p-4 rounded-xl bg-blue-50/60 border border-blue-100">
                      <div className="flex items-center justify-between text-xs font-medium text-slate-500">
                        <span>Current Stock</span>
                        <span className="text-blue-600 font-bold">Inward Addition</span>
                        <span>Updated Total</span>
                      </div>
                      <div className="flex items-center justify-between mt-2 font-bold text-slate-900">
                        <span className="text-lg text-slate-600">
                          {selectedMedicine.currentStock}
                        </span>
                        <span className="text-base text-blue-600">
                          +{parsedQty}
                        </span>
                        <span className="text-2xl text-slate-900">
                          {updatedStock}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-2 text-center">
                        Total units in warehouse post entry
                      </p>
                    </div>

                    {/* Invoice Value Summary */}
                    {totalValue > 0 && (
                      <div className="p-4 rounded-xl bg-emerald-50/60 border border-emerald-100">
                        <span className="text-[10px] font-semibold text-emerald-600 uppercase tracking-wider">
                          Inward Stock Valuation
                        </span>
                        <h3 className="text-2xl font-extrabold text-slate-900 mt-1">
                          ₹
                          {totalValue.toLocaleString("en-IN", {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}
                        </h3>
                        <p className="text-xs text-slate-500 mt-1">
                          {parsedQty} units @ ₹{parsedPrice.toFixed(2)} / unit
                        </p>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-12 px-4">
                    <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto mb-3">
                      <Truck size={24} />
                    </div>
                    <h4 className="text-sm font-bold text-slate-700">
                      No Medicine Selected
                    </h4>
                    <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto">
                      Search and select a medicine on the left to see live stock transition calculations.
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Supplier Quick Reference Card */}
            {formData.supplierName && (
              <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-4 flex items-center justify-between gap-3 animate-in fade-in duration-200">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-600 flex items-center justify-center">
                    <Building2 size={16} />
                  </div>
                  <div>
                    <span className="text-[10px] font-semibold text-slate-400 uppercase">
                      Supplier Record
                    </span>
                    <p className="text-xs font-bold text-slate-800">
                      {formData.supplierName}
                    </p>
                  </div>
                </div>
                {formData.invoiceNumber && (
                  <div className="text-right">
                    <span className="text-[10px] font-semibold text-slate-400 uppercase">
                      Invoice
                    </span>
                    <p className="text-xs font-mono font-bold text-slate-700">
                      {formData.invoiceNumber}
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </form>
    </div>
  );
};

export default StockIn;
