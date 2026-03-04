import { prisma } from '../../lib/prisma';
import { format } from 'date-fns';
import Link from 'next/link';
import { JournalRow } from './JournalRow';

export const dynamic = 'force-dynamic';

export default async function JournalPage() {
    const entries = await prisma.journalEntry.findMany({
        include: {
            lines: {
                include: {
                    account: true
                }
            }
        },
        orderBy: { date: 'desc' },
        take: 30
    });

    return (
        <div className="space-y-8">
            <header className="flex flex-wrap justify-between items-end gap-4">
                <div className="flex flex-col gap-2">
                    <h1 className="text-slate-100 text-4xl font-black tracking-tight">Journal Entries</h1>
                    <p className="text-slate-400 text-base font-normal">Manage and audit double-entry accounting records with precision.</p>
                </div>
                <div className="flex gap-3">
                    <Link href="/journal/create" className="flex items-center justify-center rounded-lg h-10 px-4 glass-panel text-slate-100 text-sm font-bold hover:bg-white/10 transition-all no-underline">
                        <span className="material-symbols-outlined text-sm mr-2">add</span>
                        New Transaction
                    </Link>
                </div>
            </header>

            {/* Tabs placeholder */}
            <div className="flex border-b border-white/10 gap-8">
                <button className="border-b-2 border-primary text-primary pb-3 text-sm font-bold flex items-center gap-2">
                    All Entries <span className="bg-primary/20 text-primary text-[10px] px-1.5 py-0.5 rounded-full">{entries.length}</span>
                </button>
                <button className="border-b-2 border-transparent text-slate-400 hover:text-slate-200 pb-3 text-sm font-bold transition-all">Reviewed</button>
            </div>

            <div className="glass-panel rounded-xl overflow-hidden shadow-2xl bg-slate-900/40 border-white/5">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-white/5 text-slate-300 text-xs font-bold uppercase tracking-widest border-b border-white/10">
                            <th className="px-6 py-4 w-12"></th>
                            <th className="px-6 py-4">Date</th>
                            <th className="px-6 py-4">Reference</th>
                            <th className="px-6 py-4">Description</th>
                            <th className="px-6 py-4 text-right">Total Debit</th>
                            <th className="px-6 py-4 text-right">Total Credit</th>
                            <th className="px-6 py-4">Status</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                        {entries.map(entry => (
                            <JournalRow key={entry.id} entry={JSON.parse(JSON.stringify(entry))} />
                        ))}
                    </tbody>
                </table>

                {/* Pagination placeholder */}
                <div className="px-6 py-4 flex items-center justify-between bg-white/5 border-t border-white/10">
                    <p className="text-xs text-slate-400">Showing <span className="text-white font-bold">1-{entries.length}</span> of <span className="text-white font-bold">{entries.length}</span> entries</p>
                </div>
            </div>

            {/* Footer Stats Placeholder */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="glass-panel p-6 rounded-xl bg-slate-900/40">
                    <div className="flex items-center gap-4">
                        <div className="size-12 rounded-lg bg-emerald-500/20 flex items-center justify-center text-emerald-400">
                            <span className="material-symbols-outlined">trending_up</span>
                        </div>
                        <div>
                            <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">Total Debits</p>
                            <p className="text-2xl font-black text-white">
                                ${entries.reduce((acc, e) => acc + e.lines.reduce((s, l) => s + l.debit.toNumber(), 0), 0).toLocaleString()}
                            </p>
                        </div>
                    </div>
                </div>
                <div className="glass-panel p-6 rounded-xl bg-slate-900/40">
                    <div className="flex items-center gap-4">
                        <div className="size-12 rounded-lg bg-rose-500/20 flex items-center justify-center text-rose-400">
                            <span className="material-symbols-outlined">trending_down</span>
                        </div>
                        <div>
                            <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">Total Credits</p>
                            <p className="text-2xl font-black text-white">
                                ${entries.reduce((acc, e) => acc + e.lines.reduce((s, l) => s + l.credit.toNumber(), 0), 0).toLocaleString()}
                            </p>
                        </div>
                    </div>
                </div>
                <div className="glass-panel p-6 rounded-xl border-emerald-500/30 bg-slate-900/40">
                    <div className="flex items-center gap-4">
                        <div className="size-12 rounded-lg bg-primary/20 flex items-center justify-center text-primary">
                            <span className="material-symbols-outlined">balance</span>
                        </div>
                        <div>
                            <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">Net Imbalance</p>
                            <p className="text-2xl font-black text-white">
                                $0.00
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
