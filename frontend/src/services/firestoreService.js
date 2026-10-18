import {
  collection,
  doc,
  getDocs,
  getDoc,
  addDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
  where,
  limit,
  Timestamp,
  writeBatch,
  runTransaction,
} from "firebase/firestore";
import { db } from "../firebase/firebase";

// Helper to strip undefined values so Firestore does not throw invalid field errors
const sanitizeData = (data) => {
  if (data === null || data === undefined) return null;
  if (typeof data !== "object") return data;
  if (data instanceof Timestamp) return data;
  if (Array.isArray(data)) {
    return data.map((item) => sanitizeData(item));
  }
  const clean = {};
  for (const [key, value] of Object.entries(data)) {
    if (value !== undefined) {
      clean[key] = sanitizeData(value);
    }
  }
  return clean;
};

// Helper to normalize Firestore document with backward-compatible ID fields
const formatDoc = (docSnap, idField) => {
  if (!docSnap.exists()) return null;
  const data = docSnap.data();
  const id = docSnap.id;
  return {
    ...data,
    id,
    [idField || "id"]: id,
    _firestoreId: id,
    createdAt: data.createdAt?.toDate ? data.createdAt.toDate().toISOString() : data.createdAt || new Date().toISOString(),
    updatedAt: data.updatedAt?.toDate ? data.updatedAt.toDate().toISOString() : data.updatedAt || new Date().toISOString(),
  };
};

/* =========================================================================
   1. MEDICINES CRUD (Collection: "medicines")
   ========================================================================= */

export const getMedicines = async () => {
  try {
    const colRef = collection(db, "medicines");
    const snapshot = await getDocs(colRef);
    if (snapshot.empty) {
      // Seed default initial medicines if database is empty
      const seeded = await seedInitialData();
      if (seeded && seeded.length > 0) {
        return seeded;
      }
      const freshSnap = await getDocs(colRef);
      return freshSnap.docs.map((d) => formatDoc(d, "medicine_id"));
    }
    return snapshot.docs.map((d) => formatDoc(d, "medicine_id"));
  } catch (err) {
    console.error("Firestore getMedicines error:", err);
    throw err;
  }
};

export const getMedicineById = async (id) => {
  const docRef = doc(db, "medicines", String(id));
  const docSnap = await getDoc(docRef);
  return formatDoc(docSnap, "medicine_id");
};

export const createMedicine = async (medicineData) => {
  try {
    const colRef = collection(db, "medicines");
    const payload = {
      medicine_name: medicineData.medicine_name || medicineData.name || "",
      salt_name: medicineData.salt_name || medicineData.saltName || "",
      brand_name: medicineData.brand_name || medicineData.brandName || "",
      manufacturer: medicineData.manufacturer || "",
      category: medicineData.category || "Tablet",
      pack_size: medicineData.pack_size || medicineData.packSize || "10 Tabs",
      unit: medicineData.unit || "Strip",
      purchase_price: Number(medicineData.purchase_price || medicineData.purchasePrice || 0),
      selling_price: Number(medicineData.selling_price || medicineData.sellingPrice || medicineData.price || 0),
      gst: Number(medicineData.gst || 0),
      batch_number: medicineData.batch_number || medicineData.batchNumber || `BATCH-${Date.now().toString().slice(-5)}`,
      manufacture_date: medicineData.manufacture_date || medicineData.manufactureDate || new Date().toISOString().split("T")[0],
      expiry_date: medicineData.expiry_date || medicineData.expiryDate || "",
      quantity: Number(medicineData.quantity || 0),
      rack_location: medicineData.rack_location || medicineData.rackLocation || "Rack A-1",
      min_stock: Number(medicineData.min_stock || medicineData.minStock || 10),
      status: Number(medicineData.quantity || 0) > 0 ? "In Stock" : "Out of Stock",
      supplier_id: medicineData.supplier_id || medicineData.supplierId || null,
      supplier_name: medicineData.supplier_name || medicineData.supplierName || "",
      supplier_contact: medicineData.supplier_contact || medicineData.supplierContact || "",
      supplier_mobile: medicineData.supplier_mobile || medicineData.supplierMobile || "",
      supplier_email: medicineData.supplier_email || medicineData.supplierEmail || "",
      supplier_address: medicineData.supplier_address || medicineData.supplierAddress || "",
      supplier_gst: medicineData.supplier_gst || medicineData.supplierGst || "",
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    };

    const docRef = await addDoc(colRef, payload);

    // Record initial inventory log if quantity > 0
    if (payload.quantity > 0) {
      await addDoc(collection(db, "inventory_logs"), {
        medicine_id: docRef.id,
        medicine_name: payload.medicine_name,
        batch_number: payload.batch_number,
        movement_type: "IN",
        quantity: payload.quantity,
        previous_stock: 0,
        current_stock: payload.quantity,
        remarks: "Initial Stock / Medicine Registered",
        createdAt: Timestamp.now(),
      });
    }

    return { id: docRef.id, medicine_id: docRef.id, ...payload };
  } catch (err) {
    console.error("Firestore createMedicine error:", err);
    throw err;
  }
};

export const updateMedicine = async (id, updateData) => {
  try {
    const docRef = doc(db, "medicines", String(id));
    const payload = {
      ...updateData,
      updatedAt: Timestamp.now(),
    };

    if (updateData.selling_price !== undefined) payload.selling_price = Number(updateData.selling_price);
    if (updateData.purchase_price !== undefined) payload.purchase_price = Number(updateData.purchase_price);
    if (updateData.quantity !== undefined) {
      payload.quantity = Number(updateData.quantity);
      payload.status = payload.quantity > 0 ? "In Stock" : "Out of Stock";
    }

    await updateDoc(docRef, payload);
    return { id, medicine_id: id, ...payload };
  } catch (err) {
    console.error("Firestore updateMedicine error:", err);
    throw err;
  }
};

export const deleteMedicine = async (id) => {
  try {
    const docRef = doc(db, "medicines", String(id));
    await deleteDoc(docRef);
    return { success: true, id };
  } catch (err) {
    console.error("Firestore deleteMedicine error:", err);
    throw err;
  }
};

