import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router, Link } from '@inertiajs/react';
import Card from '@/Components/Card';
import {
    History as HistoryIcon,
    Search,
    Filter,
    Calendar,
    Users,
    ChevronLeft,
    ChevronRight,
    MapPin,
    Clock,
    CheckCircle2,
    XCircle,
    ArrowLeft
} from 'lucide-react';
import { useState } from 'react';
import Pagination from '@/Components/Pagination';

export default function History({ auth, history, sections, filters }) {
    const [params, setParams] = useState({
        class_section_id: filters.class_section_id || '',
        date: filters.date || '',
        student_id: filters.student_id || '',
    });

    const handleFilter = (e) => {
        e.preventDefault();
        router.get(route('attendance.history'), params, {
            preserveState: true,
            replace: true,
        });
    };

    const statusStyles = {
        present: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
        absent: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20',
        late: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
    };

    const statusIcons = {
        present: <CheckCircle2 size={12} />,
        absent: <XCircle size={12} />,
        late: <Clock size={12} />,
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center gap-4">
                    <Link
                        href={route('attendance.index')}
                        className="bg-white dark:bg-slate-900 p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-500 hover:text-indigo-600 hover:border-indigo-200 transition-all shadow-sm group"
                    >
                        <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
                    </Link>
                    <div className="flex flex-col gap-1">
                        <h2 className="text-3xl font-black tracking-tight bg-gradient-to-r from-slate-900 via-indigo-900 to-slate-800 dark:from-white dark:via-indigo-200 dark:to-slate-100 bg-clip-text text-transparent">
                            Attendance Logs
                        </h2>
                        <p className="text-slate-600 dark:text-slate-400 text-sm font-medium tracking-wide">
                            Review and filter past attendance records.
                        </p>
                    </div>
                </div>
            }
        >
            <Head title="Attendance History" />

            <div className="space-y-6">
                {/* Filters */}
                <Card className="border border-slate-200 dark:border-slate-800 shadow-xl overflow-visible">
                    <form onSubmit={handleFilter} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Filter Class</label>
                            <select
                                className="w-full bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-indigo-500/20"
                                value={params.class_section_id}
                                onChange={e => setParams({ ...params, class_section_id: e.target.value })}
                            >
                                <option value="">All Classes</option>
                                {sections.map(section => (
                                    <option key={section.id} value={section.id}>
                                        {section.school_class?.name} {section.class_arm?.name !== 'No arm' && section.class_arm?.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Specific Date</label>
                            <div className="relative">
                                <input
                                    type="date"
                                    className="w-full bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-indigo-500/20 pl-9"
                                    value={params.date}
                                    onChange={e => setParams({ ...params, date: e.target.value })}
                                />
                                <Calendar className="absolute left-3 top-2 text-slate-400" size={14} />
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Registration ID</label>
                            <div className="relative">
                                <input
                                    type="text"
                                    placeholder="Enter Student ID"
                                    className="w-full bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-indigo-500/20 pl-9"
                                    value={params.student_id}
                                    onChange={e => setParams({ ...params, student_id: e.target.value })}
                                />
                                <Search className="absolute left-3 top-2 text-slate-400" size={14} />
                            </div>
                        </div>

                        <button
                            type="submit"
                            className="w-full py-2.5 bg-slate-900 dark:bg-indigo-600 text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-slate-800 dark:hover:bg-indigo-700 transition-all flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/10"
                        >
                            <Filter size={14} />
                            Apply Filters
                        </button>
                    </form>
                </Card>

                {/* Table Content */}
                <Card className="!p-0 border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden mt-8">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-50 dark:bg-slate-900/50 border-b border-slate-100 dark:border-slate-800">
                                    <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Date</th>
                                    <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Student</th>
                                    <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Class / Section</th>
                                    <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest text-center">Status</th>
                                    <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Remarks</th>
                                    <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Taken By</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                                {history.data.length > 0 ? (
                                    history.data.map((record) => (
                                        <tr key={record.id} className="group hover:bg-slate-50 dark:hover:bg-slate-800/20 transition-all">
                                            <td className="px-6 py-4">
                                                <div className="flex flex-col">
                                                    <span className="text-sm font-black text-slate-900 dark:text-white tracking-tight">
                                                        {new Date(record.date).toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' })}
                                                    </span>
                                                    <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">
                                                        {record.term?.name}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 font-bold text-xs uppercase group-hover:bg-indigo-500 group-hover:text-white transition-all shadow-inner">
                                                        {record.student?.surname?.charAt(0)}
                                                    </div>
                                                    <div className="flex flex-col">
                                                        <span className="text-sm font-bold text-slate-800 dark:text-slate-200 tracking-tight">
                                                            {record.student?.surname} {record.student?.othername}
                                                        </span>
                                                        <span className="text-[10px] text-slate-500 font-medium">#{record.student?.registration_number || record.student_id.slice(0, 8)}</span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex flex-col">
                                                    <span className="text-sm font-bold text-slate-700 dark:text-slate-300">
                                                        {record.class_section?.school_class?.name}
                                                    </span>
                                                    <span className="text-[10px] text-indigo-500 dark:text-indigo-400 font-black uppercase tracking-widest">
                                                        {record.class_section?.class_arm?.name !== 'No arm' ? record.class_section?.class_arm?.name : 'Main Section'}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className={`flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-xl border w-fit mx-auto text-[10px] font-black uppercase tracking-widest ${statusStyles[record.status]}`}>
                                                    {statusIcons[record.status]}
                                                    {record.status}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium italic">
                                                    {record.remarks || '---'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-xs font-bold text-slate-600 dark:text-slate-400">
                                                {record.taken_by?.name || 'Unknown'}
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="6" className="py-24 text-center">
                                            <div className="flex flex-col items-center gap-3 opacity-30">
                                                <HistoryIcon size={48} className="text-slate-400" />
                                                <p className="text-sm font-black uppercase tracking-[0.2em] text-slate-500">No records found</p>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                    {history.links && history.data.length > 0 && (
                        <div className="p-6 border-t border-slate-100 dark:border-slate-800">
                            <Pagination links={history.links} />
                        </div>
                    )}
                </Card>
            </div>
        </AuthenticatedLayout>
    );
}
