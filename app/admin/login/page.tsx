'use client';

import React, { useState } from 'react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function AdminLoginPage() {
    const [identifier, setIdentifier] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            if (!auth) throw new Error('Firebase not initialized');

            let email = '';

            const response = await fetch(`/api/auth/login-lookup?username=${encodeURIComponent(identifier)}`);

            if (!response.ok) {
                let errorMessage = 'Invalid admin credentials';
                try {
                    const data = await response.json();
                    if (response.status === 403) {
                        errorMessage = data.error === 'PENDING_APPROVAL'
                            ? 'Account pending approval.'
                            : 'Account access revoked.';
                    } else if (data.error) {
                        errorMessage = data.error;
                    }
                } catch (e) {
                    console.error('Failed to parse error response:', e);
                }
                throw new Error(errorMessage);
            }

            const data = await response.json();

            if (data.role !== 'ADMIN') {
                throw new Error('Unauthorized Access: Administrator privileges required.');
            }

            email = data.email;

            await signInWithEmailAndPassword(auth, email, password);
            router.push('/admin/users');
        } catch (err: any) {
            setError(err.message === 'Firebase: Error (auth/invalid-credential).' ? 'Invalid admin credentials' : err.message);
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#0B0F19] p-4 relative overflow-hidden">
            <div className="absolute top-1/2 left-1/2 -mt-[400px] -ml-[400px] w-[800px] h-[800px] bg-purple-600/20 rounded-full blur-[120px] pointer-events-none"></div>

            <div className="w-full max-w-sm bg-slate-900/60 p-10 rounded-3xl border border-slate-700/50 shadow-2xl relative z-10 backdrop-blur-xl">

                <div className="text-center mb-10">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-purple-600 mb-4 shadow-xl shadow-purple-600/20">
                        <span className="material-symbols-outlined text-white text-3xl">admin_panel_settings</span>
                    </div>
                    <h1 className="text-2xl font-bold tracking-tight text-white mb-1">Admin Portal</h1>
                    <p className="text-slate-400 text-sm font-medium uppercase tracking-wider">Restricted Access</p>
                </div>

                {error && (
                    <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm text-center">
                        {error}
                    </div>
                )}

                <form onSubmit={handleLogin} className="space-y-5">
                    <div className="space-y-2">
                        <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 ml-1">Admin ID</label>
                        <div className="relative">
                            <input
                                type="text"
                                value={identifier}
                                onChange={(e) => setIdentifier(e.target.value)}
                                className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-3.5 text-sm focus:ring-2 focus:ring-purple-500 outline-none text-white text-center tracking-wider"
                                placeholder="Enter Username"
                                required
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 ml-1">Passkey</label>
                        <div className="relative">
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-3.5 text-sm focus:ring-2 focus:ring-purple-500 outline-none text-white text-center font-mono tracking-widest"
                                placeholder="••••••••"
                                required
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-purple-600 hover:bg-purple-500 text-white font-bold py-3.5 rounded-xl shadow-lg transition-all disabled:opacity-50 mt-4 uppercase tracking-widest text-sm"
                    >
                        {loading ? 'Authenticating...' : 'Authorize Access'}
                    </button>
                </form>

                <div className="mt-8 text-center">
                    <Link href="/login" className="text-xs text-slate-500 hover:text-slate-300 transition-colors uppercase tracking-wider font-bold">
                        Return to User Login
                    </Link>
                </div>
            </div>
        </div>
    );
}