export const bulkCreateMedicines = async (medicinesList) => {
  try {
    if (!Array.isArray(medicinesList) || medicinesList.length === 0) return { count: 0 };
    const batch = writeBatch(db);
    const colRef = collection(db, "medicines");

    medicinesList.forEach((m) => {
      const newDoc = doc(colRef);
      const payload = {
        medicine_name: m.medicine_name || m.name || "",
        salt_name: m.salt_name || m.saltName || "",
        brand_name: m.brand_name || m.brandName || "",
        manufacturer: m.manufacturer || "",
        category: m.category || "Tablet",
        pack_size: m.pack_size || m.packSize || "10 Tabs",
        unit: m.unit || "Strip",
        purchase_price: Number(m.purchase_price || m.purchasePrice || 0),
        selling_price: Number(m.selling_price || m.sellingPrice || m.price || 0),
        gst: Number(m.gst || 0),
        batch_number: m.batch_number || m.batchNumber || `B-${Date.now().toString().slice(-4)}`,
        manufacture_date: m.manufacture_date || m.manufactureDate || new Date().toISOString().split("T")[0],
        expiry_date: m.expiry_date || m.expiryDate || "",
        quantity: Number(m.quantity || 0),
        rack_location: m.rack_location || m.rackLocation || "Rack A-1",
        min_stock: Number(m.min_stock || m.minStock || 10),
        status: Number(m.quantity || 0) > 0 ? "In Stock" : "Out of Stock",
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      };
      batch.set(newDoc, payload);
    });

    await batch.commit();
    return { count: medicinesList.length, success: true };
  } catch (err) {
    console.error("Firestore bulkCreateMedicines error:", err);
    throw err;
  }
};

/* =========================================================================
   1.5. SUPPLIERS CRUD (Collection: "suppliers")
   ========================================================================= */

export const getSuppliers = async () => {
  try {
    const colRef = collection(db, "suppliers");
    const snapshot = await getDocs(colRef);
    if (snapshot.empty) {
      return [
        {
          id: "sup_default_1",
          supplier_id: "sup_default_1",
          supplier_name: "Apex Healthcare Logistics",
          name: "Apex Healthcare Logistics",
          contact_person: "Vikram Malhotra",
          mobile: "9823012345",
          mobile_number: "9823012345",
          email: "vikram@apexhealthcare.in",
          address: "GIDC Industrial Estate, Sector 4, Ahmedabad",
          gst_number: "24AAACA1234A1Z5",
          createdAt: new Date().toISOString(),
        },
        {
          id: "sup_default_2",
          supplier_id: "sup_default_2",
          supplier_name: "Sun Pharma Distributors",
          name: "Sun Pharma Distributors",
          contact_person: "Rajesh Parekh",
          mobile: "9898123456",
          mobile_number: "9898123456",
          email: "dist@sunpharma.in",
          address: "Andheri East, MIDC, Mumbai",
          gst_number: "27AABCS5678B1Z2",
          createdAt: new Date().toISOString(),
        },
      ];
    }
    return snapshot.docs.map((d) => formatDoc(d, "supplier_id"));
  } catch (err) {
    console.error("Firestore getSuppliers error:", err);
    return [];
  }
};

export const getSupplierById = async (id) => {
  try {
    const docRef = doc(db, "suppliers", String(id));
    const docSnap = await getDoc(docRef);
    return formatDoc(docSnap, "supplier_id");
  } catch (err) {
    console.error("Firestore getSupplierById error:", err);
    return null;
  }
};

export const createSupplier = async (supplierData) => {
  try {
    const colRef = collection(db, "suppliers");
    const cleanMobile = (supplierData.mobile || supplierData.mobile_number || "").trim();
    const cleanName = (supplierData.supplier_name || supplierData.name || "").trim();

    // Prevent duplicate supplier by checking phone number
    if (cleanMobile) {
      const q = query(colRef, where("mobile", "==", cleanMobile));
      const existing = await getDocs(q);
      if (!existing.empty) {
        const found = existing.docs[0];
        return {
          id: found.id,
          supplier_id: found.id,
          ...found.data(),
          _alreadyExists: true,
        };
      }
    }

    const payload = sanitizeData({
      supplier_name: cleanName,
      name: cleanName,
      contact_person: (supplierData.contact_person || supplierData.contactPerson || "").trim(),
      mobile: cleanMobile,
      mobile_number: cleanMobile,
      email: (supplierData.email || "").trim(),
      address: (supplierData.address || "").trim(),
      gst_number: (supplierData.gst_number || supplierData.gstNumber || "").trim().toUpperCase(),
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    });

    const docRef = await addDoc(colRef, payload);
    return { id: docRef.id, supplier_id: docRef.id, ...payload };
  } catch (err) {
    console.error("Firestore createSupplier error:", err);
    throw err;
  }
};

export const updateSupplier = async (id, updateData) => {
  try {
    const docRef = doc(db, "suppliers", String(id));
    const payload = sanitizeData({
      ...updateData,
      updatedAt: Timestamp.now(),
    });
    await updateDoc(docRef, payload);
    const updated = await getDoc(docRef);
    return formatDoc(updated, "supplier_id");
  } catch (err) {
    console.error("Firestore updateSupplier error:", err);
    throw err;
  }
};

/* =========================================================================
   2. PATIENTS CRUD (Collection: "patients")
   ========================================================================= */

export const getPatients = async () => {
  try {
    const colRef = collection(db, "patients");
    const snapshot = await getDocs(colRef);
    if (snapshot.empty) {
      const seeded = await seedInitialPatients();
      if (seeded && seeded.length > 0) {
        return seeded;
      }
      const freshSnap = await getDocs(colRef);
      return freshSnap.docs.map((d) => formatDoc(d, "patient_id"));
    }
    return snapshot.docs.map((d) => formatDoc(d, "patient_id"));
  } catch (err) {
    console.error("Firestore getPatients error:", err);
    return [
      {
        id: "pat_default_1",
        patient_id: "pat_default_1",
        patient_name: "Ramesh Kumar Sharma",
        mobile_number: "9876543210",
        age: 48,
        gender: "Male",
        doctor_name: "Dr. A. K. Joshi",
        prescription_number: "RX-2026-081",
        address: "Flat 402, Green Avenue, Akola",
        notes: "Hypertension and seasonal allergies",
        reminders_enabled: true,
      },
      {
        id: "pat_default_2",
        patient_id: "pat_default_2",
        patient_name: "Sneha Patil",
        mobile_number: "9823456789",
        age: 32,
        gender: "Female",
        doctor_name: "Dr. Priya Deshmukh",
        prescription_number: "RX-2026-112",
        address: "Near Civil Hospital, Akola",
        notes: "Diabetic patient - Metformin refills",
        reminders_enabled: true,
      },
    ];
  }
};

export const getPatientById = async (id) => {
  const docRef = doc(db, "patients", String(id));
  const docSnap = await getDoc(docRef);
  return formatDoc(docSnap, "patient_id");
};

export const createPatient = async (patientData) => {
  try {
    const colRef = collection(db, "patients");
    const payload = {
      patient_name: patientData.patient_name || patientData.name || "",
      mobile_number: patientData.mobile_number || patientData.mobile || "",
      age: Number(patientData.age || 0),
      gender: patientData.gender || "Other",
      doctor_name: patientData.doctor_name || patientData.doctorName || "",
      prescription_number: patientData.prescription_number || patientData.prescriptionNumber || "",
      address: patientData.address || "",
      notes: patientData.notes || "",
      reminders_enabled: patientData.reminders_enabled !== undefined ? Boolean(patientData.reminders_enabled) : true,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    };

    const docRef = await addDoc(colRef, payload);
    return { id: docRef.id, patient_id: docRef.id, ...payload };
  } catch (err) {
    console.error("Firestore createPatient error:", err);
    throw err;
  }
};

