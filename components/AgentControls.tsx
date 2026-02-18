import React from 'react';
import { Zap, Terminal, Crosshair, Power, Hand } from 'lucide-react';

interface AgentControlsProps {
  onStartAuto?: () => void;
  onStopAuto?: () => void;
  isRunning?: boolean;
}

const AgentControls: React.FC<AgentControlsProps> = ({ onStartAuto, onStopAuto, isRunning = true }) => {
  // Use prop for running state if provided, otherwise default to true (visual only)
  // For manual mode tracking, we can keep local state for UI selection effect
  const [activeMode, setActiveMode] = React.useState<'auto' | 'manual'>(isRunning ? 'auto' : 'manual');

  // Sync local state with prop
  React.useEffect(() => {
    setActiveMode(isRunning ? 'auto' : 'manual');
  }, [isRunning]);

  const handleAutoClick = () => {
    if (!isRunning && onStartAuto) {
      onStartAuto();
    }
    // If already running, do nothing or show info
    setActiveMode('auto');
  };

  const handleManualClick = () => {
    if (isRunning && onStopAuto) {
      onStopAuto();
    }
    setActiveMode('manual');
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 mb-6 md:mb-8">
      {/* ── AUTO-PILOT CONTROL ── */}
      <button
        onClick={handleAutoClick}
        className={`relative group overflow-hidden rounded-xl border-2 p-4 md:p-6 transition-all duration-300 flex items-center justify-between text-left
          ${isRunning
            ? 'border-emerald-500/50 bg-emerald-500/5 shadow-[0_0_30px_rgba(16,185,129,0.15)]' 
            : 'border-slate-700 bg-slate-800/50 hover:border-slate-600 opacity-60 hover:opacity-100'
          }`}
      >
        <div className="z-10 flex items-center gap-4 md:gap-5">
          <div className={`p-3 md:p-4 rounded-full transition-colors border ${isRunning ? 'bg-emerald-500 border-emerald-400 text-black' : 'bg-slate-700 border-slate-600 text-slate-400'}`}>
            <Zap className={`w-5 h-5 md:w-6 md:h-6 ${isRunning ? 'fill-current' : ''}`} />
          </div>
          <div>
            <h3 className={`text-lg md:text-xl font-bold tracking-wider ${isRunning ? 'text-emerald-400' : 'text-slate-400'}`}>
              AUTO-PILOT
            </h3>
            <p className="text-[10px] md:text-xs font-mono text-slate-500 mt-0.5 md:mt-1 uppercase tracking-widest">
              {isRunning ? 'AI Agent Active' : 'System Paused'}
            </p>
          </div>
        </div>
        
        {isRunning ? (
          <div className="flex items-center gap-2 bg-emerald-500/10 px-2 py-1 md:px-3 rounded-full border border-emerald-500/20">
             <span className="relative flex h-2 w-2">
               <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
               <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
             </span>
             <span className="text-[10px] md:text-xs font-mono text-emerald-400 font-bold hidden sm:inline">ACTIVE</span>
          </div>
        ) : (
          <div className="flex items-center gap-2 bg-slate-700/50 px-2 py-1 md:px-3 rounded-full border border-slate-600">
             <Power className="w-3 h-3 text-slate-400" />
             <span className="text-[10px] md:text-xs font-mono text-slate-400 font-bold hidden sm:inline">OFF</span>
          </div>
        )}
      </button>

      {/* ── MANUAL OVERRIDE CONTROL ── */}
      <button 
        onClick={handleManualClick}
        className={`relative group overflow-hidden rounded-xl border-2 p-4 md:p-6 transition-all duration-300 flex items-center justify-between text-left
          ${!isRunning
            ? 'border-indigo-500/50 bg-indigo-500/5 shadow-[0_0_30px_rgba(99,102,241,0.15)]'
            : 'border-slate-700 bg-slate-800/50 hover:border-slate-600 opacity-60 hover:opacity-100'
          }`}
      >
        <div className="z-10 flex items-center gap-4 md:gap-5">
          <div className={`p-3 md:p-4 rounded-lg transition-colors border ${!isRunning ? 'bg-indigo-500 border-indigo-400 text-white' : 'bg-slate-700 border-slate-600 text-slate-400'}`}>
            <Terminal className="w-5 h-5 md:w-6 md:h-6" />
          </div>
          <div>
            <h3 className={`text-lg md:text-xl font-bold tracking-wider ${!isRunning ? 'text-indigo-400' : 'text-slate-400'}`}>
              MANUAL
            </h3>
            <p className="text-[10px] md:text-xs font-mono text-slate-500 mt-0.5 md:mt-1 uppercase tracking-widest">
              {!isRunning ? 'Human Control' : 'Standby'}
            </p>
          </div>
        </div>

        {!isRunning ? (
          <div className="flex items-center gap-2 bg-indigo-500/10 px-2 py-1 md:px-3 rounded-full border border-indigo-500/20">
             <Hand className="w-3 h-3 text-indigo-400" />
             <span className="text-[10px] md:text-xs font-mono text-indigo-400 font-bold hidden sm:inline">ENGAGED</span>
          </div>
        ) : (
          <div className="flex items-center gap-2 bg-slate-700/50 px-2 py-1 md:px-3 rounded-full border border-slate-600">
             <Crosshair className="w-3 h-3 text-slate-400" />
             <span className="text-[10px] md:text-xs font-mono text-slate-400 font-bold hidden sm:inline">READY</span>
          </div>
        )}
      </button>
    </div>
  );
};

export default AgentControls;
