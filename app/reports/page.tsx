import { generateIncomeStatement, generateBalanceSheet } from '../../lib/reports';
import { format } from 'date-fns';

export const dynamic = 'force-dynamic';

export default async function ReportsPage() {
    const today = new Date();
    const startOfYear = new Date(today.getFullYear(), 0, 1);

    const incomeStatement = await generateIncomeStatement(startOfYear, today);
    const balanceSheet = await generateBalanceSheet(today);

    return (
        <div className="space-y-8 pb-12">
            <header className="flex flex-wrap justify-between items-end gap-4">
                <div className="flex flex-col gap-2">
                    <h1 className="text-slate-100 text-4xl font-black tracking-tight">Financial Reporting</h1>
                    <p className="text-slate-400 text-base font-normal">Comprehensive analysis of company performance and position.</p>
                </div>
                <div className="flex gap-3">
                    <button className="flex items-center justify-center rounded-lg h-10 px-4 glass-panel text-slate-100 text-sm font-bold hover:bg-white/10 transition-all">
                        <span className="material-symbols-outlined text-sm mr-2">download</span>
                        Export PDF
                    </button>
                    <button className="flex items-center justify-center rounded-lg h-10 px-4 glass-panel text-slate-100 text-sm font-bold hover:bg-white/10 transition-all">
                        <span className="material-symbols-outlined text-sm mr-2">print</span>
                        Print
                    </button>
                </div>
            </header>

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                {/* Income Statement */}
                <div className="glass-panel overflow-hidden bg-slate-900/40 border-white/5 p-8 flex flex-col gap-8">
                    <div className="flex justify-between items-start">
                        <div>
                            <h2 className="text-2xl font-bold text-primary">Income Statement</h2>
                            <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-1">
                                {format(startOfYear, 'MMM dd')} — {format(today, 'MMM dd, yyyy')}
                            </p>
                        </div>
                    </div>

                    <div className="space-y-8">
                        <div>
                            <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500 mb-4 border-b border-white/5 pb-2">Operating Revenue</h3>
                            <div className="space-y-2">
                                {incomeStatement.income.map((item, idx) => (
                                    <div key={idx} className="flex justify-between items-center py-2 border-b border-white/5 last:border-0">
                                        <span className="text-sm text-slate-300 font-medium">{item.account}</span>
                                        <span className="text-sm font-bold text-slate-100">${item.amount.toLocaleString()}</span>
                                    </div>
                                ))}
                                <div className="flex justify-between items-center p-4 bg-primary/10 rounded-xl mt-4 border border-primary/20">
                                    <span className="text-sm font-bold text-slate-100">Total Gross Revenue</span>
                                    <span className="text-lg font-black text-emerald-accent">${incomeStatement.totalIncome.toLocaleString()}</span>
                                </div>
                            </div>
                        </div>

                        <div>
                            <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500 mb-4 border-b border-white/5 pb-2">Operating Expenses</h3>
                            <div className="space-y-2">
                                {incomeStatement.expenses.map((item, idx) => (
                                    <div key={idx} className="flex justify-between items-center py-2 border-b border-white/5 last:border-0">
                                        <span className="text-sm text-slate-300 font-medium">{item.account}</span>
                                        <span className="text-sm font-bold text-slate-100">${item.amount.toLocaleString()}</span>
                                    </div>
                                ))}
                                <div className="flex justify-between items-center p-4 bg-slate-800/40 rounded-xl mt-4 border border-white/5">
                                    <span className="text-sm font-bold text-slate-100">Total Operating Expenses</span>
                                    <span className="text-lg font-black text-rose-accent">${incomeStatement.totalExpenses.toLocaleString()}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="mt-auto p-6 bg-gradient-to-br from-primary/20 to-accent/20 border border-primary/30 rounded-2xl flex justify-between items-center">
                        <div>
                            <span className="text-[10px] font-black uppercase tracking-widest text-primary/80">Net Performance</span>
                            <h4 className="text-xl font-bold text-white mt-1">Bottom Line Profit/Loss</h4>
                        </div>
                        <div className="text-right">
                            <p className={`text-3xl font-black ${incomeStatement.netIncome >= 0 ? 'text-emerald-accent' : 'text-rose-accent'}`}>
                                {incomeStatement.netIncome >= 0 ? '+' : ''}${incomeStatement.netIncome.toLocaleString()}
                            </p>
                            <span className={`inline-block mt-1 px-2 py-0.5 rounded text-[10px] font-black tracking-widest ${incomeStatement.netIncome >= 0 ? 'bg-emerald-accent/20 text-emerald-accent' : 'bg-rose-accent/20 text-rose-accent'
                                }`}>
                                {incomeStatement.netIncome >= 0 ? 'STATUS: PROFITABLE' : 'STATUS: NET LOSS'}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Balance Sheet */}
                <div className="glass-panel overflow-hidden bg-slate-900/40 border-white/5 p-8 flex flex-col gap-8">
                    <div className="flex justify-between items-start">
                        <div>
                            <h2 className="text-2xl font-bold text-blue-accent">Balance Sheet</h2>
                            <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-1">
                                Snapshot as of {format(today, 'MMM dd, yyyy')}
                            </p>
                        </div>
                    </div>

                    <div className="space-y-8">
                        <div>
                            <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500 mb-4 border-b border-white/5 pb-2">Asset Accounts</h3>
                            <div className="space-y-2">
                                {balanceSheet.assets.map((item, idx) => (
                                    <div key={idx} className="flex justify-between items-center py-2 border-b border-white/5 last:border-0">
                                        <span className="text-sm text-slate-300 font-medium">{item.account}</span>
                                        <span className="text-sm font-bold text-slate-100">${item.amount.toLocaleString()}</span>
                                    </div>
                                ))}
                                <div className="flex justify-between items-center p-4 bg-blue-accent/10 rounded-xl mt-4 border border-blue-accent/20">
                                    <span className="text-sm font-bold text-slate-100">Total Company Assets</span>
                                    <span className="text-lg font-black text-blue-accent">${balanceSheet.totalAssets.toLocaleString()}</span>
                                </div>
                            </div>
                        </div>

                        <div>
                            <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500 mb-4 border-b border-white/5 pb-2">Liabilities & Equity</h3>
                            <div className="space-y-2">
                                {[...balanceSheet.liabilities, ...balanceSheet.equity].map((item, idx) => (
                                    <div key={idx} className="flex justify-between items-center py-2 border-b border-white/5 last:border-0">
                                        <span className="text-sm text-slate-300 font-medium">{item.account}</span>
                                        <span className="text-sm font-bold text-slate-100">${item.amount.toLocaleString()}</span>
                                    </div>
                                ))}
                                <div className="flex justify-between items-center p-4 bg-slate-800/40 rounded-xl mt-4 border border-white/5">
                                    <span className="text-sm font-bold text-slate-100">Total Obligations & Equity</span>
                                    <span className="text-lg font-black text-slate-100">${(balanceSheet.totalLiabilities + balanceSheet.totalEquity).toLocaleString()}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className={`mt-auto p-4 rounded-xl border flex items-center justify-center gap-3 ${balanceSheet.isBalanced ? 'bg-emerald-accent/10 border-emerald-accent/20' : 'bg-rose-accent/10 border-rose-accent/20'
                        }`}>
                        <span className={`w-3 h-3 rounded-full animate-pulse ${balanceSheet.isBalanced ? 'bg-emerald-accent' : 'bg-rose-accent'}`}></span>
                        <span className={`text-[11px] font-black tracking-widest uppercase ${balanceSheet.isBalanced ? 'text-emerald-accent' : 'text-rose-accent'
                            }`}>
                            {balanceSheet.isBalanced ? 'Fundamental Accounting Equation: Balanced' : 'Accounting Discrepancy Detected'}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
}