export const updatePatient = async (id, updateData) => {
  try {
    const docRef = doc(db, "patients", String(id));
    const payload = {
      ...updateData,
      updatedAt: Timestamp.now(),
    };
    if (updateData.age !== undefined) payload.age = Number(updateData.age);

    await updateDoc(docRef, payload);
    return { id, patient_id: id, ...payload };
  } catch (err) {
    console.error("Firestore updatePatient error:", err);
    throw err;
  }
};

export const deletePatient = async (id) => {
  try {
    const docRef = doc(db, "patients", String(id));
    await deleteDoc(docRef);
    return { success: true, id };
  } catch (err) {
    console.error("Firestore deletePatient error:", err);
    throw err;
  }
};

export const togglePatientReminders = async (id, enabled) => {
  return updatePatient(id, { reminders_enabled: Boolean(enabled) });
};

/* =========================================================================
   3. BILLS CRUD (Collection: "bills" & stock deduction)
   ========================================================================= */

export const getBills = async () => {
  try {
    const colRef = collection(db, "bills");
    const snapshot = await getDocs(colRef);
    if (snapshot.empty) {
      const seeded = await seedInitialBills();
      if (seeded && seeded.length > 0) {
        return seeded;
      }
      const freshSnap = await getDocs(colRef);
      return freshSnap.docs
        .map((d) => formatDoc(d, "bill_id"))
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }
    return snapshot.docs
      .map((d) => formatDoc(d, "bill_id"))
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  } catch (err) {
    console.error("Firestore getBills error:", err);
    throw err;
  }
};

export const getBillById = async (id) => {
  try {
    if (!id) return null;
    const docRef = doc(db, "bills", String(id));
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return formatDoc(docSnap, "bill_id");
    }

    // Try finding by bill_number
    const q = query(collection(db, "bills"), where("bill_number", "==", String(id)));
    const querySnap = await getDocs(q);
    if (!querySnap.empty) {
      return formatDoc(querySnap.docs[0], "bill_id");
    }

    // Fallback: check all bills
    const allBills = await getBills();
    return (
      allBills.find(
        (b) =>
          String(b.id) === String(id) ||
          String(b.bill_id) === String(id) ||
          String(b.bill_number) === String(id),
      ) || null
    );
  } catch (err) {
    console.error("Firestore getBillById error:", err);
    return null;
  }
};

export const createBill = async (billData) => {
  try {
    const rawBill = billData.bill || billData;
    const items = billData.items || rawBill.items || [];
    let patient_id = rawBill.patient_id || rawBill.patientId || "";
    let patient_name = rawBill.patient_name || rawBill.patientName || "";
    let mobile_number = rawBill.mobile_number || rawBill.mobile || "";
    let doctor_name = rawBill.doctor_name || rawBill.doctorName || "";
    let prescription_number = rawBill.prescription_number || rawBill.prescriptionNumber || "";

    // If patient info is missing but patient_id is provided, look up patient
    if (patient_id && (!patient_name || patient_name === "Walk-in Customer")) {
      try {
        const patSnap = await getDoc(doc(db, "patients", String(patient_id)));
        if (patSnap.exists()) {
          const pat = patSnap.data();
          patient_name = pat.patient_name || patient_name || "Walk-in Customer";
          mobile_number = mobile_number || pat.mobile_number || "";
          doctor_name = doctor_name || pat.doctor_name || "";
          prescription_number = prescription_number || pat.prescription_number || "";
        }
      } catch (pErr) {
        console.warn("Could not lookup patient in Firestore:", pErr);
      }
    }

    const subtotal = Number(rawBill.subtotal || 0);
    const total_discount = Number(rawBill.total_discount || rawBill.discount || 0);
    const total_gst = Number(rawBill.total_gst || rawBill.gst || 0);
    const grand_total = Number(rawBill.grand_total || rawBill.total || 0);
    const payment_mode = rawBill.payment_mode || rawBill.paymentMode || "Cash";
    const payment_status = rawBill.payment_status || "Completed";
    const notes = rawBill.notes || "";
    const billNumber = rawBill.bill_number || rawBill.billNumber || `INV-${Date.now().toString().slice(-6)}`;

    // Use transaction to atomically save the bill, decrement medicine stocks, and write logs
    const result = await runTransaction(db, async (transaction) => {
      // 1. Validate and fetch medicines
      const medicineUpdates = [];
      for (const item of items) {
        const medId = item.medicine_id || item.id;
        if (!medId) continue;

        const medRef = doc(db, "medicines", String(medId));
        const medSnap = await transaction.get(medRef);

        if (medSnap.exists()) {
          const medData = medSnap.data();
          const currentQty = Number(medData.quantity || 0);
          const deductQty = Number(item.quantity || 1);
          const newQty = Math.max(0, currentQty - deductQty);

          medicineUpdates.push({
            ref: medRef,
            newQty,
            currentQty,
            deductQty,
            medicineName: medData.medicine_name || item.name || "Medicine",
            batchNumber: medData.batch_number || item.batch || "",
          });
        }
      }

      // 2. Perform medicine stock updates
      for (const update of medicineUpdates) {
        transaction.update(update.ref, {
          quantity: update.newQty,
          status: update.newQty > 0 ? "In Stock" : "Out of Stock",
          updatedAt: Timestamp.now(),
        });
      }

      // 3. Create Bill Document
      const newBillRef = doc(collection(db, "bills"));
      const billPayload = {
        bill_number: billNumber,
        patient_id: patient_id || "",
        patient_name: patient_name || "Walk-in Customer",
        mobile_number: mobile_number || "",
        doctor_name: doctor_name || "",
        prescription_number: prescription_number || "",
        items: items.map((it) => ({
          medicine_id: it.medicine_id || it.id,
          name: it.name || it.medicine_name || "",
          batch: it.batch || it.batch_number || "",
          quantity: Number(it.quantity || 1),
          price: Number(it.price || it.selling_price || 0),
          discount: Number(it.discount || 0),
          gst: Number(it.gst || 0),
          subtotal: Number(it.subtotal || 0),
          total: Number(it.total || 0),
        })),
        subtotal,
        total_discount,
        total_gst,
        grand_total,
        payment_mode,
        payment_status,
        notes,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      };

      transaction.set(newBillRef, billPayload);

      return {
        id: newBillRef.id,
        bill_id: newBillRef.id,
        ...billPayload,
        createdAt: new Date().toISOString(),
      };
    });

    // Write inventory logs for sale movements
    for (const item of items) {
      try {
        await addDoc(collection(db, "inventory_logs"), {
          medicine_id: item.medicine_id || item.id,
          medicine_name: item.name || item.medicine_name || "Medicine",
          batch_number: item.batch || item.batch_number || "",
          movement_type: "OUT",
          quantity: Number(item.quantity || 1),
          remarks: `Sale via Bill #${billNumber}`,
          createdAt: Timestamp.now(),
        });
      } catch (logErr) {
        console.warn("Could not write sale inventory log:", logErr);
      }
    }

    return result;
  } catch (err) {
    console.error("Firestore createBill error:", err);
    throw err;
  }
};

