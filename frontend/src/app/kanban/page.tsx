"use client";

import React, { useEffect, useState } from 'react';
import { PanelLayout } from '@/layouts/PanelLayout';
import { TaskCard } from '@/components/TaskCard';
import { Button } from '@/components/Button';
import { API_BASE_URL } from '@/lib/api';
import {
    Plus,
    Search,
    Filter,
    LayoutGrid,
    List,
    Sparkles,
    PlusCircle,
    X,
    Loader2,
    CheckCircle2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/app/lib/utils';
import { Card } from '@/components/Card';

export default function KanbanPage() {
    const [user, setUser] = useState<any>(null);
    const [tasks, setTasks] = useState<any[]>([]);
    const [employees, setEmployees] = useState<any[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [newTask, setNewTask] = useState({
        title: '',
        dueDate: '',
        priority: 'Medium',
        assignee: '',
        status: 'todo',
        project_id: 1003 // Default/Fallback
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);

    // Filtering states
    const [searchQuery, setSearchQuery] = useState('');
    const [priorityFilter, setPriorityFilter] = useState('All');

    const columns = [
        { id: 'todo', title: 'To Do', color: 'bg-gray-400' },
        { id: 'inprogress', title: 'In Progress', color: 'bg-jira-orange' },
        { id: 'done', title: 'Done', color: 'bg-emerald-500' }
    ];

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            const userData = JSON.parse(storedUser);
            setUser(userData);
            // Initialize assignee with current user
            setNewTask(prev => ({ ...prev, assignee: userData.name }));
        }
        fetchTasks();
        fetchEmployees();

        // Listen for AI-created tasks
        window.addEventListener('taskCreated', fetchTasks);
        return () => window.removeEventListener('taskCreated', fetchTasks);
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

    const fetchTasks = async () => {
        try {
            const response = await fetch('http://localhost:5000/api/tasks');
            if (response.ok) {
                const data = await response.json();
                setTasks(data);
            }
        } catch (error) {
            console.error("Failed to fetch tasks", error);
        }
    };

    const handleDeleteTask = async (id: number) => {
        if (!confirm("Are you sure you want to delete this task?")) return;
        try {
            const response = await fetch(`http://localhost:5000/api/tasks/${id}`, {
                method: 'DELETE'
            });
            if (response.ok) {
                fetchTasks();
            }
        } catch (error) {
            console.error(error);
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
                    assignee: newTask.assignee || user?.name,
                    progress: progress,
                    created_by: user?.email
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
                        assignee: user?.name || '',
                        status: 'todo',
                        project_id: 1003
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

    const updateTaskProgress = async (id: number, progress: number) => {
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

    const openAddModal = (status: string = 'todo') => {
        setNewTask(prev => ({ ...prev, status }));
        setIsModalOpen(true);
    };

    const getTasksByStatus = (status: string) => {
        const personalTasks = tasks.filter(t => {
            const assignee = (t.assignee || '').toLowerCase().trim();
            const assigneeEmail = (t.assignee_email || '').toLowerCase().trim();
            const userName = (user?.name || '').toLowerCase().trim();
            const userEmail = (user?.email || '').toLowerCase().trim();

            return assignee === userName ||
                assignee === userEmail ||
                assigneeEmail === userEmail;
        });

        const filteredTasks = personalTasks.filter(t => {
            const matchesSearch = t.task.toLowerCase().includes(searchQuery.toLowerCase());
            const matchesPriority = priorityFilter === 'All' || t.priority === priorityFilter;
            return matchesSearch && matchesPriority;
        });

        if (status === 'todo') return filteredTasks.filter(t => t.progress === 0);
        if (status === 'inprogress') return filteredTasks.filter(t => t.progress > 0 && t.progress < 100);
        if (status === 'done') return filteredTasks.filter(t => t.progress === 100);
        return [];
    };

    return (
        <PanelLayout role={user?.role?.toLowerCase() === 'admin' ? 'admin' : 'employee'}>
            <div className="space-y-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-notion-text">My Task Board</h1>
                        <p className="text-gray-500 text-sm mt-1">Manage your sprint tasks and track progress.</p>
                    </div>
                    <Button className="gap-2" onClick={() => openAddModal('todo')}>
                        <Plus size={18} /> Add New Task
                    </Button>
                </div>

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
                                <Button variant="ghost" size="sm" className="p-1 h-auto" onClick={() => openAddModal(column.id)}>
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
                                        onUpdateStatus={updateTaskProgress}
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
                                <h2 className="text-xl font-bold text-notion-text">Add New Task</h2>
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
                                <div>
                                    <label className="text-xs font-bold text-gray-400 uppercase">Auto-assigned to You</label>
                                    <div className="mt-1 px-3 py-2 border rounded-md text-sm bg-gray-50 text-gray-500">
                                        {user?.name || 'Current User'}
                                    </div>
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
