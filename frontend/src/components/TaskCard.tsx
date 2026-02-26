import React, { useState, useRef, useEffect } from 'react';
import { Card } from '@/components/Card';
import { Badge } from '@/components/Badge';
import { Calendar, User, ListTodo, Paperclip, MessageSquare, Trash2, MoreHorizontal, CheckCircle2, Circle, Clock } from 'lucide-react';
import { cn } from '@/app/lib/utils';
import { Button } from './Button';

interface TaskCardProps {
    task: {
        id: number;
        title: string;
        priority: 'High' | 'Medium' | 'Low';
        dueDate: string;
        assignee: string;
        progress: number;
        tags: string[];
    };
    onDelete?: (id: number) => void;
    onUpdateStatus?: (id: number, progress: number) => void;
    className?: string;
}

export const TaskCard: React.FC<TaskCardProps> = ({ task, onDelete, onUpdateStatus, className }) => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setIsMenuOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleAction = (action: () => void) => {
        action();
        setIsMenuOpen(false);
    };

    return (
        <Card className={cn("p-4 group", className)}>
            <div className="flex flex-col gap-3">
                <div className="flex items-start justify-between">
                    <Badge variant={task.priority.toLowerCase() as any}>
                        {task.priority} Priority
                    </Badge>
                    <div className="flex items-center gap-2">
                        {task.assignee && (
                            <div className="flex -space-x-1.5 overflow-hidden">
                                <div className="inline-block h-6 w-6 rounded-full ring-2 ring-white bg-blue-100 flex items-center justify-center text-[10px] font-bold text-blue-600">
                                    {task.assignee[0]}
                                </div>
                            </div>
                        )}
                        <div className="relative" ref={menuRef}>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setIsMenuOpen(!isMenuOpen)}
                                className={cn(
                                    "p-1 h-auto text-gray-400 hover:text-jira-orange",
                                    isMenuOpen && "text-jira-orange bg-jira-orange/5"
                                )}
                            >
                                <MoreHorizontal size={16} />
                            </Button>
                            {isMenuOpen && (
                                <div className="absolute right-0 top-full mt-1 w-48 bg-card-bg border border-notion-border rounded-md shadow-xl z-50 py-1 animate-in fade-in zoom-in-95 duration-100 origin-top-right">
                                    <button
                                        onClick={() => handleAction(() => onUpdateStatus?.(task.id, 0))}
                                        className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-notion-text hover:bg-jira-orange/5 transition-colors text-left"
                                    >
                                        <Circle size={14} className="text-gray-400" /> Move to To Do
                                    </button>
                                    <button
                                        onClick={() => handleAction(() => onUpdateStatus?.(task.id, 50))}
                                        className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-notion-text hover:bg-jira-orange/5 transition-colors text-left"
                                    >
                                        <Clock size={14} className="text-jira-orange" /> Move to In Progress
                                    </button>
                                    <button
                                        onClick={() => handleAction(() => onUpdateStatus?.(task.id, 100))}
                                        className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-notion-text hover:bg-jira-orange/5 transition-colors text-left"
                                    >
                                        <CheckCircle2 size={14} className="text-emerald-500" /> Move to Done
                                    </button>
                                    <div className="my-1 border-t border-notion-border" />
                                    <button
                                        onClick={() => handleAction(() => onDelete?.(task.id))}
                                        className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-red-500 hover:bg-red-50 transition-colors text-left"
                                    >
                                        <Trash2 size={14} /> Delete Task
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <button
                        onClick={() => onUpdateStatus?.(task.id, task.progress === 100 ? 0 : 100)}
                        className={cn(
                            "shrink-0 transition-colors",
                            task.progress === 100 ? "text-emerald-500" : "text-gray-300 hover:text-jira-orange"
                        )}
                    >
                        {task.progress === 100 ? <CheckCircle2 size={18} /> : <Circle size={18} />}
                    </button>
                    <h3 className={cn(
                        "text-sm font-semibold transition-all duration-300",
                        task.progress === 100 ? "text-gray-400 line-through" : "text-notion-text group-hover:text-jira-orange"
                    )}>
                        {task.title}
                    </h3>
                </div>

                <div className="flex flex-wrap gap-1">
                    {task.tags.map(tag => (
                        <span key={tag} className="px-1.5 py-0.5 bg-gray-50 text-gray-400 text-[10px] rounded border border-gray-100 uppercase font-bold tracking-tight">
                            {tag}
                        </span>
                    ))}
                </div>

                <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-[10px] text-gray-400 font-medium">
                        <span>Progress</span>
                        <span>{task.progress}%</span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-1.5">
                        <div
                            className={cn(
                                "h-1.5 rounded-full",
                                task.progress === 100 ? "bg-emerald-500" : "bg-jira-orange"
                            )}
                            style={{ width: `${task.progress}%` }}
                        />
                    </div>
                </div>

                <div className="pt-2 border-t border-gray-50 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        {task.progress < 100 && (() => {
                            const today = new Date();
                            today.setHours(0, 0, 0, 0);
                            const due = new Date(task.dueDate);
                            due.setHours(0, 0, 0, 0);

                            if (due < today) {
                                return (
                                    <div className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-red-50 border border-red-100 animate-pulse">
                                        <div className="w-1.5 h-1.5 rounded-full bg-red-500" />
                                        <span className="text-[10px] font-bold text-red-600 uppercase tracking-tight">Overdue</span>
                                    </div>
                                );
                            } else if (due.getTime() === today.getTime()) {
                                return (
                                    <div className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-orange-50 border border-orange-100">
                                        <div className="w-1.5 h-1.5 rounded-full bg-orange-500" />
                                        <span className="text-[10px] font-bold text-orange-600 uppercase tracking-tight">Due Today</span>
                                    </div>
                                );
                            }
                            return null;
                        })()}
                    </div>
                    <div className={cn(
                        "flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded border",
                        task.progress < 100 && new Date(task.dueDate).setHours(0, 0, 0, 0) < new Date().setHours(0, 0, 0, 0)
                            ? "bg-red-50 text-red-600 border-red-100 font-bold"
                            : "bg-gray-50 text-gray-400 border-gray-100"
                    )}>
                        <Calendar size={12} /> {task.dueDate}
                    </div>
                </div>
            </div>
        </Card>
    );
};
