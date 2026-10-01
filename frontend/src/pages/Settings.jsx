import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Swal from "sweetalert2";
import apiClient from "../utils/apiClient";
import {
  Building2,
  IndianRupee,
  BellRing,
  ShieldCheck,
  Save,
  Upload,
  Phone,
  Mail,
  MapPin,
  Percent,
  AlertTriangle,
  Clock3,
  UserCog,
  Shield,
  TrendingUp,
  Database,
  RotateCcw,
  CheckCircle2,
  Sliders,
  FileText,
  Download,
  Info,
  Layers,
  ArrowRight,
} from "lucide-react";

const Settings = () => {
  const [activeTab, setActiveTab] = useState("all");

  const [settings, setSettings] = useState({
    // PHARMACY
    pharmacyName: "PharmaCare Pro",
    ownerName: "Rutuja Kale",
    mobile: "9876543210",
    email: "pharmacy@gmail.com",
    address: "Main Road, Akola, Maharashtra 444001",
    drugLicenseNumber: "MH-AKL-2023-DL8841",
    // GST & BILLING
    gstNumber: "27ABCDE1234F1Z5",
    gstPercentage: 18,
    invoicePrefix: "INV-",
    invoiceStartNumber: 1001,
    invoiceFooterNote: "Goods once sold will only be accepted for return within 7 days with valid tax invoice.",
    // ALERTS
    lowStockThreshold: 10,
    expiryAlertDays: 30,
    preventZeroStockBilling: true,
    // WHATSAPP
    whatsappEnabled: true,
    whatsappNumber: "919876543210",
    autoSendInvoiceWhatsApp: true,
    // SYSTEM
    autoBackup: true,
    adminName: "Admin User",
    currency: "INR (₹)",
  });

  const [isSaving, setIsSaving] = useState(false);
  const [logoPreview, setLogoPreview] = useState(null);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await apiClient.get("/settings");
        if (res.data?.data) {
          setSettings((prev) => ({
            ...prev,
            ...res.data.data,
          }));
        }
      } catch (err) {
        console.error("Error loading settings from Firestore:", err);
      }
    };
    fetchSettings();
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setSettings((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleLogoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result);
        Swal.fire({
          icon: "success",
          title: "Logo Loaded",
          text: "Pharmacy logo preview updated. Click 'Save Settings' to apply.",
          timer: 2000,
          showConfirmButton: false,
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await apiClient.post("/settings", settings);

      // Also sync key billing details to localStorage for invoice generator
      if (settings.pharmacyName) localStorage.setItem("pharmacy_name", settings.pharmacyName);
      if (settings.address) localStorage.setItem("pharmacy_address", settings.address);
      if (settings.mobile) localStorage.setItem("pharmacy_phone", settings.mobile);
      if (settings.gstNumber) localStorage.setItem("pharmacy_gst", settings.gstNumber);
      if (settings.drugLicenseNumber) localStorage.setItem("pharmacy_dl", settings.drugLicenseNumber);

      Swal.fire({
        icon: "success",
        title: "Settings Saved to Firebase",
        text: "Pharmacy profile, GST rules, and alert thresholds synced with Firestore successfully.",
        confirmButtonColor: "#2563eb",
        timer: 2500,
        timerProgressBar: true,
      });
    } catch (err) {
      console.error("Failed to save settings to Firestore:", err);
      Swal.fire({
        icon: "error",
        title: "Save Failed",
        text: "Could not save settings to Firebase. Please try again.",
        confirmButtonColor: "#ef4444",
      });
    } finally {
      setIsSaving(false);
    }
  };


  const handleReset = () => {
    Swal.fire({
      title: "Reset to Defaults?",
      text: "This will revert your settings back to initial pharmacy defaults.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#2563eb",
      cancelButtonColor: "#94a3b8",
      confirmButtonText: "Yes, restore",
      cancelButtonText: "Cancel",
    }).then((result) => {
      if (result.isConfirmed) {
        setSettings({
          pharmacyName: "PharmaCare Pro",
          ownerName: "Rutuja Kale",
          mobile: "9876543210",
          email: "pharmacy@gmail.com",
          address: "Main Road, Akola, Maharashtra 444001",
          drugLicenseNumber: "MH-AKL-2023-DL8841",
          gstNumber: "27ABCDE1234F1Z5",
          gstPercentage: 18,
          invoicePrefix: "INV-",
          invoiceStartNumber: 1001,
          invoiceFooterNote: "Goods once sold will only be accepted for return within 7 days with valid tax invoice.",
          lowStockThreshold: 10,
          expiryAlertDays: 30,
          preventZeroStockBilling: true,
          whatsappEnabled: true,
          whatsappNumber: "919876543210",
          autoSendInvoiceWhatsApp: true,
          autoBackup: true,
          adminName: "Admin User",
          currency: "INR (₹)",
        });
        setLogoPreview(null);
        Swal.fire({
          icon: "success",
          title: "Defaults Restored",
          text: "Configuration has been reset to system defaults.",
          confirmButtonColor: "#2563eb",
          timer: 1800,
          showConfirmButton: false,
        });
      }
    });
  };

  const handleExportConfig = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(settings, null, 2));
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `pharmacare_settings_${new Date().toISOString().split("T")[0]}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();

    Swal.fire({
      icon: "success",
      title: "Config Exported",
      text: "Configuration JSON backup downloaded successfully.",
      confirmButtonColor: "#2563eb",
      timer: 2000,
      showConfirmButton: false,
    });
  };

  const tabs = [
    { id: "all", label: "All Settings" },
    { id: "profile", label: "Pharmacy Profile" },
    { id: "billing", label: "GST & Billing" },
    { id: "alerts", label: "Alerts & WhatsApp" },
    { id: "system", label: "System & Security" },
  ];

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-[1600px] mx-auto space-y-6">
      {/* Page Header (No icon next to title) */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Settings
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Configure pharmacy profile, tax rules, invoice preferences, and automated alert parameters.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={handleReset}
            type="button"
            className="px-4 py-2.5 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 hover:text-slate-900 text-sm font-medium rounded-xl shadow-xs transition-colors flex items-center gap-2"
          >
            <RotateCcw size={16} className="text-slate-500" />
            Reset Defaults
          </button>

          <button
            onClick={handleExportConfig}
            type="button"
            className="px-4 py-2.5 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 hover:text-slate-900 text-sm font-medium rounded-xl shadow-xs transition-colors flex items-center gap-2"
          >
            <Download size={16} className="text-slate-500" />
            Export Backup
          </button>

          <button
            onClick={handleSave}
            disabled={isSaving}
            type="button"
            className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl shadow-sm shadow-blue-500/20 transition-all flex items-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isSaving ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Saving Changes...
              </>
            ) : (
              <>
                <Save size={16} />
                Save Settings
              </>
            )}
          </button>
        </div>
      </div>

      {/* 4 Overview Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Pharmacy Identity */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-xs hover:shadow-sm transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Pharmacy Identity
            </span>
            <div className="p-2 rounded-xl bg-blue-50 text-blue-600 border border-blue-100">
              <Building2 size={18} />
            </div>
          </div>
          <div className="mt-3">
            <h3 className="text-lg font-bold text-slate-900 truncate">
              {settings.pharmacyName || "PharmaCare Pro"}
            </h3>
            <p className="text-xs text-slate-500 mt-1 truncate">
              Owner: {settings.ownerName}
            </p>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-slate-400">License</span>
            <span className="font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md">
              {settings.drugLicenseNumber}
            </span>
          </div>
        </div>

        {/* Card 2: GST & Invoicing */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-xs hover:shadow-sm transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              GST & Billing
            </span>
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100">
              <IndianRupee size={18} />
            </div>
          </div>
          <div className="mt-3">
            <h3 className="text-lg font-bold text-slate-900">
              {settings.gstPercentage}% Default GST
            </h3>
            <p className="text-xs text-slate-500 mt-1 truncate">
              Prefix: {settings.invoicePrefix} (Start #{settings.invoiceStartNumber})
            </p>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-slate-400">GSTIN</span>
            <span className="font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md truncate max-w-[140px]">
              {settings.gstNumber}
            </span>
          </div>
        </div>

        {/* Card 3: Alert Thresholds */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-xs hover:shadow-sm transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Stock & Expiry
            </span>
            <div className="p-2 rounded-xl bg-amber-50 text-amber-600 border border-amber-100">
              <AlertTriangle size={18} />
            </div>
          </div>
          <div className="mt-3">
            <h3 className="text-lg font-bold text-slate-900">
              &le; {settings.lowStockThreshold} Units Alert
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Expiry notice: {settings.expiryAlertDays} days in advance
            </p>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-slate-400">Zero Stock Sale</span>
            <span
              className={`font-semibold px-2 py-0.5 rounded-md ${
                settings.preventZeroStockBilling
                  ? "bg-rose-50 text-rose-700"
                  : "bg-slate-100 text-slate-700"
              }`}
            >
              {settings.preventZeroStockBilling ? "Blocked" : "Allowed"}
            </span>
          </div>
        </div>

        {/* Card 4: WhatsApp & Backups */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-xs hover:shadow-sm transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Automation & Cloud
            </span>
            <div className="p-2 rounded-xl bg-purple-50 text-purple-600 border border-purple-100">
              <BellRing size={18} />
            </div>
          </div>
          <div className="mt-3">
            <h3 className="text-lg font-bold text-slate-900">
              {settings.whatsappEnabled ? "WhatsApp Active" : "WhatsApp Inactive"}
            </h3>
            <p className="text-xs text-slate-500 mt-1 truncate">
              Backup: {settings.autoBackup ? "Daily Scheduled" : "Manual Only"}
            </p>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-slate-400">System Mode</span>
            <span className="font-semibold text-purple-700 bg-purple-50 px-2 py-0.5 rounded-md flex items-center gap-1">
              <CheckCircle2 size={12} className="text-purple-600" />
              Production
            </span>
          </div>
        </div>
      </div>

      {/* Navigation Filter Tabs */}
      <div className="flex items-center gap-1.5 p-1 bg-slate-100/80 rounded-xl overflow-x-auto">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            type="button"
            className={`px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold whitespace-nowrap transition-all ${
              activeTab === tab.id
                ? "bg-white text-blue-600 shadow-xs"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/50"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Main Settings Sections */}
      <div className="space-y-6">
        {/* SECTION 1: Pharmacy Profile & Branding */}
        {(activeTab === "all" || activeTab === "profile") && (
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-blue-50 text-blue-600 border border-blue-100">
                  <Building2 size={18} />
                </div>
                <div>
                  <h2 className="text-base font-bold text-slate-900">
                    Pharmacy Profile & Official Details
                  </h2>
                  <p className="text-xs text-slate-500">
                    Information displayed on printed invoices, delivery receipts, and patient reminders.
                  </p>
                </div>
              </div>
              <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-100">
                Core Identity
              </span>
            </div>

            <div className="p-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Form fields (2 cols) */}
                <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1.5">
                      Pharmacy Trade Name <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="pharmacyName"
                      value={settings.pharmacyName}
                      onChange={handleChange}
                      placeholder="e.g. PharmaCare Pro"
                      className="w-full bg-slate-50/60 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1.5">
                      Owner / Pharmacist Name <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="ownerName"
                      value={settings.ownerName}
                      onChange={handleChange}
                      placeholder="e.g. Rutuja Kale"
                      className="w-full bg-slate-50/60 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1.5">
                      Contact Mobile <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <Phone size={16} className="absolute left-3.5 top-3 text-slate-400" />
                      <input
                        type="text"
                        name="mobile"
                        value={settings.mobile}
                        onChange={handleChange}
                        placeholder="10-digit mobile number"
                        className="w-full bg-slate-50/60 border border-slate-200 rounded-xl pl-10 pr-3.5 py-2.5 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1.5">
                      Official Email Address <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <Mail size={16} className="absolute left-3.5 top-3 text-slate-400" />
                      <input
                        type="email"
                        name="email"
                        value={settings.email}
                        onChange={handleChange}
                        placeholder="pharmacy@domain.com"
                        className="w-full bg-slate-50/60 border border-slate-200 rounded-xl pl-10 pr-3.5 py-2.5 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium"
                      />
                    </div>
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1.5">
                      Drug License Number
                    </label>
                    <input
                      type="text"
                      name="drugLicenseNumber"
                      value={settings.drugLicenseNumber}
                      onChange={handleChange}
                      placeholder="e.g. MH-AKL-2023-DL8841"
                      className="w-full bg-slate-50/60 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1.5">
                      Premises Address & Pincode
                    </label>
                    <div className="relative">
                      <MapPin size={16} className="absolute left-3.5 top-3 text-slate-400" />
                      <textarea
                        rows={2}
                        name="address"
                        value={settings.address}
                        onChange={handleChange}
                        placeholder="Street, locality, city, state, postal code"
                        className="w-full bg-slate-50/60 border border-slate-200 rounded-xl pl-10 pr-3.5 py-2.5 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium resize-none"
                      />
                    </div>
                  </div>
                </div>

                {/* Logo & Branding Zone (1 col) */}
                <div className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50/40 text-center hover:bg-slate-50/80 transition-colors">
                  {logoPreview ? (
                    <div className="space-y-3">
                      <img
                        src={logoPreview}
                        alt="Pharmacy Logo"
                        className="w-24 h-24 object-contain mx-auto rounded-xl border border-slate-200 bg-white p-1 shadow-xs"
                      />
                      <p className="text-xs font-medium text-emerald-600 flex items-center justify-center gap-1">
                        <CheckCircle2 size={14} /> Logo Uploaded
                      </p>
                      <label className="inline-block px-3 py-1.5 bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 rounded-lg text-xs font-semibold cursor-pointer shadow-xs">
                        Change Logo
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={handleLogoUpload}
                        />
                      </label>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-600 border border-blue-100 flex items-center justify-center mx-auto">
                        <Upload size={24} />
                      </div>
                      <h4 className="text-sm font-bold text-slate-800">
                        Pharmacy Logo
                      </h4>
                      <p className="text-xs text-slate-500 max-w-xs">
                        Upload brand mark for invoice letterheads (PNG/JPG, max 2MB).
                      </p>
                      <label className="inline-block mt-2 px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold cursor-pointer shadow-xs transition-colors">
                        Select Image
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={handleLogoUpload}
                        />
                      </label>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* SECTION 2: GST & Invoicing Configuration */}
        {(activeTab === "all" || activeTab === "billing") && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* GST Card */}
            <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100">
                    <Percent size={18} />
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-slate-900">
                      GST & Tax Parameters
                    </h2>
                    <p className="text-xs text-slate-500">
                      Standard goods and services tax applied during POS billing.
                    </p>
                  </div>
                </div>
                <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-100">
                  Tax Setup
                </span>
              </div>

              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1.5">
                    GSTIN / Tax Identification <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="gstNumber"
                    value={settings.gstNumber}
                    onChange={handleChange}
                    placeholder="e.g. 27ABCDE1234F1Z5"
                    className="w-full bg-slate-50/60 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all font-mono font-medium"
                  />
                  <p className="text-xs text-slate-400 mt-1">
                    15-character alphanumeric GST registration code.
                  </p>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider">
                      Default GST Rate (%)
                    </label>
                    <div className="flex items-center gap-1.5">
                      {[0, 5, 12, 18, 28].map((rate) => (
                        <button
                          key={rate}
                          type="button"
                          onClick={() =>
                            setSettings((prev) => ({ ...prev, gstPercentage: rate }))
                          }
                          className={`px-2 py-0.5 text-xs rounded-md font-semibold border transition-all ${
                            Number(settings.gstPercentage) === rate
                              ? "bg-emerald-600 text-white border-emerald-600 shadow-2xs"
                              : "bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200"
                          }`}
                        >
                          {rate}%
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="relative">
                    <input
                      type="number"
                      name="gstPercentage"
                      value={settings.gstPercentage}
                      onChange={handleChange}
                      min="0"
                      max="100"
                      className="w-full bg-slate-50/60 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all font-medium"
                    />
                    <span className="absolute right-3.5 top-2.5 text-sm font-semibold text-slate-400">
                      %
                    </span>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1.5">
                    Currency Symbol
                  </label>
                  <input
                    type="text"
                    name="currency"
                    value={settings.currency}
                    onChange={handleChange}
                    className="w-full bg-slate-50/60 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all font-medium"
                  />
                </div>
              </div>
            </div>

            {/* Invoicing Settings Card */}
            <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-purple-50 text-purple-600 border border-purple-100">
                    <IndianRupee size={18} />
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-slate-900">
                      Invoice Sequence & Layout
                    </h2>
                    <p className="text-xs text-slate-500">
                      Auto-numbering format and disclaimer notes for patient receipts.
                    </p>
                  </div>
                </div>
                <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-purple-50 text-purple-700 border border-purple-100">
                  Billing Format
                </span>
              </div>

              <div className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1.5">
                      Invoice Prefix
                    </label>
                    <input
                      type="text"
                      name="invoicePrefix"
                      value={settings.invoicePrefix}
                      onChange={handleChange}
                      placeholder="e.g. INV-"
                      className="w-full bg-slate-50/60 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all font-mono font-medium"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1.5">
                      Starting Bill #
                    </label>
                    <input
                      type="number"
                      name="invoiceStartNumber"
                      value={settings.invoiceStartNumber}
                      onChange={handleChange}
                      min="1"
                      className="w-full bg-slate-50/60 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all font-mono font-medium"
                    />
                  </div>
                </div>

                <div className="p-3 bg-purple-50/60 border border-purple-100 rounded-xl text-xs text-purple-900 flex items-center justify-between">
                  <span className="font-medium">Next Generated Bill Number:</span>
                  <span className="font-mono font-bold text-purple-700 bg-white px-2.5 py-1 rounded-md border border-purple-200">
                    {settings.invoicePrefix}
                    {settings.invoiceStartNumber}
                  </span>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1.5">
                    Invoice Footer Disclaimer Note
                  </label>
                  <textarea
                    rows={2}
                    name="invoiceFooterNote"
                    value={settings.invoiceFooterNote}
                    onChange={handleChange}
                    placeholder="Notice printed at bottom of every sales receipt"
                    className="w-full bg-slate-50/60 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all font-medium resize-none"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* SECTION 3: Alerts & WhatsApp Automation */}
        {(activeTab === "all" || activeTab === "alerts") && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Inventory Alerts Card */}
            <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-amber-50 text-amber-600 border border-amber-100">
                    <AlertTriangle size={18} />
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-slate-900">
                      Inventory Alert Thresholds
                    </h2>
                    <p className="text-xs text-slate-500">
                      Define triggers for low inventory warnings and shelf expiration checks.
                    </p>
                  </div>
                </div>
                <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-100">
                  Stock Rules
                </span>
              </div>

              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1.5">
                    Low Stock Threshold (Units)
                  </label>
                  <input
                    type="number"
                    name="lowStockThreshold"
                    value={settings.lowStockThreshold}
                    onChange={handleChange}
                    min="1"
                    className="w-full bg-slate-50/60 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all font-medium"
                  />
                  <p className="text-xs text-slate-400 mt-1">
                    Medicines with remaining stock at or below this value appear in Low Stock notifications.
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1.5">
                    Expiry Alert Advance Notice (Days)
                  </label>
                  <input
                    type="number"
                    name="expiryAlertDays"
                    value={settings.expiryAlertDays}
                    onChange={handleChange}
                    min="7"
                    className="w-full bg-slate-50/60 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all font-medium"
                  />
                  <p className="text-xs text-slate-400 mt-1">
                    Batches expiring within this window will be flagged under Expiry Alerts.
                  </p>
                </div>

                <div className="flex items-center justify-between p-3.5 border border-slate-200/90 rounded-xl bg-slate-50/60 hover:bg-slate-50 transition-colors">
                  <div>
                    <h4 className="text-sm font-bold text-slate-800">
                      Block Zero-Stock Dispensing
                    </h4>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Prevents billing drugs when available inventory is zero.
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      name="preventZeroStockBilling"
                      checked={settings.preventZeroStockBilling}
                      onChange={handleChange}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>
              </div>
            </div>

            {/* WhatsApp Integration Card */}
            <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100">
                    <BellRing size={18} />
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-slate-900">
                      WhatsApp Dispatch & Reminders
                    </h2>
                    <p className="text-xs text-slate-500">
                      Send prescription refill reminders and invoice receipts directly to patients.
                    </p>
                  </div>
                </div>
                <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-100">
                  Automation
                </span>
              </div>

              <div className="p-6 space-y-4">
                <div className="flex items-center justify-between p-3.5 border border-slate-200/90 rounded-xl bg-slate-50/60 hover:bg-slate-50 transition-colors">
                  <div>
                    <h4 className="text-sm font-bold text-slate-800">
                      Enable Refill Reminders
                    </h4>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Sends refill alerts 3 days prior to course exhaustion.
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      name="whatsappEnabled"
                      checked={settings.whatsappEnabled}
                      onChange={handleChange}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between p-3.5 border border-slate-200/90 rounded-xl bg-slate-50/60 hover:bg-slate-50 transition-colors">
                  <div>
                    <h4 className="text-sm font-bold text-slate-800">
                      Auto-Send Invoice on Checkout
                    </h4>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Sends PDF receipt link to patient's WhatsApp after billing.
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      name="autoSendInvoiceWhatsApp"
                      checked={settings.autoSendInvoiceWhatsApp}
                      onChange={handleChange}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                  </label>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1.5">
                    Registered WhatsApp Business Phone
                  </label>
                  <div className="relative">
                    <Phone size={16} className="absolute left-3.5 top-3 text-slate-400" />
                    <input
                      type="text"
                      name="whatsappNumber"
                      value={settings.whatsappNumber}
                      onChange={handleChange}
                      placeholder="e.g. 919876543210 (with country code)"
                      className="w-full bg-slate-50/60 border border-slate-200 rounded-xl pl-10 pr-3.5 py-2.5 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all font-medium"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* SECTION 4: System & Security Controls */}
        {(activeTab === "all" || activeTab === "system") && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* System Preferences */}
            <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-blue-50 text-blue-600 border border-blue-100">
                    <Database size={18} />
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-slate-900">
                      Backup & Database Continuity
                    </h2>
                    <p className="text-xs text-slate-500">
                      Automated snapshots of pharmacy transactions and patient profiles.
                    </p>
                  </div>
                </div>
                <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-100">
                  Data Safety
                </span>
              </div>

              <div className="p-6 space-y-4">
                <div className="flex items-center justify-between p-3.5 border border-slate-200/90 rounded-xl bg-slate-50/60 hover:bg-slate-50 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-blue-100/60 text-blue-700">
                      <Database size={18} />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-800">
                        Automatic Daily Backup
                      </h4>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Nightly encrypted sync of sales, invoices, and drug inventory.
                      </p>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      name="autoBackup"
                      checked={settings.autoBackup}
                      onChange={handleChange}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>

                <div className="p-4 bg-slate-50 border border-slate-200/80 rounded-xl flex items-center justify-between text-xs text-slate-600">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 size={16} className="text-emerald-600" />
                    <span>Last backup snapshot created:</span>
                  </div>
                  <span className="font-semibold text-slate-800 font-mono">
                    Today at 03:00 AM (2.4 MB)
                  </span>
                </div>
              </div>
            </div>

            {/* Admin Security */}
            <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-indigo-50 text-indigo-600 border border-indigo-100">
                    <ShieldCheck size={18} />
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-slate-900">
                      Operator Profile & System Access
                    </h2>
                    <p className="text-xs text-slate-500">
                      Administrator credentials and role privileges.
                    </p>
                  </div>
                </div>
                <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-100">
                  Role: Master
                </span>
              </div>

              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1.5">
                    Administrator Display Handle
                  </label>
                  <div className="relative">
                    <UserCog size={16} className="absolute left-3.5 top-3 text-slate-400" />
                    <input
                      type="text"
                      name="adminName"
                      value={settings.adminName}
                      onChange={handleChange}
                      placeholder="e.g. Admin User"
                      className="w-full bg-slate-50/60 border border-slate-200 rounded-xl pl-10 pr-3.5 py-2.5 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium"
                    />
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-blue-50/50 border border-blue-100 text-xs text-slate-600 flex items-start gap-2.5">
                  <Info size={16} className="text-blue-600 mt-0.5 shrink-0" />
                  <p>
                    All billing terminals, inventory updates, and CSV imports are logged under the master administrator handle with strict audit trails.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Quick Nav Shortcut Footer Card */}
        <div className="bg-slate-50/80 rounded-2xl p-5 border border-slate-200/80 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3 text-slate-600 text-xs">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>All system parameters synced with local storage and billing cache.</span>
          </div>

          <div className="flex items-center gap-2">
            <Link
              to="/billing"
              className="px-3.5 py-2 text-xs font-semibold text-slate-700 hover:text-blue-600 bg-white border border-slate-200 rounded-xl shadow-2xs hover:bg-slate-50 transition-colors flex items-center gap-1.5"
            >
              Go to Billing
              <ArrowRight size={14} />
            </Link>
            <Link
              to="/reports"
              className="px-3.5 py-2 text-xs font-semibold text-slate-700 hover:text-blue-600 bg-white border border-slate-200 rounded-xl shadow-2xs hover:bg-slate-50 transition-colors flex items-center gap-1.5"
            >
              View Reports
              <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
