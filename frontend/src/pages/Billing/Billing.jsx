import React, { useMemo, useState } from "react";
import {
  Search,
  User,
  Receipt,
  Plus,
  Trash2,
  Calculator,
  IndianRupee,
  AlertTriangle,
  Printer,
  Download,
  Sparkles,
  Shield,
  Activity,
  Clock,
  TrendingUp,
} from "lucide-react";

const medicinesData = [
  {
    id: 1,
    name: "Paracetamol 500mg",
    batch: "PCM101",
    price: 35,
    gst: 12,
    stock: 120,
    expiry: "2026-01-15",
  },
  {
    id: 2,
    name: "Azithromycin",
    batch: "AZ220",
    price: 120,
    gst: 18,
    stock: 8,
    expiry: "2025-06-10",
  },
  {
    id: 3,
    name: "Vitamin D Capsules",
    batch: "VD100",
    price: 180,
    gst: 5,
    stock: 0,
    expiry: "2025-05-18",
  },
];

const Billing = () => {
  const [patient, setPatient] = useState({
    name: "",
    mobile: "",
    age: "",
    gender: "",
    doctorName: "",
    prescriptionNumber: "",
  });
  const [search, setSearch] = useState("");
  const [selectedMedicine, setSelectedMedicine] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [discount, setDiscount] = useState(0);
  const [billItems, setBillItems] = useState([]);
  const [paymentMode, setPaymentMode] = useState("Cash");

  const filteredMedicines = useMemo(() => {
    return medicinesData.filter((medicine) =>
      medicine.name.toLowerCase().includes(search.toLowerCase())
    );
  }, [search]);

  const isExpired = (expiryDate) => {
    return new Date(expiryDate) < new Date();
  };

  const addMedicineToBill = () => {
    if (!selectedMedicine) return;
    if (isExpired(selectedMedicine.expiry)) {
      alert("Expired medicines cannot be billed.");
      return;
    }
    if (quantity > selectedMedicine.stock) {
      alert("Insufficient stock available.");
      return;
    }

    const existingItem = billItems.find((item) => item.id === selectedMedicine.id);
    if (existingItem) {
      const updatedItems = billItems.map((item) =>
        item.id === selectedMedicine.id
          ? { ...item, quantity: item.quantity + quantity }
          : item
      );
      setBillItems(updatedItems);
    } else {
      setBillItems([
        ...billItems,
        { ...selectedMedicine, quantity, discount },
      ]);
    }
    setSearch("");
    setSelectedMedicine(null);
    setQuantity(1);
    setDiscount(0);
  };

  const removeItem = (id) => {
    setBillItems(billItems.filter((item) => item.id !== id));
  };

  const totals = useMemo(() => {
    let subtotal = 0;
    let gstTotal = 0;
    let discountTotal = 0;
    billItems.forEach((item) => {
      const itemTotal = item.price * item.quantity;
      const itemDiscount = (item.discount / 100) * itemTotal;
      const taxableAmount = itemTotal - itemDiscount;
      const gstAmount = (item.gst / 100) * taxableAmount;
      subtotal += itemTotal;
      discountTotal += itemDiscount;
      gstTotal += gstAmount;
    });
    return {
      subtotal,
      discountTotal,
      gstTotal,
      grandTotal: subtotal - discountTotal + gstTotal,
    };
  }, [billItems]);

  const generateBill = () => {
    if (!patient.name || !patient.mobile) {
      alert("Patient name and mobile required.");
      return;
    }
    if (billItems.length === 0) {
      alert("Please add medicines.");
      return;
    }
    const billData = { patient, medicines: billItems, paymentMode, totals };
    console.log(billData);
    alert("Bill Generated Successfully");
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
                <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-indigo-400 rounded-xl blur-lg opacity-75 group-hover:opacity-100 transition-opacity"></div>
                <div className="relative bg-gradient-to-br from-blue-500 to-indigo-600 p-2.5 rounded-xl shadow-lg">
                  <Receipt size={24} className="text-white" />
                </div>
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">
                  New Billing
                </h1>
                <p className="text-blue-300/70 text-sm mt-1">
                  Create pharmacy patient bill
                </p>
              </div>
            </div>
          </div>

          <div className="bg-indigo-500/10 border border-indigo-500/20 rounded-xl px-4 py-3 flex items-center gap-3 backdrop-blur-sm">
            <Shield size={18} className="text-indigo-400" />
            <p className="text-indigo-300/90 text-sm">
              Stock automatically reduces after successful billing
            </p>
            <Sparkles size={16} className="text-indigo-400 animate-pulse" />
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* LEFT SECTION */}
          <div className="xl:col-span-2 space-y-6">
            {/* Patient Info Card */}
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl shadow-xl overflow-hidden">
              <div className="bg-gradient-to-r from-blue-500/10 to-indigo-500/10 px-6 py-4 border-b border-white/10">
                <div className="flex items-center gap-3">
                  <div className="bg-blue-500/20 p-2 rounded-xl">
                    <User size={20} className="text-blue-400" />
                  </div>
                  <h2 className="text-lg font-semibold text-white">
                    Patient Details
                  </h2>
                </div>
              </div>

              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <input
                    type="text"
                    placeholder="Patient Name *"
                    value={patient.name}
                    onChange={(e) =>
                      setPatient({ ...patient, name: e.target.value })
                    }
                    className="bg-slate-800/50 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-400 outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent transition-all"
                  />
                  <input
                    type="text"
                    placeholder="Mobile Number *"
                    value={patient.mobile}
                    onChange={(e) =>
                      setPatient({ ...patient, mobile: e.target.value })
                    }
                    className="bg-slate-800/50 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-400 outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent transition-all"
                  />
                  <input
                    type="number"
                    placeholder="Age"
                    value={patient.age}
                    onChange={(e) =>
                      setPatient({ ...patient, age: e.target.value })
                    }
                    className="bg-slate-800/50 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-400 outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent transition-all"
                  />
                  <select
                    value={patient.gender}
                    onChange={(e) =>
                      setPatient({ ...patient, gender: e.target.value })
                    }
                    className="bg-slate-800/50 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent transition-all"
                  >
                    <option value="" className="bg-slate-900">
                      Select Gender
                    </option>
                    <option className="bg-slate-900">Male</option>
                    <option className="bg-slate-900">Female</option>
                    <option className="bg-slate-900">Other</option>
                  </select>
                  <input
                    type="text"
                    placeholder="Doctor Name"
                    value={patient.doctorName}
                    onChange={(e) =>
                      setPatient({ ...patient, doctorName: e.target.value })
                    }
                    className="bg-slate-800/50 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-400 outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent transition-all"
                  />
                  <input
                    type="text"
                    placeholder="Prescription Number"
                    value={patient.prescriptionNumber}
                    onChange={(e) =>
                      setPatient({
                        ...patient,
                        prescriptionNumber: e.target.value,
                      })
                    }
                    className="bg-slate-800/50 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-400 outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent transition-all"
                  />
                </div>
              </div>
            </div>

            {/* Add Medicine Card */}
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl shadow-xl overflow-hidden">
              <div className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 px-6 py-4 border-b border-white/10">
                <div className="flex items-center gap-3">
                  <div className="bg-purple-500/20 p-2 rounded-xl">
                    <Search size={20} className="text-purple-400" />
                  </div>
                  <h2 className="text-lg font-semibold text-white">
                    Add Medicines
                  </h2>
                </div>
              </div>

              <div className="p-6">
                {/* Search */}
                <div className="relative mb-5">
                  <Search
                    size={18}
                    className="absolute left-3 top-3 text-gray-400"
                  />
                  <input
                    type="text"
                    placeholder="Search medicine..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full bg-slate-800/50 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-white placeholder-gray-400 outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-transparent transition-all"
                  />

                  {search && (
                    <div className="absolute z-20 bg-slate-800 border border-white/10 rounded-xl shadow-2xl mt-2 w-full max-h-60 overflow-y-auto backdrop-blur-xl">
                      {filteredMedicines.map((medicine) => (
                        <button
                          type="button"
                          key={medicine.id}
                          onClick={() => {
                            setSelectedMedicine(medicine);
                            setSearch(medicine.name);
                          }}
                          className="w-full text-left p-4 hover:bg-white/5 transition-colors border-b border-white/10"
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <h3 className="font-medium text-white">
                                {medicine.name}
                              </h3>
                              <p className="text-sm text-gray-400 mt-1">
                                Stock: {medicine.stock}
                              </p>
                            </div>
                            {medicine.stock === 0 && (
                              <span className="bg-red-500/20 text-red-400 px-3 py-1 rounded-full text-xs border border-red-500/30">
                                Out Of Stock
                              </span>
                            )}
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Selected Medicine */}
                {selectedMedicine && (
                  <div className="border border-white/10 rounded-2xl p-5 bg-slate-800/30 backdrop-blur-sm">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div>
                        <p className="text-sm text-gray-400">Price</p>
                        <h3 className="font-semibold text-white mt-1">
                          ₹{selectedMedicine.price}
                        </h3>
                      </div>
                      <div>
                        <p className="text-sm text-gray-400">GST</p>
                        <h3 className="font-semibold text-white mt-1">
                          {selectedMedicine.gst}%
                        </h3>
                      </div>
                      <div>
                        <p className="text-sm text-gray-400">Stock</p>
                        <h3 className="font-semibold text-white mt-1">
                          {selectedMedicine.stock}
                        </h3>
                      </div>
                      <div>
                        <p className="text-sm text-gray-400">Batch</p>
                        <h3 className="font-semibold text-white mt-1">
                          {selectedMedicine.batch}
                        </h3>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-5">
                      <input
                        type="number"
                        placeholder="Quantity"
                        value={quantity}
                        onChange={(e) => setQuantity(Number(e.target.value))}
                        className="bg-slate-800/50 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-400 outline-none focus:ring-2 focus:ring-purple-500/50"
                      />
                      <input
                        type="number"
                        placeholder="Discount %"
                        value={discount}
                        onChange={(e) => setDiscount(Number(e.target.value))}
                        className="bg-slate-800/50 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-400 outline-none focus:ring-2 focus:ring-purple-500/50"
                      />
                      <button
                        onClick={addMedicineToBill}
                        type="button"
                        className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white rounded-xl px-4 py-3 flex items-center justify-center gap-2 transition-all duration-200 shadow-lg"
                      >
                        <Plus size={18} />
                        Add To Bill
                      </button>
                    </div>

                    {isExpired(selectedMedicine.expiry) && (
                      <div className="mt-4 bg-red-500/10 border border-red-500/20 rounded-xl p-4 flex items-center gap-3 backdrop-blur-sm">
                        <AlertTriangle className="text-red-400" size={22} />
                        <p className="text-red-400 text-sm">
                          Expired medicines cannot be billed.
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Bill Table */}
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl shadow-xl overflow-hidden">
              <div className="bg-gradient-to-r from-green-500/10 to-emerald-500/10 px-6 py-4 border-b border-white/10">
                <h2 className="text-lg font-semibold text-white">
                  Bill Items
                </h2>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full min-w-[900px]">
                  <thead className="bg-slate-800/50 border-b border-white/10">
                    <tr>
                      <th className="text-left p-4 text-sm font-semibold text-gray-300">
                        Medicine
                      </th>
                      <th className="text-left p-4 text-sm font-semibold text-gray-300">
                        Qty
                      </th>
                      <th className="text-left p-4 text-sm font-semibold text-gray-300">
                        Price
                      </th>
                      <th className="text-left p-4 text-sm font-semibold text-gray-300">
                        GST
                      </th>
                      <th className="text-left p-4 text-sm font-semibold text-gray-300">
                        Discount
                      </th>
                      <th className="text-left p-4 text-sm font-semibold text-gray-300">
                        Total
                      </th>
                      <th className="text-left p-4 text-sm font-semibold text-gray-300">
                        Action
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {billItems.map((item) => {
                      const total = item.price * item.quantity;
                      return (
                        <tr
                          key={item.id}
                          className="border-b border-white/5 hover:bg-white/5 transition-colors"
                        >
                          <td className="p-4 font-medium text-white">
                            {item.name}
                          </td>
                          <td className="p-4 text-gray-300">
                            {item.quantity}
                          </td>
                          <td className="p-4 text-gray-300">₹{item.price}</td>
                          <td className="p-4 text-gray-300">{item.gst}%</td>
                          <td className="p-4 text-gray-300">{item.discount}%</td>
                          <td className="p-4 font-semibold text-white">
                            ₹{total}
                          </td>
                          <td className="p-4">
                            <button
                              onClick={() => removeItem(item.id)}
                              className="bg-red-500/20 hover:bg-red-500/30 text-red-400 p-2 rounded-lg transition-all"
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
                  <div className="text-center py-12 text-gray-400">
                    No medicines added.
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* RIGHT SECTION */}
          <div className="space-y-6">
            {/* Bill Summary */}
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl shadow-xl overflow-hidden sticky top-6">
              <div className="bg-gradient-to-r from-green-500/10 to-emerald-500/10 px-6 py-4 border-b border-white/10">
                <div className="flex items-center gap-3">
                  <div className="bg-green-500/20 p-2 rounded-xl">
                    <Calculator size={20} className="text-green-400" />
                  </div>
                  <h2 className="text-lg font-semibold text-white">
                    Bill Summary
                  </h2>
                </div>
              </div>

              <div className="p-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <p className="text-gray-400">Subtotal</p>
                    <h3 className="font-semibold text-white">
                      ₹{totals.subtotal.toFixed(2)}
                    </h3>
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="text-gray-400">Discount</p>
                    <h3 className="font-semibold text-red-400">
                      - ₹{totals.discountTotal.toFixed(2)}
                    </h3>
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="text-gray-400">GST</p>
                    <h3 className="font-semibold text-white">
                      ₹{totals.gstTotal.toFixed(2)}
                    </h3>
                  </div>
                  <div className="border-t border-white/10 pt-4 flex items-center justify-between">
                    <h2 className="text-lg font-bold text-white">
                      Grand Total
                    </h2>
                    <h2 className="text-2xl font-bold bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">
                      ₹{totals.grandTotal.toFixed(2)}
                    </h2>
                  </div>
                </div>

                <div className="mt-6">
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Payment Mode
                  </label>
                  <select
                    value={paymentMode}
                    onChange={(e) => setPaymentMode(e.target.value)}
                    className="w-full bg-slate-800/50 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:ring-2 focus:ring-green-500/50 focus:border-transparent transition-all"
                  >
                    <option className="bg-slate-900">Cash</option>
                    <option className="bg-slate-900">UPI</option>
                    <option className="bg-slate-900">Card</option>
                    <option className="bg-slate-900">Insurance</option>
                    <option className="bg-slate-900">Credit</option>
                  </select>
                </div>

                <div className="space-y-3 mt-6">
                  <button
                    onClick={generateBill}
                    className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white px-4 py-3 rounded-xl flex items-center justify-center gap-2 transition-all duration-200 shadow-lg"
                  >
                    <Receipt size={18} />
                    Generate Bill
                  </button>
                  <button className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-4 py-3 rounded-xl flex items-center justify-center gap-2 transition-all duration-200 shadow-lg">
                    <Printer size={18} />
                    Print Bill
                  </button>
                  <button className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-4 py-3 rounded-xl flex items-center justify-center gap-2 transition-all duration-200 shadow-lg">
                    <Download size={18} />
                    Download PDF
                  </button>
                </div>
              </div>
            </div>

            {/* Billing Rules */}
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl shadow-xl overflow-hidden">
              <div className="bg-gradient-to-r from-blue-500/10 to-indigo-500/10 px-6 py-4 border-b border-white/10">
                <div className="flex items-center gap-3">
                  <div className="bg-blue-500/20 p-2 rounded-xl">
                    <Shield size={18} className="text-blue-400" />
                  </div>
                  <h2 className="text-lg font-semibold text-white">
                    Billing Rules
                  </h2>
                </div>
              </div>

              <div className="p-6 space-y-3">
                {[
                  "Expired medicines cannot be billed",
                  "Stock validates automatically",
                  "GST calculated automatically",
                  "Inventory reduces after billing",
                  "Bills are stored permanently",
                ].map((rule, index) => (
                  <div
                    key={index}
                    className="border border-white/10 rounded-xl p-4 flex items-center gap-3 hover:bg-white/5 transition-colors"
                  >
                    <div className="w-1.5 h-1.5 rounded-full bg-blue-400"></div>
                    <p className="text-gray-300 text-sm">{rule}</p>
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

export default Billing;