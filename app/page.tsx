import { getDashboardMetrics, getRecentActivity } from '../lib/dashboard';
import { format } from 'date-fns';

export const dynamic = 'force-dynamic';

export default async function Dashboard() {
  try {
    const metrics = await getDashboardMetrics();
    const activity = await getRecentActivity(6);

    return (
      <div className="space-y-8">
        {/* Metrics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="glass-effect bg-slate-900/40 p-6 rounded-2xl relative overflow-hidden group hover:scale-[1.02] transition-all">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
              <span className="material-symbols-outlined text-6xl text-primary">payments</span>
            </div>
            <div className="flex flex-col gap-1 relative z-10">
              <span className="text-sm font-medium text-slate-400">Cash on Hand</span>
              <h3 className="text-3xl font-bold tracking-tight text-slate-100">${metrics.cash.toLocaleString()}</h3>
              <div className="mt-4 flex items-center gap-2 text-emerald-accent font-semibold text-sm">
                <span className="material-symbols-outlined text-sm">trending_up</span>
                <span>+2.4% vs last week</span>
              </div>
            </div>
          </div>

          <div className="glass-effect bg-slate-900/40 p-6 rounded-2xl relative overflow-hidden group hover:scale-[1.02] transition-all">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
              <span className="material-symbols-outlined text-6xl text-emerald-accent">account_balance_wallet</span>
            </div>
            <div className="flex flex-col gap-1 relative z-10">
              <span className="text-sm font-medium text-slate-400">Net Profit</span>
              <h3 className={`text-3xl font-bold tracking-tight text-slate-100 ${metrics.netProfit < 0 ? 'text-rose-accent' : ''}`}>
                {metrics.netProfit < 0 ? '-' : '+'}${Math.abs(metrics.netProfit).toLocaleString()}
              </h3>
              <div className="mt-4 flex items-center gap-2 font-semibold text-sm">
                <div className="flex gap-3">
                  <small className="text-slate-400">Inc: <span className="text-emerald-accent">${metrics.income.toLocaleString()}</span></small>
                  <small className="text-slate-400">Exp: <span className="text-rose-accent">${metrics.expenses.toLocaleString()}</span></small>
                </div>
              </div>
            </div>
          </div>

          <div className="glass-effect bg-slate-900/40 p-6 rounded-2xl relative overflow-hidden group hover:scale-[1.02] transition-all">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
              <span className="material-symbols-outlined text-6xl text-blue-accent">receipt_long</span>
            </div>
            <div className="flex flex-col gap-1 relative z-10">
              <span className="text-sm font-medium text-slate-400">Accounts Receivable</span>
              <h3 className="text-3xl font-bold tracking-tight text-slate-100">${metrics.accountsReceivable.toLocaleString()}</h3>
              <div className="mt-4 flex items-center gap-2 text-slate-500 font-semibold text-sm">
                <span>Pending Invoices</span>
              </div>
            </div>
          </div>

          <div className="glass-effect bg-slate-900/40 p-6 rounded-2xl relative overflow-hidden group hover:scale-[1.02] transition-all">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
              <span className="material-symbols-outlined text-6xl text-amber-accent">pending_actions</span>
            </div>
            <div className="flex flex-col gap-1 relative z-10">
              <span className="text-sm font-medium text-slate-400">Accounts Payable</span>
              <h3 className="text-3xl font-bold tracking-tight text-slate-100">${metrics.accountsPayable.toLocaleString()}</h3>
              <div className="mt-4 flex items-center gap-2 text-amber-accent font-semibold text-sm">
                <span>Upcoming Bills</span>
              </div>
            </div>
          </div>
        </div>

        {/* Chart and Activity Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 glass-effect bg-slate-900/40 p-8 rounded-2xl">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h3 className="text-xl font-bold text-slate-100">Revenue Flow</h3>
                <p className="text-sm text-slate-400">Financial performance visualization</p>
              </div>
              <div className="flex bg-slate-800/60 p-1 rounded-lg">
                <button className="px-4 py-1.5 text-xs font-bold rounded-md bg-primary text-white shadow-sm">6 Months</button>
              </div>
            </div>
            <div className="h-64 w-full relative">
              <svg className="w-full h-full" preserveAspectRatio="none" viewBox="0 0 1000 300">
                <defs>
                  <linearGradient id="chartGradientRevenue" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="0%" stopColor="#135bec" stopOpacity="0.3"></stop>
                    <stop offset="100%" stopColor="#135bec" stopOpacity="0"></stop>
                  </linearGradient>
                </defs>
                <line stroke="#334155" strokeDasharray="4" strokeWidth="0.5" x1="0" x2="1000" y1="50" y2="50"></line>
                <line stroke="#334155" strokeDasharray="4" strokeWidth="0.5" x1="0" x2="1000" y1="125" y2="125"></line>
                <line stroke="#334155" strokeDasharray="4" strokeWidth="0.5" x1="0" x2="1000" y1="200" y2="200"></line>
                <line stroke="#334155" strokeDasharray="4" strokeWidth="0.5" x1="0" x2="1000" y1="275" y2="275"></line>
                <path d="M0,275 Q100,200 200,240 T400,100 T600,180 T800,80 T1000,120 L1000,300 L0,300 Z" fill="url(#chartGradientRevenue)"></path>
                <path d="M0,275 Q100,200 200,240 T400,100 T600,180 T800,80 T1000,120" fill="none" stroke="#135bec" strokeLinecap="round" strokeWidth="4"></path>
              </svg>
              <div className="flex justify-between mt-4 px-2">
                <span className="text-[10px] font-bold text-slate-500 uppercase">Jan</span>
                <span className="text-[10px] font-bold text-slate-500 uppercase">Feb</span>
                <span className="text-[10px] font-bold text-slate-500 uppercase">Mar</span>
                <span className="text-[10px] font-bold text-slate-500 uppercase">Apr</span>
                <span className="text-[10px] font-bold text-slate-500 uppercase">May</span>
                <span className="text-[10px] font-bold text-slate-500 uppercase">Jun</span>
              </div>
            </div>
          </div>

          <div className="glass-effect bg-slate-900/40 p-8 rounded-2xl flex flex-col">
            <h3 className="text-xl font-bold text-slate-100 mb-6">Liquidity Stats</h3>
            <div className="space-y-6 flex-1">
              <div className="flex items-center justify-between">
                <span className="text-slate-400 text-sm">Working Capital</span>
                <span className="text-emerald-accent font-bold">$42.5k</span>
              </div>
              <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                <div className="bg-emerald-accent h-full w-[75%]"></div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400 text-sm">AR Turnover</span>
                <span className="text-primary font-bold">12.4x</span>
              </div>
              <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                <div className="bg-primary h-full w-[60%]"></div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400 text-sm">Burn Rate</span>
                <span className="text-rose-accent font-bold">$8.2k</span>
              </div>
              <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                <div className="bg-rose-accent h-full w-[30%]"></div>
              </div>
            </div>
            <button className="mt-8 w-full py-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all font-bold text-sm">
              Download Report
            </button>
          </div>
        </div>

        {/* Recent Activity Table */}
        <div className="glass-effect bg-slate-900/40 rounded-2xl overflow-hidden">
          <div className="px-8 py-6 border-b border-white/5 flex items-center justify-between">
            <h3 className="text-xl font-bold text-slate-100">Recent Transactions</h3>
            <button className="text-primary text-sm font-bold hover:underline">View All</button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="text-slate-500 text-xs font-bold uppercase tracking-widest border-b border-white/5">
                  <th className="px-8 py-4">Status</th>
                  <th className="px-8 py-4">Date</th>
                  <th className="px-8 py-4">Description</th>
                  <th className="px-8 py-4">Reference</th>
                  <th className="px-8 py-4 text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {activity.map(item => (
                  <tr key={item.id} className="hover:bg-white/5 transition-colors group cursor-pointer">
                    <td className="px-8 py-4">
                      <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase border ${item.status === 'POSTED'
                        ? 'bg-emerald-accent/10 text-emerald-accent border-emerald-accent/20'
                        : 'bg-amber-accent/10 text-amber-accent border-amber-accent/20'
                        }`}>
                        {item.status}
                      </span>
                    </td>
                    <td className="px-8 py-4 text-sm text-slate-400">{format(new Date(item.date), 'MMM dd, yyyy')}</td>
                    <td className="px-8 py-4">
                      <span className="text-sm font-semibold">{item.description}</span>
                    </td>
                    <td className="px-8 py-4 text-sm text-slate-400">{item.reference || '-'}</td>
                    <td className="px-8 py-4 text-right text-sm font-bold text-slate-100">${item.amount.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  } catch (error: any) {
    return (
      <div className="p-8 bg-rose-950/20 border border-rose-500/50 rounded-2xl text-rose-200">
        <h2 className="text-xl font-bold mb-2">Error Loading Dashboard</h2>
        <p className="font-mono text-sm">{error.message || 'An unexpected error occurred.'}</p>
        <p className="mt-4 text-xs opacity-70">Check your DATABASE_URL and ensure Supabase is reachable.</p>
      </div>
    );
  }
}