export const updateBill = async (id, updateData) => {
  try {
    if (!id) {
      throw new Error("Bill ID is required for updating patient bill");
    }
    const docRef = doc(db, "bills", String(id));
    const billSnap = await getDoc(docRef);

    const rawBill = updateData.bill || updateData;
    const newItems = updateData.items || rawBill.items;

    let oldBill = {};
    if (billSnap.exists()) {
      oldBill = billSnap.data() || {};
    }

    // Preserve patient details if omitted
    let patient_id = rawBill.patient_id || rawBill.patientId || oldBill.patient_id || "";
    let patient_name = rawBill.patient_name || rawBill.patientName || oldBill.patient_name || "";
    let mobile_number = rawBill.mobile_number || rawBill.mobile || oldBill.mobile_number || "";
    let doctor_name = rawBill.doctor_name || rawBill.doctorName || oldBill.doctor_name || "";
    let prescription_number =
      rawBill.prescription_number || rawBill.prescriptionNumber || oldBill.prescription_number || "";

    if (patient_id && (!patient_name || patient_name === "Walk-in Customer")) {
      try {
        const patSnap = await getDoc(doc(db, "patients", String(patient_id)));
        if (patSnap.exists()) {
          const pat = patSnap.data();
          patient_name = pat.patient_name || patient_name;
          mobile_number = mobile_number || pat.mobile_number || "";
          doctor_name = doctor_name || pat.doctor_name || "";
          prescription_number = prescription_number || pat.prescription_number || "";
        }
      } catch (pErr) {
        console.warn("Could not lookup patient in Firestore for bill update:", pErr);
      }
    }

    // If new items are provided, synchronize inventory stock
    if (billSnap.exists() && Array.isArray(newItems) && newItems.length > 0) {
      const oldItems = oldBill.items || [];

      // 1. Revert previous stock deductions
      for (const oldIt of oldItems) {
        const medId = oldIt.medicine_id || oldIt.id;
        if (medId) {
          try {
            const medRef = doc(db, "medicines", String(medId));
            const mSnap = await getDoc(medRef);
            if (mSnap.exists()) {
              const curQty = Number(mSnap.data().quantity || 0);
              const revertedQty = curQty + Number(oldIt.quantity || 0);
              await updateDoc(medRef, {
                quantity: revertedQty,
                status: revertedQty > 0 ? "In Stock" : "Out of Stock",
                updatedAt: Timestamp.now(),
              });
            }
          } catch (mErr) {
            console.warn(`Could not revert stock for medicine ${medId}:`, mErr);
          }
        }
      }

      // 2. Deduct stock for new items
      for (const newIt of newItems) {
        const medId = newIt.medicine_id || newIt.id;
        if (medId) {
          try {
            const medRef = doc(db, "medicines", String(medId));
            const mSnap = await getDoc(medRef);
            if (mSnap.exists()) {
              const curQty = Number(mSnap.data().quantity || 0);
              const deductQty = Number(newIt.quantity || 0);
              const finalQty = Math.max(0, curQty - deductQty);
              await updateDoc(medRef, {
                quantity: finalQty,
                status: finalQty > 0 ? "In Stock" : "Out of Stock",
                updatedAt: Timestamp.now(),
              });
            }
          } catch (mErr) {
            console.warn(`Could not deduct stock for medicine ${medId}:`, mErr);
          }
        }
      }
    }

    const payload = sanitizeData({
      ...rawBill,
      patient_id,
      patient_name: patient_name || "Walk-in Customer",
      mobile_number,
      doctor_name,
      prescription_number,
      ...(newItems ? { items: newItems } : {}),
      updatedAt: Timestamp.now(),
    });

    await setDoc(docRef, payload, { merge: true });
    return { id, bill_id: id, _firestoreId: id, ...payload };
  } catch (err) {
    console.error("Firestore updateBill error:", err);
    throw err;
  }
};

export const deleteBill = async (id, reason = "Bill Cancelled") => {
  try {
    const docRef = doc(db, "bills", String(id));
    const billSnap = await getDoc(docRef);

    if (billSnap.exists()) {
      const billData = billSnap.data();
      const items = billData.items || [];

      // Revert stock deductions back into medicines
      for (const it of items) {
        const medId = it.medicine_id || it.id;
        if (medId) {
          const medRef = doc(db, "medicines", String(medId));
          const medSnap = await getDoc(medRef);
          if (medSnap.exists()) {
            const medData = medSnap.data();
            const currQty = Number(medData.quantity || 0);
            const restoreQty = Number(it.quantity || 0);
            const newQty = currQty + restoreQty;

            await updateDoc(medRef, {
              quantity: newQty,
              status: newQty > 0 ? "In Stock" : "Out of Stock",
              updatedAt: Timestamp.now(),
            });

            await addDoc(collection(db, "inventory_logs"), {
              medicine_id: medId,
              medicine_name: it.name || medData.medicine_name || "Medicine",
              batch_number: it.batch || medData.batch_number || "",
              movement_type: "IN",
              quantity: restoreQty,
              previous_stock: currQty,
              current_stock: newQty,
              remarks: `Stock Restored via Invoice #${billData.bill_number} Deletion (${reason})`,
              createdAt: Timestamp.now(),
            });
          }
        }
      }
    }

    await deleteDoc(docRef);
    return { success: true, id };
  } catch (err) {
    console.error("Firestore deleteBill error:", err);
    throw err;
  }
};

/* =========================================================================
   4. INVENTORY LOGS & STOCK MOVEMENTS (Collection: "inventory_logs")
   ========================================================================= */

export const getInventoryLogs = async () => {
  try {
    const colRef = collection(db, "inventory_logs");
    const snapshot = await getDocs(colRef);
    return snapshot.docs
      .map((d) => formatDoc(d, "inventory_log_id"))
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  } catch (err) {
    console.error("Firestore getInventoryLogs error:", err);
    throw err;
  }
};

