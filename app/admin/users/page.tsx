"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth-context";
import { useRouter } from "next/navigation";

type User = {
    id: string;
    username: string;
    name: string;
    role: string;
    status: string;
    createdAt: string;
};

export default function AdminUsersPage() {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [roleChecked, setRoleChecked] = useState(false);
    const [authError, setAuthError] = useState("");

    const { user: authUser } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!authUser?.email) return;

        const checkRole = async () => {
            try {
                const res = await fetch(`/api/auth/role?email=${encodeURIComponent(authUser.email!)}`);
                const data = await res.json();
                if (data.role !== 'ADMIN') {
                    router.push('/');
                } else {
                    setRoleChecked(true);
                    fetchUsers();
                }
            } catch (err) {
                setAuthError("Failed to verify admin status.");
                router.push('/');
            }
        };

        checkRole();
    }, [authUser, router]);

    const fetchUsers = async () => {
        try {
            const res = await fetch("/api/admin/users");
            if (!res.ok) throw new Error("Failed to fetch users");
            const data = await res.json();
            setUsers(data);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateStatus = async (id: string, status: string) => {
        try {
            const res = await fetch(`/api/admin/users/${id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ status })
            });
            if (!res.ok) throw new Error("Failed to update status");
            fetchUsers(); // Refresh the list
        } catch (err: any) {
            alert(err.message);
        }
    };

    if (authError) {
        return <div className="min-h-screen flex items-center justify-center text-red-400">{authError}</div>;
    }

    if (!roleChecked) {
        return (
            <div className="min-h-screen flex items-center justify-center text-slate-400">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-sm uppercase tracking-widest font-bold">Verifying Administrator Privileges...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="relative w-full p-8 lg:p-12">
            <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-primary/20 rounded-full blur-[120px] opacity-20 pointer-events-none translate-x-1/3 -translate-y-1/3"></div>

            <div className="max-w-6xl mx-auto space-y-8 relative z-10">
                <header>
                    <h1 className="text-3xl font-bold mb-2">User Management</h1>
                    <p className="text-slate-400">View and manage user accounts and approvals.</p>
                </header>

                {error && (
                    <div className="p-4 bg-red-500/10 border border-red-500/50 rounded-2xl text-red-500">
                        {error}
                    </div>
                )}

                <div className="bg-slate-800/20 border border-slate-700/50 rounded-3xl overflow-hidden backdrop-blur-xl">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-slate-700/50 bg-slate-800/40">
                                    <th className="p-4 text-slate-400 font-medium text-sm">Name</th>
                                    <th className="p-4 text-slate-400 font-medium text-sm">Username</th>
                                    <th className="p-4 text-slate-400 font-medium text-sm">Role</th>
                                    <th className="p-4 text-slate-400 font-medium text-sm">Status</th>
                                    <th className="p-4 text-slate-400 font-medium text-sm">Date Reg.</th>
                                    <th className="p-4 text-slate-400 font-medium text-sm text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-700/50">
                                {loading ? (
                                    <tr>
                                        <td colSpan={6} className="p-8 text-center text-slate-400">Loading users...</td>
                                    </tr>
                                ) : users.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="p-8 text-center text-slate-400">No users found.</td>
                                    </tr>
                                ) : (
                                    users.map((user) => (
                                        <tr key={user.id} className="hover:bg-slate-800/30 transition-colors">
                                            <td className="p-4">{user.name}</td>
                                            <td className="p-4 text-slate-400">{user.username}</td>
                                            <td className="p-4">
                                                <span className={`px-2 py-1 rounded-full text-xs font-bold ${user.role === 'ADMIN' ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20' : 'bg-slate-700/50 text-slate-300'
                                                    }`}>
                                                    {user.role}
                                                </span>
                                            </td>
                                            <td className="p-4">
                                                <span className={`px-2 py-1 rounded-full text-xs font-bold border ${user.status === 'APPROVED' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                                                    user.status === 'REJECTED' ? 'bg-red-500/10 text-red-400 border-red-500/20' :
                                                        'bg-amber-500/10 text-amber-400 border-amber-500/20'
                                                    }`}>
                                                    {user.status}
                                                </span>
                                            </td>
                                            <td className="p-4 text-slate-500 text-sm">
                                                {new Date(user.createdAt).toLocaleDateString()}
                                            </td>
                                            <td className="p-4 text-right space-x-2">
                                                {user.status !== 'APPROVED' && (
                                                    <button
                                                        onClick={() => handleUpdateStatus(user.id, 'APPROVED')}
                                                        className="px-3 py-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 rounded-lg text-sm font-medium transition-colors"
                                                    >
                                                        Approve
                                                    </button>
                                                )}
                                                {user.status !== 'REJECTED' && (
                                                    <button
                                                        onClick={() => handleUpdateStatus(user.id, 'REJECTED')}
                                                        className="px-3 py-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 rounded-lg text-sm font-medium transition-colors"
                                                    >
                                                        Reject
                                                    </button>
                                                )}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}
