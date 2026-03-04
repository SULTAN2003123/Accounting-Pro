'use client';

import { useState, useEffect } from 'react';
import { format } from 'date-fns';

export default function VendorsPage() {
    const [vendors, setVendors] = useState<any[]>([]);
    const [bills, setBills] = useState<any[]>([]);
    const [showVendorForm, setShowVendorForm] = useState(false);
    const [showBillForm, setShowBillForm] = useState(false);
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [selectedBill, setSelectedBill] = useState<any>(null);
    const [loading, setLoading] = useState(false);

    const [vendorForm, setVendorForm] = useState({
        name: '', email: '', phone: '', address: ''
    });

    const [billForm, setBillForm] = useState({
        vendorId: '',
        date: new Date().toISOString().split('T')[0],
        dueDate: new Date().toISOString().split('T')[0],
        billNumber: '',
        lines: [{ description: '', amount: 0 }]
    });

    const [paymentForm, setPaymentForm] = useState({
        date: new Date().toISOString().split('T')[0],
        amount: 0,
        method: 'BANK',
        reference: ''
    });

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        const [vendorsRes, billsRes] = await Promise.all([
            fetch('/api/vendors'),
            fetch('/api/bills')
        ]);
        setVendors(await vendorsRes.json());
        setBills(await billsRes.json());
    };

    const handleCreateVendor = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            await fetch('/api/vendors', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(vendorForm)
            });
            setVendorForm({ name: '', email: '', phone: '', address: '' });
            setShowVendorForm(false);
            loadData();
        } catch (err) {
            alert('Failed to create vendor');
        } finally {
            setLoading(false);
        }
    };

    const handleCreateBill = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            await fetch('/api/bills', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(billForm)
            });
            setBillForm({
                vendorId: '',
                date: new Date().toISOString().split('T')[0],
                dueDate: new Date().toISOString().split('T')[0],
                billNumber: '',
                lines: [{ description: '', amount: 0 }]
            });
            setShowBillForm(false);
            loadData();
        } catch (err) {
            alert('Failed to create bill');
        } finally {
            setLoading(false);
        }
    };

    const handleRecordPayment = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await fetch('/api/payments', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...paymentForm,
                    type: 'SPEND',
                    billId: selectedBill.id
                })
            });
            if (res.ok) {
                setShowPaymentModal(false);
                setSelectedBill(null);
                loadData();
            } else {
                const data = await res.json();
                alert(data.error || 'Payment failed');
            }
        } catch (err) {
            alert('Failed to record payment');
        } finally {
            setLoading(false);
        }
    };

    const updateBillLine = (index: number, field: string, value: any) => {
        const newLines = [...billForm.lines];
        (newLines[index] as any)[field] = value;
        setBillForm({ ...billForm, lines: newLines });
    };

    return (
        <div className="space-y-8 pb-12">
            <header className="flex flex-wrap justify-between items-end gap-4">
                <div className="flex flex-col gap-2">
                    <h1 className="text-slate-100 text-4xl font-black tracking-tight">Payables</h1>
                    <p className="text-slate-400 text-base font-normal">Manage your vendors and incoming bills seamlessly.</p>
                </div>
                <div className="flex gap-3">
                    <button
                        onClick={() => setShowVendorForm(true)}
                        className="flex items-center justify-center rounded-lg h-10 px-4 glass-panel text-slate-100 text-sm font-bold hover:bg-white/10 transition-all"
                    >
                        <span className="material-symbols-outlined text-sm mr-2">store</span>
                        Add Vendor
                    </button>
                    <button
                        onClick={() => setShowBillForm(true)}
                        disabled={vendors.length === 0}
                        className="flex items-center justify-center rounded-lg h-10 px-6 bg-amber-accent text-slate-900 text-sm font-bold shadow-lg shadow-amber-accent/20 hover:bg-amber-500 transition-all disabled:opacity-50"
                    >
                        <span className="material-symbols-outlined text-sm mr-2">receipt</span>
                        Record Bill
                    </button>
                </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Vendors Directory */}
                <div className="glass-panel overflow-hidden bg-slate-900/40 border-white/5 h-fit">
                    <div className="px-6 py-4 bg-white/5 border-b border-white/10 flex justify-between items-center">
                        <h2 className="text-xs font-bold uppercase tracking-widest text-slate-300">Vendor Directory</h2>
                    </div>
                    <div className="max-h-[600px] overflow-y-auto overflow-x-hidden">
                        <table className="w-full text-left">
                            <tbody className="divide-y divide-white/5">
                                {vendors.map(vendor => (
                                    <tr key={vendor.id} className="hover:bg-white/5 transition-colors group">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="size-8 rounded-full bg-amber-accent/20 flex items-center justify-center text-amber-accent font-bold text-xs">
                                                    {vendor.name.charAt(0)}
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="text-sm font-semibold text-slate-200">{vendor.name}</span>
                                                    <span className="text-[10px] text-slate-500 truncate max-w-[150px]">{vendor.email || 'No contact info'}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <span className="px-2 py-0.5 rounded-full bg-amber-accent/10 text-amber-accent text-[10px] font-bold">
                                                {vendor.bills?.length || 0} BILLS
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Bills Table */}
                <div className="lg:col-span-2 glass-panel overflow-hidden bg-slate-900/40 border-white/5">
                    <div className="px-8 py-6 border-b border-white/5 flex items-center justify-between">
                        <h3 className="text-xl font-bold text-slate-100">Outstanding Payables</h3>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="text-slate-500 text-xs font-bold uppercase tracking-widest border-b border-white/5">
                                    <th className="px-8 py-4">Bill #</th>
                                    <th className="px-8 py-4">Vendor</th>
                                    <th className="px-8 py-4">Due Date</th>
                                    <th className="px-8 py-4 text-right">Amount</th>
                                    <th className="px-8 py-4">Status</th>
                                    <th className="px-8 py-4">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {bills.map(bill => (
                                    <tr key={bill.id} className="hover:bg-white/5 transition-colors group">
                                        <td className="px-8 py-4 font-bold text-white text-sm">{bill.billNumber || 'UNREF'}</td>
                                        <td className="px-8 py-4 text-sm text-slate-300">{bill.vendor?.name}</td>
                                        <td className="px-8 py-4 text-sm text-slate-500">{format(new Date(bill.dueDate), 'MMM dd, yyyy')}</td>
                                        <td className="px-8 py-4 text-right text-sm font-bold text-slate-100">${bill.totalAmount.toLocaleString()}</td>
                                        <td className="px-8 py-4">
                                            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase border ${bill.status === 'PAID'
                                                    ? 'bg-emerald-accent/10 text-emerald-accent border-emerald-accent/20'
                                                    : 'bg-amber-accent/10 text-amber-accent border-amber-accent/20'
                                                }`}>
                                                {bill.status}
                                            </span>
                                        </td>
                                        <td className="px-8 py-4">
                                            {bill.status !== 'PAID' && (
                                                <button
                                                    onClick={() => {
                                                        setSelectedBill(bill);
                                                        setPaymentForm({ ...paymentForm, amount: Number(bill.totalAmount) });
                                                        setShowPaymentModal(true);
                                                    }}
                                                    className="px-4 py-1.5 rounded-lg text-[10px] font-black tracking-widest uppercase bg-amber-accent/10 text-amber-accent border border-amber-accent/20 hover:bg-amber-accent/20 transition-all"
                                                >
                                                    Pay
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Modals */}
            {showVendorForm && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-xl" onClick={() => setShowVendorForm(false)}></div>
                    <div className="relative w-full max-w-lg bg-slate-900/90 backdrop-blur-2xl rounded-2xl border border-white/10 shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
                        <div className="px-8 py-6 border-b border-white/10 flex justify-between items-center bg-white/5">
                            <h2 className="text-xl font-bold">New Vendor</h2>
                            <button onClick={() => setShowVendorForm(false)} className="text-slate-400 hover:text-white">
                                <span className="material-symbols-outlined">close</span>
                            </button>
                        </div>
                        <form onSubmit={handleCreateVendor} className="p-8 space-y-6">
                            <input type="text" placeholder="Vendor Name *" className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-amber-accent/50 outline-none transition-all" value={vendorForm.name} onChange={e => setVendorForm({ ...vendorForm, name: e.target.value })} required />
                            <input type="email" placeholder="Email" className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-amber-accent/50 outline-none transition-all" value={vendorForm.email} onChange={e => setVendorForm({ ...vendorForm, email: e.target.value })} />
                            <input type="tel" placeholder="Phone" className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-amber-accent/50 outline-none transition-all" value={vendorForm.phone} onChange={e => setVendorForm({ ...vendorForm, phone: e.target.value })} />
                            <button type="submit" disabled={loading} className="w-full py-3 bg-amber-accent text-slate-900 rounded-lg text-sm font-bold shadow-lg shadow-amber-accent/20 hover:bg-amber-500 transition-all disabled:opacity-50">
                                {loading ? 'Saving...' : 'Register Vendor'}
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {showBillForm && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-xl" onClick={() => setShowBillForm(false)}></div>
                    <div className="relative w-full max-w-3xl bg-slate-900/90 backdrop-blur-2xl rounded-2xl border border-white/10 shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
                        <div className="px-8 py-6 border-b border-white/10 flex justify-between items-center bg-white/5">
                            <h2 className="text-xl font-bold">Record Incoming Bill</h2>
                            <button onClick={() => setShowBillForm(false)} className="text-slate-400 hover:text-white">
                                <span className="material-symbols-outlined">close</span>
                            </button>
                        </div>
                        <form onSubmit={handleCreateBill} className="p-8 space-y-8">
                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Vendor Selection</label>
                                    <select value={billForm.vendorId} onChange={e => setBillForm({ ...billForm, vendorId: e.target.value })} required className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-sm outline-none transition-all focus:ring-2 focus:ring-amber-accent/50">
                                        <option value="" className="bg-slate-900">Select Vendor *</option>
                                        {vendors.map(v => <option key={v.id} value={v.id} className="bg-slate-900">{v.name}</option>)}
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Bill Reference #</label>
                                    <input type="text" placeholder="REF-2024-X" value={billForm.billNumber} onChange={e => setBillForm({ ...billForm, billNumber: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-sm outline-none transition-all focus:ring-2 focus:ring-amber-accent/50" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Bill Date</label>
                                    <input type="date" value={billForm.date} onChange={e => setBillForm({ ...billForm, date: e.target.value })} required className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-sm outline-none transition-all focus:ring-2 focus:ring-amber-accent/50" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Due Date</label>
                                    <input type="date" value={billForm.dueDate} onChange={e => setBillForm({ ...billForm, dueDate: e.target.value })} required className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-sm outline-none transition-all focus:ring-2 focus:ring-amber-accent/50" />
                                </div>
                            </div>

                            <div className="space-y-4">
                                <h4 className="text-xs font-bold uppercase tracking-widest text-slate-500 border-b border-white/10 pb-2">Expense Line Items</h4>
                                {billForm.lines.map((line, idx) => (
                                    <div key={idx} className="grid grid-cols-12 gap-3 items-center">
                                        <div className="col-span-8">
                                            <input type="text" placeholder="Category / Description" value={line.description} onChange={e => updateBillLine(idx, 'description', e.target.value)} required className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm outline-none" />
                                        </div>
                                        <div className="col-span-4">
                                            <input type="number" step="0.01" placeholder="Amount" value={line.amount} onChange={e => updateBillLine(idx, 'amount', Number(e.target.value))} required className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-right outline-none" />
                                        </div>
                                    </div>
                                ))}
                                <button type="button" onClick={() => setBillForm({ ...billForm, lines: [...billForm.lines, { description: '', amount: 0 }] })} className="w-full py-2 border border-dashed border-white/20 rounded-lg text-[10px] font-bold uppercase tracking-widest hover:bg-white/5 transition-all">
                                    + Insert Expense Line
                                </button>
                            </div>

                            <div className="pt-4 border-t border-white/10 flex justify-between items-center">
                                <div className="flex flex-col">
                                    <span className="text-[10px] font-bold uppercase text-slate-500">Total Payable Amount</span>
                                    <span className="text-2xl font-black text-amber-accent">${billForm.lines.reduce((sum, line) => sum + line.amount, 0).toFixed(2)}</span>
                                </div>
                                <button type="submit" disabled={loading} className="px-8 py-3 bg-amber-accent text-slate-900 rounded-xl text-sm font-bold shadow-lg shadow-amber-accent/30 hover:bg-amber-500 transition-all disabled:opacity-50">
                                    Finalize & Post Bill
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {showPaymentModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-xl" onClick={() => setShowPaymentModal(false)}></div>
                    <div className="relative w-full max-w-md bg-slate-900/90 backdrop-blur-2xl rounded-2xl border border-white/10 shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
                        <div className="px-8 py-6 border-b border-white/10 flex justify-between items-center bg-amber-accent/10">
                            <h2 className="text-xl font-bold text-amber-accent">Settle Payment</h2>
                            <button onClick={() => setShowPaymentModal(false)} className="text-slate-400 hover:text-white">
                                <span className="material-symbols-outlined">close</span>
                            </button>
                        </div>
                        <form onSubmit={handleRecordPayment} className="p-8 space-y-6">
                            <p className="text-sm text-slate-400">Recording payment for Bill <strong className="text-white">{selectedBill?.billNumber}</strong></p>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="text-[10px] font-bold uppercase text-slate-500">Payment Date</label>
                                    <input type="date" value={paymentForm.date} onChange={e => setPaymentForm({ ...paymentForm, date: e.target.value })} required className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-sm" />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] font-bold uppercase text-slate-500">Amount Paid</label>
                                    <input type="number" step="0.01" value={paymentForm.amount} onChange={e => setPaymentForm({ ...paymentForm, amount: Number(e.target.value) })} required className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-sm" />
                                </div>
                            </div>
                            <div className="space-y-1">
                                <label className="text-[10px] font-bold uppercase text-slate-500">Payment Method</label>
                                <select value={paymentForm.method} onChange={e => setPaymentForm({ ...paymentForm, method: e.target.value as any })} className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-sm">
                                    <option value="BANK" className="bg-slate-900">BANK TRANSFER</option>
                                    <option value="CASH" className="bg-slate-900">CASH</option>
                                    <option value="CHECK" className="bg-slate-900">CHECK</option>
                                </select>
                            </div>
                            <div className="space-y-1">
                                <label className="text-[10px] font-bold uppercase text-slate-500">Ref / Check #</label>
                                <input type="text" placeholder="TX-88210" value={paymentForm.reference} onChange={e => setPaymentForm({ ...paymentForm, reference: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-sm" />
                            </div>
                            <button type="submit" disabled={loading} className="w-full py-3 bg-amber-accent text-slate-900 rounded-lg text-sm font-bold shadow-lg shadow-amber-accent/20 hover:bg-amber-500 transition-all">
                                {loading ? 'Processing...' : 'Authorize Disbursement'}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