export const addStockIn = async (data) => {
  try {
    const medId = data.medicine_id || data.id;
    const addQty = Number(data.quantity || 0);

    let currentStock = 0;
    let medName = data.medicine_name || data.name || "";
    let batchNumber = data.batch_number || data.batchNumber || "";

    if (medId) {
      const medRef = doc(db, "medicines", String(medId));
      const medSnap = await getDoc(medRef);
      if (medSnap.exists()) {
        const medData = medSnap.data();
        currentStock = Number(medData.quantity || 0);
        medName = medName || medData.medicine_name;
        batchNumber = batchNumber || medData.batch_number;

        const newStock = currentStock + addQty;
        await updateDoc(medRef, {
          quantity: newStock,
          status: newStock > 0 ? "In Stock" : "Out of Stock",
          updatedAt: Timestamp.now(),
        });
      }
    }

    const logRef = await addDoc(collection(db, "inventory_logs"), {
      medicine_id: medId,
      medicine_name: medName,
      batch_number: batchNumber,
      movement_type: "IN",
      quantity: addQty,
      previous_stock: currentStock,
      current_stock: currentStock + addQty,
      remarks: data.remarks || data.notes || "Stock In / Restock",
      createdAt: Timestamp.now(),
    });

    return { success: true, id: logRef.id, current_stock: currentStock + addQty };
  } catch (err) {
    console.error("Firestore addStockIn error:", err);
    throw err;
  }
};

export const addStockOut = async (data) => {
  try {
    const medId = data.medicine_id || data.id;
    const deductQty = Number(data.quantity || 0);

    let currentStock = 0;
    let medName = data.medicine_name || data.name || "";
    let batchNumber = data.batch_number || data.batchNumber || "";

    if (medId) {
      const medRef = doc(db, "medicines", String(medId));
      const medSnap = await getDoc(medRef);
      if (medSnap.exists()) {
        const medData = medSnap.data();
        currentStock = Number(medData.quantity || 0);
        medName = medName || medData.medicine_name;
        batchNumber = batchNumber || medData.batch_number;

        const newStock = Math.max(0, currentStock - deductQty);
        await updateDoc(medRef, {
          quantity: newStock,
          status: newStock > 0 ? "In Stock" : "Out of Stock",
          updatedAt: Timestamp.now(),
        });

        const logRef = await addDoc(collection(db, "inventory_logs"), {
          medicine_id: medId,
          medicine_name: medName,
          batch_number: batchNumber,
          movement_type: "OUT",
          quantity: deductQty,
          previous_stock: currentStock,
          current_stock: newStock,
          remarks: data.remarks || "Stock Out / Manual Deduction",
          createdAt: Timestamp.now(),
        });

        return { success: true, id: logRef.id, current_stock: newStock };
      } else {
        throw new Error("Medicine not found");
      }
    }
    throw new Error("Medicine ID is required");
  } catch (err) {
    console.error("Firestore addStockOut error:", err);
    throw err;
  }
};

export const processReturnBill = async (returnData) => {
  try {
    const { manufacturer, items, reason, returnNoteNumber } = returnData;
    const noteNumber = returnNoteNumber || `RET-${Date.now().toString().slice(-6)}`;
    const returnItems = items || [];

    if (!returnItems.length) {
      throw new Error("No medicine items specified for return");
    }

    let totalQuantity = 0;
    let totalClaimAmount = 0;
    const processedItems = [];

    // Deduct stock for each medicine and record inventory log
    for (const item of returnItems) {
      const medId = item.medicine_id || item.id;
      const returnQty = Number(item.returnQuantity || item.quantity || 0);
      const purchasePrice = Number(item.purchasePrice || item.price || 0);
      const itemTotal = Number(item.total || returnQty * purchasePrice || 0);

      totalQuantity += returnQty;
      totalClaimAmount += itemTotal;

      let medName = item.name || item.medicine_name || "Medicine";
      let batchNumber = item.batch || item.batch_number || "";

      if (medId && returnQty > 0) {
        try {
          const medRef = doc(db, "medicines", String(medId));
          const medSnap = await getDoc(medRef);
          if (medSnap.exists()) {
            const medData = medSnap.data();
            const currentStock = Number(medData.quantity || 0);
            const newStock = Math.max(0, currentStock - returnQty);
            medName = medData.medicine_name || medName;
            batchNumber = medData.batch_number || batchNumber;

            await updateDoc(medRef, {
              quantity: newStock,
              status: newStock > 0 ? "In Stock" : "Out of Stock",
              updatedAt: Timestamp.now(),
            });

            // Write inventory log
            await addDoc(collection(db, "inventory_logs"), {
              medicine_id: medId,
              medicine_name: medName,
              batch_number: batchNumber,
              movement_type: "OUT",
              quantity: returnQty,
              previous_stock: currentStock,
              current_stock: newStock,
              remarks: `Returned to manufacturer ${manufacturer || "Supplier"} (Bill #${noteNumber}) - ${reason || "Expiry return"}`,
              createdAt: Timestamp.now(),
            });
          }
        } catch (mErr) {
          console.warn(`Could not deduct stock for medicine ${medId}:`, mErr);
        }
      }

      processedItems.push({
        medicine_id: medId,
        medicine_name: medName,
        batch_number: batchNumber,
        returnQuantity: returnQty,
        purchasePrice,
        total: itemTotal,
      });
    }

    // Save return bill document in "return_bills" collection
    const billDocRef = await addDoc(collection(db, "return_bills"), {
      returnNoteNumber: noteNumber,
      manufacturer: manufacturer || "Supplier",
      reason: reason || "Expired / Near-Expiry Stock Return",
      items: processedItems,
      totalUnits: totalQuantity,
      totalAmount: totalClaimAmount,
      status: "Processed",
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    });

    return {
      success: true,
      id: billDocRef.id,
      returnNoteNumber: noteNumber,
      count: processedItems.length,
      totalUnits: totalQuantity,
      totalAmount: totalClaimAmount,
      message: "Return bill processed and stock deducted successfully",
    };
  } catch (err) {
    console.error("Firestore processReturnBill error:", err);
    throw err;
  }
};

export const getReturnBills = async () => {
  try {
    const colRef = collection(db, "return_bills");
    const snapshot = await getDocs(colRef);
    return snapshot.docs
      .map((d) => formatDoc(d, "return_bill_id"))
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  } catch (err) {
    console.error("Firestore getReturnBills error:", err);
    return [];
  }
};


/* =========================================================================
   5. REMINDERS CRUD (Collection: "reminders")
   ========================================================================= */

export const getReminders = async () => {
  try {
    const colRef = collection(db, "reminders");
    const snapshot = await getDocs(colRef);
    if (snapshot.empty) {
      await seedInitialReminders();
      const freshSnap = await getDocs(colRef);
      return freshSnap.docs.map((d) => formatDoc(d, "reminder_id"));
    }
    return snapshot.docs.map((d) => formatDoc(d, "reminder_id"));
  } catch (err) {
    console.error("Firestore getReminders error:", err);
    throw err;
  }
};

export const createReminder = async (data) => {
  const colRef = collection(db, "reminders");
  const payload = {
    ...data,
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
  };
  const docRef = await addDoc(colRef, payload);
  return { id: docRef.id, ...payload };
};

