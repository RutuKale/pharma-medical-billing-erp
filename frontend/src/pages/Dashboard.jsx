import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  IndianRupee,
  AlertTriangle,
  Bell,
  Plus,
  Upload,
  Calendar,
  ChevronDown,
  Filter,
  ArrowRight,
  Eye,
  MoreVertical,
  CheckCircle2,
  Clock,
  BarChart2,
  TrendingUp,
} from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
  PieChart,
  Pie,
} from "recharts";
import apiClient from "../utils/apiClient";
import { useAuth } from "../context/AuthContext";

const Dashboard = () => {
  const { user } = useAuth();
  const [currentDateTime, setCurrentDateTime] = useState({
    dateStr: "Wednesday, 23 September 2026",
    timeStr: "08:55 PM",
    greeting: "Good Evening",
  });

  // Time & Greeting clock
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const hour = now.getHours();

      let greet = "Good Evening";
      if (hour < 12) greet = "Good Morning";
      else if (hour < 17) greet = "Good Afternoon";

      const days = [
        "Sunday",
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
      ];
      const months = [
        "January",
        "February",
        "March",
        "April",
        "May",
        "June",
        "July",
        "August",
        "September",
        "October",
        "November",
        "December",
      ];

      const dayName = days[now.getDay()];
      const dayNum = now.getDate();
      const monthName = months[now.getMonth()];
      const year = now.getFullYear();

      const timeString = now.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      });

      setCurrentDateTime({
        dateStr: `${dayName}, ${dayNum} ${monthName} ${year}`,
        timeStr: timeString,
        greeting: greet,
      });
    };

    updateTime();
    const timer = setInterval(updateTime, 1000 * 30);
    return () => clearInterval(timer);
  }, []);

  // Dynamic Data States with exact visual defaults from screenshot
  const [stats, setStats] = useState({
    todaySales: "₹2,356.52",
    todaySalesGrowth: "12%",
    totalBills: "4",
    totalBillsGrowth: "8%",
    lowStockCount: "3",
    remindersCount: "0",
  });

  // Sales timeframe selection state
  const [selectedTimeframe, setSelectedTimeframe] = useState("Last 7 Days");
  const [isTimeframeDropdownOpen, setIsTimeframeDropdownOpen] = useState(false);
  const timeframeRef = React.useRef(null);

  // Close timeframe dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        timeframeRef.current &&
        !timeframeRef.current.contains(event.target)
      ) {
        setIsTimeframeDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const timeframeOptions = [
    { label: "Last 7 Days", subtitle: "Daily sales for the last 7 days" },
    { label: "Last 14 Days", subtitle: "Daily sales for the last 14 days" },
    { label: "Last 30 Days", subtitle: "Weekly sales overview for the last 30 days" },
    { label: "This Month", subtitle: "Weekly sales breakdown for this month" },
    { label: "Last 6 Months", subtitle: "Monthly sales overview for the last 6 months" },
  ];

  // Sales data sets for various timeframes
  const timeframeDataMap = {
    "Last 7 Days": [
      { day: "17 Sep", sales: 1800 },
      { day: "18 Sep", sales: 2100 },
      { day: "19 Sep", sales: 2700 },
      { day: "20 Sep", sales: 1900 },
      { day: "21 Sep", sales: 2500 },
      { day: "22 Sep", sales: 3000 },
      { day: "23 Sep", sales: 3600 },
    ],
    "Last 14 Days": [
      { day: "10 Sep", sales: 1500 },
      { day: "11 Sep", sales: 1900 },
      { day: "12 Sep", sales: 2200 },
      { day: "13 Sep", sales: 1700 },
      { day: "14 Sep", sales: 2400 },
      { day: "15 Sep", sales: 2800 },
      { day: "16 Sep", sales: 2100 },
      { day: "17 Sep", sales: 1800 },
      { day: "18 Sep", sales: 2100 },
      { day: "19 Sep", sales: 2700 },
      { day: "20 Sep", sales: 1900 },
      { day: "21 Sep", sales: 2500 },
      { day: "22 Sep", sales: 3000 },
      { day: "23 Sep", sales: 3600 },
    ],
    "Last 30 Days": [
      { day: "Week 1", sales: 14200 },
      { day: "Week 2", sales: 18500 },
      { day: "Week 3", sales: 22100 },
      { day: "Week 4", sales: 26800 },
    ],
    "This Month": [
      { day: "1-7 Sep", sales: 16500 },
      { day: "8-14 Sep", sales: 19800 },
      { day: "15-21 Sep", sales: 24200 },
      { day: "22-28 Sep", sales: 21500 },
    ],
    "Last 6 Months": [
      { day: "Apr", sales: 52000 },
      { day: "May", sales: 61000 },
      { day: "Jun", sales: 58000 },
      { day: "Jul", sales: 74000 },
      { day: "Aug", sales: 82000 },
      { day: "Sep", sales: 91000 },
    ],
  };

  const currentSalesData =
    timeframeDataMap[selectedTimeframe] || timeframeDataMap["Last 7 Days"];
  const currentSalesSubtitle =
    timeframeOptions.find((t) => t.label === selectedTimeframe)?.subtitle ||
    "Daily sales for the last 7 days";

  // Calculate dynamic max and ticks for Y-Axis
  const maxSalesVal = Math.max(
    ...currentSalesData.map((d) => d.sales || 0),
    4000
  );
  const yAxisMax = Math.ceil(maxSalesVal / 1000) * 1000;
  const yAxisTicks = [
    0,
    Math.round(yAxisMax * 0.25),
    Math.round(yAxisMax * 0.5),
    Math.round(yAxisMax * 0.75),
    yAxisMax,
  ];

  const [stockStatusData, setStockStatusData] = useState([
    { name: "In Stock", value: 1092, percentage: "88%", color: "#10B981" },
    { name: "Low Stock", value: 3, percentage: "0.5%", color: "#F59E0B" },
    { name: "Out of Stock", value: 12, percentage: "1%", color: "#EF4444" },
    { name: "Near Expiry", value: 18, percentage: "1.5%", color: "#6366F1" },
  ]);

  const [totalMedicinesCount, setTotalMedicinesCount] = useState("1,245");

  const [recentBills, setRecentBills] = useState([
    {
      id: "INV_2026_004",
      patient: "XYZ",
      initials: "XYZ",
      avatarBg: "bg-purple-600",
      dateTime: "23 Sep 2026",
      time: "06:12 PM",
      amount: "₹1,414.67",
      payment: "Cash",
      paymentType: "cash",
      status: "Completed",
    },
    {
      id: "INV_2026_003",
      patient: "Kaif Shaikh",
      initials: "KS",
      avatarBg: "bg-indigo-600",
      dateTime: "23 Sep 2026",
      time: "04:35 PM",
      amount: "₹141.06",
      payment: "Cash",
      paymentType: "cash",
      status: "Completed",
    },
    {
      id: "INV_2026_002",
      patient: "Pranav Singh",
      initials: "PS",
      avatarBg: "bg-purple-500",
      dateTime: "22 Sep 2026",
      time: "11:20 AM",
      amount: "₹856.00",
      payment: "UPI",
      paymentType: "upi",
      status: "Completed",
    },
  ]);

  const [expiryAlerts, setExpiryAlerts] = useState([
    {
      id: 1,
      name: "CLAMP 625",
      expiryDate: "22 Sep 2026",
      status: "Expired",
      type: "box",
    },
    {
      id: 2,
      name: "Paracetamol 500mg",
      expiryDate: "28 Sep 2026",
      status: "Expiring Soon",
      type: "blister",
    },
    {
      id: 3,
      name: "Azithromycin 500mg",
      expiryDate: "30 Sep 2026",
      status: "Expiring Soon",
      type: "box",
    },
  ]);

  // Helpers for exact clean date & time formatting
  const formatCleanDate = (dateVal) => {
    if (!dateVal) return "23 Sep 2026";
    const d = new Date(dateVal);
    if (isNaN(d.getTime())) return "23 Sep 2026";
    const day = d.getDate();
    const months = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];
    const month = months[d.getMonth()] || "Sep";
    const year = d.getFullYear();
    return `${day} ${month} ${year}`;
  };

  const formatCleanTime = (dateVal) => {
    if (!dateVal) return "06:12 PM";
    const d = new Date(dateVal);
    if (isNaN(d.getTime())) return "06:12 PM";
    return d.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  // Attempt to fetch fresh data from backend
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [salesRes, billsRes, lowStockRes, expiryRes] = await Promise.allSettled([
          apiClient.get("/reports/daily-sales"),
          apiClient.get("/bills"),
          apiClient.get("/reports/low-stock"),
          apiClient.get("/reports/expiry"),
        ]);

        if (salesRes.status === "fulfilled" && salesRes.value?.data?.data?.[0]) {
          const salesVal = salesRes.value.data.data[0].total_sales;
          if (salesVal !== undefined && salesVal !== null) {
            setStats((prev) => ({
              ...prev,
              todaySales: `₹${Number(salesVal).toLocaleString("en-IN", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}`,
            }));
          }
        }

        if (billsRes.status === "fulfilled" && billsRes.value?.data) {
          const billsData = billsRes.value.data.data || billsRes.value.data;
          if (Array.isArray(billsData) && billsData.length > 0) {
            setStats((prev) => ({
              ...prev,
              totalBills: `${billsData.length}`,
            }));

            // Format top recent bills
            const formatted = billsData.slice(0, 4).map((b, i) => {
              const name = b.patient_name || b.customer_name || "Customer";
              const initials = name
                .split(" ")
                .filter(Boolean)
                .map((n) => n[0])
                .join("")
                .substring(0, 3)
                .toUpperCase();

              const created = b.createdAt || b.created_at || new Date();
              const dateText = formatCleanDate(created);
              const timeText = formatCleanTime(created);

              return {
                id: b.bill_number || `INV_${2026}_00${i + 1}`,
                patient: name,
                initials: initials || "PT",
                avatarBg:
                  i % 3 === 0
                    ? "bg-purple-600"
                    : i % 3 === 1
                      ? "bg-indigo-600"
                      : "bg-blue-600",
                dateTime: dateText,
                time: timeText,
                amount: `₹${Number(b.grand_total || b.total_amount || 0).toLocaleString(
                  "en-IN",
                  { minimumFractionDigits: 2, maximumFractionDigits: 2 }
                )}`,
                payment: b.payment_mode || b.payment_method || "Cash",
                paymentType: (b.payment_mode || "").toLowerCase().includes("upi")
                  ? "upi"
                  : "cash",
                status: b.payment_status || "Completed",
              };
            });
            setRecentBills(formatted);
          }
        }

        if (lowStockRes.status === "fulfilled" && lowStockRes.value?.data) {
          const count =
            lowStockRes.value.data.count ??
            lowStockRes.value.data.data?.length;
          if (count !== undefined) {
            setStats((prev) => ({
              ...prev,
              lowStockCount: `${count}`,
            }));
          }
        }

        if (expiryRes.status === "fulfilled" && expiryRes.value?.data) {
          const items = expiryRes.value.data.data;
          if (Array.isArray(items) && items.length > 0) {
            const formattedExpiry = items.slice(0, 4).map((med, i) => {
              const daysLeft = med.days_remaining ?? 10;
              return {
                id: med.medicine_id || i,
                name: med.medicine_name || med.name,
                expiryDate: formatCleanDate(med.expiry_date),
                status: daysLeft <= 0 ? "Expired" : "Expiring Soon",
                type: i % 2 === 0 ? "box" : "blister",
              };
            });
            setExpiryAlerts((prev) => {
              // Ensure at least 3 items for a balanced UI
              if (formattedExpiry.length >= 3) return formattedExpiry;
              return [
                ...formattedExpiry,
                ...prev.slice(formattedExpiry.length),
              ];
            });
          }
        }
      } catch (err) {
        console.error("Dashboard fetch error:", err);
      }
    };

    fetchDashboardData();
  }, []);

  const userName = user?.displayName ? user.displayName.split(" ")[0] : "Umar";

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-[1600px] mx-auto space-y-6">
      {/* 1. HEADER SECTION */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <span>{currentDateTime.greeting},</span>
            <span className="text-blue-600">{userName}</span>
            <span className="inline-block animate-wave text-2xl">👋</span>
          </h1>
          <p className="text-slate-500 text-xs sm:text-sm mt-1">
            Here's your pharmacy overview for today.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          {/* Add Medicine Button */}
          <Link
            to="/inventory/add-medicine"
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-semibold shadow-xs transition-colors"
          >
            <Plus size={18} strokeWidth={2.5} />
            <span>Add Medicine</span>
          </Link>

          {/* New Bill Button */}
          <Link
            to="/billing"
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-white hover:bg-slate-50 border border-slate-200 text-blue-600 rounded-xl text-sm font-semibold shadow-xs transition-colors"
          >
            <IndianRupee size={17} className="text-blue-600" />
            <span>New Bill</span>
          </Link>

          {/* Upload Excel Button */}
          <Link
            to="/inventory/upload"
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-white hover:bg-slate-50 border border-slate-200 text-emerald-600 rounded-xl text-sm font-semibold shadow-xs transition-colors"
          >
            <Upload size={17} className="text-emerald-600" />
            <span>Upload Excel</span>
          </Link>

          {/* Current Date & Time display */}
          <div className="hidden sm:flex items-center gap-2.5 pl-3 border-l border-slate-200">
            <div className="p-2 rounded-lg bg-slate-50 text-slate-400">
              <Calendar size={18} />
            </div>
            <div className="text-left">
              <p className="text-xs font-semibold text-slate-700 leading-tight">
                {currentDateTime.dateStr}
              </p>
              <p className="text-[11px] text-slate-400 font-medium mt-0.5">
                {currentDateTime.timeStr}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 2. STAT CARDS ROW */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {/* Card 1: Today's Sales */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-xs hover:shadow-sm transition-all flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-500 flex items-center justify-center font-bold">
                <IndianRupee size={20} />
              </div>
              <span className="text-sm font-medium text-slate-500">
                Today's Sales
              </span>
            </div>
            <button className="text-slate-300 hover:text-slate-600 p-1 transition-colors">
              <MoreVertical size={16} />
            </button>
          </div>

          <div className="flex items-end justify-between mt-4">
            <div>
              <h2 className="text-2xl lg:text-[28px] font-bold text-slate-900 tracking-tight">
                {stats.todaySales}
              </h2>
            </div>
            {/* Green Sparkline */}
            <div className="w-24 h-10 flex items-center justify-end">
              <svg className="w-full h-full overflow-visible" viewBox="0 0 90 35">
                <path
                  d="M 5 28 Q 25 32, 45 16 T 70 8 T 88 18"
                  fill="none"
                  stroke="#10B981"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                />
              </svg>
            </div>
          </div>

          <div className="flex items-center gap-2 mt-3 pt-1">
            <span className="inline-flex items-center gap-0.5 text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-600">
              <span>↑</span>
              <span>{stats.todaySalesGrowth}</span>
            </span>
            <span className="text-xs text-slate-400">vs yesterday</span>
          </div>
        </div>

        {/* Card 2: Total Bills */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-xs hover:shadow-sm transition-all flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-pink-50 text-pink-500 flex items-center justify-center">
                <IndianRupee size={20} />
              </div>
              <span className="text-sm font-medium text-slate-500">
                Total Bills
              </span>
            </div>
            <button className="text-slate-300 hover:text-slate-600 p-1 transition-colors">
              <MoreVertical size={16} />
            </button>
          </div>

          <div className="flex items-end justify-between mt-4">
            <div>
              <h2 className="text-2xl lg:text-[28px] font-bold text-slate-900 tracking-tight">
                {stats.totalBills}
              </h2>
            </div>
            {/* Pink Sparkline */}
            <div className="w-24 h-10 flex items-center justify-end">
              <svg className="w-full h-full overflow-visible" viewBox="0 0 90 35">
                <path
                  d="M 5 28 Q 25 30, 45 32 T 70 12 T 88 20"
                  fill="none"
                  stroke="#EC4899"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                />
              </svg>
            </div>
          </div>

          <div className="flex items-center gap-2 mt-3 pt-1">
            <span className="inline-flex items-center gap-0.5 text-xs font-semibold px-2 py-0.5 rounded-full bg-blue-50 text-blue-600">
              <span>↑</span>
              <span>{stats.totalBillsGrowth}</span>
            </span>
            <span className="text-xs text-slate-400">this month</span>
          </div>
        </div>

        {/* Card 3: Low Stock Items */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-xs hover:shadow-sm transition-all flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-500 flex items-center justify-center">
                <AlertTriangle size={20} />
              </div>
              <span className="text-sm font-medium text-slate-500">
                Low Stock Items
              </span>
            </div>
            <button className="text-slate-300 hover:text-slate-600 p-1 transition-colors">
              <MoreVertical size={16} />
            </button>
          </div>

          <div className="flex items-end justify-between mt-4">
            <div>
              <h2 className="text-2xl lg:text-[28px] font-bold text-slate-900 tracking-tight">
                {stats.lowStockCount}
              </h2>
            </div>
            {/* Orange Sparkline */}
            <div className="w-24 h-10 flex items-center justify-end">
              <svg className="w-full h-full overflow-visible" viewBox="0 0 90 35">
                <path
                  d="M 5 18 Q 25 18, 48 30 T 72 12 T 88 26"
                  fill="none"
                  stroke="#F97316"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                />
              </svg>
            </div>
          </div>

          <div className="flex items-center gap-2 mt-3 pt-1">
            <span className="inline-flex items-center text-xs font-semibold px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-600">
              Needs Attention
            </span>
            <span className="text-xs text-slate-400">critical items</span>
          </div>
        </div>

        {/* Card 4: Upcoming Reminders */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-xs hover:shadow-sm transition-all flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-500 flex items-center justify-center">
                <Bell size={20} />
              </div>
              <span className="text-sm font-medium text-slate-500">
                Upcoming Reminders
              </span>
            </div>
            <button className="text-slate-300 hover:text-slate-600 p-1 transition-colors">
              <MoreVertical size={16} />
            </button>
          </div>

          <div className="flex items-end justify-between mt-4">
            <div>
              <h2 className="text-2xl lg:text-[28px] font-bold text-slate-900 tracking-tight">
                {stats.remindersCount}
              </h2>
            </div>
            {/* Purple Sparkline */}
            <div className="w-24 h-10 flex items-center justify-end">
              <svg className="w-full h-full overflow-visible" viewBox="0 0 90 35">
                <path
                  d="M 5 24 Q 25 32, 50 30 T 72 16 T 88 22"
                  fill="none"
                  stroke="#A855F7"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                />
              </svg>
            </div>
          </div>

          <div className="flex items-center gap-2 mt-3 pt-1">
            <span className="inline-flex items-center text-xs font-semibold px-2.5 py-0.5 rounded-full bg-purple-50 text-purple-600">
              Next 7 Days
            </span>
            <span className="text-xs text-slate-400">patient follow-ups</span>
          </div>
        </div>
      </div>

      {/* 3. MIDDLE SECTION: Sales Overview (Bar Chart) & Medicine Stock Status (Donut Chart) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Sales Overview */}
        <div className="lg:col-span-7 xl:col-span-7 bg-white rounded-2xl p-5 border border-slate-200/90 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                <BarChart2 size={18} />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-800 leading-tight">
                  Sales Overview
                </h3>
                <p className="text-xs text-slate-400">
                  {currentSalesSubtitle}
                </p>
              </div>
            </div>

            {/* Timeframe Dropdown */}
            <div className="relative" ref={timeframeRef}>
              <button
                type="button"
                onClick={() => setIsTimeframeDropdownOpen((prev) => !prev)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors shadow-2xs cursor-pointer select-none"
              >
                <Calendar size={13} className="text-slate-500" />
                <span>{selectedTimeframe}</span>
                <ChevronDown
                  size={13}
                  className={`text-slate-400 transition-transform duration-200 ${isTimeframeDropdownOpen ? "rotate-180" : ""
                    }`}
                />
              </button>

              {isTimeframeDropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white border border-slate-200 rounded-xl shadow-lg z-50 py-1 overflow-hidden animate-in fade-in slide-in-from-top-1 duration-150">
                  <div className="px-3 py-1.5 border-b border-slate-100 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                    Select Timeframe
                  </div>
                  {timeframeOptions.map((option) => {
                    const isSelected = selectedTimeframe === option.label;
                    return (
                      <button
                        key={option.label}
                        type="button"
                        onClick={() => {
                          setSelectedTimeframe(option.label);
                          setIsTimeframeDropdownOpen(false);
                        }}
                        className={`w-full text-left px-3 py-2 text-xs font-medium flex items-center justify-between transition-colors cursor-pointer ${isSelected
                          ? "bg-blue-50 text-blue-600 font-semibold"
                          : "text-slate-700 hover:bg-slate-50"
                          }`}
                      >
                        <span>{option.label}</span>
                        {isSelected && (
                          <CheckCircle2 size={13} className="text-blue-600" />
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Bar Chart Area */}
          <div className="h-64 sm:h-72 w-full pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={currentSalesData}
                margin={{ top: 10, right: 10, left: -15, bottom: 0 }}
                barSize={currentSalesData.length > 8 ? 16 : 32}
              >
                <XAxis
                  dataKey="day"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#94a3b8", fontSize: 11 }}
                  dy={8}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#94a3b8", fontSize: 11 }}
                  domain={[0, yAxisMax]}
                  ticks={yAxisTicks}
                  tickFormatter={(val) => {
                    if (val === 0) return "0";
                    if (val >= 1000) return `${Math.round(val / 1000)}K`;
                    return `${val}`;
                  }}
                />
                <Tooltip
                  cursor={{ fill: "rgba(241, 245, 249, 0.6)" }}
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="bg-slate-900 text-white px-2.5 py-1.5 rounded-lg text-xs shadow-md">
                          <p className="font-semibold">
                            ₹{Number(payload[0].value).toLocaleString("en-IN")}
                          </p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar dataKey="sales" radius={[6, 6, 0, 0]}>
                  {currentSalesData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={
                        index >= currentSalesData.length - 2
                          ? "#3B82F6"
                          : "#93C5FD"
                      }
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Medicine Stock Status */}
        <div className="lg:col-span-5 xl:col-span-5 bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/90 shadow-xs flex flex-col justify-between overflow-hidden">
          <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Clock size={18} />
            </div>
            <h3 className="text-base font-bold text-slate-800">
              Medicine Stock Status
            </h3>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6 py-4 my-auto w-full">
            {/* Donut Chart with Centered Total */}
            <div className="relative w-36 h-36 sm:w-40 sm:h-40 shrink-0 flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={stockStatusData}
                    cx="50%"
                    cy="50%"
                    innerRadius={46}
                    outerRadius={65}
                    paddingAngle={3}
                    dataKey="value"
                    startAngle={90}
                    endAngle={-270}
                  >
                    {stockStatusData.map((entry, index) => (
                      <Cell key={`donut-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center">
                <span className="text-[10px] sm:text-[11px] text-slate-400 font-medium leading-tight">
                  Total Medicines
                </span>
                <span className="text-lg sm:text-xl font-extrabold text-slate-800 mt-0.5">
                  {totalMedicinesCount}
                </span>
              </div>
            </div>

            {/* Legend Stats List */}
            <div className="w-full flex-1 min-w-0 space-y-2.5">
              {stockStatusData.map((item, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between gap-2 text-xs py-0.5"
                >
                  <div className="flex items-center gap-2 min-w-0 truncate">
                    <span
                      className="w-2.5 h-2.5 rounded-full shrink-0"
                      style={{ backgroundColor: item.color }}
                    ></span>
                    <span className="text-slate-600 font-medium truncate text-xs">
                      {item.name}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 shrink-0 ml-auto">
                    <span className="font-bold text-slate-900 text-xs">
                      {item.value.toLocaleString()}
                    </span>
                    <span className="text-slate-400 w-8 text-right font-medium text-xs">
                      {item.percentage}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 4. BOTTOM SECTION: Recent Bills Table & Expiry Alerts List */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Recent Bills */}
        <div className="lg:col-span-8 xl:col-span-8 bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden flex flex-col">
          <div className="p-5 flex items-center justify-between border-b border-slate-100">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                <IndianRupee size={18} />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-800 leading-tight">
                  Recent Bills
                </h3>
                <p className="text-xs text-slate-400">
                  Latest pharmacy transactions
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button className="p-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-500 transition-colors shadow-2xs">
                <Filter size={14} />
              </button>
              <Link
                to="/billing-history"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-blue-200 hover:bg-blue-50 text-blue-600 text-xs font-semibold transition-colors shadow-2xs"
              >
                <span>View All</span>
                <ArrowRight size={13} />
              </Link>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                  <th className="py-3 px-5 whitespace-nowrap">Bill No</th>
                  <th className="py-3 px-4 whitespace-nowrap">Patient</th>
                  <th className="py-3 px-4 whitespace-nowrap">Date & Time</th>
                  <th className="py-3 px-4 whitespace-nowrap">Amount</th>
                  <th className="py-3 px-4 whitespace-nowrap">Payment</th>
                  <th className="py-3 px-4 whitespace-nowrap">Status</th>
                  <th className="py-3 px-5 text-right whitespace-nowrap">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {recentBills.map((bill, index) => (
                  <tr
                    key={bill.id || index}
                    className="hover:bg-slate-50/80 transition-colors"
                  >
                    <td className="py-3.5 px-5 font-semibold text-blue-600 hover:underline cursor-pointer whitespace-nowrap">
                      {bill.id}
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <div className="flex items-center gap-2.5">
                        <div
                          className={`w-7 h-7 rounded-full ${bill.avatarBg} text-white flex items-center justify-center text-[10px] font-bold shadow-2xs shrink-0`}
                        >
                          {bill.initials}
                        </div>
                        <span className="font-semibold text-slate-800">
                          {bill.patient}
                        </span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <p className="font-medium text-slate-700 leading-tight whitespace-nowrap">
                        {bill.dateTime}
                      </p>
                      <p className="text-[11px] text-slate-400 mt-0.5 whitespace-nowrap">
                        {bill.time}
                      </p>
                    </td>
                    <td className="py-3.5 px-4 font-bold text-slate-900 text-sm whitespace-nowrap">
                      {bill.amount}
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span
                        className={`inline-block px-3 py-1 rounded-full text-[11px] font-semibold whitespace-nowrap ${bill.paymentType === "upi"
                          ? "bg-purple-50 text-purple-600"
                          : "bg-blue-50 text-blue-600"
                          }`}
                      >
                        {bill.payment}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-600 whitespace-nowrap">
                        <CheckCircle2 size={13} className="text-emerald-600 shrink-0" />
                        <span>Completed</span>
                      </span>
                    </td>
                    <td className="py-3.5 px-5 text-right whitespace-nowrap">
                      <div className="inline-flex items-center gap-1 justify-end">
                        <button className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors">
                          <Eye size={15} />
                        </button>
                        <button className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors">
                          <MoreVertical size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Expiry Alerts */}
        <div className="lg:col-span-4 xl:col-span-4 bg-white rounded-2xl p-5 border border-slate-200/90 shadow-xs flex flex-col justify-start">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-rose-50 text-rose-500 flex items-center justify-center">
                <Clock size={18} />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-800 leading-tight">
                  Expiry Alerts
                </h3>
                <p className="text-xs text-slate-400">Medicines nearing expiry</p>
              </div>
            </div>

            <Link
              to="/inventory/expiry-alerts"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-blue-200 hover:bg-blue-50 text-blue-600 text-xs font-semibold transition-colors shadow-2xs"
            >
              <span>View All</span>
              <ArrowRight size={13} />
            </Link>
          </div>

          <div className="divide-y divide-slate-100">
            {expiryAlerts.map((item) => (
              <div
                key={item.id}
                className="py-3.5 flex items-center justify-between gap-3 hover:bg-slate-50/50 rounded-xl px-2 transition-colors"
              >
                <div className="flex items-center gap-3 min-w-0">
                  {/* Medicine Thumbnail */}
                  <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-200/70 flex items-center justify-center p-1.5 shadow-2xs shrink-0 overflow-hidden">
                    {item.type === "blister" ? (
                      <div className="grid grid-cols-2 gap-1 w-full h-full p-0.5">
                        <div className="w-2.5 h-2.5 rounded-full bg-slate-300"></div>
                        <div className="w-2.5 h-2.5 rounded-full bg-slate-300"></div>
                        <div className="w-2.5 h-2.5 rounded-full bg-slate-300"></div>
                        <div className="w-2.5 h-2.5 rounded-full bg-slate-300"></div>
                      </div>
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-blue-400 to-indigo-500 rounded-md flex flex-col justify-end p-0.5 shadow-2xs">
                        <div className="w-full h-1.5 bg-white/70 rounded-2xs"></div>
                      </div>
                    )}
                  </div>

                  <div className="min-w-0">
                    <h4 className="text-xs font-bold text-slate-800 leading-tight truncate">
                      {item.name}
                    </h4>
                    <p className="text-[11px] text-slate-400 font-medium mt-0.5 whitespace-nowrap">
                      Expiry: {item.expiryDate}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold border whitespace-nowrap ${item.status === "Expired"
                      ? "bg-rose-50 text-rose-500 border-rose-100"
                      : "bg-amber-50 text-amber-600 border-amber-100"
                      }`}
                  >
                    {item.status}
                  </span>
                  <button className="text-slate-300 hover:text-slate-600 p-1 transition-colors">
                    <MoreVertical size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
