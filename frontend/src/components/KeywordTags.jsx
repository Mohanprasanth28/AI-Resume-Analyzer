import React from 'react';
import { Check, Plus, AlertCircle, Sparkles } from 'lucide-react';

export default function KeywordTags({ presentKeywords = [], missingKeywords = [] }) {
  const presentCount = presentKeywords?.length || 0;
  const missingCount = missingKeywords?.length || 0;

  return (
    <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-6 animate-fade-in-up">
      {/* 1. Matched Keywords (Green Badge Area) */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-teal-100 dark:bg-teal-950/30 text-teal-600 dark:text-teal-400 flex items-center justify-center">
              <Check className="w-4 h-4" />
            </div>
            <h3 className="font-semibold text-slate-800 dark:text-slate-200">
              Matched Keywords
            </h3>
          </div>
          <span className="px-2.5 py-1 text-xs font-bold bg-teal-100 dark:bg-teal-950 text-teal-700 dark:text-teal-400 rounded-full">
            {presentCount} matched
          </span>
        </div>

        {presentCount > 0 ? (
          <div className="flex flex-wrap gap-2">
            {presentKeywords.map((keyword, index) => (
              <span
                key={index}
                className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900/30 rounded-lg hover:scale-105 transition-all duration-200"
              >
                <Check className="w-3 h-3" />
                {keyword}
              </span>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-slate-400 dark:text-slate-600 text-sm">
            No matching keywords identified. Try updating your skills section.
          </div>
        )}
      </div>

      {/* 2. Missing Keywords (Red Badge Area) */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-rose-100 dark:bg-rose-950/30 text-rose-600 dark:text-rose-400 flex items-center justify-center">
              <AlertCircle className="w-4 h-4" />
            </div>
            <h3 className="font-semibold text-slate-800 dark:text-slate-200">
              Missing Critical Keywords
            </h3>
          </div>
          <span className="px-2.5 py-1 text-xs font-bold bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-400 rounded-full">
            {missingCount} missing
          </span>
        </div>

        {missingCount > 0 ? (
          <div className="space-y-4">
            <div className="flex flex-wrap gap-2">
              {missingKeywords.map((keyword, index) => (
                <span
                  key={index}
                  className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold bg-rose-50 dark:bg-rose-950/20 text-rose-700 dark:text-rose-400 border border-rose-100 dark:border-rose-900/30 rounded-lg hover:scale-105 transition-all duration-200"
                >
                  <Plus className="w-3 h-3 rotate-45" />
                  {keyword}
                </span>
              ))}
            </div>
            <div className="p-3 bg-amber-50 dark:bg-amber-950/20 border border-amber-100 dark:border-amber-900/20 rounded-xl flex items-start gap-2 text-amber-800 dark:text-amber-300">
              <Sparkles className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" />
              <p className="text-[11px] leading-relaxed">
                <b>Career Advisor Tip:</b> Incorporate these missing keywords naturally into your Work Experience and Skills sections to bypass automated ATS filters.
              </p>
            </div>
          </div>
        ) : (
          <div className="text-center py-8 text-emerald-500 dark:text-emerald-400 text-sm font-medium flex items-center justify-center gap-1.5">
            <Check className="w-4 h-4" /> All critical keywords are present in your resume!
          </div>
        )}
      </div>
    </div>
  );
}
