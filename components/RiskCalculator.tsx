import React, { useState } from 'react';
import { Calculator, AlertTriangle, ShieldCheck } from 'lucide-react';

const RiskCalculator: React.FC = () => {
  const [capital, setCapital] = useState<number>(1000);
  const [riskPercent, setRiskPercent] = useState<number>(1);
  const [stopLossPercent, setStopLossPercent] = useState<number>(2.5);
  const [leverage, setLeverage] = useState<number>(1);

  // Calculations
  const riskAmount = (capital * riskPercent) / 100;
  // Position Size = Risk Amount / Stop Loss %
  // E.g. Risk $10 with 2% SL => Position must be $500
  const positionSize = riskAmount / (stopLossPercent / 100);
  
  // Margin required = Position Size / Leverage
  const marginRequired = positionSize / leverage;
  
  // Percentage of capital used
  const capitalUsage = (marginRequired / capital) * 100;

  const isHighRisk = capitalUsage > 50;
  const isExtremeLeverage = leverage > 5;

  return (
    <div className="bg-surface rounded-xl border border-slate-700 p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 bg-blue-500/10 rounded-lg">
          <Calculator className="w-6 h-6 text-blue-400" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-slate-100">Position Size Calculator</h2>
          <p className="text-sm text-slate-400">Risk management for Futures & Spot</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Inputs */}
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-mono text-slate-400 mb-1">ACCOUNT BALANCE (USDT/EUR)</label>
            <input 
              type="number" 
              value={capital}
              onChange={(e) => setCapital(Number(e.target.value))}
              className="w-full bg-background border border-slate-700 rounded-lg px-4 py-2 text-slate-100 focus:outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-mono text-slate-400 mb-1">RISK PER TRADE (%)</label>
            <input 
              type="number" 
              step="0.1"
              value={riskPercent}
              onChange={(e) => setRiskPercent(Number(e.target.value))}
              className="w-full bg-background border border-slate-700 rounded-lg px-4 py-2 text-slate-100 focus:outline-none focus:border-blue-500"
            />
            <p className="text-[10px] text-slate-500 mt-1">Recommended: 1-2%</p>
          </div>

          <div>
            <label className="block text-xs font-mono text-slate-400 mb-1">STOP LOSS DISTANCE (%)</label>
            <input 
              type="number" 
              step="0.1"
              value={stopLossPercent}
              onChange={(e) => setStopLossPercent(Number(e.target.value))}
              className="w-full bg-background border border-slate-700 rounded-lg px-4 py-2 text-slate-100 focus:outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-mono text-slate-400 mb-1">LEVERAGE (x)</label>
            <input 
              type="number" 
              min="1"
              max="125"
              value={leverage}
              onChange={(e) => setLeverage(Number(e.target.value))}
              className={`w-full bg-background border rounded-lg px-4 py-2 text-slate-100 focus:outline-none focus:border-blue-500 ${isExtremeLeverage ? 'border-warning/50' : 'border-slate-700'}`}
            />
             {isExtremeLeverage && <p className="text-[10px] text-warning mt-1">Warning: High leverage increases liquidation risk.</p>}
          </div>
        </div>

        {/* Results */}
        <div className="bg-background rounded-xl p-5 border border-slate-700 flex flex-col justify-center">
          <div className="mb-6">
            <span className="text-sm text-slate-400 font-mono block mb-1">MAX LOSS (RISK)</span>
            <span className="text-3xl font-bold text-danger">{riskAmount.toFixed(2)} USDT</span>
          </div>

          <div className="mb-6">
            <span className="text-sm text-slate-400 font-mono block mb-1">POSITION SIZE (TOTAL)</span>
            <span className="text-3xl font-bold text-slate-100">{Math.floor(positionSize)} USDT</span>
          </div>

          <div className="p-4 bg-surface rounded-lg border border-slate-700 mb-4">
             <div className="flex justify-between items-center mb-2">
                <span className="text-xs text-slate-400">Margin Required</span>
                <span className="text-sm font-mono text-blue-400">{marginRequired.toFixed(2)} USDT</span>
             </div>
             <div className="flex justify-between items-center">
                <span className="text-xs text-slate-400">Capital Usage</span>
                <span className={`text-sm font-mono ${isHighRisk ? 'text-danger' : 'text-success'}`}>{capitalUsage.toFixed(1)}%</span>
             </div>
          </div>

          {isHighRisk ? (
            <div className="flex items-start gap-2 text-danger bg-danger/10 p-3 rounded-lg text-xs">
              <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
              <p>Warning: This trade requires more than 50% of your capital as margin. Consider reducing position size or increasing leverage carefully.</p>
            </div>
          ) : (
             <div className="flex items-start gap-2 text-success bg-success/10 p-3 rounded-lg text-xs">
              <ShieldCheck className="w-4 h-4 shrink-0 mt-0.5" />
              <p>Safe Allocation: Good risk management settings.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RiskCalculator;