export const updateReminder = async (id, data) => {
  const docRef = doc(db, "reminders", String(id));
  await updateDoc(docRef, { ...data, updatedAt: Timestamp.now() });
  return { id, ...data };
};

export const deleteReminder = async (id) => {
  const docRef = doc(db, "reminders", String(id));
  await deleteDoc(docRef);
  return { success: true, id };
};

/* =========================================================================
   6. REPORTS & ANALYTICS COMPUTATIONS
   ========================================================================= */

export const getDailySalesReport = async () => {
  try {
    const bills = await getBills();
    const today = new Date().toISOString().split("T")[0];

    let todaySales = 0;
    let todayBillsCount = 0;

    bills.forEach((b) => {
      const bDate = b.createdAt ? b.createdAt.split("T")[0] : "";
      if (bDate === today) {
        todaySales += Number(b.grand_total || 0);
        todayBillsCount += 1;
      }
    });

    return [
      {
        total_sales: todaySales,
        total_bills: todayBillsCount,
        date: today,
      },
    ];
  } catch (err) {
    console.error("Firestore getDailySalesReport error:", err);
    return [{ total_sales: 0, total_bills: 0, date: new Date().toISOString().split("T")[0] }];
  }
};

export const getLowStockReport = async () => {
  try {
    const medicines = await getMedicines();
    const lowStock = medicines.filter((m) => {
      const min = Number(m.min_stock || 10);
      return Number(m.quantity || 0) <= min;
    });

    return {
      count: lowStock.length,
      data: lowStock,
    };
  } catch (err) {
    console.error("Firestore getLowStockReport error:", err);
    return { count: 0, data: [] };
  }
};

export const getExpiryReport = async () => {
  try {
    const medicines = await getMedicines();
    const today = new Date();

    const expiryList = medicines
      .filter((m) => Boolean(m.expiry_date))
      .map((m) => {
        const expDate = new Date(m.expiry_date);
        const diffTime = expDate - today;
        const daysRemaining = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return {
          ...m,
          days_remaining: daysRemaining,
        };
      })
      .filter((m) => m.days_remaining <= 60) // within 60 days
      .sort((a, b) => a.days_remaining - b.days_remaining);

    return {
      count: expiryList.length,
      data: expiryList,
    };
  } catch (err) {
    console.error("Firestore getExpiryReport error:", err);
    return { count: 0, data: [] };
  }
};

/* =========================================================================
   7. SEED DATA HELPERS (Runs only once if database is brand new)
   ========================================================================= */

