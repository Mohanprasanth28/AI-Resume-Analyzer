import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Play, Sparkles, FileSpreadsheet, Download, AlertTriangle, Info, ArrowLeft, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';

import { analyzeResume, compareResumes, downloadPDFReport, isAuthenticated } from '../api/analyzeApi';
import UploadBox from '../components/UploadBox';
import ScoreCard from '../components/ScoreCard';
import KeywordTags from '../components/KeywordTags';
import SuggestionList from '../components/SuggestionList';
import SectionFeedback from '../components/SectionFeedback';
import CompareView from '../components/CompareView';

export default function Home() {
  const navigate = useNavigate();
  const location = useLocation();

  // Route protection
  useEffect(() => {
    if (!isAuthenticated()) {
      navigate('/login');
    }
  }, [navigate]);

  // Tab State: 'analyze' or 'compare'
  const [activeTab, setActiveTab] = useState('analyze');

  // Input states (Single Analyze)
  const [singleFile, setSingleFile] = useState(null);
  const [singleText, setSingleText] = useState('');
  const [jobDescription, setJobDescription] = useState('');

  // Input states (Compare Mode)
  const [compareFile1, setCompareFile1] = useState(null);
  const [compareText1, setCompareText1] = useState('');
  const [compareFile2, setCompareFile2] = useState(null);
  const [compareText2, setCompareText2] = useState('');

  // Loading & Progress Messages States
  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const steps = [
    'Extracting clean text structure from PDF...',
    'Analyzing requirements in job description...',
    'Consulting Claude Sonnet evaluator...',
    'Calculating keyword density match ratings...',
    'Rewriting weak bullet points with action statements...',
    'Formatting ATS blueprint report...'
  ];

  // Output states
  const [analysisResult, setAnalysisResult] = useState(null);
  const [compareResult, setCompareResult] = useState(null);
  const [lastSavedId, setLastSavedId] = useState(null);
  
  // Custom View State: If viewing a historical record from /history redirect
  const [viewingHistory, setViewingHistory] = useState(false);

  // Cycle loader messages
  useEffect(() => {
    let interval;
    if (loading) {
      interval = setInterval(() => {
        setLoadingStep((prev) => (prev + 1) % steps.length);
      }, 3000);
    } else {
      setLoadingStep(0);
    }
    return () => clearInterval(interval);
  }, [loading]);

  // Check if history page passed a result state to inspect
  useEffect(() => {
    if (location.state && location.state.historyItem) {
      const item = location.state.historyItem;
      setAnalysisResult(item.full_response);
      setLastSavedId(item.id);
      setViewingHistory(true);
      setActiveTab('analyze');
      
      // Clean up location state so reload doesn't lock it
      window.history.replaceState({}, document.title);
    }
  }, [location]);

  const handleSingleAnalyze = async (e) => {
    e.preventDefault();
    
    if (!singleFile && !singleText.trim()) {
      toast.error('Please upload a PDF resume or paste resume text.');
      return;
    }

    if (!jobDescription.trim()) {
      toast.error('Please enter the target job description.');
      return;
    }

    if (jobDescription.trim().length < 50) {
      toast.error('Please paste a descriptive job description (min 50 characters).');
      return;
    }

    setLoading(true);
    setAnalysisResult(null);
    setCompareResult(null);
    setViewingHistory(false);
    
    try {
      const data = await analyzeResume(singleFile, singleText, jobDescription);
      setAnalysisResult(data);
      
      // Re-fetch latest history ID by hitting history endpoint
      // We can also get history items to identify the ID of this analysis (most recent)
      // For simplicity, we get details or fetch history to allow PDF printing
      toast.success('Resume analysis complete!');
    } catch (err) {
      console.error(err);
      const msg = err.response?.data?.detail || 'An error occurred during resume analysis. Please try again.';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleCompareAnalyze = async (e) => {
    e.preventDefault();

    const resume1Provided = compareFile1 || compareText1.trim();
    const resume2Provided = compareFile2 || compareText2.trim();

    if (!resume1Provided || !resume2Provided) {
      toast.error('Please supply both Resume 1 and Resume 2 details.');
      return;
    }

    if (!jobDescription.trim()) {
      toast.error('Please provide a job description for comparison.');
      return;
    }

    setLoading(true);
    setAnalysisResult(null);
    setCompareResult(null);
    setViewingHistory(false);

    try {
      const data = await compareResumes(
        compareFile1, compareText1,
        compareFile2, compareText2,
        jobDescription
      );
      setCompareResult(data);
      toast.success('Resume comparison complete!');
    } catch (err) {
      console.error(err);
      const msg = err.response?.data?.detail || 'Failed to compare resumes. Please check inputs and retry.';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  // Find analysis ID to download pdf report
  // If we just ran /analyze, we don't have the new DB ID immediately in the return JSON (only in DB).
  // So we fetch the most recent history record to retrieve the ID!
  const handleDownloadPDF = async () => {
    if (lastSavedId) {
      toast.promise(
        downloadPDFReport(lastSavedId),
        {
          loading: 'Generating PDF report...',
          success: 'Report downloaded successfully!',
          error: 'Failed to download report.'
        }
      );
      return;
    }

    // If ID is not saved, grab the latest item from history
    try {
      const axios = (await import('axios')).default;
      const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
      const token = localStorage.getItem('token');
      
      const res = await axios.get(`${API_BASE_URL}/history`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (res.data && res.data.length > 0) {
        const latestId = res.data[0].id; // Most recent item
        setLastSavedId(latestId);
        
        toast.promise(
          downloadPDFReport(latestId),
          {
            loading: 'Compiling ReportLab PDF document...',
            success: 'Report downloaded successfully!',
            error: 'Failed to download report.'
          }
        );
      } else {
        toast.error('Could not locate history record to generate PDF.');
      }
    } catch (e) {
      console.error(e);
      toast.error('Failed to resolve analysis record.');
    }
  };

  const handleBackToNewAnalysis = () => {
    setAnalysisResult(null);
    setCompareResult(null);
    setViewingHistory(false);
    setLastSavedId(null);
  };

  return (
    <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 transition-colors duration-200">
      
      {/* Loading Overlay */}
      {loading && (
        <div className="fixed inset-0 z-50 bg-slate-900/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 max-w-md w-full text-center shadow-2xl flex flex-col items-center">
            <RefreshCw className="w-10 h-10 text-teal-500 animate-spin mb-4" />
            <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200 mb-2">
              Analyzing Profile Match Rates
            </h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 font-semibold mb-6 animate-pulse text-center min-h-[40px]">
              {steps[loadingStep]}
            </p>
            <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-teal-400 to-indigo-500 rounded-full transition-all duration-500"
                style={{ width: `${((loadingStep + 1) / steps.length) * 100}%` }}
              ></div>
            </div>
          </div>
        </div>
      )}

      {/* Main Container */}
      <div className="space-y-8">
        
        {/* Title and Top Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              {viewingHistory ? 'Saved Analysis Report' : 'ATS Optimization Dashboard'}
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-450 mt-1">
              {viewingHistory 
                ? 'Inspecting cached historical evaluations. You can re-download reports.'
                : 'Evaluate resume compatibility scores and get keyword improvements.'}
            </p>
          </div>
          
          {viewingHistory && (
            <button
              type="button"
              onClick={handleBackToNewAnalysis}
              className="flex items-center gap-2 px-4 py-2 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 text-sm font-semibold rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" /> New Analysis
            </button>
          )}
        </div>

        {/* ONLY Render Inputs if Results are NOT present */}
        {!analysisResult && !compareResult && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* Left Column: Upload widgets */}
            <div className="lg:col-span-7 space-y-6">
              
              {/* Tab Selector */}
              <div className="flex bg-slate-100/80 dark:bg-slate-900/60 p-1.5 rounded-2xl border border-slate-200/50 dark:border-slate-800/40">
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('analyze');
                    setCompareResult(null);
                  }}
                  className={`flex-1 py-2.5 px-4 text-xs font-bold rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer ${
                    activeTab === 'analyze'
                      ? 'bg-white dark:bg-slate-800 text-slate-800 dark:text-white shadow-sm'
                      : 'text-slate-500 dark:text-slate-450 hover:text-slate-700 dark:hover:text-slate-200'
                  }`}
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  Analyze Resume
                </button>
                {/* <button
                  type="button"
                  onClick={() => {
                    setActiveTab('compare');
                    setAnalysisResult(null);
                  }}
                  className={`flex-1 py-2.5 px-4 text-xs font-bold rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer ${
                    activeTab === 'compare'
                      ? 'bg-white dark:bg-slate-800 text-slate-800 dark:text-white shadow-sm'
                      : 'text-slate-500 dark:text-slate-450 hover:text-slate-700 dark:hover:text-slate-200'
                  }`}
                >
                  <FileSpreadsheet className="w-3.5 h-3.5" />
                  Compare Mode (Dual Resumes)
                </button> */}
              </div>

              {activeTab === 'analyze' ? (
                // Tab A: Single Analyze Upload
                <UploadBox
                  onFileSelect={setSingleFile}
                  onTextChange={setSingleText}
                  file={singleFile}
                  text={singleText}
                  onClear={() => {
                    setSingleFile(null);
                    setSingleText('');
                  }}
                  label="Upload Candidate Resume"
                />
              ) : (
                // Tab B: Compare Mode Uploads
                <div className="space-y-4">
                  <div className="p-4 bg-teal-500/5 dark:bg-teal-950/10 border border-teal-200/50 dark:border-teal-900/30 rounded-2xl">
                    <h3 className="text-xs font-bold text-teal-600 dark:text-teal-400 uppercase tracking-wider mb-3">
                      Profile 1: Primary Resume
                    </h3>
                    <UploadBox
                      onFileSelect={setCompareFile1}
                      onTextChange={setCompareText1}
                      file={compareFile1}
                      text={compareText1}
                      onClear={() => {
                        setCompareFile1(null);
                        setCompareText1('');
                      }}
                      label="Upload Primary PDF"
                    />
                  </div>

                  <div className="p-4 bg-indigo-500/5 dark:bg-indigo-950/10 border border-indigo-200/50 dark:border-indigo-900/30 rounded-2xl">
                    <h3 className="text-xs font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider mb-3">
                      Profile 2: Comparative Resume
                    </h3>
                    <UploadBox
                      onFileSelect={setCompareFile2}
                      onTextChange={setCompareText2}
                      file={compareFile2}
                      text={compareText2}
                      onClear={() => {
                        setCompareFile2(null);
                        setCompareText2('');
                      }}
                      label="Upload Comparative PDF"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Right Column: Job Description Area */}
            <div className="lg:col-span-5 flex flex-col">
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm flex flex-col flex-1">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
                  Target Job Description
                </label>
                
                <textarea
                  value={jobDescription}
                  onChange={(e) => setJobDescription(e.target.value)}
                  placeholder="Paste the full job description details (responsibilities, skills, requirements) here..."
                  className="flex-1 w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-800 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent text-sm resize-none min-h-[200px]"
                />
                
                <div className="flex justify-between items-center text-xs text-slate-400 mt-2">
                  <span>Characters: {jobDescription.length} / 20,000</span>
                  {jobDescription.length > 0 && jobDescription.length < 50 && (
                    <span className="text-red-500 font-semibold flex items-center gap-0.5">
                      <Info className="w-3.5 h-3.5" /> Minimum 50 chars required
                    </span>
                  )}
                </div>

                {/* Big Analyze Button */}
                <button
                  type="button"
                  onClick={activeTab === 'analyze' ? handleSingleAnalyze : handleCompareAnalyze}
                  className="mt-6 w-full py-3.5 px-5 bg-gradient-to-r from-teal-500 to-indigo-600 hover:from-teal-650 hover:to-indigo-750 text-white font-semibold rounded-xl flex items-center justify-center gap-2 hover:shadow-lg shadow-md transition duration-200 cursor-pointer"
                >
                  <Play className="w-4 h-4" />
                  {activeTab === 'analyze' ? 'Run Resume Optimization Audit' : 'Compare Candidate Resumes'}
                </button>
              </div>
            </div>

          </div>
        )}

        {/* RENDER OUTPUTS IF RUN COMPLETED */}
        
        {/* Case A: Single Analysis Result */}
        {analysisResult && (
          <div className="space-y-8 animate-fade-in-up">
            
            {/* Top Toolbar */}
            <div className="flex justify-between items-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl shadow-sm">
              <div className="flex items-center gap-2.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                <span className="text-sm font-semibold text-slate-850 dark:text-slate-200">
                  Audit Summary Verified
                </span>
              </div>
              <button
                type="button"
                onClick={handleDownloadPDF}
                className="flex items-center gap-1.5 px-4.5 py-2.5 bg-accent hover:bg-accent-hover text-white text-xs font-bold rounded-xl shadow-sm hover:shadow-md transition cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" /> Download PDF Blueprint
              </button>
            </div>

            {/* Score cards section */}
            <ScoreCard 
              atsScore={analysisResult.ats_score} 
              keywordScore={analysisResult.keyword_score} 
              formatScore={analysisResult.format_score} 
            />

            {/* Middle Grid: Keywords & Feedback Accordion */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              {/* Accordion Feedbacks */}
              <div className="lg:col-span-7 space-y-2">
                <h3 className="font-extrabold text-slate-800 dark:text-slate-100 text-lg mb-2 pl-1">
                  Section Feedback Critiques
                </h3>
                <SectionFeedback feedback={analysisResult.section_feedback} />
              </div>
              
              {/* Keywords Tag Lists */}
              <div className="lg:col-span-5 space-y-2">
                <h3 className="font-extrabold text-slate-800 dark:text-slate-100 text-lg mb-2 pl-1">
                  Keyword Audit Match
                </h3>
                <KeywordTags 
                  presentKeywords={analysisResult.present_keywords} 
                  missingKeywords={analysisResult.missing_keywords} 
                />
              </div>
            </div>

            {/* Bottom Suggestions & Bullet improvements */}
            <div className="space-y-2">
              <h3 className="font-extrabold text-slate-800 dark:text-slate-100 text-lg pl-1">
                Optimizations & Strategic Adjustments
              </h3>
              <SuggestionList 
                topSuggestions={analysisResult.top_suggestions} 
                weakBullets={analysisResult.weak_bullets} 
              />
            </div>
            
          </div>
        )}

        {/* Case B: Compare Mode Result */}
        {compareResult && (
          <div className="space-y-8 animate-fade-in-up">
            
            {/* Top Back Toolbar */}
            <div className="flex justify-between items-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl shadow-sm">
              <span className="text-xs font-semibold text-slate-500">
                Compare Mode Output
              </span>
              <button
                type="button"
                onClick={handleBackToNewAnalysis}
                className="flex items-center gap-1.5 px-3 py-1.5 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 text-xs font-semibold rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              >
                Reset Comparison
              </button>
            </div>

            <CompareView compareData={compareResult} />
          </div>
        )}

      </div>
    </main>
  );
}
