'use client';

import { useState } from 'react';
import { format } from 'date-fns';

export function JournalRow({ entry }: { entry: any }) {
    const [isExpanded, setIsExpanded] = useState(false);

    const totalDebit = entry.lines.reduce((sum: number, line: any) => sum + parseFloat(line.debit.toString()), 0);
    const totalCredit = entry.lines.reduce((sum: number, line: any) => sum + parseFloat(line.credit.toString()), 0);

    return (
        <>
            <tr
                className="hover:bg-white/5 transition-colors group cursor-pointer"
                onClick={() => setIsExpanded(!isExpanded)}
            >
                <td className="px-6 py-5 text-center">
                    <span className="material-symbols-outlined text-primary text-xl cursor-pointer">
                        {isExpanded ? 'expand_less' : 'expand_more'}
                    </span>
                </td>
                <td className="px-6 py-5 text-slate-300 text-sm">{format(new Date(entry.date), 'MMM dd, yyyy')}</td>
                <td className="px-6 py-5 font-bold text-white text-sm">{entry.reference || '—'}</td>
                <td className="px-6 py-5 text-slate-400 text-sm">{entry.description}</td>
                <td className="px-6 py-5 text-right font-mono font-semibold text-emerald-accent text-sm">${totalDebit.toLocaleString()}</td>
                <td className="px-6 py-5 text-right font-mono font-semibold text-rose-accent text-sm">${totalCredit.toLocaleString()}</td>
                <td className="px-6 py-5">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${entry.status === 'POSTED'
                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                            : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                        }`}>
                        {entry.status}
                    </span>
                </td>
            </tr>
            {isExpanded && (
                <tr className="bg-primary/5">
                    <td className="px-12 py-6" colSpan={7}>
                        <div className="glass-panel rounded-lg overflow-hidden border-white/5 bg-slate-800/20">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="bg-white/5 text-slate-400 text-[10px] uppercase font-bold tracking-tighter">
                                        <th className="px-6 py-2">Account</th>
                                        <th className="px-6 py-2 text-right">Debit</th>
                                        <th className="px-6 py-2 text-right">Credit</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/5">
                                    {entry.lines.map((line: any) => (
                                        <tr key={line.id}>
                                            <td className="px-6 py-3 text-slate-100 font-medium">
                                                {line.account.code} - {line.account.name}
                                            </td>
                                            <td className="px-6 py-3 text-right text-emerald-400 font-mono font-bold">
                                                {parseFloat(line.debit.toString()) > 0 ? `$${parseFloat(line.debit.toString()).toLocaleString()}` : '—'}
                                            </td>
                                            <td className="px-6 py-3 text-right text-rose-400 font-mono font-bold">
                                                {parseFloat(line.credit.toString()) > 0 ? `$${parseFloat(line.credit.toString()).toLocaleString()}` : '—'}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </td>
                </tr>
            )}
        </>
    );
}
