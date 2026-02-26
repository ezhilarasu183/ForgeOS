"use client";

import React, { useEffect } from 'react';
import { PanelLayout } from '@/layouts/PanelLayout';
import { Card } from '@/components/Card';
import { Badge } from '@/components/Badge';
import { Button } from '@/components/Button';
import {
    PlusCircle,
    Search,
    Filter,
    ExternalLink,
    Kanban,
    X
} from 'lucide-react';

export default function EmployeeProjectsPage() {
    const [projects, setProjects] = React.useState<any[]>([]);
    const [isDetailsModalOpen, setIsDetailsModalOpen] = React.useState(false);
    const [selectedProject, setSelectedProject] = React.useState<any>(null);
    const [projectMembers, setProjectMembers] = React.useState<any[]>([]);
    const [projectTasks, setProjectTasks] = React.useState<any[]>([]);

    useEffect(() => {
        fetchProjects();
    }, []);

    const fetchProjects = async () => {
        try {
            const response = await fetch('http://localhost:5000/api/projects');
            if (response.ok) {
                const data = await response.json();
                setProjects(data);
            }
        } catch (error) {
            console.error("Failed to fetch projects", error);
        }
    };

    const openDetailsModal = async (project: any) => {
        setSelectedProject(project);
        setIsDetailsModalOpen(true);
        fetchProjectMembers(project.id);
        fetchProjectTasks(project.id);
    };

    const fetchProjectTasks = async (projectId: number) => {
        try {
            const response = await fetch(`http://localhost:5000/api/tasks?project_id=${projectId}`);
            if (response.ok) {
                const data = await response.json();
                setProjectTasks(data);
            }
        } catch (error) {
            console.error("Failed to fetch project tasks", error);
        }
    };

    const fetchProjectMembers = async (projectId: number) => {
        try {
            const response = await fetch(`http://localhost:5000/api/projects/${projectId}/members`);
            if (response.ok) {
                const data = await response.json();
                setProjectMembers(data);
            }
        } catch (error) {
            console.error("Failed to fetch project members", error);
        }
    };

    return (
        <PanelLayout role="employee">
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-notion-text">Company Projects</h1>
                        <p className="text-gray-500 text-sm mt-1">View active initiatives and team composition.</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {projects.map((project) => (
                        <Card key={project.id} className="p-6 hover:shadow-md transition-shadow group flex flex-col justify-between">
                            <div className="space-y-4">
                                <div className="flex items-start justify-between">
                                    <div className="space-y-1">
                                        <h3 className="font-bold text-notion-text group-hover:text-jira-orange transition-colors">
                                            {project.name}
                                        </h3>
                                        <p className="text-xs text-gray-400 line-clamp-2">Owner: {project.owner}</p>
                                    </div>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="p-1.5"
                                        onClick={() => openDetailsModal(project)}
                                    >
                                        <ExternalLink size={16} className="text-gray-300 group-hover:text-jira-orange" />
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="p-1.5 text-gray-400 hover:text-jira-orange"
                                        title="Project Kanban Board"
                                        onClick={() => window.location.href = `/employee/projects/${project.id}/board`}
                                    >
                                        <Kanban size={16} />
                                    </Button>
                                </div>

                                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-50">
                                    <div className="space-y-1">
                                        <p className="text-[10px] font-black uppercase text-gray-400 tracking-wider">Owner</p>
                                        <div className="flex items-center gap-2">
                                            <div className="w-5 h-5 rounded-full bg-blue-100 flex items-center justify-center text-[10px] font-bold text-blue-600">
                                                {project.owner[0]}
                                            </div>
                                            <span className="text-xs font-bold text-gray-600 truncate">{project.owner}</span>
                                        </div>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-[10px] font-black uppercase text-gray-400 tracking-wider">Status</p>
                                        <Badge variant="done">Active</Badge>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-6 flex items-center justify-between">
                                <div className="flex -space-x-2">
                                    {project.members && project.members.slice(0, 3).map((member: any, i: number) => (
                                        <div
                                            key={i}
                                            title={`${member.name} (${member.role})`}
                                            className="w-7 h-7 rounded-full border-2 border-white bg-blue-50 flex items-center justify-center text-[10px] font-bold text-blue-600 hover:bg-blue-100 cursor-help transition-colors"
                                        >
                                            {member.name[0]}
                                        </div>
                                    ))}
                                    {project.members && project.members.length > 3 && (
                                        <div className="w-7 h-7 rounded-full border-2 border-white bg-jira-orange flex items-center justify-center text-[8px] font-bold text-white">
                                            +{project.members.length - 3}
                                        </div>
                                    )}
                                </div>
                                <span className="text-[10px] text-gray-400 font-bold uppercase">Click for details</span>
                            </div>
                        </Card>
                    ))}
                </div>

                {/* Project Details Modal */}
                {isDetailsModalOpen && selectedProject && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4">
                        <Card className="w-full max-w-2xl p-0 overflow-hidden animate-in zoom-in-95 duration-200">
                            <div className="bg-orange-50/50 p-6 border-b border-notion-border relative">
                                <button
                                    onClick={() => setIsDetailsModalOpen(false)}
                                    className="absolute right-4 top-4 text-gray-400 hover:text-gray-600"
                                >
                                    <X size={20} />
                                </button>
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-xl bg-jira-orange flex items-center justify-center text-white">
                                        <ExternalLink size={24} />
                                    </div>
                                    <div>
                                        <h2 className="text-2xl font-bold text-notion-text">{selectedProject.name}</h2>
                                        <p className="text-sm text-gray-500">Project Overview & Team</p>
                                    </div>
                                </div>
                            </div>

                            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-6">
                                    <div className="space-y-3">
                                        <h3 className="text-xs font-black uppercase text-gray-400 tracking-wider">Information</h3>
                                        <div className="space-y-2">
                                            <div className="flex justify-between text-sm">
                                                <span className="text-gray-500">Owner</span>
                                                <span className="font-bold text-notion-text">{selectedProject.owner}</span>
                                            </div>
                                            <div className="flex justify-between text-sm">
                                                <span className="text-gray-500">Status</span>
                                                <Badge variant="done">Active</Badge>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-3">
                                        <h3 className="text-xs font-black uppercase text-gray-400 tracking-wider">Activity Summary</h3>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="bg-secondary-bg p-3 rounded-lg border border-notion-border">
                                                <p className="text-[10px] text-gray-500 font-bold uppercase">Tasks</p>
                                                <p className="text-xl font-bold text-notion-text">{projectTasks.length}</p>
                                            </div>
                                            <div className="bg-emerald-50/50 p-3 rounded-lg border border-emerald-100">
                                                <p className="text-[10px] text-emerald-600 font-bold uppercase">Done</p>
                                                <p className="text-xl font-bold text-emerald-700">
                                                    {projectTasks.filter(t => t.done === 1 || t.progress === 100).length}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-3 flex flex-col">
                                    <h3 className="text-xs font-black uppercase text-gray-400 tracking-wider">Team Members ({projectMembers.length})</h3>
                                    <div className="flex-1 overflow-y-auto max-h-[250px] space-y-2 pr-2 custom-scrollbar">
                                        {projectMembers.map(member => (
                                            <div key={member.id} className="flex items-center gap-3 p-2 bg-gray-50 rounded-lg">
                                                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-xs font-bold text-blue-600">
                                                    {member.name[0]}
                                                </div>
                                                <div>
                                                    <p className="text-sm font-bold text-notion-text">{member.name}</p>
                                                    <p className="text-[10px] text-gray-400">{member.role}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <div className="p-4 bg-gray-50 border-t border-notion-border flex justify-end">
                                <Button onClick={() => setIsDetailsModalOpen(false)}>Close</Button>
                            </div>
                        </Card>
                    </div>
                )}
            </div>
        </PanelLayout>
    );
}