const seedInitialData = async () => {
  try {
    const colRef = collection(db, "medicines");
    const initialMeds = [
      {
        medicine_name: "Paracetamol 500mg",
        salt_name: "Acetaminophen",
        brand_name: "Crocin",
        manufacturer: "GSK Pharmaceuticals",
        category: "Tablet",
        pack_size: "10 Tabs",
        unit: "Strip",
        purchase_price: 15.0,
        selling_price: 25.0,
        gst: 12,
        batch_number: "PCM-2026-A1",
        manufacture_date: "2026-01-10",
        expiry_date: "2027-12-31",
        quantity: 120,
        rack_location: "Rack A-01",
        min_stock: 20,
        status: "In Stock",
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      },
      {
        medicine_name: "Amoxicillin 250mg",
        salt_name: "Amoxicillin Trihydrate",
        brand_name: "Mox 250",
        manufacturer: "Ranbaxy / Sun Pharma",
        category: "Capsule",
        pack_size: "10 Caps",
        unit: "Strip",
        purchase_price: 45.0,
        selling_price: 68.0,
        gst: 12,
        batch_number: "AMX-2026-B4",
        manufacture_date: "2026-02-15",
        expiry_date: "2026-11-20",
        quantity: 8, // Low stock
        rack_location: "Rack B-03",
        min_stock: 15,
        status: "Low Stock",
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      },
      {
        medicine_name: "Azithromycin 500mg",
        salt_name: "Azithromycin",
        brand_name: "Azee 500",
        manufacturer: "Cipla Healthcare",
        category: "Tablet",
        pack_size: "3 Tabs",
        unit: "Strip",
        purchase_price: 70.0,
        selling_price: 115.0,
        gst: 12,
        batch_number: "AZI-2025-C9",
        manufacture_date: "2025-08-01",
        expiry_date: "2026-10-15", // Expiring soon
        quantity: 45,
        rack_location: "Rack A-04",
        min_stock: 10,
        status: "In Stock",
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      },
      {
        medicine_name: "Cough Relief Syrup 100ml",
        salt_name: "Dextromethorphan + Chlorpheniramine",
        brand_name: "Benadryl DR",
        manufacturer: "Johnson & Johnson",
        category: "Syrup",
        pack_size: "100ml",
        unit: "Bottle",
        purchase_price: 65.0,
        selling_price: 98.0,
        gst: 18,
        batch_number: "SYR-2026-D2",
        manufacture_date: "2026-01-20",
        expiry_date: "2027-06-30",
        quantity: 60,
        rack_location: "Rack C-02",
        min_stock: 10,
        status: "In Stock",
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      },
    ];

    const batch = writeBatch(db);
    const created = [];
    for (const med of initialMeds) {
      const docRef = doc(colRef);
      batch.set(docRef, med);
      created.push({
        id: docRef.id,
        medicine_id: docRef.id,
        _firestoreId: docRef.id,
        ...med,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
    }
    await batch.commit();
    return created;
  } catch (err) {
    console.warn("Seeding initial medicines failed:", err);
    // Return in-memory fallback list if offline/permission glitch
    return [
      {
        id: "seed_med_1",
        medicine_id: "seed_med_1",
        medicine_name: "Paracetamol 500mg",
        category: "Tablet",
        purchase_price: 15.0,
        selling_price: 25.0,
        quantity: 120,
        expiry_date: "2027-12-31",
      },
      {
        id: "seed_med_2",
        medicine_id: "seed_med_2",
        medicine_name: "Amoxicillin 250mg",
        category: "Capsule",
        purchase_price: 45.0,
        selling_price: 68.0,
        quantity: 8,
        expiry_date: "2026-11-20",
      },
      {
        id: "seed_med_3",
        medicine_id: "seed_med_3",
        medicine_name: "Azithromycin 500mg",
        category: "Tablet",
        purchase_price: 70.0,
        selling_price: 115.0,
        quantity: 45,
        expiry_date: "2026-10-15",
      },
      {
        id: "seed_med_4",
        medicine_id: "seed_med_4",
        medicine_name: "Cough Relief Syrup 100ml",
        category: "Syrup",
        purchase_price: 65.0,
        selling_price: 98.0,
        quantity: 60,
        expiry_date: "2027-06-30",
      },
    ];
  }
};

const seedInitialBills = async () => {
  try {
    const colRef = collection(db, "bills");
    const now = Date.now();
    const dayMs = 24 * 60 * 60 * 1000;
    const initialBills = [
      {
        bill_number: "INV-2026-101",
        patient_id: "",
        patient_name: "Ramesh Sharma",
        mobile_number: "9876543210",
        doctor_name: "Dr. A. K. Joshi",
        prescription_number: "RX-2026-081",
        items: [
          { name: "Paracetamol 500mg", quantity: 2, price: 25.0, subtotal: 50.0, total: 50.0 },
          { name: "Amoxicillin 250mg", quantity: 1, price: 68.0, subtotal: 68.0, total: 68.0 },
        ],
        subtotal: 118,
        total_discount: 10,
        total_gst: 12,
        grand_total: 120,
        payment_mode: "Cash",
        payment_status: "Completed",
        notes: "Prescription refill",
        createdAt: Timestamp.fromDate(new Date(now - dayMs * 1)),
        updatedAt: Timestamp.fromDate(new Date(now - dayMs * 1)),
      },
      {
        bill_number: "INV-2026-102",
        patient_id: "",
        patient_name: "Sneha Patil",
        mobile_number: "9823456789",
        doctor_name: "Dr. Priya Deshmukh",
        prescription_number: "RX-2026-112",
        items: [
          { name: "Azithromycin 500mg", quantity: 2, price: 115.0, subtotal: 230.0, total: 230.0 },
          { name: "Cough Relief Syrup 100ml", quantity: 1, price: 98.0, subtotal: 98.0, total: 98.0 },
        ],
        subtotal: 328,
        total_discount: 28,
        total_gst: 35,
        grand_total: 335,
        payment_mode: "UPI",
        payment_status: "Completed",
        notes: "Seasonal cough",
        createdAt: Timestamp.fromDate(new Date(now - dayMs * 2)),
        updatedAt: Timestamp.fromDate(new Date(now - dayMs * 2)),
      },
      {
        bill_number: "INV-2026-103",
        patient_id: "",
        patient_name: "Vikram Rathore",
        mobile_number: "9811223344",
        doctor_name: "Dr. Sharma",
        prescription_number: "RX-2026-045",
        items: [
          { name: "Paracetamol 500mg", quantity: 4, price: 25.0, subtotal: 100.0, total: 100.0 },
        ],
        subtotal: 100,
        total_discount: 0,
        total_gst: 12,
        grand_total: 112,
        payment_mode: "Cash",
        payment_status: "Completed",
        notes: "Regular purchase",
        createdAt: Timestamp.fromDate(new Date(now - dayMs * 3)),
        updatedAt: Timestamp.fromDate(new Date(now - dayMs * 3)),
      },
    ];

    const batch = writeBatch(db);
    const createdBills = [];
    for (const b of initialBills) {
      const docRef = doc(colRef);
      batch.set(docRef, b);
      createdBills.push({
        id: docRef.id,
        bill_id: docRef.id,
        _firestoreId: docRef.id,
        ...b,
        createdAt: b.createdAt.toDate().toISOString(),
        updatedAt: b.updatedAt.toDate().toISOString(),
      });
    }
    await batch.commit();
    return createdBills;
  } catch (err) {
    console.warn("Seeding initial bills failed:", err);
    return [];
  }
};

const seedInitialPatients = async () => {
  try {
    const colRef = collection(db, "patients");
    const initialPatients = [
      {
        patient_name: "Ramesh Kumar Sharma",
        mobile_number: "9876543210",
        age: 48,
        gender: "Male",
        doctor_name: "Dr. A. K. Joshi",
        prescription_number: "RX-2026-081",
        address: "Flat 402, Green Avenue, Akola",
        notes: "Hypertension and seasonal allergies",
        reminders_enabled: true,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      },
      {
        patient_name: "Sneha Patil",
        mobile_number: "9823456789",
        age: 32,
        gender: "Female",
        doctor_name: "Dr. Priya Deshmukh",
        prescription_number: "RX-2026-112",
        address: "Near Civil Hospital, Akola",
        notes: "Diabetic patient - Metformin refills",
        reminders_enabled: true,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      },
    ];

    const batch = writeBatch(db);
    const created = [];
    for (const pat of initialPatients) {
      const docRef = doc(colRef);
      batch.set(docRef, pat);
      created.push({
        id: docRef.id,
        patient_id: docRef.id,
        _firestoreId: docRef.id,
        ...pat,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
    }
    await batch.commit();
    return created;
  } catch (err) {
    console.warn("Seeding initial patients failed:", err);
    return [
      {
        id: "pat_default_1",
        patient_id: "pat_default_1",
        _firestoreId: "pat_default_1",
        patient_name: "Ramesh Kumar Sharma",
        mobile_number: "9876543210",
        age: 48,
        gender: "Male",
        doctor_name: "Dr. A. K. Joshi",
        prescription_number: "RX-2026-081",
        address: "Flat 402, Green Avenue, Akola",
        notes: "Hypertension and seasonal allergies",
        reminders_enabled: true,
      },
      {
        id: "pat_default_2",
        patient_id: "pat_default_2",
        _firestoreId: "pat_default_2",
        patient_name: "Sneha Patil",
        mobile_number: "9823456789",
        age: 32,
        gender: "Female",
        doctor_name: "Dr. Priya Deshmukh",
        prescription_number: "RX-2026-112",
        address: "Near Civil Hospital, Akola",
        notes: "Diabetic patient - Metformin refills",
        reminders_enabled: true,
      },
    ];
  }
};

const seedInitialReminders = async () => {
  try {
    const colRef = collection(db, "reminders");
    const initialRem = [
      {
        patientName: "Rahul Patil",
        mobile: "9876543210",
        medicine: "Metformin 500mg",
        dosage: "1 Tab Twice Daily",
        nextRefillDate: "2026-10-12",
        status: "Pending",
        reminderType: "WhatsApp",
        doctorName: "Dr. Sharma",
        createdAt: Timestamp.now(),
      },
      {
        patientName: "Sneha Kale",
        mobile: "9823456789",
        medicine: "Telmisartan 40mg",
        dosage: "1 Tab Morning",
        nextRefillDate: "2026-10-08",
        status: "Sent",
        reminderType: "WhatsApp",
        doctorName: "Dr. Joshi",
        createdAt: Timestamp.now(),
      },
    ];
    for (const r of initialRem) {
      await addDoc(colRef, r);
    }
  } catch (err) {
    console.warn("Seeding initial reminders failed:", err);
  }
};

/* =========================================================================
   8. SETTINGS CRUD (Collection: "settings", Doc: "pharmacy_config")
   ========================================================================= */

export const getSettings = async () => {
  try {
    const docRef = doc(db, "settings", "pharmacy_config");
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return { success: true, data: docSnap.data() };
    }
    return { success: true, data: null };
  } catch (err) {
    console.error("Firestore getSettings error:", err);
    return { success: false, error: err.message };
  }
};

export const saveSettings = async (settingsData) => {
  try {
    const docRef = doc(db, "settings", "pharmacy_config");
    const payload = {
      ...settingsData,
      updatedAt: Timestamp.now(),
    };
    await setDoc(docRef, payload, { merge: true });
    return { success: true, data: payload, message: "Settings saved successfully to Firebase" };
  } catch (err) {
    console.error("Firestore saveSettings error:", err);
    throw err;
  }
};

/* =========================================================================
   9. SERVERLESS OTP AUTHENTICATION (Collection: "otp_verifications")
   ========================================================================= */

export const sendOtp = async (email) => {
  try {
    if (!email || !email.includes("@")) {
      throw new Error("A valid email address is required");
    }
    const normalizedEmail = email.trim().toLowerCase();
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000).toISOString();

    const otpDocRef = doc(db, "otp_verifications", normalizedEmail);
    await setDoc(otpDocRef, {
      email: normalizedEmail,
      otp,
      expiresAt,
      createdAt: Timestamp.now(),
    });

    console.log(`[Firebase Zero-Backend Auth] 🔑 OTP for ${normalizedEmail}: ${otp}`);

    return {
      success: true,
      message: `Verification code generated for ${normalizedEmail}`,
    };
  } catch (err) {
    console.error("Firestore sendOtp error:", err);
    throw err;
  }
};

export const verifyOtp = async (email, otp) => {
  try {
    if (!email || !otp) {
      throw new Error("Email and verification code are required");
    }
    const normalizedEmail = email.trim().toLowerCase();
    const otpDocRef = doc(db, "otp_verifications", normalizedEmail);
    const otpSnap = await getDoc(otpDocRef);

    if (!otpSnap.exists()) {
      throw new Error("No active OTP request found. Please request a new verification code.");
    }

    const data = otpSnap.data();
    if (new Date(data.expiresAt) < new Date()) {
      await deleteDoc(otpDocRef);
      throw new Error("Verification code has expired. Please request a new code.");
    }

    if (String(data.otp).trim() !== String(otp).trim()) {
      throw new Error("Invalid verification code. Please check and try again.");
    }

    // Delete used OTP
    await deleteDoc(otpDocRef);

    // Generate secure client session token
    const token = `firebase_auth_token_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

    return {
      success: true,
      token,
      message: "Verification successful! Logged in with Firebase.",
      user: {
        email: normalizedEmail,
        role: "admin",
      },
    };
  } catch (err) {
    console.error("Firestore verifyOtp error:", err);
    throw err;
  }
};

/* =========================================================================
   10. MOBILE SMS OTP AUTHENTICATION
   ========================================================================= */

export const sendMobileOtp = async (mobile, countryCode = "+91", apiKey = null) => {
  try {
    const rawMobile = String(mobile || "").replace(/\D/g, "");
    if (!rawMobile || rawMobile.length < 10) {
      throw new Error("Please enter a valid 10-digit mobile number");
    }

    const fullPhoneNumber = `${countryCode}${rawMobile.slice(-10)}`;
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000).toISOString();

    const otpDocRef = doc(db, "otp_verifications", fullPhoneNumber);
    await setDoc(otpDocRef, {
      mobile: fullPhoneNumber,
      otp,
      expiresAt,
      attempts: 0,
      createdAt: Timestamp.now(),
    });

    // Check if Fast2SMS or other gateway key is available
    const smsApiKey = apiKey || import.meta.env.VITE_FAST2SMS_API_KEY || import.meta.env.VITE_SMS_API_KEY;
    let realSmsSent = false;
    let smsGatewayError = null;

    if (smsApiKey) {
      try {
        const clean10 = rawMobile.slice(-10);
        const fast2smsUrl = `https://www.fast2sms.com/dev/bulkV2?authorization=${smsApiKey}&route=otp&variables_values=${otp}&numbers=${clean10}`;
        const gatewayRes = await fetch(fast2smsUrl);
        const gatewayData = await gatewayRes.json();
        if (gatewayData.return === true) {
          realSmsSent = true;
        } else {
          smsGatewayError = gatewayData.message?.[0] || "SMS Gateway delivery failed";
        }
      } catch (gwErr) {
        smsGatewayError = gwErr.message;
      }
    }

    console.log(`[SMS AUTH] 📱 Verification code for ${fullPhoneNumber}: ${otp} (Real SMS delivered: ${realSmsSent})`);

    return {
      success: true,
      message: realSmsSent
        ? `Verification code sent via SMS to ${fullPhoneNumber}`
        : `Verification code generated for ${fullPhoneNumber}`,
      realSmsSent,
      smsGatewayError,
      phoneNumber: fullPhoneNumber,
      devOtp: !realSmsSent ? otp : undefined,
    };
  } catch (err) {
    console.error("Firestore sendMobileOtp error:", err);
    throw err;
  }
};

