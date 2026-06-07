import React from 'react';
import { Check, X, ShieldAlert, Sparkles, TrendingUp, HelpCircle } from 'lucide-react';

export default function CompareView({ compareData }) {
  if (!compareData) return null;

  const { resume_1, resume_2 } = compareData;

  const r1Name = resume_1.filename || 'Resume A';
  const r2Name = resume_2.filename || 'Resume B';

  // Helper component for comparative progress bars
  const ComparativeBar = ({ label, score1, score2 }) => {
    const isR1Winner = score1 > score2;
    const isR2Winner = score2 > score1;
    const isTie = score1 === score2;

    return (
      <div className="space-y-2.5 p-4 bg-slate-50 dark:bg-slate-950/20 border border-slate-100 dark:border-slate-800 rounded-xl">
        <div className="flex justify-between items-center text-sm font-semibold text-slate-700 dark:text-slate-300">
          <span>{label}</span>
          <div className="flex gap-4">
            <span className={isR1Winner ? 'text-teal-500 font-bold' : 'text-slate-400 font-normal'}>
              {r1Name}: {score1}%
            </span>
            <span className={isR2Winner ? 'text-teal-500 font-bold' : 'text-slate-400 font-normal'}>
              {r2Name}: {score2}%
            </span>
          </div>
        </div>

        {/* Double-layered comparison progress bars */}
        <div className="space-y-1.5">
          {/* Resume 1 */}
          <div className="flex items-center gap-2">
            <span className="w-20 text-[10px] text-slate-400 truncate text-right">{r1Name}</span>
            <div className="flex-1 h-2 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
              <div 
                className={`h-full rounded-full transition-all duration-1000 ${
                  isR1Winner ? 'bg-teal-500' : isTie ? 'bg-slate-400' : 'bg-slate-400 dark:bg-slate-600'
                }`}
                style={{ width: `${score1}%` }}
              ></div>
            </div>
          </div>

          {/* Resume 2 */}
          <div className="flex items-center gap-2">
            <span className="w-20 text-[10px] text-slate-400 truncate text-right">{r2Name}</span>
            <div className="flex-1 h-2 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
              <div 
                className={`h-full rounded-full transition-all duration-1000 ${
                  isR2Winner ? 'bg-teal-500' : isTie ? 'bg-slate-400' : 'bg-slate-400 dark:bg-slate-600'
                }`}
                style={{ width: `${score2}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="w-full space-y-8 animate-fade-in-up">
      {/* 1. Comparison Summary Card */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
        <div className="flex items-center gap-2 mb-6 pb-3 border-b border-slate-100 dark:border-slate-800">
          <TrendingUp className="w-5 h-5 text-accent" />
          <h3 className="font-semibold text-slate-800 dark:text-slate-200">
            Side-by-Side ATS Comparison
          </h3>
        </div>

        <div className="space-y-4">
          <ComparativeBar 
            label="Overall ATS Fit" 
            score1={resume_1.scores.ats_score} 
            score2={resume_2.scores.ats_score} 
          />
          <ComparativeBar 
            label="Keyword Density" 
            score1={resume_1.scores.keyword_score} 
            score2={resume_2.scores.keyword_score} 
          />
          <ComparativeBar 
            label="Format Quality" 
            score1={resume_1.scores.format_score} 
            score2={resume_2.scores.format_score} 
          />
        </div>
      </div>

      {/* 2. Side-by-Side Details Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Resume 1 Column */}
        <div className="space-y-6">
          <div className="p-4 bg-teal-500/10 border border-teal-200 dark:border-teal-900/40 rounded-2xl">
            <h4 className="font-extrabold text-teal-800 dark:text-teal-300 text-lg text-center truncate">
              {r1Name}
            </h4>
            <p className="text-center text-xs text-teal-600 dark:text-teal-400 font-bold mt-1">
              ATS Match: {resume_1.scores.ats_score}/100
            </p>
          </div>

          {/* Keywords */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 space-y-4">
            <h5 className="font-bold text-slate-800 dark:text-slate-200 text-sm border-b pb-2 border-slate-100 dark:border-slate-800">Keywords matched</h5>
            <div className="flex flex-wrap gap-1.5">
              {resume_1.analysis.present_keywords.map((kw, i) => (
                <span key={i} className="text-[10px] px-2 py-1 bg-emerald-50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-400 rounded-md font-medium">
                  {kw}
                </span>
              ))}
            </div>
            
            <h5 className="font-bold text-slate-800 dark:text-slate-200 text-sm border-b pb-2 border-slate-100 dark:border-slate-800">Keywords missing</h5>
            <div className="flex flex-wrap gap-1.5">
              {resume_1.analysis.missing_keywords.map((kw, i) => (
                <span key={i} className="text-[10px] px-2 py-1 bg-rose-50 dark:bg-rose-950/20 text-rose-700 dark:text-rose-400 rounded-md font-medium">
                  {kw}
                </span>
              ))}
            </div>
          </div>

          {/* Suggestions */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 space-y-3">
            <h5 className="font-bold text-slate-800 dark:text-slate-200 text-sm border-b pb-2 border-slate-100 dark:border-slate-800">Action Plan</h5>
            {resume_1.analysis.top_suggestions.slice(0, 3).map((sug, i) => (
              <div key={i} className="flex gap-2 text-xs text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-950/20 p-2 border border-slate-100 dark:border-slate-800/60 rounded-lg">
                <span className="font-bold text-accent">{i+1}.</span>
                <span>{sug}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Resume 2 Column */}
        <div className="space-y-6">
          <div className="p-4 bg-indigo-500/10 border border-indigo-200 dark:border-indigo-900/40 rounded-2xl">
            <h4 className="font-extrabold text-indigo-800 dark:text-indigo-300 text-lg text-center truncate">
              {r2Name}
            </h4>
            <p className="text-center text-xs text-indigo-600 dark:text-indigo-400 font-bold mt-1">
              ATS Match: {resume_2.scores.ats_score}/100
            </p>
          </div>

          {/* Keywords */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 space-y-4">
            <h5 className="font-bold text-slate-800 dark:text-slate-200 text-sm border-b pb-2 border-slate-100 dark:border-slate-800">Keywords matched</h5>
            <div className="flex flex-wrap gap-1.5">
              {resume_2.analysis.present_keywords.map((kw, i) => (
                <span key={i} className="text-[10px] px-2 py-1 bg-emerald-50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-400 rounded-md font-medium">
                  {kw}
                </span>
              ))}
            </div>
            
            <h5 className="font-bold text-slate-800 dark:text-slate-200 text-sm border-b pb-2 border-slate-100 dark:border-slate-800">Keywords missing</h5>
            <div className="flex flex-wrap gap-1.5">
              {resume_2.analysis.missing_keywords.map((kw, i) => (
                <span key={i} className="text-[10px] px-2 py-1 bg-rose-50 dark:bg-rose-950/20 text-rose-700 dark:text-rose-400 rounded-md font-medium">
                  {kw}
                </span>
              ))}
            </div>
          </div>

          {/* Suggestions */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 space-y-3">
            <h5 className="font-bold text-slate-800 dark:text-slate-200 text-sm border-b pb-2 border-slate-100 dark:border-slate-800">Action Plan</h5>
            {resume_2.analysis.top_suggestions.slice(0, 3).map((sug, i) => (
              <div key={i} className="flex gap-2 text-xs text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-950/20 p-2 border border-slate-100 dark:border-slate-800/60 rounded-lg">
                <span className="font-bold text-accent">{i+1}.</span>
                <span>{sug}</span>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* 3. Summary Winner Advice */}
      <div className="p-4 bg-teal-50 dark:bg-teal-950/20 border border-teal-200 dark:border-teal-900/30 rounded-2xl flex gap-3 text-slate-700 dark:text-slate-300">
        <Sparkles className="w-5 h-5 text-teal-500 mt-0.5 flex-shrink-0 animate-bounce" />
        <div>
          <h5 className="font-bold text-slate-800 dark:text-slate-200 text-sm">Comparison Recommendation</h5>
          <p className="text-xs mt-1 leading-relaxed">
            {resume_1.scores.ats_score > resume_2.scores.ats_score ? (
              <span>Your profile <b>{r1Name}</b> displays a superior match of <b>{resume_1.scores.ats_score}%</b> against this job description. It contains stronger verb constructions and tighter keyword alignments than {r2Name}. Propose using {r1Name} for applications.</span>
            ) : resume_2.scores.ats_score > resume_1.scores.ats_score ? (
              <span>Your profile <b>{r2Name}</b> displays a superior match of <b>{resume_2.scores.ats_score}%</b> against this job description. It contains stronger verb constructions and tighter keyword alignments than {r1Name}. Propose using {r2Name} for applications.</span>
            ) : (
              <span>Both resumes exhibit equal ATS matches of <b>{resume_1.scores.ats_score}%</b>. Examine the suggestions and missing keywords sections of both profiles to push either option to an outstanding score!</span>
            )}
          </p>
        </div>
      </div>
    </div>
  );
}
