"use client";

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { cn } from '@/app/lib/utils';

const MILESTONES = [
    "Ideation", "BOM", "POC", "Milestone-1", "Milestone-2", "Milestone-3", "Milestone-4", "Testing & Demonstration"
];

const MilestoneTracker = ({ current, projectName }: { current: number, projectName: string }) => {
    const SHORT_LABELS = ["IDT", "BOM", "POC", "M-1", "M-2", "M-3", "M-4", "DEMO"];
    
    return (
        <div className="group/tracker relative flex items-center gap-0.5 w-[70px] h-3 hover:w-[240px] hover:h-12 transition-all duration-300 z-10">
            {MILESTONES.map((name, i) => {
                const step = i + 1;
                const isActive = step === current;
                const isCompleted = step <= current;
                
                return (
                    <div 
                        key={name}
                        className={cn(
                            "relative flex-1 h-1 group-hover/tracker:h-6 transition-all duration-300 cursor-default",
                            "clip-arrow flex items-center justify-center overflow-hidden",
                            isCompleted 
                                ? "bg-jira-orange shadow-[inset_0_1px_rgba(255,255,255,0.4)]" 
                                : "bg-slate-200 border border-slate-300",
                            isActive && "animate-pulse shadow-[0_0_15px_rgba(249,115,22,0.7)] z-20"
                        )}
                        title={name}
                    >
                        <span className={cn(
                            "text-[6px] font-black opacity-0 group-hover/tracker:opacity-100 transition-opacity whitespace-nowrap px-0.5",
                            isCompleted ? "text-white" : "text-slate-500"
                        )}>
                            {SHORT_LABELS[i]}
                        </span>
                    </div>
                );
            })}
            
            {/* Hover Overlay for Info */}
            <div className="absolute -top-10 left-0 right-0 bg-notion-text/95 backdrop-blur-sm text-white text-[9px] py-1.5 px-3 rounded-md opacity-0 group-hover/tracker:opacity-100 transition-all transform translate-y-2 group-hover/tracker:translate-y-0 pointer-events-none whitespace-nowrap shadow-2xl border border-jira-orange/30 z-30">
                <div className="flex items-center justify-between gap-4">
                    <span className="font-bold text-jira-orange tracking-tight">{projectName}</span>
                    <span className="text-[8px] font-medium text-gray-300 uppercase letter-spacing-widest">
                        {MILESTONES[current-1] || 'Not Started'}
                    </span>
                </div>
            </div>

            <style jsx>{`
                .clip-arrow {
                    clip-path: polygon(0% 0%, 85% 0%, 100% 50%, 85% 100%, 0% 100%, 15% 50%);
                    margin-left: -5%;
                }
                .clip-arrow:first-child {
                    clip-path: polygon(0% 0%, 85% 0%, 100% 50%, 85% 100%, 0% 100%);
                    margin-left: 0;
                }
            `}</style>
        </div>
    );
};
import { PanelLayout } from '@/layouts/PanelLayout';
import { Card } from '@/components/Card';
import { Badge } from '@/components/Badge';
import { Button } from '@/components/Button';
import {
    PlusCircle,
    Search,
    Filter,
    MoreVertical,
    Pencil,
    Users,
    Calendar,
    ExternalLink,
    Kanban,
    X,
    Trash2,
    FileText,
    Download,
    RefreshCw
} from 'lucide-react';

