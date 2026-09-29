import React, { useEffect, useState } from "react";
import {
  Pill,
  Save,
  ArrowLeft,
  AlertCircle,
  Package,
  Tag,
  Building2,
  Calendar,
  Hash,
  MapPin,
  IndianRupee,
  Percent,
  Boxes,
  Layers,
  ChevronDown,
  RotateCcw,
  CheckCircle2,
  TrendingUp,
  ShieldCheck,
  Calculator,
} from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import apiClient from "../../utils/apiClient";
import ButtonLoader from "../../components/ButtonLoader";

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
        className={`w-full bg-slate-50/80 border rounded-xl ${Icon ? "pl-10" : "pl-3.5"
          } pr-3.5 py-2.5 text-sm text-slate-900 placeholder-slate-400 outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${error
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

const SelectField = ({
  label,
  name,
  options,
  required,
  placeholder,
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
        <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none z-10">
          <Icon size={16} />
        </div>
      )}
      <select
        name={name}
        value={value}
        onChange={onChange}
        className={`w-full bg-slate-50/80 border rounded-xl ${Icon ? "pl-10" : "pl-3.5"
          } pr-9 py-2.5 text-sm font-medium text-slate-700 outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all cursor-pointer appearance-none ${error
            ? "border-rose-400 focus:ring-rose-400 bg-rose-50/20"
            : "border-slate-200 hover:border-slate-300"
          }`}
      >
        <option value="" className="bg-white text-slate-400">
          {placeholder}
        </option>
        {options.map((option, index) => (
          <option key={index} value={option} className="bg-white text-slate-800">
            {option}
          </option>
        ))}
      </select>
      <ChevronDown
        size={14}
        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
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

const AddMedicines = () => {
  const [formData, setFormData] = useState({
    medicineName: "",
    saltName: "",
    brandName: "",
    manufacturer: "",
    category: "",
    packSize: "",
    unit: "",
    purchasePrice: "",
    sellingPrice: "",
    gst: "",
    batchNumber: "",
    manufactureDate: "",
    expiryDate: "",
    rackLocation: "",
    minStock: "",
    quantity: "",
  });
  const [totalTabletQty, setTotalTabletQty] = useState("");
  const [totalPackPrice, setTotalPackPrice] = useState("");
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const editMode = location.state?.editMode || false;
  const medicineData = location.state?.medicineData;

  const handleTabletQtyChange = (val) => {
    setTotalTabletQty(val);
    const qty = parseFloat(val);
    const packPrice = parseFloat(totalPackPrice);
    if (qty > 0 && packPrice > 0) {
      const perTab = (packPrice / qty).toFixed(2);
      setFormData((prev) => ({
        ...prev,
        sellingPrice: perTab,
        packSize: prev.packSize || `${qty} Tablets/Pack`,
      }));
      if (errors.sellingPrice) {
        setErrors((prev) => ({ ...prev, sellingPrice: "" }));
      }
    }
  };

  const handleTotalPackPriceChange = (val) => {
    setTotalPackPrice(val);
    const packPrice = parseFloat(val);
    const qty = parseFloat(totalTabletQty);
    if (qty > 0 && packPrice > 0) {
      const perTab = (packPrice / qty).toFixed(2);
      setFormData((prev) => ({
        ...prev,
        sellingPrice: perTab,
      }));
      if (errors.sellingPrice) {
        setErrors((prev) => ({ ...prev, sellingPrice: "" }));
      }
    }
  };

  useEffect(() => {
    if (editMode && medicineData) {
      setFormData({
        medicineName: medicineData.medicine_name || "",
        saltName: medicineData.salt_name || "",
        brandName: medicineData.brand_name || "",
        manufacturer: medicineData.manufacturer || "",
        category: medicineData.category || "",
        packSize: medicineData.pack_size || "",
        unit: medicineData.unit || "",
        purchasePrice: medicineData.purchase_price || "",
        sellingPrice: medicineData.selling_price || "",
        gst: medicineData.gst || "",
        batchNumber: medicineData.batch_number || "",
        manufactureDate: medicineData.manufacture_date
          ? medicineData.manufacture_date.split("T")[0]
          : "",
        expiryDate: medicineData.expiry_date
          ? medicineData.expiry_date.split("T")[0]
          : "",
        rackLocation: medicineData.rack_location || "",
        minStock: medicineData.min_stock || "",
        quantity: medicineData.quantity || "",
      });
    }
  }, [editMode, medicineData]);

  const categories = [
    "Tablet",
    "Capsule",
    "Syrup",
    "Injection",
    "Antibiotic",
    "Vitamin",
    "Pain Relief",
    "OTC",
    "Ointment",
    "Drops",
  ];

  const units = [
    "Tablet",
    "Capsule",
    "Bottle",
    "Strip",
    "Box",
    "Tube",
    "Injection",
    "Vial",
  ];

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });

    if (errors[e.target.name]) {
      setErrors({
        ...errors,
        [e.target.name]: "",
      });
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.medicineName.trim()) {
      newErrors.medicineName = "Medicine name is required";
    }

    if (!formData.category) {
      newErrors.category = "Category is required";
    }

    if (!formData.purchasePrice) {
      newErrors.purchasePrice = "Purchase price is required";
    } else if (parseFloat(formData.purchasePrice) <= 0) {
      newErrors.purchasePrice = "Purchase price must be greater than 0";
    }

    if (!formData.sellingPrice) {
      newErrors.sellingPrice = "Selling price is required";
    } else if (parseFloat(formData.sellingPrice) <= 0) {
      newErrors.sellingPrice = "Selling price must be greater than 0";
    } else if (
      parseFloat(formData.sellingPrice) <= parseFloat(formData.purchasePrice)
    ) {
      newErrors.sellingPrice =
        "Selling price should be greater than purchase price";
    }

    if (!formData.batchNumber) {
      newErrors.batchNumber = "Batch number is required";
    }

    if (!formData.expiryDate) {
      newErrors.expiryDate = "Expiry date is required";
    }

    if (!formData.quantity) {
      newErrors.quantity = "Stock quantity is required";
    } else if (parseInt(formData.quantity) <= 0) {
      newErrors.quantity = "Quantity must be greater than 0";
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const expiry = new Date(formData.expiryDate);

    if (formData.expiryDate && expiry <= today) {
      newErrors.expiryDate = "Expiry date must be in the future";
    }

    if (formData.manufactureDate) {
      const manufacture = new Date(formData.manufactureDate);
      if (manufacture >= expiry) {
        newErrors.manufactureDate =
          "Manufacture date must be before expiry date";
      }
    }

    if (formData.minStock && parseInt(formData.minStock) < 0) {
      newErrors.minStock = "Minimum stock cannot be negative";
    }

    if (
      formData.gst &&
      (parseFloat(formData.gst) < 0 || parseFloat(formData.gst) > 100)
    ) {
      newErrors.gst = "GST must be between 0 and 100";
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      setIsSubmitting(true);

      const medicinePayload = {
        medicine_name: formData.medicineName,
        salt_name: formData.saltName,
        brand_name: formData.brandName,
        manufacturer: formData.manufacturer,
        category: formData.category,
        pack_size: formData.packSize,
        unit: formData.unit,
        purchase_price: Number(formData.purchasePrice),
        selling_price: Number(formData.sellingPrice),
        gst: Number(formData.gst || 0),
        batch_number: formData.batchNumber,
        manufacture_date: formData.manufactureDate || null,
        expiry_date: formData.expiryDate,
        quantity: Number(formData.quantity),
        rack_location: formData.rackLocation,
        min_stock: Number(formData.minStock || 0),
        status: "ACTIVE",
      };

      if (editMode) {
        await apiClient.put(
          `/medicines/${medicineData.medicine_id}`,
          medicinePayload
        );

        await Swal.fire({
          icon: "success",
          title: "Medicine Updated",
          text: "Medicine records updated successfully",
          confirmButtonColor: "#2563eb",
        });
      } else {
        await apiClient.post("/medicines", medicinePayload);

        await Swal.fire({
          icon: "success",
          title: "Medicine Added",
          text: "Medicine added to inventory catalog successfully",
          confirmButtonColor: "#2563eb",
        });
      }

      navigate("/inventory");
    } catch (error) {
      console.error(error);
      await Swal.fire({
        icon: "error",
        title: "Operation Failed",
        text:
          error.response?.data?.message ||
          "Something went wrong while saving medicine",
        confirmButtonColor: "#ef4444",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = async () => {
    const result = await Swal.fire({
      title: "Reset Form?",
      text: "All entered information will be cleared.",
      icon: "warning",
      iconColor: "#f59e0b",
      showCancelButton: true,
      confirmButtonColor: "#2563eb",
      cancelButtonColor: "#64748b",
      confirmButtonText: "Yes, Reset Form",
      cancelButtonText: "Cancel",
    });

    if (result.isConfirmed) {
      setFormData({
        medicineName: "",
        saltName: "",
        brandName: "",
        manufacturer: "",
        category: "",
        packSize: "",
        unit: "",
        purchasePrice: "",
        sellingPrice: "",
        gst: "",
        batchNumber: "",
        manufactureDate: "",
        expiryDate: "",
        rackLocation: "",
        minStock: "",
        quantity: "",
      });
      setErrors({});
    }
  };

  // Profitability calculations
  const purchaseNum = parseFloat(formData.purchasePrice) || 0;
  const sellingNum = parseFloat(formData.sellingPrice) || 0;
  const profitPerUnit = sellingNum > purchaseNum ? sellingNum - purchaseNum : 0;
  const marginPercentage =
    purchaseNum > 0 && sellingNum > purchaseNum
      ? ((profitPerUnit / purchaseNum) * 100).toFixed(2)
      : 0;

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-[1600px] mx-auto space-y-6">
      {/* 1. HEADER SECTION */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
              <span>{editMode ? "Edit Medicine" : "Add Medicine"}</span>
            </h1>
            <p className="text-slate-500 text-xs sm:text-sm mt-0.5">
              {editMode
                ? "Update medicine specifications and catalog details."
                : "Register a new medicine into your inventory catalog."}
            </p>
          </div>
        </div>

        <Link
          to="/inventory"
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 rounded-xl text-sm font-semibold shadow-xs transition-colors w-fit"
        >
          <ArrowLeft size={16} />
          <span>Back to Inventory</span>
        </Link>
      </div>

      {/* 2. MAIN FORM CARD */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
          {/* Card Top Title Banner */}
          <div className="p-5 sm:p-6 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div>
                <h2 className="text-base font-bold text-slate-800 leading-tight">
                  Medicine Specifications
                </h2>
                <p className="text-xs text-slate-400">
                  Fields marked with an asterisk (<span className="text-blue-500 font-bold">*</span>) are mandatory.
                </p>
              </div>
            </div>

            <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-600 text-xs font-semibold">
              <ShieldCheck size={14} />
              <span>GST & Batch Tracking</span>
            </div>
          </div>

          <div className="p-5 sm:p-6 space-y-6">
            {/* SECTION A: General Information */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Basic Medicine Information
                </h3>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <InputField
                  label="Medicine Name"
                  name="medicineName"
                  value={formData.medicineName}
                  onChange={handleChange}
                  error={errors.medicineName}
                  placeholder="e.g. Paracetamol 500mg"
                  required
                  icon={Pill}
                />

                <InputField
                  label="Generic / Salt Name"
                  name="saltName"
                  value={formData.saltName}
                  onChange={handleChange}
                  placeholder="e.g. Acetaminophen"
                  icon={Tag}
                />

                <InputField
                  label="Brand Name"
                  name="brandName"
                  value={formData.brandName}
                  onChange={handleChange}
                  placeholder="e.g. Crocin"
                  icon={Tag}
                />

                <InputField
                  label="Manufacturer"
                  name="manufacturer"
                  value={formData.manufacturer}
                  onChange={handleChange}
                  placeholder="e.g. Cipla Healthcare"
                  icon={Building2}
                />

                <SelectField
                  label="Category"
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  error={errors.category}
                  options={categories}
                  placeholder="Select Category"
                  required
                  icon={Layers}
                />

                <InputField
                  label="Pack Size"
                  name="packSize"
                  value={formData.packSize}
                  onChange={handleChange}
                  placeholder="e.g. Strip of 10 Tablets"
                  icon={Package}
                />

                <SelectField
                  label="Unit of Measurement"
                  name="unit"
                  value={formData.unit}
                  onChange={handleChange}
                  options={units}
                  placeholder="Select Unit"
                  icon={Boxes}
                />
              </div>
            </div>

            <hr className="border-slate-100" />

            {/* SECTION B: Pricing & Taxation */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Pricing & Taxation
                </h3>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="w-full">
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Total Tablet Quantity (in Pack/Strip)
                  </label>
                  <div className="relative">
                    <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                      <Calculator size={16} />
                    </div>
                    <input
                      type="number"
                      min="1"
                      value={totalTabletQty}
                      onChange={(e) => handleTabletQtyChange(e.target.value)}
                      placeholder="e.g. 10 (tablets in strip)"
                      className="w-full bg-slate-50/80 border border-slate-200 rounded-xl pl-10 pr-3.5 py-2.5 text-sm text-slate-900 placeholder-slate-400 outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                    />
                  </div>
                </div>

                <div className="w-full">
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Total Pack / Strip Price (₹)
                  </label>
                  <div className="relative">
                    <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                      <IndianRupee size={16} />
                    </div>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={totalPackPrice}
                      onChange={(e) => handleTotalPackPriceChange(e.target.value)}
                      placeholder="e.g. 150.00"
                      className="w-full bg-slate-50/80 border border-slate-200 rounded-xl pl-10 pr-3.5 py-2.5 text-sm text-slate-900 placeholder-slate-400 outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                    />
                  </div>
                </div>

                <InputField
                  label="Selling Price (Per Tablet / Unit)"
                  name="sellingPrice"
                  type="number"
                  step="0.01"
                  value={formData.sellingPrice}
                  onChange={handleChange}
                  error={errors.sellingPrice}
                  placeholder="Auto-calculated or enter rate"
                  required
                  icon={IndianRupee}
                />

                <InputField
                  label="Purchase Cost (Per Unit)"
                  name="purchasePrice"
                  type="number"
                  step="0.01"
                  value={formData.purchasePrice}
                  onChange={handleChange}
                  error={errors.purchasePrice}
                  placeholder="Cost price per unit"
                  required
                  icon={IndianRupee}
                />

                <InputField
                  label="GST Rate (%)"
                  name="gst"
                  type="number"
                  value={formData.gst}
                  onChange={handleChange}
                  error={errors.gst}
                  placeholder="e.g. 5, 12, or 18"
                  icon={Percent}
                />

                {/* Per-Tablet Calculation Banner */}
                <div className="sm:col-span-2 lg:col-span-3 p-3.5 rounded-xl bg-blue-50/70 border border-blue-200/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 rounded-lg bg-blue-600 text-white shrink-0">
                      <Calculator size={16} />
                    </div>
                    <div>
                      <span className="text-xs font-bold text-slate-800">
                        Per-Tablet Price Calculation:
                      </span>
                      <p className="text-[11px] text-slate-600 mt-0.5">
                        {totalTabletQty && totalPackPrice ? (
                          <>
                            Total Price (₹{Number(totalPackPrice).toFixed(2)}) ÷ Total Quantity ({totalTabletQty} tablets) ={" "}
                            <span className="font-bold text-blue-700">₹{(Number(totalPackPrice) / Number(totalTabletQty)).toFixed(2)} per tablet</span>
                          </>
                        ) : (
                          "Enter total tablet quantity and total pack price to automatically calculate the per-tablet selling rate for billing."
                        )}
                      </p>
                    </div>
                  </div>
                  {formData.sellingPrice && (
                    <div className="text-right sm:text-right w-full sm:w-auto bg-white px-3 py-1.5 rounded-lg border border-blue-200 shrink-0">
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">Rate / Tablet</span>
                      <span className="text-sm font-extrabold text-blue-700">₹{Number(formData.sellingPrice).toFixed(2)}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Profitability Live Summary */}
              {purchaseNum > 0 && sellingNum > 0 && (
                <div className="mt-4 p-4 rounded-xl bg-slate-50/80 border border-slate-200/90 grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div>
                    <span className="text-[11px] font-medium text-slate-400">
                      Purchase Cost
                    </span>
                    <p className="text-base font-bold text-slate-800 mt-0.5">
                      ₹{purchaseNum.toFixed(2)}
                    </p>
                  </div>
                  <div>
                    <span className="text-[11px] font-medium text-slate-400">
                      Selling MRP
                    </span>
                    <p className="text-base font-bold text-slate-800 mt-0.5">
                      ₹{sellingNum.toFixed(2)}
                    </p>
                  </div>
                  <div>
                    <span className="text-[11px] font-medium text-slate-400">
                      Profit Margin
                    </span>
                    <p className="text-base font-bold text-emerald-600 mt-0.5 flex items-center gap-1">
                      <TrendingUp size={14} />
                      {marginPercentage}%
                    </p>
                  </div>
                  <div>
                    <span className="text-[11px] font-medium text-slate-400">
                      Net Gain / Unit
                    </span>
                    <p className="text-base font-bold text-emerald-600 mt-0.5">
                      ₹{profitPerUnit.toFixed(2)}
                    </p>
                  </div>
                </div>
              )}
            </div>

            <hr className="border-slate-100" />

            {/* SECTION C: Batch & Expiry Management */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Batch & Expiry Dates
                </h3>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <InputField
                  label="Batch Number"
                  name="batchNumber"
                  value={formData.batchNumber}
                  onChange={handleChange}
                  error={errors.batchNumber}
                  placeholder="e.g. BT-98421"
                  required
                  icon={Hash}
                />

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

            <hr className="border-slate-100" />

            {/* SECTION D: Stock & Location */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <span className="w-2 h-2 rounded-full bg-purple-500"></span>
                <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Stock & Storage Location
                </h3>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <InputField
                  label="Initial Stock Quantity"
                  name="quantity"
                  type="number"
                  value={formData.quantity}
                  onChange={handleChange}
                  error={errors.quantity}
                  placeholder="Current stock quantity"
                  required
                  icon={Boxes}
                />

                <InputField
                  label="Minimum Stock Alert Limit"
                  name="minStock"
                  type="number"
                  value={formData.minStock}
                  onChange={handleChange}
                  error={errors.minStock}
                  placeholder="Alert threshold (e.g. 10)"
                  icon={AlertCircle}
                />

                <InputField
                  label="Shelf / Rack Location"
                  name="rackLocation"
                  value={formData.rackLocation}
                  onChange={handleChange}
                  placeholder="e.g. Rack B-3, Shelf 2"
                  icon={MapPin}
                />
              </div>
            </div>
          </div>

          {/* Form Action Footer */}
          <div className="p-5 sm:p-6 bg-slate-50/60 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <CheckCircle2 size={15} className="text-emerald-500" />
              <span>Ensure all mandatory details are verified before saving.</span>
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
                  <ButtonLoader
                    text={
                      editMode ? "Updating Medicine..." : "Saving Medicine..."
                    }
                  />
                ) : (
                  <>
                    <Save size={16} />
                    <span>{editMode ? "Update Medicine" : "Save Medicine"}</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default AddMedicines;
