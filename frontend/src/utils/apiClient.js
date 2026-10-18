import * as firestoreService from "../services/firestoreService";

/**
 * Firebase Firestore API Client
 * Replaces legacy Node.js backend HTTP routes with direct Cloud Firestore CRUD operations.
 */

// Helper to normalize route URLs (e.g., "/api/medicines" or "/medicines" -> "medicines")
const cleanUrl = (url) => {
  let clean = url.replace(/^[a-zA-Z]+:\/\/[^/]+/, ""); // Remove domain if present
  clean = clean.replace(/^\/api\//, "/"); // Strip /api prefix
  clean = clean.replace(/^\//, ""); // Strip leading slash
  return clean.split("?")[0]; // Strip query params
};

const extractId = (url, prefix) => {
  const cleaned = cleanUrl(url);
  const parts = cleaned.split("/").filter(Boolean);
  if (parts.length === 0) return null;
  const last = parts[parts.length - 1];
  if (last !== "update" && last !== "bill" && last !== "bills") {
    return last;
  }
  return parts.length > 1 ? parts[1] : null;
};

const apiClient = {
  // GET OPERATIONS
  async get(url, config = {}) {
    const route = cleanUrl(url);

    try {
      // 1. Medicines
      if (route === "medicines") {
        const data = await firestoreService.getMedicines();
        return { data: { success: true, data } };
      }
      if (route.startsWith("medicines/")) {
        const id = extractId(route, "medicines");
        const data = await firestoreService.getMedicineById(id);
        return { data: { success: true, data } };
      }

      // 2. Patients
      if (route === "patients") {
        const data = await firestoreService.getPatients();
        return { data: { success: true, data } };
      }
      if (route.startsWith("patients/") && !route.includes("bill")) {
        const id = extractId(route, "patients");
        const data = await firestoreService.getPatientById(id);
        return { data: { success: true, data } };
      }

      // 3. Bills & Patient Bills
      if (
        route === "bills" ||
        route === "billing" ||
        route === "patient-bills" ||
        route === "patient/bills"
      ) {
        const data = await firestoreService.getBills();
        return { data: { success: true, data } };
      }
      if (
        route.startsWith("bills/") ||
        route.startsWith("billing/") ||
        route.startsWith("patient-bills/") ||
        route.startsWith("patient/bill/") ||
        route.startsWith("patient-bill/") ||
        (route.startsWith("patients/") && route.includes("bill"))
      ) {
        const id = extractId(route, "bills");
        const data = await firestoreService.getBillById(id);
        return {
          data: {
            success: true,
            data,
            bill: data,
            items: data?.items || [],
          },
        };
      }

      // 4. Inventory Logs
      if (route === "inventory" || route === "inventory/logs") {
        const data = await firestoreService.getInventoryLogs();
        return { data: { success: true, data } };
      }

      // 5. Reports & Analytics
      if (route === "reports/daily-sales") {
        const data = await firestoreService.getDailySalesReport();
        return { data: { success: true, data } };
      }
      if (route === "reports/low-stock") {
        const res = await firestoreService.getLowStockReport();
        return { data: { success: true, count: res.count, data: res.data } };
      }
      if (route === "reports/expiry" || route === "expiry") {
        const res = await firestoreService.getExpiryReport();
        return { data: { success: true, count: res.count, data: res.data } };
      }

      // 6. Reminders
      if (route === "reminders") {
        const data = await firestoreService.getReminders();
        return { data: { success: true, data } };
      }

      // 7. Settings
      if (route === "settings" || route === "settings/pharmacy") {
        const res = await firestoreService.getSettings();
        return { data: res };
      }

      // 8. Return Bills
      if (route === "return-bills" || route === "expiry/return-bills") {
        const data = await firestoreService.getReturnBills();
        return { data: { success: true, data } };
      }

      // 9. Suppliers
      if (route === "suppliers") {
        const data = await firestoreService.getSuppliers();
        return { data: { success: true, data } };
      }
      if (route.startsWith("suppliers/")) {
        const id = extractId(route, "suppliers");
        const data = await firestoreService.getSupplierById(id);
        return { data: { success: true, data } };
      }

      console.warn(`[Firestore apiClient] Unhandled GET route: ${url}`);
      return { data: { success: true, data: [] } };
    } catch (error) {
      console.error(`[Firestore apiClient GET Error] ${url}:`, error);
      throw { response: { data: { success: false, message: error.message } } };
    }
  },

  // POST OPERATIONS
  async post(url, payload = {}, config = {}) {
    const route = cleanUrl(url);

    try {
      // 1. Medicines
      if (route === "medicines") {
        const created = await firestoreService.createMedicine(payload);
        return { data: { success: true, data: created, message: "Medicine created successfully" } };
      }
      if (route === "medicines/bulk" || route === "inventory/upload") {
        const items = payload.medicines || (Array.isArray(payload) ? payload : []);
        const res = await firestoreService.bulkCreateMedicines(items);
        return {
          data: {
            success: true,
            count: res.count,
            data: { insertedRows: res.count },
            message: "Medicines uploaded successfully",
          },
        };
      }

      // 2. Patients
      if (route === "patients") {
        const created = await firestoreService.createPatient(payload);
        return { data: { success: true, data: created, message: "Patient registered successfully" } };
      }

      // 3. Bills & Patient Bills
      if (
        route === "bills" ||
        route === "billing" ||
        route === "patient-bills" ||
        route === "patient/bills"
      ) {
        const created = await firestoreService.createBill(payload);
        return { data: { success: true, data: created, message: "Bill generated successfully" } };
      }
      if (
        route.startsWith("bills/") ||
        route.startsWith("billing/") ||
        route.startsWith("patient-bills/") ||
        route.startsWith("patient/bill/") ||
        route.startsWith("patient-bill/") ||
        (route.startsWith("patients/") && route.includes("bill"))
      ) {
        const id = extractId(route, "bills");
        const updated = await firestoreService.updateBill(id, payload);
        return { data: { success: true, data: updated, message: "Bill updated successfully" } };
      }

      // 4. Inventory Stock-In & Stock-Out
      if (route === "inventory/stock-in") {
        const res = await firestoreService.addStockIn(payload);
        return { data: { success: true, ...res, message: "Stock-in recorded successfully" } };
      }
      if (route === "inventory/stock-out") {
        const res = await firestoreService.addStockOut(payload);
        return { data: { success: true, ...res, message: "Stock deducted successfully" } };
      }

      // 5. Reminders
      if (route === "reminders") {
        const created = await firestoreService.createReminder(payload);
        return { data: { success: true, data: created, message: "Reminder added successfully" } };
      }

      // 6. Settings
      if (route === "settings" || route === "settings/pharmacy") {
        const res = await firestoreService.saveSettings(payload);
        return { data: res };
      }

      // 7. Serverless OTP Auth
      if (route === "auth/send-otp") {
        const res = await firestoreService.sendOtp(payload.email);
        return { data: res };
      }
      if (route === "auth/verify-otp") {
        const res = await firestoreService.verifyOtp(payload.email, payload.otp);
        return { data: res };
      }
      if (route === "auth/send-mobile-otp") {
        const res = await firestoreService.sendMobileOtp(payload.mobile, payload.countryCode, payload.apiKey);
        return { data: res };
      }
      if (route === "auth/verify-mobile-otp") {
        const res = await firestoreService.verifyMobileOtp(payload.mobile, payload.otp, payload.countryCode);
        return { data: res };
      }

      // 8. Manufacturer Return Bill
      if (
        route === "expiry/return-bill" ||
        route === "return-bill" ||
        route === "inventory/return-bill" ||
        route === "expiry/return"
      ) {
        const res = await firestoreService.processReturnBill(payload);
        return { data: { success: true, ...res } };
      }

      // 9. Suppliers
      if (route === "suppliers") {
        const created = await firestoreService.createSupplier(payload);
        return { data: { success: true, data: created, message: "Supplier registered successfully" } };
      }

      console.warn(`[Firestore apiClient] Unhandled POST route: ${url}`);
      return { data: { success: true, data: payload } };
    } catch (error) {
      console.error(`[Firestore apiClient POST Error] ${url}:`, error);
      throw { response: { data: { success: false, message: error.message } } };
    }
  },

  // PUT OPERATIONS
  async put(url, payload = {}, config = {}) {
    const route = cleanUrl(url);

    try {
      if (route.startsWith("medicines/")) {
        const id = extractId(route, "medicines");
        const updated = await firestoreService.updateMedicine(id, payload);
        return { data: { success: true, data: updated, message: "Medicine updated successfully" } };
      }

      if (
        route.startsWith("bills/") ||
        route.startsWith("billing/") ||
        route.startsWith("patient-bills/") ||
        route.startsWith("patient/bill/") ||
        route.startsWith("patient-bill/") ||
        (route.startsWith("patients/") && route.includes("bill"))
      ) {
        const id = extractId(route, "bills");
        const updated = await firestoreService.updateBill(id, payload);
        return { data: { success: true, data: updated, message: "Bill updated successfully" } };
      }

      if (route.startsWith("patients/")) {
        const id = extractId(route, "patients");
        const updated = await firestoreService.updatePatient(id, payload);
        return { data: { success: true, data: updated, message: "Patient updated successfully" } };
      }

      if (route.startsWith("reminders/")) {
        const id = extractId(route, "reminders");
        const updated = await firestoreService.updateReminder(id, payload);
        return { data: { success: true, data: updated, message: "Reminder updated successfully" } };
      }

      if (route.startsWith("suppliers/")) {
        const id = extractId(route, "suppliers");
        const updated = await firestoreService.updateSupplier(id, payload);
        return { data: { success: true, data: updated, message: "Supplier updated successfully" } };
      }

      if (route === "settings" || route === "settings/pharmacy") {
        const res = await firestoreService.saveSettings(payload);
        return { data: res };
      }

      console.warn(`[Firestore apiClient] Unhandled PUT route: ${url}`);
      return { data: { success: true } };
    } catch (error) {
      console.error(`[Firestore apiClient PUT Error] ${url}:`, error);
      throw { response: { data: { success: false, message: error.message } } };
    }
  },

  // DELETE OPERATIONS
  async delete(url, config = {}) {
    const route = cleanUrl(url);

    try {
      if (route.startsWith("medicines/")) {
        const id = extractId(route, "medicines");
        await firestoreService.deleteMedicine(id);
        return { data: { success: true, message: "Medicine deleted successfully" } };
      }

      if (
        route.startsWith("bills/") ||
        route.startsWith("billing/") ||
        route.startsWith("patient-bills/") ||
        route.startsWith("patient/bill/") ||
        route.startsWith("patient-bill/") ||
        (route.startsWith("patients/") && route.includes("bill"))
      ) {
        const id = extractId(route, "bills");
        const reason = config?.data?.reason || "Cancelled via billing history";
        await firestoreService.deleteBill(id, reason);
        return { data: { success: true, message: "Bill deleted and stock restored successfully" } };
      }

      if (route.startsWith("patients/")) {
        const id = extractId(route, "patients");
        await firestoreService.deletePatient(id);
        return { data: { success: true, message: "Patient deleted successfully" } };
      }

      if (route.startsWith("reminders/")) {
        const id = extractId(route, "reminders");
        await firestoreService.deleteReminder(id);
        return { data: { success: true, message: "Reminder deleted successfully" } };
      }

      console.warn(`[Firestore apiClient] Unhandled DELETE route: ${url}`);
      return { data: { success: true } };
    } catch (error) {
      console.error(`[Firestore apiClient DELETE Error] ${url}:`, error);
      throw { response: { data: { success: false, message: error.message } } };
    }
  },


  // PATCH OPERATIONS
  async patch(url, payload = {}, config = {}) {
    const route = cleanUrl(url);

    try {
      if (route.startsWith("patients/") && route.includes("reminders")) {
        const id = extractId(route, "patients");
        const updated = await firestoreService.togglePatientReminders(id, payload.reminders_enabled);
        return { data: { success: true, data: updated, message: "Reminder status updated" } };
      }

      return this.put(url, payload, config);
    } catch (error) {
      console.error(`[Firestore apiClient PATCH Error] ${url}:`, error);
      throw { response: { data: { success: false, message: error.message } } };
    }
  },
};

export default apiClient;
