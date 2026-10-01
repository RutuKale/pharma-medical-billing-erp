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
      await seedInitialData();
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
   2. PATIENTS CRUD (Collection: "patients")
   ========================================================================= */

export const getPatients = async () => {
  try {
    const colRef = collection(db, "patients");
    const snapshot = await getDocs(colRef);
    if (snapshot.empty) {
      await seedInitialPatients();
      const freshSnap = await getDocs(colRef);
      return freshSnap.docs.map((d) => formatDoc(d, "patient_id"));
    }
    return snapshot.docs.map((d) => formatDoc(d, "patient_id"));
  } catch (err) {
    console.error("Firestore getPatients error:", err);
    throw err;
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
    return snapshot.docs
      .map((d) => formatDoc(d, "bill_id"))
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  } catch (err) {
    console.error("Firestore getBills error:", err);
    throw err;
  }
};

export const getBillById = async (id) => {
  const docRef = doc(db, "bills", String(id));
  const docSnap = await getDoc(docRef);
  return formatDoc(docSnap, "bill_id");
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
    const docRef = doc(db, "bills", String(id));
    const billSnap = await getDoc(docRef);

    const rawBill = updateData.bill || updateData;
    const newItems = updateData.items || rawBill.items;

    // If new items are provided, synchronize inventory stock
    if (billSnap.exists() && Array.isArray(newItems) && newItems.length > 0) {
      const oldBill = billSnap.data();
      const oldItems = oldBill.items || [];

      // 1. Revert previous stock deductions
      for (const oldIt of oldItems) {
        const medId = oldIt.medicine_id || oldIt.id;
        if (medId) {
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
        }
      }

      // 2. Deduct stock for new items
      for (const newIt of newItems) {
        const medId = newIt.medicine_id || newIt.id;
        if (medId) {
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
        }
      }
    }

    const payload = {
      ...rawBill,
      ...(newItems ? { items: newItems } : {}),
      updatedAt: Timestamp.now(),
    };

    await updateDoc(docRef, payload);
    return { id, bill_id: id, ...payload };
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

    for (const med of initialMeds) {
      await addDoc(colRef, med);
    }
  } catch (err) {
    console.warn("Seeding initial medicines failed:", err);
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

    for (const pat of initialPatients) {
      await addDoc(colRef, pat);
    }
  } catch (err) {
    console.warn("Seeding initial patients failed:", err);
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
      devOtp: otp,
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
