import React, { useState, useEffect } from "react";
import { NavLink, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Package,
  PlusSquare,
  Boxes,
  AlertTriangle,
  Users,
  IndianRupee,
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
    INVENTORY: false,
    BILLING: false,
    PATIENTS: false,
  });
  const { logout, user } = useAuth();

  const location = useLocation();

  useEffect(() => {
    const pathname = location.pathname;
    const newExpanded = {
      INVENTORY: false,
      BILLING: false,
      PATIENTS: false,
    };

    if (
      pathname.startsWith("/inventory") ||
      pathname.startsWith("/upload")
    ) {
      newExpanded.INVENTORY = true;
    } else if (
      pathname.startsWith("/billing") ||
      pathname === "/billing-history"
    ) {
      newExpanded.BILLING = true;
    } else if (
      pathname.startsWith("/patients") ||
      pathname.startsWith("/reminders")
    ) {
      newExpanded.PATIENTS = true;
    }

    setExpandedSections(newExpanded);
  }, [location.pathname]);

  const toggleSection = (section) => {
    setExpandedSections((prev) => ({
      INVENTORY: false,
      BILLING: false,
      PATIENTS: false,
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
          path: "/inventory/upload",
          icon: <Upload size={18} />,
        },
      ],
    },
    {
      section: "BILLING",
      icon: <IndianRupee size={14} />,
      items: [
        {
          name: "Billing",
          path: "/billing",
          icon: <IndianRupee size={18} />,
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
      <div className="lg:hidden fixed top-0 left-0 right-0 flex items-center justify-between bg-white text-slate-800 px-4 py-3 z-50 border-b border-slate-200 shadow-sm">
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
            <p className="text-xs text-slate-500">ERP System</p>
          </div>
        </div>
        <button
          onClick={() => setIsOpen(true)}
          className="p-2 rounded-xl hover:bg-slate-100 transition-colors"
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
        className={`fixed lg:sticky top-0 left-0 z-50 h-screen w-72 max-w-[85%] bg-white text-slate-800 flex flex-col transform transition-transform duration-300 border-r border-slate-200 shadow-sm
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
        <div className="relative z-10 flex items-center justify-between px-5 py-4 border-b border-slate-200">
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
              <p className="text-xs text-slate-500">ERP System</p>
            </div>
          </div>
          <button
            className="lg:hidden p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
            onClick={() => setIsOpen(false)}
          >
            <X size={20} />
          </button>
        </div>

        {/* NAVIGATION */}
        <div className="relative z-10 flex-1 overflow-y-auto px-3 py-4 scrollbar-thin scrollbar-thumb-slate-200 scrollbar-track-transparent">
          {menuItems.map((section, sectionIndex) => {
            const isDropdown = !['MAIN', 'ANALYTICS', 'SETTINGS'].includes(section.section);

            if (!isDropdown) {
              return (
                <div key={sectionIndex} className="mb-2">
                  {section.items.map((item, index) => (
                    <NavLink
                      key={index}
                      to={item.path}
                      end
                      onClick={() => setIsOpen(false)}
                      className={({ isActive }) =>
                        `flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all duration-200 group relative
                        ${isActive
                          ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-md shadow-blue-500/25 font-medium"
                          : "hover:bg-slate-50 text-slate-600 hover:text-slate-900 border border-transparent"
                        }`
                      }
                    >
                      {({ isActive }) => (
                        <>
                          <span
                            className={`transition-transform group-hover:scale-105 ${isActive ? "text-white" : "text-slate-500"
                              }`}
                          >
                            {item.icon}
                          </span>
                          <span className={`text-sm ${isActive ? "text-white font-medium" : "text-slate-600 font-medium"}`}>{item.name}</span>
                        </>
                      )}
                    </NavLink>
                  ))}
                </div>
              );
            }

            return (
              <div key={sectionIndex} className="mb-4">
                {/* SECTION TITLE - Clickable */}
                <button
                  onClick={() => toggleSection(section.section)}
                  className="w-full px-3 py-2 flex items-center justify-between group hover:bg-slate-50 rounded-lg transition-all duration-200"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-blue-400/70">{section.icon}</span>
                    <p className="text-xs font-semibold tracking-wider text-slate-500 uppercase group-hover:text-slate-700 transition-colors">
                      {section.section}
                    </p>
                  </div>
                  <ChevronRight
                    size={14}
                    className={`text-slate-400 transition-transform duration-200 ${expandedSections[section.section] ? "rotate-90" : ""
                      }`}
                  />
                </button>

                {/* LINKS */}
                <div
                  className={`space-y-1 mt-1 overflow-hidden transition-all duration-300 ${expandedSections[section.section]
                    ? "max-h-96 opacity-100"
                    : "max-h-0 opacity-0"
                    }`}
                >
                  {section.items.map((item, index) => (
                    <NavLink
                      key={index}
                      to={item.path}
                      end
                      onClick={() => setIsOpen(false)}
                      className={({ isActive }) =>
                        `flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all duration-200 group relative
                        ${isActive
                          ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-md shadow-blue-500/25 font-medium"
                          : "hover:bg-slate-50 text-slate-600 hover:text-slate-900 border border-transparent"
                        }`
                      }
                    >
                      {({ isActive }) => (
                        <>
                          <span
                            className={`transition-transform group-hover:scale-105 ${isActive ? "text-white" : "text-slate-500"
                              }`}
                          >
                            {item.icon}
                          </span>
                          <span className={`text-sm ${isActive ? "text-white font-medium" : "text-slate-600 font-medium"}`}>{item.name}</span>
                        </>
                      )}
                    </NavLink>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* BOTTOM PHARMACY CARD */}
        {/* <div className="relative z-10 m-3 p-3.5 bg-gradient-to-br from-blue-50/90 via-sky-50/70 to-indigo-50/80 border border-blue-100 rounded-2xl flex items-center justify-between shadow-xs">
          <div className="max-w-[130px]">
            <p className="text-xs font-medium text-slate-700 leading-snug">
              Manage your pharmacy easily and efficiently.
            </p>
          </div>
          <div className="relative w-12 h-14 flex items-center justify-center shrink-0">
            {/* Pill bottle & capsules */}
        {/*<div className="relative">
              <div className="w-7 h-9 bg-gradient-to-b from-blue-400 to-blue-600 rounded-lg shadow-sm border border-blue-300/40 flex flex-col items-center">
                <div className="w-5 h-2 bg-blue-200 rounded-t-xs -mt-1 shadow-inner"></div>
                <div className="w-5 h-4 bg-white/95 rounded-xs mt-1.5 flex items-center justify-center">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                </div>
              </div>
              {/* Capsule & tablet pills */}
        {/*<div className="absolute -bottom-1 -right-2 w-5 h-2.5 bg-gradient-to-r from-red-500 to-blue-500 rounded-full transform -rotate-45 shadow-sm border border-white"></div>
              <div className="absolute -bottom-1 -left-1.5 w-3 h-3 bg-red-400 rounded-full border border-white shadow-xs"></div>
            </div>
          </div>
        </div> */}

      </aside>
    </>
  );
};

export default Sidebar;
