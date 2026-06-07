import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, FileText, X, AlertCircle } from 'lucide-react';

export default function UploadBox({ 
  onFileSelect, 
  onTextChange, 
  file, 
  text, 
  onClear,
  label = "Upload Resume"
}) {
  const [activeTab, setActiveTab] = useState('file'); // 'file' or 'text'
  const [error, setError] = useState('');

  // Setup drag-and-drop constraints
  const onDrop = useCallback((acceptedFiles, rejectedFiles) => {
    setError('');
    
    if (rejectedFiles && rejectedFiles.length > 0) {
      const fileErr = rejectedFiles[0];
      if (fileErr.file.size > 5 * 1024 * 1024) {
        setError('File is too large. Max size is 5MB.');
      } else {
        setError('Only PDF documents are supported.');
      }
      return;
    }

    if (acceptedFiles && acceptedFiles.length > 0) {
      onFileSelect(acceptedFiles[0]);
    }
  }, [onFileSelect]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf']
    },
    maxSize: 5 * 1024 * 1024, // 5MB limit
    multiple: false
  });

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    onClear(); // Reset upload states when toggling input types
    setError('');
  };

  const formatBytes = (bytes, decimals = 2) => {
    if (!+bytes) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
  };

  return (
    <div className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden transition-all">
      {/* Selector Tabs */}
      <div className="flex border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/20">
        <button
          type="button"
          onClick={() => handleTabChange('file')}
          className={`flex-1 py-3.5 px-4 text-sm font-semibold flex items-center justify-center gap-2 border-b-2 transition-all ${
            activeTab === 'file'
              ? 'border-accent text-accent dark:text-accent-light bg-white dark:bg-slate-900'
              : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
          }`}
        >
          <Upload className="w-4 h-4" />
          PDF Document
        </button>
        <button
          type="button"
          onClick={() => handleTabChange('text')}
          className={`flex-1 py-3.5 px-4 text-sm font-semibold flex items-center justify-center gap-2 border-b-2 transition-all ${
            activeTab === 'text'
              ? 'border-accent text-accent dark:text-accent-light bg-white dark:bg-slate-900'
              : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
          }`}
        >
          <FileText className="w-4 h-4" />
          Paste Plain Text
        </button>
      </div>

      <div className="p-6">
        {/* Tab 1: PDF File Drag and Drop */}
        {activeTab === 'file' && (
          <div>
            {!file ? (
              <div
                {...getRootProps()}
                className={`border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center cursor-pointer transition-all duration-200 ${
                  isDragActive
                    ? 'border-accent bg-accent/5 dark:bg-accent-dark/10 scale-[0.99]'
                    : 'border-slate-300 dark:border-slate-700 hover:border-accent dark:hover:border-accent'
                }`}
              >
                <input {...getInputProps()} />
                <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-4 text-slate-600 dark:text-slate-300">
                  <Upload className="w-6 h-6 animate-pulse-subtle" />
                </div>
                <h3 className="font-semibold text-slate-800 dark:text-slate-100 mb-1">
                  {isDragActive ? "Drop your resume here" : `Drag & drop ${label.toLowerCase()}`}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mb-4 text-center">
                  Only PDF files are supported. Max size 5MB.
                </p>
                <button
                  type="button"
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-sm font-semibold rounded-lg transition"
                >
                  Browse Files
                </button>
              </div>
            ) : (
              <div className="border border-slate-200 dark:border-slate-800 rounded-xl p-4 flex items-center justify-between bg-slate-50 dark:bg-slate-950/40">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-red-100 dark:bg-red-950/30 text-red-600 dark:text-red-400 flex items-center justify-center">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-medium text-slate-800 dark:text-slate-200 text-sm line-clamp-1">
                      {file.name}
                    </h4>
                    <p className="text-xs text-slate-400">
                      {formatBytes(file.size)}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={onClear}
                  className="p-1.5 rounded-lg bg-white dark:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 border border-slate-200 dark:border-slate-700 transition"
                  title="Remove file"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Resume Text Input Area */}
        {activeTab === 'text' && (
          <div className="space-y-2">
            <textarea
              value={text || ''}
              onChange={(e) => onTextChange(e.target.value)}
              placeholder="Paste the raw text of your resume here..."
              rows={8}
              className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-800 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent text-sm resize-y"
            />
            <div className="flex justify-between items-center text-xs text-slate-400">
              <span>Characters: {text ? text.length : 0}</span>
              {text && (
                <button 
                  type="button" 
                  onClick={onClear} 
                  className="text-red-500 hover:underline cursor-pointer flex items-center gap-0.5"
                >
                  <X className="w-3 h-3" /> Clear Text
                </button>
              )}
            </div>
          </div>
        )}

        {/* Error Dialog */}
        {error && (
          <div className="mt-4 p-3 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/40 rounded-xl flex items-start gap-2.5 text-red-600 dark:text-red-400">
            <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
            <span className="text-xs font-medium leading-normal">{error}</span>
          </div>
        )}
      </div>
    </div>
  );
}
