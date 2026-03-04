'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function CreateJournalEntry() {
    const router = useRouter();
    const [accounts, setAccounts] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const [formData, setFormData] = useState({
        date: new Date().toISOString().split('T')[0],
        description: '',
        reference: '',
    });

    const [lines, setLines] = useState([
        { accountId: '', debit: 0, credit: 0, description: '' },
        { accountId: '', debit: 0, credit: 0, description: '' }
    ]);

    useEffect(() => {
        fetch('/api/accounts')
            .then(res => res.json())
            .then(data => setAccounts(data));
    }, []);

    const addLine = () => {
        setLines([...lines, { accountId: '', debit: 0, credit: 0, description: '' }]);
    };

    const updateLine = (index: number, field: string, value: any) => {
        const newLines = [...lines];
        (newLines[index] as any)[field] = value;
        setLines(newLines);
    };

    const removeLine = (index: number) => {
        if (lines.length > 2) {
            setLines(lines.filter((_, i) => i !== index));
        }
    };

    const calculateTotals = () => {
        const totalDebit = lines.reduce((sum, line) => sum + Number(line.debit || 0), 0);
        const totalCredit = lines.reduce((sum, line) => sum + Number(line.credit || 0), 0);
        return { totalDebit, totalCredit, balanced: Math.abs(totalDebit - totalCredit) < 0.01 };
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        const totals = calculateTotals();
        if (!totals.balanced) {
            setError(`Transaction is not balanced! Debits: $${totals.totalDebit.toFixed(2)}, Credits: $${totals.totalCredit.toFixed(2)}`);
            setLoading(false);
            return;
        }

        try {
            const response = await fetch('/api/journal', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...formData,
                    lines: lines.map(line => ({
                        accountId: line.accountId,
                        debit: Number(line.debit) || 0,
                        credit: Number(line.credit) || 0,
                        description: line.description
                    }))
                })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to create journal entry');
            }

            router.push('/journal');
            router.refresh();
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const totals = calculateTotals();

    return (
        <div className="space-y-8 pb-12">
            <header className="flex flex-wrap justify-between items-end gap-4">
                <div className="flex flex-col gap-2">
                    <h1 className="text-slate-100 text-4xl font-black tracking-tight">Manual Journal Entry</h1>
                    <p className="text-slate-400 text-base font-normal">Directly record transactions to your general ledger with full control.</p>
                </div>
                <Link href="/journal" className="flex items-center justify-center rounded-lg h-10 px-4 glass-panel text-slate-100 text-sm font-bold hover:bg-white/10 transition-all no-underline">
                    <span className="material-symbols-outlined text-sm mr-2">arrow_back</span>
                    Discard & Exit
                </Link>
            </header>

            <form onSubmit={handleSubmit} className="space-y-8">
                {/* Header Info */}
                <div className="glass-panel p-8 bg-slate-900/40 border-white/5 rounded-2xl">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Entry Date</label>
                            <input
                                type="date"
                                value={formData.date}
                                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                                required
                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary/50 outline-none transition-all font-semibold"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Reference / Voucher #</label>
                            <input
                                type="text"
                                value={formData.reference}
                                onChange={(e) => setFormData({ ...formData, reference: e.target.value })}
                                placeholder="JE-0001"
                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary/50 outline-none transition-all font-semibold"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Primary Description</label>
                            <input
                                type="text"
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                required
                                placeholder="Purpose of this entry..."
                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary/50 outline-none transition-all font-semibold"
                            />
                        </div>
                    </div>
                </div>

                {/* Ledger Lines */}
                <div className="glass-panel overflow-hidden bg-slate-900/40 border-white/5 rounded-2xl">
                    <div className="px-8 py-4 bg-white/5 border-b border-white/10 flex justify-between items-center">
                        <h3 className="text-sm font-bold uppercase tracking-widest text-slate-300">Transaction Lines</h3>
                        <button type="button" onClick={addLine} className="flex items-center gap-2 px-4 py-1.5 rounded-lg bg-primary/20 text-primary border border-primary/30 text-xs font-bold hover:bg-primary/30 transition-all">
                            <span className="material-symbols-outlined text-sm">add</span> Add Line
                        </button>
                    </div>

                    <div className="p-8 space-y-4">
                        {lines.map((line, index) => (
                            <div key={index} className="grid grid-cols-12 gap-4 items-center animate-in fade-in slide-in-from-left-4 duration-200">
                                <div className="col-span-4">
                                    <select
                                        value={line.accountId}
                                        onChange={(e) => updateLine(index, 'accountId', e.target.value)}
                                        required
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                                    >
                                        <option value="" className="bg-slate-900 text-slate-500 italic">Select Account</option>
                                        {accounts.map(acc => (
                                            <option key={acc.id} value={acc.id} className="bg-slate-900 font-semibold">{acc.code} — {acc.name}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="col-span-2">
                                    <input
                                        type="number"
                                        step="0.01"
                                        value={line.debit || ''}
                                        onChange={(e) => updateLine(index, 'debit', e.target.value)}
                                        placeholder="Debit"
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-right font-bold text-emerald-accent outline-none"
                                    />
                                </div>
                                <div className="col-span-2">
                                    <input
                                        type="number"
                                        step="0.01"
                                        value={line.credit || ''}
                                        onChange={(e) => updateLine(index, 'credit', e.target.value)}
                                        placeholder="Credit"
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-right font-bold text-rose-accent outline-none"
                                    />
                                </div>
                                <div className="col-span-3">
                                    <input
                                        type="text"
                                        value={line.description}
                                        onChange={(e) => updateLine(index, 'description', e.target.value)}
                                        placeholder="Line specific remark..."
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm outline-none"
                                    />
                                </div>
                                <div className="col-span-1 flex justify-end">
                                    <button
                                        type="button"
                                        onClick={() => removeLine(index)}
                                        disabled={lines.length <= 2}
                                        className="size-10 rounded-full flex items-center justify-center text-slate-500 hover:bg-rose-500/10 hover:text-rose-500 transition-all disabled:opacity-0"
                                    >
                                        <span className="material-symbols-outlined text-xl">delete</span>
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Form Footer / Summary */}
                    <div className="bg-black/20 border-t border-white/10 px-8 py-6 grid grid-cols-12 gap-4 items-center">
                        <div className="col-span-4 text-xs font-bold uppercase tracking-widest text-slate-500">Ledger Summary Totals</div>
                        <div className="col-span-2 text-right">
                            <p className="text-xl font-black text-emerald-accent">${totals.totalDebit.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
                            <label className="text-[9px] font-black uppercase tracking-tighter text-slate-600">Total Debit</label>
                        </div>
                        <div className="col-span-2 text-right">
                            <p className="text-xl font-black text-rose-accent">${totals.totalCredit.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
                            <label className="text-[9px] font-black uppercase tracking-tighter text-slate-600">Total Credit</label>
                        </div>
                        <div className="col-span-4 flex justify-end">
                            <div className={`flex items-center gap-3 px-6 py-2 rounded-full border ${totals.balanced ? 'bg-emerald-accent/10 border-emerald-accent/20 text-emerald-accent' : 'bg-rose-accent/10 border-rose-accent/20 text-rose-accent'
                                }`}>
                                <span className={`w-2.5 h-2.5 rounded-full ${totals.balanced ? 'bg-emerald-accent shadow-[0_0_8px_var(--emerald-accent)]' : 'bg-rose-accent shadow-[0_0_8px_var(--rose-accent)]'}`}></span>
                                <span className="text-xs font-black uppercase tracking-widest">{totals.balanced ? 'Balanced' : 'Out of Balance'}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {error && (
                    <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-xl flex items-center gap-3 text-rose-500 animate-bounce">
                        <span className="material-symbols-outlined">error</span>
                        <p className="text-sm font-bold">{error}</p>
                    </div>
                )}

                <div className="flex justify-end gap-6 pt-4">
                    <button
                        type="submit"
                        disabled={loading || !totals.balanced}
                        className="px-12 py-4 bg-primary text-white rounded-2xl text-lg font-black tracking-tight shadow-2xl shadow-primary/40 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:scale-100 disabled:shadow-none"
                    >
                        {loading ? 'Submitting to Ledger...' : 'Post Journal Entry'}
                    </button>
                </div>
            </form>
        </div>
    );
}
