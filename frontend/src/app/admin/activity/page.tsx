"use client";

import React, { useEffect, useState } from 'react';
import { PanelLayout } from '@/layouts/PanelLayout';
import { Card } from '@/components/Card';
import { History, RefreshCw, Loader2, AlertCircle } from 'lucide-react';

export default function ActivityLogPage() {
    const [activities, setActivities] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchActivity();
    }, []);

    const fetchActivity = async () => {
        setIsLoading(true);
        setError('');
        try {
            const response = await fetch('http://localhost:5000/api/activity');
            if (response.ok) {
                const data = await response.json();
                setActivities(data);
            } else {
                setError('Failed to load activity log.');
            }
        } catch (e) {
            setError('Backend unreachable. Ensure Flask is running on port 5000.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <PanelLayout role="admin">
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-notion-text flex items-center gap-2">
                            <History className="text-jira-orange" size={24} /> Activity Log
                        </h1>
                        <p className="text-gray-500 text-sm mt-1">
                            Complete history of all actions performed in the system.
                        </p>
                    </div>
                    <button
                        onClick={fetchActivity}
                        className="flex items-center gap-2 px-4 py-2 rounded-md border border-notion-border text-sm font-medium text-gray-600 hover:bg-orange-50 hover:text-jira-orange hover:border-orange-200 transition-all"
                    >
                        <RefreshCw size={16} /> Refresh
                    </button>
                </div>

                <Card className="overflow-hidden">
                    {isLoading && (
                        <div className="flex items-center justify-center py-24">
                            <Loader2 className="animate-spin text-jira-orange" size={32} />
                        </div>
                    )}

                    {error && (
                        <div className="flex items-center gap-3 m-6 p-4 bg-red-50 border border-red-100 rounded-lg text-red-700 text-sm">
                            <AlertCircle size={18} />
                            <span>{error}</span>
                        </div>
                    )}

                    {!isLoading && !error && activities.length === 0 && (
                        <div className="flex flex-col items-center justify-center py-24 opacity-40">
                            <History size={48} className="text-gray-300 mb-4" />
                            <p className="text-sm font-bold text-gray-500">No activity recorded yet</p>
                        </div>
                    )}

                    {!isLoading && activities.length > 0 && (
                        <div className="divide-y divide-notion-border">
                            {activities.map((log, idx) => (
                                <div key={log.id ?? idx} className="flex items-start gap-4 px-6 py-4 hover:bg-orange-50/30 transition-colors">
                                    <div className="mt-0.5 w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center text-jira-orange shrink-0">
                                        <History size={14} />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm text-notion-text font-medium">
                                            {log.message || log.action || 'System event'}
                                        </p>
                                        {log.details && (
                                            <p className="text-xs text-gray-400 mt-0.5">{log.details}</p>
                                        )}
                                    </div>
                                    <span className="text-[11px] text-gray-400 whitespace-nowrap shrink-0">
                                        {log.time || log.timestamp || '—'}
                                    </span>
                                </div>
                            ))}
                        </div>
                    )}
                </Card>
            </div>
        </PanelLayout>
    );
}
