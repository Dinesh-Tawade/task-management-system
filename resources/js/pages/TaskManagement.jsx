import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';

export default function TaskManagement() {
    const { showToast } = useToast();
    const { user, hasRole } = useAuth();
    const [tasks, setTasks] = useState([]);
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [modalOpen, setModalOpen] = useState(false);
    const [editingTask, setEditingTask] = useState(null);
    const [detailOpen, setDetailOpen] = useState(false);
    const [selectedTask, setSelectedTask] = useState(null);

    // Comments & History states
    const [comments, setComments] = useState([]);
    const [newComment, setNewComment] = useState('');
    const [histories, setHistories] = useState([]);

    // Filters
    const [status, setStatus] = useState('');
    const [priority, setPriority] = useState('');
    const [assignedToFilter, setAssignedToFilter] = useState('');
    const [createdByFilter, setCreatedByFilter] = useState('');

    // Form inputs
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [taskPriority, setTaskPriority] = useState('medium');
    const [taskStatus, setTaskStatus] = useState('pending');
    const [dueDate, setDueDate] = useState('');
    const [assignedTo, setAssignedTo] = useState('');

    const fetchTasks = async () => {
        try {
            const queryParams = [];
            if (status) queryParams.push(`status=${status}`);
            if (priority) queryParams.push(`priority=${priority}`);
            if (assignedToFilter) queryParams.push(`assigned_to=${assignedToFilter}`);
            if (createdByFilter) queryParams.push(`created_by=${createdByFilter}`);
            
            // Managers only see team tasks if `team_only=1` is enabled
            if (hasRole('Manager')) {
                queryParams.push('team_only=1');
            }

            const queryStr = queryParams.length ? `?${queryParams.join('&')}` : '';
            const response = await axios.get(`/tasks${queryStr}`);
            setTasks(response.data.data);
        } catch (error) {
            console.error('Error fetching tasks', error);
        }
    };

    const fetchUsers = async () => {
        try {
            const response = await axios.get('/users');
            setUsers(response.data.data);
        } catch (error) {
            console.error('Error fetching users', error);
        }
    };

    const loadData = async () => {
        setLoading(true);
        await Promise.all([fetchTasks(), fetchUsers()]);
        setLoading(false);
    };

    useEffect(() => {
        loadData();
    }, [status, priority, assignedToFilter, createdByFilter]);

    const handleCreateOrUpdate = async (e) => {
        e.preventDefault();

        let formattedDate = null;
        if (dueDate) {
            const d = new Date(dueDate);
            formattedDate = d.toISOString().slice(0, 19).replace('T', ' ');
        }

        const data = {
            title,
            description,
            priority: taskPriority,
            status: taskStatus,
            due_date: formattedDate,
            assigned_to: assignedTo || null
        };

        try {
            if (editingTask) {
                await axios.put(`/tasks/${editingTask.id}`, data);
                showToast('Task updated successfully', 'success');
            } else {
                await axios.post('/tasks', data);
                showToast('Task created successfully', 'success');
            }
            setModalOpen(false);
            resetForm();
            fetchTasks();
        } catch (error) {
            showToast(error.response?.data?.message || 'Error processing task', 'error');
        }
    };

    const handleDelete = async (taskId) => {
        if (!confirm('Are you sure you want to delete this task?')) return;

        try {
            await axios.delete(`/tasks/${taskId}`);
            fetchTasks();
            showToast('Task deleted successfully', 'success');
            if (selectedTask && selectedTask.id === taskId) {
                setDetailOpen(false);
            }
        } catch (error) {
            showToast('Error deleting task', 'error');
        }
    };

    const fetchTaskDetails = async (task) => {
        setSelectedTask(task);
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
            console.error('Error fetching task details', error);
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
            showToast('Comment posted successfully', 'success');
        } catch (error) {
            showToast('Error posting comment', 'error');
        }
    };

    const resetForm = () => {
        setEditingTask(null);
        setTitle('');
        setDescription('');
        setTaskPriority('medium');
        setTaskStatus('pending');
        setDueDate('');
        setAssignedTo('');
    };

    const openCreateModal = () => {
        resetForm();
        setModalOpen(true);
    };

    const openEditModal = (task) => {
        setEditingTask(task);
        setTitle(task.title);
        setDescription(task.description || '');
        setTaskPriority(task.priority);
        setTaskStatus(task.status);
        
        if (task.due_date) {
            const d = new Date(task.due_date);
            const localIsoString = new Date(d.getTime() - d.getTimezoneOffset() * 60000)
                .toISOString()
                .slice(0, 16);
            setDueDate(localIsoString);
        } else {
            setDueDate('');
        }
        
        setAssignedTo(task.assigned_to_id || '');
        setModalOpen(true);
    };

    const getPriorityBadge = (p) => {
        switch (p) {
            case 'high': return 'bg-rose-500/10 text-rose-400 border border-rose-500/20';
            case 'medium': return 'bg-amber-500/10 text-amber-400 border border-amber-500/20';
            default: return 'bg-sky-500/10 text-sky-400 border border-sky-500/20';
        }
    };

    const getStatusBadge = (s) => {
        switch (s) {
            case 'completed': return 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20';
            case 'in-progress': return 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20';
            default: return 'bg-slate-800 text-slate-400 border border-slate-700/60';
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-white font-sans tracking-tight">Tasks Repository</h2>
                    <p className="text-slate-400 text-sm">Assign workflows, configure timelines, and track progress stats</p>
                </div>
                <button 
                    onClick={openCreateModal}
                    className="bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white font-semibold text-sm px-4 py-2.5 rounded-lg shadow-lg transition active:scale-95 flex items-center gap-2 cursor-pointer"
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                    </svg>
                    Create Task
                </button>
            </div>

            {/* Filter Bar */}
            <div className="bg-slate-900/40 border border-slate-800/80 p-5 rounded-2xl grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                    <label className="block text-[10px] uppercase font-bold tracking-wider text-slate-400 mb-1.5">Task Status</label>
                    <select 
                        value={status}
                        onChange={(e) => setStatus(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 text-xs text-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:border-indigo-500"
                    >
                        <option value="">All Statuses</option>
                        <option value="pending">Pending</option>
                        <option value="in-progress">In Progress</option>
                        <option value="completed">Completed</option>
                        <option value="overdue">Overdue</option>
                    </select>
                </div>

                <div>
                    <label className="block text-[10px] uppercase font-bold tracking-wider text-slate-400 mb-1.5">Priority</label>
                    <select 
                        value={priority}
                        onChange={(e) => setPriority(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 text-xs text-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:border-indigo-500"
                    >
                        <option value="">All Priorities</option>
                        <option value="low">Low</option>
                        <option value="medium">Medium</option>
                        <option value="high">High</option>
                    </select>
                </div>

                <div>
                    <label className="block text-[10px] uppercase font-bold tracking-wider text-slate-400 mb-1.5">Assigned To</label>
                    <select 
                        value={assignedToFilter}
                        onChange={(e) => setAssignedToFilter(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 text-xs text-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:border-indigo-500"
                    >
                        <option value="">All Assignees</option>
                        {users.map(u => (
                            <option key={u.id} value={u.id}>{u.name}</option>
                        ))}
                    </select>
                </div>

                <div>
                    <label className="block text-[10px] uppercase font-bold tracking-wider text-slate-400 mb-1.5">Created By</label>
                    <select 
                        value={createdByFilter}
                        onChange={(e) => setCreatedByFilter(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 text-xs text-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:border-indigo-500"
                    >
                        <option value="">All Creators</option>
                        {users.filter(u => u.roles.includes('Admin') || u.roles.includes('Manager')).map(u => (
                            <option key={u.id} value={u.id}>{u.name}</option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Task Table */}
            <div className="bg-slate-900/40 border border-slate-800/80 rounded-2xl overflow-hidden shadow-xl">
                {loading ? (
                    <div className="flex items-center justify-center py-20">
                        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-indigo-500"></div>
                    </div>
                ) : tasks.length === 0 ? (
                    <div className="text-center py-20 text-slate-500">No tasks found.</div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-950 border-b border-slate-800/80 text-slate-400 text-xs uppercase tracking-wider font-semibold">
                                    <th className="px-6 py-4">Task Name</th>
                                    <th className="px-6 py-4">Assigned To</th>
                                    <th className="px-6 py-4">Assigned By</th>
                                    <th className="px-6 py-4">Priority</th>
                                    <th className="px-6 py-4">Status</th>
                                    <th className="px-6 py-4">Due Date</th>
                                    <th className="px-6 py-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-800/60 text-sm">
                                {tasks.map(task => {
                                    const isOverdue = task.status !== 'completed' && task.due_date && new Date(task.due_date) < new Date();
                                    return (
                                        <tr 
                                            key={task.id} 
                                            className="hover:bg-slate-950/40 transition cursor-pointer"
                                            onClick={() => fetchTaskDetails(task)}
                                        >
                                            <td className="px-6 py-4">
                                                <span className="font-bold text-white block">{task.title}</span>
                                                <span className="text-xs text-slate-500 line-clamp-1 mt-0.5 max-w-xs">{task.description}</span>
                                            </td>
                                            <td className="px-6 py-4">
                                                {task.assigned_to ? (
                                                    <span className="text-slate-300 font-medium">{task.assigned_to.name}</span>
                                                ) : (
                                                    <span className="text-slate-600 italic">Unassigned</span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 text-slate-400 text-xs">
                                                {task.created_by?.name || 'System'}
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`text-[9px] uppercase font-bold tracking-wider px-2 py-0.5 rounded ${getPriorityBadge(task.priority)}`}>
                                                    {task.priority}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                {isOverdue ? (
                                                    <span className="text-[9px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-rose-500/10 text-rose-400 border border-rose-500/20">
                                                        Overdue
                                                    </span>
                                                ) : (
                                                    <span className={`text-[9px] uppercase font-bold tracking-wider px-2 py-0.5 rounded capitalize ${getStatusBadge(task.status)}`}>
                                                        {task.status}
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 text-xs text-slate-400">
                                                {task.due_date ? new Date(task.due_date).toLocaleString() : 'No limit'}
                                            </td>
                                            <td className="px-6 py-4 text-right flex justify-end gap-2 items-center" onClick={e => e.stopPropagation()}>
                                                <button 
                                                    onClick={() => openEditModal(task)}
                                                    className="text-indigo-400 hover:text-indigo-300 font-semibold text-xs px-2.5 py-1.5 hover:bg-indigo-500/10 rounded-lg transition border border-transparent hover:border-indigo-500/20 cursor-pointer"
                                                >
                                                    Edit
                                                </button>
                                                {hasRole('Admin') && (
                                                    <button 
                                                        onClick={() => handleDelete(task.id)}
                                                        className="text-rose-400 hover:text-rose-300 font-semibold text-xs px-2.5 py-1.5 hover:bg-rose-500/10 rounded-lg transition border border-transparent hover:border-rose-500/20 cursor-pointer"
                                                    >
                                                        Delete
                                                    </button>
                                                )}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Task Details & Comments/Timeline Sidebar Modal */}
            {detailOpen && selectedTask && (
                <div className="fixed inset-0 z-50 flex items-center justify-end p-0 bg-slate-950/80 backdrop-blur-sm">
                    <div className="bg-slate-900 border-l border-slate-800 w-full max-w-2xl h-full flex flex-col shadow-2xl animate-in slide-in-from-right duration-200">
                        {/* Drawer Header */}
                        <div className="px-6 py-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
                            <span className={`text-[10px] uppercase font-bold tracking-wider px-2.5 py-1 rounded border ${getPriorityBadge(selectedTask.priority)}`}>
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
                                <h3 className="text-xl font-bold text-white leading-tight">{selectedTask.title}</h3>
                                <p className="text-slate-400 text-sm mt-2 leading-relaxed">{selectedTask.description || 'No description provided.'}</p>
                            </div>

                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 bg-slate-950/50 p-4 border border-slate-850 rounded-xl text-xs">
                                <div>
                                    <span className="text-slate-500 block uppercase tracking-wider font-semibold text-[9px] mb-0.5">Assigned To</span>
                                    <span className="text-slate-200 font-medium">{selectedTask.assigned_to?.name || 'Unassigned'}</span>
                                </div>
                                <div>
                                    <span className="text-slate-500 block uppercase tracking-wider font-semibold text-[9px] mb-0.5">Assigned By</span>
                                    <span className="text-slate-200 font-medium">{selectedTask.created_by?.name || 'System'}</span>
                                </div>
                                <div>
                                    <span className="text-slate-500 block uppercase tracking-wider font-semibold text-[9px] mb-0.5">Due Date</span>
                                    <span className="text-slate-200 font-medium">{selectedTask.due_date ? new Date(selectedTask.due_date).toLocaleString() : 'No limit'}</span>
                                </div>
                                <div>
                                    <span className="text-slate-500 block uppercase tracking-wider font-semibold text-[9px] mb-0.5">Current Status</span>
                                    <span className="text-indigo-400 font-bold capitalize">{selectedTask.status}</span>
                                </div>
                            </div>

                            {/* Section: Timeline History */}
                            <div className="space-y-3">
                                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Task Timeline Logs</h4>
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
                                        <div className="text-slate-500 italic">No timeline logs found.</div>
                                    )}
                                </div>
                            </div>

                            {/* Section: Comments Feed */}
                            <div className="space-y-4 pt-4 border-t border-slate-850">
                                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Discussion ({comments.length})</h4>
                                
                                {/* Comment Form */}
                                <form onSubmit={handleAddComment} className="flex gap-2">
                                    <input 
                                        type="text"
                                        placeholder="Post a progress note or comment..."
                                        value={newComment}
                                        onChange={(e) => setNewComment(e.target.value)}
                                        className="flex-1 bg-slate-950 border border-slate-800 text-xs text-white rounded-lg px-3 py-2.5 focus:outline-none focus:border-indigo-500"
                                    />
                                    <button 
                                        type="submit"
                                        className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs px-4 rounded-lg shadow-md transition cursor-pointer"
                                    >
                                        Post
                                    </button>
                                </form>

                                {/* Comments Listing */}
                                <div className="space-y-3">
                                    {comments.map(c => (
                                        <div key={c.id} className="bg-slate-950/60 border border-slate-850 p-3.5 rounded-xl text-xs space-y-1.5">
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

            {/* Task Creation & Edit Modal */}
            {modalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
                    <div className="bg-slate-900 border border-slate-800 w-full max-w-lg rounded-2xl overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-150">
                        <div className="px-6 py-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
                            <h3 className="font-bold text-white text-md">{editingTask ? 'Edit Task Settings' : 'Create Task Workflow'}</h3>
                            <button 
                                onClick={() => setModalOpen(false)}
                                className="text-slate-400 hover:text-white transition cursor-pointer"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        <form onSubmit={handleCreateOrUpdate}>
                            <div className="p-6 space-y-4 max-h-[65vh] overflow-y-auto">
                                <div>
                                    <label className="block text-[10px] uppercase font-bold tracking-wider text-slate-400 mb-1.5">Task Title</label>
                                    <input 
                                        type="text"
                                        required
                                        value={title}
                                        onChange={(e) => setTitle(e.target.value)}
                                        className="w-full bg-slate-950 border border-slate-800 text-sm text-white rounded-lg px-4 py-2 focus:outline-none focus:border-indigo-500"
                                        placeholder="e.g. Test release candidate"
                                    />
                                </div>

                                <div>
                                    <label className="block text-[10px] uppercase font-bold tracking-wider text-slate-400 mb-1.5">Description</label>
                                    <textarea 
                                        value={description}
                                        onChange={(e) => setDescription(e.target.value)}
                                        className="w-full bg-slate-950 border border-slate-800 text-sm text-white rounded-lg px-4 py-2 focus:outline-none focus:border-indigo-500 min-h-[80px]"
                                        placeholder="Explain targets and instructions..."
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-[10px] uppercase font-bold tracking-wider text-slate-400 mb-1.5">Priority</label>
                                        <select 
                                            value={taskPriority}
                                            onChange={(e) => setTaskPriority(e.target.value)}
                                            className="w-full bg-slate-950 border border-slate-800 text-sm text-white rounded-lg px-3 py-2 focus:outline-none focus:border-indigo-500"
                                        >
                                            <option value="low">Low</option>
                                            <option value="medium">Medium</option>
                                            <option value="high">High</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-[10px] uppercase font-bold tracking-wider text-slate-400 mb-1.5">Status</label>
                                        <select 
                                            value={taskStatus}
                                            onChange={(e) => setTaskStatus(e.target.value)}
                                            className="w-full bg-slate-950 border border-slate-800 text-sm text-white rounded-lg px-3 py-2 focus:outline-none focus:border-indigo-500"
                                        >
                                            <option value="pending">Pending</option>
                                            <option value="in-progress">In Progress</option>
                                            <option value="completed">Completed</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-[10px] uppercase font-bold tracking-wider text-slate-400 mb-1.5">Due Date</label>
                                        <input 
                                            type="datetime-local"
                                            value={dueDate}
                                            onChange={(e) => setDueDate(e.target.value)}
                                            className="w-full bg-slate-950 border border-slate-800 text-sm text-white rounded-lg px-3 py-2 focus:outline-none focus:border-indigo-500"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-[10px] uppercase font-bold tracking-wider text-slate-400 mb-1.5">Assign To</label>
                                        <select 
                                            value={assignedTo}
                                            onChange={(e) => setAssignedTo(e.target.value)}
                                            className="w-full bg-slate-950 border border-slate-800 text-sm text-white rounded-lg px-3 py-2 focus:outline-none focus:border-indigo-500"
                                        >
                                            <option value="">Unassigned</option>
                                            {users.map(u => (
                                                <option key={u.id} value={u.id}>{u.name} ({u.roles?.join(', ')})</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                            </div>

                            <div className="px-6 py-4 bg-slate-950/80 border-t border-slate-800 flex justify-end gap-3">
                                <button 
                                    type="button"
                                    onClick={() => setModalOpen(false)}
                                    className="border border-slate-800 hover:border-slate-700 text-slate-300 text-xs font-semibold py-2 px-4 rounded-lg transition cursor-pointer"
                                >
                                    Cancel
                                </button>
                                <button 
                                    type="submit"
                                    className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold py-2 px-4 rounded-lg shadow-md transition cursor-pointer"
                                >
                                    {editingTask ? 'Save Changes' : 'Create Task'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
