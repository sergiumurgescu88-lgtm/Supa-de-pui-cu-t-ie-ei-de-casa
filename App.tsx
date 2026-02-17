import React, { useState } from 'react';
import { STRATEGIES } from './constants';
import { Strategy } from './types';
import StrategyCard from './components/StrategyCard';
import StrategyViewer from './components/StrategyViewer';
import RiskCalculator from './components/RiskCalculator';
import MarketSentiment from './components/MarketSentiment';
import TradingViewWidget from './components/TradingViewWidget';
import AgentControls from './components/AgentControls';
import { Terminal, LayoutDashboard, Calculator, Zap, Github, BookOpen, LineChart } from 'lucide-react';

const App: React.FC = () => {
  const [selectedStrategy, setSelectedStrategy] = useState<Strategy | null>(null);
  const [activeView, setActiveView] = useState<'dashboard' | 'calculator' | 'chart'>('dashboard');
  const [filter, setFilter] = useState<'All' | 'Long' | 'Short' | 'Combined'>('All');

  const filteredStrategies = STRATEGIES.filter(s => filter === 'All' || s.type === filter);

  return (
    <div className="min-h-screen bg-background text-slate-200 font-sans selection:bg-blue-500/30">
      
      {/* Navbar */}
      <nav className="sticky top-0 z-40 w-full border-b border-slate-700 bg-surface/80 backdrop-blur-md">
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
            <button 
              onClick={() => setActiveView('dashboard')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-all flex items-center gap-2 ${activeView === 'dashboard' ? 'bg-slate-700 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'}`}
            >
              <LayoutDashboard className="w-4 h-4" /> Dashboard
            </button>
            <button 
              onClick={() => setActiveView('chart')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-all flex items-center gap-2 ${activeView === 'chart' ? 'bg-slate-700 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'}`}
            >
              <LineChart className="w-4 h-4" /> Live Chart
            </button>
            <button 
              onClick={() => setActiveView('calculator')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-all flex items-center gap-2 ${activeView === 'calculator' ? 'bg-slate-700 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'}`}
            >
              <Calculator className="w-4 h-4" /> Risk Calc
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        
        {activeView === 'dashboard' && (
          <div className="animate-fadeIn">
            {/* Agent Control Buttons */}
            <AgentControls />

            {/* Top Stats Row */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
              <div className="lg:col-span-2 bg-gradient-to-br from-indigo-900/40 to-slate-900 border border-indigo-500/20 rounded-xl p-8 relative overflow-hidden group">
                <div className="relative z-10">
                  <h2 className="text-3xl font-bold text-white mb-2">Welcome back, Minu.</h2>
                  <p className="text-indigo-200 max-w-lg mb-6">
                    Your trading agent is ready. The market is currently showing mixed signals. 
                    Recommended strategy for today is <span className="font-bold text-white underline decoration-indigo-500">Smart Combo Score</span> for maximum versatility.
                  </p>
                  <button 
                    onClick={() => {
                        setFilter('Combined');
                        const el = document.getElementById('strategies-grid');
                        el?.scrollIntoView({ behavior: 'smooth' });
                    }}
                    className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg font-medium transition-all shadow-lg shadow-indigo-900/50 flex items-center gap-2"
                  >
                    <BookOpen className="w-4 h-4" /> View Top Strategy
                  </button>
                </div>
                <div className="absolute right-0 bottom-0 opacity-10 transform translate-x-1/4 translate-y-1/4 group-hover:scale-105 transition-transform duration-700">
                  <Terminal className="w-64 h-64 text-indigo-400" />
                </div>
              </div>
              
              <MarketSentiment />
            </div>

            {/* Filter Tabs */}
            <div className="flex items-center gap-4 mb-6 overflow-x-auto pb-2">
              <span className="text-slate-500 text-sm font-bold uppercase tracking-wider mr-2">Filter:</span>
              {(['All', 'Long', 'Short', 'Combined'] as const).map(f => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`px-4 py-2 rounded-full text-sm font-medium border transition-all whitespace-nowrap ${
                    filter === f 
                    ? 'bg-slate-700 border-slate-600 text-white' 
                    : 'bg-transparent border-slate-700 text-slate-400 hover:border-slate-500 hover:text-slate-300'
                  }`}
                >
                  {f === 'All' ? 'All Strategies' : `${f} Only`}
                </button>
              ))}
            </div>

            {/* Strategies Grid */}
            <div id="strategies-grid" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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
             <div className="mb-6 flex flex-col sm:flex-row sm:justify-between sm:items-end gap-4">
                <div>
                  <h2 className="text-2xl font-bold text-slate-100">Live Market Data</h2>
                  <p className="text-slate-400 text-sm">Real-time analysis for BTC/USDT. Monitor price action for entry triggers.</p>
                </div>
                <div className="flex gap-2">
                   <div className="text-xs font-mono text-emerald-400 bg-emerald-500/10 px-3 py-1.5 rounded border border-emerald-500/20 flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></div>
                      LONG BIAS ACTIVE
                   </div>
                </div>
             </div>
             <TradingViewWidget />
             
             <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
               <div className="bg-surface border border-slate-700 rounded-lg p-4">
                  <h3 className="text-xs font-mono text-slate-500 mb-2 uppercase">Current Price</h3>
                  <div className="text-xl font-bold text-slate-200">BTC/USDT</div>
               </div>
               <div className="bg-surface border border-slate-700 rounded-lg p-4">
                  <h3 className="text-xs font-mono text-slate-500 mb-2 uppercase">Strategy Signal</h3>
                  <div className="text-xl font-bold text-indigo-400">WAITING</div>
               </div>
               <div className="bg-surface border border-slate-700 rounded-lg p-4">
                  <h3 className="text-xs font-mono text-slate-500 mb-2 uppercase">Recommended Interval</h3>
                  <div className="text-xl font-bold text-slate-200">15m / 4h</div>
               </div>
             </div>
          </div>
        )}

        {activeView === 'calculator' && (
          <div className="max-w-3xl mx-auto animate-fadeIn">
            <RiskCalculator />
            
            <div className="mt-8 p-6 border border-slate-700 rounded-xl bg-slate-900/50">
              <h3 className="text-lg font-bold text-slate-200 mb-4">Risk Management Golden Rules</h3>
              <ul className="space-y-3 text-sm text-slate-400">
                <li className="flex gap-2">
                  <span className="text-indigo-400 font-bold">1.</span>
                  Never risk more than 1-2% of your total account on a single trade.
                </li>
                <li className="flex gap-2">
                  <span className="text-indigo-400 font-bold">2.</span>
                  Always use a Stop Loss. No exceptions.
                </li>
                <li className="flex gap-2">
                  <span className="text-indigo-400 font-bold">3.</span>
                  For Futures, verify funding rates before holding overnight.
                </li>
                <li className="flex gap-2">
                  <span className="text-indigo-400 font-bold">4.</span>
                  If you lose 15% of your account, stop the bot and re-evaluate.
                </li>
              </ul>
            </div>
          </div>
        )}

      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800 mt-12 py-8 bg-slate-900">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-slate-500 text-sm">
            Claude Trading Agent &copy; 2026. Built for Minu.
          </p>
          <div className="flex justify-center gap-4 mt-4">
            <a href="#" className="text-slate-600 hover:text-slate-400"><Github className="w-5 h-5" /></a>
          </div>
        </div>
      </footer>

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
