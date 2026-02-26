import React from 'react';
import { cn } from '@/app/lib/utils';

interface BadgeProps {
    children: React.ReactNode;
    variant?: 'todo' | 'inprogress' | 'done' | 'high' | 'medium' | 'low' | 'default';
    className?: string;
}

export const Badge: React.FC<BadgeProps> = ({ children, variant = 'default', className }) => {
    const variants = {
        todo: 'bg-status-todo text-status-todo-text',
        inprogress: 'bg-status-inprogress text-status-inprogress-text',
        done: 'bg-status-done text-status-done-text',
        high: 'bg-priority-high text-priority-high-text',
        medium: 'bg-priority-medium text-priority-medium-text',
        low: 'bg-priority-low text-priority-low-text',
        default: 'bg-gray-100 text-gray-700',
    };

    return (
        <span className={cn(
            'inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium',
            variants[variant],
            className
        )}>
            {children}
        </span>
    );
};
