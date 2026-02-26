"use client";

import React, { useEffect, useState, use } from 'react';
import { PanelLayout } from '@/layouts/PanelLayout';
import { TaskCard } from '@/components/TaskCard';
import { Button } from '@/components/Button';
import {
    Plus,
    Search,
    Filter,
    ArrowLeft,
    PlusCircle,
    X,
    Loader2,
    CheckCircle2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/app/lib/utils';
import { Card } from '@/components/Card';
import { useRouter } from 'next/navigation';

export default function ProjectBoardPage({ params }: { params: Promise<{ id: string }> }) {
    const resolvedParams = use(params);
    const projectId = parseInt(resolvedParams.id);
    const [user, setUser] = useState<any>(null);
    const [tasks, setTasks] = useState<any[]>([]);
    const [employees, setEmployees] = useState<any[]>([]);
    const [projectName, setProjectName] = useState<string>('');
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
        project_id: projectId,
        milestone: 1
    });

    // Filtering states
    const [searchQuery, setSearchQuery] = useState('');
    const [priorityFilter, setPriorityFilter] = useState('All');

    const router = useRouter();

    const columns = [
        { id: 'todo', title: 'To Do', color: 'bg-gray-400' },
        { id: 'inprogress', title: 'In Progress', color: 'bg-jira-orange' },
        { id: 'done', title: 'Done', color: 'bg-emerald-500' }
    ];

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            setUser(JSON.parse(storedUser));
        }
        fetchData();
    }, [projectId]);

    const fetchData = async () => {
        setIsLoading(true);
        try {
            await Promise.all([
                fetchProjectDetails(),
                fetchTasks(),
                fetchEmployees()
            ]);
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    const fetchProjectDetails = async () => {
        const response = await fetch(`http://localhost:5000/api/projects`);
        if (response.ok) {
            const data = await response.json();
            const currentProj = data.find((p: any) => p.id === projectId);
            if (currentProj) {
                setProjectName(currentProj.name);
            }
        }
    };

    const fetchEmployees = async () => {
        const response = await fetch('http://localhost:5000/api/users/employees');
        if (response.ok) {
            const data = await response.json();
            setEmployees(data);
            if (data.length > 0) {
                setNewTask(prev => ({ ...prev, assignee: data[0].name }));
            }
        }
    };

    const fetchTasks = async () => {
        const response = await fetch(`http://localhost:5000/api/tasks?project_id=${projectId}`);
        if (response.ok) {
            const data = await response.json();
            setTasks(data);
        }
    };

    const handleCreateTask = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        let progress = 0;
        if (newTask.status === 'inprogress') progress = 50;
        if (newTask.status === 'done') progress = 100;

        try {
            const response = await fetch('http://localhost:5000/api/tasks', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...newTask,
                    progress: progress
                })
            });
            if (response.ok) {
                setIsSuccess(true);
                fetchTasks();
                setTimeout(() => {
                    setIsModalOpen(false);
                    setIsSubmitting(false);
                    setIsSuccess(false);
                    setNewTask({
                        title: '',
                        dueDate: '',
                        priority: 'Medium',
                        assignee: employees[0]?.name || '',
                        status: 'todo',
                        project_id: projectId,
                        milestone: 1
                    });
                }, 1500);
            } else {
                setIsSubmitting(false);
            }
        } catch (error) {
            console.error(error);
            setIsSubmitting(false);
        }
    };

    const updateTaskStatus = async (id: number, progress: number) => {
        try {
            const response = await fetch(`http://localhost:5000/api/tasks/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ progress })
            });
            if (response.ok) {
                fetchTasks();
            }
        } catch (error) {
            console.error(error);
        }
    };

    const handleDeleteTask = async (id: number) => {
        if (!confirm("Delete this task?")) return;
        try {
            const response = await fetch(`http://localhost:5000/api/tasks/${id}`, { method: 'DELETE' });
            if (response.ok) fetchTasks();
        } catch (error) {
            console.error(error);
        }
    };

    const getTasksByStatus = (status: string) => {
        const filtered = tasks.filter(t => {
            const matchesSearch = t.task.toLowerCase().includes(searchQuery.toLowerCase());
            const matchesPriority = priorityFilter === 'All' || t.priority === priorityFilter;
            return matchesSearch && matchesPriority;
        });

        if (status === 'todo') return filtered.filter(t => t.progress === 0);
        if (status === 'inprogress') return filtered.filter(t => t.progress > 0 && t.progress < 100);
        if (status === 'done') return filtered.filter(t => t.progress === 100);
        return [];
    };

    if (isLoading) {
        return (
            <PanelLayout role="admin">
                <div className="h-full flex items-center justify-center">
                    <Loader2 className="animate-spin text-jira-orange" size={32} />
                </div>
            </PanelLayout>
        );
    }

    return (
        <PanelLayout role="admin">
            <div className="space-y-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => router.push('/admin/projects')}
                                className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-500 transition-colors mr-2"
                            >
                                <ArrowLeft size={18} />
                            </button>
                            <h1 className="text-2xl font-bold text-notion-text">
                                {projectName || 'Project Board'}
                            </h1>
                        </div>
                        <p className="text-gray-500 text-sm mt-1">
                            Team board for {projectName}. Manage all project-related assignments here.
                        </p>
                    </div>
                    <div>
                        <Button className="gap-2" onClick={() => setIsModalOpen(true)}>
                            <Plus size={18} /> Add Project Task
                        </Button>
                    </div>
                </div>

                {/* Search & Filter */}
                <div className="flex items-center justify-between py-2 border-b border-notion-border">
                    <div className="flex items-center gap-4">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
                            <input
                                type="text"
                                placeholder="Search by title..."
                                className="pl-9 pr-4 py-1.5 text-xs bg-notion-sidebar border border-notion-border rounded-md w-64 focus:outline-none"
                                value={searchQuery}
                                onChange={e => setSearchQuery(e.target.value)}
                            />
                        </div>
                        <div className="flex bg-notion-sidebar border border-notion-border rounded-md overflow-hidden">
                            {['All', 'High', 'Medium', 'Low'].map((p) => (
                                <button
                                    key={p}
                                    onClick={() => setPriorityFilter(p)}
                                    className={cn(
                                        "px-2.5 py-1.5 text-[10px] font-bold uppercase tracking-wider transition-colors",
                                        priorityFilter === p ? "bg-jira-orange text-white" : "text-gray-400 hover:bg-gray-200"
                                    )}
                                >
                                    {p}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Kanban Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {columns.map((column) => (
                        <div key={column.id} className="space-y-4">
                            <div className="flex items-center justify-between px-2">
                                <div className="flex items-center gap-2">
                                    <div className={`w-2 h-2 rounded-full ${column.color}`} />
                                    <h2 className="font-bold text-sm text-notion-text uppercase tracking-wider">{column.title}</h2>
                                    <span className="text-xs font-bold text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
                                        {getTasksByStatus(column.id).length}
                                    </span>
                                </div>
                                <Button variant="ghost" size="sm" className="p-1 h-auto" onClick={() => {
                                    setNewTask(prev => ({ ...prev, status: column.id }));
                                    setIsModalOpen(true);
                                }}>
                                    <PlusCircle size={16} />
                                </Button>
                            </div>
                            <div className="space-y-4 min-h-[500px] bg-secondary-bg/30 p-2 rounded-lg border border-dashed border-notion-border">
                                {getTasksByStatus(column.id).map((task) => (
                                    <TaskCard
                                        key={task.id}
                                        task={{
                                            id: task.id,
                                            title: task.task,
                                            priority: task.priority || 'Medium',
                                            assignee: task.assignee || 'Unassigned',
                                            progress: task.progress,
                                            dueDate: task.due_date,
                                            tags: []
                                        }}
                                        onDelete={handleDeleteTask}
                                        onUpdateStatus={updateTaskStatus}
                                    />
                                ))}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Add Task Modal */}
                {isModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4">
                        <Card className="w-full max-w-md p-6">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-xl font-bold text-notion-text">Add Project Task</h2>
                                <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                                    <X size={20} />
                                </button>
                            </div>
                            <form onSubmit={handleCreateTask} className="space-y-4">
                                <div>
                                    <label className="text-xs font-bold text-gray-400 uppercase">Title</label>
                                    <input
                                        type="text" required
                                        className="w-full mt-1 px-3 py-2 border rounded-md text-sm"
                                        value={newTask.title}
                                        onChange={e => setNewTask({ ...newTask, title: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-gray-400 uppercase">Assign To</label>
                                    <select
                                        className="w-full mt-1 px-3 py-2 border rounded-md text-sm"
                                        value={newTask.assignee}
                                        onChange={e => setNewTask({ ...newTask, assignee: e.target.value })}
                                    >
                                        <option value="">Select Assignee</option>
                                        {employees.map(emp => (
                                            <option key={emp.id} value={emp.name}>{emp.name}</option>
                                        ))}
                                    </select>
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
                                        <label className="text-xs font-bold text-gray-400 uppercase">Milestone Phase</label>
                                        <select
                                            className="w-full mt-1 px-3 py-2 border rounded-md text-sm"
                                            value={newTask.milestone}
                                            onChange={e => setNewTask({ ...newTask, milestone: parseInt(e.target.value) })}
                                        >
                                            <option value={1}>Ideation</option>
                                            <option value={2}>BOM</option>
                                            <option value={3}>POC</option>
                                            <option value={4}>Milestone-1</option>
                                            <option value={5}>Milestone-2</option>
                                            <option value={6}>Milestone-3</option>
                                            <option value={7}>Milestone-4</option>
                                            <option value={8}>Testing & Demonstration</option>
                                        </select>
                                    </div>
                                    <div>
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
