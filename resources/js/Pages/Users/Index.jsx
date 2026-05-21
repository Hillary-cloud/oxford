import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';
import { UserPlus, Edit, Trash2, ShieldCheck, MoreVertical, Power, Check, X, Eye } from 'lucide-react';
import { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import Pagination from '@/Components/Pagination';

export default function Index({ auth, users, roles, flash }) {
    const [openDropdown, setOpenDropdown] = useState(null);
    const [selectedUsers, setSelectedUsers] = useState([]);
    const [selectAll, setSelectAll] = useState(false);


    // Close dropdown on click outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (openDropdown && !event.target.closest('.dropdown-container')) {
                setOpenDropdown(null);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [openDropdown]);



    const handleSelectAll = () => {
        if (selectAll) {
            setSelectedUsers([]);
        } else {
            setSelectedUsers(users.data.map(user => user.id));
        }
        setSelectAll(!selectAll);
    };

    const handleSelectUser = (userId) => {
        if (selectedUsers.includes(userId)) {
            setSelectedUsers(selectedUsers.filter(id => id !== userId));
        } else {
            setSelectedUsers([...selectedUsers, userId]);
        }
    };

    const handleDelete = (userId, userName) => {
        Swal.fire({
            title: 'Are you sure?',
            text: `You are about to delete ${userName}. This action cannot be undone!`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#ef4444',
            cancelButtonColor: '#64748b',
            confirmButtonText: 'Yes, delete!',
            cancelButtonText: 'Cancel',
            background: '#0f172a',
            color: '#e2e8f0',
        }).then((result) => {
            if (result.isConfirmed) {
                router.delete(route('users.destroy', userId));
            }
        });
    };

    const handleToggleStatus = (userId) => {
        router.post(route('users.toggle-status', userId), {}, {
            preserveScroll: true,
        });
    };

    const handleRoleAssignment = (userId, roleName) => {
        router.post(route('users.assign-role', userId), {
            role: roleName
        }, {
            preserveScroll: true,
            onSuccess: () => setOpenDropdown(null),
        });
    };

    const handleBulkStatusUpdate = async (status) => {
        if (selectedUsers.length === 0) {
            toast.warning('Please select users first.', {
                position: "top-right",
                autoClose: 3000,
            });
            return;
        }

        Swal.fire({
            title: 'Update Status?',
            text: `Set ${selectedUsers.length} user(s) to ${status}?`,
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: status === 'active' ? '#10b981' : '#f59e0b',
            cancelButtonColor: '#64748b',
            confirmButtonText: 'Yes, update!',
            cancelButtonText: 'Cancel',
            background: '#0f172a',
            color: '#e2e8f0',
        }).then((result) => {
            if (result.isConfirmed) {
                router.post(route('users.bulk-update-status'), {
                    user_ids: selectedUsers,
                    status: status
                }, {
                    onSuccess: () => {
                        setSelectedUsers([]);
                        setSelectAll(false);
                    },
                });
            }
        });
    };

    const handleBulkDelete = async () => {
        if (selectedUsers.length === 0) {
            toast.warning('Please select users first.', {
                position: "top-right",
                autoClose: 3000,
            });
            return;
        }

        Swal.fire({
            title: 'Delete Users?',
            text: `You are about to delete ${selectedUsers.length} user(s). This action cannot be undone!`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#ef4444',
            cancelButtonColor: '#64748b',
            confirmButtonText: 'Yes, delete all!',
            cancelButtonText: 'Cancel',
            background: '#0f172a',
            color: '#e2e8f0',
        }).then((result) => {
            if (result.isConfirmed) {
                router.post(route('users.bulk-delete'), {
                    user_ids: selectedUsers
                }, {
                    onSuccess: () => {
                        setSelectedUsers([]);
                        setSelectAll(false);
                    },
                });
            }
        });
    };

    const toggleDropdown = (userId) => {
        setOpenDropdown(openDropdown === userId ? null : userId);
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex flex-col gap-1">
                        <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Staff Management</h2>
                        <p className="text-slate-600 dark:text-slate-400 text-sm">Manage staff accounts and assign roles.</p>
                    </div>
                    {(auth.user.roles.includes('Super Admin') || auth.user.permissions.includes('create user')) && (
                        <Link href={route('users.create')}>
                            <button className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl transition-all shadow-lg hover:shadow-indigo-500/50 w-full sm:w-auto justify-center">
                                <UserPlus size={18} />
                                Add New Staff
                            </button>
                        </Link>
                    )}
                </div>
            }
        >
            <Head title="Staff" />


            <div className="max-w-7xl">
                {/* Bulk Actions Toolbar */}
                {selectedUsers.length > 0 && (auth.user.roles.includes('Super Admin') || auth.user.permissions.includes('manage user')) && (
                    <div className="mb-4 p-4 bg-indigo-900/20 border border-indigo-500/30 rounded-xl flex flex-col sm:flex-row items-center justify-between gap-4">
                        <div className="text-slate-300">
                            <span className="font-semibold">{selectedUsers.length}</span> user(s) selected
                        </div>
                        <div className="flex flex-wrap items-center gap-3 justify-center sm:justify-end w-full sm:w-auto">
                            <button
                                onClick={() => handleBulkStatusUpdate('active')}
                                className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-500 text-white rounded-lg transition-all text-sm flex-1 sm:flex-none justify-center"
                            >
                                <Check size={16} />
                                Set Active
                            </button>
                            <button
                                onClick={() => handleBulkStatusUpdate('inactive')}
                                className="flex items-center gap-2 px-4 py-2 bg-yellow-600 hover:bg-yellow-500 text-white rounded-lg transition-all text-sm flex-1 sm:flex-none justify-center"
                            >
                                <X size={16} />
                                Set Inactive
                            </button>
                            <button
                                onClick={handleBulkDelete}
                                className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded-lg transition-all text-sm flex-1 sm:flex-none justify-center"
                            >
                                <Trash2 size={16} />
                                Delete Selected
                            </button>
                        </div>
                    </div>
                )}

                <div className="bg-white dark:bg-slate-900/50 backdrop-blur-sm border border-slate-300 dark:border-slate-800 rounded-2xl overflow-hidden shadow-xl">
                    <div className="overflow-x-auto -mx-6">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-slate-300 dark:border-slate-800/50 bg-slate-50 dark:bg-slate-900/30">
                                    <th className="px-6 py-4 text-left w-16">
                                        {(auth.user.roles.includes('Super Admin') || auth.user.permissions.includes('manage user')) && (
                                            <input
                                                type="checkbox"
                                                checked={selectAll}
                                                onChange={handleSelectAll}
                                                className="w-5 h-5 text-indigo-600 bg-white dark:bg-slate-900 border-slate-400 dark:border-slate-600 rounded focus:ring-indigo-500 focus:ring-2 cursor-pointer m-2"
                                            />
                                        )}
                                    </th>
                                    <th className="px-6 py-4 text-[10px] font-bold text-slate-700 dark:text-slate-500 uppercase tracking-widest">
                                        Staff
                                    </th>
                                    <th className="px-6 py-4 text-[10px] font-bold text-slate-700 dark:text-slate-500 uppercase tracking-widest">
                                        Staff ID
                                    </th>
                                    {/* <th className="px-6 py-4 text-[10px] font-bold text-slate-700 dark:text-slate-500 uppercase tracking-widest">
                                        Contact
                                    </th> */}
                                    <th className="px-6 py-4 text-[10px] font-bold text-slate-700 dark:text-slate-500 uppercase tracking-widest">
                                        Role
                                    </th>
                                    <th className="px-6 py-4 text-[10px] font-bold text-slate-700 dark:text-slate-500 uppercase tracking-widest">
                                        Status
                                    </th>
                                    {/* <th className="px-6 py-4 text-[10px] font-bold text-slate-700 dark:text-slate-500 uppercase tracking-widest">
                                        Employment
                                    </th> */}
                                    <th className="px-6 py-4 text-center text-[10px] font-bold text-slate-700 dark:text-slate-500 uppercase tracking-widest">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-200 dark:divide-slate-800/30">
                                {users.data.length === 0 ? (
                                    <tr>
                                        <td colSpan="8" className="py-24 text-center">
                                            <div className="w-16 h-16 bg-slate-100 dark:bg-slate-900 rounded-3xl border border-slate-300 dark:border-slate-800 flex items-center justify-center text-slate-400 dark:text-slate-600 mx-auto mb-4">
                                                <UserPlus size={32} />
                                            </div>
                                            <h3 className="text-slate-800 dark:text-slate-300 font-bold mb-1 text-lg">No Staff Found</h3>
                                            <p className="text-slate-600 dark:text-slate-500 text-sm italic max-w-xs mx-auto">
                                                The staff directory is currently empty.
                                            </p>
                                        </td>
                                    </tr>
                                ) : (
                                    users.data.map((user) => (
                                        <tr key={user.id} className="group hover:bg-indigo-50/50 dark:hover:bg-slate-800/20 transition-colors">
                                            <td className="px-6 py-4 w-16">
                                                {(auth.user.roles.includes('Super Admin') || auth.user.permissions.includes('manage user')) && (
                                                    <input
                                                        type="checkbox"
                                                        checked={selectedUsers.includes(user.id)}
                                                        onChange={() => handleSelectUser(user.id)}
                                                        className="w-5 h-5 text-indigo-600 bg-white dark:bg-slate-900 border-slate-400 dark:border-slate-600 rounded focus:ring-indigo-500 focus:ring-2 cursor-pointer m-2"
                                                    />
                                                )}
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-semibold overflow-hidden border border-slate-300 dark:border-slate-800">
                                                        {user.profile_image ? (
                                                            <img src={`/storage/${user.profile_image}`} alt={user.name} className="w-full h-full object-cover" />
                                                        ) : (
                                                            user.name.charAt(0).toUpperCase()
                                                        )}
                                                    </div>
                                                    <div>
                                                        <div className="text-sm font-bold text-slate-800 dark:text-slate-200">{user.name}</div>
                                                        <div className="text-xs text-slate-600 dark:text-slate-500">{user.email}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <code className="text-xs font-mono text-slate-700 dark:text-slate-400 tracking-tighter">{user.staff_id}</code>
                                            </td>
                                            {/* <td className="px-6 py-4">
                                                <div className="text-sm text-slate-700 dark:text-slate-300">{user.phone}</div>
                                            </td> */}
                                            <td className="px-6 py-4">
                                                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-indigo-500/20 text-indigo-600 border-indigo-500/30 dark:bg-indigo-500/10 dark:text-indigo-400 dark:border-indigo-500/20 text-sm font-medium border">
                                                    <ShieldCheck size={14} />
                                                    {user.roles[0]?.name || 'No Role'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <button
                                                    onClick={() => (auth.user.roles.includes('Super Admin') || auth.user.permissions.includes('manage user')) && handleToggleStatus(user.id, user.status)}
                                                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-[10px] font-black uppercase tracking-widest transition-all ${user.status === 'active'
                                                        ? 'bg-emerald-500/20 text-emerald-600 border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20 hover:bg-emerald-500/30 dark:hover:bg-emerald-500/20'
                                                        : 'bg-amber-500/20 text-amber-600 border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20 hover:bg-amber-500/30 dark:hover:bg-amber-500/20'
                                                        } ${(auth.user.roles.includes('Super Admin') || auth.user.permissions.includes('manage user')) ? '' : 'cursor-default opacity-75'}`}
                                                    title={auth.user.permissions.includes('manage user') ? "Click to toggle status" : "Status"}
                                                    disabled={!(auth.user.roles.includes('Super Admin') || auth.user.permissions.includes('manage user'))}
                                                >
                                                    <Power size={14} />
                                                    {user.status === 'active' ? 'Active' : 'Inactive'}
                                                </button>
                                            </td>
                                            {/* <td className="px-6 py-4">
                                                <div className="text-sm text-slate-700 dark:text-slate-300 capitalize font-medium">{user.employment_type}</div>
                                                <div className="text-xs text-slate-600 dark:text-slate-500">Since {new Date(user.employment_date).toLocaleDateString()}</div>
                                            </td> */}
                                            <td className="px-6 py-4">
                                                <div className="flex items-center justify-center gap-2">
                                                    <Link
                                                        href={route('users.show', user.id)}
                                                        className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-indigo-500 hover:border-indigo-500 dark:hover:bg-slate-700 hover:text-white dark:hover:text-white transition-all shadow-sm"
                                                        title="View Details"
                                                    >
                                                        <Eye size={16} />
                                                    </Link>

                                                    {(auth.user.roles.includes('Super Admin') || auth.user.permissions.includes('manage user')) && (
                                                        <>
                                                            <Link
                                                                href={route('users.edit', user.id)}
                                                                className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-blue-500 hover:border-blue-500 dark:hover:bg-slate-700 hover:text-white dark:hover:text-white transition-all shadow-sm"
                                                                title="Edit Staff"
                                                            >
                                                                <Edit size={16} />
                                                            </Link>

                                                            <button
                                                                onClick={() => handleDelete(user.id, user.name)}
                                                                className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-rose-500 dark:text-rose-400 hover:bg-rose-500 hover:border-rose-500 hover:text-white transition-all shadow-sm"
                                                                title="Delete Staff"
                                                            >
                                                                <Trash2 size={16} />
                                                            </button>
                                                        </>
                                                    )}

                                                    {/* Role Assignment Dropdown */}
                                                    {(auth.user.roles.includes('Super Admin') || auth.user.permissions.includes('manage user')) && (
                                                        <div className="relative dropdown-container">
                                                            <button
                                                                onClick={() => toggleDropdown(user.id)}
                                                                className={`p-2 rounded-lg transition-all ${openDropdown === user.id ? 'text-indigo-600 dark:text-indigo-400 bg-slate-100 dark:bg-slate-800' : 'text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-100 dark:hover:bg-slate-800'}`}
                                                                title="Assign Role"
                                                            >
                                                                <MoreVertical size={18} />
                                                            </button>

                                                            {openDropdown === user.id && (
                                                                <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-2xl z-20 overflow-hidden animate-in fade-in zoom-in duration-200 origin-top-right">
                                                                    <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
                                                                        <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                                                                            Assign Role
                                                                        </div>
                                                                    </div>
                                                                    <div className="p-2 max-h-64 overflow-y-auto">
                                                                        {roles.map((role, index) => (
                                                                            <label
                                                                                key={`${role.id}-${index}`}
                                                                                className="flex items-center gap-3 px-3 py-2.5 hover:bg-slate-50 dark:hover:bg-slate-700/50 rounded-lg cursor-pointer transition-colors group"
                                                                            >
                                                                                <input
                                                                                    type="radio"
                                                                                    name={`role-${user.id}`}
                                                                                    value={role.name}
                                                                                    checked={user.roles[0]?.name === role.name}
                                                                                    onChange={() => handleRoleAssignment(user.id, role.name)}
                                                                                    className="w-4 h-4 text-indigo-600 bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-600 focus:ring-indigo-500 focus:ring-2"
                                                                                />
                                                                                <span className="text-sm text-slate-700 dark:text-slate-300 group-hover:text-indigo-600 dark:group-hover:text-white transition-colors">
                                                                                    {role.name}
                                                                                </span>
                                                                            </label>
                                                                        ))}
                                                                    </div>
                                                                </div>
                                                            )}
                                                        </div>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
                <Pagination links={users.links} />
            </div>
        </AuthenticatedLayout>
    );
}