export default function ProjectsPage() {
    const router = useRouter();
    const [user, setUser] = React.useState<any>(null);
    const [projects, setProjects] = React.useState<any[]>([]);
    const [isModalOpen, setIsModalOpen] = React.useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = React.useState(false);
    const [editingProject, setEditingProject] = React.useState<any>(null);
    const [newProj, setNewProj] = React.useState({
        name: '',
        owner: '',
        email: '',
        description: '',
        station: '',
        category: '',
        itta: '',
        member_ids: [] as number[]
    });

    const [isTeamModalOpen, setIsTeamModalOpen] = React.useState(false);
    const [isDetailsModalOpen, setIsDetailsModalOpen] = React.useState(false);
    const [selectedProject, setSelectedProject] = React.useState<any>(null);
    const [projectMembers, setProjectMembers] = React.useState<any[]>([]);
    const [projectTasks, setProjectTasks] = React.useState<any[]>([]);
    const [allEmployees, setAllEmployees] = React.useState<any[]>([]);
    const [isAddingMember, setIsAddingMember] = React.useState(false);
    const [selectedEmp, setSelectedEmp] = React.useState('');
    const [newTask, setNewTask] = React.useState({ title: '', dueDate: '', priority: 'Medium', assignee: '' });
    const [filterStation, setFilterStation] = React.useState('');
    const [filterCategory, setFilterCategory] = React.useState('');
    const [filterITTA, setFilterITTA] = React.useState('');

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            const userData = JSON.parse(storedUser);
            setUser(userData);
            // Default new task assignee to the current logged-in user
            setNewTask(prev => ({ ...prev, assignee: userData.name }));
        }
        fetchProjects();
        fetchEmployees();

        // Listen for AI-created projects/tasks
        window.addEventListener('projectCreated', fetchProjects);
        window.addEventListener('taskCreated', fetchProjects);
        return () => {
            window.removeEventListener('projectCreated', fetchProjects);
            window.removeEventListener('taskCreated', fetchProjects);
        };
    }, []);

    const fetchEmployees = async () => {
        try {
            const response = await fetch('http://localhost:5000/api/users/employees');
            if (response.ok) {
                const data = await response.json();
                setAllEmployees(data);
            }
        } catch (error) {
            console.error("Failed to fetch employees", error);
        }
    };

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

    const handleCreateProject = async (e: React.FormEvent) => {
        e.preventDefault();
        console.log("Creating project with data:", newProj);
        try {
            const response = await fetch('http://localhost:5000/api/projects', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newProj)
            });
            if (response.ok) {
                const data = await response.json();
                console.log("Project created success:", data);
                fetchProjects();
                setIsModalOpen(false);
                setNewProj({ name: '', owner: '', email: '', description: '', station: '', category: '', itta: '', member_ids: [] });
                alert('Project created successfully!');
            } else {
                const errorData = await response.json();
                console.error("Project creation failed:", errorData);
                alert(`Failed to create project: ${errorData.error || 'Unknown error'}`);
            }
        } catch (error) {
            console.error(error);
            alert('Failed to connect to server');
        }
    };

    const handleEditProject = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const response = await fetch(`http://localhost:5000/api/projects/${editingProject.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(editingProject)
            });
            if (response.ok) {
                setIsEditModalOpen(false);
                setEditingProject(null);
                fetchProjects();
                alert('Project updated successfully!');
            }
        } catch (error) {
            console.error(error);
            alert('Failed to update project');
        }
    };

    const handleDeleteProject = async (id: number) => {
        if (!confirm("Are you sure you want to delete this project? This will also remove all associated team member links.")) return;
        try {
            const response = await fetch(`http://localhost:5000/api/projects/${id}`, {
                method: 'DELETE'
            });
            if (response.ok) {
                fetchProjects();
                setIsEditModalOpen(false);
                alert('Project deleted successfully!');
            }
        } catch (error) {
            console.error(error);
            alert('Failed to delete project');
        }
    };

    const openTeamModal = async (project: any) => {
        setSelectedProject(project);
        setIsTeamModalOpen(true);
        fetchProjectMembers(project.id);
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

    const handleAddMember = async () => {
        if (!selectedEmp) return;
        try {
            const response = await fetch(`http://localhost:5000/api/projects/${selectedProject.id}/members`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ employee_id: parseInt(selectedEmp) })
            });
            if (response.ok) {
                fetchProjectMembers(selectedProject.id);
                setIsAddingMember(false);
                setSelectedEmp('');
            } else {
                const err = await response.json();
                alert(err.error || "Failed to add member");
            }
        } catch (error) {
            console.error(error);
        }
    };

    const handleRemoveMember = async (empId: number) => {
        try {
            const response = await fetch(`http://localhost:5000/api/projects/${selectedProject.id}/members/${empId}`, {
                method: 'DELETE'
            });
            if (response.ok) {
                fetchProjectMembers(selectedProject.id);
            }
        } catch (error) {
            console.error(error);
        }
    };

    const handleQuickTask = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const response = await fetch('http://localhost:5000/api/tasks', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...newTask,
                    project_id: selectedProject.id,
                    created_by: user?.email // Track who created the task
                })
            });
            if (response.ok) {
                alert('Task assigned and email notification sent!');
                setNewTask({ title: '', dueDate: '', priority: 'Medium', assignee: '' });
            }
        } catch (error) {
            console.error(error);
        }
    };

    const toggleProjectCompletion = async (project: any) => {
        const updatedProject = { ...project, is_completed: project.is_completed === 1 ? 0 : 1 };
        try {
            const response = await fetch(`http://localhost:5000/api/projects/${project.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updatedProject)
            });
            if (response.ok) {
                setProjects(projects.map(p => p.id === project.id ? updatedProject : p));
            }
        } catch (error) {
            console.error("Failed to update project status", error);
        }
    };

    const filteredProjects = projects.filter(p => {
        const matchStation = filterStation === '' || p.station === filterStation;
        const matchCategory = filterCategory === '' || p.category === filterCategory;
        const matchITTA = filterITTA === '' || p.itta === filterITTA;
        return matchStation && matchCategory && matchITTA;
    });

    return (
        <PanelLayout role="admin">
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-notion-text">Projects</h1>
                        <p className="text-gray-500 text-sm mt-1">Overview of all active and upcoming company initiatives.</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <select
                            className="px-3 py-1.5 border border-gray-200 rounded-md text-sm bg-white focus:outline-none focus:ring-1 focus:ring-jira-orange"
                            value={filterStation}
                            onChange={(e) => setFilterStation(e.target.value)}
                        >
                            <option value="">All Stations</option>
                            <option value="Forge factory">Forge factory</option>
                            <option value="forge hosur">forge hosur</option>
                            <option value="ITN Madurai">ITN Madurai</option>
                        </select>

                        <select
                            className="px-3 py-1.5 border border-gray-200 rounded-md text-sm bg-white focus:outline-none focus:ring-1 focus:ring-jira-orange"
                            value={filterCategory}
                            onChange={(e) => setFilterCategory(e.target.value)}
                        >
                            <option value="">All Categories</option>
                            <option value="Forge Labs Project">Forge Labs Project</option>
                            <option value="LightHouse Project">LightHouse Project</option>
                            <option value="Startup Project">Startup Project</option>
                        </select>

                        <select
                            className="px-3 py-1.5 border border-gray-200 rounded-md text-sm bg-white focus:outline-none focus:ring-1 focus:ring-jira-orange"
                            value={filterITTA}
                            onChange={(e) => setFilterITTA(e.target.value)}
                        >
                            <option value="">All ITTA</option>
                            <option value="HSE">HSE</option>
                            <option value="AMDF">AMDF</option>
                            <option value="AMR">AMR</option>
                            <option value="ACCS">ACCS</option>
                            <option value="IIDP">IIDP</option>
                        </select>
                        <Button className="gap-2" onClick={() => setIsModalOpen(true)}>
                            <PlusCircle size={18} /> New Project
                        </Button>
                    </div>
                </div>

                {/* New Project Modal */}
                {isModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4">
                        <Card className="w-full max-w-3xl p-0 animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
                            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                                <div>
                                    <h2 className="text-xl font-bold text-notion-text">Create New Project</h2>
                                    <p className="text-xs text-gray-400 mt-1">Initialize a new workflow and assign team members</p>
                                </div>
                                <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                                    <X size={20} />
                                </button>
                            </div>
                            <form onSubmit={handleCreateProject} className="flex-1 overflow-y-auto custom-scrollbar p-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    {/* Left Column: Basic Info */}
                                    <div className="space-y-5">
                                <div>
                                    <label className="text-xs font-bold text-gray-400 uppercase">Project Name</label>
                                    <input
                                        type="text" required
                                        className="w-full mt-1 px-3 py-2 border border-gray-200 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-jira-orange"
                                        value={newProj.name}
                                        onChange={(e) => setNewProj({ ...newProj, name: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-gray-400 uppercase">Owner</label>
                                    <select
                                        required
                                        className="w-full mt-1 px-3 py-2 border border-gray-200 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-jira-orange bg-white"
                                        value={newProj.owner ? `${newProj.owner}|${newProj.email}` : ''}
                                        onChange={(e) => {
                                            if (!e.target.value) {
                                                setNewProj({ ...newProj, owner: '', email: '' });
                                                return;
                                            }
                                            const [name, email] = e.target.value.split('|');
                                            setNewProj({ ...newProj, owner: name, email: email });
                                        }}
                                    >
                                        <option value="">Select Owner (Employee/Admin)</option>
                                        {allEmployees.map(emp => (
                                            <option key={emp.id} value={`${emp.name}|${emp.email}`}>
                                                {emp.name} ({emp.email})
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                        <div>
                                            <label className="text-xs font-bold text-gray-400 uppercase">Station</label>
                                            <select
                                                className="w-full mt-1 px-3 py-2 border border-gray-200 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-jira-orange"
                                                value={newProj.station}
                                                onChange={(e) => setNewProj({ ...newProj, station: e.target.value })}
                                            >
                                                <option value="">Select Station</option>
                                                <option value="Forge factory">Forge factory</option>
                                                <option value="forge hosur">forge hosur</option>
                                                <option value="ITN Madurai">ITN Madurai</option>
                                            </select>
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="text-xs font-bold text-gray-400 uppercase">Category</label>
                                                <select
                                                    className="w-full mt-1 px-3 py-2 border border-gray-200 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-jira-orange"
                                                    value={newProj.category}
                                                    onChange={(e) => setNewProj({ ...newProj, category: e.target.value })}
                                                >
                                                    <option value="">Select Category</option>
                                                    <option value="Forge Labs Project">Forge Labs Project</option>
                                                    <option value="LightHouse Project">LightHouse Project</option>
                                                    <option value="Startup Project">Startup Project</option>
                                                </select>
                                            </div>
                                            <div>
                                                <label className="text-xs font-bold text-gray-400 uppercase">ITTA</label>
                                                <select
                                                    className="w-full mt-1 px-3 py-2 border border-gray-200 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-jira-orange"
                                                    value={newProj.itta}
                                                    onChange={(e) => setNewProj({ ...newProj, itta: e.target.value })}
                                                >
                                                    <option value="">Select ITTA</option>
                                                    <option value="HSE">HSE</option>
                                                    <option value="AMDF">AMDF</option>
                                                    <option value="AMR">AMR</option>
                                                    <option value="ACCS">ACCS</option>
                                                    <option value="IIDP">IIDP</option>
                                                </select>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Right Column: Detailed Info & Team */}
                                    <div className="space-y-5">
                                        <div>
                                            <label className="text-xs font-bold text-gray-400 uppercase">Project Description</label>
                                            <textarea
                                                rows={4}
                                                className="w-full mt-1 px-3 py-2 border border-gray-200 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-jira-orange"
                                                value={newProj.description}
                                                onChange={(e) => setNewProj({ ...newProj, description: e.target.value })}
                                                placeholder="Describe the project goals and scope..."
                                            />
                                        </div>
                                        <div>
                                            <label className="text-xs font-bold text-gray-400 uppercase">Team Members</label>
                                            <div className="mt-2 border border-gray-100 rounded-md p-3 bg-gray-50/30 max-h-[180px] overflow-y-auto space-y-2 custom-scrollbar">
                                                {allEmployees.map(emp => (
                                                    <label key={emp.id} className="flex items-center gap-3 cursor-pointer group">
                                                        <input
                                                            type="checkbox"
                                                            className="w-4 h-4 rounded border-gray-300 text-jira-orange focus:ring-jira-orange cursor-pointer"
                                                            checked={newProj.member_ids.includes(emp.id)}
                                                            onChange={(e) => {
                                                                const ids = e.target.checked
                                                                    ? [...newProj.member_ids, emp.id]
                                                                    : newProj.member_ids.filter(id => id !== emp.id);
                                                                setNewProj({ ...newProj, member_ids: ids });
                                                            }}
                                                        />
                                                        <div className="flex flex-col">
                                                            <span className="text-sm font-bold text-gray-700 group-hover:text-jira-orange transition-colors">{emp.name}</span>
                                                            <span className="text-[10px] text-gray-400">{emp.role}</span>
                                                        </div>
                                                    </label>
                                                ))}
                                            </div>
                                            <p className="text-[10px] text-gray-400 mt-1">{newProj.member_ids.length} members selected</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-8 pt-6 border-t border-gray-100 flex items-center justify-end gap-3">
                                    <Button type="button" variant="ghost" className="px-8" onClick={() => setIsModalOpen(false)}>Cancel</Button>
                                    <Button type="submit" className="px-8 h-11 text-base font-bold shadow-lg shadow-orange-200">Create Project</Button>
                                </div>
                            </form>
                        </Card>
                    </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {filteredProjects.map((project) => (
                        <Card key={project.id} className={`p-6 hover:shadow-md transition-shadow group flex flex-col justify-between ${project.is_completed ? 'bg-gray-50/50 grayscale-[0.3]' : ''}`}>
                            <div className="space-y-4">
                                <div className="flex items-start justify-between">
                                    <div className="space-y-1">
                                        <h3
                                            className="font-bold text-notion-text hover:text-jira-orange hover:underline underline-offset-4 cursor-pointer transition-all"
                                            onClick={() => openDetailsModal(project)}
                                        >
                                            {project.name}
                                        </h3>

                                        <div className="flex flex-wrap gap-2 mt-2">
                                            {project.category && <Badge className="text-[10px] bg-blue-50 text-blue-600 border border-blue-100">{project.category}</Badge>}
                                            {project.itta && <Badge className="text-[10px] bg-purple-50 text-purple-600 border border-purple-100">{project.itta}</Badge>}
                                        </div>

                                        </div>
                                    <div className="flex gap-1 items-center -mr-2">
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="p-1.5 text-gray-400 hover:text-blue-600"
                                            onClick={() => {
                                                setEditingProject(project);
                                                setIsEditModalOpen(true);
                                            }}
                                        >
                                            <Pencil size={16} />
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="p-1.5 text-gray-400 hover:text-jira-orange"
                                            title="View Project Board"
                                            onClick={() => router.push(`/admin/projects/${project.id}/board`)}
                                        >
                                            <ExternalLink size={16} />
                                        </Button>
                                    </div>
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
                                        <div className="flex items-center gap-2">
                                            <input
                                                type="checkbox"
                                                className="w-4 h-4 rounded border-gray-300 text-jira-orange focus:ring-jira-orange cursor-pointer"
                                                checked={project.is_completed === 1}
                                                onChange={() => toggleProjectCompletion(project)}
                                                onClick={(e) => e.stopPropagation()}
                                            />
                                            <Badge variant={project.is_completed ? 'done' : 'inprogress'}>
                                                {project.is_completed ? 'Completed' : 'Active'}
                                            </Badge>
                                        </div>
                                    </div>
                                    
                                    {/* Project Progress - Right Side */}
                                    <div className="col-span-2 mt-4 pt-4 border-t border-gray-50 flex flex-col items-start gap-2">
                                        <span className="text-[10px] font-black uppercase text-gray-400 tracking-wider">Project Progress</span>
                                        <MilestoneTracker current={project.current_milestone || 0} projectName={project.name} />
                                    </div>
                                </div>
                            </div>

                            <div className="mt-6 flex items-center justify-between">
                                <div className="flex items-center gap-1">
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
                                        {(!project.members || project.members.length === 0) && (
                                            <div className="w-7 h-7 rounded-full border-2 border-dashed border-gray-200 flex items-center justify-center text-[8px] font-bold text-gray-300">
                                                0
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-2 ml-auto">
                                        <button
                                            onClick={() => openTeamModal(project)}
                                            className="w-6 h-6 rounded-full border border-dashed border-jira-orange/40 flex items-center justify-center text-jira-orange hover:bg-jira-orange/5 transition-colors"
                                            title="Manage Team"
                                        >
                                            <PlusCircle size={12} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </Card>
                    ))}

                    {/* Add Project Card */}
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="h-full p-8 border-2 border-dashed border-gray-100 rounded-lg hover:border-jira-orange/20 hover:bg-orange-50/10 transition-all flex flex-col items-center justify-center text-center gap-4 group min-h-[250px]"
                    >
                        <div className="w-12 h-12 rounded-full bg-gray-50 flex items-center justify-center group-hover:bg-orange-50 transition-colors">
                            <PlusCircle size={24} className="text-gray-300 group-hover:text-jira-orange" />
                        </div>
                        <div>
                            <p className="font-bold text-sm text-notion-text">Create New Project</p>
                            <p className="text-xs text-gray-400 mt-1">Initialize a new workflow</p>
                        </div>
                    </button>
                </div>

                {/* Manage Team Modal */}
                {isTeamModalOpen && selectedProject && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4">
                        <Card className="w-full max-w-2xl p-6 animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
                            <div className="flex items-center justify-between mb-6">
                                <div>
                                    <h2 className="text-xl font-bold text-notion-text">Manage Team: {selectedProject.name}</h2>
                                    <p className="text-xs text-gray-400 mt-1">Assign members and create task notifications</p>
                                </div>
                                <button onClick={() => setIsTeamModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                                    <X size={20} />
                                </button>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 overflow-hidden">
                                {/* Members List */}
                                <div className="space-y-4 flex flex-col overflow-hidden">
                                    <div className="flex items-center justify-between">
                                        <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider">Members</h3>
                                        <Button size="sm" variant="secondary" className="h-7 px-2 text-[10px]" onClick={() => setIsAddingMember(!isAddingMember)}>
                                            {isAddingMember ? "Cancel" : "Add Member"}
                                        </Button>
                                    </div>

                                    {isAddingMember && (
                                        <div className="flex gap-2 animate-in slide-in-from-top-2">
                                            <select
                                                className="flex-1 px-3 py-2 text-sm border border-gray-200 rounded-md bg-white focus:outline-none focus:ring-1 focus:ring-jira-orange"
                                                value={selectedEmp}
                                                onChange={(e) => setSelectedEmp(e.target.value)}
                                            >
                                                <option value="">Select Employee</option>
                                                {allEmployees.map(emp => (
                                                    <option key={emp.id} value={emp.id}>{emp.name}</option>
                                                ))}
                                            </select>
                                            <Button size="sm" className="h-auto py-1" onClick={handleAddMember}>Add</Button>
                                        </div>
                                    )}

                                    <div className="flex-1 overflow-y-auto space-y-2 pr-2 custom-scrollbar">
                                        {projectMembers.length === 0 ? (
                                            <p className="text-xs text-center py-8 text-gray-400">No members assigned yet.</p>
                                        ) : (
                                            projectMembers.map(member => (
                                                <div key={member.id} className="flex items-center justify-between p-2 bg-secondary-bg rounded-lg border border-notion-border group">
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center text-xs font-bold text-jira-orange">
                                                            {member.name[0]}
                                                        </div>
                                                        <div>
                                                            <p className="text-sm font-bold text-notion-text">{member.name}</p>
                                                            <p className="text-[10px] text-gray-400">{member.role}</p>
                                                        </div>
                                                    </div>
                                                    <button
                                                        onClick={() => handleRemoveMember(member.id)}
                                                        className="p-1 text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                                                    >
                                                        <X size={14} />
                                                    </button>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </div>

                                {/* Create & Assign Task */}
                                <div className="space-y-4 border-l border-notion-border pl-6">
                                    <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider">Assign Task & Notify</h3>
                                    <form onSubmit={handleQuickTask} className="space-y-3">
                                        <div>
                                            <label className="text-[10px] font-bold text-gray-400 uppercase">Task Title</label>
                                            <input
                                                type="text" required
                                                className="w-full mt-1 px-3 py-2 border border-notion-border bg-secondary-bg rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-jira-orange"
                                                value={newTask.title}
                                                onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                                            />
                                        </div>
                                        <div className="grid grid-cols-2 gap-3">
                                            <div>
                                                <label className="text-[10px] font-bold text-gray-400 uppercase">Due Date</label>
                                                <input
                                                    type="date" required
                                                    className="w-full mt-1 px-2 py-1.5 border border-notion-border bg-secondary-bg rounded-md text-xs focus:outline-none focus:ring-1 focus:ring-jira-orange"
                                                    value={newTask.dueDate}
                                                    onChange={(e) => setNewTask({ ...newTask, dueDate: e.target.value })}
                                                />
                                            </div>
                                            <div>
                                                <label className="text-[10px] font-bold text-gray-400 uppercase">Priority</label>
                                                <select
                                                    className="w-full mt-1 px-2 py-1.5 border border-notion-border bg-secondary-bg rounded-md text-xs focus:outline-none focus:ring-1 focus:ring-jira-orange"
                                                    value={newTask.priority}
                                                    onChange={(e) => setNewTask({ ...newTask, priority: e.target.value })}
                                                >
                                                    <option>High</option>
                                                    <option>Medium</option>
                                                    <option>Low</option>
                                                </select>
                                            </div>
                                        </div>
                                        <div>
                                            <label className="text-[10px] font-bold text-gray-400 uppercase">Assignee</label>
                                            <select
                                                required
                                                className="w-full mt-1 px-3 py-2 border border-notion-border bg-secondary-bg rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-jira-orange"
                                                value={newTask.assignee}
                                                onChange={(e) => setNewTask({ ...newTask, assignee: e.target.value })}
                                            >
                                                <option value="">Select Member</option>
                                                {projectMembers.map(m => (
                                                    <option key={m.id} value={m.name}>{m.name}</option>
                                                ))}
                                            </select>
                                        </div>
                                        <Button type="submit" className="w-full mt-2">Create & Send Email</Button>
                                    </form>
                                </div>
                            </div>
                        </Card>
                    </div>
                )}
                {/* Edit Project Modal */}
                {isEditModalOpen && editingProject && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4">
                        <Card className="w-full max-w-md p-6 animate-in zoom-in-95 duration-200">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-xl font-bold text-notion-text">Edit Project</h2>
                                <button onClick={() => setIsEditModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                                    <X size={20} />
                                </button>
                            </div>
                            <form onSubmit={handleEditProject} className="space-y-4">
                                <div>
                                    <label className="text-xs font-bold text-gray-400 uppercase">Project Name</label>
                                    <input
                                        type="text" required
                                        className="w-full mt-1 px-3 py-2 border border-gray-200 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-jira-orange"
                                        value={editingProject.name}
                                        onChange={(e) => setEditingProject({ ...editingProject, name: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-gray-400 uppercase">Owner</label>
                                    <select
                                        required
                                        className="w-full mt-1 px-3 py-2 border border-gray-200 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-jira-orange bg-white"
                                        value={editingProject.owner ? `${editingProject.owner}|${editingProject.email}` : ''}
                                        onChange={(e) => {
                                            if (!e.target.value) {
                                                setEditingProject({ ...editingProject, owner: '', email: '' });
                                                return;
                                            }
                                            const [name, email] = e.target.value.split('|');
                                            setEditingProject({ ...editingProject, owner: name, email: email });
                                        }}
                                    >
                                        <option value="">Select Owner (Employee/Admin)</option>
                                        {allEmployees.map(emp => (
                                            <option key={emp.id} value={`${emp.name}|${emp.email}`}>
                                                {emp.name} ({emp.email})
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-gray-400 uppercase">Project Description</label>
                                    <textarea
                                        rows={3}
                                        className="w-full mt-1 px-3 py-2 border border-gray-200 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-jira-orange"
                                        value={editingProject.description || ''}
                                        onChange={(e) => setEditingProject({ ...editingProject, description: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-gray-400 uppercase">Station</label>
                                    <select
                                        className="w-full mt-1 px-3 py-2 border border-gray-200 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-jira-orange"
                                        value={editingProject.station || ''}
                                        onChange={(e) => setEditingProject({ ...editingProject, station: e.target.value })}
                                    >
                                        <option value="">Select Station</option>
                                        <option value="Forge factory">Forge factory</option>
                                        <option value="forge hosur">forge hosur</option>
                                        <option value="ITN Madurai">ITN Madurai</option>
                                    </select>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-xs font-bold text-gray-400 uppercase">Category</label>
                                        <select
                                            className="w-full mt-1 px-2 py-1.5 border border-gray-200 rounded-md text-xs focus:outline-none focus:ring-1 focus:ring-jira-orange"
                                            value={editingProject.category || ''}
                                            onChange={(e) => setEditingProject({ ...editingProject, category: e.target.value })}
                                        >
                                            <option value="">Select Category</option>
                                            <option value="Forge Labs Project">Forge Labs Project</option>
                                            <option value="LightHouse Project">LightHouse Project</option>
                                            <option value="Startup Project">Startup Project</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="text-xs font-bold text-gray-400 uppercase">ITTA</label>
                                        <select
                                            className="w-full mt-1 px-2 py-1.5 border border-gray-200 rounded-md text-xs focus:outline-none focus:ring-1 focus:ring-jira-orange"
                                            value={editingProject.itta || ''}
                                            onChange={(e) => setEditingProject({ ...editingProject, itta: e.target.value })}
                                        >
                                            <option value="">Select ITTA</option>
                                            <option value="HSE">HSE</option>
                                            <option value="AMDF">AMDF</option>
                                            <option value="AMR">AMR</option>
                                            <option value="ACCS">ACCS</option>
                                            <option value="IIDP">IIDP</option>
                                        </select>
                                    </div>
                                </div>
                                <div className="pt-4 flex gap-3">
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        className="flex-1 text-red-500 hover:bg-red-50 hover:text-red-600"
                                        onClick={() => handleDeleteProject(editingProject.id)}
                                    >
                                        <Trash2 size={16} className="mr-2" /> Delete
                                    </Button>
                                    <Button type="button" variant="ghost" className="flex-1" onClick={() => setIsEditModalOpen(false)}>Cancel</Button>
                                    <Button type="submit" className="flex-1">Save Changes</Button>
                                </div>
                            </form>
                        </Card>
                    </div>
                )}



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
                                        <p className="text-sm text-gray-500">Project Overview & Statistics</p>
                                    </div>
                                </div>
                            </div>

                            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8">
                                {/* Left Column: Info & Description */}
                                <div className="space-y-6">
                                    <div className="space-y-3">
                                        <h3 className="text-xs font-black uppercase text-gray-400 tracking-wider">Project Information</h3>
                                        <div className="space-y-2">
                                            <div className="flex justify-between text-sm">
                                                <span className="text-gray-500">Owner</span>
                                                <span className="font-bold text-notion-text">{selectedProject.owner}</span>
                                            </div>
                                            <div className="flex justify-between text-sm">
                                                <span className="text-gray-500">Contact</span>
                                                <span className="font-bold text-notion-text">{selectedProject.email}</span>
                                            </div>
                                            <div className="flex justify-between text-sm">
                                                <span className="text-gray-500">Status</span>
                                                <Badge variant="done">Active</Badge>
                                            </div>
                                            <div className="flex justify-between text-sm">
                                                <span className="text-gray-500">Station</span>
                                                <span className="font-bold text-notion-text">{selectedProject.station || 'N/A'}</span>
                                            </div>
                                            <div className="flex justify-between text-sm">
                                                <span className="text-gray-500">Category</span>
                                                <span className="font-bold text-notion-text">{selectedProject.category || 'N/A'}</span>
                                            </div>
                                            <div className="flex justify-between text-sm">
                                                <span className="text-gray-500">ITTA</span>
                                                <span className="font-bold text-notion-text">{selectedProject.itta || 'N/A'}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-3">
                                        <h3 className="text-xs font-black uppercase text-gray-400 tracking-wider">Description</h3>
                                        <div className="p-3 bg-secondary-bg rounded-lg border border-notion-border">
                                            <p className="text-sm text-notion-text whitespace-pre-wrap">
                                                {selectedProject.description || 'No description provided.'}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="space-y-3">
                                        <h3 className="text-xs font-black uppercase text-gray-400 tracking-wider">Productivity Summary</h3>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="bg-secondary-bg p-3 rounded-lg border border-notion-border">
                                                <p className="text-[10px] text-gray-500 font-bold uppercase">Total Tasks</p>
                                                <p className="text-xl font-bold text-notion-text">{projectTasks.length}</p>
                                            </div>
                                            <div className="bg-emerald-50/50 p-3 rounded-lg border border-emerald-100">
                                                <p className="text-[10px] text-emerald-600 font-bold uppercase">Completed</p>
                                                <p className="text-xl font-bold text-emerald-700">
                                                    {projectTasks.filter(t => t.done === 1 || t.progress === 100).length}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Right Column: Team & Documents */}
                                <div className="space-y-6 flex flex-col">
                                    <div className="space-y-3 flex-1">
                                        <h3 className="text-xs font-black uppercase text-gray-400 tracking-wider">Active Team ({projectMembers.length})</h3>
                                        <div className="overflow-y-auto max-h-[200px] space-y-2 pr-2 custom-scrollbar">
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

                                    <div className="pt-4 border-t border-gray-100 flex flex-col gap-3">
                                        <div className="flex items-center justify-between">
                                            <h3 className="text-xs font-black uppercase text-gray-400 tracking-wider">Project Documents</h3>
                                            <button 
                                                onClick={async () => {
                                                    try {
                                                        const res = await fetch(`http://localhost:5000/api/projects/${selectedProject.id}/generate-docs`, { method: 'POST' });
                                                        if (res.ok) {
                                                            alert("Document generation started. Refresh in a few seconds.");
                                                        }
                                                    } catch (err) { console.error(err); }
                                                }}
                                                className="text-[10px] font-bold text-jira-orange hover:text-orange-700 flex items-center gap-1 transition-colors"
                                            >
                                                <RefreshCw size={12} className="animate-spin-hover" />
                                                Generate Docs
                                            </button>
                                        </div>
                                        <div className="grid grid-cols-2 gap-3">
                                            {/* SRD */}
                                            <div className="bg-orange-50/30 border border-orange-100 rounded-lg p-3 hover:border-jira-orange transition-all group/doc">
                                                <div className="flex items-center gap-2">
                                                    <FileText size={16} className="text-jira-orange" />
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-[9px] font-black text-jira-orange uppercase">SRD</p>
                                                        {selectedProject.srd_path ? (
                                                            <a href={`http://localhost:5000/api/projects/documents/${selectedProject.srd_path}`} target="_blank" rel="noopener noreferrer" className="text-[10px] font-bold text-notion-text hover:underline block truncate">Download</a>
                                                        ) : <span className="text-[10px] text-gray-400 italic">Pending</span>}
                                                    </div>
                                                </div>
                                            </div>
                                            {/* SSD */}
                                            <div className="bg-blue-50/30 border border-blue-100 rounded-lg p-3 hover:border-blue-400 transition-all group/doc">
                                                <div className="flex items-center gap-2">
                                                    <FileText size={16} className="text-blue-500" />
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-[9px] font-black text-blue-500 uppercase">SSD</p>
                                                        {selectedProject.ssd_path ? (
                                                            <a href={`http://localhost:5000/api/projects/documents/${selectedProject.ssd_path}`} target="_blank" rel="noopener noreferrer" className="text-[10px] font-bold text-notion-text hover:underline block truncate">Download</a>
                                                        ) : <span className="text-[10px] text-gray-400 italic">Pending</span>}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="p-4 bg-gray-50 border-t border-notion-border flex justify-end">
                                <Button onClick={() => setIsDetailsModalOpen(false)}>Close Details</Button>
                            </div>
                        </Card>
                    </div>
                )}
            </div>
        </PanelLayout>
    );
}
