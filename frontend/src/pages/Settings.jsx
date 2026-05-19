import React, { useState } from "react";
import {
  Settings as SettingsIcon,
  Building2,
  Receipt,
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
  Sparkles,
  Shield,
  TrendingUp,
  Globe,
  Database,
  Moon,
  Sun,
} from "lucide-react";

const Settings = () => {
  const [settings, setSettings] = useState({
    // PHARMACY
    pharmacyName: "PharmaCare Pro",
    ownerName: "Rutuja Kale",
    mobile: "9876543210",
    email: "pharmacy@gmail.com",
    address: "Main Road, Akola, Maharashtra",
    // GST
    gstNumber: "27ABCDE1234F1Z5",
    gstPercentage: 18,
    // BILLING
    invoicePrefix: "INV",
    invoiceStartNumber: 1001,
    // ALERTS
    lowStockThreshold: 10,
    expiryAlertDays: 30,
    // WHATSAPP
    whatsappEnabled: true,
    whatsappNumber: "919876543210",
    // SYSTEM
    darkMode: false,
    autoBackup: true,
    // USER
    adminName: "Admin",
  });

  const [isSaving, setIsSaving] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setSettings({
      ...settings,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleSave = async () => {
    setIsSaving(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    alert("Settings saved successfully");
    setIsSaving(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900">
      {/* Animated Background Pattern */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 -left-4 w-96 h-96 bg-blue-500/20 rounded-full filter blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 -right-4 w-96 h-96 bg-indigo-500/20 rounded-full filter blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute inset-0 opacity-[0.03]">
          <div className="h-full w-full bg-[linear-gradient(rgba(20,184,166,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(20,184,166,0.1)_1px,transparent_1px)] bg-[size:32px_32px]"></div>
        </div>
      </div>

      <div className="relative z-10 p-4 md:p-6">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-3">
              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-r from-gray-400 to-slate-400 rounded-xl blur-lg opacity-75 group-hover:opacity-100 transition-opacity"></div>
                <div className="relative bg-gradient-to-br from-gray-500 to-slate-600 p-2.5 rounded-xl shadow-lg">
                  <SettingsIcon size={24} className="text-white" />
                </div>
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-gray-400 to-slate-400 bg-clip-text text-transparent">
                  Settings
                </h1>
                <p className="text-gray-400 text-sm mt-1">
                  Configure pharmacy ERP system preferences
                </p>
              </div>
            </div>
          </div>

          <div className="flex gap-3">
            <div className="bg-indigo-500/10 border border-indigo-500/20 rounded-xl px-4 py-3 flex items-center gap-3 backdrop-blur-sm">
              <Shield size={18} className="text-indigo-400" />
              <p className="text-indigo-300/90 text-sm">System Configuration</p>
              <Sparkles size={16} className="text-indigo-400 animate-pulse" />
            </div>
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-5 py-3 rounded-xl flex items-center gap-2 transition-all duration-200 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSaving ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Saving...
                </>
              ) : (
                <>
                  <Save size={18} />
                  Save Settings
                </>
              )}
            </button>
          </div>
        </div>

        <div className="space-y-6">
          {/* Pharmacy Profile */}
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl shadow-xl overflow-hidden">
            <div className="bg-gradient-to-r from-blue-500/10 to-indigo-500/10 px-6 py-4 border-b border-white/10">
              <div className="flex items-center gap-3">
                <div className="bg-blue-500/20 p-2 rounded-xl">
                  <Building2 size={20} className="text-blue-400" />
                </div>
                <h2 className="text-lg font-semibold text-white">
                  Pharmacy Profile
                </h2>
              </div>
            </div>

            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Pharmacy Name
                  </label>
                  <input
                    type="text"
                    name="pharmacyName"
                    value={settings.pharmacyName}
                    onChange={handleChange}
                    className="w-full bg-slate-800/50 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-400 outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Owner Name
                  </label>
                  <input
                    type="text"
                    name="ownerName"
                    value={settings.ownerName}
                    onChange={handleChange}
                    className="w-full bg-slate-800/50 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-400 outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Mobile Number
                  </label>
                  <div className="relative">
                    <Phone size={18} className="absolute left-3 top-3 text-gray-400" />
                    <input
                      type="text"
                      name="mobile"
                      value={settings.mobile}
                      onChange={handleChange}
                      className="w-full bg-slate-800/50 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-white placeholder-gray-400 outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent transition-all"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail size={18} className="absolute left-3 top-3 text-gray-400" />
                    <input
                      type="email"
                      name="email"
                      value={settings.email}
                      onChange={handleChange}
                      className="w-full bg-slate-800/50 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-white placeholder-gray-400 outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent transition-all"
                    />
                  </div>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Address
                  </label>
                  <div className="relative">
                    <MapPin size={18} className="absolute left-3 top-3 text-gray-400" />
                    <textarea
                      rows={3}
                      name="address"
                      value={settings.address}
                      onChange={handleChange}
                      className="w-full bg-slate-800/50 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-white placeholder-gray-400 outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent transition-all"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* GST & Billing */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            {/* GST Configuration */}
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl shadow-xl overflow-hidden">
              <div className="bg-gradient-to-r from-green-500/10 to-emerald-500/10 px-6 py-4 border-b border-white/10">
                <div className="flex items-center gap-3">
                  <div className="bg-green-500/20 p-2 rounded-xl">
                    <Percent size={20} className="text-green-400" />
                  </div>
                  <h2 className="text-lg font-semibold text-white">
                    GST Configuration
                  </h2>
                </div>
              </div>
              <div className="p-6 space-y-5">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    GST Number
                  </label>
                  <input
                    type="text"
                    name="gstNumber"
                    value={settings.gstNumber}
                    onChange={handleChange}
                    className="w-full bg-slate-800/50 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-400 outline-none focus:ring-2 focus:ring-green-500/50 focus:border-transparent transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Default GST (%)
                  </label>
                  <input
                    type="number"
                    name="gstPercentage"
                    value={settings.gstPercentage}
                    onChange={handleChange}
                    className="w-full bg-slate-800/50 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-400 outline-none focus:ring-2 focus:ring-green-500/50 focus:border-transparent transition-all"
                  />
                </div>
              </div>
            </div>

            {/* Billing Settings */}
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl shadow-xl overflow-hidden">
              <div className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 px-6 py-4 border-b border-white/10">
                <div className="flex items-center gap-3">
                  <div className="bg-purple-500/20 p-2 rounded-xl">
                    <Receipt size={20} className="text-purple-400" />
                  </div>
                  <h2 className="text-lg font-semibold text-white">
                    Billing Settings
                  </h2>
                </div>
              </div>
              <div className="p-6 space-y-5">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Invoice Prefix
                  </label>
                  <input
                    type="text"
                    name="invoicePrefix"
                    value={settings.invoicePrefix}
                    onChange={handleChange}
                    className="w-full bg-slate-800/50 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-400 outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-transparent transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Starting Invoice Number
                  </label>
                  <input
                    type="number"
                    name="invoiceStartNumber"
                    value={settings.invoiceStartNumber}
                    onChange={handleChange}
                    className="w-full bg-slate-800/50 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-400 outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-transparent transition-all"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Alert & WhatsApp Settings */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            {/* Alert Settings */}
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl shadow-xl overflow-hidden">
              <div className="bg-gradient-to-r from-orange-500/10 to-red-500/10 px-6 py-4 border-b border-white/10">
                <div className="flex items-center gap-3">
                  <div className="bg-orange-500/20 p-2 rounded-xl">
                    <AlertTriangle size={20} className="text-orange-400" />
                  </div>
                  <h2 className="text-lg font-semibold text-white">
                    Alert Settings
                  </h2>
                </div>
              </div>
              <div className="p-6 space-y-5">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Low Stock Threshold
                  </label>
                  <input
                    type="number"
                    name="lowStockThreshold"
                    value={settings.lowStockThreshold}
                    onChange={handleChange}
                    className="w-full bg-slate-800/50 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-400 outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-transparent transition-all"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Alert when stock falls below this number
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Expiry Alert Days
                  </label>
                  <input
                    type="number"
                    name="expiryAlertDays"
                    value={settings.expiryAlertDays}
                    onChange={handleChange}
                    className="w-full bg-slate-800/50 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-400 outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-transparent transition-all"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Alert before expiry in days
                  </p>
                </div>
              </div>
            </div>

            {/* WhatsApp Reminders */}
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl shadow-xl overflow-hidden">
              <div className="bg-gradient-to-r from-green-500/10 to-emerald-500/10 px-6 py-4 border-b border-white/10">
                <div className="flex items-center gap-3">
                  <div className="bg-green-500/20 p-2 rounded-xl">
                    <BellRing size={20} className="text-green-400" />
                  </div>
                  <h2 className="text-lg font-semibold text-white">
                    WhatsApp Reminders
                  </h2>
                </div>
              </div>
              <div className="p-6 space-y-5">
                <div className="flex items-center justify-between border border-white/10 rounded-xl p-4 hover:bg-white/5 transition-colors">
                  <div>
                    <h3 className="font-medium text-white">
                      Enable WhatsApp Reminders
                    </h3>
                    <p className="text-sm text-gray-400 mt-1">
                      Send automatic refill reminders
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
                    <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
                  </label>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    WhatsApp Business Number
                  </label>
                  <input
                    type="text"
                    name="whatsappNumber"
                    value={settings.whatsappNumber}
                    onChange={handleChange}
                    placeholder="Include country code"
                    className="w-full bg-slate-800/50 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-400 outline-none focus:ring-2 focus:ring-green-500/50 focus:border-transparent transition-all"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* System & User Settings */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            {/* System Preferences */}
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl shadow-xl overflow-hidden">
              <div className="bg-gradient-to-r from-red-500/10 to-rose-500/10 px-6 py-4 border-b border-white/10">
                <div className="flex items-center gap-3">
                  <div className="bg-red-500/20 p-2 rounded-xl">
                    <ShieldCheck size={20} className="text-red-400" />
                  </div>
                  <h2 className="text-lg font-semibold text-white">
                    System Preferences
                  </h2>
                </div>
              </div>
              <div className="p-6 space-y-4">
                <div className="flex items-center justify-between border border-white/10 rounded-xl p-4 hover:bg-white/5 transition-colors">
                  <div className="flex items-center gap-3">
                    {settings.darkMode ? (
                      <Moon size={20} className="text-purple-400" />
                    ) : (
                      <Sun size={20} className="text-yellow-400" />
                    )}
                    <div>
                      <h3 className="font-medium text-white">
                        Dark Mode
                      </h3>
                      <p className="text-sm text-gray-400 mt-1">
                        Enable dark theme interface
                      </p>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      name="darkMode"
                      checked={settings.darkMode}
                      onChange={handleChange}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                  </label>
                </div>
                <div className="flex items-center justify-between border border-white/10 rounded-xl p-4 hover:bg-white/5 transition-colors">
                  <div className="flex items-center gap-3">
                    <Database size={20} className="text-blue-400" />
                    <div>
                      <h3 className="font-medium text-white">
                        Auto Backup
                      </h3>
                      <p className="text-sm text-gray-400 mt-1">
                        Daily automatic database backup
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
                    <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>
              </div>
            </div>

            {/* User Settings */}
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl shadow-xl overflow-hidden">
              <div className="bg-gradient-to-r from-blue-500/10 to-indigo-500/10 px-6 py-4 border-b border-white/10">
                <div className="flex items-center gap-3">
                  <div className="bg-blue-500/20 p-2 rounded-xl">
                    <UserCog size={20} className="text-blue-400" />
                  </div>
                  <h2 className="text-lg font-semibold text-white">
                    User Settings
                  </h2>
                </div>
              </div>
              <div className="p-6 space-y-5">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Admin Name
                  </label>
                  <input
                    type="text"
                    name="adminName"
                    value={settings.adminName}
                    onChange={handleChange}
                    className="w-full bg-slate-800/50 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-400 outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Pharmacy Logo
                  </label>
                  <label className="border-2 border-dashed border-white/10 rounded-2xl p-6 flex flex-col items-center justify-center cursor-pointer hover:bg-white/5 transition-all group">
                    <div className="bg-blue-500/20 p-3 rounded-full group-hover:scale-110 transition-transform">
                      <Upload className="text-blue-400" size={32} />
                    </div>
                    <p className="text-sm text-gray-400 mt-3">
                      Click to upload logo
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      Recommended: 200x200px PNG
                    </p>
                    <input type="file" className="hidden" accept="image/*" />
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* Information Panel */}
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl shadow-xl overflow-hidden">
            <div className="bg-gradient-to-r from-blue-500/10 to-indigo-500/10 px-6 py-4 border-b border-white/10">
              <div className="flex items-center gap-3">
                <div className="bg-blue-500/20 p-2 rounded-xl">
                  <TrendingUp size={18} className="text-blue-400" />
                </div>
                <h2 className="text-lg font-semibold text-white">
                  Settings Features
                </h2>
              </div>
            </div>

            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
                {[
                  "Configure GST and billing preferences",
                  "Manage pharmacy branding and profile",
                  "Configure inventory alert thresholds",
                  "Enable WhatsApp automation and backups",
                ].map((feature, index) => (
                  <div
                    key={index}
                    className="border border-white/10 rounded-xl p-4 flex items-center gap-3 hover:bg-white/5 transition-colors group"
                  >
                    <div className="w-1.5 h-1.5 rounded-full bg-blue-400 group-hover:scale-150 transition-transform"></div>
                    <p className="text-gray-300 text-sm">{feature}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;