import React, { useMemo } from 'react';
import { STRATEGIES } from '../constants';
import { BarChart3, TrendingUp, TrendingDown, Activity, Calendar, DollarSign, Percent } from 'lucide-react';
import { BotTrade } from '../services/freqtrade';

interface StatisticsProps {
  botTrades?: BotTrade[];
}

const Statistics: React.FC<StatisticsProps> = ({ botTrades }) => {
  
  // Calculate Daily P&L from real bot trades if available
  const dailyStats = useMemo(() => {
    if (!botTrades || botTrades.length === 0) return null;

    const stats: Record<string, number> = {};
    botTrades.forEach(t => {
      if (!t.close_date) return;
      // Format: YYYY-MM-DD
      const day = t.close_date.split('T')[0] || t.close_date.split(' ')[0]; 
      stats[day] = (stats[day] || 0) + (t.profit_abs || 0);
    });

    const sortedDays = Object.keys(stats).sort();
    const last7Days = sortedDays.slice(-7); // Last 7 days

    return last7Days.map(day => ({
      day: day.slice(5), // MM-DD
      val: stats[day],
      fullDate: day
    }));
  }, [botTrades]);

  // Fallback data for demo mode
  const demoDailyStats = [
    { day: 'Mon', val: 40, fullDate: 'Monday' },
    { day: 'Tue', val: -20, fullDate: 'Tuesday' },
    { day: 'Wed', val: 65, fullDate: 'Wednesday' },
    { day: 'Thu', val: 30, fullDate: 'Thursday' },
    { day: 'Fri', val: -15, fullDate: 'Friday' },
    { day: 'Sat', val: 55, fullDate: 'Saturday' },
    { day: 'Sun', val: 45, fullDate: 'Sunday' },
  ];

  const chartData = dailyStats || demoDailyStats;
  
  // Find max value for scaling bar height
  const maxVal = Math.max(...chartData.map(d => Math.abs(d.val))) || 1;

  // Helper to parse "55-65%" into a number (e.g., 60) for Strategy Progress bars
  const getWinRateValue = (rateStr: string) => {
    const nums = rateStr.match(/\d+/g);
    if (!nums) return 0;
    if (nums.length === 2) {
      return (parseInt(nums[0]) + parseInt(nums[1])) / 2;
    }
    return parseInt(nums[0]);
  };

  const sortedStrategies = [...STRATEGIES].sort((a, b) => 
    getWinRateValue(b.winRate) - getWinRateValue(a.winRate)
  );

  return (
    <div className="animate-fadeIn space-y-6">
      
      {/* KPI Cards (Static or calculated could go here, but main ones are on Dashboard) */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-surface border border-slate-700 p-4 md:p-5 rounded-xl">
          <div className="text-[10px] md:text-xs font-mono text-slate-500 uppercase tracking-wider mb-2">Avg Trade</div>
          <div className="text-xl md:text-2xl font-bold text-emerald-400 flex flex-wrap items-end gap-2">
            <DollarSign className="w-5 h-5 mb-1" />
            {dailyStats ? (chartData.reduce((acc, curr) => acc + curr.val, 0) / (chartData.length || 1)).toFixed(2) : '1.25'}
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
        
        {/* Dynamic P&L History Chart */}
        <div className="bg-surface border border-slate-700 rounded-xl p-4 md:p-6 flex flex-col h-[300px] md:h-auto">
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-base md:text-lg font-bold text-slate-100 flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-blue-400" />
                    Daily Profit
                </h3>
                <span className="text-xs text-slate-500 font-mono">Last {chartData.length} Days</span>
            </div>
            
            <div className="flex-1 flex items-end justify-between gap-2 md:gap-4 px-2 pb-2 h-40 md:h-48">
                {chartData.length === 0 ? (
                    <div className="w-full h-full flex items-center justify-center text-slate-500 text-sm">
                        No closed trades history available.
                    </div>
                ) : (
                    chartData.map((item, i) => (
                        <div key={i} className="flex-1 flex flex-col items-center gap-2 group relative">
                            {/* Tooltip */}
                            <div className={`absolute bottom-full mb-2 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap bg-slate-800 text-xs px-2 py-1 rounded border border-slate-700 z-10 font-mono ${item.val >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                                {item.val > 0 ? '+' : ''}{item.val.toFixed(2)} USDT
                            </div>
                            
                            {/* Bar */}
                            <div 
                                className={`w-full rounded-t-sm transition-all duration-500 ${item.val >= 0 ? 'bg-emerald-500 hover:bg-emerald-400' : 'bg-rose-500 hover:bg-rose-400'}`}
                                style={{ 
                                    height: `${Math.max(5, (Math.abs(item.val) / maxVal) * 100)}%`, 
                                    minHeight: '4px' 
                                }}
                            ></div>
                            
                            {/* Label */}
                            <div className="text-[10px] md:text-xs text-slate-500 font-mono truncate w-full text-center">
                                {item.day}
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>

        {/* Win Rate Bar Chart */}
        <div className="bg-surface border border-slate-700 rounded-xl p-4 md:p-6">
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-base md:text-lg font-bold text-slate-100 flex items-center gap-2">
                    <BarChart3 className="w-5 h-5 text-blue-400" />
                    Strategy Performance
                </h3>
            </div>
            
            <div className="space-y-5">
                {sortedStrategies.map(strat => {
                    const val = getWinRateValue(strat.winRate);
                    
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

      </div>
    </div>
  );
};

export default Statistics;