"use client";

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/app/lib/utils';
import {
    LayoutDashboard,
    Kanban,
    Users,
    FolderKanban,
    History,
    Settings,
    LogOut,
    FileText,
    Sparkles,
    FolderGit2,
    ChevronLeft,
    ChevronRight
} from 'lucide-react';

interface SidebarProps {
    role: 'admin' | 'employee';
}

export const Sidebar: React.FC<SidebarProps> = ({ role }) => {
    const [isCollapsed, setIsCollapsed] = React.useState(false);
    const pathname = usePathname();

    const adminMenu = [
        { icon: LayoutDashboard, name: 'Dashboard', href: '/admin/dashboard' },
        { name: 'Projects', icon: FolderKanban, href: '/admin/projects' },
        { icon: Kanban, name: 'My Tasks', href: '/kanban' },
        { icon: Users, name: 'Employee Management', href: '/admin/employees' },
        { name: 'Activity Log', icon: History, href: '/admin/activity' },
        { name: 'Settings', icon: Settings, href: '/settings' },
    ];

    const employeeMenu = [
        { icon: LayoutDashboard, name: 'Dashboard', href: '/employee/dashboard' },
        { icon: FolderGit2, name: 'Projects', href: '/employee/projects' },
        { icon: Kanban, name: 'My Tasks', href: '/kanban' },
        { name: 'AI Center', icon: Sparkles, href: '/ai-center' },
        { name: 'Settings', icon: Settings, href: '/settings' },
    ];

    const menu = role === 'admin' ? adminMenu : employeeMenu;

    return (
        <aside
            className={cn(
                "h-screen bg-notion-sidebar border-r border-notion-border flex flex-col transition-all duration-300",
                isCollapsed ? "w-16" : "w-64"
            )}
        >
            <div className="p-4 flex items-center justify-between">
                {!isCollapsed && <span className="font-bold text-lg text-jira-orange font-mono tracking-tighter">AI PM</span>}
                <button
                    onClick={() => setIsCollapsed(!isCollapsed)}
                    className="p-1.5 rounded-md hover:bg-jira-orange/10 text-gray-500"
                >
                    {isCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
                </button>
            </div>

            <nav className="flex-1 px-2 py-4 space-y-1">
                {menu.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                "flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors",
                                isActive
                                    ? "bg-card-bg text-jira-orange shadow-sm border border-jira-orange/10 dark:border-jira-orange/30"
                                    : "text-gray-600 dark:text-gray-400 hover:bg-jira-orange/5 hover:text-jira-orange"
                            )}
                        >
                            <item.icon className={cn("shrink-0", isCollapsed ? "mx-auto" : "mr-3", isActive ? "text-jira-orange" : "")} size={20} />
                            {!isCollapsed && <span>{item.name}</span>}
                        </Link>
                    );
                })}
            </nav>

            <div className="p-2 border-t border-notion-border">
                <Link
                    href="/login"
                    onClick={() => localStorage.removeItem('user')}
                    className={cn(
                        "flex items-center px-3 py-2 text-sm font-medium rounded-md text-red-600 hover:bg-red-50 transition-colors"
                    )}
                >
                    <LogOut className={cn("shrink-0", isCollapsed ? "mx-auto" : "mr-3")} size={20} />
                    {!isCollapsed && <span>Logout</span>}
                </Link>
            </div>
        </aside>
    );
};
