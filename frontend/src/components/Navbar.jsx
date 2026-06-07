import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { FileSearch, LogOut, Sun, Moon, History, LayoutDashboard, User } from 'lucide-react';
import { getUsername, isAuthenticated, logoutUser } from '../api/analyzeApi';
import toast from 'react-hot-toast';

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');
  const [userLoggedIn, setUserLoggedIn] = useState(isAuthenticated());
  const [username, setUsername] = useState(getUsername());

  // Listen to storage events to update auth status dynamically
  useEffect(() => {
    const handleStorageChange = () => {
      setUserLoggedIn(isAuthenticated());
      setUsername(getUsername());
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // Ensure login details are updated whenever navigation happens
  useEffect(() => {
    setUserLoggedIn(isAuthenticated());
    setUsername(getUsername());
  }, [location]);

  // Handle Dark/Light mode DOM classes
  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => (prev === 'light' ? 'dark' : 'light'));
  };

  const handleLogout = () => {
    logoutUser();
    setUserLoggedIn(false);
    setUsername('');
    toast.success('Logged out successfully');
    navigate('/login');
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-200/80 dark:border-slate-800/80 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Brand Logo */}
        <Link to="/" className="flex items-center gap-2 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-teal-500 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-teal-500/10 group-hover:scale-105 transition duration-200">
            <FileSearch className="w-5 h-5" />
          </div>
          <span className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-300 bg-clip-text text-transparent">
            Resume<span className="text-teal-500">Analyzer</span>
          </span>
        </Link>

        {/* Action Controls */}
        <div className="flex items-center gap-4">
          
          {/* Navigation Links (If Authenticated) */}
          {userLoggedIn && (
            <nav className="flex items-center gap-1 sm:gap-2 mr-2">
              <Link
                to="/"
                className={`flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg transition ${
                  location.pathname === '/'
                    ? 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200'
                    : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
                }`}
              >
                <LayoutDashboard className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Dashboard</span>
              </Link>
              
              <Link
                to="/history"
                className={`flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg transition ${
                  location.pathname === '/history'
                    ? 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200'
                    : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
                }`}
              >
                <History className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">History</span>
              </Link>
            </nav>
          )}

          {/* Theme Toggle Button */}
          <button
            type="button"
            onClick={toggleTheme}
            className="p-2 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            title={theme === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
          >
            {theme === 'light' ? (
              <Moon className="w-4 h-4 text-slate-600" />
            ) : (
              <Sun className="w-4 h-4 text-amber-400" />
            )}
          </button>

          {/* User Session Info / Logout */}
          {userLoggedIn ? (
            <div className="flex items-center gap-3 pl-3 border-l border-slate-200 dark:border-slate-800">
              <div className="hidden lg:flex flex-col text-right">
                <span className="text-xs font-bold text-slate-800 dark:text-slate-250 truncate max-w-[100px]">
                  {username}
                </span>
                <span className="text-[9px] text-slate-400 uppercase font-semibold">
                  Standard Account
                </span>
              </div>
              <button
                type="button"
                onClick={handleLogout}
                className="flex items-center justify-center gap-1.5 px-3 py-2 bg-rose-50 dark:bg-rose-950/20 hover:bg-rose-100 dark:hover:bg-rose-950/40 text-rose-600 dark:text-rose-400 text-xs font-bold rounded-lg border border-rose-100 dark:border-rose-900/20 transition cursor-pointer"
                title="Log out"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2 pl-3 border-l border-slate-200 dark:border-slate-800">
              <Link
                to="/login"
                className="px-4 py-2 border border-slate-200 dark:border-slate-800 text-slate-850 dark:text-slate-200 text-xs font-bold rounded-lg hover:bg-slate-50 dark:hover:bg-slate-900 transition"
              >
                Log In
              </Link>
              <Link
                to="/register"
                className="px-4 py-2 bg-accent hover:bg-accent-hover text-white text-xs font-bold rounded-lg shadow-sm shadow-teal-500/10 transition"
              >
                Sign Up
              </Link>
            </div>
          )}

        </div>

      </div>
    </header>
  );
}
