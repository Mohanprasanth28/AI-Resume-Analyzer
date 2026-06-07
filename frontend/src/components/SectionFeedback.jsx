import React, { useState } from 'react';
import { ChevronDown, FileText, Briefcase, Wrench, GraduationCap } from 'lucide-react';

const AccordionItem = ({ title, icon: Icon, content, isOpen, onToggle }) => {
  return (
    <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden bg-white dark:bg-slate-900 shadow-sm transition-all duration-300">
      {/* Header button */}
      <button
        type="button"
        onClick={onToggle}
        className="w-full px-5 py-4 flex items-center justify-between text-left font-medium text-slate-800 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-950/40 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 flex items-center justify-center">
            <Icon className="w-4.5 h-4.5" />
          </div>
          <span className="font-semibold text-sm tracking-wide uppercase">{title} Section</span>
        </div>
        <ChevronDown 
          className={`w-5 h-5 text-slate-400 dark:text-slate-600 transition-transform duration-300 ${
            isOpen ? 'rotate-180' : ''
          }`} 
        />
      </button>

      {/* Expandable Body */}
      <div 
        className={`transition-all duration-300 ease-in-out overflow-hidden ${
          isOpen ? 'max-h-96 opacity-100 border-t border-slate-100 dark:border-slate-800' : 'max-h-0 opacity-0'
        }`}
      >
        <div className="p-5 text-sm text-slate-600 dark:text-slate-300 leading-relaxed bg-slate-50/50 dark:bg-slate-950/10">
          {content || "No feedback available for this section."}
        </div>
      </div>
    </div>
  );
};

export default function SectionFeedback({ feedback = {} }) {
  const [openSections, setOpenSections] = useState({
    summary: true, // Open summary by default
    experience: false,
    skills: false,
    education: false
  });

  const toggleSection = (section) => {
    setOpenSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  return (
    <div className="w-full space-y-4 animate-fade-in-up">
      <AccordionItem
        title="Professional Summary"
        icon={FileText}
        content={feedback?.summary}
        isOpen={openSections.summary}
        onToggle={() => toggleSection('summary')}
      />
      <AccordionItem
        title="Work Experience"
        icon={Briefcase}
        content={feedback?.experience}
        isOpen={openSections.experience}
        onToggle={() => toggleSection('experience')}
      />
      <AccordionItem
        title="Skills & Expertise"
        icon={Wrench}
        content={feedback?.skills}
        isOpen={openSections.skills}
        onToggle={() => toggleSection('skills')}
      />
      <AccordionItem
        title="Education & Credentials"
        icon={GraduationCap}
        content={feedback?.education}
        isOpen={openSections.education}
        onToggle={() => toggleSection('education')}
      />
    </div>
  );
}
