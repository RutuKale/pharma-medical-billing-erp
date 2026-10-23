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
  Truck,
  UserPlus,
  Phone,
  Mail,
  FileText,
  X,
  User,
  Search,
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
    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
      {label} {required && <span className="text-blue-500 font-bold">*</span>}
    </label>
    <div className="relative">
      {Icon && (
        <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 pointer-events-none">
          <Icon size={16} />
        </div>
      )}
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className={`w-full bg-slate-50/80 dark:bg-slate-800/80 border rounded-xl ${
          Icon ? "pl-10" : "pl-3.5"
        } pr-3.5 py-2.5 text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
          error
            ? "border-rose-400 dark:border-rose-500 focus:ring-rose-400 bg-rose-50/20"
            : "border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600"
        }`}
      />
    </div>
    {error && (
      <p className="text-rose-500 dark:text-rose-400 text-xs mt-1 flex items-center gap-1 font-medium">
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
    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
      {label} {required && <span className="text-blue-500 font-bold">*</span>}
    </label>
    <div className="relative">
      {Icon && (
        <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 pointer-events-none z-10">
          <Icon size={16} />
        </div>
      )}
      <select
        name={name}
        value={value}
        onChange={onChange}
        className={`w-full bg-slate-50/80 dark:bg-slate-800/80 border rounded-xl ${
          Icon ? "pl-10" : "pl-3.5"
        } pr-9 py-2.5 text-sm font-medium text-slate-700 dark:text-slate-200 outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all cursor-pointer appearance-none ${
          error
            ? "border-rose-400 dark:border-rose-500 focus:ring-rose-400 bg-rose-50/20"
            : "border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600"
        }`}
      >
        <option value="" className="bg-white dark:bg-slate-900 text-slate-400">
          {placeholder}
        </option>
        {options.map((option, index) => (
          <option key={index} value={option} className="bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100">
            {option}
          </option>
        ))}
      </select>
      <ChevronDown
        size={14}
        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 pointer-events-none"
      />
    </div>
    {error && (
      <p className="text-rose-500 dark:text-rose-400 text-xs mt-1 flex items-center gap-1 font-medium">
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
    gst: "0",
    batchNumber: "",
    manufactureDate: "",
    expiryDate: "",
    rackLocation: "",
    minStock: "",
    quantity: "",
    supplierId: "",
    supplierName: "",
    supplierContact: "",
    supplierMobile: "",
    supplierEmail: "",
    supplierAddress: "",
    supplierGst: "",
  });
  const [totalTabletQty, setTotalTabletQty] = useState("");
  const [totalPackPrice, setTotalPackPrice] = useState("");
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const editMode = location.state?.editMode || false;
  const medicineData = location.state?.medicineData;

  // Supplier Management State
  const [suppliers, setSuppliers] = useState([]);
  const [selectedSupplierId, setSelectedSupplierId] = useState("");
  const [supplierSearchQuery, setSupplierSearchQuery] = useState("");
  const [isSupplierModalOpen, setIsSupplierModalOpen] = useState(false);
  const [isSavingSupplier, setIsSavingSupplier] = useState(false);
  const [newSupplier, setNewSupplier] = useState({
    supplier_name: "",
    contact_person: "",
    mobile: "",
    email: "",
    address: "",
    gst_number: "",
  });
  const [supplierErrors, setSupplierErrors] = useState({});

  // Fetch available suppliers
  useEffect(() => {
    const fetchSuppliers = async () => {
      try {
        const res = await apiClient.get("/suppliers");
        if (res.data?.success) {
          setSuppliers(res.data.data || []);
        }
      } catch (err) {
        console.error("Error fetching suppliers:", err);
      }
    };
    fetchSuppliers();
  }, []);

  // Supplier-Wise Medicines State & Hook
  const [supplierMedicines, setSupplierMedicines] = useState([]);
  const [loadingSupplierMeds, setLoadingSupplierMeds] = useState(false);

  useEffect(() => {
    const supId = selectedSupplierId || formData.supplierId;
    if (!supId) {
      setSupplierMedicines([]);
      return;
    }
    const fetchSupplierMeds = async () => {
      try {
        setLoadingSupplierMeds(true);
        const res = await apiClient.get(`/medicines?supplier_id=${supId}`);
        if (res.data?.success) {
          setSupplierMedicines(res.data.data || []);
        }
      } catch (err) {
        console.error("Error fetching supplier medicines:", err);
      } finally {
        setLoadingSupplierMeds(false);
      }
    };
    fetchSupplierMeds();
  }, [selectedSupplierId, formData.supplierId]);

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

  const handleSupplierSelect = (supId) => {
    setSelectedSupplierId(supId);
    if (!supId) {
      setFormData((prev) => ({
        ...prev,
        supplierId: "",
        supplierName: "",
        supplierContact: "",
        supplierMobile: "",
        supplierEmail: "",
        supplierAddress: "",
        supplierGst: "",
      }));
      return;
    }

    const sup = suppliers.find(
      (s) => String(s.supplier_id || s.id) === String(supId)
    );
    if (sup) {
      setFormData((prev) => ({
        ...prev,
        supplierId: sup.supplier_id || sup.id,
        supplierName: sup.supplier_name || sup.name || "",
        supplierContact: sup.contact_person || "",
        supplierMobile: sup.mobile || sup.mobile_number || "",
        supplierEmail: sup.email || "",
        supplierAddress: sup.address || "",
        supplierGst: sup.gst_number || "",
      }));
    }
  };

  const handleSaveNewSupplier = async (e) => {
    e.preventDefault();
    const errs = {};
    if (!newSupplier.supplier_name.trim()) {
      errs.supplier_name = "Supplier name is required";
    }
    const cleanMobile = newSupplier.mobile.replace(/\D/g, "");
    if (!cleanMobile) {
      errs.mobile = "Mobile number is required";
    } else if (cleanMobile.length !== 10) {
      errs.mobile = "Enter a valid 10-digit mobile number";
    }
    if (newSupplier.email && !newSupplier.email.includes("@")) {
      errs.email = "Enter a valid email address";
    }

    if (Object.keys(errs).length > 0) {
      setSupplierErrors(errs);
      return;
    }

    // Check if supplier already exists locally by mobile number
    const existingLocal = suppliers.find(
      (s) =>
        (s.mobile || s.mobile_number || "").replace(/\D/g, "") === cleanMobile
    );
    if (existingLocal) {
      const supId = existingLocal.supplier_id || existingLocal.id;
      handleSupplierSelect(supId);
      setIsSupplierModalOpen(false);
      setNewSupplier({
        supplier_name: "",
        contact_person: "",
        mobile: "",
        email: "",
        address: "",
        gst_number: "",
      });
      setSupplierErrors({});
      Swal.fire({
        icon: "info",
        title: "Supplier Already Exists",
        text: `Existing supplier "${existingLocal.supplier_name || existingLocal.name}" was automatically selected.`,
        confirmButtonColor: "#2563eb",
      });
      return;
    }

    try {
      setIsSavingSupplier(true);
      const res = await apiClient.post("/suppliers", newSupplier);
      if (res.data?.success) {
        const created = res.data.data;
        const supId = created.supplier_id || created.id;
        if (!suppliers.some((s) => String(s.supplier_id || s.id) === String(supId))) {
          setSuppliers((prev) => [...prev, created]);
        }
        setSelectedSupplierId(supId);
        setFormData((prev) => ({
          ...prev,
          supplierId: supId,
          supplierName: created.supplier_name || created.name || "",
          supplierContact: created.contact_person || "",
          supplierMobile: created.mobile || created.mobile_number || "",
          supplierEmail: created.email || "",
          supplierAddress: created.address || "",
          supplierGst: created.gst_number || "",
        }));

        setIsSupplierModalOpen(false);
        setNewSupplier({
          supplier_name: "",
          contact_person: "",
          mobile: "",
          email: "",
          address: "",
          gst_number: "",
        });
        setSupplierErrors({});

        Swal.fire({
          icon: "success",
          title: "Supplier Registered",
          text: `${created.supplier_name || "Supplier"} linked successfully to this medicine.`,
          timer: 2000,
          showConfirmButton: false,
        });
      }
    } catch (err) {
      console.error(err);
      Swal.fire({
        icon: "error",
        title: "Registration Failed",
        text: err.response?.data?.message || err.message || "Failed to add supplier",
        confirmButtonColor: "#2563eb",
      });
    } finally {
      setIsSavingSupplier(false);
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
        supplierId: medicineData.supplier_id || "",
        supplierName: medicineData.supplier_name || "",
        supplierContact: medicineData.supplier_contact || "",
        supplierMobile: medicineData.supplier_mobile || "",
        supplierEmail: medicineData.supplier_email || "",
        supplierAddress: medicineData.supplier_address || "",
        supplierGst: medicineData.supplier_gst || "",
      });
      if (medicineData.supplier_id) {
        setSelectedSupplierId(medicineData.supplier_id);
      }
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
        gst: 0,
        batch_number: formData.batchNumber,
        manufacture_date: formData.manufactureDate || null,
        expiry_date: formData.expiryDate,
        quantity: Number(formData.quantity),
        rackLocation: formData.rackLocation,
        min_stock: Number(formData.minStock || 0),
        status: "ACTIVE",
        supplier_id: formData.supplierId || null,
        supplier_name: formData.supplierName || "",
        supplier_contact: formData.supplierContact || "",
        supplier_mobile: formData.supplierMobile || "",
        supplier_email: formData.supplierEmail || "",
        supplier_address: formData.supplierAddress || "",
        supplier_gst: formData.supplierGst || "",
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
        supplierId: "",
        supplierName: "",
        supplierContact: "",
        supplierMobile: "",
        supplierEmail: "",
        supplierAddress: "",
        supplierGst: "",
      });
      setSelectedSupplierId("");
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
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
              <span>{editMode ? "Edit Medicine" : "Add Medicine"}</span>
            </h1>
            <p className="text-slate-500 dark:text-slate-400 text-xs sm:text-sm mt-0.5">
              {editMode
                ? "Update medicine specifications and catalog details."
                : "Register a new medicine into your inventory catalog."}
            </p>
          </div>
        </div>

        <Link
          to="/inventory"
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 rounded-xl text-sm font-semibold shadow-xs transition-colors w-fit"
        >
          <ArrowLeft size={16} />
          <span>Back to Inventory</span>
        </Link>
      </div>

      {/* 2. MAIN FORM CARD */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-xs overflow-hidden">
          {/* Card Top Title Banner */}
          <div className="p-5 sm:p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div>
                <h2 className="text-base font-bold text-slate-800 dark:text-white leading-tight">
                  Medicine Specifications
                </h2>
                <p className="text-xs text-slate-400">
                  Fields marked with an asterisk (<span className="text-blue-500 font-bold">*</span>) are mandatory.
                </p>
              </div>
            </div>

            <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 text-xs font-semibold">
              <ShieldCheck size={14} />
              <span>Batch & Inventory Tracking</span>
            </div>
          </div>

          <div className="p-5 sm:p-6 space-y-6">
            {/* SECTION: Supplier Details (Before Basic Medicine Info) */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-blue-600"></span>
                  <h3 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    Supplier & Vendor Assignment
                  </h3>
                </div>

                <button
                  type="button"
                  onClick={() => setIsSupplierModalOpen(true)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 dark:bg-blue-950/40 hover:bg-blue-100 dark:hover:bg-blue-900/50 text-blue-700 dark:text-blue-400 rounded-xl text-xs font-bold transition-all shadow-2xs active:scale-95"
                >
                  <UserPlus size={14} />
                  <span>Add New Supplier</span>
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="w-full sm:col-span-2 lg:col-span-1">
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                      Select Supplier / Vendor
                    </label>
                    {suppliers.length > 0 && (
                      <span className="text-[10px] text-slate-400">
                        {suppliers.length} on file
                      </span>
                    )}
                  </div>
                  <div className="space-y-1.5">
                    {/* Quick Search / Filter Input */}
                    <div className="relative">
                      <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                        <Search size={13} />
                      </div>
                      <input
                        type="text"
                        placeholder="Search supplier by name or phone..."
                        value={supplierSearchQuery}
                        onChange={(e) => setSupplierSearchQuery(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-8 pr-7 py-1.5 text-xs text-slate-800 placeholder-slate-400 outline-none focus:ring-1 focus:ring-blue-500"
                      />
                      {supplierSearchQuery && (
                        <button
                          type="button"
                          onClick={() => setSupplierSearchQuery("")}
                          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs"
                        >
                          ✕
                        </button>
                      )}
                    </div>

                    {/* Select Dropdown */}
                    <div className="relative">
                      <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none z-10">
                        <Truck size={16} />
                      </div>
                      <select
                        value={selectedSupplierId}
                        onChange={(e) => handleSupplierSelect(e.target.value)}
                        className="w-full bg-slate-50/80 border border-slate-200 rounded-xl pl-10 pr-9 py-2 text-sm font-medium text-slate-700 outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all cursor-pointer appearance-none"
                      >
                        <option value="">-- Select or Search Supplier --</option>
                        {suppliers
                          .filter((s) => {
                            if (!supplierSearchQuery.trim()) return true;
                            const q = supplierSearchQuery.toLowerCase();
                            return (
                              (s.supplier_name || s.name || "").toLowerCase().includes(q) ||
                              (s.mobile || s.mobile_number || "").includes(q) ||
                              (s.contact_person || "").toLowerCase().includes(q)
                            );
                          })
                          .map((s) => (
                            <option
                              key={s.supplier_id || s.id}
                              value={s.supplier_id || s.id}
                              className="bg-white text-slate-800"
                            >
                              {s.supplier_name || s.name} {s.mobile ? `(${s.mobile})` : ""}
                            </option>
                          ))}
                      </select>
                      <ChevronDown
                        size={14}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
                      />
                    </div>
                  </div>
                </div>

                {/* Direct display of selected supplier contact & mobile */}
                <div className="w-full">
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Supplier Contact Person
                  </label>
                  <div className="relative">
                    <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                      <User size={16} />
                    </div>
                    <input
                      type="text"
                      readOnly
                      value={formData.supplierContact || "None specified"}
                      className="w-full bg-slate-100/70 border border-slate-200 rounded-xl pl-10 pr-3.5 py-2.5 text-sm text-slate-600 outline-none cursor-default"
                      placeholder="Select supplier to view"
                    />
                  </div>
                </div>

                <div className="w-full">
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Supplier Phone / Mobile
                  </label>
                  <div className="relative">
                    <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                      <Phone size={16} />
                    </div>
                    <input
                      type="text"
                      readOnly
                      value={formData.supplierMobile || "None specified"}
                      className="w-full bg-slate-100/70 border border-slate-200 rounded-xl pl-10 pr-3.5 py-2.5 text-sm text-slate-600 outline-none cursor-default"
                      placeholder="Select supplier to view"
                    />
                  </div>
                </div>
              </div>

              {/* Active Supplier Detailed Card */}
              {formData.supplierName && (
                <div className="mt-4 p-4 rounded-xl bg-blue-50/50 dark:bg-blue-950/30 border border-blue-200/70 dark:border-blue-900/60 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold shrink-0 shadow-2xs">
                      <Truck size={18} />
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900 dark:text-white text-sm">
                        {formData.supplierName}
                      </h4>
                      <p className="text-slate-500 dark:text-slate-400 mt-0.5">
                        {formData.supplierContact && `Contact: ${formData.supplierContact} • `}
                        {formData.supplierMobile && `Mobile: ${formData.supplierMobile} • `}
                        {formData.supplierGst ? `GST: ${formData.supplierGst}` : "GST: Not Provided"}
                      </p>
                      {formData.supplierAddress && (
                        <p className="text-slate-400 dark:text-slate-500 text-[11px] mt-0.5">
                          Address: {formData.supplierAddress}
                        </p>
                      )}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleSupplierSelect("")}
                    className="text-xs font-semibold text-rose-600 dark:text-rose-400 hover:text-rose-700 dark:hover:text-rose-300 underline shrink-0"
                  >
                    Clear Supplier
                  </button>
                </div>
              )}

              {/* Supplier-Wise Medicine Details Table */}
              {(formData.supplierName || selectedSupplierId) && (
                <div className="mt-4 bg-slate-50/70 dark:bg-slate-800/50 rounded-2xl border border-slate-200/90 dark:border-slate-700/80 p-4 sm:p-5 shadow-2xs space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-200/60 dark:border-slate-700">
                    <div>
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        <span>Medicines Supplied by {formData.supplierName || "Supplier"}</span>
                        <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800">
                          {supplierMedicines.length} {supplierMedicines.length === 1 ? "Medicine" : "Medicines"}
                        </span>
                      </h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                        Complete inventory records registered under this supplier without skipping any fields.
                      </p>
                    </div>
                  </div>

                  {loadingSupplierMeds ? (
                    <div className="py-8 text-center text-xs text-slate-500 dark:text-slate-400 font-medium">
                      Loading supplier medicines...
                    </div>
                  ) : supplierMedicines.length > 0 ? (
                    <div className="overflow-x-auto scrollbar-thin rounded-xl border border-slate-200/80 dark:border-slate-700 bg-white dark:bg-slate-900">
                      <table className="w-full text-left border-collapse min-w-[950px] text-xs">
                        <thead>
                          <tr className="border-b border-slate-100 dark:border-slate-800 text-[11px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider bg-slate-50/80 dark:bg-slate-800/60">
                            <th className="py-3 px-3 text-center w-10">#</th>
                            <th className="py-3 px-3">Medicine & Salt</th>
                            <th className="py-3 px-3">Category</th>
                            <th className="py-3 px-3">Batch</th>
                            <th className="py-3 px-3">Pack & Unit</th>
                            <th className="py-3 px-3 text-right">Purchase Price</th>
                            <th className="py-3 px-3 text-right">Selling Price</th>
                            <th className="py-3 px-3 text-center">Stock</th>
                            <th className="py-3 px-3 text-center">Min Stock</th>
                            <th className="py-3 px-3">Mfg & Exp Date</th>
                            <th className="py-3 px-3">Rack</th>
                            <th className="py-3 px-3 text-center">Status</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                          {supplierMedicines.map((med, idx) => (
                            <tr key={med.medicine_id || idx} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors">
                              <td className="py-2.5 px-3 text-center text-slate-400 font-medium">{idx + 1}</td>
                              <td className="py-2.5 px-3">
                                <div className="font-bold text-slate-900 dark:text-white text-xs">{med.medicine_name}</div>
                                <div className="text-[10px] text-slate-500 dark:text-slate-400">
                                  {med.salt_name ? `Salt: ${med.salt_name}` : med.brand_name ? `Brand: ${med.brand_name}` : "—"}
                                </div>
                              </td>
                              <td className="py-2.5 px-3">
                                <span className="px-2 py-0.5 rounded-md text-[10px] font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200/60 dark:border-slate-700">
                                  {med.category || "General"}
                                </span>
                              </td>
                              <td className="py-2.5 px-3 font-mono text-[11px] text-slate-700 dark:text-slate-300">
                                {med.batch_number || "—"}
                              </td>
                              <td className="py-2.5 px-3 text-slate-600 dark:text-slate-400">
                                {med.pack_size || "1"} {med.unit ? `(${med.unit})` : ""}
                              </td>
                              <td className="py-2.5 px-3 text-right font-semibold text-slate-700 dark:text-slate-300">
                                ₹{Number(med.purchase_price || 0).toFixed(2)}
                              </td>
                              <td className="py-2.5 px-3 text-right font-bold text-slate-900 dark:text-white">
                                ₹{Number(med.selling_price || 0).toFixed(2)}
                              </td>
                              <td className="py-2.5 px-3 text-center font-bold text-slate-800 dark:text-slate-100">
                                {med.quantity}
                              </td>
                              <td className="py-2.5 px-3 text-center text-slate-500 dark:text-slate-400">
                                {med.min_stock || 0}
                              </td>
                              <td className="py-2.5 px-3 text-[11px] text-slate-600 dark:text-slate-400">
                                <div>Exp: {med.expiry_date ? new Date(med.expiry_date).toLocaleDateString("en-IN", { month: "short", year: "numeric" }) : "—"}</div>
                                {med.manufacture_date && (
                                  <div className="text-[10px] text-slate-400">Mfg: {new Date(med.manufacture_date).toLocaleDateString("en-IN", { month: "short", year: "numeric" })}</div>
                                )}
                              </td>
                              <td className="py-2.5 px-3 text-slate-600 dark:text-slate-400">
                                {med.rack_location || "—"}
                              </td>
                              <td className="py-2.5 px-3 text-center">
                                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                  med.quantity <= 0 
                                    ? "bg-rose-50 text-rose-600 border border-rose-200 dark:bg-rose-950/40 dark:text-rose-400 dark:border-rose-900"
                                    : med.quantity <= (med.min_stock || 10)
                                      ? "bg-amber-50 text-amber-600 border border-amber-200 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-900"
                                      : "bg-emerald-50 text-emerald-600 border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-900"
                                }`}>
                                  {med.quantity <= 0 ? "Out of Stock" : med.quantity <= (med.min_stock || 10) ? "Low Stock" : "Active"}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="py-6 text-center text-xs text-slate-400 dark:text-slate-500 bg-white/70 dark:bg-slate-900/60 rounded-xl border border-slate-200/60 dark:border-slate-800">
                      No medicines registered under this supplier yet. Complete the form below to add the first medicine for this supplier.
                    </div>
                  )}
                </div>
              )}
            </div>

            <hr className="border-slate-100" />

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

            <hr className="border-slate-100 dark:border-slate-800" />

            {/* SECTION B: Pricing Details */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                <h3 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Pricing Details
                </h3>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="w-full">
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
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
                      placeholder="e.g. 10"
                      className="w-full bg-slate-50/80 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl pl-10 pr-3.5 py-2.5 text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                    />
                  </div>
                </div>

                <div className="w-full">
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
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
                      className="w-full bg-slate-50/80 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl pl-10 pr-3.5 py-2.5 text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                    />
                  </div>
                </div>

                <InputField
                  label="Selling Price (Per Unit)"
                  name="sellingPrice"
                  type="number"
                  step="0.01"
                  value={formData.sellingPrice}
                  onChange={handleChange}
                  error={errors.sellingPrice}
                  placeholder="Auto or enter rate"
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
                  placeholder="Cost price"
                  required
                  icon={IndianRupee}
                />

                {/* Per-Tablet Calculation Banner */}
                <div className="sm:col-span-2 lg:col-span-4 p-3.5 rounded-xl bg-blue-50/70 dark:bg-blue-950/40 border border-blue-200/80 dark:border-blue-900/50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 rounded-lg bg-blue-600 text-white shrink-0">
                      <Calculator size={16} />
                    </div>
                    <div>
                      <span className="text-xs font-bold text-slate-800 dark:text-slate-100">
                        Per-Tablet Price Calculation:
                      </span>
                      <p className="text-[11px] text-slate-600 dark:text-slate-300 mt-0.5">
                        {totalTabletQty && totalPackPrice ? (
                          <>
                            Total Price (₹{Number(totalPackPrice).toFixed(2)}) ÷ Total Quantity ({totalTabletQty} tablets) ={" "}
                            <span className="font-bold text-blue-700 dark:text-blue-400">₹{(Number(totalPackPrice) / Number(totalTabletQty)).toFixed(2)} per tablet</span>
                          </>
                        ) : (
                          "Enter total tablet quantity and total pack price to automatically calculate the per-tablet selling rate for billing."
                        )}
                      </p>
                    </div>
                  </div>
                  {formData.sellingPrice && (
                    <div className="text-right sm:text-right w-full sm:w-auto bg-white dark:bg-slate-800 px-3 py-1.5 rounded-lg border border-blue-200 dark:border-blue-800/80 shrink-0">
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">Rate / Tablet</span>
                      <span className="text-sm font-extrabold text-blue-700 dark:text-blue-400">₹{Number(formData.sellingPrice).toFixed(2)}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Profitability Live Summary */}
              {purchaseNum > 0 && sellingNum > 0 && (
                <div className="mt-4 p-4 rounded-xl bg-slate-50/80 dark:bg-slate-800/70 border border-slate-200/90 dark:border-slate-700/80 grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div>
                    <span className="text-[11px] font-medium text-slate-400">
                      Purchase Cost
                    </span>
                    <p className="text-base font-bold text-slate-800 dark:text-slate-100 mt-0.5">
                      ₹{purchaseNum.toFixed(2)}
                    </p>
                  </div>
                  <div>
                    <span className="text-[11px] font-medium text-slate-400">
                      Selling MRP
                    </span>
                    <p className="text-base font-bold text-slate-800 dark:text-slate-100 mt-0.5">
                      ₹{sellingNum.toFixed(2)}
                    </p>
                  </div>
                  <div>
                    <span className="text-[11px] font-medium text-slate-400">
                      Profit Margin
                    </span>
                    <p className="text-base font-bold text-emerald-600 dark:text-emerald-400 mt-0.5 flex items-center gap-1">
                      <TrendingUp size={14} />
                      {marginPercentage}%
                    </p>
                  </div>
                  <div>
                    <span className="text-[11px] font-medium text-slate-400">
                      Net Gain / Unit
                    </span>
                    <p className="text-base font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">
                      ₹{profitPerUnit.toFixed(2)}
                    </p>
                  </div>
                </div>
              )}
            </div>

            <hr className="border-slate-100 dark:border-slate-800" />

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
          <div className="p-5 sm:p-6 bg-slate-50/60 dark:bg-slate-900/60 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <CheckCircle2 size={15} className="text-emerald-500" />
              <span>Ensure all mandatory details are verified before saving.</span>
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
              <button
                type="button"
                onClick={handleReset}
                className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 rounded-xl text-sm font-semibold shadow-xs transition-colors"
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

      {/* 3. ADD NEW SUPPLIER MODAL */}
      {isSupplierModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity"
            onClick={() => setIsSupplierModalOpen(false)}
          />

          <div className="relative z-10 w-full max-w-lg bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-2xl border border-slate-200 dark:border-slate-800 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 mb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold">
                  <Truck size={18} />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-800 dark:text-white leading-tight">
                    Add New Supplier
                  </h3>
                  <p className="text-xs text-slate-400">
                    Register vendor details to link with medicines and stock.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsSupplierModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveNewSupplier} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div className="sm:col-span-2">
                  <InputField
                    label="Supplier / Company Name"
                    name="supplier_name"
                    value={newSupplier.supplier_name}
                    onChange={(e) => {
                      setNewSupplier({ ...newSupplier, supplier_name: e.target.value });
                      if (supplierErrors.supplier_name) setSupplierErrors({ ...supplierErrors, supplier_name: "" });
                    }}
                    error={supplierErrors.supplier_name}
                    placeholder="e.g. Apex Healthcare Ltd"
                    required
                    icon={Building2}
                  />
                </div>

                <InputField
                  label="Contact Person"
                  name="contact_person"
                  value={newSupplier.contact_person}
                  onChange={(e) => setNewSupplier({ ...newSupplier, contact_person: e.target.value })}
                  placeholder="e.g. Rajesh Kumar"
                  icon={User}
                />

                <InputField
                  label="Mobile Number"
                  name="mobile"
                  value={newSupplier.mobile}
                  onChange={(e) => {
                    setNewSupplier({ ...newSupplier, mobile: e.target.value });
                    if (supplierErrors.mobile) setSupplierErrors({ ...supplierErrors, mobile: "" });
                  }}
                  error={supplierErrors.mobile}
                  placeholder="10-digit phone number"
                  required
                  icon={Phone}
                />

                <InputField
                  label="Email Address (Optional)"
                  name="email"
                  type="email"
                  value={newSupplier.email}
                  onChange={(e) => {
                    setNewSupplier({ ...newSupplier, email: e.target.value });
                    if (supplierErrors.email) setSupplierErrors({ ...supplierErrors, email: "" });
                  }}
                  error={supplierErrors.email}
                  placeholder="e.g. orders@apexhealth.in"
                  icon={Mail}
                />

                <InputField
                  label="GST Number (Optional)"
                  name="gst_number"
                  value={newSupplier.gst_number}
                  onChange={(e) => setNewSupplier({ ...newSupplier, gst_number: e.target.value })}
                  placeholder="e.g. 24AAACA1234A1Z5"
                  icon={FileText}
                />

                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    Supplier Address (Optional)
                  </label>
                  <div className="relative">
                    <div className="absolute left-3.5 top-3 text-slate-400 pointer-events-none">
                      <MapPin size={16} />
                    </div>
                    <textarea
                      rows={2}
                      value={newSupplier.address}
                      onChange={(e) => setNewSupplier({ ...newSupplier, address: e.target.value })}
                      placeholder="e.g. Plot 42, GIDC Phase 2, Industrial Area"
                      className="w-full bg-slate-50/80 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl pl-10 pr-3.5 py-2 text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 outline-none focus:ring-2 focus:ring-blue-500 transition-all resize-none"
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsSupplierModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-semibold transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSavingSupplier}
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-colors disabled:opacity-50 flex items-center gap-1.5"
                >
                  {isSavingSupplier ? (
                    <ButtonLoader text="Saving..." />
                  ) : (
                    <>
                      <Save size={14} />
                      <span>Save & Link Supplier</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AddMedicines;
