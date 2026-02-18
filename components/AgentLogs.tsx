import React, { useEffect, useState, useRef } from 'react';
import { Terminal, Activity, Search, AlertTriangle, CheckCircle } from 'lucide-react';

interface LogEntry {
  id: number;
  time: string;
  type: 'INFO' | 'ANALYSIS' | 'DECISION' | 'EXECUTION' | 'WARNING';
  message: string;
}

const MOCK_LOGS = [
  { type: 'INFO', message: 'Model weights loaded (v2.4-stable).' },
  { type: 'INFO', message: 'Connected to Binance Futures WebSocket.' },
  { type: 'ANALYSIS', message: 'Scanning BTC/USDT: RSI 64, MACD neutral.' },
  { type: 'ANALYSIS', message: 'Scanning ETH/USDT: Volatility increasing (ATR > 1.5).' },
];

const AgentLogs: React.FC = () => {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Initialize logs
  useEffect(() => {
    const initialLogs = MOCK_LOGS.map((l, i) => ({
      id: i,
      time: new Date().toLocaleTimeString('ro-RO'),
      type: l.type as any,
      message: l.message
    }));
    setLogs(initialLogs);
  }, []);

  // Simulate incoming AI thoughts
  useEffect(() => {
    const messages = [
      { type: 'ANALYSIS', message: 'Checking Smart Combo Score for SOL...' },
      { type: 'DECISION', message: 'Signal ignored: Volume too low on breakout.' },
      { type: 'INFO', message: 'Heartbeat signal sent. Latency: 45ms.' },
      { type: 'ANALYSIS', message: 'Updating EMA cross calculations on 15m timeframe.' },
      { type: 'WARNING', message: 'Funding rate high on BTC positions.' },
      { type: 'DECISION', message: 'HOLDING all positions. No exit trigger met.' },
    ];

    const interval = setInterval(() => {
      const randomMsg = messages[Math.floor(Math.random() * messages.length)];
      addLog(randomMsg.type as any, randomMsg.message);
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  const addLog = (type: 'INFO' | 'ANALYSIS' | 'DECISION' | 'EXECUTION' | 'WARNING', message: string) => {
    setLogs(prev => {
      const newLogs = [...prev, {
        id: Date.now(),
        time: new Date().toLocaleTimeString('ro-RO'),
        type,
        message
      }];
      if (newLogs.length > 50) return newLogs.slice(newLogs.length - 50);
      return newLogs;
    });
  };

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs]);

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'INFO': return 'text-slate-400';
      case 'ANALYSIS': return 'text-blue-400';
      case 'DECISION': return 'text-indigo-400';
      case 'EXECUTION': return 'text-emerald-400 font-bold';
      case 'WARNING': return 'text-amber-400';
      default: return 'text-slate-200';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'ANALYSIS': return <Search className="w-3 h-3" />;
      case 'DECISION': return <Activity className="w-3 h-3" />;
      case 'EXECUTION': return <CheckCircle className="w-3 h-3" />;
      case 'WARNING': return <AlertTriangle className="w-3 h-3" />;
      default: return <div className="w-1 h-1 rounded-full bg-slate-500" />;
    }
  };

  return (
    <div className="bg-surface border border-slate-700 rounded-xl overflow-hidden flex flex-col h-[250px] md:h-[320px]">
      <div className="p-3 md:p-4 border-b border-slate-700 bg-slate-800/50 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Terminal className="w-4 h-4 md:w-5 md:h-5 text-indigo-400" />
          <h3 className="font-bold text-sm md:text-base text-slate-100">AI Neural Feed</h3>
        </div>
        <div className="flex items-center gap-2 text-[10px] md:text-xs font-mono">
           <span className="w-1.5 h-1.5 md:w-2 md:h-2 rounded-full bg-emerald-500 animate-pulse"></span>
           <span className="text-emerald-400">ONLINE</span>
        </div>
      </div>

      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-3 md:p-4 space-y-2 font-mono text-[10px] md:text-xs bg-slate-900/50"
      >
        {logs.map((log) => (
          <div key={log.id} className="flex gap-2 md:gap-3 animate-fadeIn hover:bg-slate-800/30 p-1 rounded transition-colors">
            <span className="text-slate-600 shrink-0 select-none hidden sm:inline">[{log.time}]</span>
            <div className={`flex items-center gap-2 ${getTypeColor(log.type)}`}>
              <span className="shrink-0 opacity-70">{getTypeIcon(log.type)}</span>
              <span className="uppercase tracking-wider font-bold shrink-0 w-16 md:w-20 text-[9px] md:text-[10px] border border-slate-700/50 rounded px-1 text-center bg-slate-800/50">
                {log.type}
              </span>
              <span className="break-all">{log.message}</span>
            </div>
          </div>
        ))}
        <div className="h-4" /> {/* Spacer */}
      </div>
    </div>
  );
};

export default AgentLogs;