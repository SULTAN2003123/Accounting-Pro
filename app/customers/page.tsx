'use client';

import { useState, useEffect } from 'react';
import { format } from 'date-fns';

export default function CustomersPage() {
    const [customers, setCustomers] = useState<any[]>([]);
    const [invoices, setInvoices] = useState<any[]>([]);
    const [showCustomerForm, setShowCustomerForm] = useState(false);
    const [showInvoiceForm, setShowInvoiceForm] = useState(false);
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [selectedInvoice, setSelectedInvoice] = useState<any>(null);
    const [loading, setLoading] = useState(false);

    const [customerForm, setCustomerForm] = useState({
        name: '', email: '', phone: '', address: ''
    });

    const [invoiceForm, setInvoiceForm] = useState({
        customerId: '',
        date: new Date().toISOString().split('T')[0],
        dueDate: new Date().toISOString().split('T')[0],
        invoiceNumber: '',
        lines: [{ description: '', quantity: 1, unitPrice: 0, amount: 0 }]
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
        const [customersRes, invoicesRes] = await Promise.all([
            fetch('/api/customers'),
            fetch('/api/invoices')
        ]);
        setCustomers(await customersRes.json());
        setInvoices(await invoicesRes.json());
    };

    const handleCreateCustomer = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            await fetch('/api/customers', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(customerForm)
            });
            setCustomerForm({ name: '', email: '', phone: '', address: '' });
            setShowCustomerForm(false);
            loadData();
        } catch (err) {
            alert('Failed to create customer');
        } finally {
            setLoading(false);
        }
    };

    const handleCreateInvoice = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            await fetch('/api/invoices', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(invoiceForm)
            });
            setInvoiceForm({
                customerId: '',
                date: new Date().toISOString().split('T')[0],
                dueDate: new Date().toISOString().split('T')[0],
                invoiceNumber: '',
                lines: [{ description: '', quantity: 1, unitPrice: 0, amount: 0 }]
            });
            setShowInvoiceForm(false);
            loadData();
        } catch (err) {
            alert('Failed to create invoice');
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
                    type: 'RECEIVE',
                    invoiceId: selectedInvoice.id
                })
            });
            if (res.ok) {
                setShowPaymentModal(false);
                setSelectedInvoice(null);
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

    const updateInvoiceLine = (index: number, field: string, value: any) => {
        const newLines = [...invoiceForm.lines];
        (newLines[index] as any)[field] = value;
        if (field === 'quantity' || field === 'unitPrice') {
            newLines[index].amount = newLines[index].quantity * newLines[index].unitPrice;
        }
        setInvoiceForm({ ...invoiceForm, lines: newLines });
    };

    return (
        <div className="space-y-8 pb-12">
            <header className="flex flex-wrap justify-between items-end gap-4">
                <div className="flex flex-col gap-2">
                    <h1 className="text-slate-100 text-4xl font-black tracking-tight">Receivables</h1>
                    <p className="text-slate-400 text-base font-normal">Manage your customers and outgoing invoices with ease.</p>
                </div>
                <div className="flex gap-3">
                    <button
                        onClick={() => setShowCustomerForm(true)}
                        className="flex items-center justify-center rounded-lg h-10 px-4 glass-panel text-slate-100 text-sm font-bold hover:bg-white/10 transition-all"
                    >
                        <span className="material-symbols-outlined text-sm mr-2">person_add</span>
                        Add Customer
                    </button>
                    <button
                        onClick={() => setShowInvoiceForm(true)}
                        disabled={customers.length === 0}
                        className="flex items-center justify-center rounded-lg h-10 px-6 bg-primary text-white text-sm font-bold glow-button hover:bg-blue-600 transition-all disabled:opacity-50"
                    >
                        <span className="material-symbols-outlined text-sm mr-2">add_notes</span>
                        Create Invoice
                    </button>
                </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Customers Table */}
                <div className="glass-panel overflow-hidden bg-slate-900/40 border-white/5 h-fit">
                    <div className="px-6 py-4 bg-white/5 border-b border-white/10 flex justify-between items-center">
                        <h2 className="text-xs font-bold uppercase tracking-widest text-slate-300">Customer Directory</h2>
                    </div>
                    <div className="max-h-[600px] overflow-y-auto overflow-x-hidden">
                        <table className="w-full text-left">
                            <tbody className="divide-y divide-white/5">
                                {customers.map(customer => (
                                    <tr key={customer.id} className="hover:bg-white/5 transition-colors group">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="size-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-xs">
                                                    {customer.name.charAt(0)}
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="text-sm font-semibold text-slate-200">{customer.name}</span>
                                                    <span className="text-[10px] text-slate-500 truncate max-w-[150px]">{customer.email || 'No email'}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <span className="px-2 py-0.5 rounded-full bg-emerald-accent/10 text-emerald-accent text-[10px] font-bold">
                                                {customer.invoices?.length || 0} INVOICES
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Invoices Table */}
                <div className="lg:col-span-2 glass-panel overflow-hidden bg-slate-900/40 border-white/5">
                    <div className="px-8 py-6 border-b border-white/5 flex items-center justify-between">
                        <h3 className="text-xl font-bold text-slate-100">Ledger Invoices</h3>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="text-slate-500 text-xs font-bold uppercase tracking-widest border-b border-white/5">
                                    <th className="px-8 py-4">Invoice #</th>
                                    <th className="px-8 py-4">Customer</th>
                                    <th className="px-8 py-4">Due Date</th>
                                    <th className="px-8 py-4 text-right">Amount</th>
                                    <th className="px-8 py-4">Status</th>
                                    <th className="px-8 py-4">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {invoices.map(invoice => (
                                    <tr key={invoice.id} className="hover:bg-white/5 transition-colors group">
                                        <td className="px-8 py-4 font-bold text-white text-sm">{invoice.invoiceNumber}</td>
                                        <td className="px-8 py-4 text-sm text-slate-300">{invoice.customer?.name}</td>
                                        <td className="px-8 py-4 text-sm text-slate-500">{format(new Date(invoice.dueDate), 'MMM dd, yyyy')}</td>
                                        <td className="px-8 py-4 text-right text-sm font-bold text-slate-100">${invoice.totalAmount.toLocaleString()}</td>
                                        <td className="px-8 py-4">
                                            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase border ${invoice.status === 'PAID'
                                                    ? 'bg-emerald-accent/10 text-emerald-accent border-emerald-accent/20'
                                                    : 'bg-amber-accent/10 text-amber-accent border-amber-accent/20'
                                                }`}>
                                                {invoice.status}
                                            </span>
                                        </td>
                                        <td className="px-8 py-4">
                                            {invoice.status !== 'PAID' && (
                                                <button
                                                    onClick={() => {
                                                        setSelectedInvoice(invoice);
                                                        setPaymentForm({ ...paymentForm, amount: Number(invoice.totalAmount) });
                                                        setShowPaymentModal(true);
                                                    }}
                                                    className="pay-button-glass px-4 py-1.5 rounded-lg text-[10px] font-black tracking-widest uppercase"
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
            {showCustomerForm && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-xl" onClick={() => setShowCustomerForm(false)}></div>
                    <div className="relative w-full max-w-lg bg-slate-900/90 backdrop-blur-2xl rounded-2xl border border-white/10 shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
                        <div className="px-8 py-6 border-b border-white/10 flex justify-between items-center">
                            <h2 className="text-xl font-bold">New Customer</h2>
                            <button onClick={() => setShowCustomerForm(false)} className="text-slate-400 hover:text-white">
                                <span className="material-symbols-outlined">close</span>
                            </button>
                        </div>
                        <form onSubmit={handleCreateCustomer} className="p-8 space-y-6">
                            <input type="text" placeholder="Name *" className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-primary/50 outline-none transition-all" value={customerForm.name} onChange={e => setCustomerForm({ ...customerForm, name: e.target.value })} required />
                            <input type="email" placeholder="Email" className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-primary/50 outline-none transition-all" value={customerForm.email} onChange={e => setCustomerForm({ ...customerForm, email: e.target.value })} />
                            <input type="tel" placeholder="Phone" className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-primary/50 outline-none transition-all" value={customerForm.phone} onChange={e => setCustomerForm({ ...customerForm, phone: e.target.value })} />
                            <button type="submit" disabled={loading} className="w-full py-3 bg-primary text-white rounded-lg text-sm font-bold shadow-lg shadow-primary/20 hover:bg-blue-600 transition-all disabled:opacity-50">
                                {loading ? 'Creating...' : 'Register Customer'}
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {showInvoiceForm && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-xl" onClick={() => setShowInvoiceForm(false)}></div>
                    <div className="relative w-full max-w-3xl bg-slate-900/90 backdrop-blur-2xl rounded-2xl border border-white/10 shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
                        <div className="px-8 py-6 border-b border-white/10 flex justify-between items-center bg-white/5">
                            <h2 className="text-xl font-bold">Generate Invoice</h2>
                            <button onClick={() => setShowInvoiceForm(false)} className="text-slate-400 hover:text-white">
                                <span className="material-symbols-outlined">close</span>
                            </button>
                        </div>
                        <form onSubmit={handleCreateInvoice} className="p-8 space-y-8">
                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Customer Selection</label>
                                    <select value={invoiceForm.customerId} onChange={e => setInvoiceForm({ ...invoiceForm, customerId: e.target.value })} required className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-sm outline-none transition-all focus:ring-2 focus:ring-primary/50">
                                        <option value="" className="bg-slate-900">Select Customer *</option>
                                        {customers.map(c => <option key={c.id} value={c.id} className="bg-slate-900">{c.name}</option>)}
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Invoice Reference #</label>
                                    <input type="text" placeholder="INV-2024-001" value={invoiceForm.invoiceNumber} onChange={e => setInvoiceForm({ ...invoiceForm, invoiceNumber: e.target.value })} required className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-sm outline-none transition-all focus:ring-2 focus:ring-primary/50" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Issuance Date</label>
                                    <input type="date" value={invoiceForm.date} onChange={e => setInvoiceForm({ ...invoiceForm, date: e.target.value })} required className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-sm outline-none transition-all focus:ring-2 focus:ring-primary/50" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Maturity Date</label>
                                    <input type="date" value={invoiceForm.dueDate} onChange={e => setInvoiceForm({ ...invoiceForm, dueDate: e.target.value })} required className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-sm outline-none transition-all focus:ring-2 focus:ring-primary/50" />
                                </div>
                            </div>

                            <div className="space-y-4">
                                <h4 className="text-xs font-bold uppercase tracking-widest text-slate-500 border-b border-white/10 pb-2">Service/Itemized Lines</h4>
                                {invoiceForm.lines.map((line, idx) => (
                                    <div key={idx} className="grid grid-cols-12 gap-3 items-center">
                                        <div className="col-span-6">
                                            <input type="text" placeholder="Description" value={line.description} onChange={e => updateInvoiceLine(idx, 'description', e.target.value)} required className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm outline-none" />
                                        </div>
                                        <div className="col-span-2">
                                            <input type="number" placeholder="Qty" value={line.quantity} onChange={e => updateInvoiceLine(idx, 'quantity', Number(e.target.value))} required className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm outline-none" />
                                        </div>
                                        <div className="col-span-2">
                                            <input type="number" step="0.01" placeholder="Price" value={line.unitPrice} onChange={e => updateInvoiceLine(idx, 'unitPrice', Number(e.target.value))} required className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm outline-none" />
                                        </div>
                                        <div className="col-span-2 text-right font-bold text-slate-300 text-sm">
                                            ${line.amount.toFixed(2)}
                                        </div>
                                    </div>
                                ))}
                                <button type="button" onClick={() => setInvoiceForm({ ...invoiceForm, lines: [...invoiceForm.lines, { description: '', quantity: 1, unitPrice: 0, amount: 0 }] })} className="w-full py-2 border border-dashed border-white/20 rounded-lg text-[10px] font-bold uppercase tracking-widest hover:bg-white/5 transition-all">
                                    + Insert Line Item
                                </button>
                            </div>

                            <div className="pt-4 border-t border-white/10 flex justify-between items-center">
                                <div className="flex flex-col">
                                    <span className="text-[10px] font-bold uppercase text-slate-500">Gross Total Amount</span>
                                    <span className="text-2xl font-black text-white">${invoiceForm.lines.reduce((sum, line) => sum + line.amount, 0).toFixed(2)}</span>
                                </div>
                                <button type="submit" disabled={loading} className="px-8 py-3 bg-primary text-white rounded-xl text-sm font-bold shadow-lg shadow-primary/30 hover:bg-blue-600 transition-all disabled:opacity-50">
                                    Authorize & Issue
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
                        <div className="px-8 py-6 border-b border-white/10 flex justify-between items-center bg-emerald-accent/10">
                            <h2 className="text-xl font-bold text-emerald-accent">Record Receipt</h2>
                            <button onClick={() => setShowPaymentModal(false)} className="text-slate-400 hover:text-white">
                                <span className="material-symbols-outlined">close</span>
                            </button>
                        </div>
                        <form onSubmit={handleRecordPayment} className="p-8 space-y-6">
                            <p className="text-sm text-slate-400">Recording payment receipt for Invoice <strong className="text-white">{selectedInvoice?.invoiceNumber}</strong></p>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="text-[10px] font-bold uppercase text-slate-500">Payment Date</label>
                                    <input type="date" value={paymentForm.date} onChange={e => setPaymentForm({ ...paymentForm, date: e.target.value })} required className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-sm" />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] font-bold uppercase text-slate-500">Amount Recv.</label>
                                    <input type="number" step="0.01" value={paymentForm.amount} onChange={e => setPaymentForm({ ...paymentForm, amount: Number(e.target.value) })} required className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-sm" />
                                </div>
                            </div>
                            <div className="space-y-1">
                                <label className="text-[10px] font-bold uppercase text-slate-500">Method</label>
                                <select value={paymentForm.method} onChange={e => setPaymentForm({ ...paymentForm, method: e.target.value as any })} className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-sm">
                                    <option value="BANK" className="bg-slate-900">BANK TRANSFER</option>
                                    <option value="CASH" className="bg-slate-900">CASH</option>
                                    <option value="CHECK" className="bg-slate-900">CHECK</option>
                                </select>
                            </div>
                            <div className="space-y-1">
                                <label className="text-[10px] font-bold uppercase text-slate-500">Ref / Check #</label>
                                <input type="text" placeholder="TX-99201" value={paymentForm.reference} onChange={e => setPaymentForm({ ...paymentForm, reference: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-sm" />
                            </div>
                            <button type="submit" disabled={loading} className="w-full py-3 bg-emerald-accent text-white rounded-lg text-sm font-bold shadow-lg shadow-emerald-accent/20 hover:bg-emerald-600 transition-all">
                                {loading ? 'Processing...' : 'Post Transaction'}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