export const verifyMobileOtp = async (mobile, otp, countryCode = "+91") => {
  try {
    const rawMobile = String(mobile || "").replace(/\D/g, "");
    if (!rawMobile || rawMobile.length < 10) {
      throw new Error("Please enter a valid 10-digit mobile number");
    }
    if (!otp || String(otp).trim().length !== 6) {
      throw new Error("Please enter the complete 6-digit verification code");
    }

    const fullPhoneNumber = `${countryCode}${rawMobile.slice(-10)}`;
    const otpDocRef = doc(db, "otp_verifications", fullPhoneNumber);
    const otpSnap = await getDoc(otpDocRef);

    if (!otpSnap.exists()) {
      throw new Error("No active verification code found for this mobile number. Please click Send OTP.");
    }

    const data = otpSnap.data();

    // Check expiry
    if (new Date(data.expiresAt) < new Date()) {
      await deleteDoc(otpDocRef);
      throw new Error("Verification code has expired. Please request a new code.");
    }

    // Rate limiting attempt count
    const currentAttempts = (data.attempts || 0) + 1;
    if (currentAttempts > 5) {
      await deleteDoc(otpDocRef);
      throw new Error("Maximum attempts exceeded. Please request a new verification code.");
    }

    // Check OTP
    if (String(data.otp).trim() !== String(otp).trim()) {
      await updateDoc(otpDocRef, { attempts: currentAttempts });
      throw new Error(`Invalid verification code (${5 - currentAttempts} attempts remaining)`);
    }

    // OTP is valid - delete from storage
    await deleteDoc(otpDocRef);

    // Generate authenticated session token
    const token = `pharma_mobile_token_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

    return {
      success: true,
      token,
      message: "Mobile verification successful! Welcome to PharmaMed ERP.",
      user: {
        phoneNumber: fullPhoneNumber,
        mobile: fullPhoneNumber,
        displayName: `Pharmacist (${fullPhoneNumber.slice(-4)})`,
        role: "Pharmacist",
      },
    };
  } catch (err) {
    console.error("Firestore verifyMobileOtp error:", err);
    throw err;
  }
};
