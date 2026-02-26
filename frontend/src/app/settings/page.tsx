"use client";

import React, { useEffect, useState } from 'react';
import { PanelLayout } from '@/layouts/PanelLayout';
import { Card } from '@/components/Card';
import { Moon, Sun, Monitor, Palette, Bell, Shield, User } from 'lucide-react';
import { cn } from '@/app/lib/utils';

type Theme = 'light' | 'dark' | 'system';

export default function SettingsPage() {
    const [theme, setTheme] = useState<Theme>('light');
    const [role, setRole] = useState<'admin' | 'employee'>('employee');
    const [user, setUser] = useState<any>(null);
    const [saved, setSaved] = useState(false);

    useEffect(() => {
        // Load stored theme
        const storedTheme = (localStorage.getItem('theme') as Theme) || 'light';
        setTheme(storedTheme);
        applyTheme(storedTheme);

        // Load user
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            const u = JSON.parse(storedUser);
            setUser(u);
            setRole(u.role === 'Admin' ? 'admin' : 'employee');
        }
    }, []);

    const applyTheme = (t: Theme) => {
        const html = document.documentElement;
        if (t === 'dark') {
            html.classList.add('dark');
        } else if (t === 'light') {
            html.classList.remove('dark');
        } else {
            // system
            const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
            if (prefersDark) html.classList.add('dark');
            else html.classList.remove('dark');
        }
    };

    const handleThemeChange = (t: Theme) => {
        setTheme(t);
        applyTheme(t);
        localStorage.setItem('theme', t);
    };

    const handleSave = () => {
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
    };

    const themeOptions: { value: Theme; label: string; icon: React.ReactNode; desc: string }[] = [
        {
            value: 'light',
            label: 'Light Mode',
            icon: <Sun size={22} className="text-amber-500" />,
            desc: 'Clean white background, optimized for daytime use.'
        },
        {
            value: 'dark',
            label: 'Dark Mode',
            icon: <Moon size={22} className="text-indigo-400" />,
            desc: 'Dark background, easy on the eyes at night.'
        },
        {
            value: 'system',
            label: 'System Default',
            icon: <Monitor size={22} className="text-gray-500" />,
            desc: 'Automatically match your operating system preference.'
        },
    ];

    return (
        <PanelLayout role={role}>
            <div className="max-w-2xl space-y-8">
                <div>
                    <h1 className="text-2xl font-bold text-notion-text">Settings</h1>
                    <p className="text-gray-500 text-sm mt-1">Manage your preferences and account settings.</p>
                </div>

                {/* Profile Info */}
                <Card className="p-6">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="p-2 bg-orange-50 rounded-xl text-jira-orange">
                            <User size={20} />
                        </div>
                        <h2 className="font-bold text-notion-text">Account</h2>
                    </div>
                    <div className="space-y-3">
                        <div className="flex justify-between items-center text-sm py-2 border-b border-notion-border">
                            <span className="text-gray-500 font-medium">Name</span>
                            <span className="font-semibold text-notion-text">{user?.name || '—'}</span>
                        </div>
                        <div className="flex justify-between items-center text-sm py-2 border-b border-notion-border">
                            <span className="text-gray-500 font-medium">Email</span>
                            <span className="font-semibold text-notion-text">{user?.email || '—'}</span>
                        </div>
                        <div className="flex justify-between items-center text-sm py-2">
                            <span className="text-gray-500 font-medium">Role</span>
                            <span className="font-semibold text-jira-orange capitalize">{user?.role || '—'}</span>
                        </div>
                    </div>
                </Card>

                {/* Theme Selection */}
                <Card className="p-6">
                    <div className="flex items-center gap-4 mb-6">
                        <div className="p-2 bg-orange-50 rounded-xl text-jira-orange">
                            <Palette size={20} />
                        </div>
                        <div>
                            <h2 className="font-bold text-notion-text">Appearance</h2>
                            <p className="text-xs text-gray-500 mt-0.5">Choose your preferred display mode.</p>
                        </div>
                    </div>

                    <div className="space-y-3">
                        {themeOptions.map((opt) => (
                            <button
                                key={opt.value}
                                onClick={() => handleThemeChange(opt.value)}
                                className={cn(
                                    "w-full flex items-center gap-4 p-4 rounded-xl border-2 text-left transition-all",
                                    theme === opt.value
                                        ? "border-jira-orange bg-orange-50"
                                        : "border-notion-border hover:border-orange-200 hover:bg-gray-50"
                                )}
                            >
                                <div className={cn(
                                    "w-10 h-10 rounded-full flex items-center justify-center",
                                    theme === opt.value ? "bg-white shadow-sm" : "bg-gray-100"
                                )}>
                                    {opt.icon}
                                </div>
                                <div className="flex-1">
                                    <p className={cn(
                                        "font-semibold text-sm",
                                        theme === opt.value ? "text-jira-orange" : "text-notion-text"
                                    )}>
                                        {opt.label}
                                    </p>
                                    <p className="text-xs text-gray-500 mt-0.5">{opt.desc}</p>
                                </div>
                                <div className={cn(
                                    "w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all",
                                    theme === opt.value
                                        ? "border-jira-orange"
                                        : "border-gray-300"
                                )}>
                                    {theme === opt.value && (
                                        <div className="w-2.5 h-2.5 rounded-full bg-jira-orange" />
                                    )}
                                </div>
                            </button>
                        ))}
                    </div>
                </Card>

                {/* Save button */}
                <div className="flex justify-end">
                    <button
                        onClick={handleSave}
                        className={cn(
                            "px-6 py-2.5 rounded-lg font-semibold text-sm transition-all",
                            saved
                                ? "bg-green-500 text-white"
                                : "bg-jira-orange text-white hover:bg-orange-600"
                        )}
                    >
                        {saved ? '✓ Preferences Saved' : 'Save Preferences'}
                    </button>
                </div>
            </div>
        </PanelLayout>
    );
}
