import React, { useState, useEffect } from "react";
import { Search, Bell, User, LogOut, ChevronDown, Settings, Sun, Moon } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { Link, useNavigate } from "react-router-dom";

const Navbar = () => {
    const { user, logout } = useAuth();
    const { theme, toggleTheme } = useTheme();
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [imgError, setImgError] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        setImgError(false);
    }, [user?.photoURL]);

    const userName = user?.displayName || user?.name || (user?.email ? user.email.split("@")[0] : "") || "unknown user";
    const userInitial = (userName.trim().charAt(0) || "U").toUpperCase();

    const handleLogout = async () => {
        try {
            if (logout) {
                await logout();
            }
            navigate('/login');
        } catch (error) {
            console.error("Failed to log out", error);
        }
    };

    return (
        <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-slate-200 shadow-sm px-4 lg:px-8 py-4 flex items-center justify-between transition-all duration-300">

            {/* Search Bar */}
            <div className="flex-1 max-w-md">
                <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Search size={18} className="text-blue-400/70 group-focus-within:text-blue-400 transition-colors" />
                    </div>
                    <input
                        type="text"
                        placeholder="Search medicines, patients, bills, or invoices..."
                        className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-sm rounded-xl pl-10 pr-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all placeholder:text-slate-400"
                    />
                </div>
            </div>

            {/* Right Actions */}
            <div className="flex items-center gap-3 md:gap-5 ml-4">
                {/* Dark / Light Mode Toggle */}
                <button
                    onClick={toggleTheme}
                    title={theme === "dark" ? "Switch to Light Mode" : "Switch to Dark Mode"}
                    aria-label="Toggle Dark and Light Mode"
                    className="relative p-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-all duration-200 active:scale-95 group"
                >
                    {theme === "dark" ? (
                        <Sun size={20} className="text-amber-400 group-hover:rotate-45 transition-transform duration-300" />
                    ) : (
                        <Moon size={20} className="text-slate-600 group-hover:-rotate-12 transition-transform duration-300" />
                    )}
                </button>

                {/* Notifications */}
                <button className="relative p-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors">
                    <Bell size={20} />
                    <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full border border-slate-900 animate-pulse"></span>
                </button>

                {/* Divider */}
                <div className="hidden sm:block w-px h-6 bg-slate-200"></div>

                {/* Profile Dropdown */}
                <div className="relative">
                    <button
                        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                        className="flex items-center gap-2 md:gap-3 p-1 pr-2 rounded-xl border border-transparent hover:border-slate-200 hover:bg-slate-50 transition-all group"
                    >
                        <div className="relative">
                            {user?.photoURL && !imgError ? (
                                <img
                                    src={user.photoURL}
                                    alt={userName}
                                    onError={() => setImgError(true)}
                                    className="w-8 h-8 rounded-lg object-cover ring-2 ring-blue-500/30 group-hover:ring-blue-400 transition-all"
                                />
                            ) : (
                                <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-bold text-sm flex items-center justify-center uppercase ring-2 ring-blue-500/30 group-hover:ring-blue-400 transition-all shadow-xs select-none">
                                    {userInitial}
                                </div>
                            )}
                            <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white dark:border-slate-900"></div>
                        </div>

                        <div className="hidden md:block text-left relative z-10">
                            <p className="text-sm font-semibold text-slate-800 leading-tight">
                                {user?.displayName || "umar sk"}
                            </p>
                            <p className="text-xs text-slate-500">
                                {user?.role || "Pharmacist"}
                            </p>
                        </div>

                        <ChevronDown size={14} className={`text-gray-400 hidden md:block transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`} />
                    </button>

                    {/* Dropdown Menu */}
                    {isDropdownOpen && (
                        <>
                            {/* Invisible overlay to close dropdown on click outside */}
                            <div
                                className="fixed inset-0 z-30"
                                onClick={() => setIsDropdownOpen(false)}
                            ></div>

                            <div className="absolute right-0 mt-3 w-56 bg-white border border-slate-200 rounded-2xl shadow-lg shadow-black/5 z-50 overflow-hidden py-1 animate-in fade-in slide-in-from-top-2 duration-200">
                                {/* Mobile Identity */}
                                <div className="md:hidden px-4 py-3 border-b border-slate-200 mb-1">
                                    <p className="text-sm font-medium text-slate-800">{user?.displayName || "Admin"}</p>
                                    <p className="text-xs text-slate-500 truncate mt-0.5">{user?.email || "admin@pharmamed.com"}</p>
                                </div>

                                <div className="px-2 py-1">
                                    <Link
                                        to="/settings"
                                        onClick={() => setIsDropdownOpen(false)}
                                        className="flex items-center gap-3 px-3 py-2 text-sm text-slate-600 hover:text-slate-800 hover:bg-slate-50 rounded-xl transition-colors"
                                    >
                                        <User size={16} className="text-blue-400" />
                                        My Profile
                                    </Link>
                                    <Link
                                        to="/settings"
                                        onClick={() => setIsDropdownOpen(false)}
                                        className="flex items-center gap-3 px-3 py-2 text-sm text-slate-600 hover:text-slate-800 hover:bg-slate-50 rounded-xl transition-colors"
                                    >
                                        <Settings size={16} className="text-blue-400" />
                                        Settings
                                    </Link>
                                </div>

                                <div className="px-2 pt-1 pb-1 border-t border-slate-200 mt-1">
                                    <button
                                        onClick={handleLogout}
                                        className="w-full flex items-center gap-3 px-3 py-2 text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-xl transition-colors"
                                    >
                                        <LogOut size={16} />
                                        Sign Out
                                    </button>
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </header>
    );
};

export default Navbar;
