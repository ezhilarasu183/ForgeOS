"use client";

import React, { useState } from 'react';
import { PanelLayout } from '@/layouts/PanelLayout';
import { Card } from '@/components/Card';
import { Button } from '@/components/Button';
import { Badge } from '@/components/Badge';
import {
    Sparkles,
    Send,
    MessageSquare,
    BrainCircuit,
    Terminal,
    Calendar,
    User,
    CheckCircle2,
    ArrowRight,
    Trash2,
    Loader2
} from 'lucide-react';
import { cn } from '@/app/lib/utils';

export default function AICenterPage() {
    const [activeTab, setActiveTab] = useState<'extractor' | 'chat'>('extractor');
    const [userInput, setUserInput] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);

    // Task Extractor State
    const [extractedTasks, setExtractedTasks] = useState<any[]>([]);

    // Chat Assistant State
    const [chatHistory, setChatHistory] = useState<any[]>([
        { role: 'ai', text: 'Hello! I am your AI project assistant. How can I help you today?' }
    ]);

    const handleExtract = async () => {
        if (!userInput.trim()) return;
        setIsProcessing(true);
        try {
            const response = await fetch('http://localhost:5000/api/ai/task-intent', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ text: userInput })
            });
            if (response.ok) {
                const data = await response.json();
                if (data.intent === 'add_task') {
                    setExtractedTasks([{
                        id: Date.now(),
                        title: data.task,
                        assignee: data.assignee || 'TBA',
                        dueDate: data.due_date || 'Next Week',
                        priority: 'Medium'
                    }]);
                } else if (data.intent === 'meeting') {
                    alert(`Meeting scheduled with ${data.assignee} for ${data.due_date}`);
                } else {
                    alert('Command processed, but no specific task or meeting was identified.');
                }
            }
        } catch (error) {
            console.error(error);
            alert('Extraction failed. Check backend connection.');
        } finally {
            setIsProcessing(false);
        }
    };

    const handleChat = async () => {
        if (!userInput.trim()) return;
        const newHistory = [...chatHistory, { role: 'user', text: userInput }];
        setChatHistory(newHistory);
        setUserInput('');
        setIsProcessing(true);

        try {
            const response = await fetch('http://localhost:5000/api/ai/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: userInput })
            });
            if (response.ok) {
                const data = await response.json();
                setChatHistory([...newHistory, { role: 'ai', text: data.reply }]);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setIsProcessing(false);
        }
    };

    const addToKanban = async (task: any) => {
        try {
            const response = await fetch('http://localhost:5000/api/tasks', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    title: task.title,
                    dueDate: task.dueDate,
                    priority: task.priority,
                    assignee: task.assignee,
                    project_id: 1003
                })
            });
            if (response.ok) {
                alert('Task added to Kanban Board!');
                setExtractedTasks([]);
            }
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <PanelLayout role="employee">
            <div className="space-y-6 max-w-5xl mx-auto">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-notion-text">AI Command Center</h1>
                        <p className="text-gray-500 text-sm mt-1">Smart automation for your project workflow.</p>
                    </div>
                    <div className="flex p-1 bg-gray-100 rounded-lg">
                        <button
                            onClick={() => setActiveTab('extractor')}
                            className={cn(
                                "flex items-center gap-2 px-4 py-1.5 text-xs font-bold rounded-md transition-all",
                                activeTab === 'extractor' ? "bg-white shadow-sm text-jira-orange" : "text-gray-500 hover:text-gray-700"
                            )}
                        >
                            <BrainCircuit size={14} /> Task Extractor
                        </button>
                        <button
                            onClick={() => setActiveTab('chat')}
                            className={cn(
                                "flex items-center gap-2 px-4 py-1.5 text-xs font-bold rounded-md transition-all",
                                activeTab === 'chat' ? "bg-white shadow-sm text-jira-orange" : "text-gray-500 hover:text-gray-700"
                            )}
                        >
                            <MessageSquare size={14} /> Chat Assistant
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Left Panel: Input */}
                    <Card className="md:col-span-2 flex flex-col h-[600px] overflow-hidden">
                        <div className="p-4 border-b border-gray-50 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <span className="p-1.5 bg-orange-50 text-jira-orange rounded-md">
                                    {activeTab === 'extractor' ? <BrainCircuit size={18} /> : <MessageSquare size={18} />}
                                </span>
                                <h2 className="font-bold text-notion-text">{activeTab === 'extractor' ? 'Smart Extractor' : 'AI Assistant'}</h2>
                            </div>
                            <Badge variant="default" className="bg-emerald-50 text-emerald-600 border-emerald-100">AI Active</Badge>
                        </div>

                        <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar">
                            {activeTab === 'chat' && chatHistory.map((chat, i) => (
                                <div key={i} className={cn(
                                    "flex gap-3 max-w-[80%]",
                                    chat.role === 'user' ? "ml-auto flex-row-reverse" : ""
                                )}>
                                    <div className={cn(
                                        "w-8 h-8 rounded-lg shrink-0 flex items-center justify-center font-bold text-xs",
                                        chat.role === 'ai' ? "bg-blue-100 text-blue-600" : "bg-gray-100 text-gray-600"
                                    )}>
                                        {chat.role === 'ai' ? 'AI' : 'U'}
                                    </div>
                                    <div className={cn(
                                        "p-3 rounded-2xl text-sm leading-relaxed",
                                        chat.role === 'ai' ? "bg-gray-50 text-notion-text border border-gray-100" : "bg-jira-orange text-white"
                                    )}>
                                        {chat.text}
                                    </div>
                                </div>
                            ))}
                            {activeTab === 'extractor' && (
                                <div className="space-y-4">
                                    <div className="bg-secondary-bg border border-notion-border p-4 rounded-xl text-blue-800 text-sm leading-relaxed">
                                        Type a command like: <strong>"Assign a task to Ezhilarasu for API development by next Friday"</strong>
                                    </div>
                                    <textarea
                                        value={userInput}
                                        onChange={(e) => setUserInput(e.target.value)}
                                        className="w-full h-32 p-4 bg-gray-50 border border-gray-100 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-jira-orange/20"
                                        placeholder="Paste transcript or type command..."
                                    />
                                </div>
                            )}
                        </div>

                        <div className="p-4 border-t border-gray-50 bg-gray-50/30">
                            <div className="relative">
                                {activeTab === 'chat' && (
                                    <>
                                        <input
                                            type="text"
                                            value={userInput}
                                            onChange={(e) => setUserInput(e.target.value)}
                                            onKeyDown={(e) => e.key === 'Enter' && handleChat()}
                                            disabled={isProcessing}
                                            placeholder="Type your question..."
                                            className="w-full pl-4 pr-12 py-3 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none shadow-sm"
                                        />
                                        <button
                                            onClick={handleChat}
                                            disabled={isProcessing}
                                            className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-jira-orange text-white rounded-lg hover:bg-orange-600 transition-all disabled:opacity-50"
                                        >
                                            {isProcessing ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                                        </button>
                                    </>
                                )}
                                {activeTab === 'extractor' && (
                                    <Button
                                        onClick={handleExtract}
                                        disabled={isProcessing || !userInput.trim()}
                                        className="w-full h-11 gap-2 shadow-md shadow-blue-100"
                                    >
                                        {isProcessing ? <Loader2 size={18} className="animate-spin" /> : <Sparkles size={18} />}
                                        Extract Intent & Tasks
                                    </Button>
                                )}
                            </div>
                        </div>
                    </Card>

                    {/* Right Panel: Extracted Results */}
                    <div className="space-y-6">
                        <Card className="p-4 bg-gradient-to-br from-gray-900 to-slate-800 text-white border-0">
                            <h3 className="text-xs font-black uppercase text-gray-400 tracking-widest mb-4">Command History</h3>
                            <div className="space-y-3">
                                <div className="flex items-center gap-3 text-xs opacity-60">
                                    <Calendar size={12} /> Last command: Today, 2:15 PM
                                </div>
                                <div className="flex items-center gap-3 text-xs opacity-60">
                                    <Terminal size={12} /> Status: All systems nominal
                                </div>
                            </div>
                        </Card>

                        <div className="space-y-3">
                            <h3 className="text-xs font-black uppercase text-gray-500 tracking-widest px-2">Extracted Tasks</h3>
                            {extractedTasks.length > 0 ? extractedTasks.map(task => (
                                <Card key={task.id} className="p-4 border-notion-border hover:border-jira-orange transition-colors group">
                                    <div className="flex flex-col gap-3">
                                        <div className="flex items-center justify-between">
                                            <Badge variant="default" className="bg-orange-50 text-jira-orange text-[10px]">{task.priority}</Badge>
                                            <button
                                                onClick={() => setExtractedTasks([])}
                                                className="text-gray-300 hover:text-red-500"
                                            >
                                                <Trash2 size={14} />
                                            </button>
                                        </div>
                                        <h4 className="text-sm font-bold text-notion-text">{task.title}</h4>
                                        <div className="flex items-center justify-between pt-2 border-t border-gray-50">
                                            <div className="flex items-center gap-2 text-[10px] text-gray-500">
                                                <User size={12} /> {task.assignee}
                                            </div>
                                            <Button
                                                size="sm"
                                                className="h-7 text-[10px] px-2 font-black"
                                                onClick={() => addToKanban(task)}
                                            >
                                                Add to Board
                                            </Button>
                                        </div>
                                    </div>
                                </Card>
                            )) : (
                                <div className="bg-secondary-bg rounded-xl border border-notion-border p-4 h-[400px] flex flex-col items-center justify-center text-center opacity-40">
                                    <BrainCircuit size={32} className="text-gray-300 mb-3" />
                                    <p className="text-[11px] font-bold text-gray-400">No tasks extracted yet</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </PanelLayout>
    );
}
