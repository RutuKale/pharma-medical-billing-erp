import React, { useState } from "react";
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
  DollarSign,
  Percent,
  Boxes,
  Layers,
  Sparkles,
  Shield,
  ChevronRight,
} from "lucide-react";
import { Link } from "react-router-dom";

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
    <div>
      <label className="block text-sm font-medium text-gray-300 mb-2">
        {label} {required && <span className="text-blue-400">*</span>}
      </label>
      <div className="relative">
        {Icon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2">
            <Icon size={16} className="text-gray-500" />
          </div>
        )}
        <input
          type={type}
          name={name}
          value={value}
          onChange={onchange}
          placeholder={placeholder}
          className={`w-full bg-white/10 border rounded-lg ${Icon ? "pl-10" : "pl-4"} pr-4 py-2.5 text-white placeholder-gray-400 outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
            error
              ? "border-red-500 focus:ring-red-500"
              : "border-white/20 hover:border-white/30"
          }`}
        />
      </div>
      {error && (
        <p className="text-red-400 text-sm mt-1 flex items-center gap-1">
          <AlertCircle size={14} />
          {error}
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
    <div>
      <label className="block text-sm font-medium text-gray-300 mb-2">
        {label} {required && <span className="text-blue-400">*</span>}
      </label>
      <div className="relative">
        {Icon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 z-10">
            <Icon size={16} className="text-gray-500" />
          </div>
        )}
        <select
          name={name}
          value={value}
          onChange={onChange}
          className={`w-full bg-white/10 border rounded-lg ${Icon ? "pl-10" : "pl-4"} pr-4 py-2.5 text-white outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all cursor-pointer ${
            error
              ? "border-red-500 focus:ring-red-500"
              : "border-white/20 hover:border-white/30"
          }`}
        >
          <option value="" className="bg-slate-800">{placeholder}</option>
          {options.map((option, index) => (
            <option key={index} value={option} className="bg-slate-800">
              {option}
            </option>
          ))}
        </select>
      </div>
      {error && (
        <p className="text-red-400 text-sm mt-1 flex items-center gap-1">
          <AlertCircle size={14} />
          {error}
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

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const categories = [
    "Tablet",
    "Capsule",
    "Syrup",
    "Injection",
    "Antibiotic",
    "Vitamin",
    "Pain Relief",
    "OTC",
  ];

  const units = [
    "Tablet",
    "Capsule",
    "Bottle",
    "Strip",
    "Box",
    "Tube",
    "Injection",
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
    } else if (parseFloat(formData.sellingPrice) <= parseFloat(formData.purchasePrice)) {
      newErrors.sellingPrice = "Selling price should be greater than purchase price";
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
      newErrors.expiryDate = "Expiry date must be greater than today";
    }

    if (formData.manufactureDate) {
      const manufacture = new Date(formData.manufactureDate);
      if (manufacture >= expiry) {
        newErrors.manufactureDate = "Manufacture date must be before expiry date";
      }
    }

    if (formData.minStock && parseInt(formData.minStock) < 0) {
      newErrors.minStock = "Minimum stock cannot be negative";
    }

    if (formData.gst && (parseFloat(formData.gst) < 0 || parseFloat(formData.gst) > 100)) {
      newErrors.gst = "GST must be between 0 and 100";
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsSubmitting(true);

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));

    console.log("Medicine Data:", formData);

    // API CALL HERE
    alert("Medicine Added Successfully");

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

    setIsSubmitting(false);
  };

  const handleReset = () => {
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
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Animated Background Pattern */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 -left-4 w-96 h-96 bg-blue-500/10 rounded-full filter blur-3xl"></div>
        <div className="absolute bottom-1/4 -right-4 w-96 h-96 bg-indigo-500/10 rounded-full filter blur-3xl"></div>
        <div className="absolute inset-0 opacity-5">
          <div className="h-full w-full bg-[linear-gradient(rgba(20,184,166,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(20,184,166,0.1)_1px,transparent_1px)] bg-[size:32px_32px]"></div>
        </div>
      </div>

      <div className="relative z-10 p-4 md:p-6">
        {/* HEADER */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-3">
              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-indigo-400 rounded-xl blur-lg opacity-75 group-hover:opacity-100 transition-opacity"></div>
                <div className="relative bg-gradient-to-br from-blue-500 to-indigo-600 p-2 rounded-xl shadow-lg">
                  <Pill size={24} className="text-white" />
                </div>
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">
                  Add Medicine
                </h1>
                <p className="text-gray-400 text-sm mt-1">
                  Add new medicine stock to inventory system
                </p>
              </div>
            </div>
          </div>

          <Link
            to="/inventory"
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-gray-300 hover:bg-white/10 hover:text-white transition-all duration-200 w-fit group"
          >
            <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
            Back to Inventory
          </Link>
        </div>

        {/* SECURITY BADGE */}
        <div className="mb-6 bg-indigo-500/10 border border-indigo-500/20 rounded-xl p-3 flex items-center gap-3">
          <div className="bg-indigo-500/20 p-1.5 rounded-lg">
            <Shield size={14} className="text-indigo-400" />
          </div>
          <div>
            <p className="text-white text-xs font-medium">Secure Medicine Registration</p>
            <p className="text-indigo-300/70 text-xs">All fields are validated • Batch tracking enabled • GST compliant</p>
          </div>
          <Sparkles size={14} className="text-indigo-400 ml-auto animate-pulse" />
        </div>

        {/* FORM */}
        <form onSubmit={handleSubmit}>
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl overflow-hidden">
            {/* SECTION TITLE */}
            <div className="border-b border-white/10 p-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-gradient-to-r from-blue-500 to-indigo-600">
                  <Package size={18} className="text-white" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-white">
                    Medicine Information
                  </h2>
                  <p className="text-sm text-gray-400 mt-0.5">
                    Fill all medicine details carefully. Fields marked with * are required.
                  </p>
                </div>
              </div>
            </div>

            {/* GRID */}
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                {/* Medicine Name */}
                <InputField
                  label="Medicine Name"
                  name="medicineName"
                  placeholder="Enter medicine name"
                  required
                  icon={Pill}
                />

                {/* Salt Name */}
                <InputField
                  label="Generic / Salt Name"
                  name="saltName"
                  placeholder="Enter salt name"
                  icon={Tag}
                />

                {/* Brand Name */}
                <InputField
                  label="Brand Name"
                  name="brandName"
                  placeholder="Enter brand name"
                  icon={Tag}
                />

                {/* Manufacturer */}
                <InputField
                  label="Manufacturer"
                  name="manufacturer"
                  placeholder="Enter manufacturer"
                  icon={Building2}
                />

                {/* Category */}
                <SelectField
                  label="Category"
                  name="category"
                  options={categories}
                  placeholder="Select Category"
                  required
                  icon={Layers}
                />

                {/* Pack Size */}
                <InputField
                  label="Pack Size"
                  name="packSize"
                  placeholder="Example: Strip of 10"
                  icon={Package}
                />

                {/* Unit */}
                <SelectField
                  label="Unit"
                  name="unit"
                  options={units}
                  placeholder="Select Unit"
                  icon={Boxes}
                />

                {/* Purchase Price */}
                <InputField
                  label="Purchase Price"
                  name="purchasePrice"
                  type="number"
                  placeholder="Enter purchase price"
                  required
                  icon={DollarSign}
                />

                {/* Selling Price */}
                <InputField
                  label="Selling Price (MRP)"
                  name="sellingPrice"
                  type="number"
                  placeholder="Enter selling price"
                  required
                  icon={DollarSign}
                />

                {/* GST */}
                <InputField
                  label="GST %"
                  name="gst"
                  type="number"
                  placeholder="Enter GST percentage"
                  icon={Percent}
                />

                {/* Batch Number */}
                <InputField
                  label="Batch Number"
                  name="batchNumber"
                  placeholder="Enter batch number"
                  required
                  icon={Hash}
                />

                {/* Manufacturing Date */}
                <InputField
                  label="Manufacturing Date"
                  name="manufactureDate"
                  type="date"
                  placeholder="Select date"
                  icon={Calendar}
                />

                {/* Expiry Date */}
                <InputField
                  label="Expiry Date"
                  name="expiryDate"
                  type="date"
                  placeholder="Select date"
                  required
                  icon={Calendar}
                />

                {/* Rack Location */}
                <InputField
                  label="Rack / Shelf Location"
                  name="rackLocation"
                  placeholder="Example: Rack A-12"
                  icon={MapPin}
                />

                {/* Minimum Stock */}
                <InputField
                  label="Minimum Stock Alert"
                  name="minStock"
                  type="number"
                  placeholder="Enter minimum stock"
                  icon={AlertCircle}
                />

                {/* Quantity */}
                <InputField
                  label="Initial Stock Quantity"
                  name="quantity"
                  type="number"
                  placeholder="Enter stock quantity"
                  required
                  icon={Boxes}
                />
              </div>

              {/* PREVIEW SECTION - Shows calculated values */}
              {formData.purchasePrice && formData.sellingPrice && (
                <div className="mt-6 p-4 bg-gradient-to-r from-blue-500/10 to-indigo-500/10 border border-blue-500/20 rounded-xl">
                  <h3 className="text-sm font-semibold text-blue-400 mb-3 flex items-center gap-2">
                    <ChevronRight size={14} />
                    Price Summary
                  </h3>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <div>
                      <p className="text-xs text-gray-400">Purchase Price</p>
                      <p className="text-white font-semibold">₹{formData.purchasePrice}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400">Selling Price</p>
                      <p className="text-white font-semibold">₹{formData.sellingPrice}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400">Margin</p>
                      <p className="text-indigo-400 font-semibold">
                        {((parseFloat(formData.sellingPrice) - parseFloat(formData.purchasePrice)) / parseFloat(formData.purchasePrice) * 100).toFixed(2)}%
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400">Profit per unit</p>
                      <p className="text-indigo-400 font-semibold">
                        ₹{(parseFloat(formData.sellingPrice) - parseFloat(formData.purchasePrice)).toFixed(2)}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* BUTTONS */}
              <div className="flex flex-col sm:flex-row gap-3 mt-8 pt-6 border-t border-white/10">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white px-6 py-3 rounded-xl flex items-center justify-center gap-2 transition-all duration-200 shadow-lg shadow-blue-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save size={18} />
                      Save Medicine
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={handleReset}
                  className="bg-white/10 hover:bg-white/20 border border-white/20 text-gray-300 hover:text-white px-6 py-3 rounded-xl flex items-center justify-center gap-2 transition-all duration-200"
                >
                  Reset Form
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddMedicines;