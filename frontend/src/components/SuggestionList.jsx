import React, { useState } from 'react';
import { Lightbulb, Copy, Check, ArrowRight, CornerDownRight, AlertTriangle } from 'lucide-react';
import toast from 'react-hot-toast';

export default function SuggestionList({ topSuggestions = [], weakBullets = [] }) {
  const [copiedIndex, setCopiedIndex] = useState(null);

  const handleCopy = (text, index) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    toast.success('Optimized bullet copied to clipboard!');
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return (
    <div className="w-full space-y-6 animate-fade-in-up">
      {/* Section 1: Bullet Point Optimization */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
        <div className="flex items-center gap-2 mb-5 pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="w-8 h-8 rounded-lg bg-indigo-100 dark:bg-indigo-950/30 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
            <AlertTriangle className="w-4 h-4" />
          </div>
          <h3 className="font-semibold text-slate-800 dark:text-slate-200">
            Bullet Point Optimizations
          </h3>
        </div>

        {weakBullets && weakBullets.length > 0 ? (
          <div className="space-y-6">
            {weakBullets.map((bullet, index) => (
              <div 
                key={index} 
                className="grid grid-cols-1 lg:grid-cols-2 gap-4 border border-slate-150 dark:border-slate-800 rounded-xl overflow-hidden shadow-sm"
              >
                {/* Original Weak Bullet */}
                <div className="p-4 bg-red-50/40 dark:bg-red-950/10 border-b lg:border-b-0 lg:border-r border-slate-150 dark:border-slate-800">
                  <div className="flex items-center gap-1.5 text-red-600 dark:text-red-400 text-xs font-bold uppercase tracking-wider mb-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>
                    Original Statement
                  </div>
                  <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed italic">
                    "{bullet.original}"
                  </p>
                </div>

                {/* Rewritten Optimized Bullet */}
                <div className="p-4 bg-teal-50/20 dark:bg-teal-950/10 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-1.5 text-teal-600 dark:text-teal-400 text-xs font-bold uppercase tracking-wider">
                        <span className="w-1.5 h-1.5 rounded-full bg-teal-500 animate-pulse"></span>
                        ATS Optimized Statement
                      </div>
                      <button
                        type="button"
                        onClick={() => handleCopy(bullet.rewritten, index)}
                        className="p-1 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:shadow-sm transition"
                        title="Copy rewrite"
                      >
                        {copiedIndex === index ? (
                          <Check className="w-3.5 h-3.5 text-teal-500" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>
                    <p className="text-sm text-slate-800 dark:text-slate-200 leading-relaxed font-semibold">
                      "{bullet.rewritten}"
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-6 text-slate-400 dark:text-slate-600 text-sm">
            No weak bullet points detected. The resume contains high-impact action-oriented sentences.
          </div>
        )}
      </div>

      {/* Section 2: Top Action Plan / Suggestions */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
        <div className="flex items-center gap-2 mb-5 pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="w-8 h-8 rounded-lg bg-amber-100 dark:bg-amber-950/30 text-amber-600 dark:text-amber-400 flex items-center justify-center">
            <Lightbulb className="w-4 h-4" />
          </div>
          <h3 className="font-semibold text-slate-800 dark:text-slate-200">
            Top 5 ATS Optimization Steps
          </h3>
        </div>

        {topSuggestions && topSuggestions.length > 0 ? (
          <ul className="space-y-4">
            {topSuggestions.map((suggestion, index) => (
              <li 
                key={index}
                className="flex items-start gap-3 p-3 bg-slate-50 dark:bg-slate-950/20 border border-slate-100 dark:border-slate-800 rounded-xl"
              >
                <div className="w-6 h-6 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs flex items-center justify-center flex-shrink-0 mt-0.5">
                  {index + 1}
                </div>
                <div className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                  {suggestion}
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <div className="text-center py-6 text-slate-400 dark:text-slate-600 text-sm">
            No suggestions available.
          </div>
        )}
      </div>
    </div>
  );
}
