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
  DollarSign,
  Percent,
  Boxes,
  Layers,
  Sparkles,
  Shield,
  ChevronRight,
  Menu,
  X,
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
    <label className="block text-xs sm:text-sm font-medium text-gray-300 mb-1.5 sm:mb-2">
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
        onChange={onChange}
        placeholder={placeholder}
        className={`w-full bg-white/10 border rounded-lg ${Icon ? "pl-10" : "pl-4"} pr-3 sm:pr-4 py-2 sm:py-2.5 text-sm sm:text-base text-white placeholder-gray-400 outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
          error
            ? "border-red-500 focus:ring-red-500"
            : "border-white/20 hover:border-white/30"
        }`}
      />
    </div>
    {error && (
      <p className="text-red-400 text-xs sm:text-sm mt-1 flex items-center gap-1">
        <AlertCircle size={12} />
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
  <div className="w-full">
    <label className="block text-xs sm:text-sm font-medium text-gray-300 mb-1.5 sm:mb-2">
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
        className={`w-full bg-white/10 border rounded-lg ${Icon ? "pl-10" : "pl-4"} pr-3 sm:pr-4 py-2 sm:py-2.5 text-sm sm:text-base text-white outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all cursor-pointer ${
          error
            ? "border-red-500 focus:ring-red-500"
            : "border-white/20 hover:border-white/30"
        }`}
      >
        <option value="" className="bg-slate-800">
          {placeholder}
        </option>
        {options.map((option, index) => (
          <option key={index} value={option} className="bg-slate-800">
            {option}
          </option>
        ))}
      </select>
    </div>
    {error && (
      <p className="text-red-400 text-xs sm:text-sm mt-1 flex items-center gap-1">
        <AlertCircle size={12} />
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
  const location = useLocation();
  const navigate = useNavigate();
  const editMode = location.state?.editMode || false;
  const medicineData = location.state?.medicineData;

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
      newErrors.expiryDate = "Expiry date must be greater than today";
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
        gst: Number(formData.gst),
        batch_number: formData.batchNumber,
        manufacture_date: formData.manufactureDate,
        expiry_date: formData.expiryDate,
        quantity: Number(formData.quantity),
        rack_location: formData.rackLocation,
        min_stock: Number(formData.minStock),
        status: "ACTIVE",
      };

      let response;

      // EDIT MODE → PUT
      if (editMode) {
        response = await apiClient.put(
          `/medicines/${medicineData.medicine_id}`,
          medicinePayload,
        );

        await Swal.fire({
          icon: "success",
          iconColor: "#00ff00",
          title: "Medicine Updated",
          text: "Medicine updated successfully",
          background: "#fff",
          color: "#000",
          confirmButtonColor: "#3b82f6",
        });
      }

      // CREATE MODE → POST
      else {
        response = await apiClient.post("/medicines", medicinePayload);

        await Swal.fire({
          icon: "success",
          iconColor: "#00ff00",
          title: "Medicine Added",
          text: "Medicine added successfully",
          background: "#fff",
          color: "#000",
          confirmButtonColor: "#3b82f6",
        });
      }

      navigate("/inventory");
    } catch (error) {
      console.error(error);

      if (error.response) {
        console.log(error.response.data);
      }

      await Swal.fire({
        icon: "error",
        title: "Operation Failed",
        text:
          error.response?.data?.message ||
          "Something went wrong while saving medicine",
        background: "#fff",
        iconColor: "#ff0000",
        color: "#000",
        confirmButtonColor: "#ef4444",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = async () => {
    const result = await Swal.fire({
      title: "Reset Form?",
      text: "All entered data will be cleared.",
      icon: "warning",
      iconColor: "#ffe600",
      showCancelButton: true,
      confirmButtonColor: "#3b82f6",
      cancelButtonColor: "#ef4444",
      confirmButtonText: "Yes, Reset",
      background: "#1e293b",
      color: "#fff",
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

      Swal.fire({
        icon: "success",
        title: "Form Reset",
        text: "Form cleared successfully",
        timer: 1500,
        showConfirmButton: false,
        background: "#fff",
        iconColor: "#00ff00",
        color: "#000",
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 overflow-x-hidden">
      {/* Animated Background Pattern - Optimized for mobile */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 -left-4 w-48 sm:w-72 md:w-96 h-48 sm:h-72 md:h-96 bg-blue-500/10 rounded-full filter blur-3xl"></div>
        <div className="absolute bottom-1/4 -right-4 w-48 sm:w-72 md:w-96 h-48 sm:h-72 md:h-96 bg-indigo-500/10 rounded-full filter blur-3xl"></div>
        <div className="absolute inset-0 opacity-5 hidden sm:block">
          <div className="h-full w-full bg-[linear-gradient(rgba(20,184,166,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(20,184,166,0.1)_1px,transparent_1px)] bg-[size:32px_32px]"></div>
        </div>
      </div>

      <div className="relative z-10 p-3 sm:p-4 md:p-6 lg:p-8">
        {/* HEADER - Fully Responsive */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4 sm:mb-6">
          <div className="flex items-start sm:items-center gap-3">
            <div className="relative group flex-shrink-0">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-indigo-400 rounded-xl blur-lg opacity-75 group-hover:opacity-100 transition-opacity"></div>
              <div className="relative bg-gradient-to-br from-blue-500 to-indigo-600 p-2 rounded-xl shadow-lg">
                <Pill className="sm:size-6 md:size-8 text-white" />
              </div>
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl md:text-3xl font-bold bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">
                {editMode ? "Edit Medicine" : "Add Medicine"}
              </h1>
              <p className="text-gray-400 text-xs sm:text-sm mt-0.5 sm:mt-1">
                {editMode
                  ? "Update medicine inventory details"
                  : "Add new medicine stock to inventory system"}
              </p>
            </div>
          </div>

          <Link
            to="/inventory"
            className="flex items-center justify-center gap-2 px-3 sm:px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-gray-300 hover:bg-white/10 hover:text-white transition-all duration-200 w-full sm:w-auto group"
          >
            <ArrowLeft
              size={16}
              className="sm:size-[18px] group-hover:-translate-x-1 transition-transform"
            />
            <span className="text-sm sm:text-base">Back to Inventory</span>
          </Link>
        </div>

        {/* SECURITY BADGE - Responsive */}
        <div className="mb-4 sm:mb-6 bg-indigo-500/10 border border-indigo-500/20 rounded-xl p-2.5 sm:p-3">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="bg-indigo-500/20 p-1.5 rounded-lg flex-shrink-0">
              <Shield size={12} className="sm:size-[14px] text-indigo-400" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white text-xs sm:text-sm font-medium truncate">
                Secure Medicine Registration
              </p>
              <p className="text-indigo-300/70 text-[10px] sm:text-xs truncate sm:whitespace-normal">
                All fields are validated • Batch tracking enabled • GST
                compliant
              </p>
            </div>
            <Sparkles
              size={12}
              className="sm:size-[14px] text-indigo-400 animate-pulse flex-shrink-0"
            />
          </div>
        </div>

        {/* FORM - Fully Responsive */}
        <form onSubmit={handleSubmit}>
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl sm:rounded-2xl overflow-hidden">
            {/* SECTION TITLE - Responsive */}
            <div className="border-b border-white/10 p-4 sm:p-5 md:p-6">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="p-1.5 sm:p-2 rounded-lg bg-gradient-to-r from-blue-500 to-indigo-600 flex-shrink-0">
                  <Package size={14} className="sm:size-[18px] text-white" />
                </div>
                <div className="min-w-0">
                  <h2 className="text-base sm:text-lg md:text-xl font-semibold text-white truncate sm:whitespace-normal">
                    Medicine Information
                  </h2>
                  <p className="text-xs sm:text-sm text-gray-400 mt-0.5 sm:mt-1 hidden sm:block">
                    Fill all medicine details carefully. Fields marked with *
                    are required.
                  </p>
                </div>
              </div>
            </div>

            {/* GRID - Responsive Breakpoints */}
            <div className="p-4 sm:p-5 md:p-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 md:gap-5">
                {/* Medicine Name */}
                <InputField
                  label="Medicine Name"
                  name="medicineName"
                  value={formData.medicineName}
                  onChange={handleChange}
                  error={errors.medicineName}
                  placeholder="Enter medicine name"
                  required
                  icon={Pill}
                />

                {/* Salt Name */}
                <InputField
                  label="Generic / Salt Name"
                  name="saltName"
                  value={formData.saltName}
                  onChange={handleChange}
                  placeholder="Enter salt name"
                  icon={Tag}
                />

                {/* Brand Name */}
                <InputField
                  label="Brand Name"
                  name="brandName"
                  value={formData.brandName}
                  onChange={handleChange}
                  placeholder="Enter brand name"
                  icon={Tag}
                />

                {/* Manufacturer */}
                <InputField
                  label="Manufacturer"
                  name="manufacturer"
                  value={formData.manufacturer}
                  onChange={handleChange}
                  placeholder="Enter manufacturer"
                  icon={Building2}
                />

                {/* Category */}
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

                {/* Pack Size */}
                <InputField
                  label="Pack Size"
                  name="packSize"
                  value={formData.packSize}
                  onChange={handleChange}
                  placeholder="Example: Strip of 10"
                  icon={Package}
                />

                {/* Unit */}
                <SelectField
                  label="Unit"
                  name="unit"
                  value={formData.unit}
                  onChange={handleChange}
                  options={units}
                  placeholder="Select Unit"
                  icon={Boxes}
                />

                {/* Purchase Price */}
                <InputField
                  label="Purchase Price"
                  name="purchasePrice"
                  type="number"
                  value={formData.purchasePrice}
                  onChange={handleChange}
                  error={errors.purchasePrice}
                  placeholder="Enter purchase price"
                  required
                  icon={DollarSign}
                />

                {/* Selling Price */}
                <InputField
                  label="Selling Price (MRP)"
                  name="sellingPrice"
                  type="number"
                  value={formData.sellingPrice}
                  onChange={handleChange}
                  error={errors.sellingPrice}
                  placeholder="Enter selling price"
                  required
                  icon={DollarSign}
                />

                {/* GST */}
                <InputField
                  label="GST %"
                  name="gst"
                  type="number"
                  value={formData.gst}
                  onChange={handleChange}
                  error={errors.gst}
                  placeholder="Enter GST percentage"
                  icon={Percent}
                />

                {/* Batch Number */}
                <InputField
                  label="Batch Number"
                  name="batchNumber"
                  value={formData.batchNumber}
                  onChange={handleChange}
                  error={errors.batchNumber}
                  placeholder="Enter batch number"
                  required
                  icon={Hash}
                />

                {/* Manufacturing Date */}
                <InputField
                  label="Manufacturing Date"
                  name="manufactureDate"
                  type="date"
                  value={formData.manufactureDate}
                  onChange={handleChange}
                  error={errors.manufactureDate}
                  placeholder="Select date"
                  icon={Calendar}
                />

                {/* Expiry Date */}
                <InputField
                  label="Expiry Date"
                  name="expiryDate"
                  type="date"
                  value={formData.expiryDate}
                  onChange={handleChange}
                  error={errors.expiryDate}
                  placeholder="Select date"
                  required
                  icon={Calendar}
                />

                {/* Rack Location */}
                <InputField
                  label="Rack / Shelf Location"
                  name="rackLocation"
                  value={formData.rackLocation}
                  onChange={handleChange}
                  placeholder="Example: Rack A-12"
                  icon={MapPin}
                />

                {/* Minimum Stock */}
                <InputField
                  label="Minimum Stock Alert"
                  name="minStock"
                  type="number"
                  value={formData.minStock}
                  onChange={handleChange}
                  error={errors.minStock}
                  placeholder="Enter minimum stock"
                  icon={AlertCircle}
                />

                {/* Quantity */}
                <InputField
                  label="Initial Stock Quantity"
                  name="quantity"
                  type="number"
                  value={formData.quantity}
                  onChange={handleChange}
                  error={errors.quantity}
                  placeholder="Enter stock quantity"
                  required
                  icon={Boxes}
                />
              </div>

              {/* PREVIEW SECTION - Fully Responsive */}
              {formData.purchasePrice && formData.sellingPrice && (
                <div className="mt-4 sm:mt-6 p-3 sm:p-4 bg-gradient-to-r from-blue-500/10 to-indigo-500/10 border border-blue-500/20 rounded-xl">
                  <h3 className="text-xs sm:text-sm font-semibold text-blue-400 mb-2 sm:mb-3 flex items-center gap-2">
                    <ChevronRight size={12} className="sm:size-[14px]" />
                    Price Summary
                  </h3>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-4">
                    <div className="min-w-0">
                      <p className="text-[10px] sm:text-xs text-gray-400">
                        Purchase Price
                      </p>
                      <p className="text-sm sm:text-base md:text-lg text-white font-semibold break-words">
                        ₹{formData.purchasePrice}
                      </p>
                    </div>
                    <div className="min-w-0">
                      <p className="text-[10px] sm:text-xs text-gray-400">
                        Selling Price
                      </p>
                      <p className="text-sm sm:text-base md:text-lg text-white font-semibold break-words">
                        ₹{formData.sellingPrice}
                      </p>
                    </div>
                    <div className="min-w-0">
                      <p className="text-[10px] sm:text-xs text-gray-400">
                        Margin
                      </p>
                      <p className="text-xs sm:text-sm md:text-base text-indigo-400 font-semibold break-words">
                        {(
                          ((parseFloat(formData.sellingPrice) -
                            parseFloat(formData.purchasePrice)) /
                            parseFloat(formData.purchasePrice)) *
                          100
                        ).toFixed(2)}
                        %
                      </p>
                    </div>
                    <div className="min-w-0">
                      <p className="text-[10px] sm:text-xs text-gray-400">
                        Profit per unit
                      </p>
                      <p className="text-xs sm:text-sm md:text-base text-indigo-400 font-semibold break-words">
                        ₹
                        {(
                          parseFloat(formData.sellingPrice) -
                          parseFloat(formData.purchasePrice)
                        ).toFixed(2)}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* BUTTONS - Fully Responsive */}
              <div className="flex flex-col sm:flex-row gap-3 mt-6 sm:mt-8 pt-4 sm:pt-6 border-t border-white/10">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl flex items-center justify-center gap-2 transition-all duration-200 shadow-lg shadow-blue-500/20 disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
                >
                  {isSubmitting ? (
                    <ButtonLoader
                      text={
                        editMode ? "Updating Medicine..." : "Saving Medicine..."
                      }
                    />
                  ) : (
                    <>
                      <Save size={16} className="sm:size-[18px]" />
                      <span>
                        {editMode ? "Update Medicine" : "Save Medicine"}
                      </span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={handleReset}
                  className="bg-white/10 hover:bg-white/20 border border-white/20 text-gray-300 hover:text-white px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl flex items-center justify-center gap-2 transition-all duration-200 text-sm sm:text-base"
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
