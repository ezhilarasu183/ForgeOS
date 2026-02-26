"use client";

import React, { useState, useEffect, useRef } from 'react';
import { X, Send, Bot, User, Loader2 } from 'lucide-react';
import { API_BASE_URL } from '@/lib/api';

interface Message {
    id: string;
    text: string;
    sender: 'user' | 'ai';
    timestamp: Date;
    isAction?: boolean;
    isError?: boolean;
}

const QUICK_CHIPS_ADMIN = [
    'Create project…', 'Assign task to…', 'List all projects', 'Show all tasks'
];
const QUICK_CHIPS_EMP = [
    'Show my tasks', 'Assign task to me…', 'Mark task as done…', 'What can you do?'
];

export const AIAssistant = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [isClosing, setIsClosing] = useState(false);
    const [message, setMessage] = useState('');
    const [chatHistory, setChatHistory] = useState<Message[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [currentUser, setCurrentUser] = useState<any>(null);
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (storedUser) setCurrentUser(JSON.parse(storedUser));
    }, []);

    useEffect(() => {
        if (!currentUser) return;
        const isAdmin = currentUser?.role?.toLowerCase() === 'admin';
        setChatHistory([{
            id: '1',
            text: isAdmin
                ? `Hey ${currentUser.name}! 👋 I have full access to your workspace.\n\nI can:\n• Create and manage projects\n• Assign and update tasks\n• List projects & tasks\n• Add members to projects\n\nJust tell me what to do!`
                : `Hi ${currentUser.name}! 🤖 I can manage your tasks.\n\nTry:\n• "Assign Fix Login Bug to me"\n• "Mark Review Code as done"\n• "Show my tasks"`,
            sender: 'ai',
            timestamp: new Date()
        }]);
    }, [currentUser]);

    useEffect(() => {
        if (scrollRef.current)
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }, [chatHistory, isOpen]);

    const handleOpen = () => { setIsClosing(false); setIsOpen(true); };
    const handleClose = () => {
        setIsClosing(true);
        setTimeout(() => { setIsOpen(false); setIsClosing(false); }, 240);
    };

    const addAIMessage = (text: string, isAction = false, isError = false) =>
        setChatHistory(prev => [...prev, {
            id: (Date.now() + Math.random()).toString(),
            text, sender: 'ai', timestamp: new Date(), isAction, isError
        }]);

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!message.trim() || isLoading) return;

        setChatHistory(prev => [...prev, {
            id: Date.now().toString(), text: message, sender: 'user', timestamp: new Date()
        }]);
        const currentInput = message;
        setMessage('');
        setIsLoading(true);

        try {
            // ── Single smart-chat call ────────────────────────────
            const res = await fetch('http://localhost:5000/api/ai/smart-chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    message: currentInput,
                    user_email: currentUser?.email || '',
                    user_name: currentUser?.name || '',
                    user_role: currentUser?.role || ''
                })
            });

            const intent = await res.json();
            const action = intent.action;

            // ── Show AI's conversational reply first ──────────────
            if (intent.reply) addAIMessage(intent.reply);

            // ── Execute the action ────────────────────────────────
            if (action === 'add_task') {
                const resolvedAssignee = intent.assignee === 'SELF'
                    ? currentUser?.name
                    : (intent.assignee || currentUser?.name);

                const taskRes = await fetch('http://localhost:5000/api/tasks', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        title: intent.title,
                        assignee: resolvedAssignee,
                        priority: intent.priority || 'Medium',
                        dueDate: intent.due_date || '',
                        status: 'todo',
                        project_id: 1003,
                        created_by: currentUser?.email
                    })
                });
                if (taskRes.ok) {
                    addAIMessage(`✅ Task **"${intent.title}"** created and assigned to **${resolvedAssignee}**.`, true);
                    window.dispatchEvent(new CustomEvent('taskCreated'));
                } else {
                    addAIMessage('❌ Task creation failed. Please try again.', false, true);
                }

            } else if (action === 'create_project') {
                const projRes = await fetch('http://localhost:5000/api/projects', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        name: intent.name,
                        owner: currentUser?.name || 'Admin',
                        email: currentUser?.email || '',
                        description: intent.description || '',
                        station: intent.station || '',
                        next_development_stage: intent.next_development_stage || ''
                    })
                });
                if (projRes.ok) {
                    addAIMessage(`🚀 Project **"${intent.name}"** created! Go to Projects to see it.`, true);
                    window.dispatchEvent(new CustomEvent('projectCreated'));
                } else {
                    addAIMessage('❌ Project creation failed. Please try again.', false, true);
                }

            } else if (action === 'update_task_status') {
                // Find task by title in context
                const tasksRes = await fetch('http://localhost:5000/api/tasks');
                const allTasks = await tasksRes.json();
                const targetTask = allTasks.find((t: any) =>
                    t.task?.toLowerCase().includes(intent.task_title?.toLowerCase())
                );

                if (targetTask) {
                    const progress = intent.progress !== null && intent.progress !== undefined
                        ? intent.progress
                        : (intent.status === 'done' ? 100 : intent.status === 'inprogress' ? 50 : 0);

                    await fetch(`http://localhost:5000/api/tasks/${targetTask.id}`, {
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ progress, status: intent.status || 'done' })
                    });
                    addAIMessage(`✅ Task **"${targetTask.task}"** updated to **${intent.status || 'done'}**.`, true);
                    window.dispatchEvent(new CustomEvent('taskCreated'));
                } else {
                    addAIMessage(`⚠️ Could not find task: "${intent.task_title}". Check the exact task name.`, false, true);
                }

            } else if (action === 'delete_task') {
                const tasksRes = await fetch('http://localhost:5000/api/tasks');
                const allTasks = await tasksRes.json();
                const targetTask = allTasks.find((t: any) =>
                    t.task?.toLowerCase().includes(intent.task_title?.toLowerCase())
                );
                if (targetTask) {
                    await fetch(`http://localhost:5000/api/tasks/${targetTask.id}`, { method: 'DELETE' });
                    addAIMessage(`🗑️ Task **"${targetTask.task}"** deleted.`, true);
                    window.dispatchEvent(new CustomEvent('taskCreated'));
                } else {
                    addAIMessage(`⚠️ Couldn't find task "${intent.task_title}".`, false, true);
                }

            } else if (action === 'list_tasks') {
                if (intent.tasks_context?.length) {
                    const lines = intent.tasks_context.map((t: any) =>
                        `• **${t.task}** → ${t.assignee} | ${t.status || 'todo'}`
                    ).join('\n');
                    addAIMessage(lines);
                }
                // reply already shown above

            } else if (action === 'list_projects') {
                if (intent.projects_context?.length) {
                    const lines = intent.projects_context.map((p: any) =>
                        `• **${p.name}**`
                    ).join('\n');
                    addAIMessage(lines);
                }

            } else if (action === 'add_member') {
                // Find employee id and project id
                const [empsRes, projsRes] = await Promise.all([
                    fetch('http://localhost:5000/api/users/employees'),
                    fetch('http://localhost:5000/api/projects')
                ]);
                const emps = await empsRes.json();
                const projs = await projsRes.json();

                const emp = emps.find((e: any) =>
                    e.name?.toLowerCase() === intent.member_name?.toLowerCase()
                );
                const proj = projs.find((p: any) =>
                    p.name?.toLowerCase().includes(intent.project_name?.toLowerCase())
                );

                if (emp && proj) {
                    const memberRes = await fetch(`http://localhost:5000/api/projects/${proj.id}/members`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ employee_id: emp.id })
                    });
                    if (memberRes.ok) {
                        addAIMessage(`✅ **${emp.name}** added to project **"${proj.name}"**.`, true);
                    } else {
                        addAIMessage(`❌ Could not add member. They may already be in the project.`, false, true);
                    }
                } else {
                    addAIMessage(`⚠️ Could not find employee "${intent.member_name}" or project "${intent.project_name}".`, false, true);
                }
            }
            // 'chat' action → reply already shown above

        } catch (err: any) {
            const msg = err?.message?.includes('fetch') || err?.message?.includes('Failed')
                ? "❌ Can't reach the backend on port 5000. The server may have just restarted — please wait 2 seconds and try again."
                : `❌ Error: ${err?.message || 'Unknown error'}`;
            addAIMessage(msg, false, true);
        } finally {
            setIsLoading(false);
        }
    };

    const isAdmin = currentUser?.role?.toLowerCase() === 'admin';
    const chips = isAdmin ? QUICK_CHIPS_ADMIN : QUICK_CHIPS_EMP;

    return (
        <div className="fixed bottom-6 right-6 z-[9999] flex flex-col items-end gap-3">

            {/* ── Chat Window ── */}
            {isOpen && (
                <div className={`w-[400px] h-[560px] bg-white rounded-3xl border border-orange-100 flex flex-col overflow-hidden shadow-[0_25px_60px_rgba(249,115,22,0.18),0_8px_20px_rgba(0,0,0,0.12)] ${isClosing ? 'chat-pop-out' : 'chat-pop-in'}`}>

                    {/* Header */}
                    <div className="bg-gradient-to-r from-orange-400 via-jira-orange to-orange-600 p-4 flex items-center justify-between text-white relative overflow-hidden">
                        <div className="absolute inset-0 pointer-events-none" style={{ background: 'linear-gradient(120deg,rgba(255,255,255,0.06),rgba(255,255,255,0) 60%)' }} />
                        <div className="flex items-center gap-3 relative">
                            <div className="w-10 h-10 bg-white/10 rounded-2xl flex items-center justify-center backdrop-blur-md border border-white/20">
                                <Bot size={20} className="text-white" />
                            </div>
                            <div>
                                <h3 className="text-sm font-black">AI Workspace Assistant</h3>
                                <div className="flex items-center gap-1.5 mt-0.5">
                                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse shadow-[0_0_6px_#4ade80]" />
                                    <span className="text-[10px] font-bold text-white/70 uppercase tracking-widest">Full Access · Online</span>
                                </div>
                            </div>
                        </div>
                        <button onClick={handleClose} className="p-1.5 hover:bg-white/15 rounded-xl transition-all active:scale-90">
                            <X size={18} />
                        </button>
                    </div>

                    {/* Quick action chips */}
                    <div className="flex gap-1.5 px-3 pt-2.5 pb-1 flex-wrap border-b border-gray-50">
                        {chips.map(chip => (
                            <button key={chip} onClick={() => setMessage(chip.replace('…', ' '))}
                                className="text-[10px] font-bold bg-orange-50 text-jira-orange border border-orange-100 px-2.5 py-1 rounded-full hover:bg-orange-100 active:scale-95 transition-all">
                                {chip}
                            </button>
                        ))}
                    </div>

                    {/* Messages */}
                    <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 bg-gradient-to-b from-orange-50/10 to-white space-y-3 custom-scrollbar">
                        {chatHistory.map(msg => (
                            <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                                <div className={`flex gap-2 max-w-[90%] ${msg.sender === 'user' ? 'flex-row-reverse' : ''}`}>
                                    <div className={`w-7 h-7 rounded-full flex-shrink-0 flex items-center justify-center shadow-sm ${msg.sender === 'user' ? 'bg-orange-100 text-jira-orange' : 'bg-white border border-orange-100 text-gray-400'}`}>
                                        {msg.sender === 'user' ? <User size={12} /> : <Bot size={12} />}
                                    </div>
                                    <div className={`p-3 rounded-2xl text-sm leading-relaxed shadow-sm whitespace-pre-line
                                        ${msg.sender === 'user'
                                            ? 'bg-gradient-to-br from-orange-400 to-jira-orange text-white rounded-tr-none'
                                            : msg.isAction
                                                ? 'bg-gradient-to-br from-emerald-50 to-green-50 text-emerald-800 border border-emerald-100 rounded-tl-none font-medium'
                                                : msg.isError
                                                    ? 'bg-red-50 text-red-600 border border-red-100 rounded-tl-none'
                                                    : 'bg-white text-gray-700 border border-gray-100 rounded-tl-none'
                                        }`}>
                                        {msg.text}
                                    </div>
                                </div>
                            </div>
                        ))}
                        {isLoading && (
                            <div className="flex justify-start">
                                <div className="flex gap-2 items-center bg-white border border-gray-100 p-3 rounded-2xl rounded-tl-none shadow-sm">
                                    <Loader2 size={14} className="text-jira-orange animate-spin" />
                                    <span className="text-[10px] font-extrabold text-gray-400 uppercase tracking-widest">Thinking…</span>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Input */}
                    <form onSubmit={handleSendMessage} className="p-3 bg-white border-t border-gray-50 flex gap-2">
                        <input
                            type="text"
                            value={message}
                            onChange={e => setMessage(e.target.value)}
                            placeholder={isAdmin ? 'Create project, assign task, list tasks…' : 'Assign task, update status…'}
                            className="flex-1 bg-gray-50/80 border border-gray-100 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-jira-orange/30 focus:bg-white transition-all shadow-inner"
                        />
                        <button type="submit" disabled={!message.trim() || isLoading}
                            className="bg-gradient-to-br from-orange-400 to-jira-orange text-white p-3 rounded-xl hover:opacity-90 transition-all shadow-lg shadow-orange-200 active:scale-95 disabled:opacity-50">
                            <Send size={17} />
                        </button>
                    </form>
                </div>
            )}

            {/* ── Floating Bot Button ── */}
            <button onClick={isOpen ? handleClose : handleOpen}
                title={isOpen ? 'Close Assistant' : 'Open AI Assistant'}
                className="relative focus:outline-none"
                style={{ background: 'none', border: 'none', padding: 0 }}>
                {isOpen ? (
                    <div className="close-ring hover:scale-110 transition-transform duration-200 active:scale-95">
                        <X size={22} className="text-white" />
                    </div>
                ) : (
                    <div className="bot-float hover:scale-110 transition-transform duration-200 active:scale-95 drop-shadow-[0_8px_20px_rgba(249,115,22,0.5)]">
                        <div className="orange-bot">
                            <div className="antenna" />
                            <div className="head">
                                <div className="ear left" />
                                <div className="ear right" />
                                <div className="visor">
                                    <div className="eye" />
                                    <div className="eye" />
                                    <div className="smile" />
                                </div>
                            </div>
                            <div className="body" style={{ position: 'relative' }}>
                                <div className="arms" style={{ top: '-2px' }}>
                                    <div className="arm" />
                                    <div className="arm" />
                                </div>
                                <div className="light" />
                                <div className="light" />
                            </div>
                        </div>
                        <div className="absolute top-0 right-0 w-3.5 h-3.5 bg-red-500 border-2 border-white rounded-full shadow-md" />
                    </div>
                )}
            </button>
        </div>
    );
};
