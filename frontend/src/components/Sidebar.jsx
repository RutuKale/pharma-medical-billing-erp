import React, { useState } from "react";
import { NavLink } from "react-router-dom";

import {
  LayoutDashboard,
  Package,
  PlusSquare,
  Boxes,
  AlertTriangle,
  Users,
  Receipt,
  History,
  BarChart3,
  BellRing,
  Upload,
  Settings,
  Pill,
  Menu,
  X,
  LogOut,
  ChevronRight,
  Shield,
  Activity,
  Sparkles,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";

const Sidebar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [expandedSections, setExpandedSections] = useState({
    MAIN: true,
    INVENTORY: true,
    BILLING: true,
    PATIENTS: true,
    ANALYTICS: true,
    SETTINGS: true,
  });
  const { logout, user } = useAuth();

  const toggleSection = (section) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const menuItems = [
    {
      section: "MAIN",
      icon: <Activity size={14} />,
      items: [
        {
          name: "Dashboard",
          path: "/",
          icon: <LayoutDashboard size={18} />,
        },
      ],
    },
    {
      section: "INVENTORY",
      icon: <Package size={14} />,
      items: [
        {
          name: "Medicine List",
          path: "/inventory",
          icon: <Package size={18} />,
        },
        {
          name: "Add Medicine",
          path: "/inventory/add-medicine",
          icon: <PlusSquare size={18} />,
        },
        {
          name: "Stock Overview",
          path: "/inventory/stock",
          icon: <BarChart3 size={18} />,
        },
        {
          name: "Stock In",
          path: "/inventory/stock-in",
          icon: <Boxes size={18} />,
        },
        {
          name: "Expiry Alerts",
          path: "/inventory/expiry-alerts",
          icon: <AlertTriangle size={18} />,
        },
        {
          name: "Upload Excel",
          path: "/upload",
          icon: <Upload size={18} />,
        },
      ],
    },
    {
      section: "BILLING",
      icon: <Receipt size={14} />,
      items: [
        {
          name: "Billing",
          path: "/billing",
          icon: <Receipt size={18} />,
        },
        {
          name: "Bill History",
          path: "/billing-history",
          icon: <History size={18} />,
        },
      ],
    },
    {
      section: "PATIENTS",
      icon: <Users size={14} />,
      items: [
        {
          name: "Patient Register",
          path: "/patients",
          icon: <Users size={18} />,
        },
        {
          name: "Reminder Tracker",
          path: "/reminders",
          icon: <BellRing size={18} />,
        },
      ],
    },
    {
      section: "ANALYTICS",
      icon: <BarChart3 size={14} />,
      items: [
        {
          name: "Reports",
          path: "/reports",
          icon: <BarChart3 size={18} />,
        },
      ],
    },
    {
      section: "SETTINGS",
      icon: <Settings size={14} />,
      items: [
        {
          name: "Settings",
          path: "/settings",
          icon: <Settings size={18} />,
        },
      ],
    },
  ];

  return (
    <>
      {/* MOBILE TOPBAR */}
     <div className="lg:hidden fixed top-0 left-0 right-0 flex items-center justify-between bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 text-white px-4 py-3 z-50 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="relative group">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-indigo-400 rounded-xl blur-lg opacity-75 group-hover:opacity-100 transition-opacity"></div>
            <div className="relative bg-gradient-to-br from-blue-500 to-indigo-600 p-2 rounded-xl">
              <Pill size={20} className="text-white" />
            </div>
          </div>
          <div>
            <h1 className="font-bold text-lg bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">
              PharmaMed
            </h1>
            <p className="text-xs text-blue-300/70">ERP System</p>
          </div>
        </div>
        <button
          onClick={() => setIsOpen(true)}
          className="p-2 rounded-xl hover:bg-white/10 transition-colors"
        >
          <Menu size={22} />
        </button>
      </div>

      {/* OVERLAY */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* SIDEBAR */}
      <aside
        className={`fixed lg:sticky top-0 left-0 z-50 h-screen w-72 max-w-[85%] bg-gradient-to-b from-slate-900 via-blue-950 to-slate-900 text-white flex flex-col transform transition-transform duration-300 border-r border-white/10
        ${isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}`}
      >
        {/* Animated Background Pattern */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 -left-4 w-48 h-48 bg-blue-500/10 rounded-full filter blur-3xl"></div>
          <div className="absolute bottom-1/4 -right-4 w-48 h-48 bg-indigo-500/10 rounded-full filter blur-3xl"></div>
          <div className="absolute inset-0 opacity-5">
            <div className="h-full w-full bg-[linear-gradient(rgba(20,184,166,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(20,184,166,0.1)_1px,transparent_1px)] bg-[size:32px_32px]"></div>
          </div>
        </div>

        {/* HEADER */}
        <div className="relative z-10 flex items-center justify-between px-5 py-4 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-indigo-400 rounded-xl blur-lg opacity-75 group-hover:opacity-100 transition-opacity"></div>
              <div className="relative bg-gradient-to-br from-blue-500 to-indigo-600 p-2 rounded-xl shadow-lg">
                <Pill size={22} className="text-white" />
              </div>
            </div>
            <div>
              <h1 className="font-bold text-lg bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">
                PharmaMed
              </h1>
              <p className="text-xs text-blue-300/70">ERP System</p>
            </div>
          </div>
          <button
            className="lg:hidden p-1.5 rounded-lg hover:bg-white/10 transition-colors"
            onClick={() => setIsOpen(false)}
          >
            <X size={20} />
          </button>
        </div>

        {/* SECURITY BADGE */}
        <div className="relative z-10 mx-4 mt-3 bg-indigo-500/10 border border-indigo-500/20 rounded-xl p-3 flex items-center gap-3">
          <div className="bg-indigo-500/20 p-1.5 rounded-lg">
            <Shield size={14} className="text-indigo-400" />
          </div>
          <div>
            <p className="text-white text-xs font-medium">Secure Session</p>
            <p className="text-indigo-300/70 text-xs">HIPAA Compliant</p>
          </div>
          <Sparkles size={14} className="text-indigo-400 ml-auto animate-pulse" />
        </div>

        {/* NAVIGATION */}
        <div className="relative z-10 flex-1 overflow-y-auto px-3 py-4 scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent">
          {menuItems.map((section, sectionIndex) => (
            <div key={sectionIndex} className="mb-4">
              {/* SECTION TITLE - Clickable */}
              <button
                onClick={() => toggleSection(section.section)}
                className="w-full px-3 py-2 flex items-center justify-between group hover:bg-white/5 rounded-lg transition-all duration-200"
              >
                <div className="flex items-center gap-2">
                  <span className="text-blue-400/70">{section.icon}</span>
                  <p className="text-xs font-semibold tracking-wider text-blue-300/70 uppercase group-hover:text-blue-300 transition-colors">
                    {section.section}
                  </p>
                </div>
                <ChevronRight
                  size={14}
                  className={`text-blue-400/50 transition-transform duration-200 ${
                    expandedSections[section.section] ? "rotate-90" : ""
                  }`}
                />
              </button>

              {/* LINKS */}
              <div
                className={`space-y-1 mt-1 overflow-hidden transition-all duration-300 ${
                  expandedSections[section.section]
                    ? "max-h-96 opacity-100"
                    : "max-h-0 opacity-0"
                }`}
              >
                {section.items.map((item, index) => (
                  <NavLink
                    key={index}
                    to={item.path}
                    onClick={() => setIsOpen(false)}
                    className={({ isActive }) =>
                      `flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all duration-200 group relative overflow-hidden
                      ${
                        isActive
                          ? "bg-gradient-to-r from-blue-500/20 to-indigo-500/20 text-white border border-blue-500/30 shadow-lg"
                          : "hover:bg-white/5 text-gray-400 hover:text-white border border-transparent"
                      }`
                    }
                  >
                    {({ isActive }) => (
                      <>
                        {isActive && (
                          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-gradient-to-b from-blue-400 to-indigo-400 rounded-r-full"></div>
                        )}
                        <span
                          className={`transition-transform group-hover:scale-110 ${
                            isActive ? "text-blue-400" : ""
                          }`}
                        >
                          {item.icon}
                        </span>
                        <span className="text-sm font-medium">{item.name}</span>
                      </>
                    )}
                  </NavLink>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* FOOTER */}
        <div className="relative z-10 p-4 border-t border-white/10 bg-gradient-to-t from-slate-900 to-transparent">
          {/* USER */}
          <div className="flex items-center gap-3 mb-3 p-3 bg-white/5 rounded-xl border border-white/10">
            <div className="relative">
              <img
                src={user?.photoURL || `https://ui-avatars.com/api/?name=${user?.displayName}&background=14b8a6&color=fff`}
                alt="user"
                className="w-10 h-10 rounded-xl ring-2 ring-blue-500/30"
              />
              <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-indigo-400 rounded-full border-2 border-slate-900"></div>
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-semibold text-white truncate">
                {user?.displayName || "User"}
              </h3>
              <p className="text-xs text-blue-300/70 truncate">
                {user?.email || "user@example.com"}
              </p>
            </div>
          </div>

          {/* LOGOUT */}
          <button
            onClick={logout}
            className="w-full bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 hover:border-red-500/30 text-red-400 hover:text-red-300 py-2.5 rounded-xl flex items-center justify-center gap-2 transition-all duration-200 group"
          >
            <LogOut size={16} className="group-hover:rotate-12 transition-transform" />
            <span className="text-sm font-medium">Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;