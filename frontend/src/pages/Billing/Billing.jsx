import React, { useEffect, useMemo, useState, useRef } from "react";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import {
  Search,
  User,
  Plus,
  Minus,
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
  UserPlus,
  Layers,
  MapPin,
  Check,
} from "lucide-react";
import Swal from "sweetalert2";
import { printBill, downloadBillPDF } from "../../utils/billUtils";
import apiClient from "../../utils/apiClient";

const Billing = () => {
  // Helper to construct a fresh patient bill
  const createNewBillSession = (idx = 1) => ({
    id: `bill_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    invoiceNo: `INV-${Date.now().toString().slice(-6)}-${idx}`,
    patient: {
      patientId: "",
      name: "",
      mobile: "",
      age: "",
      gender: "",
      doctorName: "",
      prescriptionNumber: "",
      address: "",
    },
    selectedPatientId: "",
    billItems: [],
    paymentMode: "Cash",
  });

  // Multi-Patient Billing State
  const [bills, setBills] = useState([createNewBillSession(1)]);
  const [activeBillIndex, setActiveBillIndex] = useState(0);

  // Active Bill Accessors
  const activeBill = bills[activeBillIndex] || bills[0];
  const patient = activeBill?.patient || {
    patientId: "",
    name: "",
    mobile: "",
    age: "",
    gender: "",
    doctorName: "",
    prescriptionNumber: "",
    address: "",
  };
  const selectedPatientId = activeBill?.selectedPatientId || "";
  const billItems = activeBill?.billItems || [];
  const paymentMode = activeBill?.paymentMode || "Cash";

  // Active Bill Updaters
  const updateActiveBill = (updates) => {
    setBills((prev) => {
      const copy = [...prev];
      const current = copy[activeBillIndex] || copy[0];
      copy[activeBillIndex] =
        typeof updates === "function" ? updates(current) : { ...current, ...updates };
      return copy;
    });
  };

  const setPatient = (newPatient) => {
    updateActiveBill((prev) => ({
      ...prev,
      patient: typeof newPatient === "function" ? newPatient(prev.patient) : newPatient,
    }));
  };

  const setSelectedPatientId = (newId) => {
    updateActiveBill({ selectedPatientId: newId });
  };

  const setBillItems = (newItems) => {
    updateActiveBill((prev) => ({
      ...prev,
      billItems: typeof newItems === "function" ? newItems(prev.billItems) : newItems,
    }));
  };

  const setPaymentMode = (newMode) => {
    updateActiveBill({ paymentMode: newMode });
  };

  // Multi-Bill Actions
  const addNewPatientBill = () => {
    const nextIdx = bills.length + 1;
    const nextBill = createNewBillSession(nextIdx);
    setBills([...bills, nextBill]);
    setActiveBillIndex(bills.length);
  };

  const removePatientBill = (idx, e) => {
    e?.stopPropagation();
    if (bills.length <= 1) return;
    const filtered = bills.filter((_, i) => i !== idx);
    setBills(filtered);
    if (activeBillIndex >= filtered.length) {
      setActiveBillIndex(filtered.length - 1);
    }
  };

  // Direct Patient Registration Modal State
  const [isPatientModalOpen, setIsPatientModalOpen] = useState(false);
  const [newPatient, setNewPatient] = useState({
    name: "",
    mobile: "",
    age: "",
    gender: "Male",
    address: "",
    doctorName: "",
    prescriptionNumber: "",
  });
  const [patientErrors, setPatientErrors] = useState({});
  const [isRegisteringPatient, setIsRegisteringPatient] = useState(false);

  // Multi-Bill Session Summary Modal State
  const [sessionSummary, setSessionSummary] = useState(null);
  const [isSavingAll, setIsSavingAll] = useState(false);

  const [patients, setPatients] = useState([]);
  const [patientSearchQuery, setPatientSearchQuery] = useState("");
  const [search, setSearch] = useState("");
  const [selectedMedicine, setSelectedMedicine] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [discount, setDiscount] = useState(0);
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
          address: fullBill.address || "",
        });
        setPaymentMode(fullBill.payment_mode || "Cash");
        setBillItems(
          items.map((it) => {
            const qty = Number(it.quantity || 1);
            const price = Number(it.price || 0);
            const disc = Number(it.discount || 0);
            const sub = qty * price;
            const discAmt = (sub * disc) / 100;
            const total = Number(it.total || sub - discAmt);

            return {
              id: it.bill_item_id || it.medicine_id || Date.now() + Math.random(),
              medicine_id: it.medicine_id,
              name: it.medicine_name || it.name || "Medicine",
              batch: it.batch_number || it.batch || "-",
              price,
              quantity: qty,
              discount: disc,
              gst: 0,
              subtotal: sub,
              discountAmount: discAmt,
              gstAmount: 0,
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
      address: "",
    });
    setSelectedPatientId("");
  };

  const calculateLineItem = (item, newQuantity, newDiscount = (item.discount ?? 0)) => {
    const price = Number(item.price) || 0;
    const qty = Math.max(1, Number(newQuantity) || 1);
    const disc = Math.min(100, Math.max(0, Number(newDiscount) || 0));

    const subtotal = price * qty;
    const discountAmount = (subtotal * disc) / 100;
    const total = subtotal - discountAmount;

    return {
      ...item,
      quantity: qty,
      discount: disc,
      gst: 0,
      gstAmount: 0,
      subtotal,
      discountAmount,
      total,
    };
  };

  const isExpired = (expiryDate) => {
    if (!expiryDate) return false;
    return new Date(expiryDate) < new Date();
  };

  const filteredMedicines = useMemo(() => {
    if (!search.trim()) return [];
    return medicinesData.filter((medicine) =>
      medicine.name.toLowerCase().includes(search.toLowerCase()),
    );
  }, [search, medicinesData]);

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

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setIsSearchOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectMedicine = (medicine) => {
    if (isExpired(medicine.expiry)) {
      Swal.fire({
        icon: "error",
        title: "Expired Medicine",
        text: "Expired medicines cannot be added to a bill.",
        confirmButtonColor: "#2563eb",
      });
      return;
    }

    if (medicine.stock <= 0) {
      Swal.fire({
        icon: "warning",
        title: "Out of Stock",
        text: "This medicine is currently out of stock.",
        confirmButtonColor: "#2563eb",
      });
      return;
    }

    const existingIndex = billItems.findIndex(
      (item) => item.medicine_id === medicine.id || item.id === medicine.id
    );

    if (existingIndex !== -1) {
      const existing = billItems[existingIndex];
      const maxStock = medicine.stock ?? existing.stock ?? 9999;
      if (existing.quantity >= maxStock) {
        Swal.fire({
          icon: "warning",
          title: "Maximum Stock Reached",
          text: `All available inventory (${maxStock} units) already added to bill.`,
          confirmButtonColor: "#2563eb",
        });
        return;
      }
      increaseQuantity(existing.id);
    } else {
      const newItem = calculateLineItem(
        {
          medicine_id: medicine.id,
          id: medicine.id,
          name: medicine.name,
          batch: medicine.batch,
          price: Number(medicine.price),
          gst: 0,
          stock: Number(medicine.stock),
          expiry: medicine.expiry,
          category: medicine.category,
        },
        1,
        0
      );
      setBillItems([...billItems, newItem]);
    }

    setSearch("");
    setIsSearchOpen(false);
    setHighlightedIndex(-1);
    setSelectedMedicine(null);
    setTimeout(() => {
      searchInputRef.current?.focus();
    }, 50);
  };

  const increaseQuantity = (id) => {
    setBillItems((prev) =>
      prev.map((item) => {
        if (item.id !== id) return item;
        const maxStock = item.stock != null ? item.stock : 9999;
        if (item.quantity >= maxStock) {
          Swal.fire({
            icon: "warning",
            title: "Stock Limit Reached",
            text: `Only ${maxStock} units available in stock.`,
            timer: 1500,
            showConfirmButton: false,
          });
          return item;
        }
        return calculateLineItem(item, item.quantity + 1);
      })
    );
  };

  const decreaseQuantity = (id) => {
    setBillItems((prev) =>
      prev.map((item) => {
        if (item.id !== id) return item;
        if (item.quantity <= 1) return item;
        return calculateLineItem(item, item.quantity - 1);
      })
    );
  };

  const updateItemQuantity = (id, newQty) => {
    setBillItems((prev) =>
      prev.map((item) => {
        if (item.id !== id) return item;
        const maxStock = item.stock != null ? item.stock : 9999;
        if (newQty === "" || newQty === null) {
          return { ...item, quantity: "" };
        }
        let qty = parseInt(newQty, 10);
        if (isNaN(qty) || qty < 1) qty = 1;
        if (qty > maxStock) {
          qty = maxStock;
          Swal.fire({
            icon: "warning",
            title: "Stock Limit Reached",
            text: `Quantity adjusted to maximum available stock (${maxStock} units).`,
            timer: 1500,
            showConfirmButton: false,
          });
        }
        return calculateLineItem(item, qty);
      })
    );
  };

  const handleQuantityBlur = (id, currentVal) => {
    let qty = parseInt(currentVal, 10);
    if (isNaN(qty) || qty < 1) qty = 1;
    setBillItems((prev) =>
      prev.map((item) => (item.id === id ? calculateLineItem(item, qty) : item))
    );
  };

  const updateItemDiscount = (id, newDisc) => {
    setBillItems((prev) =>
      prev.map((item) => {
        if (item.id !== id) return item;
        let disc = parseFloat(newDisc);
        if (isNaN(disc) || disc < 0) disc = 0;
        if (disc > 100) disc = 100;
        return calculateLineItem(item, item.quantity || 1, disc);
      })
    );
  };

  const removeItem = (id) => {
    setBillItems((prev) => prev.filter((item) => item.id !== id));
  };

  const handlePatientSelect = (e) => {
    const patientId = e.target.value;
    setSelectedPatientId(patientId);
    const selectedPatient = patients.find(
      (p) => String(p.patient_id || p.id) === String(patientId)
    );

    if (selectedPatient) {
      setPatient({
        patientId: selectedPatient.patient_id || selectedPatient.id,
        name: selectedPatient.patient_name || "",
        mobile: selectedPatient.mobile_number || "",
        age: selectedPatient.age || "",
        gender: selectedPatient.gender || "",
        doctorName: selectedPatient.doctor_name || "",
        prescriptionNumber: selectedPatient.prescription_number || "",
        address: selectedPatient.address || "",
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
        address: "",
      });
    }
  };

  // Helper to calculate totals for any bill items list (GST removed)
  const calculateItemsTotals = (items = []) => {
    let subtotal = 0;
    let discountTotal = 0;
    let grandTotal = 0;

    items.forEach((item) => {
      subtotal += item.subtotal || 0;
      discountTotal += item.discountAmount || 0;
      grandTotal += item.total || 0;
    });

    return {
      subtotal,
      gstTotal: 0,
      discountTotal,
      grandTotal,
    };
  };

  const totals = useMemo(() => {
    return calculateItemsTotals(billItems);
  }, [billItems]);

  const sessionGrandTotal = useMemo(() => {
    return bills.reduce(
      (sum, b) => sum + calculateItemsTotals(b.billItems).grandTotal,
      0
    );
  }, [bills]);

  // Direct patient registration handler
  const handleRegisterPatient = async (e) => {
    e.preventDefault();
    const errs = {};
    if (!newPatient.name.trim()) errs.name = "Patient full name is required";
    const cleanMobile = newPatient.mobile.replace(/\D/g, "");
    if (!cleanMobile) {
      errs.mobile = "Mobile number is required";
    } else if (cleanMobile.length !== 10) {
      errs.mobile = "Please enter a valid 10-digit mobile number";
    }

    if (Object.keys(errs).length > 0) {
      setPatientErrors(errs);
      return;
    }

    // Check duplicate
    const existing = patients.find(
      (p) =>
        String(p.mobile_number || p.mobile || "").replace(/\D/g, "") === cleanMobile
    );

    if (existing) {
      const confirmUse = await Swal.fire({
        title: "Patient Already Registered",
        text: `A patient "${existing.patient_name}" is already registered with mobile ${cleanMobile}. Would you like to select this existing patient?`,
        icon: "info",
        showCancelButton: true,
        confirmButtonText: "Yes, Select Patient",
        cancelButtonText: "Register Anyway",
        confirmButtonColor: "#2563eb",
      });

      if (confirmUse.isConfirmed) {
        handlePatientSelect({
          target: { value: existing.patient_id || existing.id },
        });
        setIsPatientModalOpen(false);
        return;
      }
    }

    try {
      setIsRegisteringPatient(true);
      const patientPayload = {
        patient_name: newPatient.name.trim(),
        mobile_number: cleanMobile,
        age: newPatient.age ? Number(newPatient.age) : null,
        gender: newPatient.gender || null,
        address: newPatient.address.trim() || null,
        doctor_name: newPatient.doctorName.trim() || null,
        prescription_number: newPatient.prescriptionNumber.trim() || null,
        reminders_enabled: 1,
      };

      const res = await apiClient.post("/patients", patientPayload);
      if (res.data?.success) {
        const created = res.data.data;
        const patId = created.patient_id || created.id;
        setPatients((prev) => [created, ...prev]);

        // Auto-populate active bill
        setSelectedPatientId(String(patId));
        setPatient({
          patientId: patId,
          name: created.patient_name || newPatient.name,
          mobile: created.mobile_number || cleanMobile,
          age: created.age || newPatient.age || "",
          gender: created.gender || newPatient.gender || "",
          doctorName: created.doctor_name || newPatient.doctorName || "",
          prescriptionNumber:
            created.prescription_number || newPatient.prescriptionNumber || "",
        });

        setIsPatientModalOpen(false);
        setNewPatient({
          name: "",
          mobile: "",
          age: "",
          gender: "Male",
          address: "",
          doctorName: "",
          prescriptionNumber: "",
        });
        setPatientErrors({});

        Swal.fire({
          icon: "success",
          title: "Patient Registered",
          text: `${created.patient_name} registered and selected for billing.`,
          timer: 2000,
          showConfirmButton: false,
        });
      }
    } catch (err) {
      console.error(err);
      Swal.fire({
        icon: "error",
        title: "Registration Failed",
        text:
          err.response?.data?.message ||
          err.message ||
          "Failed to register patient",
        confirmButtonColor: "#2563eb",
      });
    } finally {
      setIsRegisteringPatient(false);
    }
  };

  const generateBillData = (billToUse = activeBill) => {
    const pat = billToUse.patient;
    const items = billToUse.billItems;

    if (!pat.patientId && !pat.name) {
      Swal.fire({
        icon: "warning",
        title: "Patient Required",
        text: "Please select or register a patient before billing.",
        confirmButtonColor: "#2563eb",
      });
      return null;
    }

    if (items.length === 0) {
      Swal.fire({
        icon: "warning",
        title: "No Medicines Added",
        text: "Please add at least one medicine to the bill.",
        confirmButtonColor: "#2563eb",
      });
      return null;
    }

    const bTotals = calculateItemsTotals(items);

    return {
      invoiceNo: billToUse.invoiceNo || `INV-${Date.now()}`,
      date: new Date().toLocaleString(),
      patient: pat,
      medicines: items,
      paymentMode: billToUse.paymentMode,
      totals: bTotals,
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
          patient_id: billData.patient.patientId || "",
          patient_name: billData.patient.name || "",
          mobile_number: billData.patient.mobile || "",
          address: billData.patient.address || "",
          doctor_name: billData.patient.doctorName || "",
          prescription_number: billData.patient.prescriptionNumber || "",
          age: billData.patient.age || "",
          gender: billData.patient.gender || "",
          bill_number: isEditingBill ? editingBillNumber : billData.invoiceNo,
          subtotal: billData.totals.subtotal,
          total_discount: billData.totals.discountTotal,
          total_gst: 0,
          grand_total: billData.totals.grandTotal,
          payment_mode: billData.paymentMode,
          payment_status: "Completed",
          notes: isEditingBill ? "Updated via Bill Editor" : "",
        },
        items: billData.medicines.map((m) => ({
          medicine_id: m.medicine_id || m.id,
          name: m.name || m.medicine_name || "Medicine",
          batch: m.batch || m.batch_number || "-",
          quantity: Number(m.quantity || 1),
          price: Number(m.price || 0),
          gst: 0,
          discount: Number(m.discount || 0),
          total: Number(m.total || 0),
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
          if (res.data.data?.patient) {
            const registeredPat = res.data.data.patient;
            setPatients((prev) => [
              registeredPat,
              ...prev.filter(
                (p) => String(p.patient_id || p.id) !== String(registeredPat.patient_id || registeredPat.id)
              ),
            ]);
          }
          fetchPatients();

          Swal.fire({
            icon: "success",
            title: "Bill Generated",
            text: `Invoice #${billData.invoiceNo} saved and inventory stock updated successfully!`,
            confirmButtonColor: "#2563eb",
          });

          // If in multi-bill session with multiple bills, remove completed bill or reset
          if (bills.length > 1) {
            removePatientBill(activeBillIndex);
          } else {
            setBillItems([]);
            setPatient({
              patientId: "",
              name: "",
              mobile: "",
              age: "",
              gender: "",
              doctorName: "",
              prescriptionNumber: "",
              address: "",
            });
            setSelectedPatientId("");
          }
          fetchMedicines();
        }
      }
    } catch (error) {
      console.error(error);
      Swal.fire({
        icon: "error",
        title: isEditingBill ? "Error Updating Bill" : "Error Generating Bill",
        text:
          error.response?.data?.message || "Failed to save bill to database",
        confirmButtonColor: "#2563eb",
      });
    }
  };

  // Generate All Bills in Multi-Patient Session
  const generateAllSessionBills = async () => {
    for (let i = 0; i < bills.length; i++) {
      const b = bills[i];
      if (!b.patient.patientId && !b.patient.name) {
        setActiveBillIndex(i);
        return Swal.fire({
          icon: "warning",
          title: `Patient Missing (Bill #${i + 1})`,
          text: `Please select or register patient details for Bill #${i + 1}.`,
          confirmButtonColor: "#2563eb",
        });
      }
      if (b.billItems.length === 0) {
        setActiveBillIndex(i);
        return Swal.fire({
          icon: "warning",
          title: `No Medicines Added (Bill #${i + 1})`,
          text: `Please add at least one medicine to Bill #${i + 1}.`,
          confirmButtonColor: "#2563eb",
        });
      }
    }

    // Validate inventory stock across all bills combined
    const requestedStockMap = {};
    bills.forEach((b) => {
      b.billItems.forEach((it) => {
        const medId = it.medicine_id || it.id;
        requestedStockMap[medId] =
          (requestedStockMap[medId] || 0) + Number(it.quantity || 1);
      });
    });

    for (const [medId, requestedQty] of Object.entries(requestedStockMap)) {
      const med = medicinesData.find(
        (m) => String(m.id || m.medicine_id) === String(medId)
      );
      if (med && requestedQty > med.stock) {
        return Swal.fire({
          icon: "error",
          title: "Insufficient Stock",
          text: `Combined requested quantity for "${med.name}" (${requestedQty}) exceeds available inventory (${med.stock}).`,
          confirmButtonColor: "#2563eb",
        });
      }
    }

    try {
      setIsSavingAll(true);
      const generatedResults = [];

      for (let i = 0; i < bills.length; i++) {
        const b = bills[i];
        const bTotals = calculateItemsTotals(b.billItems);
        const payload = {
          bill: {
            patient_id: b.patient.patientId || "",
            patient_name: b.patient.name || "",
            mobile_number: b.patient.mobile || "",
            address: b.patient.address || "",
            doctor_name: b.patient.doctorName || "",
            prescription_number: b.patient.prescriptionNumber || "",
            age: b.patient.age || "",
            gender: b.patient.gender || "",
            bill_number: b.invoiceNo,
            subtotal: bTotals.subtotal,
            total_discount: bTotals.discountTotal,
            total_gst: 0,
            grand_total: bTotals.grandTotal,
            payment_mode: b.paymentMode,
            payment_status: "Completed",
            notes: `Generated in Multi-Bill Session (${i + 1} of ${bills.length})`,
          },
          items: b.billItems.map((m) => ({
            medicine_id: m.medicine_id || m.id,
            name: m.name || m.medicine_name || "Medicine",
            batch: m.batch || m.batch_number || "-",
            quantity: Number(m.quantity || 1),
            price: Number(m.price || 0),
            gst: 0,
            discount: Number(m.discount || 0),
            total: Number(m.total || 0),
          })),
        };

        const res = await apiClient.post("/bills", payload);
        if (res.data?.success) {
          generatedResults.push({
            invoiceNo: b.invoiceNo,
            patientName: b.patient.name || "Patient",
            itemCount: b.billItems.length,
            grandTotal: bTotals.grandTotal,
            paymentMode: b.paymentMode,
            billData: {
              invoiceNo: b.invoiceNo,
              date: new Date().toLocaleString(),
              patient: b.patient,
              medicines: b.billItems,
              paymentMode: b.paymentMode,
              totals: bTotals,
            },
          });
        }
      }

      // Refresh patients & stock
      fetchPatients();
      fetchMedicines();

      // Show Session Summary
      setSessionSummary({
        bills: generatedResults,
        totalPatients: generatedResults.length,
        sessionTotal: generatedResults.reduce((s, r) => s + r.grandTotal, 0),
      });

      // Reset bills list to fresh bill
      setBills([createNewBillSession(1)]);
      setActiveBillIndex(0);
    } catch (err) {
      console.error(err);
      Swal.fire({
        icon: "error",
        title: "Session Billing Failed",
        text:
          err.response?.data?.message ||
          err.message ||
          "Failed to complete multi-bill session.",
        confirmButtonColor: "#2563eb",
      });
    } finally {
      setIsSavingAll(false);
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
      const total = subtotal - discountAmount;

      return {
        ...item,
        quantity: qty,
        discount: disc,
        gst: 0,
        subtotal,
        discountAmount,
        gstAmount: 0,
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

  // Preview calculations for selected medicine (GST removed)
  const livePreview = useMemo(() => {
    if (!selectedMedicine) return null;
    const p = Number(selectedMedicine.price) || 0;
    const q = Number(quantity) || 0;
    const d = Number(discount) || 0;
    const sub = p * q;
    const dAmt = (sub * d) / 100;
    const tot = sub - dAmt;
    return { subtotal: sub, discountAmount: dAmt, gstAmount: 0, total: tot };
  }, [selectedMedicine, quantity, discount]);

  return (
    <div className="p-3 sm:p-6 lg:p-8 max-w-[1600px] mx-auto space-y-5 sm:space-y-6">
      {/* 1. HEADER SECTION */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <span>New Billing</span>
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-xs sm:text-sm mt-0.5">
            Create patient prescriptions, calculate taxes & discounts, and generate invoices.
          </p>
        </div>

        <div className="flex items-center gap-2 sm:gap-2.5 flex-wrap">
          {billItems.length > 0 && (
            <button
              onClick={clearCart}
              className="inline-flex items-center gap-1.5 px-3 py-2 sm:px-3.5 sm:py-2.5 bg-white dark:bg-slate-900 hover:bg-rose-50 dark:hover:bg-rose-950/30 border border-slate-200 dark:border-slate-700 hover:border-rose-200 dark:hover:border-rose-900 text-rose-600 dark:text-rose-400 rounded-xl text-xs sm:text-sm font-semibold shadow-xs transition-colors"
            >
              <RotateCcw size={15} />
              <span>Clear Cart</span>
            </button>
          )}
          <Link
            to="/billing-history"
            className="inline-flex items-center gap-1.5 sm:gap-2 px-3 py-2 sm:px-4 sm:py-2.5 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 rounded-xl text-xs sm:text-sm font-semibold shadow-xs transition-colors"
          >
            <History size={16} className="text-slate-500 dark:text-slate-400" />
            <span>Bill History</span>
          </Link>
          <Link
            to="/patients"
            className="inline-flex items-center gap-1.5 sm:gap-2 px-3 py-2 sm:px-4 sm:py-2.5 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 rounded-xl text-xs sm:text-sm font-semibold shadow-xs transition-colors"
          >
            <Users size={16} className="text-slate-500 dark:text-slate-400" />
            <span>Patients</span>
          </Link>
        </div>
      </div>

      {/* EDIT MODE BANNER */}
      {isEditingBill && (
        <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/60 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-amber-100 dark:bg-amber-900/60 text-amber-800 dark:text-amber-300 shrink-0">
              <Edit size={20} />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-amber-200/80 dark:bg-amber-800/80 text-amber-900 dark:text-amber-100">
                  Editing Mode
                </span>
                <h3 className="text-sm font-bold text-amber-950 dark:text-amber-200">
                  Invoice #{editingBillNumber}
                </h3>
              </div>
              <p className="text-xs text-amber-700 dark:text-amber-400 mt-0.5">
                Saving updates will synchronize stock (restoring previous items and deducting newly selected medicines).
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={exitEditMode}
              className="w-full sm:w-auto px-4 py-2 bg-white dark:bg-slate-900 hover:bg-amber-100/60 dark:hover:bg-amber-950/50 border border-amber-300 dark:border-amber-700 text-amber-900 dark:text-amber-300 rounded-xl text-xs font-bold transition-colors shadow-2xs text-center"
            >
              Cancel Edit & New Bill
            </button>
          </div>
        </div>
      )}

      {/* MULTI-PATIENT BILLING SESSION TABS */}
      {!isEditingBill && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-3.5 sm:p-4 border border-slate-200/90 dark:border-slate-800 shadow-xs space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <Layers size={14} className="text-blue-600 dark:text-blue-400" />
                Multi-Patient Session:
              </span>
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                {bills.length} {bills.length === 1 ? "Patient Bill" : "Patient Bills"}
              </span>
              <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                • Combined Total: <strong className="text-slate-900 dark:text-white font-bold">₹{sessionGrandTotal.toFixed(2)}</strong>
              </span>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              {bills.length > 1 && (
                <button
                  type="button"
                  onClick={generateAllSessionBills}
                  disabled={isSavingAll}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 dark:disabled:bg-slate-700 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors"
                >
                  <CheckCircle2 size={14} />
                  <span>{isSavingAll ? "Saving All..." : `Save All (${bills.length}) Bills`}</span>
                </button>
              )}
              <button
                type="button"
                onClick={addNewPatientBill}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 dark:bg-blue-950/40 hover:bg-blue-100 dark:hover:bg-blue-900/50 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 rounded-xl text-xs font-semibold shadow-2xs transition-colors"
              >
                <Plus size={14} />
                <span>Add Patient Bill</span>
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-1 pt-0.5 scrollbar-thin">
            {bills.map((b, idx) => {
              const isActive = idx === activeBillIndex;
              const bTot = calculateItemsTotals(b.billItems);
              const pName = b.patient?.name || `Patient #${idx + 1}`;
              return (
                <div
                  key={b.sessionKey || idx}
                  onClick={() => setActiveBillIndex(idx)}
                  className={`group flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold cursor-pointer border transition-all shrink-0 select-none ${isActive
                    ? "bg-blue-600 text-white border-blue-600 shadow-xs"
                    : "bg-slate-50 dark:bg-slate-800/60 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700"
                    }`}
                >
                  <div className="flex items-center gap-1.5">
                    <User size={13} className={isActive ? "text-blue-100" : "text-slate-400 dark:text-slate-500"} />
                    <span className="max-w-[120px] truncate">{pName}</span>
                    <span
                      className={`text-[10px] px-1.5 py-0.2 rounded font-mono ${isActive ? "bg-blue-700/80 text-white" : "bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200"
                        }`}
                    >
                      {b.billItems.length}
                    </span>
                    <span className="font-bold">₹{bTot.grandTotal.toFixed(0)}</span>
                  </div>
                  {bills.length > 1 && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        removePatientBill(idx);
                      }}
                      className={`p-0.5 rounded transition-colors ${isActive ? "text-blue-200 hover:bg-blue-700 hover:text-white" : "text-slate-400 dark:text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-700 hover:text-rose-600 dark:hover:text-rose-400"
                        }`}
                      title="Remove patient bill from session"
                    >
                      <X size={13} />
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 2. MAIN WORKSPACE (2-COLUMN GRID) */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
        {/* LEFT WORKSPACE (8 COLS) */}
        <div className="xl:col-span-8 space-y-6">
          {/* PATIENT DETAILS CARD */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 sm:p-5 md:p-6 border border-slate-200/90 dark:border-slate-800 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 gap-3">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 border border-blue-100 dark:border-blue-900/50 shrink-0">
                  <User size={18} />
                </div>
                <div>
                  <h2 className="text-base font-bold text-slate-900 dark:text-white">
                    Patient Details
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Select a registered patient to auto-populate billing information.
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsPatientModalOpen(true)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 dark:bg-blue-950/40 hover:bg-blue-100 dark:hover:bg-blue-900/50 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800 rounded-xl text-xs font-semibold transition-colors"
                >
                  <UserPlus size={13} />
                  <span>Register New Patient</span>
                </button>
                <Link
                  to="/patients"
                  className="text-xs font-medium text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:underline hidden sm:inline"
                >
                  Directory
                </Link>
              </div>
            </div>

            {/* Patient Selector */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                  Select Registered Patient
                </label>
                {selectedPatientId && (
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedPatientId("");
                      setPatient({
                        patientId: "",
                        name: "",
                        mobile: "",
                        age: "",
                        gender: "",
                        doctorName: "",
                        prescriptionNumber: "",
                        address: "",
                      });
                    }}
                    className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline"
                  >
                    + Switch to Manual / New Patient
                  </button>
                )}
              </div>
              <select
                value={selectedPatientId}
                onChange={handlePatientSelect}
                className="w-full bg-slate-50/60 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium"
              >
                <option value="">-- Choose registered patient (or enter details manually below) --</option>
                {patients.map((p) => (
                  <option key={p.patient_id || p.id} value={p.patient_id || p.id} className="dark:bg-slate-900 dark:text-white">
                    {p.patient_name} — {p.mobile_number} {p.age ? `(${p.age}y)` : ""}
                  </option>
                ))}
              </select>
            </div>

            {/* Editable Patient Details Grid */}
            <div className="space-y-3 pt-1">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                  <span className={`w-2 h-2 rounded-full ${selectedPatientId ? "bg-blue-500" : "bg-emerald-500"}`}></span>
                  {selectedPatientId ? "Registered Patient Details (Prefilled)" : "Patient Details (Manual Entry)"}
                </span>
                {!selectedPatientId && (
                  <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2.5 py-0.5 rounded-full border border-emerald-100 dark:border-emerald-900/40">
                    Will Auto-Register in System on Billing
                  </span>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                <div className="w-full">
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Patient Name <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <User size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 pointer-events-none" />
                    <input
                      type="text"
                      placeholder="e.g. Ramesh Kumar"
                      value={patient.name || ""}
                      onChange={(e) => setPatient((prev) => ({ ...prev, name: e.target.value }))}
                      className="w-full bg-slate-50/70 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 rounded-xl pl-8 pr-3 py-2 text-xs sm:text-sm font-semibold text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                    />
                  </div>
                </div>

                <div className="w-full">
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Mobile Number
                  </label>
                  <div className="relative">
                    <Phone size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 pointer-events-none" />
                    <input
                      type="tel"
                      maxLength={10}
                      placeholder="10-digit mobile"
                      value={patient.mobile || ""}
                      onChange={(e) => setPatient((prev) => ({ ...prev, mobile: e.target.value }))}
                      className="w-full bg-slate-50/70 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 rounded-xl pl-8 pr-3 py-2 text-xs sm:text-sm font-semibold text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                    />
                  </div>
                </div>

                <div className="w-full">
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Age & Gender
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="number"
                      placeholder="Age"
                      min="0"
                      max="125"
                      value={patient.age || ""}
                      onChange={(e) => setPatient((prev) => ({ ...prev, age: e.target.value }))}
                      className="w-full bg-slate-50/70 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 rounded-xl px-2.5 py-2 text-xs sm:text-sm font-semibold text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                    />
                    <select
                      value={patient.gender || ""}
                      onChange={(e) => setPatient((prev) => ({ ...prev, gender: e.target.value }))}
                      className="w-full bg-slate-50/70 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 rounded-xl px-2 py-2 text-xs font-semibold text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                    >
                      <option value="" className="dark:bg-slate-900">Gender</option>
                      <option value="Male" className="dark:bg-slate-900">Male</option>
                      <option value="Female" className="dark:bg-slate-900">Female</option>
                      <option value="Other" className="dark:bg-slate-900">Other</option>
                    </select>
                  </div>
                </div>

                <div className="w-full">
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Prescribed By (Doctor)
                  </label>
                  <div className="relative">
                    <Stethoscope size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 pointer-events-none" />
                    <input
                      type="text"
                      placeholder="Doctor Name / Self"
                      value={patient.doctorName || ""}
                      onChange={(e) => setPatient((prev) => ({ ...prev, doctorName: e.target.value }))}
                      className="w-full bg-slate-50/70 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 rounded-xl pl-8 pr-3 py-2 text-xs sm:text-sm font-semibold text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                    />
                  </div>
                </div>

                <div className="w-full">
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Prescription Number
                  </label>
                  <div className="relative">
                    <FileText size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 pointer-events-none" />
                    <input
                      type="text"
                      placeholder="Rx Number (Optional)"
                      value={patient.prescriptionNumber || ""}
                      onChange={(e) => setPatient((prev) => ({ ...prev, prescriptionNumber: e.target.value }))}
                      className="w-full bg-slate-50/70 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 rounded-xl pl-8 pr-3 py-2 text-xs sm:text-sm font-mono font-semibold text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                    />
                  </div>
                </div>

                <div className="sm:col-span-2 md:col-span-3">
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Patient Address (Optional)
                  </label>
                  <div className="relative">
                    <MapPin size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 pointer-events-none" />
                    <input
                      type="text"
                      placeholder="Address or locality details"
                      value={patient.address || ""}
                      onChange={(e) => setPatient((prev) => ({ ...prev, address: e.target.value }))}
                      className="w-full bg-slate-50/70 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 rounded-xl pl-8 pr-3 py-2 text-xs sm:text-sm font-semibold text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ADD MEDICINE CARD */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 sm:p-5 md:p-6 border border-slate-200/90 dark:border-slate-800 shadow-xs space-y-4 relative z-20">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-900/50 shrink-0">
                  <Search size={18} />
                </div>
                <div>
                  <h2 className="text-base font-bold text-slate-900 dark:text-white">
                    Add Medicines
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Search medicine catalog by name, check stock availability, and apply line discounts.
                  </p>
                </div>
              </div>
              <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 shrink-0">
                {medicinesData.length} in Catalog
              </span>
            </div>

            {/* Search Input with Popover Dropdown */}
            <div className="relative" ref={searchRef}>
              <div className="flex items-center justify-between mb-1.5 gap-2">
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                  Search Medicine
                </label>
                <span className="hidden sm:inline-block text-[11px] text-slate-400 dark:text-slate-500 font-medium">
                  Use <kbd className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-mono text-[10px]">↑</kbd> <kbd className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-mono text-[10px]">↓</kbd> to navigate, <kbd className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-mono text-[10px]">Enter</kbd> to pick
                </span>
              </div>
              <div className="relative">
                <Search
                  size={16}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 pointer-events-none"
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
                  className="w-full bg-slate-50/60 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl pl-10 pr-10 py-2.5 text-sm text-slate-800 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium"
                />
                {search && (
                  <button
                    type="button"
                    onClick={() => {
                      setSearch("");
                      setIsSearchOpen(false);
                      setHighlightedIndex(-1);
                    }}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1"
                  >
                    <X size={15} />
                  </button>
                )}
              </div>

              {/* Autocomplete Dropdown with Keyboard & Mouse Support */}
              {isSearchOpen && search.trim() && (
                <div
                  ref={dropdownListRef}
                  className="absolute left-0 right-0 top-full mt-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-750 rounded-2xl shadow-xl w-full max-h-72 overflow-y-auto z-50 divide-y divide-slate-100 dark:divide-slate-800 scrollbar-thin"
                >
                  {loading ? (
                    <div className="p-4 text-center text-xs text-slate-500 dark:text-slate-400 font-medium">
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
                          className={`w-full text-left p-3.5 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-3 ${isHighlighted
                            ? "bg-blue-50/90 dark:bg-blue-950/60 text-blue-900 dark:text-blue-100 border-l-4 border-blue-600 dark:border-blue-500 pl-2.5"
                            : "hover:bg-slate-50 dark:hover:bg-slate-800/70 text-slate-800 dark:text-slate-200"
                            }`}
                        >
                          <div className="min-w-0 flex-1">
                            <div className="font-semibold text-sm flex items-center gap-2 flex-wrap">
                              <span className="text-slate-900 dark:text-white">{medicine.name}</span>
                              {medicine.batch && (
                                <span className="font-mono text-[11px] font-normal px-1.5 py-0.2 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200/60 dark:border-slate-700 rounded">
                                  {medicine.batch}
                                </span>
                              )}
                            </div>
                            <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 flex items-center gap-2 flex-wrap">
                              <span>Stock: {medicine.stock} units</span>
                              {medicine.expiry && (
                                <>
                                  <span>•</span>
                                  <span className={expired ? "text-rose-600 dark:text-rose-400 font-medium" : ""}>
                                    Exp: {new Date(medicine.expiry).toLocaleDateString("en-IN", { month: "short", year: "numeric" })}
                                  </span>
                                </>
                              )}
                            </div>
                          </div>

                          <div className="sm:text-right shrink-0 flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-2 sm:gap-0 pt-1 sm:pt-0 border-t sm:border-t-0 border-slate-100/60 dark:border-slate-800/60">
                            <div>
                              <div className="font-bold text-slate-900 dark:text-white text-sm">
                                ₹{medicine.price.toFixed(2)}
                              </div>
                              <span className="text-[10px] text-slate-400 dark:text-slate-500 block font-normal -mt-0.5">
                                per tablet
                              </span>
                            </div>
                            {outOfStock ? (
                              <span className="text-[11px] font-semibold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 px-2 py-0.5 rounded-full border border-rose-100 dark:border-rose-900/50 mt-0.5 inline-block">
                                Out of Stock
                              </span>
                            ) : expired ? (
                              <span className="text-[11px] font-semibold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 px-2 py-0.5 rounded-full border border-rose-100 dark:border-rose-900/50 mt-0.5 inline-block">
                                Expired
                              </span>
                            ) : medicine.stock <= 10 ? (
                              <span className="text-[11px] font-semibold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 px-2 py-0.5 rounded-full border border-amber-100 dark:border-amber-900/50 mt-0.5 inline-block">
                                Low ({medicine.stock})
                              </span>
                            ) : (
                              <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-full border border-emerald-100 dark:border-emerald-900/50 mt-0.5 inline-block">
                                In Stock
                              </span>
                            )}
                          </div>
                        </button>
                      );
                    })
                  ) : (
                    <div className="p-4 text-center text-xs text-slate-500 dark:text-slate-400 font-medium">
                      No medicines matching "{search}" found
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* MEDICINES TABULAR LIST */}
            <div className="pt-2">
              <div className="flex items-center justify-between pb-3">
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                    <span>Selected Medicines</span>
                    <span className="px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 text-xs font-semibold border border-blue-100 dark:border-blue-900/40">
                      {billItems.length} {billItems.length === 1 ? "item" : "items"}
                    </span>
                  </h3>
                </div>
                {billItems.length > 0 && (
                  <span className="text-xs text-slate-500 dark:text-slate-400">
                    Total Units: <strong className="text-slate-800 dark:text-slate-200">{billItems.reduce((acc, i) => acc + (Number(i.quantity) || 0), 0)}</strong>
                  </span>
                )}
              </div>

              <div className="border border-slate-200/90 dark:border-slate-800 rounded-2xl overflow-hidden bg-white dark:bg-slate-900">
                <div className="overflow-x-auto scrollbar-thin">
                  <table className="w-full text-left border-collapse min-w-[650px]">
                    <thead>
                      <tr className="border-b border-slate-100 dark:border-slate-800 text-[11px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider bg-slate-50/80 dark:bg-slate-800/60">
                        <th className="py-3 px-3 sm:px-4 w-10 text-center">#</th>
                        <th className="py-3 px-3 sm:px-4">Medicine & Details</th>
                        <th className="py-3 px-3 sm:px-4 text-right">Price / Tab</th>
                        <th className="py-3 px-3 sm:px-4 text-center w-36">Quantity</th>
                        <th className="py-3 px-3 sm:px-4 text-right w-24">Discount</th>
                        <th className="py-3 px-3 sm:px-4 text-right">Total</th>
                        <th className="py-3 px-3 sm:px-4 text-center w-16">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-sm">
                      {billItems.map((item, index) => {
                        const isOutOfMaxStock = item.stock != null && item.quantity >= item.stock;
                        const isMinQty = (Number(item.quantity) || 1) <= 1;

                        return (
                          <tr
                            key={item.id}
                            className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors"
                          >
                            <td className="py-3 px-3 sm:px-4 text-center text-xs font-medium text-slate-400 dark:text-slate-500">
                              {index + 1}
                            </td>
                            <td className="py-3 px-3 sm:px-4">
                              <div className="font-semibold text-slate-900 dark:text-white text-sm">
                                {item.name}
                              </div>
                              <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                                {item.batch && (
                                  <span className="font-mono text-[11px] px-1.5 py-0.2 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200/70 dark:border-slate-700 rounded">
                                    Batch: {item.batch}
                                  </span>
                                )}
                                {item.stock != null && (
                                  <span
                                    className={`text-[11px] font-medium ${
                                      item.stock <= 10
                                        ? "text-amber-600 dark:text-amber-400"
                                        : "text-slate-500 dark:text-slate-400"
                                    }`}
                                  >
                                    Stock: {item.stock}
                                  </span>
                                )}
                                {item.expiry && (
                                  <span className="text-[11px] text-slate-400 dark:text-slate-500">
                                    Exp: {new Date(item.expiry).toLocaleDateString("en-IN", { month: "short", year: "numeric" })}
                                  </span>
                                )}
                              </div>
                            </td>
                            <td className="py-3 px-3 sm:px-4 text-right text-slate-700 dark:text-slate-200 font-semibold">
                              ₹{Number(item.price).toFixed(2)}
                              <span className="text-[10px] text-slate-400 dark:text-slate-500 block font-normal">/ tab</span>
                            </td>
                            <td className="py-3 px-3 sm:px-4 text-center">
                              <div className="inline-flex items-center justify-center border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50/90 dark:bg-slate-800/90 p-0.5 shadow-2xs">
                                <button
                                  type="button"
                                  onClick={() => decreaseQuantity(item.id)}
                                  disabled={isMinQty}
                                  className={`p-1.5 rounded-lg transition-colors ${
                                    isMinQty
                                      ? "text-slate-300 dark:text-slate-600 cursor-not-allowed"
                                      : "text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-700 hover:text-blue-600 dark:hover:text-blue-400 active:scale-95"
                                  }`}
                                  title="Decrease Quantity"
                                >
                                  <Minus size={13} />
                                </button>
                                <input
                                  type="number"
                                  min="1"
                                  max={item.stock || 9999}
                                  value={item.quantity}
                                  onChange={(e) => updateItemQuantity(item.id, e.target.value)}
                                  onBlur={(e) => handleQuantityBlur(item.id, e.target.value)}
                                  className="w-12 text-center bg-transparent text-slate-900 dark:text-white font-bold text-xs sm:text-sm focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                />
                                <button
                                  type="button"
                                  onClick={() => increaseQuantity(item.id)}
                                  disabled={isOutOfMaxStock}
                                  className={`p-1.5 rounded-lg transition-colors ${
                                    isOutOfMaxStock
                                      ? "text-slate-300 dark:text-slate-600 cursor-not-allowed"
                                      : "text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-700 hover:text-blue-600 dark:hover:text-blue-400 active:scale-95"
                                  }`}
                                  title={
                                    isOutOfMaxStock
                                      ? `Max available stock reached (${item.stock})`
                                      : "Increase Quantity"
                                  }
                                >
                                  <Plus size={13} />
                                </button>
                              </div>
                            </td>
                            <td className="py-3 px-3 sm:px-4 text-right">
                              <div className="inline-flex items-center justify-end gap-1">
                                <input
                                  type="number"
                                  min="0"
                                  max="100"
                                  step="1"
                                  value={item.discount ?? 0}
                                  onChange={(e) => updateItemDiscount(item.id, e.target.value)}
                                  className="w-12 text-right bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-1.5 py-1 text-xs font-semibold text-slate-800 dark:text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                                />
                                <span className="text-xs text-slate-400 dark:text-slate-500">%</span>
                              </div>
                              {item.discountAmount > 0 && (
                                <div className="text-[11px] text-rose-500/90 dark:text-rose-400/90 mt-0.5">
                                  -₹{Number(item.discountAmount).toFixed(2)}
                                </div>
                              )}
                            </td>
                            <td className="py-3 px-3 sm:px-4 text-right font-bold text-slate-900 dark:text-white">
                              ₹{Number(item.total || 0).toFixed(2)}
                            </td>
                            <td className="py-3 px-3 sm:px-4 text-center">
                              <button
                                type="button"
                                onClick={() => removeItem(item.id)}
                                className="p-1.5 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-xl transition-colors active:scale-95"
                                title="Delete row from table"
                              >
                                <Trash2 size={16} />
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>

                  {billItems.length === 0 && (
                    <div className="text-center py-10 px-4 space-y-2 bg-slate-50/40 dark:bg-slate-850/40">
                      <div className="w-11 h-11 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 mx-auto flex items-center justify-center">
                        <Package size={20} />
                      </div>
                      <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                        No medicines added to bill yet
                      </p>
                      <p className="text-xs text-slate-400 dark:text-slate-500 max-w-sm mx-auto">
                        Search and select medicines from the dropdown above to add them to this table.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT CHECKOUT SIDEBAR (4 COLS) */}
        <div className="xl:col-span-4 space-y-6">
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 sm:p-5 md:p-6 border border-slate-200/90 dark:border-slate-800 shadow-xs space-y-5 sticky top-6">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900/50 shrink-0">
                  <Calculator size={18} />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    Bill Summary
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Review totals and complete payment.
                  </p>
                </div>
              </div>
              <span className="text-[11px] font-mono font-semibold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 shrink-0">
                Draft
              </span>
            </div>

            {/* Calculations Breakdown */}
            <div className="space-y-3 text-sm">
              <div className="flex items-center justify-between text-slate-600 dark:text-slate-400">
                <span>Subtotal ({billItems.length} items)</span>
                <span className="font-semibold text-slate-900 dark:text-white">
                  ₹{totals.subtotal.toFixed(2)}
                </span>
              </div>
              <div className="flex items-center justify-between text-slate-600 dark:text-slate-400">
                <span className="flex items-center gap-1 text-rose-600 dark:text-rose-400 font-medium">
                  Total Discount
                </span>
                <span className="font-semibold text-rose-600 dark:text-rose-400">
                  - ₹{totals.discountTotal.toFixed(2)}
                </span>
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-baseline justify-between">
                <div>
                  <span className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">
                    Grand Total
                  </span>
                  <span className="text-[11px] text-slate-400 dark:text-slate-500">
                    (Net Payable Amount)
                  </span>
                </div>
                <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
                  ₹{totals.grandTotal.toFixed(2)}
                </div>
              </div>
            </div>

            {/* Payment Mode Pills */}
            <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-2">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
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
                    className={`px-3 py-2 rounded-xl text-xs font-semibold border flex items-center justify-center gap-1.5 transition-all ${paymentMode === mode.id
                      ? "bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800 shadow-2xs"
                      : "bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-750"
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
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 dark:disabled:bg-slate-700 text-white px-4 py-3 rounded-xl font-semibold text-sm shadow-xs flex items-center justify-center gap-2 transition-colors disabled:cursor-not-allowed"
              >
                <CheckCircle2 size={18} />
                <span>
                  {isEditingBill
                    ? "Update Bill"
                    : bills.length > 1
                      ? `Save Active Patient Bill (${bills[activeBillIndex]?.patient?.name || `Patient #${activeBillIndex + 1}`})`
                      : "Generate & Save Bill"}
                </span>
              </button>

              {bills.length > 1 && !isEditingBill && (
                <button
                  type="button"
                  onClick={generateAllSessionBills}
                  disabled={isSavingAll}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 dark:disabled:bg-slate-700 text-white px-4 py-3 rounded-xl font-semibold text-sm shadow-xs flex items-center justify-center gap-2 transition-colors disabled:cursor-not-allowed"
                >
                  <CheckCircle2 size={18} />
                  <span>
                    {isSavingAll
                      ? "Saving All Bills..."
                      : `Save All ${bills.length} Bills (₹${sessionGrandTotal.toFixed(2)})`}
                  </span>
                </button>
              )}

              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={handlePrintBill}
                  disabled={billItems.length === 0}
                  className="bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-750 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 px-3 py-2.5 rounded-xl font-semibold text-xs shadow-xs flex items-center justify-center gap-1.5 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Printer size={15} />
                  <span>Print Receipt</span>
                </button>
                <button
                  type="button"
                  onClick={handleDownloadPDF}
                  disabled={billItems.length === 0}
                  className="bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-750 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 px-3 py-2.5 rounded-xl font-semibold text-xs shadow-xs flex items-center justify-center gap-1.5 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Download size={15} />
                  <span>Download PDF</span>
                </button>
              </div>
            </div>

            {/* Inventory Note */}
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed flex items-center gap-2">
              <Shield size={14} className="text-slate-400 dark:text-slate-500 shrink-0" />
              <span>
                Inventory stock levels update automatically upon saving the bill.
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 3. EDIT ITEM MODAL */}
      {isEditOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div
            className="fixed inset-0"
            onClick={closeEditModal}
          />
          <div className="relative z-10 w-full max-w-md mx-auto bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl p-5 sm:p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Edit Bill Item
              </h3>
              <button
                type="button"
                onClick={closeEditModal}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1"
              >
                <X size={18} />
              </button>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                Quantity
              </label>
              <input
                type="number"
                min="1"
                step="1"
                value={editQuantity}
                onChange={(e) => setEditQuantity(Number(e.target.value))}
                className="w-full bg-slate-50/60 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-slate-800 dark:text-white font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                Discount (%)
              </label>
              <input
                type="number"
                min="0"
                max="100"
                step="0.5"
                value={editDiscount}
                onChange={(e) => setEditDiscount(Number(e.target.value))}
                className="w-full bg-slate-50/60 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-slate-800 dark:text-white font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              />
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={closeEditModal}
                className="px-4 py-2 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-750 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-semibold shadow-xs transition-colors"
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

      {/* 4. DIRECT PATIENT REGISTRATION MODAL */}
      {isPatientModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
          <div
            className="fixed inset-0"
            onClick={() => !isRegisteringPatient && setIsPatientModalOpen(false)}
          />
          <div className="relative z-10 w-full max-w-xl mx-auto bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl shadow-2xl overflow-hidden my-4 sm:my-8">
            <div className="px-5 sm:px-6 py-4 bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200/80 dark:border-slate-700 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-blue-600 text-white shadow-xs shrink-0">
                  <UserPlus size={18} />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    Register New Patient
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Patient will be saved to registration database and assigned to this bill.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsPatientModalOpen(false)}
                disabled={isRegisteringPatient}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 rounded-lg"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleRegisterPatient} className="p-5 sm:p-6 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Full Name */}
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                    Patient Full Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Rahul Sharma"
                    value={newPatient.name}
                    onChange={(e) =>
                      setNewPatient((prev) => ({ ...prev, name: e.target.value }))
                    }
                    className={`w-full bg-slate-50/60 dark:bg-slate-800/80 border rounded-xl px-3.5 py-2.5 text-sm text-slate-800 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-medium ${patientErrors.name ? "border-rose-400 bg-rose-50/20 dark:bg-rose-950/20" : "border-slate-200 dark:border-slate-700"
                      }`}
                  />
                  {patientErrors.name && (
                    <span className="text-[11px] text-rose-500 font-medium mt-1 block">
                      {patientErrors.name}
                    </span>
                  )}
                </div>

                {/* Mobile */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                    Mobile Number <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-slate-400 dark:text-slate-500">
                      +91
                    </span>
                    <input
                      type="tel"
                      maxLength={10}
                      placeholder="9876543210"
                      value={newPatient.mobile}
                      onChange={(e) =>
                        setNewPatient((prev) => ({
                          ...prev,
                          mobile: e.target.value.replace(/\D/g, ""),
                        }))
                      }
                      className={`w-full bg-slate-50/60 dark:bg-slate-800/80 border rounded-xl pl-12 pr-3.5 py-2.5 text-sm text-slate-800 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-medium ${patientErrors.mobile ? "border-rose-400 bg-rose-50/20 dark:bg-rose-950/20" : "border-slate-200 dark:border-slate-700"
                        }`}
                    />
                  </div>
                  {patientErrors.mobile && (
                    <span className="text-[11px] text-rose-500 font-medium mt-1 block">
                      {patientErrors.mobile}
                    </span>
                  )}
                </div>

                {/* Age & Gender */}
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                      Age
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="130"
                      placeholder="e.g. 32"
                      value={newPatient.age}
                      onChange={(e) =>
                        setNewPatient((prev) => ({ ...prev, age: e.target.value }))
                      }
                      className="w-full bg-slate-50/60 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2.5 text-sm text-slate-800 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-medium"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                      Gender
                    </label>
                    <select
                      value={newPatient.gender}
                      onChange={(e) =>
                        setNewPatient((prev) => ({ ...prev, gender: e.target.value }))
                      }
                      className="w-full bg-slate-50/60 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2.5 text-sm text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-medium"
                    >
                      <option value="Male" className="dark:bg-slate-900 dark:text-white">Male</option>
                      <option value="Female" className="dark:bg-slate-900 dark:text-white">Female</option>
                      <option value="Other" className="dark:bg-slate-900 dark:text-white">Other</option>
                    </select>
                  </div>
                </div>

                {/* Address */}
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                    Address <span className="text-slate-400 dark:text-slate-500 font-normal lowercase">(optional)</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Flat 402, Green Avenue, Mumbai"
                    value={newPatient.address}
                    onChange={(e) =>
                      setNewPatient((prev) => ({ ...prev, address: e.target.value }))
                    }
                    className="w-full bg-slate-50/60 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-slate-800 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-medium"
                  />
                </div>

                {/* Doctor Name */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                    Doctor Name <span className="text-slate-400 dark:text-slate-500 font-normal lowercase">(optional)</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Dr. A. K. Verma"
                    value={newPatient.doctorName}
                    onChange={(e) =>
                      setNewPatient((prev) => ({ ...prev, doctorName: e.target.value }))
                    }
                    className="w-full bg-slate-50/60 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-slate-800 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-medium"
                  />
                </div>

                {/* Prescription Number */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                    Prescription No <span className="text-slate-400 dark:text-slate-500 font-normal lowercase">(optional)</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. RX-2026-904"
                    value={newPatient.prescriptionNumber}
                    onChange={(e) =>
                      setNewPatient((prev) => ({
                        ...prev,
                        prescriptionNumber: e.target.value,
                      }))
                    }
                    className="w-full bg-slate-50/60 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-slate-800 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-medium"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsPatientModalOpen(false)}
                  disabled={isRegisteringPatient}
                  className="px-4 py-2.5 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-750 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-semibold shadow-xs transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isRegisteringPatient}
                  className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 dark:disabled:bg-blue-800 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors"
                >
                  <CheckCircle2 size={15} />
                  <span>
                    {isRegisteringPatient
                      ? "Registering..."
                      : "Save & Assign to Bill"}
                  </span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 5. MULTI-BILL SESSION SUMMARY MODAL */}
      {sessionSummary && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
          <div
            className="fixed inset-0"
            onClick={() => setSessionSummary(null)}
          />
          <div className="relative z-10 w-full max-w-2xl mx-auto bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl shadow-2xl overflow-hidden my-4 sm:my-8">
            <div className="px-5 sm:px-6 py-4 bg-emerald-50 dark:bg-emerald-950/40 border-b border-emerald-200/80 dark:border-emerald-900/50 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-emerald-600 text-white shadow-xs shrink-0">
                  <CheckCircle2 size={20} />
                </div>
                <div>
                  <h3 className="text-base font-bold text-emerald-950 dark:text-emerald-200">
                    Multi-Patient Billing Completed
                  </h3>
                  <p className="text-xs text-emerald-700 dark:text-emerald-400">
                    All {sessionSummary.totalPatients} bills were successfully recorded and inventory synchronized.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSessionSummary(null)}
                className="text-emerald-700 hover:text-emerald-900 dark:text-emerald-400 dark:hover:text-emerald-200 p-1 rounded-lg"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-5 sm:p-6 space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-3.5 bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 rounded-xl">
                  <span className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">
                    Bills Generated
                  </span>
                  <span className="text-xl font-bold text-slate-900 dark:text-white mt-0.5 block">
                    {sessionSummary.totalPatients} Invoices
                  </span>
                </div>
                <div className="p-3.5 bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 rounded-xl">
                  <span className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">
                    Session Grand Total
                  </span>
                  <span className="text-xl font-bold text-emerald-600 dark:text-emerald-400 mt-0.5 block">
                    ₹{sessionSummary.sessionTotal.toFixed(2)}
                  </span>
                </div>
              </div>

              <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden overflow-x-auto scrollbar-thin">
                <table className="w-full text-left text-xs min-w-[500px]">
                  <thead className="bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 font-semibold uppercase">
                    <tr>
                      <th className="py-2.5 px-3">Invoice #</th>
                      <th className="py-2.5 px-3">Patient</th>
                      <th className="py-2.5 px-3 text-center">Items</th>
                      <th className="py-2.5 px-3 text-right">Amount</th>
                      <th className="py-2.5 px-3 text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {sessionSummary.bills.map((res) => (
                      <tr key={res.invoiceNo} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                        <td className="py-2.5 px-3 font-mono font-semibold text-slate-800 dark:text-slate-200">
                          {res.invoiceNo}
                        </td>
                        <td className="py-2.5 px-3 font-medium text-slate-900 dark:text-white">
                          {res.patientName}
                        </td>
                        <td className="py-2.5 px-3 text-center text-slate-600 dark:text-slate-400">
                          {res.itemCount} items
                        </td>
                        <td className="py-2.5 px-3 text-right font-bold text-slate-900 dark:text-white">
                          ₹{res.grandTotal.toFixed(2)}
                        </td>
                        <td className="py-2.5 px-3 text-center">
                          <button
                            type="button"
                            onClick={() => printBill(res.billData)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-lg text-xs font-semibold transition-colors"
                          >
                            <Printer size={12} />
                            <span>Print</span>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => navigate("/billing-history")}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-4 py-2.5 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-750 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-semibold shadow-xs transition-colors"
                >
                  <History size={15} />
                  <span>View Billing History</span>
                </button>
                <button
                  type="button"
                  onClick={() => setSessionSummary(null)}
                  className="w-full sm:w-auto px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors"
                >
                  Start New Bill
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Billing;
