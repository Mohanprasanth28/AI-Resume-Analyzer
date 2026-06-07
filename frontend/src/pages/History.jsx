import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { History as HistoryIcon, RefreshCw, AlertCircle, FileSearch } from 'lucide-react';
import toast from 'react-hot-toast';

import { getHistory, deleteHistory, downloadPDFReport, isAuthenticated } from '../api/analyzeApi';
import HistoryList from '../components/HistoryList';

export default function History() {
  const navigate = useNavigate();

  const [historyItems, setHistoryItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Route protection: check authentication
  useEffect(() => {
    if (!isAuthenticated()) {
      navigate('/login');
      return;
    }
    fetchHistoryRecords();
  }, [navigate]);

  const fetchHistoryRecords = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await getHistory();
      setHistoryItems(data);
    } catch (err) {
      console.error(err);
      const msg = err.response?.data?.detail || 'Failed to retrieve analysis history. Please check connection and try again.';
      setError(msg);
      toast.error('Could not load history.');
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetail = (item) => {
    // Navigate user back to the Home page dashboard, passing this item inside navigation state.
    // Home.jsx will catch this in a useEffect and display details.
    navigate('/', { state: { historyItem: item } });
  };

  const handleDownloadPDF = async (id) => {
    toast.promise(
      downloadPDFReport(id),
      {
        loading: 'Compiling PDF report...',
        success: 'Report downloaded successfully!',
        error: 'Failed to generate PDF.'
      }
    );
  };

  const handleDeleteRecord = async (id) => {
    try {
      await deleteHistory(id);
      toast.success('Analysis record deleted.');
      // Update local state list
      setHistoryItems(prev => prev.filter(item => item.id !== id));
    } catch (err) {
      console.error(err);
      toast.error('Failed to delete history item.');
    }
  };

  return (
    <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 transition-colors duration-200">
      <div className="space-y-6">
        
        {/* Title Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center justify-center shadow-sm">
              <HistoryIcon className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                Analysis History Log
              </h1>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                Review previous resume evaluations and download PDF reports.
              </p>
            </div>
          </div>
          
          <button
            type="button"
            onClick={fetchHistoryRecords}
            disabled={loading}
            className="p-2 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition disabled:opacity-50"
            title="Refresh records"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>

        {/* Content Box */}
        {loading ? (
          // Skeleton Loaders
          <div className="space-y-4">
            {[1, 2, 3].map((n) => (
              <div key={n} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-4 animate-pulse">
                <div className="flex justify-between">
                  <div className="w-24 bg-slate-200 dark:bg-slate-800 h-3.5 rounded"></div>
                  <div className="w-16 bg-slate-200 dark:bg-slate-800 h-3.5 rounded"></div>
                </div>
                <div className="w-2/3 bg-slate-200 dark:bg-slate-800 h-4 rounded"></div>
                <div className="grid grid-cols-3 gap-4 border-t border-slate-100 dark:border-slate-800 pt-3">
                  <div className="bg-slate-200 dark:bg-slate-800 h-8 rounded-lg"></div>
                  <div className="bg-slate-200 dark:bg-slate-800 h-8 rounded-lg"></div>
                  <div className="bg-slate-200 dark:bg-slate-800 h-8 rounded-lg"></div>
                </div>
              </div>
            ))}
          </div>
        ) : error ? (
          // Error Box
          <div className="p-4 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/40 rounded-2xl flex items-start gap-2.5 text-red-650 dark:text-red-400">
            <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-semibold text-sm">Error Loading Records</h4>
              <p className="text-xs leading-normal mt-1">{error}</p>
            </div>
          </div>
        ) : (
          // History Lists
          <HistoryList
            historyItems={historyItems}
            onViewDetail={handleViewDetail}
            onDownloadPDF={handleDownloadPDF}
            onDelete={handleDeleteRecord}
          />
        )}

      </div>
    </main>
  );
}
