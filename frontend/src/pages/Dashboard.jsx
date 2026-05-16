import React, { useState, useEffect } from "react";
import {
  IndianRupee,
  Package,
  AlertTriangle,
  BellRing,
  ShoppingCart,
  CalendarClock,
  Plus,
  Receipt,
  Upload,
  TrendingUp,
  TrendingDown,
  ArrowUpRight,
  ArrowDownRight,
  Users,
  Clock,
  CheckCircle2,
  XCircle,
  RefreshCw,
  Filter,
  MoreVertical,
  Download,
  Eye,
  Pill,
  Activity,
} from "lucide-react";
import { Link } from "react-router-dom";

const Dashboard = () => {
  const [currentTime, setCurrentTime] = useState("");
  const [currentDate, setCurrentDate] = useState("");
  const [greeting, setGreeting] = useState("");

  useEffect(() => {
    const updateDateTime = () => {
      const now = new Date();
      const hour = now.getHours();
      
      setCurrentTime(
        now.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: true })
      );
      setCurrentDate(
        now.toLocaleDateString("en-US", {
          weekday: "long",
          year: "numeric",
          month: "long",
          day: "numeric",
        })
      );

      if (hour < 12) setGreeting("Good Morning");
      else if (hour < 17) setGreeting("Good Afternoon");
      else setGreeting("Good Evening");
    };

    updateDateTime();
    const interval = setInterval(updateDateTime, 60000);
    return () => clearInterval(interval);
  }, []);

  // MOCK DATA
  const stats = [
    {
      title: "Today's Sales",
      value: "₹24,580",
      icon: <IndianRupee size={22} />,
      color: "from-emerald-500 to-teal-500",
      bgColor: "bg-emerald-500/10",
      iconColor: "text-emerald-400",
      growth: "+12%",
      growthUp: true,
      subtitle: "vs yesterday",
    },
    {
      title: "Total Bills",
      value: "142",
      icon: <Receipt size={22} />,
      color: "from-pink-500 to-red-500",
      bgColor: "bg-pink-500/10",
      iconColor: "text-pink-400",
      growth: "+8%",
      growthUp: true,
      subtitle: "this month",
    },
    {
      title: "Low Stock Items",
      value: "18",
      icon: <AlertTriangle size={22} />,
      color: "from-orange-500 to-amber-500",
      bgColor: "bg-orange-500/10",
      iconColor: "text-orange-400",
      growth: "Needs Attention",
      growthUp: false,
      subtitle: "critical items",
    },
    {
      title: "Upcoming Reminders",
      value: "26",
      icon: <BellRing size={22} />,
      color: "from-purple-500 to-pink-500",
      bgColor: "bg-purple-500/10",
      iconColor: "text-purple-400",
      growth: "Next 7 Days",
      growthUp: false,
      subtitle: "patient follow-ups",
    },
  ];

  const lowStockMedicines = [
    { id: 1, name: "Azithromycin 500mg", stock: 5, minStock: 20, category: "Antibiotic" },
    { id: 2, name: "Vitamin D Capsules", stock: 2, minStock: 15, category: "Supplement" },
    { id: 3, name: "Paracetamol Syrup", stock: 7, minStock: 25, category: "Pain Relief" },
  ];

  const expiryMedicines = [
    { id: 1, name: "Dolo 650", expiry: "2025-06-12", status: "Critical", daysLeft: 30 },
    { id: 2, name: "Amoxicillin", expiry: "2025-07-04", status: "Warning", daysLeft: 52 },
    { id: 3, name: "Vitamin B12", expiry: "2025-05-28", status: "Expired", daysLeft: 0 },
  ];

  const reminders = [
    { id: 1, patient: "Ramesh Sharma", medicine: "Metformin 500mg", dueDate: "Tomorrow", phone: "+91 98765 43210" },
    { id: 2, patient: "Priya Patil", medicine: "BP Tablets", dueDate: "2 Days", phone: "+91 87654 32109" },
    { id: 3, patient: "Amit Verma", medicine: "Antibiotics", dueDate: "Today", phone: "+91 76543 21098" },
  ];

  const recentBills = [
    { id: "BILL-1001", patient: "Rahul Patil", amount: "₹850", payment: "UPI", date: "Today", status: "completed" },
    { id: "BILL-1002", patient: "Sneha Kale", amount: "₹1,240", payment: "Cash", date: "Today", status: "completed" },
    { id: "BILL-1003", patient: "Ajay Sharma", amount: "₹560", payment: "Card", date: "Today", status: "pending" },
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case "Expired":
        return "bg-red-500/10 text-red-400 border-red-500/20";
      case "Critical":
        return "bg-orange-500/10 text-orange-400 border-orange-500/20";
      case "Warning":
        return "bg-yellow-500/10 text-yellow-400 border-yellow-500/20";
      default:
        return "bg-gray-500/10 text-gray-400 border-gray-500/20";
    }
  };

  const getStockPercentage = (stock, minStock) => {
    return (stock / minStock) * 100;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 p-4 md:p-6 lg:p-8">
      {/* Background Pattern */}
      <div className="fixed inset-0 pointer-events-none opacity-5">
        <div className="absolute top-0 -left-4 w-96 h-96 bg-blue-500 rounded-full filter blur-3xl animate-blob"></div>
        <div className="absolute top-1/2 -right-4 w-96 h-96 bg-indigo-500 rounded-full filter blur-3xl animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-cyan-500 rounded-full filter blur-3xl animate-blob animation-delay-4000"></div>
      </div>

      <div className="relative z-10">
        {/* HEADER */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl font-bold">
              {/* bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent */}
                <span className="text-white">{greeting}</span> 👋
              </h1>
            </div>
            <p className="text-blue-200/80 text-sm">
              Here's your pharmacy overview for today
            </p>
            <div className="flex items-center gap-4 mt-2 text-white/60 text-xs">
              <div className="flex items-center gap-1.5">
                <Clock size={12} className="text-blue-400" />
                <span>{currentTime}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CalendarClock size={12} className="text-blue-400" />
                <span>{currentDate}</span>
              </div>
            </div>
          </div>

          {/* QUICK ACTIONS */}
          <div className="flex flex-wrap gap-3">
            <Link
              to="/inventory/add-medicine"
              className="bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white px-5 py-2.5 rounded-xl flex items-center gap-2 transition-all duration-300 shadow-lg hover:shadow-blue-500/25 transform hover:scale-105"
            >
              <Plus size={18} />
              <span className="text-sm font-medium">Add Medicine</span>
            </Link>
            <Link
              to="/billing"
              className="bg-white/10 backdrop-blur-sm border border-white/20 hover:border-white/30 text-white px-5 py-2.5 rounded-xl flex items-center gap-2 transition-all duration-300 hover:bg-white/20 transform hover:scale-105"
            >
              <Receipt size={18} />
              <span className="text-sm font-medium">New Bill</span>
            </Link>
            <Link
              to="/upload"
              className="bg-white/10 backdrop-blur-sm border border-white/20 hover:border-white/30 text-white px-5 py-2.5 rounded-xl flex items-center gap-2 transition-all duration-300 hover:bg-white/20 transform hover:scale-105"
            >
              <Upload size={18} />
              <span className="text-sm font-medium">Upload Excel</span>
            </Link>
          </div>
        </div>

        {/* STATS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
          {stats.map((item, index) => (
            <div
              key={index}
              className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-5 hover:bg-white/10 transition-all duration-300 group cursor-pointer"
            >
              <div className="flex items-start justify-between mb-4">
                <div className={`${item.bgColor} p-3 rounded-xl`}>
                  <span className={item.iconColor}>{item.icon}</span>
                </div>
                <button className="text-white/40 hover:text-white/80 transition-colors">
                  <MoreVertical size={16} />
                </button>
              </div>
              
              <p className="text-white/60 text-sm mb-1">{item.title}</p>
              <h2 className="text-3xl font-bold text-white mb-2">{item.value}</h2>
              
              <div className="flex items-center gap-2">
                {item.growthUp ? (
                  <div className="flex items-center gap-1 text-indigo-400 text-xs">
                    <ArrowUpRight size={14} />
                    <span className="font-medium">{item.growth}</span>
                  </div>
                ) : (
                  <span className={`text-xs px-2 py-1 rounded-full font-medium ${item.title === "Low Stock Items" ? "bg-orange-500/10 text-orange-400 border border-orange-500/20" : "bg-purple-500/10 text-purple-400 border border-purple-500/20"}`}>
                    {item.growth}
                  </span>
                )}
                <span className="text-white/40 text-xs">{item.subtitle}</span>
              </div>
            </div>
          ))}
        </div>

        {/* MAIN GRID */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* LEFT SECTION */}
          <div className="xl:col-span-2 space-y-6">
            {/* RECENT BILLS */}
            <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl">
              <div className="flex items-center justify-between p-5 border-b border-white/10">
                <div className="flex items-center gap-3">
                  <div className="bg-blue-500/10 p-2 rounded-xl">
                    <ShoppingCart size={18} className="text-blue-400" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-white">Recent Bills</h2>
                    <p className="text-white/50 text-xs">Latest pharmacy transactions</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button className="p-2 rounded-lg hover:bg-white/10 text-white/60 hover:text-white transition-colors">
                    <Filter size={16} />
                  </button>
                  <Link
                    to="/billing-history"
                    className="text-blue-400 hover:text-blue-300 text-sm font-medium transition-colors flex items-center gap-1"
                  >
                    View All
                    <ArrowUpRight size={14} />
                  </Link>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full min-w-[600px]">
                  <thead>
                    <tr className="border-b border-white/10">
                      <th className="text-left p-4 text-xs font-semibold text-white/60 uppercase tracking-wider">Bill No</th>
                      <th className="text-left p-4 text-xs font-semibold text-white/60 uppercase tracking-wider">Patient</th>
                      <th className="text-left p-4 text-xs font-semibold text-white/60 uppercase tracking-wider">Amount</th>
                      <th className="text-left p-4 text-xs font-semibold text-white/60 uppercase tracking-wider">Payment</th>
                      <th className="text-left p-4 text-xs font-semibold text-white/60 uppercase tracking-wider">Status</th>
                      <th className="text-left p-4 text-xs font-semibold text-white/60 uppercase tracking-wider">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentBills.map((bill) => (
                      <tr key={bill.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                        <td className="p-4">
                          <span className="text-blue-400 font-medium text-sm">{bill.id}</span>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center text-white text-xs font-bold">
                              {bill.patient.split(" ").map(n => n[0]).join("")}
                            </div>
                            <span className="text-white text-sm">{bill.patient}</span>
                          </div>
                        </td>
                        <td className="p-4 text-white font-semibold text-sm">{bill.amount}</td>
                        <td className="p-4">
                          <span className="bg-blue-500/10 text-blue-300 px-3 py-1 rounded-full text-xs border border-blue-500/20">
                            {bill.payment}
                          </span>
                        </td>
                        <td className="p-4">
                          {bill.status === "completed" ? (
                            <span className="flex items-center gap-1 text-indigo-400 text-xs">
                              <CheckCircle2 size={12} />
                              Completed
                            </span>
                          ) : (
                            <span className="flex items-center gap-1 text-yellow-400 text-xs">
                              <Clock size={12} />
                              Pending
                            </span>
                          )}
                        </td>
                        <td className="p-4">
                          <button className="p-2 rounded-lg hover:bg-white/10 text-white/60 hover:text-white transition-colors">
                            <Eye size={16} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* LOW STOCK */}
            <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl">
              <div className="flex items-center justify-between p-5 border-b border-white/10">
                <div className="flex items-center gap-3">
                  <div className="bg-orange-500/10 p-2 rounded-xl">
                    <AlertTriangle size={18} className="text-orange-400" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-white">Low Stock Alerts</h2>
                    <p className="text-white/50 text-xs">Medicines requiring reorder</p>
                  </div>
                </div>
                <Link
                  to="/inventory"
                  className="text-blue-400 hover:text-blue-300 text-sm font-medium transition-colors flex items-center gap-1"
                >
                  View Inventory
                  <ArrowUpRight size={14} />
                </Link>
              </div>

              <div className="p-5 space-y-3">
                {lowStockMedicines.map((medicine) => {
                  const percentage = getStockPercentage(medicine.stock, medicine.minStock);
                  return (
                    <div
                      key={medicine.id}
                      className="bg-white/5 border border-white/10 rounded-xl p-4 hover:bg-white/10 transition-all duration-300"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <h3 className="text-white font-semibold text-sm">{medicine.name}</h3>
                          <p className="text-white/50 text-xs mt-0.5">{medicine.category}</p>
                        </div>
                        <div className="bg-orange-500/10 border border-orange-500/20 text-orange-400 px-3 py-1.5 rounded-xl text-sm font-semibold">
                          {medicine.stock} Left
                        </div>
                      </div>
                      <div className="space-y-1.5">
                        <div className="flex justify-between text-xs">
                          <span className="text-white/60">Stock Level</span>
                          <span className="text-white/80">{medicine.stock} / {medicine.minStock}</span>
                        </div>
                        <div className="w-full bg-white/10 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full transition-all duration-500 ${
                              percentage < 25 ? "bg-gradient-to-r from-red-500 to-orange-500" :
                              percentage < 50 ? "bg-gradient-to-r from-orange-500 to-yellow-500" :
                              "bg-gradient-to-r from-blue-500 to-indigo-500"
                            }`}
                            style={{ width: `${Math.min(percentage, 100)}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* RIGHT SECTION */}
          <div className="space-y-6">
            {/* EXPIRY ALERTS */}
            <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl">
              <div className="flex items-center justify-between p-5 border-b border-white/10">
                <div className="flex items-center gap-3">
                  <div className="bg-red-500/10 p-2 rounded-xl">
                    <CalendarClock size={18} className="text-red-400" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-white">Expiry Alerts</h2>
                    <p className="text-white/50 text-xs">Medicines nearing expiry</p>
                  </div>
                </div>
                <button className="p-2 rounded-lg hover:bg-white/10 text-white/60 hover:text-white transition-colors">
                  <RefreshCw size={16} />
                </button>
              </div>

              <div className="p-5 space-y-3">
                {expiryMedicines.map((medicine) => (
                  <div
                    key={medicine.id}
                    className="bg-white/5 border border-white/10 rounded-xl p-4 hover:bg-white/10 transition-all duration-300"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-white font-semibold text-sm">{medicine.name}</h3>
                      <span className={`text-xs px-2.5 py-1 rounded-full font-medium border ${getStatusColor(medicine.status)}`}>
                        {medicine.status}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <p className="text-white/60 text-xs">Expiry: {medicine.expiry}</p>
                      {medicine.daysLeft > 0 && (
                        <p className="text-white/40 text-xs">{medicine.daysLeft} days left</p>
                      )}
                    </div>
                    {medicine.status === "Expired" && (
                      <div className="mt-2 flex items-center gap-1 text-red-400 text-xs">
                        <XCircle size={12} />
                        <span>Remove from inventory</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* REMINDERS */}
            <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl">
              <div className="flex items-center justify-between p-5 border-b border-white/10">
                <div className="flex items-center gap-3">
                  <div className="bg-purple-500/10 p-2 rounded-xl">
                    <BellRing size={18} className="text-purple-400" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-white">Upcoming Reminders</h2>
                    <p className="text-white/50 text-xs">WhatsApp refill reminders</p>
                  </div>
                </div>
                <Link
                  to="/reminders"
                  className="text-blue-400 hover:text-blue-300 text-sm font-medium transition-colors flex items-center gap-1"
                >
                  View All
                  <ArrowUpRight size={14} />
                </Link>
              </div>

              <div className="p-5 space-y-3">
                {reminders.map((reminder) => (
                  <div
                    key={reminder.id}
                    className="bg-white/5 border border-white/10 rounded-xl p-4 hover:bg-white/10 transition-all duration-300"
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-400 to-pink-500 flex items-center justify-center text-white font-bold text-sm">
                        {reminder.patient.split(" ").map(n => n[0]).join("")}
                      </div>
                      <div>
                        <h3 className="text-white font-semibold text-sm">{reminder.patient}</h3>
                        <p className="text-white/50 text-xs">{reminder.phone}</p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-white/80 text-sm">{reminder.medicine}</p>
                        <p className="text-white/50 text-xs mt-0.5">Refill Reminder</p>
                      </div>
                      <span className={`text-xs px-3 py-1 rounded-full font-medium border ${
                        reminder.dueDate === "Today" 
                          ? "bg-red-500/10 text-red-400 border-red-500/20"
                          : "bg-purple-500/10 text-purple-400 border-purple-500/20"
                      }`}>
                        Due {reminder.dueDate}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* QUICK STATS */}
            <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-5">
              <div className="flex items-center gap-3 mb-4">
                <div className="bg-cyan-500/10 p-2 rounded-xl">
                  <Activity size={18} className="text-cyan-400" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-white">Quick Stats</h2>
                  <p className="text-white/50 text-xs">System overview</p>
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between py-2 border-b border-white/5">
                  <div className="flex items-center gap-2">
                    <Package size={14} className="text-blue-400" />
                    <span className="text-white/80 text-sm">Total Products</span>
                  </div>
                  <span className="text-white font-semibold text-sm">2,847</span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-white/5">
                  <div className="flex items-center gap-2">
                    <Users size={14} className="text-blue-400" />
                    <span className="text-white/80 text-sm">Active Patients</span>
                  </div>
                  <span className="text-white font-semibold text-sm">1,234</span>
                </div>
                <div className="flex items-center justify-between py-2">
                  <div className="flex items-center gap-2">
                    <Receipt size={14} className="text-blue-400" />
                    <span className="text-white/80 text-sm">Monthly Revenue</span>
                  </div>
                  <span className="text-white font-semibold text-sm">₹7.2L</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes blob {
          0%, 100% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </div>
  );
};

export default Dashboard;