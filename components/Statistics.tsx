import React from 'react';
import { STRATEGIES } from '../constants';
import { BarChart3, TrendingUp, TrendingDown, Activity, PieChart, Calendar, ArrowUpRight } from 'lucide-react';

const Statistics: React.FC = () => {
  // Helper to parse "55-65%" into a number (e.g., 60)
  const getWinRateValue = (rateStr: string) => {
    const nums = rateStr.match(/\d+/g);
    if (!nums) return 0;
    if (nums.length === 2) {
      return (parseInt(nums[0]) + parseInt(nums[1])) / 2;
    }
    return parseInt(nums[0]);
  };

  // Sort strategies by efficiency for better visualization
  const sortedStrategies = [...STRATEGIES].sort((a, b) => 
    getWinRateValue(b.winRate) - getWinRateValue(a.winRate)
  );

  return (
    <div className="animate-fadeIn space-y-6">
      
      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-surface border border-slate-700 p-4 md:p-5 rounded-xl">
          <div className="text-[10px] md:text-xs font-mono text-slate-500 uppercase tracking-wider mb-2">Total Profit</div>
          <div className="text-xl md:text-2xl font-bold text-emerald-400 flex flex-wrap items-end gap-2">
            +€47.32 <span className="text-xs text-emerald-500/70 mb-1">(+4.73%)</span>
          </div>
        </div>
        <div className="bg-surface border border-slate-700 p-4 md:p-5 rounded-xl">
          <div className="text-[10px] md:text-xs font-mono text-slate-500 uppercase tracking-wider mb-2">Profit Factor</div>
          <div className="text-xl md:text-2xl font-bold text-blue-400">1.84</div>
        </div>
        <div className="bg-surface border border-slate-700 p-4 md:p-5 rounded-xl">
          <div className="text-[10px] md:text-xs font-mono text-slate-500 uppercase tracking-wider mb-2">Sharpe Ratio</div>
          <div className="text-xl md:text-2xl font-bold text-indigo-400">1.62</div>
        </div>
        <div className="bg-surface border border-slate-700 p-4 md:p-5 rounded-xl">
          <div className="text-[10px] md:text-xs font-mono text-slate-500 uppercase tracking-wider mb-2">Max Drawdown</div>
          <div className="text-xl md:text-2xl font-bold text-rose-400">-8.2%</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Win Rate Bar Chart */}
        <div className="bg-surface border border-slate-700 rounded-xl p-4 md:p-6">
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-base md:text-lg font-bold text-slate-100 flex items-center gap-2">
                    <BarChart3 className="w-5 h-5 text-blue-400" />
                    Strategy Win Rates
                </h3>
                <span className="text-[10px] md:text-xs text-slate-500 font-mono">AVG</span>
            </div>
            
            <div className="space-y-5">
                {sortedStrategies.map(strat => {
                    const val = getWinRateValue(strat.winRate);
                    
                    // Determine styling based on type
                    let colorClass = 'bg-indigo-500';
                    let textClass = 'text-indigo-400';
                    let icon = <Activity className="w-3 h-3" />;
                    
                    if (strat.type === 'Long') {
                        colorClass = 'bg-emerald-500';
                        textClass = 'text-emerald-400';
                        icon = <TrendingUp className="w-3 h-3" />;
                    } else if (strat.type === 'Short') {
                        colorClass = 'bg-rose-500';
                        textClass = 'text-rose-400';
                        icon = <TrendingDown className="w-3 h-3" />;
                    }

                    return (
                        <div key={strat.id} className="group">
                            <div className="flex justify-between text-xs font-mono mb-1.5">
                                <span className="text-slate-300 flex items-center gap-2 group-hover:text-white transition-colors">
                                    <span className={`p-1 rounded ${strat.type === 'Long' ? 'bg-emerald-500/10' : strat.type === 'Short' ? 'bg-rose-500/10' : 'bg-indigo-500/10'} ${textClass}`}>
                                        {icon}
                                    </span>
                                    {strat.name}
                                </span>
                                <span className={`${textClass} font-bold`}>{val}%</span>
                            </div>
                            <div className="w-full bg-slate-800 rounded-full h-2.5 overflow-hidden border border-slate-700/50">
                                <div 
                                    className={`h-full rounded-full ${colorClass} transition-all duration-1000 group-hover:brightness-110 shadow-[0_0_10px_rgba(0,0,0,0.3)]`} 
                                    style={{ width: `${val}%` }} 
                                />
                            </div>
                        </div>
                    )
                })}
            </div>
        </div>

        {/* P&L History (Placeholder visual) */}
        <div className="bg-surface border border-slate-700 rounded-xl p-4 md:p-6 flex flex-col h-[300px] md:h-auto">
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-base md:text-lg font-bold text-slate-100 flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-blue-400" />
                    Daily P&L
                </h3>
            </div>
            
            <div className="flex-1 flex items-end justify-between gap-2 md:gap-4 px-2 pb-2">
                {[
                    { day: 'Mon', val: 40, label: '+€8.2' },
                    { day: 'Tue', val: -20, label: '-€3.5' },
                    { day: 'Wed', val: 65, label: '+€11.1' },
                    { day: 'Thu', val: 30, label: '+€6.2' },
                    { day: 'Fri', val: -15, label: '-€2.1' },
                    { day: 'Sat', val: 55, label: '+€9.7' },
                    { day: 'Sun', val: 45, label: '+€7.5' },
                ].map((item, i) => (
                    <div key={i} className="flex-1 flex flex-col items-center gap-2 group">
                        <div className={`text-[10px] font-bold opacity-0 group-hover:opacity-100 transition-opacity ${item.val > 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                            {item.label}
                        </div>
                        <div 
                            className={`w-full rounded-t-sm transition-all duration-500 ${item.val > 0 ? 'bg-emerald-500 hover:bg-emerald-400' : 'bg-rose-500 hover:bg-rose-400'}`}
                            style={{ height: `${Math.abs(item.val)}%`, minHeight: '4px' }}
                        ></div>
                        <div className="text-[10px] md:text-xs text-slate-500 font-mono">{item.day.charAt(0)}</div>
                    </div>
                ))}
            </div>
        </div>

      </div>
    </div>
  );
};

export default Statistics;