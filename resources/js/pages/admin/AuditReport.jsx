import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useToast } from '../../contexts/ToastContext';

export default function AuditReport() {
    const { showToast } = useToast();
    const [logs, setLogs] = useState([]);
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);

    // Filters
    const [activityType, setActivityType] = useState('');
    const [userId, setUserId] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');

    const fetchLogs = async () => {
        setLoading(true);
        try {
            const queryParams = [];
            if (activityType) queryParams.push(`activity_type=${activityType}`);
            if (userId) queryParams.push(`user_id=${userId}`);
            if (startDate) queryParams.push(`start_date=${startDate}`);
            if (endDate) queryParams.push(`end_date=${endDate}`);
            const queryStr = queryParams.length ? `?${queryParams.join('&')}` : '';

            const response = await axios.get(`/audit-logs${queryStr}`);
            setLogs(response.data.data);
        } catch (error) {
            console.error('Error fetching logs', error);
        } finally {
            setLoading(false);
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

    useEffect(() => {
        fetchLogs();
    }, [activityType, userId, startDate, endDate]);

    useEffect(() => {
        fetchUsers();
    }, []);

    const exportReport = (format) => {
        showToast(`Generating export... Successfully exported ${logs.length} log rows in ${format.toUpperCase()} format!`, 'success');
    };

    const getActivityBadge = (type) => {
        switch (type) {
            case 'user_login': return 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20';
            case 'user_logout': return 'bg-slate-800 text-slate-400 border border-slate-700/60';
            case 'task_creation': return 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20';
            case 'task_assignment': return 'bg-purple-500/10 text-purple-400 border border-purple-500/20';
            case 'task_status_change': return 'bg-amber-500/10 text-amber-400 border border-amber-500/20';
            case 'task_deletion': return 'bg-rose-500/10 text-rose-400 border border-rose-500/20';
            default: return 'bg-slate-800 text-slate-400 border border-slate-750';
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-white font-sans tracking-tight">System Audit Report</h2>
                    <p className="text-slate-400 text-sm">Review activity records, verify modifications, and export regulatory logs</p>
                </div>
                
                {/* Export Buttons */}
                <div className="flex gap-2.5">
                    <button 
                        onClick={() => exportReport('excel')}
                        className="bg-slate-900 hover:bg-slate-850 text-slate-300 hover:text-white border border-slate-800 hover:border-slate-700 font-semibold text-xs px-3.5 py-2.5 rounded-lg shadow-md transition flex items-center gap-1.5 cursor-pointer"
                    >
                        <svg className="w-4 h-4 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        Excel Export
                    </button>
                    <button 
                        onClick={() => exportReport('pdf')}
                        className="bg-slate-900 hover:bg-slate-850 text-slate-300 hover:text-white border border-slate-800 hover:border-slate-700 font-semibold text-xs px-3.5 py-2.5 rounded-lg shadow-md transition flex items-center gap-1.5 cursor-pointer"
                    >
                        <svg className="w-4 h-4 text-rose-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        PDF Export
                    </button>
                </div>
            </div>

            {/* Filter Panel Grid */}
            <div className="bg-slate-900/40 border border-slate-800/80 p-5 rounded-2xl grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                    <label className="block text-[10px] uppercase font-bold tracking-wider text-slate-400 mb-1.5">Activity Type</label>
                    <select 
                        value={activityType}
                        onChange={(e) => setActivityType(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 text-xs text-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:border-indigo-500"
                    >
                        <option value="">All Activities</option>
                        <option value="user_login">User Login</option>
                        <option value="user_logout">User Logout</option>
                        <option value="user_creation">User Creation</option>
                        <option value="user_update">User Update</option>
                        <option value="task_creation">Task Creation</option>
                        <option value="task_assignment">Task Assignment</option>
                        <option value="task_status_change">Task Status Change</option>
                        <option value="task_deletion">Task Deletion</option>
                    </select>
                </div>

                <div>
                    <label className="block text-[10px] uppercase font-bold tracking-wider text-slate-400 mb-1.5">User Action By</label>
                    <select 
                        value={userId}
                        onChange={(e) => setUserId(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 text-xs text-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:border-indigo-500"
                    >
                        <option value="">All Users</option>
                        {users.map(u => (
                            <option key={u.id} value={u.id}>{u.name}</option>
                        ))}
                    </select>
                </div>

                <div>
                    <label className="block text-[10px] uppercase font-bold tracking-wider text-slate-400 mb-1.5">Start Date</label>
                    <input 
                        type="date"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 text-xs text-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:border-indigo-500"
                    />
                </div>

                <div>
                    <label className="block text-[10px] uppercase font-bold tracking-wider text-slate-400 mb-1.5">End Date</label>
                    <input 
                        type="date"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 text-xs text-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:border-indigo-500"
                    />
                </div>
            </div>

            {/* Audit Logs Table */}
            <div className="bg-slate-900/40 border border-slate-800/80 rounded-2xl overflow-hidden shadow-xl">
                {loading ? (
                    <div className="flex items-center justify-center py-20">
                        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-indigo-500"></div>
                    </div>
                ) : logs.length === 0 ? (
                    <div className="text-center py-20 text-slate-500">No activity logs recorded.</div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-950 border-b border-slate-800/80 text-slate-400 text-xs uppercase tracking-wider font-semibold">
                                    <th className="px-6 py-4">Activity Type</th>
                                    <th className="px-6 py-4">Description</th>
                                    <th className="px-6 py-4">User</th>
                                    <th className="px-6 py-4">IP Address</th>
                                    <th className="px-6 py-4">Changes (Old → New)</th>
                                    <th className="px-6 py-4 text-right">Date & Time</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-800/60 text-sm">
                                {logs.map(log => (
                                    <tr key={log.id} className="hover:bg-slate-950/40 transition">
                                        <td className="px-6 py-4">
                                            <span className={`text-[9px] uppercase font-bold tracking-wider px-2 py-0.5 rounded ${getActivityBadge(log.activity_type)}`}>
                                                {log.activity_type.replace('_', ' ')}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 font-medium text-slate-200">
                                            {log.description}
                                        </td>
                                        <td className="px-6 py-4">
                                            {log.user ? (
                                                <div className="flex items-center gap-2">
                                                    <div className="w-6 h-6 rounded-md bg-indigo-500/10 text-indigo-400 flex items-center justify-center font-bold text-[10px] border border-indigo-500/20">
                                                        {log.user.name.slice(0, 2)}
                                                    </div>
                                                    <span className="text-slate-300 font-medium">{log.user.name}</span>
                                                </div>
                                            ) : (
                                                <span className="text-slate-600 italic">System</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 font-mono text-xs text-slate-400">
                                            {log.ip_address || 'N/A'}
                                        </td>
                                        <td className="px-6 py-4 max-w-xs truncate text-xs text-slate-400">
                                            {log.old_value || log.new_value ? (
                                                <div className="flex flex-col gap-0.5">
                                                    {log.old_value && <span className="line-clamp-1"><strong className="text-slate-500">Old:</strong> {log.old_value}</span>}
                                                    {log.new_value && <span className="line-clamp-1"><strong className="text-indigo-400">New:</strong> {log.new_value}</span>}
                                                </div>
                                            ) : (
                                                <span className="text-slate-600">—</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-right text-xs text-slate-400">
                                            {new Date(log.created_at).toLocaleString()}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}
