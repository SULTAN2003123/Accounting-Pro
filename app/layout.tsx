'use client';

import { Metadata } from 'next';
import './globals.css';
import Link from 'next/link';
import { AuthProvider, useAuth } from '@/lib/auth-context';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect } from 'react';

function ProtectedLayout({ children }: { children: React.ReactNode }) {
  const { user, loading, logout } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  const isAuthPage = pathname === '/login' || pathname === '/register' || pathname === '/admin/login';
  const isAdminRoute = pathname?.startsWith('/admin') && pathname !== '/admin/login';

  useEffect(() => {
    if (!loading && !user && !isAuthPage) {
      router.push('/login');
    }
  }, [user, loading, isAuthPage, router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background-dark">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (isAuthPage) {
    return <>{children}</>;
  }

  if (!user) {
    return null;
  }

  if (isAdminRoute) {
    return (
      <div className="bg-[#0B0F19] min-h-screen text-slate-100 font-display flex flex-col">
        <header className="px-8 py-4 border-b border-slate-800 flex justify-between items-center bg-slate-900/50 backdrop-blur-md sticky top-0 z-50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-600 flex items-center justify-center shadow-lg shadow-purple-600/20">
              <span className="material-symbols-outlined text-white">admin_panel_settings</span>
            </div>
            <div>
              <h2 className="text-xl font-bold tracking-tight">Admin Console</h2>
            </div>
          </div>
          <button
            onClick={logout}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-rose-400 hover:bg-rose-500/10 transition-colors font-medium text-sm"
          >
            <span className="material-symbols-outlined text-sm">logout</span>
            Sign Out
          </button>
        </header>
        <div className="flex-1 overflow-auto">
          {children}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-background-light dark:bg-background-dark font-display text-slate-900 dark:text-slate-100 min-h-screen flex overflow-hidden">
      {/* Left Sidebar */}
      <aside className="w-64 sidebar-glass h-screen flex flex-col shrink-0 z-20">
        <div className="p-6 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center shadow-lg shadow-primary/20">
            <span className="material-symbols-outlined text-white text-2xl">account_balance_wallet</span>
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-tight">FinanceOS</h1>
            <p className="text-xs text-slate-400 font-medium uppercase tracking-wider">Enterprise</p>
          </div>
        </div>

        <nav className="flex-1 px-4 space-y-1 mt-4">
          <Link href="/" className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${pathname === '/' ? 'bg-primary/20 text-white' : 'text-slate-400 hover:text-slate-100 hover:bg-white/5'}`}>
            <span className="material-symbols-outlined">dashboard</span>
            <span className="text-sm">Dashboard</span>
          </Link>
          <Link href="/journal" className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${pathname.startsWith('/journal') ? 'bg-primary/20 text-white' : 'text-slate-400 hover:text-slate-100 hover:bg-white/5'}`}>
            <span className="material-symbols-outlined">receipt_long</span>
            <span className="text-sm">Journal</span>
          </Link>
          <Link href="/accounts" className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${pathname.startsWith('/accounts') ? 'bg-primary/20 text-white' : 'text-slate-400 hover:text-slate-100 hover:bg-white/5'}`}>
            <span className="material-symbols-outlined">account_balance</span>
            <span className="text-sm">Accounts</span>
          </Link>
          <Link href="/reports" className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${pathname.startsWith('/reports') ? 'bg-primary/20 text-white' : 'text-slate-400 hover:text-slate-100 hover:bg-white/5'}`}>
            <span className="material-symbols-outlined">analytics</span>
            <span className="text-sm">Reports</span>
          </Link>
        </nav>

        <div className="p-4 mt-auto border-t border-white/5">
          <div className="p-4 glass-panel bg-white/5 rounded-xl border-white/10">
            <div className="flex items-center gap-2 text-emerald-accent">
              <span className="w-2 h-2 rounded-full bg-emerald-accent shadow-[0_0_8px_var(--emerald-accent)]"></span>
              <span className="text-xs font-bold uppercase tracking-wider">System Online</span>
            </div>
            <p className="text-[10px] text-slate-500 mt-1 uppercase">Secure Connection</p>
          </div>
          <button
            onClick={logout}
            className="w-full mt-4 flex items-center gap-3 px-4 py-3 rounded-xl text-rose-accent hover:bg-rose-accent/10 transition-all cursor-pointer"
          >
            <span className="material-symbols-outlined">logout</span>
            <span className="text-sm font-semibold">Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col h-screen overflow-y-auto relative bg-dashboard-gradient">
        <header className="sticky top-0 z-10 glass-effect bg-background-dark/40 px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <h2 className="text-xl font-bold">LedgerPro</h2>
            <div className="relative group">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-500">
                <span className="material-symbols-outlined text-xl">search</span>
              </span>
              <input
                className="bg-slate-800/40 border-slate-700/50 rounded-xl pl-10 pr-4 py-2 text-sm focus:ring-primary focus:border-primary w-64 glass-effect outline-none"
                placeholder="Search ledger..."
                type="text"
              />
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <button className="p-2 rounded-xl bg-slate-800/40 border border-slate-700/50 hover:bg-slate-700 transition-all text-slate-400">
                <span className="material-symbols-outlined text-xl">notifications</span>
              </button>
              <button className="p-2 rounded-xl bg-slate-800/40 border border-slate-700/50 hover:bg-slate-700 transition-all text-slate-400">
                <span className="material-symbols-outlined text-xl">calendar_today</span>
              </button>
            </div>
            <div className="h-8 w-px bg-slate-700/50 mx-2"></div>
            <div className="flex items-center gap-3 bg-slate-800/40 p-1.5 pr-4 rounded-xl border border-slate-700/50">
              <div className="w-8 h-8 rounded-lg overflow-hidden bg-primary/20 flex items-center justify-center text-primary font-bold text-xs uppercase">
                {user.email?.substring(0, 2) || 'US'}
              </div>
              <div className="hidden sm:block">
                <p className="text-xs font-bold">{user.displayName || user.email}</p>
                <p className="text-[10px] text-slate-400 uppercase tracking-tighter">Authorized User</p>
              </div>
            </div>
          </div>
        </header>

        <div className="p-8">
          {children}
        </div>
      </main>
    </div>
  );
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap" rel="stylesheet" />
        <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet" />
      </head>
      <body>
        <AuthProvider>
          <ProtectedLayout>
            {children}
          </ProtectedLayout>
        </AuthProvider>
      </body>
    </html>
  );
}
