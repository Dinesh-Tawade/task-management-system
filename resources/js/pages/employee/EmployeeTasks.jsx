import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useToast } from '../../contexts/ToastContext';

export default function EmployeeTasks() {
    const { showToast } = useToast();
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedTask, setSelectedTask] = useState(null);
    const [detailOpen, setDetailOpen] = useState(false);
    const [comments, setComments] = useState([]);
    const [newComment, setNewComment] = useState('');
    const [histories, setHistories] = useState([]);
    const [updatingTaskId, setUpdatingTaskId] = useState(null);

    const fetchTasks = async () => {
        try {
            const response = await axios.get('/tasks');
            setTasks(response.data.data);
        } catch (error) {
            console.error('Error fetching employee tasks', error);
        }
    };

    const loadData = async () => {
        setLoading(true);
        await fetchTasks();
        setLoading(false);
    };

    useEffect(() => {
        loadData();
    }, []);

    const updateStatus = async (taskId, newStatus) => {
        setUpdatingTaskId(taskId);
        try {
            await axios.put(`/tasks/${taskId}`, { status: newStatus });
            await fetchTasks();
            showToast(`Task status updated to '${newStatus}'`, 'success');
            
            // Refresh detailed view details if open
            if (selectedTask && selectedTask.id === taskId) {
                fetchTaskDetails({ id: taskId });
            }
        } catch (error) {
            showToast(error.response?.data?.message || 'Error updating status', 'error');
        } finally {
            setUpdatingTaskId(null);
        }
    };

    const fetchTaskDetails = async (task) => {
        setDetailOpen(true);
        try {
            const [detailRes, commentRes] = await Promise.all([
                axios.get(`/tasks/${task.id}`),
                axios.get(`/tasks/${task.id}/comments`)
            ]);
            setSelectedTask(detailRes.data.data);
            setHistories(detailRes.data.data.histories || []);
            setComments(commentRes.data.data || []);
        } catch (error) {
            console.error('Error loading task details', error);
        }
    };

    const handleAddComment = async (e) => {
        e.preventDefault();
        if (!newComment.trim()) return;

        try {
            const response = await axios.post(`/tasks/${selectedTask.id}/comments`, {
                comment: newComment
            });
            setComments([response.data.data, ...comments]);
            setNewComment('');
            showToast('Progress note posted successfully', 'success');
        } catch (error) {
            showToast('Error posting progress note', 'error');
        }
    };

    const getPriorityColor = (p) => {
        switch (p) {
            case 'high': return 'bg-rose-500/10 text-rose-400 border border-rose-500/20';
            case 'medium': return 'bg-amber-500/10 text-amber-400 border border-amber-500/20';
            default: return 'bg-sky-500/10 text-sky-400 border border-sky-500/20';
        }
    };

    const columns = [
        { key: 'pending', title: 'Pending Tasks', color: 'border-slate-800' },
        { key: 'in-progress', title: 'Active In Progress', color: 'border-indigo-500/20' },
        { key: 'completed', title: 'Completed', color: 'border-emerald-500/20' }
    ];

    if (loading && tasks.length === 0) {
        return (
            <div className="flex items-center justify-center h-96">
                <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-indigo-500"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-bold text-white font-sans tracking-tight">My Task Board</h2>
                <p className="text-slate-400 text-sm">Review your tasks list and update completion progress</p>
            </div>

            {/* Kanban Columns */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {columns.map(col => {
                    const colTasks = tasks.filter(t => t.status === col.key);
                    return (
                        <div key={col.key} className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-4 flex flex-col min-h-[450px]">
                            <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-800/60">
                                <h3 className="font-bold text-white flex items-center gap-2 text-xs uppercase tracking-wider">
                                    <span className={`w-2.5 h-2.5 rounded-full ${
                                        col.key === 'pending' ? 'bg-slate-500' : col.key === 'in-progress' ? 'bg-indigo-500' : 'bg-emerald-500'
                                    }`}></span>
                                    {col.title}
                                </h3>
                                <span className="bg-slate-850 text-slate-300 text-xs px-2 py-0.5 rounded-full font-semibold">
                                    {colTasks.length}
                                </span>
                            </div>

                            <div className="space-y-3 flex-1 overflow-y-auto pr-1">
                                {colTasks.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center h-32 border border-dashed border-slate-850/60 rounded-xl text-xs text-slate-500">
                                        No tasks assigned
                                    </div>
                                ) : (
                                    colTasks.map(task => (
                                        <div 
                                            key={task.id} 
                                            className="bg-slate-950 border border-slate-850/60 hover:border-slate-700/80 p-4 rounded-xl shadow-md transition duration-200 group cursor-pointer"
                                            onClick={() => fetchTaskDetails(task)}
                                        >
                                            <div className="flex justify-between items-start gap-2 mb-2">
                                                <h4 className="font-bold text-sm text-slate-100 group-hover:text-indigo-400 transition line-clamp-1">{task.title}</h4>
                                                <span className={`text-[9px] uppercase font-bold tracking-wider px-2 py-0.5 rounded ${getPriorityColor(task.priority)}`}>
                                                    {task.priority}
                                                </span>
                                            </div>
                                            <p className="text-xs text-slate-400 line-clamp-2 mb-4 leading-normal">{task.description}</p>
                                            
                                            <div className="flex justify-between items-center text-[10px] text-slate-500 border-t border-slate-850 pt-3">
                                                <span className="flex items-center gap-1 font-mono text-[9px]">
                                                    {task.due_date ? new Date(task.due_date).toLocaleDateString() : 'No Limit'}
                                                </span>

                                                <div className="flex gap-1.5" onClick={e => e.stopPropagation()}>
                                                    {col.key === 'pending' && (
                                                        <button 
                                                            disabled={updatingTaskId === task.id}
                                                            onClick={() => updateStatus(task.id, 'in-progress')}
                                                            className="bg-indigo-600/10 hover:bg-indigo-600 border border-indigo-500/20 hover:border-indigo-500 text-indigo-400 hover:text-white px-2 py-1 rounded text-[9px] font-bold transition uppercase tracking-wider cursor-pointer"
                                                        >
                                                            Start Task
                                                        </button>
                                                    )}
                                                    {col.key === 'in-progress' && (
                                                        <>
                                                            <button 
                                                                disabled={updatingTaskId === task.id}
                                                                onClick={() => updateStatus(task.id, 'pending')}
                                                                className="bg-slate-850 hover:bg-slate-800 border border-slate-800 text-slate-300 px-2 py-1 rounded text-[9px] font-bold transition uppercase tracking-wider cursor-pointer"
                                                            >
                                                                Pause
                                                            </button>
                                                            <button 
                                                                disabled={updatingTaskId === task.id}
                                                                onClick={() => updateStatus(task.id, 'completed')}
                                                                className="bg-emerald-600/10 hover:bg-emerald-600 border border-emerald-500/20 hover:border-emerald-500 text-emerald-400 hover:text-white px-2 py-1 rounded text-[9px] font-bold transition uppercase tracking-wider cursor-pointer"
                                                            >
                                                                Complete
                                                            </button>
                                                        </>
                                                    )}
                                                    {col.key === 'completed' && (
                                                        <button 
                                                            disabled={updatingTaskId === task.id}
                                                            onClick={() => updateStatus(task.id, 'in-progress')}
                                                            className="bg-slate-850 hover:bg-slate-800 border border-slate-800 text-slate-300 px-2 py-1 rounded text-[9px] font-bold transition uppercase tracking-wider cursor-pointer"
                                                        >
                                                            Reopen
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Task Detail overlay sidebar drawer */}
            {detailOpen && selectedTask && (
                <div className="fixed inset-0 z-50 flex items-center justify-end p-0 bg-slate-950/80 backdrop-blur-sm">
                    <div className="bg-slate-900 border-l border-slate-800 w-full max-w-xl h-full flex flex-col shadow-2xl animate-in slide-in-from-right duration-200">
                        {/* Drawer Header */}
                        <div className="px-6 py-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
                            <span className={`text-[9px] uppercase font-bold tracking-wider px-2 py-0.5 rounded border ${getPriorityColor(selectedTask.priority)}`}>
                                {selectedTask.priority} Priority
                            </span>
                            <button 
                                onClick={() => setDetailOpen(false)}
                                className="text-slate-400 hover:text-white transition p-1 hover:bg-slate-900 border border-transparent hover:border-slate-800 rounded-lg cursor-pointer"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        {/* Drawer Body */}
                        <div className="flex-1 overflow-y-auto p-6 space-y-6">
                            <div>
                                <h3 className="text-lg font-bold text-white leading-tight">{selectedTask.title}</h3>
                                <p className="text-slate-400 text-xs mt-2 leading-relaxed">{selectedTask.description || 'No description provided.'}</p>
                            </div>

                            <div className="grid grid-cols-2 gap-4 bg-slate-950/50 p-4 border border-slate-850 rounded-xl text-xs">
                                <div>
                                    <span className="text-slate-500 block uppercase tracking-wider font-semibold text-[9px] mb-0.5">Assigned By</span>
                                    <span className="text-slate-200 font-medium">{selectedTask.created_by?.name || 'System'}</span>
                                </div>
                                <div>
                                    <span className="text-slate-500 block uppercase tracking-wider font-semibold text-[9px] mb-0.5">Due Date</span>
                                    <span className="text-slate-200 font-medium">{selectedTask.due_date ? new Date(selectedTask.due_date).toLocaleString() : 'No limit'}</span>
                                </div>
                            </div>

                            {/* Section: Timeline Logs */}
                            <div className="space-y-3">
                                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Task Timeline History</h4>
                                <div className="relative pl-5 border-l border-slate-800 space-y-4 text-xs">
                                    {histories.length > 0 ? (
                                        histories.map(h => (
                                            <div key={h.id} className="relative">
                                                <div className="absolute -left-[27px] top-1 w-2.5 h-2.5 rounded-full bg-slate-900 border-2 border-indigo-500"></div>
                                                <div className="text-slate-300">
                                                    {h.description}
                                                </div>
                                                <div className="text-[10px] text-slate-500 mt-0.5">
                                                    by {h.user?.name || 'System'} • {new Date(h.created_at).toLocaleString()}
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="text-slate-500 italic">No logs found.</div>
                                    )}
                                </div>
                            </div>

                            {/* Section: Discussion Comments */}
                            <div className="space-y-4 pt-4 border-t border-slate-850">
                                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Progress Notes & Discussion ({comments.length})</h4>
                                
                                <form onSubmit={handleAddComment} className="flex gap-2">
                                    <input 
                                        type="text"
                                        placeholder="Add progress note or query..."
                                        value={newComment}
                                        onChange={(e) => setNewComment(e.target.value)}
                                        className="flex-1 bg-slate-950 border border-slate-800 text-xs text-white rounded-lg px-3 py-2.5 focus:outline-none focus:border-indigo-500"
                                    />
                                    <button 
                                        type="submit"
                                        className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs px-4 rounded-lg shadow-md transition cursor-pointer"
                                    >
                                        Add Note
                                    </button>
                                </form>

                                <div className="space-y-3">
                                    {comments.map(c => (
                                        <div key={c.id} className="bg-slate-950/60 border border-slate-850 p-3 rounded-xl text-xs space-y-1.5">
                                            <div className="flex justify-between items-center text-slate-400">
                                                <span className="font-bold text-slate-200 flex items-center gap-1.5">
                                                    <div className="w-4 h-4 rounded bg-indigo-500/10 text-indigo-400 flex items-center justify-center font-bold text-[8px] uppercase">
                                                        {c.user?.name.slice(0, 2)}
                                                    </div>
                                                    {c.user?.name}
                                                </span>
                                                <span className="text-[9px] text-slate-500">{new Date(c.created_at).toLocaleString()}</span>
                                            </div>
                                            <p className="text-slate-300 leading-relaxed">{c.comment}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Drawer Footer */}
                        <div className="px-6 py-4 bg-slate-950/80 border-t border-slate-800 flex justify-end">
                            <button 
                                onClick={() => setDetailOpen(false)}
                                className="bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold py-2.5 px-4 rounded-lg border border-slate-700/80 transition cursor-pointer"
                            >
                                Close Panels
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
