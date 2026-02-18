import React, { useState, useEffect } from 'react';
import { Save, Shield, Key, CheckCircle, AlertTriangle, X, AlertOctagon } from 'lucide-react';

interface SettingsProps {
  onSave: (key: string, secret: string, market: 'Futures' | 'Spot') => void;
  hasKeys: boolean;
}

const Settings: React.FC<SettingsProps> = ({ onSave, hasKeys }) => {
  const [apiKey, setApiKey] = useState('');
  const [apiSecret, setApiSecret] = useState('');
  const [market, setMarket] = useState<'Futures' | 'Spot'>('Futures');
  const [showSecret, setShowSecret] = useState(false);
  
  // UI States
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [toast, setToast] = useState<{message: string, type: 'success' | 'error'} | null>(null);

  useEffect(() => {
    const storedKey = localStorage.getItem('binance_api_key');
    const storedSecret = localStorage.getItem('binance_api_secret');
    const storedMarket = localStorage.getItem('binance_market_type') as 'Futures' | 'Spot';
    
    if (storedKey) setApiKey(storedKey);
    if (storedSecret) setApiSecret(storedSecret);
    if (storedMarket) setMarket(storedMarket);
  }, []);

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleSaveClick = () => {
    if (!apiKey || !apiSecret) {
      showToast("Please enter both API Key and Secret.", 'error');
      return;
    }
    setShowConfirmModal(true);
  };

  const confirmSave = () => {
    try {
      localStorage.setItem('binance_api_key', apiKey);
      localStorage.setItem('binance_api_secret', apiSecret);
      localStorage.setItem('binance_market_type', market);
      onSave(apiKey, apiSecret, market);
      setShowConfirmModal(false);
      showToast(`Keys saved! Connected to Binance ${market}.`, 'success');
    } catch (e) {
      showToast("Failed to save settings.", 'error');
    }
  };

  const handleClear = () => {
    if (confirm("Are you sure you want to remove your API keys?")) {
      localStorage.removeItem('binance_api_key');
      localStorage.removeItem('binance_api_secret');
      setApiKey('');
      setApiSecret('');
      onSave('', '', 'Futures');
      showToast("API Credentials removed.", 'success');
    }
  };

  return (
    <div className="max-w-2xl mx-auto animate-fadeIn mt-4 md:mt-8 relative mb-24 md:mb-0">
      
      {/* Toast Notification */}
      {toast && (
        <div className={`fixed bottom-20 md:bottom-8 right-4 md:right-8 z-50 px-6 py-4 rounded-lg shadow-2xl border flex items-center gap-3 animate-bounce-in max-w-[90vw] ${
          toast.type === 'success' 
            ? 'bg-slate-900 border-emerald-500 text-emerald-400' 
            : 'bg-slate-900 border-rose-500 text-rose-400'
        }`}>
          {toast.type === 'success' ? <CheckCircle className="w-5 h-5 shrink-0" /> : <AlertOctagon className="w-5 h-5 shrink-0" />}
          <span className="font-medium text-sm">{toast.message}</span>
          <button onClick={() => setToast(null)} className="ml-auto opacity-50 hover:opacity-100 p-1">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center bg-black/80 backdrop-blur-sm p-4 pb-24 md:pb-4">
          <div className="bg-surface border border-slate-700 rounded-xl max-w-md w-full p-6 shadow-2xl transform scale-100 animate-fadeIn">
            <div className="flex items-center gap-3 mb-4 text-amber-400">
              <div className="p-3 bg-amber-500/10 rounded-full">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-slate-100">Confirm Security</h3>
            </div>
            
            <p className="text-slate-400 text-sm mb-6 leading-relaxed">
              You are about to save API credentials to your browser's local storage. 
              <br/><br/>
              Please confirm that:
              <ul className="list-disc pl-5 mt-2 space-y-1 text-slate-300">
                <li>You are on a trusted, private device.</li>
                <li>Your API keys have <strong>Withdrawals Disabled</strong>.</li>
              </ul>
            </p>

            <div className="flex flex-col md:flex-row gap-3 justify-end">
              <button 
                onClick={() => setShowConfirmModal(false)}
                className="px-4 py-3 md:py-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors order-2 md:order-1"
              >
                Cancel
              </button>
              <button 
                onClick={confirmSave}
                className="px-4 py-3 md:py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-bold shadow-lg shadow-indigo-500/20 order-1 md:order-2"
              >
                Confirm & Save
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="bg-surface border border-slate-700 rounded-xl p-5 md:p-8 shadow-xl">
        <div className="flex items-center gap-4 mb-6 pb-6 border-b border-slate-700">
          <div className="p-3 bg-indigo-500/10 rounded-lg border border-indigo-500/20">
            <Shield className="w-8 h-8 text-indigo-400" />
          </div>
          <div>
            <h2 className="text-xl md:text-2xl font-bold text-slate-100">Configuration</h2>
            <p className="text-xs md:text-sm text-slate-400">Setup your Trading Agent</p>
          </div>
        </div>

        <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-lg p-4 mb-6 flex gap-3">
          <CheckCircle className="w-5 h-5 text-emerald-500 shrink-0" />
          <div className="text-xs md:text-sm text-emerald-200">
             Ensure "Enable Withdrawals" is <strong>UNCHECKED</strong> in Binance.
          </div>
        </div>

        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Market Type
            </label>
            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => setMarket('Futures')}
                className={`p-3 md:p-4 rounded-lg border text-sm font-bold transition-all ${
                  market === 'Futures' 
                  ? 'bg-blue-500/20 border-blue-500 text-blue-400' 
                  : 'bg-slate-900 border-slate-700 text-slate-500 hover:border-slate-500'
                }`}
              >
                Futures
              </button>
              <button
                onClick={() => setMarket('Spot')}
                className={`p-3 md:p-4 rounded-lg border text-sm font-bold transition-all ${
                  market === 'Spot' 
                  ? 'bg-purple-500/20 border-purple-500 text-purple-400' 
                  : 'bg-slate-900 border-slate-700 text-slate-500 hover:border-slate-500'
                }`}
              >
                Spot
              </button>
            </div>
            {market === 'Spot' && (
              <p className="text-xs text-amber-400 mt-2 flex items-center gap-1">
                <AlertTriangle className="w-3 h-3" />
                Short strategies disabled in Spot.
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              API Key
            </label>
            <div className="relative">
              <Key className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input 
                type="text" 
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg py-3 md:py-3 pl-10 pr-4 text-slate-200 focus:border-indigo-500 focus:outline-none font-mono text-base md:text-sm"
                placeholder="Paste API Key"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              API Secret
            </label>
            <div className="relative">
              <Key className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input 
                type={showSecret ? "text" : "password"}
                value={apiSecret}
                onChange={(e) => setApiSecret(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg py-3 md:py-3 pl-10 pr-12 text-slate-200 focus:border-indigo-500 focus:outline-none font-mono text-base md:text-sm"
                placeholder="Paste API Secret"
              />
              <button 
                onClick={() => setShowSecret(!showSecret)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] md:text-xs text-indigo-400 hover:text-indigo-300 font-bold uppercase p-1"
              >
                {showSecret ? "HIDE" : "SHOW"}
              </button>
            </div>
          </div>

          <div className="flex flex-col md:flex-row gap-4 pt-4">
            <button 
              onClick={handleSaveClick}
              className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white py-4 md:py-3 rounded-lg font-bold transition-all shadow-lg shadow-indigo-900/50 flex items-center justify-center gap-2 text-base md:text-sm"
            >
              <Save className="w-4 h-4" /> Save Configuration
            </button>
            
            {hasKeys && (
              <button 
                onClick={handleClear}
                className="px-6 py-4 md:py-3 border border-slate-700 hover:bg-rose-500/10 hover:border-rose-500/50 text-slate-400 hover:text-rose-400 rounded-lg transition-colors text-base md:text-sm"
              >
                Clear Keys
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;