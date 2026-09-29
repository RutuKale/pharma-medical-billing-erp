import React, { useEffect, useMemo, useState, useRef } from "react";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import {
  Search,
  User,
  Plus,
  Trash2,
  Edit,
  Edit3,
  Calculator,
  IndianRupee,
  AlertTriangle,
  Printer,
  Download,
  Shield,
  Clock,
  History,
  Users,
  CheckCircle2,
  RotateCcw,
  Package,
  X,
  CreditCard,
  Banknote,
  QrCode,
  Calendar,
  Phone,
  Stethoscope,
  FileText,
  ArrowLeft,
} from "lucide-react";
import Swal from "sweetalert2";
import { printBill, downloadBillPDF } from "../../utils/billUtils";
import apiClient from "../../utils/apiClient";

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
  const [quantity, setQuantity] = useState(1);
  const [discount, setDiscount] = useState(0);
  const [billItems, setBillItems] = useState([]);
  const [paymentMode, setPaymentMode] = useState("Cash");
  const [medicinesData, setMedicinesData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingItemId, setEditingItemId] = useState(null);
  const [editQuantity, setEditQuantity] = useState(1);
  const [editDiscount, setEditDiscount] = useState(0);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);

  // Bill Editing State
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const editBillId = searchParams.get("editBillId");
  const [isEditingBill, setIsEditingBill] = useState(false);
  const [editingBillNumber, setEditingBillNumber] = useState("");

  const searchRef = useRef(null);
  const searchInputRef = useRef(null);
  const quantityInputRef = useRef(null);
  const dropdownListRef = useRef(null);

  const fetchPatients = async () => {
    try {
      const response = await apiClient.get("/patients");
      setPatients(response.data.data || []);
    } catch (error) {
      console.error(error);
      Swal.fire({
        icon: "error",
        title: "Failed to Load Patients",
        text: "Unable to fetch patient records",
        confirmButtonColor: "#2563eb",
      });
    }
  };

  const fetchMedicines = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get("/medicines");
      const formattedMedicines = response.data.data.map((medicine) => ({
        id: medicine.medicine_id,
        name: medicine.medicine_name,
        batch: medicine.batch_number,
        price: Number(medicine.selling_price),
        gst: Number(medicine.gst),
        stock: Number(medicine.quantity),
        expiry: medicine.expiry_date,
        category: medicine.category,
      }));
      setMedicinesData(formattedMedicines);
    } catch (error) {
      console.error(error);
      Swal.fire({
        icon: "error",
        title: "Failed to Load Medicines",
        text: "Unable to fetch medicine inventory",
        confirmButtonColor: "#2563eb",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMedicines();
    fetchPatients();
  }, []);

  useEffect(() => {
    if (editBillId) {
      loadBillForEditing(editBillId);
    }
  }, [editBillId]);

  const loadBillForEditing = async (billId) => {
    try {
      const res = await apiClient.get(`/bills/${billId}`);
      if (res.data?.success) {
        const fullBill = res.data.bill || res.data.data;
        const items = res.data.items || [];
        setIsEditingBill(true);
        setEditingBillNumber(fullBill.bill_number || `BILL-${billId}`);
        setSelectedPatientId(fullBill.patient_id ? String(fullBill.patient_id) : "");
        setPatient({
          patientId: fullBill.patient_id || "",
          name: fullBill.patient_name || "",
          mobile: fullBill.mobile_number || "",
          age: fullBill.age || "",
          gender: fullBill.gender || "",
          doctorName: fullBill.doctor_name || "",
          prescriptionNumber: fullBill.prescription_number || "",
        });
        setPaymentMode(fullBill.payment_mode || "Cash");
        setBillItems(
          items.map((it) => {
            const qty = Number(it.quantity || 1);
            const price = Number(it.price || 0);
            const disc = Number(it.discount || 0);
            const gst = Number(it.gst || 0);
            const sub = qty * price;
            const discAmt = (sub * disc) / 100;
            const taxable = sub - discAmt;
            const gstAmt = (taxable * gst) / 100;
            const total = Number(it.total || taxable + gstAmt);

            return {
              id: it.bill_item_id || it.medicine_id || Date.now() + Math.random(),
              medicine_id: it.medicine_id,
              name: it.medicine_name || it.name || "Medicine",
              batch: it.batch_number || it.batch || "-",
              price,
              quantity: qty,
              discount: disc,
              gst,
              subtotal: sub,
              discountAmount: discAmt,
              gstAmount: gstAmt,
              total,
            };
          })
        );

        Swal.fire({
          icon: "info",
          title: "Editing Bill",
          text: `Loaded Invoice #${fullBill.bill_number} for editing.`,
          timer: 2000,
          showConfirmButton: false,
        });
      }
    } catch (err) {
      console.error(err);
      Swal.fire({
        icon: "error",
        title: "Load Failed",
        text: "Could not load bill for editing.",
        confirmButtonColor: "#2563eb",
      });
    }
  };

  const exitEditMode = () => {
    setIsEditingBill(false);
    setEditingBillNumber("");
    setSearchParams({});
    setBillItems([]);
    setPatient({
      patientId: "",
      name: "",
      mobile: "",
      age: "",
      gender: "",
      doctorName: "",
      prescriptionNumber: "",
    });
    setSelectedPatientId("");
  };

  const selectMedicine = (medicine) => {
    setSelectedMedicine(medicine);
    setSearch(medicine.name);
    setQuantity(1);
    setDiscount(0);
    setIsSearchOpen(false);
    setHighlightedIndex(-1);
    setTimeout(() => {
      quantityInputRef.current?.focus();
      quantityInputRef.current?.select();
    }, 50);
  };

  const scrollIndexIntoView = (index) => {
    if (dropdownListRef.current) {
      const items = dropdownListRef.current.children;
      if (items[index]) {
        items[index].scrollIntoView({ block: "nearest" });
      }
    }
  };

  const handleSearchKeyDown = (e) => {
    if (filteredMedicines.length === 0) return;

    if (!isSearchOpen) {
      if (e.key === "ArrowDown" || e.key === "Enter") {
        setIsSearchOpen(true);
        setHighlightedIndex(0);
        e.preventDefault();
      }
      return;
    }

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlightedIndex((prev) => {
        const next = prev < filteredMedicines.length - 1 ? prev + 1 : 0;
        scrollIndexIntoView(next);
        return next;
      });
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlightedIndex((prev) => {
        const next = prev > 0 ? prev - 1 : filteredMedicines.length - 1;
        scrollIndexIntoView(next);
        return next;
      });
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (highlightedIndex >= 0 && filteredMedicines[highlightedIndex]) {
        selectMedicine(filteredMedicines[highlightedIndex]);
      } else if (filteredMedicines.length > 0) {
        selectMedicine(filteredMedicines[0]);
      }
    } else if (e.key === "Escape") {
      setIsSearchOpen(false);
      setHighlightedIndex(-1);
    }
  };

  // Close search dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setIsSearchOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredMedicines = useMemo(() => {
    if (!search.trim()) return [];
    return medicinesData.filter((medicine) =>
      medicine.name.toLowerCase().includes(search.toLowerCase()),
    );
  }, [search, medicinesData]);

  const isExpired = (expiryDate) => {
    if (!expiryDate) return false;
    return new Date(expiryDate) < new Date();
  };

  const addMedicineToBill = () => {
    if (!selectedMedicine) return;
    if (isExpired(selectedMedicine.expiry)) {
      Swal.fire({
        icon: "error",
        title: "Expired Medicine",
        text: "Expired medicines cannot be added to a bill.",
        confirmButtonColor: "#2563eb",
      });
      return;
    }
    const qty = Number(quantity);
    if (!qty || qty <= 0) {
      Swal.fire({
        icon: "warning",
        title: "Invalid Quantity",
        text: "Quantity must be greater than 0",
        confirmButtonColor: "#2563eb",
      });
      return;
    }
    if (qty > selectedMedicine.stock) {
      Swal.fire({
        icon: "error",
        title: "Insufficient Stock",
        text: `Only ${selectedMedicine.stock} items available in inventory`,
        confirmButtonColor: "#2563eb",
      });
      return;
    }
    const price = Number(selectedMedicine.price);
    const gst = Number(selectedMedicine.gst);
    const discountPercent = Number(discount) || 0;
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
      category: selectedMedicine.category,
    };

    const existingItem = billItems.find(
      (item) => item.id === selectedMedicine.id,
    );

    if (existingItem) {
      Swal.fire({
        icon: "warning",
        title: "Medicine Already in Bill",
        text: "Remove the medicine from the list or edit its quantity.",
        confirmButtonColor: "#2563eb",
      });
      return;
    }

    setBillItems([...billItems, newItem]);
    setSearch("");
    setSelectedMedicine(null);
    setQuantity(1);
    setDiscount(0);
    setIsSearchOpen(false);
    setHighlightedIndex(-1);
    setTimeout(() => {
      searchInputRef.current?.focus();
    }, 50);
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
    } else {
      setPatient({
        patientId: "",
        name: "",
        mobile: "",
        age: "",
        gender: "",
        doctorName: "",
        prescriptionNumber: "",
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
        text: "Please select a patient before billing.",
        confirmButtonColor: "#2563eb",
      });
      return null;
    }

    if (billItems.length === 0) {
      Swal.fire({
        icon: "warning",
        title: "No Medicines Added",
        text: "Please add at least one medicine to the bill.",
        confirmButtonColor: "#2563eb",
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

  const generateBill = async () => {
    const billData = generateBillData();
    if (!billData) return;

    try {
      const payload = {
        bill: {
          patient_id: billData.patient.patientId,
          bill_number: isEditingBill ? editingBillNumber : billData.invoiceNo,
          subtotal: billData.totals.subtotal,
          total_discount: billData.totals.discountTotal,
          total_gst: billData.totals.gstTotal,
          grand_total: billData.totals.grandTotal,
          payment_mode: billData.paymentMode,
          payment_status: "Completed",
          notes: isEditingBill ? "Updated via Bill Editor" : "",
        },
        items: billData.medicines.map((m) => ({
          medicine_id: m.medicine_id || m.id,
          quantity: m.quantity,
          price: m.price,
          gst: m.gst,
          discount: m.discount,
          total: m.total,
        })),
      };

      if (isEditingBill) {
        const res = await apiClient.put(`/bills/${editBillId}`, payload);
        if (res.data.success) {
          await Swal.fire({
            icon: "success",
            title: "Bill Updated",
            text: `Invoice #${editingBillNumber} updated and inventory stock synchronized successfully!`,
            confirmButtonColor: "#2563eb",
          });
          exitEditMode();
          navigate("/billing-history");
        }
      } else {
        const res = await apiClient.post("/bills", payload);
        if (res.data.success) {
          Swal.fire({
            icon: "success",
            title: "Bill Generated",
            text: "Bill created and inventory stock updated successfully!",
            confirmButtonColor: "#2563eb",
          });

          setBillItems([]);
          setPatient({
            patientId: "",
            name: "",
            mobile: "",
            age: "",
            gender: "",
            doctorName: "",
            prescriptionNumber: "",
          });
          setSelectedPatientId("");
          fetchMedicines();
        }
      }
    } catch (error) {
      console.error(error);
      Swal.fire({
        icon: "error",
        title: isEditingBill ? "Error Updating Bill" : "Error Generating Bill",
        text: error.response?.data?.message || "Failed to save bill to database",
        confirmButtonColor: "#2563eb",
      });
    }
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
    const qty = Number(editQuantity) || 0;
    const disc = Number(editDiscount) || 0;

    if (qty <= 0) {
      return Swal.fire({
        icon: "warning",
        title: "Invalid Quantity",
        text: "Quantity must be greater than 0",
        confirmButtonColor: "#2563eb",
      });
    }

    if (disc < 0 || disc > 100) {
      return Swal.fire({
        icon: "warning",
        title: "Invalid Discount",
        text: "Discount must be between 0 and 100",
        confirmButtonColor: "#2563eb",
      });
    }

    const updatedItems = billItems.map((item) => {
      if (item.id !== editingItemId) return item;

      const subtotal = item.price * qty;
      const discountAmount = (subtotal * disc) / 100;
      const taxableAmount = subtotal - discountAmount;
      const gstAmount = (taxableAmount * item.gst) / 100;
      const total = taxableAmount + gstAmount;

      return {
        ...item,
        quantity: qty,
        discount: disc,
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
      text: "Item quantity and discount updated successfully",
      confirmButtonColor: "#2563eb",
    });
  };

  const clearCart = () => {
    if (billItems.length === 0) return;
    Swal.fire({
      title: "Clear Bill Items?",
      text: "Are you sure you want to remove all items from this bill?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#2563eb",
      cancelButtonColor: "#64748b",
      confirmButtonText: "Yes, clear all",
    }).then((result) => {
      if (result.isConfirmed) {
        setBillItems([]);
      }
    });
  };

  // Preview calculations for selected medicine
  const livePreview = useMemo(() => {
    if (!selectedMedicine) return null;
    const p = Number(selectedMedicine.price) || 0;
    const q = Number(quantity) || 0;
    const d = Number(discount) || 0;
    const g = Number(selectedMedicine.gst) || 0;
    const sub = p * q;
    const dAmt = (sub * d) / 100;
    const taxable = sub - dAmt;
    const gAmt = (taxable * g) / 100;
    const tot = taxable + gAmt;
    return { subtotal: sub, discountAmount: dAmt, gstAmount: gAmt, total: tot };
  }, [selectedMedicine, quantity, discount]);

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-[1600px] mx-auto space-y-6">
      {/* 1. HEADER SECTION (No icon next to title per design standards) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <span>New Billing</span>
          </h1>
          <p className="text-slate-500 text-xs sm:text-sm mt-0.5">
            Create patient prescriptions, calculate taxes & discounts, and generate invoices.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          {billItems.length > 0 && (
            <button
              onClick={clearCart}
              className="inline-flex items-center gap-1.5 px-3.5 py-2.5 bg-white hover:bg-rose-50 border border-slate-200 hover:border-rose-200 text-rose-600 rounded-xl text-sm font-semibold shadow-xs transition-colors"
            >
              <RotateCcw size={15} />
              <span>Clear Cart</span>
            </button>
          )}
          <Link
            to="/billing-history"
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 rounded-xl text-sm font-semibold shadow-xs transition-colors"
          >
            <History size={16} className="text-slate-500" />
            <span>Bill History</span>
          </Link>
          <Link
            to="/patients"
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 rounded-xl text-sm font-semibold shadow-xs transition-colors"
          >
            <Users size={16} className="text-slate-500" />
            <span>Patients</span>
          </Link>
        </div>
      </div>

      {/* EDIT MODE BANNER */}
      {isEditingBill && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-amber-100 text-amber-800 shrink-0">
              <Edit size={20} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-amber-200/80 text-amber-900">
                  Editing Mode
                </span>
                <h3 className="text-sm font-bold text-amber-950">
                  Invoice #{editingBillNumber}
                </h3>
              </div>
              <p className="text-xs text-amber-700 mt-0.5">
                Saving updates will synchronize stock (restoring previous items and deducting newly selected medicines).
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={exitEditMode}
              className="px-4 py-2 bg-white hover:bg-amber-100/60 border border-amber-300 text-amber-900 rounded-xl text-xs font-bold transition-colors shadow-2xs"
            >
              Cancel Edit & New Bill
            </button>
          </div>
        </div>
      )}

      {/* 2. MAIN WORKSPACE (2-COLUMN GRID) */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
        {/* LEFT WORKSPACE (8 COLS) */}
        <div className="xl:col-span-8 space-y-6">
          {/* PATIENT DETAILS CARD */}
          <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/90 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-blue-50 text-blue-600 border border-blue-100">
                  <User size={18} />
                </div>
                <div>
                  <h2 className="text-base font-bold text-slate-900">
                    Patient Details
                  </h2>
                  <p className="text-xs text-slate-500">
                    Select a registered patient to auto-populate billing information.
                  </p>
                </div>
              </div>
              <Link
                to="/patients"
                className="text-xs font-semibold text-blue-600 hover:text-blue-700 hover:underline flex items-center gap-1"
              >
                + Register New
              </Link>
            </div>

            {/* Patient Selector */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Select Patient <span className="text-rose-500">*</span>
              </label>
              <select
                value={selectedPatientId}
                onChange={handlePatientSelect}
                className="w-full bg-slate-50/60 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium"
              >
                <option value="">-- Choose a patient --</option>
                {patients.map((p) => (
                  <option key={p.patient_id} value={p.patient_id}>
                    {p.patient_name} — {p.mobile_number} {p.age ? `(${p.age}y)` : ""}
                  </option>
                ))}
              </select>
            </div>

            {/* Patient Info Fields */}
            {patient.patientId ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 pt-2">
                <div className="p-3 rounded-xl bg-slate-50/70 border border-slate-100">
                  <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                    Mobile
                  </span>
                  <span className="text-sm font-semibold text-slate-800 flex items-center gap-1.5 mt-0.5">
                    <Phone size={13} className="text-slate-400" />
                    {patient.mobile || "—"}
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-slate-50/70 border border-slate-100">
                  <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                    Age & Gender
                  </span>
                  <span className="text-sm font-semibold text-slate-800 block mt-0.5">
                    {patient.age ? `${patient.age} yrs` : "—"}{" "}
                    {patient.gender ? `• ${patient.gender}` : ""}
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-slate-50/70 border border-slate-100">
                  <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                    Prescribed By
                  </span>
                  <span className="text-sm font-semibold text-slate-800 flex items-center gap-1.5 mt-0.5 truncate">
                    <Stethoscope size={13} className="text-slate-400 shrink-0" />
                    <span className="truncate">{patient.doctorName || "Self / None"}</span>
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-slate-50/70 border border-slate-100">
                  <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                    Prescription No
                  </span>
                  <span className="text-sm font-semibold text-slate-800 flex items-center gap-1.5 mt-0.5 truncate">
                    <FileText size={13} className="text-slate-400 shrink-0" />
                    <span className="truncate font-mono">{patient.prescriptionNumber || "—"}</span>
                  </span>
                </div>
              </div>
            ) : (
              <div className="p-3.5 rounded-xl bg-blue-50/50 border border-blue-100 text-xs text-blue-700 flex items-center gap-2">
                <User size={15} className="shrink-0 text-blue-500" />
                <span>
                  Please select a patient from the dropdown above to associate with this bill.
                </span>
              </div>
            )}
          </div>

            {/* ADD MEDICINE CARD */}
          <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/90 shadow-xs space-y-4 relative z-20">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-indigo-50 text-indigo-600 border border-indigo-100">
                  <Search size={18} />
                </div>
                <div>
                  <h2 className="text-base font-bold text-slate-900">
                    Add Medicines
                  </h2>
                  <p className="text-xs text-slate-500">
                    Search medicine catalog by name, check stock availability, and apply line discounts.
                  </p>
                </div>
              </div>
              <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-slate-100 text-slate-600 border border-slate-200">
                {medicinesData.length} in Catalog
              </span>
            </div>

            {/* Search Input with Popover Dropdown */}
            <div className="relative" ref={searchRef}>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                  Search Medicine
                </label>
                <span className="text-[11px] text-slate-400 font-medium">
                  Use <kbd className="px-1.5 py-0.5 bg-slate-100 rounded border border-slate-200 text-slate-600 font-mono text-[10px]">↑</kbd> <kbd className="px-1.5 py-0.5 bg-slate-100 rounded border border-slate-200 text-slate-600 font-mono text-[10px]">↓</kbd> to navigate, <kbd className="px-1.5 py-0.5 bg-slate-100 rounded border border-slate-200 text-slate-600 font-mono text-[10px]">Enter</kbd> to pick
                </span>
              </div>
              <div className="relative">
                <Search
                  size={16}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
                />
                <input
                  ref={searchInputRef}
                  type="text"
                  placeholder="Type medicine name (keyboard or mouse to select)..."
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    setIsSearchOpen(true);
                    setHighlightedIndex(0);
                  }}
                  onFocus={() => {
                    if (filteredMedicines.length > 0) {
                      setIsSearchOpen(true);
                    }
                  }}
                  onKeyDown={handleSearchKeyDown}
                  className="w-full bg-slate-50/60 border border-slate-200 rounded-xl pl-10 pr-10 py-2.5 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium"
                />
                {search && (
                  <button
                    type="button"
                    onClick={() => {
                      setSearch("");
                      setIsSearchOpen(false);
                      setHighlightedIndex(-1);
                    }}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
                  >
                    <X size={15} />
                  </button>
                )}
              </div>

              {/* Autocomplete Dropdown with Keyboard & Mouse Support */}
              {isSearchOpen && search.trim() && (
                <div
                  ref={dropdownListRef}
                  className="absolute left-0 right-0 top-full mt-1.5 bg-white border border-slate-200 rounded-2xl shadow-xl w-full max-h-72 overflow-y-auto z-50 divide-y divide-slate-100"
                >
                  {loading ? (
                    <div className="p-4 text-center text-xs text-slate-500 font-medium">
                      Loading medicine inventory...
                    </div>
                  ) : filteredMedicines.length > 0 ? (
                    filteredMedicines.map((medicine, index) => {
                      const expired = isExpired(medicine.expiry);
                      const outOfStock = medicine.stock === 0;
                      const isHighlighted = highlightedIndex === index;

                      return (
                        <button
                          type="button"
                          key={medicine.id}
                          onMouseEnter={() => setHighlightedIndex(index)}
                          onClick={() => selectMedicine(medicine)}
                          className={`w-full text-left p-3.5 transition-colors flex items-center justify-between gap-3 ${
                            isHighlighted
                              ? "bg-blue-50/90 text-blue-900 border-l-4 border-blue-600 pl-2.5"
                              : "hover:bg-slate-50 text-slate-800"
                          }`}
                        >
                          <div className="min-w-0">
                            <div className="font-semibold text-sm flex items-center gap-2">
                              <span>{medicine.name}</span>
                              {medicine.batch && (
                                <span className="font-mono text-[11px] font-normal px-1.5 py-0.2 bg-slate-100 text-slate-600 rounded">
                                  {medicine.batch}
                                </span>
                              )}
                            </div>
                            <div className="text-xs text-slate-500 mt-0.5 flex items-center gap-2">
                              <span>Stock: {medicine.stock} units</span>
                              <span>•</span>
                              <span>GST: {medicine.gst}%</span>
                              {medicine.expiry && (
                                <>
                                  <span>•</span>
                                  <span className={expired ? "text-rose-600 font-medium" : ""}>
                                    Exp: {new Date(medicine.expiry).toLocaleDateString("en-IN", { month: "short", year: "numeric" })}
                                  </span>
                                </>
                              )}
                            </div>
                          </div>

                          <div className="text-right shrink-0">
                            <div className="font-bold text-slate-900 text-sm">
                              ₹{medicine.price.toFixed(2)}
                            </div>
                            <span className="text-[10px] text-slate-400 block font-normal -mt-0.5">
                              per tablet
                            </span>
                            {outOfStock ? (
                              <span className="text-[11px] font-semibold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-100 mt-0.5 inline-block">
                                Out of Stock
                              </span>
                            ) : expired ? (
                              <span className="text-[11px] font-semibold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-100 mt-0.5 inline-block">
                                Expired
                              </span>
                            ) : medicine.stock <= 10 ? (
                              <span className="text-[11px] font-semibold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-100 mt-0.5 inline-block">
                                Low ({medicine.stock})
                              </span>
                            ) : (
                              <span className="text-[11px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100 mt-0.5 inline-block">
                                In Stock
                              </span>
                            )}
                          </div>
                        </button>
                      );
                    })
                  ) : (
                    <div className="p-4 text-center text-xs text-slate-500 font-medium">
                      No medicines matching "{search}" found
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Selected Medicine Action Card */}
            {selectedMedicine && (
              <div className="p-4 sm:p-5 rounded-2xl bg-slate-50/70 border border-slate-200 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200/70">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-slate-900 text-base">
                        {selectedMedicine.name}
                      </h3>
                      {selectedMedicine.batch && (
                        <span className="font-mono text-xs font-semibold px-2 py-0.5 rounded bg-white border border-slate-200 text-slate-700">
                          {selectedMedicine.batch}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Available Inventory: <strong className="text-slate-800">{selectedMedicine.stock}</strong> units • GST Rate: <strong className="text-slate-800">{selectedMedicine.gst}%</strong>
                    </p>
                  </div>

                  <div className="text-right">
                    <span className="text-xs text-slate-400 uppercase tracking-wider block">
                      Per-Tablet Price
                    </span>
                    <span className="text-lg font-extrabold text-slate-900">
                      ₹{selectedMedicine.price.toFixed(2)}
                    </span>
                    <span className="text-[11px] text-slate-400 block font-normal">
                      / tablet
                    </span>
                  </div>
                </div>

                {isExpired(selectedMedicine.expiry) ? (
                  <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium flex items-center gap-2">
                    <AlertTriangle size={16} className="text-rose-500 shrink-0" />
                    <span>
                      This medicine expired on {new Date(selectedMedicine.expiry).toLocaleDateString("en-IN")}. Pharmacy regulations prohibit billing expired stock.
                    </span>
                  </div>
                ) : (
                  <>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                          Tablet Quantity (Max {selectedMedicine.stock}) <span className="text-[11px] text-slate-400 font-normal">Press Enter ↵ to add</span>
                        </label>
                        <input
                          ref={quantityInputRef}
                          type="number"
                          min="1"
                          max={selectedMedicine.stock}
                          value={quantity}
                          onChange={(e) => setQuantity(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              e.preventDefault();
                              addMedicineToBill();
                            }
                          }}
                          className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-800 font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                          Discount (%)
                        </label>
                        <input
                          type="number"
                          min="0"
                          max="100"
                          step="0.5"
                          value={discount}
                          onChange={(e) => setDiscount(e.target.value)}
                          className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-800 font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-500 mb-1">
                          Live Item Total
                        </label>
                        <div className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-sm font-extrabold text-emerald-600 flex items-center justify-between">
                          <span>₹{livePreview ? livePreview.total.toFixed(2) : "0.00"}</span>
                          <span className="text-[11px] font-normal text-slate-400">
                            incl. GST
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-end gap-2.5 pt-2">
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedMedicine(null);
                          setSearch("");
                        }}
                        className="px-4 py-2 bg-white hover:bg-slate-100 border border-slate-200 text-slate-600 rounded-xl text-xs font-semibold transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={addMedicineToBill}
                        className="inline-flex items-center gap-1.5 px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors"
                      >
                        <Plus size={15} />
                        <span>Add To Bill</span>
                      </button>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>

          {/* BILL ITEMS TABLE */}
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
            <div className="p-4 sm:p-5 flex items-center justify-between border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100">
                  <IndianRupee size={16} />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    Bill Items
                  </h3>
                  <p className="text-xs text-slate-500">
                    {billItems.length} items added ({billItems.reduce((acc, i) => acc + (i.quantity || 0), 0)} total units)
                  </p>
                </div>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[700px]">
                <thead>
                  <tr className="border-b border-slate-100 text-[11px] font-semibold text-slate-400 uppercase tracking-wider bg-slate-50/60">
                    <th className="py-3 px-4 w-10 text-center">#</th>
                    <th className="py-3 px-4">Medicine & Batch</th>
                    <th className="py-3 px-4 text-right">Rate / Tab</th>
                    <th className="py-3 px-4 text-center">Qty (Tabs)</th>
                    <th className="py-3 px-4 text-right">GST</th>
                    <th className="py-3 px-4 text-right">Discount</th>
                    <th className="py-3 px-4 text-right">Total</th>
                    <th className="py-3 px-4 text-center w-24">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm">
                  {billItems.map((item, index) => (
                    <tr
                      key={item.id}
                      className="hover:bg-slate-50/60 transition-colors"
                    >
                      <td className="py-3.5 px-4 text-center text-xs font-medium text-slate-400">
                        {index + 1}
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-slate-900">
                          {item.name}
                        </div>
                        <div className="flex items-center gap-2 mt-0.5">
                          {item.batch && (
                            <span className="font-mono text-[11px] text-slate-500 font-normal">
                              Batch: {item.batch}
                            </span>
                          )}
                          {item.category && (
                            <span className="text-[11px] text-slate-400">
                              • {item.category}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-right text-slate-700 font-semibold">
                        ₹{item.price.toFixed(2)}
                        <span className="text-[10px] text-slate-400 block font-normal">/ tab</span>
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <span className="font-bold text-slate-900 px-2 py-0.5 rounded-md bg-slate-100">
                          {item.quantity}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="text-xs text-slate-600 font-medium">
                          {item.gst}%
                        </div>
                        <div className="text-[11px] text-slate-400">
                          ₹{item.gstAmount.toFixed(2)}
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="text-xs text-rose-600 font-medium">
                          {item.discount}%
                        </div>
                        <div className="text-[11px] text-rose-500/80">
                          -₹{item.discountAmount.toFixed(2)}
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-right font-bold text-slate-900">
                        ₹{item.total.toFixed(2)}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            type="button"
                            onClick={() => editItem(item.id)}
                            className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Edit quantity / discount"
                          >
                            <Edit size={15} />
                          </button>
                          <button
                            type="button"
                            onClick={() => removeItem(item.id)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                            title="Remove item"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {billItems.length === 0 && (
                <div className="text-center py-12 px-4 space-y-2">
                  <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 mx-auto flex items-center justify-center">
                    <IndianRupee size={24} />
                  </div>
                  <p className="text-sm font-semibold text-slate-700">
                    No medicines added to bill yet
                  </p>
                  <p className="text-xs text-slate-400 max-w-sm mx-auto">
                    Search and select medicines from the catalog above to populate invoice items.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* RIGHT CHECKOUT SIDEBAR (4 COLS) */}
        <div className="xl:col-span-4 space-y-6">
          <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/90 shadow-xs space-y-5 sticky top-6">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100">
                  <Calculator size={18} />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    Bill Summary
                  </h3>
                  <p className="text-xs text-slate-500">
                    Review totals and complete payment.
                  </p>
                </div>
              </div>
              <span className="text-[11px] font-mono font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-600">
                Draft
              </span>
            </div>

            {/* Calculations Breakdown */}
            <div className="space-y-3 text-sm">
              <div className="flex items-center justify-between text-slate-600">
                <span>Subtotal ({billItems.length} items)</span>
                <span className="font-semibold text-slate-900">
                  ₹{totals.subtotal.toFixed(2)}
                </span>
              </div>
              <div className="flex items-center justify-between text-slate-600">
                <span className="flex items-center gap-1 text-rose-600 font-medium">
                  Total Discount
                </span>
                <span className="font-semibold text-rose-600">
                  - ₹{totals.discountTotal.toFixed(2)}
                </span>
              </div>
              <div className="flex items-center justify-between text-slate-600">
                <span className="text-slate-600">Total GST</span>
                <span className="font-semibold text-slate-900">
                  + ₹{totals.gstTotal.toFixed(2)}
                </span>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-baseline justify-between">
                <div>
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                    Grand Total
                  </span>
                  <span className="text-[11px] text-slate-400">
                    (Inclusive of all taxes)
                  </span>
                </div>
                <div className="text-2xl sm:text-3xl font-extrabold text-slate-900">
                  ₹{totals.grandTotal.toFixed(2)}
                </div>
              </div>
            </div>

            {/* Payment Mode Pills */}
            <div className="pt-2 border-t border-slate-100 space-y-2">
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                Payment Mode
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: "Cash", icon: <Banknote size={14} /> },
                  { id: "UPI", icon: <QrCode size={14} /> },
                  { id: "Card", icon: <CreditCard size={14} /> },
                  { id: "Insurance", icon: <Shield size={14} /> },
                  { id: "Credit", icon: <Clock size={14} /> },
                ].map((mode) => (
                  <button
                    key={mode.id}
                    type="button"
                    onClick={() => setPaymentMode(mode.id)}
                    className={`px-3 py-2 rounded-xl text-xs font-semibold border flex items-center justify-center gap-1.5 transition-all ${
                      paymentMode === mode.id
                        ? "bg-blue-50 text-blue-700 border-blue-200 shadow-2xs"
                        : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
                    }`}
                  >
                    {mode.icon}
                    <span>{mode.id}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-2.5 pt-2">
              <button
                type="button"
                onClick={generateBill}
                disabled={billItems.length === 0}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white px-4 py-3 rounded-xl font-semibold text-sm shadow-xs flex items-center justify-center gap-2 transition-colors disabled:cursor-not-allowed"
              >
                <CheckCircle2 size={18} />
                <span>{isEditingBill ? "Update Bill" : "Generate & Save Bill"}</span>
              </button>

              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={handlePrintBill}
                  disabled={billItems.length === 0}
                  className="bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 px-3 py-2.5 rounded-xl font-semibold text-xs shadow-xs flex items-center justify-center gap-1.5 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Printer size={15} />
                  <span>Print Receipt</span>
                </button>
                <button
                  type="button"
                  onClick={handleDownloadPDF}
                  disabled={billItems.length === 0}
                  className="bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 px-3 py-2.5 rounded-xl font-semibold text-xs shadow-xs flex items-center justify-center gap-1.5 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Download size={15} />
                  <span>Download PDF</span>
                </button>
              </div>
            </div>

            {/* Inventory Note */}
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-[11px] text-slate-500 leading-relaxed flex items-center gap-2">
              <Shield size={14} className="text-slate-400 shrink-0" />
              <span>
                Inventory stock levels update automatically upon saving the bill.
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 3. EDIT ITEM MODAL */}
      {isEditOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-slate-900/40 backdrop-blur-xs">
          <div
            className="fixed inset-0"
            onClick={closeEditModal}
          />
          <div className="relative z-10 w-full max-w-md mx-auto bg-white border border-slate-200/90 rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">
                Edit Bill Item
              </h3>
              <button
                type="button"
                onClick={closeEditModal}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X size={18} />
              </button>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Quantity
              </label>
              <input
                type="number"
                min="1"
                step="1"
                value={editQuantity}
                onChange={(e) => setEditQuantity(Number(e.target.value))}
                className="w-full bg-slate-50/60 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-800 font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Discount (%)
              </label>
              <input
                type="number"
                min="0"
                max="100"
                step="0.5"
                value={editDiscount}
                onChange={(e) => setEditDiscount(Number(e.target.value))}
                className="w-full bg-slate-50/60 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-800 font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              />
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={closeEditModal}
                className="px-4 py-2 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 rounded-xl text-xs font-semibold shadow-xs transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={saveEdit}
                className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors"
              >
                Update Item
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Billing;
