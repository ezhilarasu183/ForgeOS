import React from 'react';
import { cn } from '@/app/lib/utils';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'ghost' | 'outline' | 'danger';
    size?: 'sm' | 'md' | 'lg';
}

export const Button: React.FC<ButtonProps> = ({
    children,
    variant = 'primary',
    size = 'md',
    className,
    ...props
}) => {
    const variants = {
        primary: 'bg-jira-orange text-white hover:bg-orange-600',
        secondary: 'bg-orange-50 text-jira-orange hover:bg-orange-100 dark:bg-orange-900/20 dark:text-orange-400 dark:hover:bg-orange-900/30',
        ghost: 'bg-transparent hover:bg-orange-50 text-notion-text hover:text-jira-orange dark:hover:bg-orange-950/20',
        outline: 'border border-gray-200 bg-transparent hover:bg-orange-50 text-notion-text dark:border-notion-border dark:hover:bg-orange-950/20',
        danger: 'bg-red-500 text-white hover:bg-red-600 dark:bg-red-900/30 dark:text-red-400 dark:hover:bg-red-900/40',
    };

    const sizes = {
        sm: 'px-3 py-1.5 text-xs',
        md: 'px-4 py-2 text-sm',
        lg: 'px-6 py-3 text-base',
    };

    return (
        <button
            className={cn(
                'inline-flex items-center justify-center rounded-md font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-orange-400 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none',
                variants[variant],
                sizes[size],
                className
            )}
            {...props}
        >
            {children}
        </button>
    );
};
