import React, { useState } from 'react';
import { Zap, Terminal, Crosshair, Power, Hand } from 'lucide-react';

const AgentControls: React.FC = () => {
  // State pentru a urmări modul activ: 'auto' sau 'manual'
  const [activeMode, setActiveMode] = useState<'auto' | 'manual'>('auto');

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
      {/* ── AUTO-PILOT CONTROL ── */}
      <button
        onClick={() => setActiveMode('auto')}
        className={`relative group overflow-hidden rounded-xl border-2 p-6 transition-all duration-300 flex items-center justify-between text-left
          ${activeMode === 'auto'
            ? 'border-emerald-500/50 bg-emerald-500/5 shadow-[0_0_30px_rgba(16,185,129,0.15)]' 
            : 'border-slate-700 bg-slate-800/50 hover:border-slate-600 opacity-60 hover:opacity-100'
          }`}
      >
        <div className="z-10 flex items-center gap-5">
          <div className={`p-4 rounded-full transition-colors border ${activeMode === 'auto' ? 'bg-emerald-500 border-emerald-400 text-black' : 'bg-slate-700 border-slate-600 text-slate-400'}`}>
            <Zap className={`w-6 h-6 ${activeMode === 'auto' ? 'fill-current' : ''}`} />
          </div>
          <div>
            <h3 className={`text-xl font-bold tracking-wider ${activeMode === 'auto' ? 'text-emerald-400' : 'text-slate-400'}`}>
              AUTO-PILOT
            </h3>
            <p className="text-xs font-mono text-slate-500 mt-1 uppercase tracking-widest">
              {activeMode === 'auto' ? 'AI Agent executing trades' : 'System Paused'}
            </p>
          </div>
        </div>
        
        {activeMode === 'auto' ? (
          <div className="flex items-center gap-2 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
             <span className="relative flex h-2 w-2">
               <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
               <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
             </span>
             <span className="text-xs font-mono text-emerald-400 font-bold">ACTIVE</span>
          </div>
        ) : (
          <div className="flex items-center gap-2 bg-slate-700/50 px-3 py-1 rounded-full border border-slate-600">
             <Power className="w-3 h-3 text-slate-400" />
             <span className="text-xs font-mono text-slate-400 font-bold">OFF</span>
          </div>
        )}
      </button>

      {/* ── MANUAL OVERRIDE CONTROL ── */}
      <button 
        onClick={() => setActiveMode('manual')}
        className={`relative group overflow-hidden rounded-xl border-2 p-6 transition-all duration-300 flex items-center justify-between text-left
          ${activeMode === 'manual'
            ? 'border-indigo-500/50 bg-indigo-500/5 shadow-[0_0_30px_rgba(99,102,241,0.15)]'
            : 'border-slate-700 bg-slate-800/50 hover:border-slate-600 opacity-60 hover:opacity-100'
          }`}
      >
        <div className="z-10 flex items-center gap-5">
          <div className={`p-4 rounded-lg transition-colors border ${activeMode === 'manual' ? 'bg-indigo-500 border-indigo-400 text-white' : 'bg-slate-700 border-slate-600 text-slate-400'}`}>
            <Terminal className="w-6 h-6" />
          </div>
          <div>
            <h3 className={`text-xl font-bold tracking-wider ${activeMode === 'manual' ? 'text-indigo-400' : 'text-slate-400'}`}>
              MANUAL MODE
            </h3>
            <p className="text-xs font-mono text-slate-500 mt-1 uppercase tracking-widest">
              {activeMode === 'manual' ? 'Human control engaged' : 'Standby for input'}
            </p>
          </div>
        </div>

        {activeMode === 'manual' ? (
          <div className="flex items-center gap-2 bg-indigo-500/10 px-3 py-1 rounded-full border border-indigo-500/20">
             <Hand className="w-3 h-3 text-indigo-400" />
             <span className="text-xs font-mono text-indigo-400 font-bold">ENGAGED</span>
          </div>
        ) : (
          <div className="flex items-center gap-2 bg-slate-700/50 px-3 py-1 rounded-full border border-slate-600">
             <Crosshair className="w-3 h-3 text-slate-400" />
             <span className="text-xs font-mono text-slate-400 font-bold">READY</span>
          </div>
        )}
      </button>
    </div>
  );
};

export default AgentControls;
