"use client";

import React, { useEffect, useState, use } from 'react';
import { PanelLayout } from '@/layouts/PanelLayout';
import { TaskCard } from '@/components/TaskCard';
import {
    ArrowLeft,
    Loader2,
    Plus,
    PlusCircle,
    X
} from 'lucide-react';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { useRouter } from 'next/navigation';

export default function EmployeeProjectBoardPage({ params }: { params: Promise<{ id: string }> }) {
    const resolvedParams = use(params);
    const projectId = parseInt(resolvedParams.id);
    const [tasks, setTasks] = useState<any[]>([]);
    const [projectName, setProjectName] = useState<string>('');
    const [employees, setEmployees] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const router = useRouter();

    // Modal & Form states
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [user, setUser] = useState<any>(null);
    const [isSuccess, setIsSuccess] = useState(false);
    const [newTask, setNewTask] = useState({
        title: '',
        dueDate: '',
        priority: 'Medium',
        assignee: '',
        status: 'todo',
        project_id: projectId
    });

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
            setNewTask(prev => ({ ...prev, assignee: userData.name }));
            fetchEmployees();
        }
        fetchData();
    }, [projectId]);

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

    const fetchData = async () => {
        setIsLoading(true);
        try {
            const [projRes, taskRes] = await Promise.all([
                fetch(`http://localhost:5000/api/projects`),
                fetch(`http://localhost:5000/api/tasks?project_id=${projectId}`)
            ]);

            if (projRes.ok) {
                const projects = await projRes.json();
                const current = projects.find((p: any) => p.id === projectId);
                if (current) setProjectName(current.name);
            }
            if (taskRes.ok) {
                setTasks(await taskRes.json());
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
                    progress: progress
                })
            });
            if (response.ok) {
                setIsSuccess(true);
                fetchData();
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

    const getTasksByStatus = (status: string) => {
        if (status === 'todo') return tasks.filter(t => t.progress === 0);
        if (status === 'inprogress') return tasks.filter(t => t.progress > 0 && t.progress < 100);
        if (status === 'done') return tasks.filter(t => t.progress === 100);
        return [];
    };

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
            <div className="space-y-6">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => router.push('/employee/projects')}
                        className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-500 transition-colors"
                    >
                        <ArrowLeft size={18} />
                    </button>
                    <div>
                        <h1 className="text-2xl font-bold text-notion-text">{projectName} - Roadmap</h1>
                        <p className="text-gray-500 text-sm">View project status and upcoming milestones.</p>
                    </div>
                </div>
                <div className="flex justify-start">
                    <Button className="gap-2" onClick={() => setIsModalOpen(true)}>
                        <Plus size={18} /> Add Project Task
                    </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {columns.map((column) => (
                        <div key={column.id} className="space-y-4">
                            <div className="flex items-center gap-2 px-2">
                                <div className={`w-2 h-2 rounded-full ${column.color}`} />
                                <h2 className="font-bold text-sm text-notion-text uppercase tracking-wider">{column.title}</h2>
                                <span className="text-xs font-bold text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
                                    {getTasksByStatus(column.id).length}
                                </span>
                            </div>
                            <Button variant="ghost" size="sm" className="w-full justify-start gap-2 text-gray-400 hover:text-jira-orange" onClick={() => {
                                setNewTask(prev => ({ ...prev, status: column.id }));
                                setIsModalOpen(true);
                            }}>
                                <PlusCircle size={14} /> <span className="text-[10px] font-bold uppercase tracking-tight">Add Task</span>
                            </Button>
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
                                        <label className="text-xs font-bold text-gray-400 uppercase">Assignee</label>
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
