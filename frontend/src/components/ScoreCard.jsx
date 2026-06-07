import React, { useEffect, useState } from 'react';
import { Award, CheckCircle, FileCheck } from 'lucide-react';

// Single Circle Progress Widget
const CircularProgress = ({ score, label, icon: Icon, delay }) => {
  const [offset, setOffset] = useState(251.2); // Initial offset represents 0%
  
  const radius = 40;
  const circumference = 2 * Math.PI * radius; // 251.2

  useEffect(() => {
    // Animate fill-in progress with a delayed transition
    const timer = setTimeout(() => {
      const progressOffset = circumference - (score / 100) * circumference;
      setOffset(progressOffset);
    }, delay);
    
    return () => clearTimeout(timer);
  }, [score, circumference, delay]);

  // Color mappings based on value thresholds
  const getColors = (val) => {
    if (val >= 80) return {
      stroke: 'stroke-teal-500',
      text: 'text-teal-600 dark:text-teal-400',
      bg: 'bg-teal-50 dark:bg-teal-950/20',
      border: 'border-teal-200 dark:border-teal-900/40'
    };
    if (val >= 60) return {
      stroke: 'stroke-amber-500',
      text: 'text-amber-600 dark:text-amber-400',
      bg: 'bg-amber-50 dark:bg-amber-950/20',
      border: 'border-amber-200 dark:border-amber-900/40'
    };
    return {
      stroke: 'stroke-rose-500',
      text: 'text-rose-600 dark:text-rose-400',
      bg: 'bg-rose-50 dark:bg-rose-950/20',
      border: 'border-rose-200 dark:border-rose-900/40'
    };
  };

  const scheme = getColors(score);

  return (
    <div className={`glass-panel border rounded-2xl p-5 flex flex-col items-center justify-center text-center shadow-sm glass-card-hover ${scheme.border} ${scheme.bg}`}>
      {/* Icon Badge */}
      <div className={`p-2.5 rounded-xl mb-4 ${scheme.text} bg-white dark:bg-slate-900 shadow-sm`}>
        <Icon className="w-5 h-5" />
      </div>
      
      {/* SVG Circle Progress bar */}
      <div className="relative w-28 h-28 flex items-center justify-center mb-3">
        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
          {/* Background circle */}
          <circle
            cx="50"
            cy="50"
            r={radius}
            className="stroke-slate-200 dark:stroke-slate-800 fill-none"
            strokeWidth="8"
          />
          {/* Active progress circle */}
          <circle
            cx="50"
            cy="50"
            r={radius}
            className={`${scheme.stroke} fill-none transition-all duration-1000 ease-out`}
            strokeWidth="8"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
          />
        </svg>
        {/* Score text overlay */}
        <div className="absolute flex flex-col items-center">
          <span className="text-2xl font-extrabold text-slate-800 dark:text-slate-100 font-sans tracking-tight">
            {score}
          </span>
          <span className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500">
            Percent
          </span>
        </div>
      </div>
      
      <h3 className="font-semibold text-slate-800 dark:text-slate-200 text-sm tracking-wide uppercase">
        {label}
      </h3>
    </div>
  );
};

export default function ScoreCard({ atsScore, keywordScore, formatScore }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full animate-fade-in-up">
      <CircularProgress 
        score={atsScore || 0} 
        label="ATS Match Rating" 
        icon={Award} 
        delay={100} 
      />
      <CircularProgress 
        score={keywordScore || 0} 
        label="Keyword Match" 
        icon={CheckCircle} 
        delay={300} 
      />
      <CircularProgress 
        score={formatScore || 0} 
        label="Format Quality" 
        icon={FileCheck} 
        delay={500} 
      />
    </div>
  );
}
