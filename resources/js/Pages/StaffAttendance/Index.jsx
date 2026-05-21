import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Card from '@/Components/Card';
import Pagination from '@/Components/Pagination';
import {
    Clock,
    Calendar,
    Search,
    CheckCircle,
    AlertCircle,
    XCircle,
    Filter,
    X,
    User,
    ChevronDown,
    Download
} from 'lucide-react';

export default function Index({ auth, attendances, filters }) {
    const [search, setSearch] = useState(filters.search || '');
    const [date, setDate] = useState(filters.date || '');
    const [month, setMonth] = useState(filters.month || '');

    React.useEffect(() => {
        const timer = setTimeout(() => {
            if (search !== (filters.search || '')) {
                router.get(route('staff-attendance.index'), { ...filters, search, page: 1 }, {
                    preserveState: true,
                    preserveScroll: true,
                });
            }
        }, 500);
        return () => clearTimeout(timer);
    }, [search]);

    const handleFilterChange = (key, value) => {
        const newFilters = { ...filters, [key]: value, page: 1 };
        router.get(route('staff-attendance.index'), newFilters, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const clearFilters = () => {
        setSearch('');
        setDate('');
        setMonth('');
        router.get(route('staff-attendance.index'), {}, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const getStatusStyles = (status) => {
        switch (status) {
            case 'present': return 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20';
            case 'late': return 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20';
            case 'absent': return 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20';
            default: return 'bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/20';
        }
    };

    const formatTime = (time) => {
        if (!time) return '---';
        return new Date(`2000-01-01T${time}`).toLocaleTimeString('en-US', {
            hour: 'numeric',
            minute: '2-digit',
            hour12: true
        });
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="font-semibold text-xl text-slate-800 dark:text-slate-200 leading-tight">Staff Attendance Logs</h2>}
        >
            <Head title="Staff Attendance Logs" />

            <div className="py-12 bg-slate-50 dark:bg-slate-950 min-h-[calc(100vh-64px)]">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8 space-y-6">

                    {/* Filters Header */}
                    <div className="bg-white dark:bg-slate-900 rounded-[2rem] p-6 shadow-xl shadow-slate-200/50 dark:shadow-none border border-slate-200 dark:border-slate-800">
                        <div className="flex flex-wrap items-center gap-4">
                            <div className="flex-1 min-w-[300px] relative">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                <input
                                    type="text"
                                    placeholder="Search staff name or ID..."
                                    className="w-full pl-11 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl text-sm focus:ring-2 focus:ring-indigo-500 dark:text-slate-200"
                                    value={search}
                                    onChange={(e) => {
                                        setSearch(e.target.value);
                                        handleSearch(e.target.value);
                                    }}
                                />
                            </div>

                            <div className="flex items-center gap-3">
                                <div className="relative">
                                    <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                    <input
                                        type="date"
                                        className="pl-11 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl text-sm focus:ring-2 focus:ring-indigo-500 dark:text-slate-200"
                                        value={date}
                                        onChange={(e) => {
                                            setDate(e.target.value);
                                            handleFilterChange('date', e.target.value);
                                        }}
                                    />
                                </div>

                                <div className="relative">
                                    <Filter className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                    <input
                                        type="month"
                                        className="pl-11 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl text-sm focus:ring-2 focus:ring-indigo-500 dark:text-slate-200"
                                        value={month}
                                        onChange={(e) => {
                                            setMonth(e.target.value);
                                            handleFilterChange('month', e.target.value);
                                        }}
                                    />
                                </div>

                                {(search || date || month) && (
                                    <button
                                        onClick={clearFilters}
                                        className="p-3 bg-rose-50 dark:bg-rose-500/10 text-rose-500 rounded-2xl hover:bg-rose-100 transition-colors"
                                        title="Clear all filters"
                                    >
                                        <X className="w-5 h-5" />
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Table Card */}
                    <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-xl shadow-slate-200/50 dark:shadow-none border border-slate-200 dark:border-slate-800 overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-slate-50/50 dark:bg-slate-800/50">
                                        <th className="px-8 py-6 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em]">Date</th>
                                        <th className="px-8 py-6 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em]">Staff Member</th>
                                        <th className="px-8 py-6 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em]">Clock In</th>
                                        <th className="px-8 py-6 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em]">Clock Out</th>
                                        <th className="px-8 py-6 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em]">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                    {attendances.data.length > 0 ? (
                                        attendances.data.map((record) => (
                                            <tr key={record.id} className="group hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                                                <td className="px-8 py-6">
                                                    <div className="flex flex-col">
                                                        <span className="text-sm font-black text-slate-700 dark:text-slate-200">
                                                            {new Date(record.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                                                        </span>
                                                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">
                                                            {new Date(record.date).toLocaleDateString('en-GB', { weekday: 'long' })}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="px-8 py-6">
                                                    <div className="flex items-center gap-4">
                                                        <div className="w-10 h-10 rounded-2xl bg-indigo-50 dark:bg-indigo-500/10 flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-black text-sm shadow-sm">
                                                            {record.user.name.charAt(0)}
                                                        </div>
                                                        <div>
                                                            <p className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight">{record.user.name}</p>
                                                            <div className="flex items-center gap-1.5 mt-0.5">
                                                                <span className="text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 px-2 py-0.5 rounded-md">
                                                                    ID: {record.user.staff_id || '---'}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-8 py-6">
                                                    <div className="flex items-center gap-2.5">
                                                        <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 flex items-center justify-center">
                                                            <Clock className="w-4 h-4 text-emerald-500" />
                                                        </div>
                                                        <span className="text-sm font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-tighter">
                                                            {formatTime(record.clock_in)}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="px-8 py-6">
                                                    <div className="flex items-center gap-2.5">
                                                        <div className="w-8 h-8 rounded-xl bg-rose-50 dark:bg-rose-500/10 flex items-center justify-center">
                                                            <Clock className="w-4 h-4 text-rose-500" />
                                                        </div>
                                                        <span className="text-sm font-black text-rose-600 dark:text-rose-400 uppercase tracking-tighter">
                                                            {formatTime(record.clock_out)}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="px-8 py-6">
                                                    <div className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full border text-[10px] font-black uppercase tracking-[0.1em] ${getStatusStyles(record.status)}`}>
                                                        {record.status === 'present' && <CheckCircle className="w-3 h-3" />}
                                                        {record.status === 'late' && <AlertCircle className="w-3 h-3" />}
                                                        {record.status === 'absent' && <XCircle className="w-3 h-3" />}
                                                        {record.status}
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="5" className="py-32 text-center">
                                                <div className="flex flex-col items-center opacity-40">
                                                    <Search className="w-12 h-12 text-slate-400 mb-4" />
                                                    <p className="text-xs font-black text-slate-500 uppercase tracking-[0.2em]">No attendance records found</p>
                                                    <p className="text-[10px] text-slate-400 font-bold mt-1">Try adjusting your filters or search terms</p>
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {attendances.data.length > 0 && (
                            <div className="p-8 bg-slate-50/50 dark:bg-slate-800/30 border-t border-slate-100 dark:border-slate-800">
                                <Pagination links={attendances.links} />
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <style dangerouslySetInnerHTML={{
                __html: `
                input[type="date"]::-webkit-calendar-picker-indicator,
                input[type="month"]::-webkit-calendar-picker-indicator {
                    filter: invert(0.5);
                    cursor: pointer;
                }
                .dark input[type="date"]::-webkit-calendar-picker-indicator,
                .dark input[type="month"]::-webkit-calendar-picker-indicator {
                    filter: invert(0.8);
                }
            `}} />
        </AuthenticatedLayout>
    );
}
