import React, { useMemo, useState } from "react";
import {
  PackagePlus,
  Search,
  Save,
  Truck,
  Calendar,
  AlertCircle,
  ArrowLeft,
  Building2,
  Hash,
  MapPin,
  DollarSign,
  FileText,
  User,
  TrendingUp,
  Shield,
  Sparkles,
  CheckCircle,
  X,
  Package,
} from "lucide-react";
import { Link } from "react-router-dom";

const medicinesData = [
  {
    id: 1,
    name: "Paracetamol 500mg",
    batch: "PCM101",
    currentStock: 120,
    category: "Tablet",
    unit: "Strip",
  },
  {
    id: 2,
    name: "Azithromycin 500mg",
    batch: "AZ220",
    currentStock: 8,
    category: "Antibiotic",
    unit: "Tablet",
  },
  {
    id: 3,
    name: "Vitamin D Capsules",
    batch: "VD100",
    currentStock: 40,
    category: "Vitamin",
    unit: "Capsule",
  },
];

const StockIn = () => {
  const [search, setSearch] = useState("");
  const [selectedMedicine, setSelectedMedicine] = useState(null);
  const [showResults, setShowResults] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  // FILTER MEDICINES
  const filteredMedicines = useMemo(() => {
    return medicinesData.filter((medicine) =>
      medicine.name.toLowerCase().includes(search.toLowerCase())
    );
  }, [search]);

  // HANDLE INPUT
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

  // VALIDATION
  const validateForm = () => {
    const newErrors = {};

    if (!selectedMedicine) {
      newErrors.medicine = "Please select a medicine";
    }

    if (!formData.supplierName.trim()) {
      newErrors.supplierName = "Supplier name is required";
    }

    if (!formData.quantity) {
      newErrors.quantity = "Quantity is required";
    } else if (parseInt(formData.quantity) <= 0) {
      newErrors.quantity = "Quantity must be greater than 0";
    }

    if (!formData.purchasePrice) {
      newErrors.purchasePrice = "Purchase price is required";
    } else if (parseFloat(formData.purchasePrice) <= 0) {
      newErrors.purchasePrice = "Purchase price must be greater than 0";
    }

    if (!formData.batchNumber) {
      newErrors.batchNumber = "Batch number is required";
    }

    if (!formData.expiryDate) {
      newErrors.expiryDate = "Expiry date is required";
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const expiry = new Date(formData.expiryDate);

    if (formData.expiryDate && expiry <= today) {
      newErrors.expiryDate = "Expiry date must be a future date";
    }

    if (formData.manufactureDate && formData.expiryDate) {
      const manufacture = new Date(formData.manufactureDate);
      if (manufacture >= expiry) {
        newErrors.manufactureDate = "Manufacture date must be before expiry date";
      }
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  // SUBMIT
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsSubmitting(true);

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));

    const stockInData = {
      medicineId: selectedMedicine.id,
      medicineName: selectedMedicine.name,
      ...formData,
      quantity: parseInt(formData.quantity),
      purchasePrice: parseFloat(formData.purchasePrice),
    };

    console.log("Stock In Data:", stockInData);

    // API CALL HERE
    alert("Stock Added Successfully");

    // RESET
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
    setIsSubmitting(false);
  };

  const handleReset = () => {
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
  };

  const handleSelectMedicine = (medicine) => {
    setSelectedMedicine(medicine);
    setSearch(medicine.name);
    setShowResults(false);
    // Auto-fill batch number from existing medicine
    setFormData(prev => ({
      ...prev,
      batchNumber: medicine.batch || "",
    }));
  };

  const InputField = ({ label, name, type = "text", placeholder, required, icon: Icon }) => (
    <div>
      <label className="block text-sm font-medium text-gray-300 mb-2">
        {label} {required && <span className="text-indigo-400">*</span>}
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
          value={formData[name]}
          onChange={handleChange}
          placeholder={placeholder}
          className={`w-full bg-white/10 border rounded-lg pl-${Icon ? '10' : '4'} pr-4 py-2.5 text-white placeholder-gray-400 outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all ${
            errors[name]
              ? "border-red-500 focus:ring-red-500"
              : "border-white/20 hover:border-white/30"
          }`}
        />
      </div>
      {errors[name] && (
        <p className="text-red-400 text-sm mt-1 flex items-center gap-1">
          <AlertCircle size={14} />
          {errors[name]}
        </p>
      )}
    </div>
  );

  const TextAreaField = ({ label, name, rows = 4, placeholder, icon: Icon }) => (
    <div>
      <label className="block text-sm font-medium text-gray-300 mb-2">
        {label}
      </label>
      <div className="relative">
        {Icon && (
          <div className="absolute left-3 top-3">
            <Icon size={16} className="text-gray-500" />
          </div>
        )}
        <textarea
          rows={rows}
          name={name}
          value={formData[name]}
          onChange={handleChange}
          placeholder={placeholder}
          className={`w-full bg-white/10 border border-white/20 rounded-lg pl-${Icon ? '10' : '4'} pr-4 py-2.5 text-white placeholder-gray-400 outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all resize-none`}
        />
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Animated Background Pattern */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 -left-4 w-96 h-96 bg-indigo-500/10 rounded-full filter blur-3xl"></div>
        <div className="absolute bottom-1/4 -right-4 w-96 h-96 bg-blue-500/10 rounded-full filter blur-3xl"></div>
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
                <div className="absolute inset-0 bg-gradient-to-r from-indigo-400 to-blue-400 rounded-xl blur-lg opacity-75 group-hover:opacity-100 transition-opacity"></div>
                <div className="relative bg-gradient-to-br from-indigo-500 to-blue-600 p-2 rounded-xl shadow-lg">
                  <PackagePlus size={24} className="text-white" />
                </div>
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-400 to-blue-400 bg-clip-text text-transparent">
                  Stock In
                </h1>
                <p className="text-gray-400 text-sm mt-1">
                  Receive and update medicine inventory stock
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
            <p className="text-white text-xs font-medium">Stock Receiving Protocol</p>
            <p className="text-indigo-300/70 text-xs">Batch tracking • Expiry validation • Supplier verification</p>
          </div>
          <Sparkles size={14} className="text-indigo-400 ml-auto animate-pulse" />
        </div>

        {/* FORM */}
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            {/* LEFT SECTION - Main Form */}
            <div className="xl:col-span-2">
              <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl overflow-hidden">
                <div className="border-b border-white/10 p-6">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-gradient-to-r from-indigo-500 to-blue-600">
                      <Truck size={18} className="text-white" />
                    </div>
                    <div>
                      <h2 className="text-lg font-semibold text-white">
                        Receive New Stock
                      </h2>
                      <p className="text-sm text-gray-400 mt-0.5">
                        Add incoming medicine stock from supplier
                      </p>
                    </div>
                  </div>
                </div>

                <div className="p-6">
                  {/* MEDICINE SEARCH */}
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Search Medicine <span className="text-indigo-400">*</span>
                    </label>
                    <div className="relative">
                      <Search
                        size={18}
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"
                      />
                      <input
                        type="text"
                        placeholder="Search medicine by name..."
                        value={search}
                        onChange={(e) => {
                          setSearch(e.target.value);
                          setShowResults(true);
                          if (errors.medicine) {
                            setErrors({ ...errors, medicine: "" });
                          }
                        }}
                        onFocus={() => setShowResults(true)}
                        className={`w-full bg-white/10 border rounded-lg pl-10 pr-4 py-2.5 text-white placeholder-gray-400 outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all ${
                          errors.medicine
                            ? "border-red-500 focus:ring-red-500"
                            : "border-white/20 hover:border-white/30"
                        }`}
                      />
                    </div>

                    {/* SEARCH RESULTS */}
                    {showResults && search && (
                      <div className="absolute z-20 mt-2 w-full md:w-[calc(100%-2rem)] bg-slate-800 border border-white/20 rounded-xl shadow-2xl max-h-64 overflow-y-auto">
                        {filteredMedicines.length > 0 ? (
                          filteredMedicines.map((medicine) => (
                            <button
                              type="button"
                              key={medicine.id}
                              onClick={() => handleSelectMedicine(medicine)}
                              className="w-full text-left p-4 hover:bg-white/10 transition-colors border-b border-white/10 last:border-none group"
                            >
                              <div className="flex items-center justify-between">
                                <div>
                                  <h3 className="font-medium text-white group-hover:text-indigo-400 transition-colors">
                                    {medicine.name}
                                  </h3>
                                  <div className="flex items-center gap-3 mt-1 text-sm">
                                    <span className="text-gray-400">Batch: {medicine.batch}</span>
                                    <span className="text-gray-400">Stock: {medicine.currentStock}</span>
                                    <span className="text-gray-400">{medicine.category}</span>
                                  </div>
                                </div>
                                <CheckCircle size={18} className="text-indigo-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                              </div>
                            </button>
                          ))
                        ) : (
                          <div className="p-4 text-center">
                            <p className="text-gray-400">No medicine found</p>
                            <Link
                              to="/inventory/add-medicine"
                              className="text-indigo-400 text-sm mt-2 inline-block hover:underline"
                            >
                              Add new medicine
                            </Link>
                          </div>
                        )}
                      </div>
                    )}

                    {errors.medicine && (
                      <p className="text-red-400 text-sm mt-2 flex items-center gap-1">
                        <AlertCircle size={14} />
                        {errors.medicine}
                      </p>
                    )}
                  </div>

                  {/* FORM GRID */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <InputField
                      label="Supplier Name"
                      name="supplierName"
                      placeholder="Enter supplier name"
                      required
                      icon={Building2}
                    />

                    <InputField
                      label="Invoice Number"
                      name="invoiceNumber"
                      placeholder="Enter invoice number"
                      icon={FileText}
                    />

                    <InputField
                      label="Quantity Received"
                      name="quantity"
                      type="number"
                      placeholder="Enter quantity"
                      required
                      icon={Package}
                    />

                    <InputField
                      label="Purchase Price"
                      name="purchasePrice"
                      type="number"
                      placeholder="Enter purchase price"
                      required
                      icon={DollarSign}
                    />

                    <InputField
                      label="Batch Number"
                      name="batchNumber"
                      placeholder="Enter batch number"
                      required
                      icon={Hash}
                    />

                    <InputField
                      label="Rack Location"
                      name="rackLocation"
                      placeholder="Rack A-12"
                      icon={MapPin}
                    />

                    <InputField
                      label="Manufacturing Date"
                      name="manufactureDate"
                      type="date"
                      placeholder="Select date"
                      icon={Calendar}
                    />

                    <InputField
                      label="Expiry Date"
                      name="expiryDate"
                      type="date"
                      placeholder="Select date"
                      required
                      icon={Calendar}
                    />
                  </div>

                  {/* NOTES */}
                  <TextAreaField
                    label="Notes"
                    name="notes"
                    rows={3}
                    placeholder="Additional notes about this stock entry..."
                    icon={FileText}
                  />

                  {/* BUTTONS */}
                  <div className="flex flex-wrap gap-3 mt-6 pt-6 border-t border-white/10">
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="bg-gradient-to-r from-indigo-500 to-blue-600 hover:from-indigo-600 hover:to-blue-700 text-white px-6 py-3 rounded-xl flex items-center gap-2 transition-all duration-200 shadow-lg shadow-indigo-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isSubmitting ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          Saving...
                        </>
                      ) : (
                        <>
                          <Save size={18} />
                          Save Stock Entry
                        </>
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={handleReset}
                      className="bg-white/10 hover:bg-white/20 border border-white/20 text-gray-300 hover:text-white px-6 py-3 rounded-xl flex items-center gap-2 transition-all duration-200"
                    >
                      Reset Form
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* RIGHT PANEL - Summary */}
            <div className="space-y-6">
              {/* SELECTED MEDICINE CARD */}
              <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl overflow-hidden">
                <div className="border-b border-white/10 p-5">
                  <div className="flex items-center gap-3">
                    <PackagePlus size={20} className="text-indigo-400" />
                    <h2 className="font-semibold text-white">Selected Medicine</h2>
                  </div>
                </div>

                <div className="p-5">
                  {selectedMedicine ? (
                    <div className="space-y-4">
                      <div className="p-3 bg-white/5 rounded-xl">
                        <p className="text-xs text-gray-400 mb-1">Medicine Name</p>
                        <h3 className="font-semibold text-white text-lg">
                          {selectedMedicine.name}
                        </h3>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div className="p-3 bg-white/5 rounded-xl">
                          <p className="text-xs text-gray-400">Current Stock</p>
                          <p className="text-2xl font-bold text-indigo-400">
                            {selectedMedicine.currentStock}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">{selectedMedicine.unit}</p>
                        </div>
                        <div className="p-3 bg-white/5 rounded-xl">
                          <p className="text-xs text-gray-400">Batch Number</p>
                          <p className="font-semibold text-white font-mono text-sm">
                            {selectedMedicine.batch}
                          </p>
                        </div>
                      </div>

                      <div className="p-3 bg-white/5 rounded-xl">
                        <p className="text-xs text-gray-400">Category</p>
                        <p className="text-white">{selectedMedicine.category}</p>
                      </div>

                      {formData.quantity && (
                        <div className="bg-gradient-to-r from-indigo-500/20 to-blue-500/20 border border-indigo-500/30 rounded-xl p-4">
                          <div className="flex items-center justify-between mb-2">
                            <p className="text-sm text-indigo-300">Updated Stock After Entry</p>
                            <TrendingUp size={16} className="text-indigo-400" />
                          </div>
                          <h2 className="text-3xl font-bold text-indigo-400">
                            {Number(selectedMedicine.currentStock) + Number(formData.quantity)}
                          </h2>
                          <p className="text-xs text-indigo-300/70 mt-1">
                            +{formData.quantity} {selectedMedicine.unit} added
                          </p>
                        </div>
                      )}

                      {formData.purchasePrice && formData.quantity && (
                        <div className="p-3 bg-white/5 rounded-xl">
                          <p className="text-xs text-gray-400">Total Purchase Value</p>
                          <p className="text-xl font-bold text-white">
                            ₹{(parseFloat(formData.purchasePrice) * parseInt(formData.quantity)).toLocaleString()}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            @ ₹{formData.purchasePrice} per {selectedMedicine.unit}
                          </p>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <div className="w-16 h-16 mx-auto bg-white/10 rounded-2xl flex items-center justify-center mb-4">
                        <Truck size={32} className="text-gray-500" />
                      </div>
                      <p className="text-gray-400">Search and select a medicine</p>
                      <p className="text-xs text-gray-500 mt-1">to start receiving stock</p>
                    </div>
                  )}
                </div>
              </div>

              {/* IMPORTANT NOTES */}
              <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-5">
                <div className="flex items-start gap-3">
                  <AlertCircle size={18} className="text-amber-400 mt-0.5" />
                  <div>
                    <h3 className="font-semibold text-amber-400">Important Guidelines</h3>
                    <ul className="text-sm text-amber-300/80 mt-3 space-y-2">
                      <li className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 bg-amber-400 rounded-full"></span>
                        Expired medicines cannot be added
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 bg-amber-400 rounded-full"></span>
                        Verify batch number carefully
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 bg-amber-400 rounded-full"></span>
                        Check supplier invoice before saving
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 bg-amber-400 rounded-full"></span>
                        Stock updates automatically after save
                      </li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* SUPPLIER INFO TIP */}
              {formData.supplierName && (
                <div className="bg-white/5 border border-white/10 rounded-2xl p-4 animate-in fade-in duration-300">
                  <div className="flex items-center gap-3">
                    <User size={16} className="text-indigo-400" />
                    <div>
                      <p className="text-xs text-gray-400">Supplier</p>
                      <p className="text-white font-medium">{formData.supplierName}</p>
                    </div>
                    {formData.invoiceNumber && (
                      <div className="ml-auto text-right">
                        <p className="text-xs text-gray-400">Invoice</p>
                        <p className="text-white font-mono text-sm">{formData.invoiceNumber}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default StockIn;