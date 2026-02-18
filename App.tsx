import React, { useState, useEffect, useRef } from 'react';
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
import { Terminal, LayoutDashboard, Calculator, Zap, Github, BookOpen, LineChart, Settings as SettingsIcon, PieChart, Menu, X, Bot, AlertTriangle, ExternalLink, RefreshCw, Copy, ExternalLink as LinkIcon } from 'lucide-react';
import { MarketType } from './services/binance';
import { FreqtradeService, BotProfit, BotTrade } from './services/freqtrade';

const App: React.FC = () => {
  const [selectedStrategy, setSelectedStrategy] = useState<Strategy | null>(null);
  const [activeView, setActiveView] = useState<'dashboard' | 'calculator' | 'chart' | 'settings' | 'statistics'>('dashboard');
  const [filter, setFilter] = useState<'All' | 'Long' | 'Short' | 'Combined'>('All');
  
  // Binance Keys state
  const [apiKey, setApiKey] = useState('');
  const [apiSecret, setApiSecret] = useState('');
  const [marketType, setMarketType] = useState<MarketType>('Futures');

  // Bot State
  const [botConfig, setBotConfig] = useState<{url: string, user: string, pass: string, skipNgrokHeader?: boolean} | null>(null);
  const [botConnected, setBotConnected] = useState(false);
  const [botError, setBotError] = useState<string | null>(null);
  const [botService, setBotService] = useState<FreqtradeService | null>(null);
  const [botProfit, setBotProfit] = useState<BotProfit | null>(null);
  const [botTrades, setBotTrades] = useState<BotTrade[] | null>(null);
  const [botBalance, setBotBalance] = useState<number | null>(null);
  const [botHistory, setBotHistory] = useState<BotTrade[]>([]);

  // Load keys on mount
  useEffect(() => {
    // Binance
    const k = localStorage.getItem('binance_api_key');
    const s = localStorage.getItem('binance_api_secret');
    const m = localStorage.getItem('binance_market_type') as MarketType;
    if (k) setApiKey(k);
    if (s) setApiSecret(s);
    if (m) setMarketType(m);

    // Bot Configuration
    let bUrl = localStorage.getItem('bot_url');
    let bUser = localStorage.getItem('bot_user');
    let bPass = localStorage.getItem('bot_pass');
    let skipHeader = localStorage.getItem('bot_skip_ngrok_header') === 'true';

    const isHttps = typeof window !== 'undefined' && window.location.protocol === 'https:';
    const isLocalConfig = !bUrl || bUrl.includes('127.0.0.1') || bUrl.includes('localhost') || bUrl.includes(':5000');
    
    // Defined Defaults
    const defaultUser = 'minu';
    const defaultPass = 'Nuamparola123@';
    const defaultUrl = 'https://emmett-telodynamic-daniele.ngrok-free.dev';

    // Auto-correct local config for HTTPS deployment or if using old defaults
    if ((isHttps && isLocalConfig) || bUser === 'freqtrader') {
        bUrl = defaultUrl;
        bUser = defaultUser;
        // If password is missing or using old default, update it
        if (!bPass) bPass = defaultPass;
        
        localStorage.setItem('bot_url', bUrl);
        localStorage.setItem('bot_user', bUser);
        // We don't save password to LS by default for security, but we use it in state
    }

    if (bUrl && bUser) {
        // Fallback for password if not in storage
        const passToUse = bPass || (bUser === defaultUser ? defaultPass : '');
        setBotConfig({ url: bUrl, user: bUser, pass: passToUse, skipNgrokHeader: skipHeader });
    } else {
        setBotConfig({ url: defaultUrl, user: defaultUser, pass: defaultPass, skipNgrokHeader: false });
    }
  }, []);

  // Initialize Bot Connection
  useEffect(() => {
    if (botConfig) {
        setBotError(null);
        const service = new FreqtradeService({
            url: botConfig.url,
            username: botConfig.user,
            password: botConfig.pass,
            skipNgrokHeader: botConfig.skipNgrokHeader
        });
        
        service.login().then(() => {
            setBotService(service);
            setBotConnected(true);
            setBotError(null);
            console.log("Bot Connected Successfully");
        }).catch(err => {
            console.error("Bot Login Failed", err);
            
            if (botConfig.url.includes('127.0.0.1') || botConfig.url.includes('localhost')) {
                const fallbackUrl = 'https://emmett-telodynamic-daniele.ngrok-free.dev';
                setBotConfig({ ...botConfig, url: fallbackUrl });
                localStorage.setItem('bot_url', fallbackUrl);
                return;
            }

            setBotConnected(false);
            setBotError(err.message || "Failed to connect to Bot");
        });
    }
  }, [botConfig]);

  // Data Polling
  useEffect(() => {
    if (!botService || !botConnected) return;

    const fetchData = async () => {
        try {
            const [profit, trades, balance, history] = await Promise.all([
                botService.getProfit(),
                botService.getStatus(),
                botService.getBalance(),
                botService.getTrades(30)
            ]);

            setBotProfit(profit);
            setBotTrades(trades);
            setBotBalance(balance.total);
            setBotHistory(history.trades);
            setBotError(null);
        } catch (e: any) {
            console.error("Bot Data Poll Failed", e);
            if (e.message && e.message.includes("Session Expired")) {
                setBotConnected(false);
                // Trigger re-login by resetting config slightly to trigger useEffect
                if (botConfig) setBotConfig({ ...botConfig });
            }
        }
    };

    fetchData();
    const interval = setInterval(fetchData, 10000);
    return () => clearInterval(interval);
  }, [botService, botConnected, botConfig]);

  const handleSaveKeys = (k: string, s: string, m: MarketType) => {
    setApiKey(k);
    setApiSecret(s);
    setMarketType(m);
  };

  const handleSaveBot = (url: string, user: string, pass: string, skipHeader?: boolean) => {
      setBotConfig({ url, user, pass, skipNgrokHeader: skipHeader });
  };

  const handleStartBot = async () => {
      if (botService) {
          try {
              await botService.start();
              alert("Bot Started");
          } catch(e: any) { alert("Error starting bot: " + e.message); }
      }
  };

  const handleStopBot = async () => {
      if (botService) {
          try {
              await botService.stop();
              alert("Bot Stopped");
          } catch(e: any) { alert("Error stopping bot: " + e.message); }
      }
  };

  const filteredStrategies = STRATEGIES.filter(s => filter === 'All' || s.type === filter);

  const navItems = [
    { id: 'dashboard', label: 'Home', icon: LayoutDashboard },
    { id: 'chart', label: 'Chart', icon: LineChart },
    { id: 'statistics', label: 'Stats', icon: PieChart },
    { id: 'calculator', label: 'Risk', icon: Calculator },
    { id: 'settings', label: 'Settings', icon: SettingsIcon },
  ];

  const copyConfigFix = () => {
      const fix = '"cors_allow_headers": ["ngrok-skip-browser-warning", "Authorization", "Content-Type"]';
      navigator.clipboard.writeText(fix);
      alert("Config line copied to clipboard!");
  };

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
            {apiKey ? 'API' : (botConnected ? 'BOT' : 'DEMO')}
         </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 py-6 md:py-8">
        
        {/* Error Alert */}
        {botError && (
            <div className="mb-6 p-5 bg-rose-500/10 border border-rose-500/20 rounded-xl flex items-start gap-4 animate-fadeIn shadow-xl">
                <AlertTriangle className="w-6 h-6 text-rose-500 shrink-0 mt-0.5" />
                <div className="flex-1">
                    <h3 className="text-base font-bold text-rose-400 mb-2">Bot Connection Error</h3>
                    <div className="text-sm text-rose-300/80 mb-5 whitespace-pre-wrap leading-relaxed font-mono bg-black/20 p-3 rounded-lg border border-rose-500/10">
                        {botError}
                    </div>
                    
                    <div className="flex flex-wrap gap-3">
                       {botError.includes("cors_allow_headers") && (
                         <button 
                           onClick={copyConfigFix}
                           className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-lg text-xs font-bold transition-all flex items-center gap-2 shadow-lg"
                         >
                           <Copy className="w-3 h-3" />
                           Copy Fix to Clipboard
                         </button>
                       )}

                       {botConfig?.url.includes('ngrok') && (
                        <a 
                          href={botConfig.url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-bold transition-all flex items-center gap-2 shadow-lg"
                        >
                          <LinkIcon className="w-3 h-3" />
                          1. Open Bot URL (Bypass)
                        </a>
                       )}

                       <button 
                         onClick={() => {
                             const url = botConfig?.url || 'https://emmett-telodynamic-daniele.ngrok-free.dev';
                             const nextSkip = !botConfig?.skipNgrokHeader;
                             handleSaveBot(url, botConfig?.user || 'minu', botConfig?.pass || 'Nuamparola123@', nextSkip);
                             localStorage.setItem('bot_skip_ngrok_header', nextSkip.toString());
                             window.location.reload();
                         }}
                         className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-bold transition-all flex items-center gap-2 shadow-lg"
                       >
                         <RefreshCw className="w-3 h-3" />
                         Retry Connection
                       </button>

                       <button 
                         onClick={() => setActiveView('settings')}
                         className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-bold transition-all flex items-center gap-2 border border-slate-700"
                       >
                         <SettingsIcon className="w-3 h-3" />
                         Check Settings
                       </button>
                    </div>
                </div>
                <button onClick={() => setBotError(null)} className="p-1 hover:bg-white/5 rounded-full text-rose-400 hover:text-rose-300">
                    <X className="w-5 h-5" />
                </button>
            </div>
        )}

        {activeView === 'dashboard' && (
          <div className="animate-fadeIn space-y-6">
            
            {botConnected && botProfit && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 animate-fadeIn">
                    <div className="bg-slate-900/50 border border-slate-700 p-4 rounded-xl">
                        <div className="text-xs text-slate-500 uppercase">Total Profit</div>
                        <div className={`text-xl font-bold ${botProfit.profit_all_coin >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                            {botProfit.profit_all_coin.toFixed(2)} USDT
                        </div>
                    </div>
                    <div className="bg-slate-900/50 border border-slate-700 p-4 rounded-xl">
                        <div className="text-xs text-slate-500 uppercase">Capital</div>
                        <div className="text-xl font-bold text-blue-400">
                            {botBalance ? botBalance.toFixed(2) : '---'} USDT
                        </div>
                    </div>
                    <div className="bg-slate-900/50 border border-slate-700 p-4 rounded-xl">
                        <div className="text-xs text-slate-500 uppercase">Win Rate</div>
                        <div className="text-xl font-bold text-indigo-400">
                            {(botProfit.winrate * 100).toFixed(1)}%
                        </div>
                    </div>
                    <div className="bg-slate-900/50 border border-slate-700 p-4 rounded-xl">
                        <div className="text-xs text-slate-500 uppercase">Total Trades</div>
                        <div className="text-xl font-bold text-slate-200">
                            {botProfit.trade_count}
                        </div>
                    </div>
                </div>
            )}

            <AgentControls onStartAuto={handleStartBot} onStopAuto={handleStopBot} isRunning={botConnected} />

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <MarketSentiment />
              <AgentLogs />
            </div>

            <div className="bg-gradient-to-r from-indigo-900/30 to-slate-900 border border-indigo-500/20 rounded-xl p-4 md:p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                  <h2 className="text-lg md:text-xl font-bold text-white mb-1">Welcome back, Minu.</h2>
                  <p className="text-indigo-200 text-xs md:text-sm hidden md:block">
                    {botConnected 
                        ? `Connected to Claude Bot (${botConfig?.url}). AI Active.` 
                        : (apiKey ? `Connected to Binance ${marketType}. Scanning for opportunities...` : 'Demo Mode Active. Connect Bot or API keys in Settings.')
                    }
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

            <OpenTrades 
                apiKey={apiKey} 
                apiSecret={apiSecret} 
                marketType={marketType} 
                externalTrades={botTrades || undefined} 
            />

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

            <div id="strategies-grid" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
              {filteredStrategies.map(strategy => (
                <StrategyCard 
                  key={strategy.id} 
                  strategy={strategy} 
                  onClick={setSelectedStrategy} 
                />
              ))}
            </div>
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
          </div>
        )}

        {activeView === 'statistics' && (
          <Statistics botTrades={botHistory} />
        )}

        {activeView === 'calculator' && (
          <div className="max-w-3xl mx-auto animate-fadeIn">
            <RiskCalculator />
          </div>
        )}

        {activeView === 'settings' && (
          <Settings 
            onSave={handleSaveKeys} 
            onSaveBot={handleSaveBot}
            hasKeys={!!apiKey || !!botConfig} 
          />
        )}

      </main>

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