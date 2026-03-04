'use client';

import { useState, useEffect } from 'react';

export default function AccountsPage() {
    const [accounts, setAccounts] = useState<any[]>([]);
    const [showModal, setShowModal] = useState(false);
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        code: '',
        name: '',
        type: 'ASSET',
        description: ''
    });

    useEffect(() => {
        loadAccounts();
    }, []);

    const loadAccounts = async () => {
        const res = await fetch('/api/accounts');
        const data = await res.json();
        setAccounts(data);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await fetch('/api/accounts', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });
            if (res.ok) {
                setFormData({ code: '', name: '', type: 'ASSET', description: '' });
                setShowModal(false);
                loadAccounts();
            }
        } catch (err) {
            alert('Failed to create account');
        } finally {
            setLoading(false);
        }
    };

    const groupedAccounts = accounts.reduce((acc, account: any) => {
        if (!acc[account.type]) {
            acc[account.type] = [];
        }
        acc[account.type].push(account);
        return acc;
    }, {} as Record<string, any[]>);

    return (
        <div className="space-y-8">
            <header className="flex flex-wrap justify-between items-end gap-4">
                <div className="flex flex-col gap-2">
                    <h1 className="text-slate-100 text-4xl font-black tracking-tight">Chart of Accounts</h1>
                    <p className="text-slate-400 text-base font-normal">Maintain your general ledger structure and account classifications.</p>
                </div>
                <div className="flex gap-3">
                    <button
                        onClick={() => setShowModal(true)}
                        className="flex items-center justify-center rounded-lg h-10 px-6 bg-primary text-white text-sm font-bold glow-button hover:bg-blue-600 transition-all"
                    >
                        <span className="material-symbols-outlined text-sm mr-2">add</span>
                        New Account
                    </button>
                </div>
            </header>

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                {['ASSET', 'LIABILITY', 'EQUITY', 'INCOME', 'EXPENSE'].map(type => (
                    groupedAccounts[type] && (
                        <div key={type} className="glass-panel overflow-hidden bg-slate-900/40 border-white/5">
                            <div className="px-6 py-4 bg-white/5 border-b border-white/10 flex justify-between items-center">
                                <h2 className="text-sm font-bold uppercase tracking-widest text-slate-300">{type}</h2>
                                <span className="bg-primary/20 text-primary text-[10px] px-2 py-0.5 rounded-full font-bold">
                                    {groupedAccounts[type].length} ACCOUNTS
                                </span>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead>
                                        <tr className="text-slate-500 text-[10px] font-bold uppercase tracking-widest border-b border-white/5">
                                            <th className="px-6 py-3">Code</th>
                                            <th className="px-6 py-3">Account Name</th>
                                            <th className="px-6 py-3 text-right">Balance</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-white/5">
                                        {groupedAccounts[type].map((account: any) => (
                                            <tr key={account.id} className="hover:bg-white/5 transition-colors group">
                                                <td className="px-6 py-4 text-sm font-bold text-primary">{account.code}</td>
                                                <td className="px-6 py-4">
                                                    <div className="flex flex-col">
                                                        <span className="text-sm font-semibold text-slate-200">{account.name}</span>
                                                        <span className="text-[10px] text-slate-500 truncate max-w-[200px]">{account.description || 'System Account'}</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <span className="text-sm font-mono text-slate-400">$0.00</span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )
                ))}
            </div>

            {/* New Account Modal */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-xl" onClick={() => setShowModal(false)}></div>
                    <div className="relative w-full max-w-lg bg-slate-900/90 backdrop-blur-2xl rounded-2xl border border-white/10 shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
                        <div className="px-8 py-6 border-b border-white/10 flex justify-between items-center">
                            <div className="flex items-center gap-3">
                                <div className="size-10 rounded-xl bg-primary flex items-center justify-center text-white shadow-lg">
                                    <span className="material-symbols-outlined">account_balance</span>
                                </div>
                                <h2 className="text-xl font-bold">Create New Account</h2>
                            </div>
                            <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-white">
                                <span className="material-symbols-outlined">close</span>
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-8 space-y-6">
                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Account Code</label>
                                    <input
                                        type="text"
                                        placeholder="1000"
                                        className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary/50 outline-none transition-all"
                                        value={formData.code}
                                        onChange={e => setFormData({ ...formData, code: e.target.value })}
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Account Type</label>
                                    <select
                                        className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary/50 outline-none transition-all"
                                        value={formData.type}
                                        onChange={e => setFormData({ ...formData, type: e.target.value })}
                                    >
                                        <option value="ASSET" className="bg-slate-900">ASSET</option>
                                        <option value="LIABILITY" className="bg-slate-900">LIABILITY</option>
                                        <option value="EQUITY" className="bg-slate-900">EQUITY</option>
                                        <option value="INCOME" className="bg-slate-900">INCOME</option>
                                        <option value="EXPENSE" className="bg-slate-900">EXPENSE</option>
                                    </select>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Account Name</label>
                                <input
                                    type="text"
                                    placeholder="e.g. Petty Cash"
                                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary/50 outline-none transition-all"
                                    value={formData.name}
                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Description</label>
                                <textarea
                                    placeholder="Brief description of the account purpose..."
                                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-primary/50 outline-none transition-all min-h-[100px]"
                                    value={formData.description}
                                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                                />
                            </div>

                            <div className="pt-4 flex gap-4">
                                <button
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    className="flex-1 px-6 py-2.5 rounded-lg text-sm font-bold text-slate-400 hover:bg-white/5 transition-all"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="flex-1 px-6 py-2.5 bg-primary text-white rounded-lg text-sm font-bold shadow-lg shadow-primary/20 hover:bg-blue-600 transition-all disabled:opacity-50"
                                >
                                    {loading ? 'Creating...' : 'Save Account'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
