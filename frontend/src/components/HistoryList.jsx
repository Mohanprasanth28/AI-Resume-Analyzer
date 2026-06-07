import React from 'react';
import { Eye, Download, Trash2, Calendar, FileText, BarChart2 } from 'lucide-react';
import toast from 'react-hot-toast';

export default function HistoryList({ historyItems = [], onViewDetail, onDownloadPDF, onDelete }) {
  
  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch (e) {
      return dateString;
    }
  };

  const getScoreBadgeColor = (score) => {
    if (score >= 80) return 'bg-teal-50 dark:bg-teal-950/30 text-teal-700 dark:text-teal-400 border-teal-200 dark:border-teal-900/40';
    if (score >= 60) return 'bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-900/40';
    return 'bg-rose-50 dark:bg-rose-950/30 text-rose-700 dark:text-rose-400 border-rose-200 dark:border-rose-900/40';
  };

  const handleDeleteClick = (id, event) => {
    event.stopPropagation(); // Avoid triggering card view clicks
    if (window.confirm('Are you sure you want to permanently delete this analysis record from your history?')) {
      onDelete(id);
    }
  };

  if (!historyItems || historyItems.length === 0) {
    return (
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-12 text-center shadow-sm">
        <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-600 rounded-full flex items-center justify-center mx-auto mb-4">
          <FileText className="w-8 h-8" />
        </div>
        <h3 className="font-semibold text-slate-800 dark:text-slate-200 text-lg mb-1">
          No history records yet
        </h3>
        <p className="text-sm text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
          Start by uploading your resume and job description on the analyzer dashboard!
        </p>
      </div>
    );
  }

  return (
    <div className="w-full space-y-4 animate-fade-in-up">
      
      {/* Desktop View (Table Layout) */}
      <div className="hidden md:block bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-950/40 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-wider">
                <th className="py-4 px-6">Resume Snippet</th>
                <th className="py-4 px-6">Date Analyzed</th>
                <th className="py-4 px-6 text-center">ATS Match</th>
                <th className="py-4 px-6 text-center">Keywords</th>
                <th className="py-4 px-6 text-center">Format</th>
                <th className="py-4 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-sm text-slate-700 dark:text-slate-300">
              {historyItems.map((item) => (
                <tr 
                  key={item.id} 
                  className="hover:bg-slate-50/50 dark:hover:bg-slate-950/20 transition-colors group cursor-pointer"
                  onClick={() => onViewDetail(item)}
                >
                  <td className="py-4.5 px-6 font-medium max-w-xs lg:max-w-sm truncate text-slate-800 dark:text-slate-200">
                    {item.resume_snippet}
                  </td>
                  <td className="py-4.5 px-6 whitespace-nowrap text-slate-450 dark:text-slate-500">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      {formatDate(item.timestamp)}
                    </div>
                  </td>
                  <td className="py-4.5 px-6 text-center whitespace-nowrap">
                    <span className={`inline-block px-2.5 py-1 text-xs font-bold border rounded-lg ${getScoreBadgeColor(item.ats_score)}`}>
                      {item.ats_score}%
                    </span>
                  </td>
                  <td className="py-4.5 px-6 text-center whitespace-nowrap">
                    <span className={`inline-block px-2.5 py-1 text-xs font-bold border rounded-lg ${getScoreBadgeColor(item.keyword_score)}`}>
                      {item.keyword_score}%
                    </span>
                  </td>
                  <td className="py-4.5 px-6 text-center whitespace-nowrap">
                    <span className={`inline-block px-2.5 py-1 text-xs font-bold border rounded-lg ${getScoreBadgeColor(item.format_score)}`}>
                      {item.format_score}%
                    </span>
                  </td>
                  <td className="py-4.5 px-6 text-right whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => onViewDetail(item)}
                        className="p-2 text-slate-400 hover:text-accent dark:hover:text-accent-light rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                        title="View Dashboard Breakdown"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => onDownloadPDF(item.id)}
                        className="p-2 text-slate-400 hover:text-accent dark:hover:text-accent-light rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                        title="Download PDF Report"
                      >
                        <Download className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={(e) => handleDeleteClick(item.id, e)}
                        className="p-2 text-slate-400 hover:text-red-600 dark:hover:text-red-400 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/20 transition"
                        title="Delete record"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile View (Card-Based Layout) */}
      <div className="md:hidden space-y-4">
        {historyItems.map((item) => (
          <div
            key={item.id}
            onClick={() => onViewDetail(item)}
            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-4 hover:border-slate-300 dark:hover:border-slate-700 transition cursor-pointer"
          >
            {/* Header info */}
            <div className="flex justify-between items-start">
              <span className="text-[10px] text-slate-400 flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                {formatDate(item.timestamp)}
              </span>
              <div className="flex gap-1.5" onClick={(e) => e.stopPropagation()}>
                <button
                  type="button"
                  onClick={() => onDownloadPDF(item.id)}
                  className="p-1.5 border border-slate-200 dark:border-slate-800 text-slate-500 rounded-lg bg-slate-50 dark:bg-slate-950"
                >
                  <Download className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={(e) => handleDeleteClick(item.id, e)}
                  className="p-1.5 border border-red-200 dark:border-red-950 text-red-500 rounded-lg bg-red-50 dark:bg-red-950/30"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Snippet */}
            <p className="text-sm font-semibold text-slate-850 dark:text-slate-250 line-clamp-2 leading-relaxed">
              {item.resume_snippet}
            </p>

            {/* Scores summary */}
            <div className="grid grid-cols-3 gap-2 border-t border-slate-100 dark:border-slate-800 pt-3">
              <div className="text-center">
                <div className="text-[10px] text-slate-400 font-semibold uppercase">ATS Fit</div>
                <div className={`mt-1 text-xs font-extrabold border rounded-md py-0.5 ${getScoreBadgeColor(item.ats_score)}`}>
                  {item.ats_score}%
                </div>
              </div>
              <div className="text-center">
                <div className="text-[10px] text-slate-400 font-semibold uppercase">Keyword</div>
                <div className={`mt-1 text-xs font-extrabold border rounded-md py-0.5 ${getScoreBadgeColor(item.keyword_score)}`}>
                  {item.keyword_score}%
                </div>
              </div>
              <div className="text-center">
                <div className="text-[10px] text-slate-400 font-semibold uppercase">Format</div>
                <div className={`mt-1 text-xs font-extrabold border rounded-md py-0.5 ${getScoreBadgeColor(item.format_score)}`}>
                  {item.format_score}%
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
