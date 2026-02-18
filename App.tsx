import React, { useState, useEffect } from 'react';
import { STRATEGIES } from './constants';
import { Strategy } from './types';
import StrategyCard from './components/StrategyCard';
import StrategyViewer from './components/StrategyViewer';
import RiskCalculator from './components/RiskCalculator';
import MarketSentiment from './components/MarketSentiment';
import TradingViewWidget from './components/TradingViewWidget';
import AgentControls from './components/AgentControls';
import OpenTrades from './components/OpenTrades';
import Settings from './components/Settings';
import AgentLogs from './components/AgentLogs';
import Statistics from './components/Statistics';
import { Terminal, LayoutDashboard, Calculator, Zap, Github, BookOpen, LineChart, Settings as SettingsIcon, PieChart, Menu, X } from 'lucide-react';
import { MarketType } from './services/binance';

const App: React.FC = () => {
  const [selectedStrategy, setSelectedStrategy] = useState<Strategy | null>(null);
  const [activeView, setActiveView] = useState<'dashboard' | 'calculator' | 'chart' | 'settings' | 'statistics'>('dashboard');
  const [filter, setFilter] = useState<'All' | 'Long' | 'Short' | 'Combined'>('All');
  
  // API Keys state
  const [apiKey, setApiKey] = useState('');
  const [apiSecret, setApiSecret] = useState('');
  const [marketType, setMarketType] = useState<MarketType>('Futures');

  // Load keys on mount
  useEffect(() => {
    const k = localStorage.getItem('binance_api_key');
    const s = localStorage.getItem('binance_api_secret');
    const m = localStorage.getItem('binance_market_type') as MarketType;
    if (k) setApiKey(k);
    if (s) setApiSecret(s);
    if (m) setMarketType(m);
  }, []);

  const handleSaveKeys = (k: string, s: string, m: MarketType) => {
    setApiKey(k);
    setApiSecret(s);
    setMarketType(m);
    if (k && s) {
      setActiveView('dashboard');
    }
  };

  const filteredStrategies = STRATEGIES.filter(s => filter === 'All' || s.type === filter);

  // Navigation Items Config
  const navItems = [
    { id: 'dashboard', label: 'Home', icon: LayoutDashboard },
    { id: 'chart', label: 'Chart', icon: LineChart },
    { id: 'statistics', label: 'Stats', icon: PieChart },
    { id: 'calculator', label: 'Risk', icon: Calculator },
    { id: 'settings', label: 'Settings', icon: SettingsIcon },
  ];

  return (
    <div className="min-h-screen bg-background text-slate-200 font-sans selection:bg-blue-500/30 pb-20 md:pb-0">
      
      {/* Desktop Navbar */}
      <nav className="sticky top-0 z-40 w-full border-b border-slate-700 bg-surface/80 backdrop-blur-md hidden md:block">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center shadow-lg shadow-blue-900/20">
              <Zap className="text-white w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-indigo-400">
                Claude Trading Agent
              </h1>
              <p className="text-[10px] text-slate-500 font-mono tracking-widest">OWNER: MINU</p>
            </div>
          </div>

          <div className="flex items-center gap-1 bg-slate-800/50 p-1 rounded-lg border border-slate-700">
            {navItems.map((item) => (
              <button 
                key={item.id}
                onClick={() => setActiveView(item.id as any)}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-all flex items-center gap-2 ${activeView === item.id ? 'bg-slate-700 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'}`}
              >
                <item.icon className="w-4 h-4" /> {item.label}
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* Mobile Top Bar */}
      <div className="md:hidden sticky top-0 z-40 bg-surface/90 backdrop-blur-md border-b border-slate-700 px-4 py-3 flex items-center justify-between">
         <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
              <Zap className="text-white w-5 h-5" />
            </div>
            <span className="font-bold text-lg text-slate-100">ClaudeBot</span>
         </div>
         <div className="text-[10px] font-mono text-slate-500 border border-slate-700 px-2 py-1 rounded">
            {apiKey ? 'ONLINE' : 'DEMO'}
         </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-6 md:py-8">
        
        {activeView === 'dashboard' && (
          <div className="animate-fadeIn space-y-6">
            {/* Agent Control Buttons */}
            <AgentControls />

            {/* Split Row: Market Sentiment & Agent Logs */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <MarketSentiment />
              <AgentLogs />
            </div>

            {/* Welcome Banner */}
             <div className="bg-gradient-to-r from-indigo-900/30 to-slate-900 border border-indigo-500/20 rounded-xl p-4 md:p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                  <h2 className="text-lg md:text-xl font-bold text-white mb-1">Welcome back, Minu.</h2>
                  <p className="text-indigo-200 text-xs md:text-sm hidden md:block">
                    {apiKey ? `Connected to Binance ${marketType}. Scanning for opportunities...` : 'Demo Mode Active. Connect API keys in Settings to sync with your personal account.'}
                  </p>
                </div>
                <button 
                  onClick={() => {
                      setFilter('Combined');
                      const el = document.getElementById('strategies-grid');
                      el?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="w-full md:w-auto px-4 py-2 bg-indigo-600/80 hover:bg-indigo-500 text-white rounded-lg font-medium text-sm transition-all shadow-lg flex items-center justify-center gap-2"
                >
                  <BookOpen className="w-3 h-3" /> View Strategies
                </button>
            </div>

            {/* Open Trades Table (Live P&L) */}
            <OpenTrades apiKey={apiKey} apiSecret={apiSecret} marketType={marketType} />

            {/* Filter Tabs */}
            <div className="flex items-center gap-2 mb-2 overflow-x-auto pb-2 scrollbar-hide">
              <span className="text-slate-500 text-xs font-bold uppercase tracking-wider mr-2 shrink-0">Filter:</span>
              {(['All', 'Long', 'Short', 'Combined'] as const).map(f => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all whitespace-nowrap ${
                    filter === f 
                    ? 'bg-slate-700 border-slate-600 text-white' 
                    : 'bg-transparent border-slate-700 text-slate-400 hover:border-slate-500 hover:text-slate-300'
                  }`}
                >
                  {f === 'All' ? 'All' : f}
                </button>
              ))}
            </div>

            {/* Strategies Grid */}
            <div id="strategies-grid" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
              {filteredStrategies.map(strategy => (
                <StrategyCard 
                  key={strategy.id} 
                  strategy={strategy} 
                  onClick={setSelectedStrategy} 
                />
              ))}
            </div>

            {filteredStrategies.length === 0 && (
              <div className="text-center py-20 text-slate-500">
                <p>No strategies found for this filter.</p>
              </div>
            )}
          </div>
        )}

        {activeView === 'chart' && (
          <div className="animate-fadeIn h-full">
             <div className="mb-4 flex flex-col sm:flex-row sm:justify-between sm:items-end gap-4">
                <div>
                  <h2 className="text-xl md:text-2xl font-bold text-slate-100">Live Market Data</h2>
                  <p className="text-slate-400 text-xs md:text-sm">BTC/USDT Real-time analysis.</p>
                </div>
                <div className="flex gap-2">
                   <div className="text-[10px] md:text-xs font-mono text-emerald-400 bg-emerald-500/10 px-3 py-1.5 rounded border border-emerald-500/20 flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></div>
                      LONG BIAS
                   </div>
                </div>
             </div>
             <TradingViewWidget />
             
             <div className="mt-6 grid grid-cols-2 md:grid-cols-3 gap-4">
               <div className="bg-surface border border-slate-700 rounded-lg p-4">
                  <h3 className="text-[10px] font-mono text-slate-500 mb-1 uppercase">Price</h3>
                  <div className="text-lg md:text-xl font-bold text-slate-200">BTC/USDT</div>
               </div>
               <div className="bg-surface border border-slate-700 rounded-lg p-4">
                  <h3 className="text-[10px] font-mono text-slate-500 mb-1 uppercase">Signal</h3>
                  <div className="text-lg md:text-xl font-bold text-indigo-400">WAITING</div>
               </div>
               <div className="col-span-2 md:col-span-1 bg-surface border border-slate-700 rounded-lg p-4">
                  <h3 className="text-[10px] font-mono text-slate-500 mb-1 uppercase">Interval</h3>
                  <div className="text-lg md:text-xl font-bold text-slate-200">15m / 4h</div>
               </div>
             </div>
          </div>
        )}

        {activeView === 'statistics' && (
          <Statistics />
        )}

        {activeView === 'calculator' && (
          <div className="max-w-3xl mx-auto animate-fadeIn">
            <RiskCalculator />
            
            <div className="mt-8 p-6 border border-slate-700 rounded-xl bg-slate-900/50">
              <h3 className="text-lg font-bold text-slate-200 mb-4">Risk Rules</h3>
              <ul className="space-y-3 text-sm text-slate-400">
                <li className="flex gap-2">
                  <span className="text-indigo-400 font-bold">1.</span>
                  Max risk 1-2% per trade.
                </li>
                <li className="flex gap-2">
                  <span className="text-indigo-400 font-bold">2.</span>
                  Always use Stop Loss.
                </li>
              </ul>
            </div>
          </div>
        )}

        {activeView === 'settings' && (
          <Settings onSave={handleSaveKeys} hasKeys={!!apiKey} />
        )}

      </main>

      {/* Mobile Bottom Navigation */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-surface/95 backdrop-blur-xl border-t border-slate-700/50 z-50 pb-safe">
        <div className="flex justify-around items-center h-16">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveView(item.id as any)}
              className={`flex flex-col items-center justify-center w-full h-full space-y-1 ${
                activeView === item.id ? 'text-blue-400' : 'text-slate-500'
              }`}
            >
              <item.icon className={`w-5 h-5 ${activeView === item.id ? 'fill-current opacity-20' : ''}`} />
              <span className="text-[10px] font-medium">{item.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Modal */}
      {selectedStrategy && (
        <StrategyViewer 
          strategy={selectedStrategy} 
          onClose={() => setSelectedStrategy(null)} 
        />
      )}
    </div>
  );
};

export default App;