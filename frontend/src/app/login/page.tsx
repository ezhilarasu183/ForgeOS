"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { User, Lock, Shield, Users, ArrowRight, Sparkles, ChevronRight, Eye, EyeOff } from 'lucide-react';

import { API_BASE_URL } from '@/lib/api';

type Panel = 'admin' | 'employee';

export default function LoginPage() {
    const router = useRouter();
    const [activePanel, setActivePanel] = useState<Panel>('admin');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');
        try {
            const response = await fetch(`${API_BASE_URL}/api/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: email.trim(), password }),
            });

            if (response.ok) {
                const userData = await response.json();
                const isAdmin = userData.role === 'Admin';

                // Role match validation based on the active panel
                if (activePanel === 'admin' && !isAdmin) {
                    setError('This account is an Employee. Please CLICK the "Employee Portal" card above to sign in.');
                    setIsLoading(false);
                    return;
                }
                if (activePanel === 'employee' && isAdmin) {
                    setError('This account is an Admin. Please CLICK the "Admin Portal" card above to sign in.');
                    setIsLoading(false);
                    return;
                }

                localStorage.setItem('user', JSON.stringify(userData));
                router.push(isAdmin ? '/admin/dashboard' : '/employee/dashboard');
            } else {
                const data = await response.json().catch(() => ({}));
                setError(data.error || 'Invalid email or password. Please verify your credentials.');
            }
        } catch {
            setError('Connection Failed: Make sure the backend (python app.py) is running on port 5000.');
        } finally {
            setIsLoading(false);
        }
    };

    const isAdminPanel = activePanel === 'admin';

    const togglePanel = (panel: Panel) => {
        setActivePanel(panel);
        setError('');
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 via-white to-orange-100/40 p-4">
            {/* Background elements */}
            <div className="fixed top-0 left-0 w-96 h-96 bg-orange-200/30 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2 pointer-events-none" />
            <div className="fixed bottom-0 right-0 w-96 h-96 bg-orange-300/20 rounded-full blur-3xl translate-x-1/2 translate-y-1/2 pointer-events-none" />

            <div className="w-full max-w-4xl relative">
                {/* Logo/Header */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center gap-2 bg-white border border-orange-100 rounded-full px-4 py-1.5 shadow-sm mb-4">
                        <Sparkles size={14} className="text-jira-orange" />
                        <span className="text-xs font-bold text-gray-600">AI Project Management</span>
                    </div>
                    <h1 className="text-4xl font-black text-notion-text">Portal Login</h1>
                    <p className="text-gray-500 mt-2 text-sm italic">"Precision in Planning, Power in AI"</p>
                </div>

                {/* Split Panel System */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                    {/* ──── ADMIN CARD ──── */}
                    <div
                        className={`relative rounded-3xl transition-all duration-300 cursor-pointer overflow-hidden ${isAdminPanel
                            ? 'shadow-2xl shadow-orange-200 ring-4 ring-jira-orange scale-[1.02] z-10'
                            : 'shadow-lg hover:shadow-xl opacity-80 hover:opacity-100 hover:scale-[1.01]'
                            }`}
                        onClick={() => togglePanel('admin')}
                    >
                        {/* Status badge */}
                        {isAdminPanel && (
                            <div className="absolute top-4 right-4 z-20">
                                <span className="bg-white text-jira-orange text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-tighter">Active Form</span>
                            </div>
                        )}

                        <div className="bg-gradient-to-br from-jira-orange to-orange-600 p-8 text-white">
                            <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-md mb-4 shadow-inner">
                                <Shield size={32} className="text-white" />
                            </div>
                            <h2 className="text-2xl font-black tracking-tight">Admin Portal</h2>
                            <p className="text-white/80 text-xs mt-1">Global settings & user architecture</p>
                        </div>

                        <div className="bg-white p-8">
                            {isAdminPanel ? (
                                <form onSubmit={handleLogin} className="space-y-5" onClick={e => e.stopPropagation()}>
                                    {error && (
                                        <div className="text-xs font-bold text-red-600 bg-red-50 border border-red-100 rounded-xl px-4 py-3 shadow-sm ring-1 ring-red-200">
                                            ⚠️ {error}
                                        </div>
                                    )}
                                    <div>
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Admin Identity (Email)</label>
                                        <div className="relative mt-1">
                                            <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-300" />
                                            <input
                                                type="text" required
                                                value={email}
                                                onChange={e => setEmail(e.target.value)}
                                                placeholder="admin@aipm.com"
                                                className="w-full pl-11 pr-4 py-3 bg-gray-50/50 border border-gray-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-jira-orange/30 focus:bg-white focus:border-jira-orange transition-all font-medium shadow-inner"
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Secure Password</label>
                                        <div className="relative mt-1">
                                            <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-300" />
                                            <input
                                                type={showPassword ? "text" : "password"} required
                                                value={password}
                                                onChange={e => setPassword(e.target.value)}
                                                placeholder="••••••••"
                                                className="w-full pl-11 pr-11 py-3 bg-gray-50/50 border border-gray-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-jira-orange/30 focus:bg-white focus:border-jira-orange transition-all font-medium shadow-inner"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowPassword(!showPassword)}
                                                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-300 hover:text-jira-orange transition-colors"
                                            >
                                                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                            </button>
                                        </div>
                                    </div>
                                    <button
                                        type="submit"
                                        disabled={isLoading}
                                        className="w-full bg-gradient-to-r from-jira-orange to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-black py-4 rounded-xl text-sm flex items-center justify-center gap-3 transition-all shadow-xl shadow-orange-200 active:scale-[0.98] disabled:opacity-50"
                                    >
                                        {isLoading ? (
                                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        ) : (
                                            <>AUTHORIZE & ENTER <ArrowRight size={18} /></>
                                        )}
                                    </button>
                                </form>
                            ) : (
                                <div className="py-6 text-center text-gray-400 font-bold text-sm">
                                    <p>Tap to switch to Admin Access</p>
                                    <ChevronRight size={24} className="mx-auto mt-2 text-gray-200" />
                                </div>
                            )}
                        </div>
                    </div>

                    {/* ──── EMPLOYEE CARD ──── */}
                    <div
                        className={`relative rounded-3xl transition-all duration-300 cursor-pointer overflow-hidden ${!isAdminPanel
                            ? 'shadow-2xl shadow-emerald-200 ring-4 ring-emerald-500 scale-[1.02] z-10'
                            : 'shadow-lg hover:shadow-xl opacity-80 hover:opacity-100 hover:scale-[1.01]'
                            }`}
                        onClick={() => togglePanel('employee')}
                    >
                        {/* Status badge */}
                        {!isAdminPanel && (
                            <div className="absolute top-4 right-4 z-20">
                                <span className="bg-white text-emerald-600 text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-tighter">Active Form</span>
                            </div>
                        )}

                        <div className="bg-gradient-to-br from-emerald-500 to-teal-600 p-8 text-white">
                            <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-md mb-4 shadow-inner">
                                <Users size={32} className="text-white" />
                            </div>
                            <h2 className="text-2xl font-black tracking-tight">Employee Hub</h2>
                            <p className="text-white/80 text-xs mt-1">Project tools & personal dashboard</p>
                        </div>

                        <div className="bg-white p-8">
                            {!isAdminPanel ? (
                                <form onSubmit={handleLogin} className="space-y-5" onClick={e => e.stopPropagation()}>
                                    {error && (
                                        <div className="text-xs font-bold text-red-600 bg-red-50 border border-red-100 rounded-xl px-4 py-3 shadow-sm ring-1 ring-red-200">
                                            ⚠️ {error}
                                        </div>
                                    )}
                                    <div>
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Employee Email</label>
                                        <div className="relative mt-1">
                                            <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-300" />
                                            <input
                                                type="text" required
                                                value={email}
                                                onChange={e => setEmail(e.target.value)}
                                                placeholder="you@company.com"
                                                className="w-full pl-11 pr-4 py-3 bg-gray-50/50 border border-gray-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400/30 focus:bg-white focus:border-emerald-500 transition-all font-medium shadow-inner"
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Password</label>
                                        <div className="relative mt-1">
                                            <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-300" />
                                            <input
                                                type={showPassword ? "text" : "password"} required
                                                value={password}
                                                onChange={e => setPassword(e.target.value)}
                                                placeholder="••••••••"
                                                className="w-full pl-11 pr-11 py-3 bg-gray-50/50 border border-gray-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400/30 focus:bg-white focus:border-emerald-500 transition-all font-medium shadow-inner"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowPassword(!showPassword)}
                                                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-300 hover:text-emerald-500 transition-colors"
                                            >
                                                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                            </button>
                                        </div>
                                    </div>
                                    <button
                                        type="submit"
                                        disabled={isLoading}
                                        className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-black py-4 rounded-xl text-sm flex items-center justify-center gap-3 transition-all shadow-xl shadow-emerald-100 active:scale-[0.98] disabled:opacity-50"
                                    >
                                        {isLoading ? (
                                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        ) : (
                                            <>LOG IN & START WORK <ArrowRight size={18} /></>
                                        )}
                                    </button>
                                </form>
                            ) : (
                                <div className="py-6 text-center text-gray-400 font-bold text-sm">
                                    <p>Tap to switch to Employee Login</p>
                                    <ChevronRight size={24} className="mx-auto mt-2 text-gray-200" />
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Bottom Disclaimer */}
                <div className="mt-12 text-center">
                    <p className="text-[11px] text-gray-400 font-medium">
                        Secure AI Authentication Protocol Active &bull; &copy; {new Date().getFullYear()} AI-PM Systems
                    </p>
                </div>
            </div>
        </div>
    );
}
