import React, { useState, useEffect } from 'react';
import { Save, Shield, Key, CheckCircle, AlertTriangle, X, AlertOctagon, Bot, ToggleLeft, ToggleRight, Copy, Terminal } from 'lucide-react';

interface SettingsProps {
  onSave: (key: string, secret: string, market: 'Futures' | 'Spot') => void;
  onSaveBot: (url: string, user: string, pass: string, skipHeader?: boolean) => void;
  hasKeys: boolean;
}

const Settings: React.FC<SettingsProps> = ({ onSave, onSaveBot, hasKeys }) => {
  const [apiKey, setApiKey] = useState('');
  const [apiSecret, setApiSecret] = useState('');
  const [market, setMarket] = useState<'Futures' | 'Spot'>('Futures');
  const [botUrl, setBotUrl] = useState('https://emmett-telodynamic-daniele.ngrok-free.dev');
  const [botUser, setBotUser] = useState('minu');
  const [botPass, setBotPass] = useState('Nuamparola123@');
  const [skipNgrokHeader, setSkipNgrokHeader] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [toast, setToast] = useState<{message: string, type: 'success' | 'error'} | null>(null);

  useEffect(() => {
    const storedKey = localStorage.getItem('binance_api_key');
    const storedSecret = localStorage.getItem('binance_api_secret');
    const storedMarket = localStorage.getItem('binance_market_type') as 'Futures' | 'Spot';
    if (storedKey) setApiKey(storedKey);
    if (storedSecret) setApiSecret(storedSecret);
    if (storedMarket) setMarket(storedMarket);

    const storedBotUrl = localStorage.getItem('bot_url');
    const storedBotUser = localStorage.getItem('bot_user');
    const storedBotPass = localStorage.getItem('bot_pass');
    const storedSkipHeader = localStorage.getItem('bot_skip_ngrok_header') === 'true';
    if (storedBotUrl) setBotUrl(storedBotUrl);
    if (storedBotUser) setBotUser(storedBotUser);
    if (storedBotPass) setBotPass(storedBotPass);
    setSkipNgrokHeader(storedSkipHeader);
  }, []);

  const copyConfigFix = () => {
    const fix = `"cors_allow_headers": ["ngrok-skip-browser-warning", "Authorization", "Content-Type"]`;
    navigator.clipboard.writeText(fix);
    showToast("Config line copied!", "success");
  };

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const confirmSave = () => {
    try {
      localStorage.setItem('binance_api_key', apiKey);
      localStorage.setItem('binance_api_secret', apiSecret);
      localStorage.setItem('binance_market_type', market);
      localStorage.setItem('bot_url', botUrl);
      localStorage.setItem('bot_user', botUser);
      localStorage.setItem('bot_pass', botPass);
      localStorage.setItem('bot_skip_ngrok_header', skipNgrokHeader.toString());
      
      onSave(apiKey, apiSecret, market);
      onSaveBot(botUrl, botUser, botPass, skipNgrokHeader);
      setShowConfirmModal(false);
      showToast(`Settings saved successfully.`, 'success');
    } catch (e) {
      showToast("Failed to save settings.", 'error');
    }
  };

  return (
    <div className="max-w-2xl mx-auto animate-fadeIn mt-4 md:mt-8 relative mb-24 md:mb-0 pb-10">
      
      {toast && (
        <div className={`fixed bottom-20 md:bottom-8 right-4 md:right-8 z-50 px-6 py-4 rounded-lg shadow-2xl border flex items-center gap-3 animate-bounce-in max-w-[90vw] ${
          toast.type === 'success' ? 'bg-slate-900 border-emerald-500 text-emerald-400' : 'bg-slate-900 border-rose-500 text-rose-400'
        }`}>
          {toast.type === 'success' ? <CheckCircle className="w-5 h-5 shrink-0" /> : <AlertOctagon className="w-5 h-5 shrink-0" />}
          <span className="font-medium text-sm">{toast.message}</span>
        </div>
      )}

      {showConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-surface border border-slate-700 rounded-xl max-w-md w-full p-6 shadow-2xl">
            <h3 className="text-xl font-bold text-slate-100 mb-4 flex items-center gap-2">
              <Shield className="text-amber-400" /> Confirm Security
            </h3>
            <p className="text-slate-400 text-sm mb-6">Credentials will be saved to local storage. Use with caution.</p>
            <div className="flex gap-3 justify-end">
              <button onClick={() => setShowConfirmModal(false)} className="px-4 py-2 text-slate-400 hover:text-white">Cancel</button>
              <button onClick={confirmSave} className="px-6 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-lg">Save</button>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-6">
        {/* Bot Config */}
        <div className="bg-surface border border-slate-700 rounded-xl p-6 md:p-8 shadow-xl">
          <div className="flex items-center gap-4 mb-6 pb-6 border-b border-slate-700">
             <div className="p-3 bg-blue-500/10 rounded-lg border border-blue-500/20">
               <Bot className="w-8 h-8 text-blue-400" />
             </div>
             <div>
               <h2 className="text-2xl font-bold text-slate-100">Bot Connection</h2>
               <p className="text-sm text-slate-400">Manage Freqtrade API connection</p>
             </div>
          </div>

          <div className="space-y-6">
             <div>
               <label className="block text-sm font-medium text-slate-300 mb-2 uppercase tracking-wider font-mono">Bot API URL</label>
               <input 
                 type="text" 
                 value={botUrl}
                 onChange={(e) => setBotUrl(e.target.value)}
                 className="w-full bg-slate-900 border border-slate-700 rounded-lg py-3 px-4 text-slate-200 focus:outline-none focus:border-blue-500 font-mono text-sm"
                 placeholder="https://your-ngrok-url.ngrok-free.dev"
               />
             </div>

             <div className="flex items-center justify-between p-4 bg-slate-900/50 rounded-lg border border-slate-700">
                <div>
                   <div className="text-sm font-bold text-slate-200 flex items-center gap-2">
                     Skip Ngrok Header
                     <span className="text-[10px] bg-indigo-500/20 text-indigo-400 px-1.5 py-0.5 rounded border border-indigo-500/20">RECOMMENDED</span>
                   </div>
                   <div className="text-[10px] text-slate-500 mt-1">Enable to bypass the Ngrok landing page automatically.</div>
                </div>
                <button onClick={() => setSkipNgrokHeader(!skipNgrokHeader)} className="text-indigo-400">
                   {skipNgrokHeader ? <ToggleRight className="w-10 h-10" /> : <ToggleLeft className="w-10 h-10 text-slate-600" />}
                </button>
             </div>

             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2 uppercase tracking-wider font-mono">User</label>
                  <input type="text" value={botUser} onChange={(e) => setBotUser(e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded-lg py-3 px-4 text-slate-200 font-mono text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2 uppercase tracking-wider font-mono">Password</label>
                  <input type="password" value={botPass} onChange={(e) => setBotPass(e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded-lg py-3 px-4 text-slate-200 font-mono text-sm" />
                </div>
             </div>
          </div>
        </div>

        {/* CORS Troubleshooting */}
        <div className="bg-slate-900/50 border border-amber-500/20 rounded-xl p-6">
          <h3 className="text-sm font-bold text-amber-400 mb-4 flex items-center gap-2 uppercase tracking-widest">
            <Terminal className="w-4 h-4" /> CORS Troubleshooting
          </h3>
          <p className="text-xs text-slate-400 mb-4 leading-relaxed">
            If you get "CORS/Preflight Rejected", your bot is blocking the connection. You MUST add the following line to your bot's 
            <span className="text-slate-200 font-mono"> config.json </span> under <span className="text-slate-200 font-mono">"api_server"</span>:
          </p>
          <div className="bg-black/40 rounded-lg p-3 border border-slate-700 group relative">
             <pre className="text-[10px] md:text-xs text-indigo-300 font-mono overflow-x-auto whitespace-pre-wrap">
               {`"cors_allow_headers": [\n  "ngrok-skip-browser-warning",\n  "Authorization",\n  "Content-Type"\n]`}
             </pre>
             <button 
               onClick={copyConfigFix}
               className="absolute top-2 right-2 p-1.5 bg-slate-800 hover:bg-slate-700 rounded text-slate-400 transition-colors"
             >
               <Copy className="w-3.5 h-3.5" />
             </button>
          </div>
        </div>

        {/* Binance Config */}
        <div className="bg-surface border border-slate-700 rounded-xl p-6 md:p-8 shadow-xl">
          <div className="flex items-center gap-4 mb-6 pb-6 border-b border-slate-700">
            <div className="p-3 bg-indigo-500/10 rounded-lg border border-indigo-500/20">
              <Shield className="w-8 h-8 text-indigo-400" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-slate-100">Binance API</h2>
              <p className="text-sm text-slate-400">Optional: View balances directly from exchange</p>
            </div>
          </div>

          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <button onClick={() => setMarket('Futures')} className={`p-4 rounded-xl border text-sm font-bold transition-all ${market === 'Futures' ? 'bg-indigo-600 border-indigo-400 text-white' : 'bg-slate-900 border-slate-700 text-slate-500 hover:border-slate-500'}`}>Futures</button>
              <button onClick={() => setMarket('Spot')} className={`p-4 rounded-xl border text-sm font-bold transition-all ${market === 'Spot' ? 'bg-purple-600 border-purple-400 text-white' : 'bg-slate-900 border-slate-700 text-slate-500 hover:border-slate-500'}`}>Spot</button>
            </div>
            <input type="text" value={apiKey} onChange={(e) => setApiKey(e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded-lg py-3 px-4 text-slate-200 font-mono text-sm" placeholder="Binance API Key" />
            <input type="password" value={apiSecret} onChange={(e) => setApiSecret(e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded-lg py-3 px-4 text-slate-200 font-mono text-sm" placeholder="Binance API Secret" />
          </div>
        </div>

        <button onClick={() => setShowConfirmModal(true)} className="w-full bg-indigo-600 hover:bg-indigo-500 text-white py-4 rounded-xl font-bold shadow-lg shadow-indigo-900/20 flex items-center justify-center gap-2 transition-all transform hover:-translate-y-0.5 active:translate-y-0">
          <Save className="w-5 h-5" /> Save All Settings
        </button>
      </div>
    </div>
  );
};

export default Settings;