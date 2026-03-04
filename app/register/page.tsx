'use client';

import React, { useState } from 'react';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function RegisterPage() {
    const [email, setEmail] = useState('');
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [isPending, setIsPending] = useState(false);
    const router = useRouter();

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            if (!auth) throw new Error('Firebase not initialized');

            // Create user in Firebase with actual email
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;

            // 3. Update Firebase profile with Display Name
            if (name) {
                await updateProfile(user, { displayName: name });
            }

            // 4. Register in our local database via API
            const response = await fetch('/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    username,
                    email,
                    firebaseUid: user.uid,
                    name
                }),
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.error || 'Failed to sync user with database');
            }

            // Sign out the user immediately because they are pending approval
            await auth.signOut();
            setIsPending(true);
        } catch (err: any) {
            setError(err.message);
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-dashboard-gradient p-4">
            <div className="w-full max-w-md glass-panel p-8 rounded-3xl border border-white/10 shadow-2xl">
                {isPending ? (
                    <div className="text-center space-y-6">
                        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-amber-500/20 text-amber-500 mb-2 shadow-[0_0_30px_rgba(245,158,11,0.2)]">
                            <span className="material-symbols-outlined text-4xl">hourglass_empty</span>
                        </div>
                        <h2 className="text-2xl font-bold tracking-tight text-white">Registration Complete</h2>
                        <div className="p-4 rounded-2xl bg-slate-800/40 border border-slate-700/50">
                            <p className="text-slate-300 text-sm leading-relaxed">
                                Your account has been created successfully, but it <strong className="text-amber-400 font-semibold">requires administrator approval</strong> before you can log in.
                            </p>
                            <p className="text-slate-400 text-xs mt-3">
                                Please check back later or contact your system administrator.
                            </p>
                        </div>
                        <Link href="/login" className="inline-flex items-center justify-center w-full bg-slate-800 hover:bg-slate-700 text-white font-bold py-4 rounded-2xl border border-slate-600 transition-all">
                            Return to Login
                        </Link>
                    </div>
                ) : (
                    <>
                        <div className="text-center mb-8">
                            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary mb-4 shadow-lg shadow-primary/20">
                                <span className="material-symbols-outlined text-white text-3xl">person_add</span>
                            </div>
                            <h1 className="text-3xl font-bold tracking-tight text-white mb-2">Create Account</h1>
                            <p className="text-slate-400">Join FinanceOS Enterprise</p>
                        </div>

                        {error && (
                            <div className="mb-6 p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-500 text-sm flex items-center gap-3 animate-shake">
                                <span className="material-symbols-outlined text-lg">error</span>
                                {error}
                            </div>
                        )}

                        <form onSubmit={handleRegister} className="space-y-5">
                            <div className="space-y-2">
                                <label className="text-xs font-bold uppercase tracking-wider text-slate-400 ml-1">Full Name</label>
                                <div className="relative group">
                                    <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-slate-500 group-focus-within:text-primary transition-colors">
                                        <span className="material-symbols-outlined">badge</span>
                                    </span>
                                    <input
                                        type="text"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        className="w-full bg-slate-800/40 border border-slate-700/50 rounded-2xl pl-12 pr-4 py-3.5 text-sm focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all placeholder:text-slate-600"
                                        placeholder="e.g. Alexander Reed"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-bold uppercase tracking-wider text-slate-400 ml-1">Email Address</label>
                                <div className="relative group">
                                    <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-slate-500 group-focus-within:text-primary transition-colors">
                                        <span className="material-symbols-outlined">mail</span>
                                    </span>
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="w-full bg-slate-800/40 border border-slate-700/50 rounded-2xl pl-12 pr-4 py-3.5 text-sm focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all placeholder:text-slate-600"
                                        placeholder="you@company.com"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-bold uppercase tracking-wider text-slate-400 ml-1">Username</label>
                                <div className="relative group">
                                    <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-slate-500 group-focus-within:text-primary transition-colors">
                                        <span className="material-symbols-outlined">alternate_email</span>
                                    </span>
                                    <input
                                        type="text"
                                        value={username}
                                        onChange={(e) => setUsername(e.target.value)}
                                        className="w-full bg-slate-800/40 border border-slate-700/50 rounded-2xl pl-12 pr-4 py-3.5 text-sm focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all placeholder:text-slate-600"
                                        placeholder="choose_username"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-bold uppercase tracking-wider text-slate-400 ml-1">Secure Password</label>
                                <div className="relative group">
                                    <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-slate-500 group-focus-within:text-primary transition-colors">
                                        <span className="material-symbols-outlined">lock</span>
                                    </span>
                                    <input
                                        type="password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="w-full bg-slate-800/40 border border-slate-700/50 rounded-2xl pl-12 pr-4 py-3.5 text-sm focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all placeholder:text-slate-600"
                                        placeholder="••••••••"
                                        required
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-primary hover:bg-primary-hover text-white font-bold py-4 rounded-2xl shadow-lg shadow-primary/20 transition-all flex items-center justify-center gap-2 group disabled:opacity-50 disabled:cursor-not-allowed mt-4"
                            >
                                {loading ? (
                                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                ) : (
                                    <>
                                        Create Account
                                        <span className="material-symbols-outlined transition-transform group-hover:translate-x-1">arrow_forward</span>
                                    </>
                                )}
                            </button>
                        </form>

                        <div className="mt-8 text-center">
                            <p className="text-slate-500 text-sm">
                                Already have an account?{' '}
                                <Link href="/login" className="text-primary hover:text-primary-hover font-bold transition-colors">
                                    Sign In
                                </Link>
                            </p>
                        </div>

                        <div className="mt-8 pt-6 border-t border-white/5 flex items-center justify-center gap-4 text-slate-500">
                            <span className="material-symbols-outlined text-lg">shield</span>
                            <p className="text-[10px] uppercase tracking-widest font-bold">Encrypted Connection</p>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
