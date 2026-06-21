import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useToast } from '../../contexts/ToastContext';

export default function UserManagement() {
    const { showToast } = useToast();
    const [users, setUsers] = useState([]);
    const [managers, setManagers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [modalOpen, setModalOpen] = useState(false);
    const [editingUser, setEditingUser] = useState(null);

    // Filters
    const [search, setSearch] = useState('');
    const [roleFilter, setRoleFilter] = useState('');

    // Form inputs
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [status, setStatus] = useState('active');
    const [managerId, setManagerId] = useState('');
    const [role, setRole] = useState('Employee');

    const fetchUsers = async () => {
        try {
            const queryParams = [];
            if (search) queryParams.push(`search=${search}`);
            if (roleFilter) queryParams.push(`role=${roleFilter}`);
            const queryStr = queryParams.length ? `?${queryParams.join('&')}` : '';

            const response = await axios.get(`/users${queryStr}`);
            setUsers(response.data.data);
            
            // Extract managers from users list for the dropdown selection
            const managersList = response.data.data.filter(u => u.roles.includes('Manager'));
            setManagers(managersList);
        } catch (error) {
            console.error('Error fetching users', error);
        }
    };

    const loadData = async () => {
        setLoading(true);
        await fetchUsers();
        setLoading(false);
    };

    useEffect(() => {
        loadData();
    }, [search, roleFilter]);

    const handleCreateOrUpdate = async (e) => {
        e.preventDefault();

        const data = {
            name,
            email,
            status,
            manager_id: managerId || null,
            role,
        };

        if (password) {
            data.password = password;
        }

        try {
            if (editingUser) {
                await axios.put(`/users/${editingUser.id}`, data);
                showToast('Staff member updated successfully', 'success');
            } else {
                if (!password) {
                    showToast('Password is required for new users.', 'warning');
                    return;
                }
                await axios.post('/users', data);
                showToast('New staff member added successfully', 'success');
            }
            setModalOpen(false);
            resetForm();
            fetchUsers();
        } catch (error) {
            showToast(error.response?.data?.message || 'Error processing request', 'error');
        }
    };

    const toggleUserStatus = async (user) => {
        try {
            const response = await axios.put(`/users/${user.id}/toggle-status`);
            fetchUsers();
            showToast(`User status updated to '${response.data.status}'`, 'success');
        } catch (error) {
            showToast('Error toggling status', 'error');
        }
    };

    const resetForm = () => {
        setEditingUser(null);
        setName('');
        setEmail('');
        setPassword('');
        setShowPassword(false);
        setStatus('active');
        setManagerId('');
        setRole('Employee');
    };

    const openCreateModal = () => {
        resetForm();
        setModalOpen(true);
    };

    const openEditModal = (u) => {
        setEditingUser(u);
        setName(u.name);
        setEmail(u.email);
        setPassword(''); // clear password field
        setStatus(u.status);
        setManagerId(u.manager_id || '');
        setRole(u.roles[0] || 'Employee');
        setModalOpen(true);
    };

    const getRoleBadge = (roles) => {
        const primaryRole = roles[0] || 'Employee';
        switch (primaryRole) {
            case 'Admin': return 'bg-rose-500/10 text-rose-400 border border-rose-500/20';
            case 'Manager': return 'bg-amber-500/10 text-amber-400 border border-amber-500/20';
            default: return 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20';
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-white font-sans tracking-tight">Organization Directory</h2>
                    <p className="text-slate-400 text-sm">Add organization staff, toggle status, and define manager linkages</p>
                </div>
                <button 
                    onClick={openCreateModal}
                    className="bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white font-semibold text-sm px-4 py-2.5 rounded-lg shadow-lg transition active:scale-95 flex items-center gap-2 cursor-pointer"
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                    </svg>
                    Add Staff Member
                </button>
            </div>

            {/* Filter Panel */}
            <div className="bg-slate-900/40 border border-slate-800/80 p-4 rounded-xl flex flex-wrap gap-4 items-center justify-between">
                <div className="flex items-center gap-3 w-full sm:w-auto">
                    {/* Search Field */}
                    <input 
                        type="text"
                        placeholder="Search name or email..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="bg-slate-950 border border-slate-800 text-xs text-white rounded-lg px-3 py-1.5 focus:outline-none focus:border-indigo-500 w-full sm:w-60"
                    />

                    {/* Role Filter */}
                    <select 
                        value={roleFilter}
                        onChange={(e) => setRoleFilter(e.target.value)}
                        className="bg-slate-950 border border-slate-800 text-xs text-slate-300 rounded-lg px-3 py-1.5 focus:outline-none focus:border-indigo-500"
                    >
                        <option value="">All Roles</option>
                        <option value="Admin">Admin</option>
                        <option value="Manager">Manager</option>
                        <option value="Employee">Employee</option>
                    </select>
                </div>
                
                <span className="text-xs text-slate-500 font-semibold">{users.length} Users Listed</span>
            </div>

            {/* User Directory Table */}
            <div className="bg-slate-900/40 border border-slate-800/80 rounded-2xl overflow-hidden shadow-xl">
                {loading ? (
                    <div className="flex items-center justify-center py-20">
                        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-indigo-500"></div>
                    </div>
                ) : users.length === 0 ? (
                    <div className="text-center py-20 text-slate-500">No users found.</div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-950 border-b border-slate-800/80 text-slate-400 text-xs uppercase tracking-wider font-semibold">
                                    <th className="px-6 py-4">Employee ID</th>
                                    <th className="px-6 py-4">Name & Email</th>
                                    <th className="px-6 py-4">Role</th>
                                    <th className="px-6 py-4">Manager Link</th>
                                    <th className="px-6 py-4">Assigned Tasks</th>
                                    <th className="px-6 py-4">Completed Tasks</th>
                                    <th className="px-6 py-4">Status</th>
                                    <th className="px-6 py-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-800/60 text-sm">
                                {users.map(u => (
                                    <tr key={u.id} className="hover:bg-slate-950/40 transition">
                                        <td className="px-6 py-4 font-mono text-xs text-slate-400 font-bold">
                                            #{String(u.id).padStart(4, '0')}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="font-bold text-white block">{u.name}</span>
                                            <span className="text-xs text-slate-500 block mt-0.5">{u.email}</span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`text-[9px] uppercase font-bold tracking-wider px-2.5 py-0.5 rounded ${getRoleBadge(u.roles)}`}>
                                                {u.roles[0] || 'Employee'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-xs font-medium">
                                            {u.manager ? (
                                                <span className="text-indigo-400">↑ {u.manager.name}</span>
                                            ) : (
                                                <span className="text-slate-600">—</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 font-bold text-slate-300">
                                            {u.assigned_tasks_count}
                                        </td>
                                        <td className="px-6 py-4 font-bold text-emerald-400">
                                            {u.completed_tasks_count}
                                        </td>
                                        <td className="px-6 py-4">
                                            <button 
                                                onClick={() => toggleUserStatus(u)}
                                                className={`text-[9px] uppercase font-bold tracking-wider px-2 py-0.5 rounded border transition-all cursor-pointer ${
                                                    u.status === 'active' 
                                                        ? 'bg-emerald-500/10 hover:bg-rose-500/10 text-emerald-400 hover:text-rose-400 border-emerald-500/20 hover:border-rose-500/20' 
                                                        : 'bg-rose-500/10 hover:bg-emerald-500/10 text-rose-400 hover:text-emerald-400 border-rose-500/20 hover:border-emerald-500/20'
                                                }`}
                                                title={`Click to ${u.status === 'active' ? 'Deactivate' : 'Activate'}`}
                                            >
                                                {u.status}
                                            </button>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <button 
                                                onClick={() => openEditModal(u)}
                                                className="text-indigo-400 hover:text-indigo-300 font-semibold text-xs px-2.5 py-1.5 hover:bg-indigo-500/10 rounded-lg transition border border-transparent hover:border-indigo-500/20 cursor-pointer"
                                            >
                                                Edit
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Create & Edit Modal */}
            {modalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
                    <div className="bg-slate-900 border border-slate-800 w-full max-w-md rounded-2xl overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-150">
                        <div className="px-6 py-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
                            <h3 className="font-bold text-white text-md">{editingUser ? 'Update Staff Member' : 'Add New Staff Member'}</h3>
                            <button 
                                onClick={() => setModalOpen(false)}
                                className="text-slate-400 hover:text-white transition cursor-pointer"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        <form onSubmit={handleCreateOrUpdate} className="p-6 space-y-4">
                            <div>
                                <label className="block text-[10px] uppercase font-bold tracking-wider text-slate-400 mb-1.5">Full Name</label>
                                <input 
                                    type="text"
                                    required
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    className="w-full bg-slate-950 border border-slate-800 text-sm text-white rounded-lg px-4 py-2 focus:outline-none focus:border-indigo-500"
                                    placeholder="e.g. John Doe"
                                />
                            </div>

                            <div>
                                <label className="block text-[10px] uppercase font-bold tracking-wider text-slate-400 mb-1.5">Email Address</label>
                                <input 
                                    type="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full bg-slate-950 border border-slate-800 text-sm text-white rounded-lg px-4 py-2 focus:outline-none focus:border-indigo-500"
                                    placeholder="e.g. name@organization.com"
                                />
                            </div>

                             <div>
                                <label className="block text-[10px] uppercase font-bold tracking-wider text-slate-400 mb-1.5">
                                    {editingUser ? 'Password (leave blank to keep unchanged)' : 'Password'}
                                </label>
                                <div className="relative">
                                    <input 
                                        type={showPassword ? "text" : "password"}
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="w-full bg-slate-950 border border-slate-800 text-sm text-white rounded-lg pl-4 pr-10 py-2 focus:outline-none focus:border-indigo-500"
                                        placeholder="••••••••"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-white transition cursor-pointer"
                                    >
                                        {showPassword ? (
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                                            </svg>
                                        ) : (
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                            </svg>
                                        )}
                                    </button>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-[10px] uppercase font-bold tracking-wider text-slate-400 mb-1.5">System Role</label>
                                    <select 
                                        value={role}
                                        onChange={(e) => setRole(e.target.value)}
                                        className="w-full bg-slate-950 border border-slate-800 text-sm text-white rounded-lg px-3 py-2 focus:outline-none focus:border-indigo-500"
                                    >
                                        <option value="Admin">Admin</option>
                                        <option value="Manager">Manager</option>
                                        <option value="Employee">Employee</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-[10px] uppercase font-bold tracking-wider text-slate-400 mb-1.5">Status</label>
                                    <select 
                                        value={status}
                                        onChange={(e) => setStatus(e.target.value)}
                                        className="w-full bg-slate-950 border border-slate-800 text-sm text-white rounded-lg px-3 py-2 focus:outline-none focus:border-indigo-500"
                                    >
                                        <option value="active">Active</option>
                                        <option value="inactive">Inactive</option>
                                    </select>
                                </div>
                            </div>

                            {role === 'Employee' && (
                                <div>
                                    <label className="block text-[10px] uppercase font-bold tracking-wider text-slate-400 mb-1.5">Assigned Manager</label>
                                    <select 
                                        value={managerId}
                                        onChange={(e) => setManagerId(e.target.value)}
                                        className="w-full bg-slate-950 border border-slate-800 text-sm text-white rounded-lg px-3 py-2 focus:outline-none focus:border-indigo-500"
                                    >
                                        <option value="">No Manager Link</option>
                                        {managers.map(m => (
                                            <option key={m.id} value={m.id}>{m.name}</option>
                                        ))}
                                    </select>
                                </div>
                            )}

                            <div className="pt-4 border-t border-slate-800 flex justify-end gap-3">
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
                                    {editingUser ? 'Save Changes' : 'Create User'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
