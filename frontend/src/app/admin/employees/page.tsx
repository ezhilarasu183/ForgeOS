"use client";

import React, { useEffect } from 'react';
import { PanelLayout } from '@/layouts/PanelLayout';
import { Card } from '@/components/Card';
import { Badge } from '@/components/Badge';
import { Button } from '@/components/Button';
import {
    Search,
    UserPlus,
    Mail,
    Calendar,
    Briefcase,
    Trash2,
    Edit2,
    X,
    Users,
    Shield,
    ArrowLeft
} from 'lucide-react';

type AddMode = null | 'admin' | 'employee';

export default function EmployeeManagement() {
    const [employees, setEmployees] = React.useState<any[]>([]);
    const [isModalOpen, setIsModalOpen] = React.useState(false);
    const [addMode, setAddMode] = React.useState<AddMode>(null);
    const [editingEmpId, setEditingEmpId] = React.useState<number | null>(null);
    const [newEmp, setNewEmp] = React.useState({
        name: '',
        email: '',
        role: 'Developer',
        dob: '',
        status: 'Active',
        username: '',
        password: ''
    });
    const [searchQuery, setSearchQuery] = React.useState('');
    const [roleFilter, setRoleFilter] = React.useState('All Roles');

    const openModal = () => { setIsModalOpen(true); setAddMode(null); setEditingEmpId(null); };
    const closeModal = () => {
        setIsModalOpen(false);
        setAddMode(null);
        setEditingEmpId(null);
        setNewEmp({
            name: '',
            email: '',
            role: 'Developer',
            dob: '',
            status: 'Active',
            username: '',
            password: ''
        });
    };

    const selectMode = (mode: 'admin' | 'employee') => {
        setAddMode(mode);
        setNewEmp(prev => ({ ...prev, role: mode === 'admin' ? 'Admin' : 'Developer' }));
    };

    const getRoleStyle = (role: string) => {
        if (role === 'Admin') return 'bg-orange-100 text-jira-orange border border-orange-200';
        if (role === 'Manager') return 'bg-purple-100 text-purple-700 border border-purple-200';
        if (role === 'Designer') return 'bg-pink-100 text-pink-700 border border-pink-200';
        if (role === 'QA Engineer') return 'bg-amber-100 text-amber-700 border border-amber-200';
        return 'bg-emerald-100 text-emerald-700 border border-emerald-200';
    };

    const getAvatarStyle = (role: string) => {
        if (role === 'Admin') return 'bg-orange-100 text-jira-orange';
        if (role === 'Manager') return 'bg-purple-100 text-purple-600';
        if (role === 'Designer') return 'bg-pink-100 text-pink-600';
        if (role === 'QA Engineer') return 'bg-amber-100 text-amber-600';
        return 'bg-emerald-100 text-emerald-700';
    };

    useEffect(() => {
        fetchEmployees();
    }, []);

    const fetchEmployees = async () => {
        try {
            const response = await fetch('http://localhost:5000/api/users/employees');
            if (response.ok) {
                const data = await response.json();
                setEmployees(data);
            }
        } catch (error) {
            console.error("Failed to fetch employees", error);
        }
    };

    const handleEditClick = (emp: any) => {
        setEditingEmpId(emp.id);
        setNewEmp({
            name: emp.name || '',
            email: emp.email || '',
            role: emp.role || 'Developer',
            dob: emp.dob || '',
            status: emp.status || 'Active',
            username: emp.username || '',
            password: '' // Keep password empty initially when editing
        });
        setAddMode(emp.role === 'Admin' ? 'admin' : 'employee');
        setIsModalOpen(true);
    };

    const handleAddEmployee = async (e: React.FormEvent) => {
        e.preventDefault();
        const url = editingEmpId
            ? `http://localhost:5000/api/users/employees/${editingEmpId}`
            : 'http://localhost:5000/api/users/employees';
        const method = editingEmpId ? 'PUT' : 'POST';

        try {
            const response = await fetch(url, {
                method: method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newEmp)
            });
            if (response.ok) {
                fetchEmployees();
                closeModal();
                alert(editingEmpId ? 'User updated successfully!' : 'User added successfully!');
            }
        } catch (error) {
            console.error(error);
            alert(`Failed to ${editingEmpId ? 'update' : 'add'} user`);
        }
    };

    const handleDeleteEmployee = async (id: number) => {
        if (!confirm('Are you sure you want to delete this employee?')) return;
        try {
            const response = await fetch(`http://localhost:5000/api/users/employees/${id}`, {
                method: 'DELETE'
            });
            if (response.ok) {
                fetchEmployees();
            }
        } catch (error) {
            console.error(error);
            alert('Failed to delete user');
        }
    };

    const filteredEmployees = employees.filter(emp => {
        const matchesSearch =
            emp.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            emp.email.toLowerCase().includes(searchQuery.toLowerCase());

        const matchesRole = roleFilter === 'All Roles' || emp.role === roleFilter;

        return matchesSearch && matchesRole;
    });

    return (
        <PanelLayout role="admin">
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-notion-text">Employee Management</h1>
                        <p className="text-gray-500 text-sm mt-1">Manage team members, roles and access permissions.</p>
                    </div>
                    <Button className="gap-2" onClick={openModal}>
                        <UserPlus size={18} /> Add Employee / Admin
                    </Button>
                </div>

                {/* ── Add Member Modal ── */}
                {isModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
                        <div className="w-full max-w-lg animate-in zoom-in-95 duration-200">

                            {/* ── Step 1: Choose Role Type ── */}
                            {!addMode && (
                                <div className="bg-white rounded-2xl overflow-hidden shadow-2xl">
                                    <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                                        <div>
                                            <h2 className="text-xl font-black text-notion-text">Add New Member</h2>
                                            <p className="text-xs text-gray-400 mt-0.5">Choose the type of account to create</p>
                                        </div>
                                        <button onClick={closeModal} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
                                    </div>
                                    <div className="p-6 grid grid-cols-2 gap-4">
                                        {/* Admin Card */}
                                        <button
                                            onClick={() => selectMode('admin')}
                                            className="group relative rounded-xl overflow-hidden border-2 border-transparent hover:border-jira-orange transition-all text-left"
                                        >
                                            <div className="bg-gradient-to-br from-jira-orange to-orange-600 p-5">
                                                <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center mb-3">
                                                    <Shield size={20} className="text-white" />
                                                </div>
                                                <h3 className="text-white font-black text-base">Admin</h3>
                                                <p className="text-white/70 text-[11px] mt-1">Full system access, manage team & projects</p>
                                            </div>
                                            <div className="bg-orange-50 px-4 py-2 text-[10px] font-bold text-jira-orange uppercase tracking-widest flex items-center gap-1">
                                                Create Admin Account →
                                            </div>
                                        </button>

                                        {/* Employee Card */}
                                        <button
                                            onClick={() => selectMode('employee')}
                                            className="group relative rounded-xl overflow-hidden border-2 border-transparent hover:border-emerald-500 transition-all text-left"
                                        >
                                            <div className="bg-gradient-to-br from-emerald-500 to-teal-600 p-5">
                                                <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center mb-3">
                                                    <Users size={20} className="text-white" />
                                                </div>
                                                <h3 className="text-white font-black text-base">Employee</h3>
                                                <p className="text-white/70 text-[11px] mt-1">Access tasks, Kanban board & AI tools</p>
                                            </div>
                                            <div className="bg-emerald-50 px-4 py-2 text-[10px] font-bold text-emerald-700 uppercase tracking-widest flex items-center gap-1">
                                                Create Employee Account →
                                            </div>
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* ── Step 2: Fill in Details ── */}
                            {addMode && (
                                <div className="bg-white rounded-2xl overflow-hidden shadow-2xl">
                                    {/* Coloured header based on role */}
                                    <div className={`p-5 ${addMode === 'admin'
                                        ? 'bg-gradient-to-r from-jira-orange to-orange-600'
                                        : 'bg-gradient-to-r from-emerald-500 to-teal-600'
                                        }`}>
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <button onClick={() => setAddMode(null)} className="text-white/70 hover:text-white">
                                                    <ArrowLeft size={18} />
                                                </button>
                                                <div>
                                                    <p className="text-white/70 text-[10px] uppercase font-bold tracking-widest">{editingEmpId ? 'Updating' : 'Creating'}</p>
                                                    <h2 className="text-lg font-black text-white">
                                                        {addMode === 'admin' ?
                                                            (editingEmpId ? 'Edit Admin Account' : 'Admin Account') :
                                                            (editingEmpId ? 'Edit Employee Account' : 'Employee Account')}
                                                    </h2>
                                                </div>
                                            </div>
                                            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                                                {addMode === 'admin' ? <Shield size={20} className="text-white" /> : <Users size={20} className="text-white" />}
                                            </div>
                                        </div>
                                    </div>

                                    <form onSubmit={handleAddEmployee} className="p-6 space-y-4">
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-wider">Full Name</label>
                                                <input type="text" required
                                                    className={`w-full mt-1 px-3 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 transition-all ${addMode === 'admin' ? 'focus:ring-jira-orange/40 focus:border-jira-orange' : 'focus:ring-emerald-400/40 focus:border-emerald-500'
                                                        } border-gray-200`}
                                                    value={newEmp.name}
                                                    onChange={e => setNewEmp({ ...newEmp, name: e.target.value })}
                                                    placeholder="Jane Doe"
                                                />
                                            </div>
                                            <div>
                                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-wider">Username</label>
                                                <input type="text" required
                                                    className={`w-full mt-1 px-3 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 transition-all ${addMode === 'admin' ? 'focus:ring-jira-orange/40 focus:border-jira-orange' : 'focus:ring-emerald-400/40 focus:border-emerald-500'
                                                        } border-gray-200`}
                                                    value={newEmp.username}
                                                    onChange={e => setNewEmp({ ...newEmp, username: e.target.value })}
                                                    placeholder="janedoe"
                                                />
                                            </div>
                                        </div>
                                        <div>
                                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-wider">Email Address</label>
                                            <input type="email" required
                                                className={`w-full mt-1 px-3 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 transition-all ${addMode === 'admin' ? 'focus:ring-jira-orange/40 focus:border-jira-orange' : 'focus:ring-emerald-400/40 focus:border-emerald-500'
                                                    } border-gray-200`}
                                                value={newEmp.email}
                                                onChange={e => setNewEmp({ ...newEmp, email: e.target.value })}
                                                placeholder="jane@company.com"
                                            />
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-wider">Password</label>
                                                <input type="password" required={!editingEmpId}
                                                    className={`w-full mt-1 px-3 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 transition-all ${addMode === 'admin' ? 'focus:ring-jira-orange/40 focus:border-jira-orange' : 'focus:ring-emerald-400/40 focus:border-emerald-500'
                                                        } border-gray-200`}
                                                    value={newEmp.password}
                                                    onChange={e => setNewEmp({ ...newEmp, password: e.target.value })}
                                                    placeholder={editingEmpId ? "Leave blank to keep current" : "••••••••"}
                                                />
                                            </div>
                                            <div>
                                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-wider">Role</label>
                                                <select
                                                    className="w-full mt-1 px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none"
                                                    value={newEmp.role}
                                                    onChange={e => setNewEmp({ ...newEmp, role: e.target.value })}
                                                    disabled={addMode === 'admin'}
                                                >
                                                    {addMode === 'admin' ? (
                                                        <option>Admin</option>
                                                    ) : (
                                                        <>
                                                            <option>Developer</option>
                                                            <option>Designer</option>
                                                            <option>Manager</option>
                                                            <option>QA Engineer</option>
                                                        </>
                                                    )}
                                                </select>
                                            </div>
                                        </div>
                                        <div>
                                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-wider">Date of Birth</label>
                                            <input type="date"
                                                className={`w-full mt-1 px-3 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 transition-all ${addMode === 'admin' ? 'focus:ring-jira-orange/40 focus:border-jira-orange' : 'focus:ring-emerald-400/40 focus:border-emerald-500'
                                                    } border-gray-200`}
                                                value={newEmp.dob}
                                                onChange={e => setNewEmp({ ...newEmp, dob: e.target.value })}
                                            />
                                        </div>
                                        <div className="flex gap-3 pt-2">
                                            <button type="button" onClick={closeModal}
                                                className="flex-1 py-2.5 rounded-lg border border-gray-200 text-sm font-bold text-gray-500 hover:bg-gray-50 transition-all">
                                                Cancel
                                            </button>
                                            <button type="submit"
                                                className={`flex-1 py-2.5 rounded-lg text-white font-bold text-sm transition-all shadow-lg ${addMode === 'admin'
                                                    ? 'bg-gradient-to-r from-jira-orange to-orange-600 hover:from-orange-600 hover:to-orange-700 shadow-orange-200'
                                                    : 'bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 shadow-emerald-200'
                                                    }`}>
                                                {editingEmpId ? 'Update' : 'Create'} {addMode === 'admin' ? 'Admin' : 'Employee'} Account
                                            </button>
                                        </div>
                                    </form>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Filters and Search */}
                <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-notion-sidebar p-4 rounded-lg border border-notion-border">
                    <div className="relative w-full sm:w-96">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                            <Search size={16} />
                        </div>
                        <input
                            type="text"
                            className="block w-full pl-10 pr-3 py-2 border border-notion-border rounded-md text-sm bg-white placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-jira-orange"
                            placeholder="Search by name or email..."
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                        />
                    </div>
                    <div className="flex items-center gap-3">
                        <select
                            className="bg-white border border-notion-border rounded-md text-xs px-3 py-2 focus:outline-none"
                            value={roleFilter}
                            onChange={e => setRoleFilter(e.target.value)}
                        >
                            <option>All Roles</option>
                            <option>Admin</option>
                            <option>Developer</option>
                            <option>Designer</option>
                            <option>Manager</option>
                            <option>QA Engineer</option>
                        </select>
                    </div>
                </div>

                {/* Employee List */}
                <div className="bg-white border border-notion-border rounded-lg overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse min-w-[800px]">
                            <thead>
                                <tr className="bg-gray-50 text-xs font-semibold text-gray-500 uppercase tracking-wider border-b border-notion-border">
                                    <th className="px-6 py-4">Employee</th>
                                    <th className="px-6 py-4">Role / Department</th>
                                    <th className="px-6 py-4">Details</th>
                                    <th className="px-6 py-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {filteredEmployees.map((emp) => (
                                    <tr key={emp.id} className="hover:bg-gray-50/50 transition-colors group">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm ${getAvatarStyle(emp.role)}`}>
                                                    {emp.name.split(' ').map((n: string) => n[0]).join('')}
                                                </div>
                                                <div>
                                                    <p className="text-sm font-semibold text-notion-text">{emp.name}</p>
                                                    <div className="flex items-center gap-1 text-[11px] text-gray-400">
                                                        <Mail size={12} /> {emp.email}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold ${getRoleStyle(emp.role)}`}>
                                                {emp.role === 'Admin' ? <Shield size={10} /> : <Briefcase size={10} />}
                                                {emp.role}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2 text-[11px] text-gray-400">
                                                <Calendar size={12} /> Born: {emp.dob}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button
                                                    onClick={() => handleEditClick(emp)}
                                                    className="p-1.5 rounded hover:bg-gray-200 text-gray-500"
                                                >
                                                    <Edit2 size={16} />
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteEmployee(emp.id)}
                                                    className="p-1.5 rounded hover:bg-red-50 text-red-500"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Empty State Illustration Placeholder */}
                {filteredEmployees.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-24 text-center">
                        <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                            <Users size={48} className="text-gray-200" />
                        </div>
                        <h3 className="text-lg font-medium text-notion-text">No employees found</h3>
                        <p className="text-sm text-gray-500 max-w-xs mt-1">Start by adding your first team member to the system.</p>
                        <Button variant="secondary" className="mt-6" onClick={() => setIsModalOpen(true)}>Add Employee</Button>
                    </div>
                )}
            </div>
        </PanelLayout>
    );
}
