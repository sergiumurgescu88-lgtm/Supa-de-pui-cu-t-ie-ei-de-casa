import React, { useState, useEffect } from 'react';
import { Strategy } from '../types';
import { X, Code, BookOpen, Activity, ArrowRight, Settings as SettingsIcon, Save, RotateCcw } from 'lucide-react';
import BacktestSim from './BacktestSim';

interface StrategyViewerProps {
  strategy: Strategy;
  onClose: () => void;
}

const StrategyViewer: React.FC<StrategyViewerProps> = ({ strategy, onClose }) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'code' | 'sim' | 'config'>('overview');
  const [configValues, setConfigValues] = useState<Record<string, any>>({});
  const [hasChanges, setHasChanges] = useState(false);
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

  const handleParamChange = (key: string, value: any) => {
    setConfigValues(prev => ({ ...prev, [key]: value }));
    setHasChanges(true);
    setShowSaveSuccess(false);
  };

  const handleSave = () => {
    // In a real application, this would trigger an API call to update the strategy config
    console.log('Saving configuration for', strategy.id, configValues);
    setHasChanges(false);
    setShowSaveSuccess(true);
    
    // Hide success message after 3 seconds
    setTimeout(() => setShowSaveSuccess(false), 3000);
  };

  const handleReset = () => {
    if (strategy.parameters) {
      const initial: Record<string, any> = {};
      strategy.parameters.forEach(p => {
        initial[p.key] = p.defaultValue;
      });
      setConfigValues(initial);
      setHasChanges(false);
      setShowSaveSuccess(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="bg-surface w-full max-w-4xl max-h-[90vh] rounded-2xl border border-slate-700 shadow-2xl overflow-hidden flex flex-col">
        
        {/* Header */}
        <div className="p-6 border-b border-slate-700 flex justify-between items-start bg-slate-800/50">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h2 className="text-2xl font-bold text-slate-100">{strategy.name}</h2>
              <span className={`px-3 py-1 rounded-full text-xs font-bold border ${
                strategy.type === 'Long' ? 'border-emerald-500 text-emerald-400 bg-emerald-500/10' :
                strategy.type === 'Short' ? 'border-rose-500 text-rose-400 bg-rose-500/10' :
                'border-indigo-500 text-indigo-400 bg-indigo-500/10'
              }`}>
                {strategy.type.toUpperCase()}
              </span>
            </div>
            <p className="text-slate-400">{strategy.description}</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-700 rounded-full transition-colors text-slate-400 hover:text-white">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-slate-700 bg-slate-900/50 px-6 overflow-x-auto">
          <button 
            onClick={() => setActiveTab('overview')}
            className={`py-4 px-4 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 whitespace-nowrap ${activeTab === 'overview' ? 'border-blue-500 text-blue-400' : 'border-transparent text-slate-400 hover:text-slate-200'}`}
          >
            <BookOpen className="w-4 h-4" /> Logic & Rules
          </button>
          <button 
            onClick={() => setActiveTab('code')}
            className={`py-4 px-4 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 whitespace-nowrap ${activeTab === 'code' ? 'border-blue-500 text-blue-400' : 'border-transparent text-slate-400 hover:text-slate-200'}`}
          >
            <Code className="w-4 h-4" /> Python Logic
          </button>
          <button 
            onClick={() => setActiveTab('sim')}
            className={`py-4 px-4 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 whitespace-nowrap ${activeTab === 'sim' ? 'border-blue-500 text-blue-400' : 'border-transparent text-slate-400 hover:text-slate-200'}`}
          >
            <Activity className="w-4 h-4" /> Visual Simulation
          </button>
          <button 
            onClick={() => setActiveTab('config')}
            className={`py-4 px-4 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 whitespace-nowrap ${activeTab === 'config' ? 'border-blue-500 text-blue-400' : 'border-transparent text-slate-400 hover:text-slate-200'}`}
          >
            <SettingsIcon className="w-4 h-4" /> Configuration
          </button>
        </div>

        {/* Content */}
        <div className="flex-grow overflow-y-auto p-6 bg-slate-900/30">
          
          {activeTab === 'overview' && (
            <div className="space-y-6 animate-fadeIn">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-surface border border-slate-700 p-4 rounded-xl">
                  <span className="text-xs text-slate-500 uppercase tracking-wider block mb-1">Win Rate</span>
                  <span className="text-xl font-bold text-emerald-400">{strategy.winRate}</span>
                </div>
                <div className="bg-surface border border-slate-700 p-4 rounded-xl">
                  <span className="text-xs text-slate-500 uppercase tracking-wider block mb-1">Frequency</span>
                  <span className="text-xl font-bold text-blue-400">{strategy.tradesPerDay} / day</span>
                </div>
                <div className="bg-surface border border-slate-700 p-4 rounded-xl">
                  <span className="text-xs text-slate-500 uppercase tracking-wider block mb-1">Difficulty</span>
                  <div className="flex gap-1 mt-1">
                     {[...Array(5)].map((_, i) => (
                      <div key={i} className={`w-8 h-2 rounded-full ${i < strategy.difficulty ? 'bg-warning' : 'bg-slate-700'}`} />
                    ))}
                  </div>
                </div>
              </div>

              <div className="bg-surface border border-slate-700 rounded-xl p-6">
                <h3 className="text-lg font-bold text-slate-200 mb-4 flex items-center gap-2">
                   <ArrowRight className="w-5 h-5 text-blue-500" /> Trading Logic
                </h3>
                <div className="space-y-4 font-mono text-sm text-slate-300">
                  {strategy.logic.split('\n').map((line, i) => (
                    <div key={i} className="p-3 bg-slate-900 rounded border border-slate-800">
                      {line}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'code' && (
             <div className="bg-[#0d1117] p-6 rounded-xl border border-slate-700 overflow-x-auto">
               <pre className="font-mono text-sm text-slate-300">
                 <code>{strategy.code}</code>
               </pre>
             </div>
          )}

          {activeTab === 'sim' && (
            <div className="bg-surface border border-slate-700 rounded-xl p-6 h-[400px]">
              <BacktestSim strategy={strategy} />
            </div>
          )}

          {activeTab === 'config' && (
            <div className="max-w-3xl mx-auto animate-fadeIn">
              <div className="bg-surface border border-slate-700 rounded-xl p-6">
                <div className="flex justify-between items-center mb-6">
                  <div>
                     <h3 className="text-lg font-bold text-slate-100">Strategy Parameters</h3>
                     <p className="text-sm text-slate-400">Optimize strategy behavior. Changes apply immediately to the running agent.</p>
                  </div>
                  {showSaveSuccess && (
                     <div className="px-3 py-1 bg-emerald-500/20 text-emerald-400 text-xs font-bold rounded-full border border-emerald-500/30 animate-pulse">
                        Configuration Saved!
                     </div>
                  )}
                </div>

                {!strategy.parameters || strategy.parameters.length === 0 ? (
                  <div className="text-center py-12 text-slate-500 bg-slate-900/50 rounded-lg">
                    <p>No configurable parameters available for this strategy.</p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {strategy.parameters.map((param) => (
                      <div key={param.key} className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-center p-4 bg-slate-900/30 rounded-lg border border-slate-700/50 hover:border-slate-600 transition-colors">
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
                                  className="w-20 bg-slate-800 border border-slate-600 rounded px-2 py-1 text-right text-slate-200 text-sm focus:border-blue-500 focus:outline-none"
                                />
                                {param.unit && <span className="text-xs text-slate-500">{param.unit}</span>}
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
                                  {configValues[param.key] ? 'ENABLED' : 'DISABLED'}
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

                {/* Action Buttons */}
                <div className="mt-8 flex justify-end gap-3 pt-4 border-t border-slate-700/50">
                   <button 
                     onClick={handleReset}
                     disabled={!hasChanges}
                     className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                       hasChanges 
                         ? 'bg-slate-700 hover:bg-slate-600 text-slate-200' 
                         : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                     }`}
                   >
                     <RotateCcw className="w-4 h-4" /> Reset
                   </button>
                   <button 
                     onClick={handleSave}
                     disabled={!hasChanges}
                     className={`flex items-center gap-2 px-6 py-2 rounded-lg font-bold transition-all shadow-lg ${
                       hasChanges 
                         ? 'bg-blue-600 hover:bg-blue-500 text-white shadow-blue-900/30' 
                         : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                     }`}
                   >
                     <Save className="w-4 h-4" /> Save Configuration
                   </button>
                </div>
              </div>
            </div>
          )}
        </div>
        
        {/* Footer */}
        <div className="p-4 border-t border-slate-700 bg-surface flex justify-end">
           <button onClick={onClose} className="px-6 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors">
             Close Viewer
           </button>
        </div>

      </div>
    </div>
  );
};

export default StrategyViewer;
