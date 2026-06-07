import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { FileSearch, Lock, User, AlertCircle, ArrowRight } from 'lucide-react';
import { loginUser, isAuthenticated } from '../api/analyzeApi';
import toast from 'react-hot-toast';

export default function Login() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Check if user is already authenticated
  useEffect(() => {
    if (isAuthenticated()) {
      navigate('/');
    }
    
    // Check if redirecting because session expired
    if (searchParams.get('expired')) {
      setError('Your session has expired. Please log in again.');
    }
  }, [navigate, searchParams]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!username.trim() || !password.trim()) {
      setError('Please fill in all fields.');
      return;
    }

    setLoading(true);
    try {
      await loginUser(username.trim(), password.trim());
      toast.success('Logged in successfully!');
      
      // Dispatch a dummy storage event so Navbar updates state
      window.dispatchEvent(new Event('storage'));
      
      navigate('/');
    } catch (err) {
      console.error(err);
      const msg = err.response?.data?.detail || 'Incorrect username or password. Please try again.';
      setError(msg);
      toast.error('Authentication failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 bg-slate-50 dark:bg-slate-950 transition-colors duration-200">
      <div className="sm:mx-auto sm:w-full sm:max-w-md animate-fade-in-up">
        {/* Brand Header */}
        <div className="flex flex-col items-center">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-teal-500 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-teal-500/10 mb-4">
            <FileSearch className="w-6 h-6" />
          </div>
          <h2 className="text-center text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Welcome back
          </h2>
          <p className="mt-2 text-center text-sm text-slate-500 dark:text-slate-400">
            Sign in to check your resumes and download ATS reports
          </p>
        </div>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md animate-fade-in-up" style={{ animationDelay: '100ms' }}>
        <div className="glass-panel border border-slate-200 dark:border-slate-800/60 rounded-3xl p-8 shadow-xl bg-white/70 dark:bg-slate-900/60">
          
          {/* Error Banner */}
          {error && (
            <div className="mb-5 p-3.5 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/35 rounded-xl flex items-start gap-2.5 text-red-600 dark:text-red-400">
              <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <span className="text-xs font-semibold leading-normal">{error}</span>
            </div>
          )}

          <form className="space-y-6" onSubmit={handleSubmit}>
            {/* Username */}
            <div>
              <label htmlFor="username" className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
                Username
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 dark:text-slate-600">
                  <User className="w-4 h-4" />
                </div>
                <input
                  id="username"
                  name="username"
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="block w-full pl-10 pr-4 py-3 border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-800 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-650 rounded-xl focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent text-sm transition"
                  placeholder="john_doe"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 dark:text-slate-600">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-10 pr-4 py-3 border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-800 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-650 rounded-xl focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent text-sm transition"
                  placeholder="••••••••"
                />
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 px-5 py-3 border border-transparent text-sm font-semibold rounded-xl text-white bg-accent hover:bg-accent-hover focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent shadow-md shadow-teal-500/10 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition duration-150 cursor-pointer"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <>
                  Log In
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Nav to Register */}
          <div className="mt-6 pt-5 border-t border-slate-200 dark:border-slate-800 text-center text-sm">
            <span className="text-slate-500 dark:text-slate-400">Don't have an account?</span>{' '}
            <Link to="/register" className="font-semibold text-accent hover:text-accent-hover transition">
              Create an account
            </Link>
          </div>

        </div>
      </div>
    </div>
  );
}
