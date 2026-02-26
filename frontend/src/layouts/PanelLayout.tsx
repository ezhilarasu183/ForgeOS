"use client";

import React from 'react';
import { Sidebar } from '@/components/Sidebar';
import { AIAssistant } from '@/components/AIAssistant';

interface PanelLayoutProps {
    children: React.ReactNode;
    role: 'admin' | 'employee';
}

export const PanelLayout: React.FC<PanelLayoutProps> = ({ children, role }) => {
    const [user, setUser] = React.useState<{ name: string; role: string } | null>(null);

    React.useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            try {
                setUser(jsonSafeParse(storedUser));
            } catch (e) {
                console.error("Failed to parse user from localStorage", e);
            }
        }
    }, []);

    function jsonSafeParse(str: string) {
        try { return JSON.parse(str); } catch (e) { return null; }
    }

    return (
        <div className="flex h-screen bg-notion-bg">
            <Sidebar role={role} />
            <div className="flex-1 flex flex-col overflow-hidden">
                <header className="h-16 bg-card-bg border-b border-notion-border flex items-center justify-end px-8 gap-4 shadow-sm">
                    <div className="flex items-center gap-3">
                        <div className="flex flex-col items-end">
                            <h2 className="text-sm font-bold text-notion-text">
                                {user?.name || 'User'}
                                <span className="ml-1.5 text-jira-orange lowercase font-normal opacity-70">({user?.role || role})</span>
                            </h2>
                        </div>
                        <div className="w-8 h-8 rounded-full bg-jira-orange/20 flex items-center justify-center text-jira-orange font-bold text-xs border border-jira-orange/30 shadow-sm uppercase">
                            {user?.name?.[0] || 'U'}
                        </div>
                    </div>
                </header>
                <main className="flex-1 overflow-y-auto p-8 custom-scrollbar">
                    {children}
                </main>
                <AIAssistant />
            </div>
        </div>
    );
};
