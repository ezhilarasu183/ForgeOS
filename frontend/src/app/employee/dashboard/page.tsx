"use client";

import React, { useEffect, useState } from 'react';
import { PanelLayout } from '@/layouts/PanelLayout';
import { Card } from '@/components/Card';
import { Badge } from '@/components/Badge';
import { TaskCard } from '@/components/TaskCard';
import { Button } from '@/components/Button';
import { API_BASE_URL } from '@/lib/api';
import {
    CheckCircle2,
    Clock,
    AlertCircle,
    ChevronRight,
    Sparkles,
    ArrowUpRight,
    Loader2,
    Plus,
    X
} from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/app/lib/utils';

export default function EmployeeDashboard() {
    const [user, setUser] = useState<any>(null);
    const [stats, setStats] = useState({
        assigned: 0,
        completed: 0,
        in_progress: 0
    });
    const [myTasks, setMyTasks] = useState<any[]>([]);
    const [employees, setEmployees] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // Modal & Form states
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [newTask, setNewTask] = useState({
        title: '',
        dueDate: '',
        priority: 'Medium',
        assignee: '',
        status: 'todo',
        project_id: 1003 // Default
    });

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            const userData = JSON.parse(storedUser);
            setUser(userData);
            setNewTask(prev => ({ ...prev, assignee: userData.name }));
            fetchEmployeeData(userData.email, userData.name);
            fetchEmployees();

            // Listen for AI-created tasks
            const refreshData = () => fetchEmployeeData(userData.email, userData.name);
            window.addEventListener('taskCreated', refreshData);
            return () => window.removeEventListener('taskCreated', refreshData);
        } else {
            setIsLoading(false);
        }
    }, []);

    const fetchEmployees = async () => {
        try {
            const response = await fetch('http://localhost:5000/api/users/employees');
            if (response.ok) {
                const data = await response.json();
                setEmployees(data);
            }
        } catch (error) {
            console.error(error);
        }
    };

    const fetchEmployeeData = async (email: string, name: string) => {
        setIsLoading(true);
        try {
            const response = await fetch(`http://localhost:5000/api/stats/employee?email=${encodeURIComponent(email)}&name=${encodeURIComponent(name || '')}`);
            if (response.ok) {
                const data = await response.json();
                setStats({
                    assigned: data.assigned,
                    completed: data.completed,
                    in_progress: data.pending // Map 'pending' to 'in_progress' for the dashboard state
                });
                setMyTasks(data.tasks);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleCreateTask = async (e: React.FormEvent) => {
        e.preventDefault();
        let progress = 0;
        if (newTask.status === 'inprogress') progress = 50;
        if (newTask.status === 'done') progress = 100;

        try {
            const response = await fetch('http://localhost:5000/api/tasks', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...newTask,
                    assignee: newTask.assignee || user?.name,
                    progress: progress,
                    created_by: user?.email // Track who created the task
                })
            });
            if (response.ok) {
                setIsSuccess(true);
                fetchEmployeeData(user.email, user.name);
                setTimeout(() => {
                    setIsModalOpen(false);
                    setIsSubmitting(false);
                    setIsSuccess(false);
                    setNewTask(prev => ({ ...prev, title: '', dueDate: '' }));
                }, 1500);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const statItems = [
        { label: 'Assigned', value: stats.assigned, icon: AlertCircle, color: 'text-blue-500' },
        { label: 'Pending Actions', value: stats.in_progress, icon: Clock, color: 'text-orange-500' },
        { label: 'Tasks Completed', value: stats.completed, icon: CheckCircle2, color: 'text-emerald-500' },
    ];

    if (isLoading) {
        return (
            <PanelLayout role="employee">
                <div className="h-full flex items-center justify-center">
                    <Loader2 className="animate-spin text-jira-orange" size={32} />
                </div>
            </PanelLayout>
        );
    }

    return (
        <PanelLayout role="employee">
            <div className="space-y-8">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-notion-text">Welcome back, {user?.name || 'User'}!</h1>
                        <p className="text-gray-500 text-sm mt-1">Manage your active tasks and track your progress.</p>
                    </div>
                    <div className="flex gap-3">
                        <Button className="gap-2" onClick={() => setIsModalOpen(true)}>
                            <Plus size={18} /> Quick Add Task
                        </Button>
                        <Link href="/ai-center">
                            <Button variant="outline" className="gap-2 border-purple-200 text-purple-600 hover:bg-purple-50">
                                <Sparkles size={18} /> Ask AI Assistant
                            </Button>
                        </Link>
                    </div>
                </div>

                {/* Stats Summary */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {statItems.map((stat) => (
                        <Card key={stat.label} className="p-4 flex items-center justify-between">
                            <div>
                                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">{stat.label}</p>
                                <p className="text-2xl font-black text-notion-text mt-1">{stat.value}</p>
                            </div>
                            <stat.icon size={28} className={stat.color} />
                        </Card>
                    ))}
                </div>

                {/* Tasks Section */}
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <h2 className="text-lg font-bold text-notion-text">My Active Tasks</h2>
                        <Link href="/kanban">
                            <Button variant="ghost" size="sm" className="text-jira-orange">Go to Kanban</Button>
                        </Link>
                    </div>
                    <div className="space-y-4">
                        {myTasks.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {myTasks.map(task => (
                                    <TaskCard
                                        key={task.id}
                                        task={{
                                            id: task.id,
                                            title: task.task,
                                            priority: task.priority || 'Medium',
                                            dueDate: task.due_date,
                                            assignee: task.assignee,
                                            progress: task.progress,
                                            tags: []
                                        }}
                                    />
                                ))}
                            </div>
                        ) : (
                            <Card className="p-12 flex flex-col items-center justify-center text-center opacity-60 bg-gray-50/50 border-dashed">
                                <CheckCircle2 size={48} className="text-gray-300 mb-4" />
                                <p className="text-sm font-medium text-gray-500">No active tasks assigned.</p>
                                <p className="text-xs text-gray-400 mt-1">Tasks assigned to you will appear here.</p>
                            </Card>
                        )}
                    </div>
                </div>

                {/* Add Task Modal */}
                {isModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4">
                        <Card className="w-full max-w-md p-6">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-xl font-bold text-notion-text">Quick Add Task</h2>
                                <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                                    <X size={20} />
                                </button>
                            </div>
                            <form onSubmit={handleCreateTask} className="space-y-4">
                                <div>
                                    <label className="text-xs font-bold text-gray-400 uppercase">Task Title</label>
                                    <input
                                        type="text" required
                                        className="w-full mt-1 px-3 py-2 border rounded-md text-sm"
                                        value={newTask.title}
                                        onChange={e => setNewTask({ ...newTask, title: e.target.value })}
                                        placeholder="What needs to be done?"
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-xs font-bold text-gray-400 uppercase">Priority</label>
                                        <select
                                            className="w-full mt-1 px-3 py-2 border rounded-md text-sm"
                                            value={newTask.priority}
                                            onChange={e => setNewTask({ ...newTask, priority: e.target.value })}
                                        >
                                            <option>Low</option>
                                            <option>Medium</option>
                                            <option>High</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="text-xs font-bold text-gray-400 uppercase">Status</label>
                                        <select
                                            className="w-full mt-1 px-3 py-2 border rounded-md text-sm"
                                            value={newTask.status}
                                            onChange={e => setNewTask({ ...newTask, status: e.target.value })}
                                        >
                                            <option value="todo">To Do</option>
                                            <option value="inprogress">In Progress</option>
                                            <option value="done">Done</option>
                                        </select>
                                    </div>
                                    <div className="col-span-2">
                                        <label className="text-xs font-bold text-gray-400 uppercase">Auto-assigned to You</label>
                                        <div className="mt-1 px-3 py-2 border rounded-md text-sm bg-gray-50 text-gray-500">
                                            {user?.name || 'Current User'}
                                        </div>
                                    </div>
                                    <div className="col-span-2">
                                        <label className="text-xs font-bold text-gray-400 uppercase">Due Date</label>
                                        <input
                                            type="date"
                                            className="w-full mt-1 px-3 py-2 border rounded-md text-sm"
                                            value={newTask.dueDate}
                                            onChange={e => setNewTask({ ...newTask, dueDate: e.target.value })}
                                        />
                                    </div>
                                </div>
                                <div className="pt-4 flex gap-3">
                                    <Button type="button" variant="ghost" className="flex-1" onClick={() => setIsModalOpen(false)}>
                                        Cancel
                                    </Button>
                                    <Button type="submit" className="flex-1" disabled={isSubmitting}>
                                        {isSuccess ? "Success!" : isSubmitting ? "Adding..." : "Create Task"}
                                    </Button>
                                </div>
                            </form>
                        </Card>
                    </div>
                )}
            </div>
        </PanelLayout>
    );
}
