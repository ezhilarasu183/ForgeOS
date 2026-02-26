"use client";

import React, { useEffect, useState } from 'react';
import { PanelLayout } from '@/layouts/PanelLayout';
import { Card } from '@/components/Card';
import { Badge } from '@/components/Badge';
import { API_BASE_URL } from '@/lib/api';
import {
    Users,
    Briefcase,
    CheckCircle2,
    Clock,
    TrendingUp,
    Activity,
    Loader2,
    Filter
} from 'lucide-react';
import {
    PieChart, Pie, Cell,
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';

export default function AdminDashboard() {
    const [stats, setStats] = useState<any>({
        employees: 0,
        projects: 0,
        completed_tasks: 0,
        pending_tasks: 0,
        category_stats: [],
        itta_stats: []
    });
    const [filterStation, setFilterStation] = useState('');
    const [activities, setActivities] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        loadData();
    }, [filterStation]);

    const loadData = async () => {
        setIsLoading(true);
        await Promise.all([fetchStats(), fetchActivity()]);
        setIsLoading(false);
    };

    const fetchStats = async () => {
        try {
            const params = new URLSearchParams();
            if (filterStation) params.append('station', filterStation);

            const response = await fetch(`http://localhost:5000/api/stats/admin?${params.toString()}`);
            if (response.ok) {
                const data = await response.json();
                setStats(data);
            }
        } catch (error) {
            console.error(error);
        }
    };

    const fetchActivity = async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/api/activity`);
            if (response.ok) {
                const data = await response.json();
                setActivities(data);
            }
        } catch (error) {
            console.error(error);
        }
    };

    const statCards = [
        { title: 'Total Projects', value: stats.projects, icon: Briefcase, color: 'text-notion-text', bg: 'bg-gray-50', change: '+5%' },
        { title: 'Active Projects', value: stats.active_projects, icon: Activity, color: 'text-jira-orange', bg: 'bg-orange-50', change: '+2%' },
        { title: 'Onhold Project', value: stats.on_hold_projects, icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50', change: '-2%' },
        { title: 'Project Completed', value: stats.completed_projects, icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-50', change: '+18%' },
    ];

    return (
        <PanelLayout role="admin">
            <div className="space-y-8">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-notion-text">Admin Panel</h1>
                        <p className="text-gray-500 text-sm mt-1">Real-time overview of company productivity and operations.</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <select
                            className="px-3 py-1.5 border border-gray-200 rounded-md text-sm bg-white focus:outline-none focus:ring-1 focus:ring-jira-orange"
                            value={filterStation}
                            onChange={(e) => setFilterStation(e.target.value)}
                        >
                            <option value="">All Stations</option>
                            <option value="Forge factory">Forge factory</option>
                            <option value="forge hosur">forge hosur</option>
                            <option value="ITN Madurai">ITN Madurai</option>
                        </select>

                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
                    {statCards.map((stat) => (
                        <Card key={stat.title} className="p-6">
                            <div className="flex items-start justify-between">
                                <div className={`p-3 rounded-xl ${stat.bg} ${stat.color}`}>
                                    <stat.icon size={24} />
                                </div>
                                <Badge variant={stat.change.startsWith('+') ? 'done' : 'default'} className="text-[10px]">
                                    {stat.change}
                                </Badge>
                            </div>
                            <div className="mt-4">
                                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">{stat.title}</p>
                                <h3 className="text-3xl font-black text-notion-text mt-1">{stat.value}</h3>
                            </div>
                        </Card>
                    ))}
                </div>

                {/* Visualizations */}
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                    {/* ITTA Breakdown */}
                    <Card className="p-6">
                        <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-6">ITTA Breakdown</h3>
                        <div className="h-[300px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={stats.itta_stats}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                    <XAxis dataKey="name" fontSize={12} tickLine={false} axisLine={false} />
                                    <YAxis fontSize={12} tickLine={false} axisLine={false} />
                                    <Tooltip cursor={{ fill: '#f9fafb' }} />
                                    <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                                        {stats.itta_stats.map((entry: any, index: number) => (
                                            <Cell key={`cell-${index}`} fill={[
                                                '#4472C4', // Blue
                                                '#ED7D31', // Orange
                                                '#A5A5A5', // Gray
                                                '#FFC000', // Gold
                                                '#5B9BD5'  // Light Blue
                                            ][index % 5]} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </Card>

                    {/* Category Breakdown */}
                    <Card className="p-6">
                        <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-6">Projects Breakdown</h3>
                        <div className="h-[300px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={stats.category_stats}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={80}
                                        paddingAngle={5}
                                        dataKey="value"
                                    >
                                        <Cell fill="#f97316" /> {/* Forge Labs - Orange */}
                                        <Cell fill="#8b5cf6" /> {/* LightHouse - Purple */}
                                        <Cell fill="#10b981" /> {/* Startup - Emerald */}
                                    </Pie>
                                    <Tooltip />
                                    <Legend />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </Card>
                </div>
            </div>
        </PanelLayout>
    );
}
