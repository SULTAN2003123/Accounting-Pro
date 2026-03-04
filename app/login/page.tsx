'use client';

import React, { useState } from 'react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function LoginPage() {
    const [identifier, setIdentifier] = useState(''); // email or username
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

            // Resolve email and check approval status from username
            const response = await fetch(`/api/auth/login-lookup?username=${encodeURIComponent(identifier)}`);
            const data = await response.json();

            if (!response.ok) {
                if (response.status === 403) {
                    throw new Error(data.error === 'PENDING_APPROVAL'
                        ? 'Your account is pending administrator approval.'
                        : 'Your account access has been revoked.');
                }
                throw new Error('Invalid username or password');
            }

            email = data.email;

            // SignIn with Firebase
            await signInWithEmailAndPassword(auth, email, password);
            router.push('/');
        } catch (err: any) {
            setError(err.message === 'Firebase: Error (auth/invalid-credential).' ? 'Invalid username/email or password' : err.message);
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-dashboard-gradient p-4">
            <div className="w-full max-w-md glass-panel p-10 rounded-3xl border border-white/10 shadow-2xl relative overflow-hidden">
                <div className="absolute -top-24 -right-24 w-48 h-48 bg-primary/10 rounded-full blur-3xl"></div>

                <div className="text-center mb-10 relative z-10">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary mb-4 shadow-xl shadow-primary/20">
                        <span className="material-symbols-outlined text-white text-3xl">lock_open</span>
                    </div>
                    <h1 className="text-3xl font-bold tracking-tight text-white mb-2">FinanceOS</h1>
                    <p className="text-slate-400 font-medium">Enterprise Portal</p>
                </div>

                {error && (
                    <div className="mb-6 p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-500 text-sm flex items-center gap-3 animate-shake">
                        <span className="material-symbols-outlined text-lg">warning</span>
                        {error}
                    </div>
                )}

                <form onSubmit={handleLogin} className="space-y-6 relative z-10">
                    <div className="space-y-2">
                        <label className="text-xs font-bold uppercase tracking-wider text-slate-400 ml-1">Username</label>
                        <div className="relative group">
                            <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-slate-500 group-focus-within:text-primary transition-colors">
                                <span className="material-symbols-outlined">person</span>
                            </span>
                            <input
                                type="text"
                                value={identifier}
                                onChange={(e) => setIdentifier(e.target.value)}
                                className="w-full bg-slate-800/40 border border-slate-700/50 rounded-2xl pl-12 pr-4 py-4 text-sm focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all placeholder:text-slate-600"
                                placeholder="Enter your username"
                                required
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <div className="flex items-center justify-between mb-1">
                            <label className="text-xs font-bold uppercase tracking-wider text-slate-400 ml-1">Password</label>
                            <a href="#" className="text-[10px] text-primary hover:text-primary-hover font-bold uppercase tracking-widest">Forgot?</a>
                        </div>
                        <div className="relative group">
                            <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-slate-500 group-focus-within:text-primary transition-colors">
                                <span className="material-symbols-outlined">lock</span>
                            </span>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full bg-slate-800/40 border border-slate-700/50 rounded-2xl pl-12 pr-4 py-4 text-sm focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all placeholder:text-slate-600"
                                placeholder="••••••••"
                                required
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-primary hover:bg-primary-hover text-white font-bold py-4 rounded-2xl shadow-xl shadow-primary/20 transition-all flex items-center justify-center gap-2 group disabled:opacity-50 disabled:cursor-not-allowed mt-4"
                    >
                        {loading ? (
                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        ) : (
                            <>
                                Sign Into Console
                                <span className="material-symbols-outlined transition-transform group-hover:translate-x-1">login</span>
                            </>
                        )}
                    </button>
                </form>

                <div className="mt-10 text-center relative z-10">
                    <p className="text-slate-500 text-sm">
                        New team member?{' '}
                        <Link href="/register" className="text-primary hover:text-primary-hover font-bold transition-colors underline underline-offset-4 decoration-primary/30">
                            Register now
                        </Link>
                    </p>
                </div>

                <div className="mt-10 pt-6 border-t border-white/5 flex items-center justify-between opacity-40 grayscale group hover:opacity-100 hover:grayscale-0 transition-all">
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                        <span className="text-[10px] uppercase tracking-widest font-bold text-slate-400">Node Cluster: US-WEST-2</span>
                    </div>
                    <span className="material-symbols-outlined text-slate-400">verified_user</span>
                </div>
            </div>

            {/* Admin Login Button - Bottom Left */}
            <div className="absolute bottom-6 left-6 z-20">
                <Link
                    href="/admin/login"
                    className="flex items-center gap-2 px-4 py-2 bg-slate-900/40 border border-slate-700/50 hover:bg-slate-800/60 rounded-xl text-slate-400 hover:text-white transition-all backdrop-blur-sm text-xs font-bold uppercase tracking-widest shadow-lg"
                >
                    <span className="material-symbols-outlined text-[16px]">admin_panel_settings</span>
                    Admin Login
                </Link>
            </div>
        </div>
    );
}
