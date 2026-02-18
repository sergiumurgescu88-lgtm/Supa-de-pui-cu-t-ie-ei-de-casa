import React, { useState, useEffect } from 'react';
import { Strategy } from '../types';
import { X, Code, BookOpen, Activity, ArrowRight, Settings as SettingsIcon, CheckCircle, RotateCcw, Loader2 } from 'lucide-react';
import BacktestSim from './BacktestSim';

interface StrategyViewerProps {
  strategy: Strategy;
  onClose: () => void;
}

const StrategyViewer: React.FC<StrategyViewerProps> = ({ strategy, onClose }) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'code' | 'sim' | 'config'>('overview');
  const [configValues, setConfigValues] = useState<Record<string, any>>({});
  const [hasChanges, setHasChanges] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showSaveSuccess, setShowSaveSuccess] = useState(false);

  useEffect(() => {
    // Initialize config values from strategy defaults
    if (strategy.parameters) {
      const initial: Record<string, any> = {};
      strategy.parameters.forEach(p => {
        initial[p.key] = p.defaultValue;
      });
      setConfigValues(initial);
      setHasChanges(false);
    }
  }, [strategy]);

  // Auto-save logic
  useEffect(() => {
    if (!hasChanges) return;

    setIsSaving(true);
    const timer = setTimeout(() => {
      // Simulate API Save
      console.log('Auto-saving configuration for', strategy.id, configValues);
      
      setIsSaving(false);
      setHasChanges(false);
      setShowSaveSuccess(true);
      
      // Hide success message after 2 seconds
      setTimeout(() => setShowSaveSuccess(false), 2000);
    }, 1000); // 1 second debounce

    return () => clearTimeout(timer);
  }, [configValues, hasChanges, strategy.id]);

  const handleParamChange = (key: string, value: any) => {
    setConfigValues(prev => ({ ...prev, [key]: value }));
    setHasChanges(true);
    setShowSaveSuccess(false);
  };

  const handleReset = () => {
    if (strategy.parameters) {
      const initial: Record<string, any> = {};
      strategy.parameters.forEach(p => {
        initial[p.key] = p.defaultValue;
      });
      setConfigValues(initial);
      setHasChanges(true); // Trigger auto-save for reset
      setShowSaveSuccess(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm md:p-4">
      <div className="bg-surface w-full h-full md:h-auto md:max-w-4xl md:max-h-[90vh] md:rounded-2xl border-none md:border border-slate-700 shadow-2xl overflow-hidden flex flex-col">
        
        {/* Header */}
        <div className="p-4 md:p-6 border-b border-slate-700 flex justify-between items-start bg-slate-800/50 pt-safe-top">
          <div>
            <div className="flex items-center gap-2 md:gap-3 mb-1 md:mb-2">
              <h2 className="text-xl md:text-2xl font-bold text-slate-100">{strategy.name}</h2>
              <span className={`px-2 py-0.5 md:px-3 md:py-1 rounded-full text-[10px] md:text-xs font-bold border ${
                strategy.type === 'Long' ? 'border-emerald-500 text-emerald-400 bg-emerald-500/10' :
                strategy.type === 'Short' ? 'border-rose-500 text-rose-400 bg-rose-500/10' :
                'border-indigo-500 text-indigo-400 bg-indigo-500/10'
              }`}>
                {strategy.type.toUpperCase()}
              </span>
            </div>
            <p className="text-xs md:text-sm text-slate-400 line-clamp-1">{strategy.description}</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-700 rounded-full transition-colors text-slate-400 hover:text-white">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-slate-700 bg-slate-900/50 px-2 md:px-6 overflow-x-auto no-scrollbar">
          <button 
            onClick={() => setActiveTab('overview')}
            className={`py-3 md:py-4 px-3 md:px-4 text-xs md:text-sm font-medium border-b-2 transition-colors flex items-center gap-2 whitespace-nowrap ${activeTab === 'overview' ? 'border-blue-500 text-blue-400' : 'border-transparent text-slate-400 hover:text-slate-200'}`}
          >
            <BookOpen className="w-4 h-4" /> <span className="hidden sm:inline">Logic &</span> Rules
          </button>
          <button 
            onClick={() => setActiveTab('code')}
            className={`py-3 md:py-4 px-3 md:px-4 text-xs md:text-sm font-medium border-b-2 transition-colors flex items-center gap-2 whitespace-nowrap ${activeTab === 'code' ? 'border-blue-500 text-blue-400' : 'border-transparent text-slate-400 hover:text-slate-200'}`}
          >
            <Code className="w-4 h-4" /> Code
          </button>
          <button 
            onClick={() => setActiveTab('sim')}
            className={`py-3 md:py-4 px-3 md:px-4 text-xs md:text-sm font-medium border-b-2 transition-colors flex items-center gap-2 whitespace-nowrap ${activeTab === 'sim' ? 'border-blue-500 text-blue-400' : 'border-transparent text-slate-400 hover:text-slate-200'}`}
          >
            <Activity className="w-4 h-4" /> Sim
          </button>
          <button 
            onClick={() => setActiveTab('config')}
            className={`py-3 md:py-4 px-3 md:px-4 text-xs md:text-sm font-medium border-b-2 transition-colors flex items-center gap-2 whitespace-nowrap ${activeTab === 'config' ? 'border-blue-500 text-blue-400' : 'border-transparent text-slate-400 hover:text-slate-200'}`}
          >
            <SettingsIcon className="w-4 h-4" /> Config
          </button>
        </div>

        {/* Content */}
        <div className="flex-grow overflow-y-auto p-4 md:p-6 bg-slate-900/30 pb-24 md:pb-6">
          
          {activeTab === 'overview' && (
            <div className="space-y-6 animate-fadeIn">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
                <div className="bg-surface border border-slate-700 p-3 md:p-4 rounded-xl">
                  <span className="text-[10px] md:text-xs text-slate-500 uppercase tracking-wider block mb-1">Win Rate</span>
                  <span className="text-lg md:text-xl font-bold text-emerald-400">{strategy.winRate}</span>
                </div>
                <div className="bg-surface border border-slate-700 p-3 md:p-4 rounded-xl">
                  <span className="text-[10px] md:text-xs text-slate-500 uppercase tracking-wider block mb-1">Frequency</span>
                  <span className="text-lg md:text-xl font-bold text-blue-400">{strategy.tradesPerDay}/d</span>
                </div>
                <div className="col-span-2 md:col-span-1 bg-surface border border-slate-700 p-3 md:p-4 rounded-xl">
                  <span className="text-[10px] md:text-xs text-slate-500 uppercase tracking-wider block mb-1">Difficulty</span>
                  <div className="flex gap-1 mt-1">
                     {[...Array(5)].map((_, i) => (
                      <div key={i} className={`w-8 h-2 rounded-full ${i < strategy.difficulty ? 'bg-warning' : 'bg-slate-700'}`} />
                    ))}
                  </div>
                </div>
              </div>

              <div className="bg-surface border border-slate-700 rounded-xl p-4 md:p-6">
                <h3 className="text-lg font-bold text-slate-200 mb-4 flex items-center gap-2">
                   <ArrowRight className="w-5 h-5 text-blue-500" /> Trading Logic
                </h3>
                <div className="space-y-4 font-mono text-xs md:text-sm text-slate-300">
                  {strategy.logic.split('\n').map((line, i) => (
                    <div key={i} className="p-3 bg-slate-900 rounded border border-slate-800 break-words">
                      {line}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'code' && (
             <div className="bg-[#0d1117] p-4 md:p-6 rounded-xl border border-slate-700 overflow-x-auto">
               <pre className="font-mono text-xs md:text-sm text-slate-300">
                 <code>{strategy.code}</code>
               </pre>
             </div>
          )}

          {activeTab === 'sim' && (
            <div className="bg-surface border border-slate-700 rounded-xl p-4 md:p-6 h-[300px] md:h-[400px]">
              <BacktestSim strategy={strategy} />
            </div>
          )}

          {activeTab === 'config' && (
            <div className="max-w-3xl mx-auto animate-fadeIn">
              <div className="bg-surface border border-slate-700 rounded-xl p-4 md:p-6">
                <div className="flex justify-between items-center mb-6">
                  <div>
                     <h3 className="text-lg font-bold text-slate-100">Parameters</h3>
                     <p className="text-xs md:text-sm text-slate-400">Updates apply immediately.</p>
                  </div>
                  {showSaveSuccess && (
                     <div className="px-3 py-1 bg-emerald-500/20 text-emerald-400 text-[10px] md:text-xs font-bold rounded-full border border-emerald-500/30 animate-pulse flex items-center gap-2">
                        <CheckCircle className="w-3 h-3" /> Saved
                     </div>
                  )}
                </div>

                {!strategy.parameters || strategy.parameters.length === 0 ? (
                  <div className="text-center py-12 text-slate-500 bg-slate-900/50 rounded-lg">
                    <p>No configurable parameters available.</p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {strategy.parameters.map((param) => (
                      <div key={param.key} className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-4 items-center p-3 md:p-4 bg-slate-900/30 rounded-lg border border-slate-700/50 hover:border-slate-600 transition-colors">
                        <div className="sm:col-span-1">
                          <label htmlFor={param.key} className="block text-sm font-medium text-slate-300">
                            {param.label}
                          </label>
                          {param.description && (
                            <p className="text-xs text-slate-500 mt-1">{param.description}</p>
                          )}
                        </div>
                        <div className="sm:col-span-2">
                          {param.type === 'number' && (
                             <div className="flex items-center gap-3">
                                <input
                                  type="range"
                                  id={`${param.key}-range`}
                                  min={param.min}
                                  max={param.max}
                                  step={param.step || 1}
                                  value={configValues[param.key] || ''}
                                  onChange={(e) => handleParamChange(param.key, Number(e.target.value))}
                                  className="flex-grow h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
                                />
                                <input
                                  type="number"
                                  id={param.key}
                                  min={param.min}
                                  max={param.max}
                                  step={param.step || 1}
                                  value={configValues[param.key] || ''}
                                  onChange={(e) => handleParamChange(param.key, Number(e.target.value))}
                                  className="w-16 bg-slate-800 border border-slate-600 rounded px-2 py-1 text-right text-slate-200 text-sm focus:border-blue-500 focus:outline-none"
                                />
                             </div>
                          )}
                          
                          {param.type === 'boolean' && (
                             <div className="flex items-center">
                                <button
                                  onClick={() => handleParamChange(param.key, !configValues[param.key])}
                                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-slate-900 ${
                                    configValues[param.key] ? 'bg-blue-600' : 'bg-slate-700'
                                  }`}
                                >
                                  <span
                                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                      configValues[param.key] ? 'translate-x-6' : 'translate-x-1'
                                    }`}
                                  />
                                </button>
                                <span className="ml-3 text-sm font-mono text-slate-400">
                                  {configValues[param.key] ? 'ON' : 'OFF'}
                                </span>
                             </div>
                          )}

                          {param.type === 'select' && param.options && (
                             <select
                                value={configValues[param.key] || ''}
                                onChange={(e) => handleParamChange(param.key, e.target.value)}
                                className="w-full bg-slate-800 border border-slate-600 rounded px-3 py-2 text-slate-200 text-sm focus:border-blue-500 focus:outline-none"
                             >
                               {param.options.map(opt => (
                                 <option key={opt} value={opt}>{opt}</option>
                               ))}
                             </select>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Footer with Status and Reset */}
                <div className="mt-8 flex justify-between items-center pt-4 border-t border-slate-700/50">
                   <div className="text-sm">
                      {isSaving ? (
                          <div className="flex items-center gap-2 text-blue-400">
                              <Loader2 className="w-4 h-4 animate-spin" />
                              <span className="hidden sm:inline">Saving...</span>
                          </div>
                      ) : showSaveSuccess ? (
                          <div className="flex items-center gap-2 text-emerald-400">
                              <CheckCircle className="w-4 h-4" />
                              <span className="hidden sm:inline">Saved</span>
                          </div>
                      ) : (
                          <span className="text-slate-500 text-xs">Auto-save on</span>
                      )}
                   </div>

                   <button 
                     onClick={handleReset}
                     className="flex items-center gap-2 px-3 py-2 rounded-lg font-medium transition-colors bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs md:text-sm"
                   >
                     <RotateCcw className="w-3 h-3 md:w-4 md:h-4" /> Reset
                   </button>
                </div>
              </div>
            </div>
          )}
        </div>
        
        {/* Footer */}
        <div className="p-4 border-t border-slate-700 bg-surface hidden md:flex justify-end">
           <button onClick={onClose} className="px-6 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors">
             Close
           </button>
        </div>

      </div>
    </div>
  );
};

export default StrategyViewer;