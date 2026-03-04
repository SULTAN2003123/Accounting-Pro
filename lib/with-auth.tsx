'use client';

import { useAuth } from '@/lib/auth-context';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect } from 'react';

/**
 * Higher-order component to protect routes.
 * Redirects to /login if the user is not authenticated.
 */
export function withAuth<P extends object>(Component: React.ComponentType<P>) {
    return function ProtectedRoute(props: P) {
        const { user, loading } = useAuth();
        const router = useRouter();
        const pathname = usePathname();

        useEffect(() => {
            if (!loading && !user && pathname !== '/login' && pathname !== '/register') {
                router.push('/login');
            }
        }, [user, loading, router, pathname]);

        if (loading) {
            return (
                <div className="flex items-center justify-center min-h-screen bg-background-dark">
                    <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                </div>
            );
        }

        if (!user && pathname !== '/login' && pathname !== '/register') {
            return null;
        }

        return <Component {...props} />;
    };
}
