import React from 'react';
import { cn } from '@/app/lib/utils';

interface CardProps {
    children: React.ReactNode;
    className?: string;
    onClick?: () => void;
}

export const Card: React.FC<CardProps> = ({ children, className, onClick }) => {
    return (
        <div
            className={cn(
                'bg-card-bg border border-notion-border rounded-[12px] shadow-notion p-4 hover:border-gray-200 transition-all dark:hover:border-zinc-700',
                onClick && 'cursor-pointer hover:shadow-md',
                className
            )}
            onClick={onClick}
        >
            {children}
        </div>
    );
};
