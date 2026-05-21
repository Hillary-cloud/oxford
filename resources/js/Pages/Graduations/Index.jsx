import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';
import Card from '@/Components/Card';
import PrimaryButton from '@/Components/PrimaryButton';
import Pagination from '@/Components/Pagination';
import { Search, GraduationCap, User, Calendar, FileText } from 'lucide-react';
import { useState } from 'react';

export default function Index({ auth, graduations, sessions, filters }) {
    const [params, setParams] = useState({
        search: filters.search || '',
        academic_session_id: filters.academic_session_id || '',
    });

    // Debounce search update
    const updateParams = (newParams) => {
        setParams(prev => ({ ...prev, ...newParams }));

        router.get(route('graduations.index'), { ...params, ...newParams }, {
            preserveState: true,
            preserveScroll: true,
            replace: true
        });
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex flex-col gap-1">
                    <h2 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white uppercase">Alumni Registry</h2>
                    <p className="text-slate-600 dark:text-slate-400 text-sm font-medium italic">Archive of all graduated students.</p>
                </div>
            }
        >
            <Head title="Graduations" />

            <div className="space-y-6">
                <Card
                    title="Graduation Records"
                    description={`Total Alumni: ${graduations.total} records.`}
                    actions={
                        <div className="flex flex-col sm:flex-row items-center gap-3">
                            {/* Search */}
                            <div className="relative group w-full sm:w-64">
                                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 dark:text-slate-500 group-focus-within:text-indigo-600 dark:group-focus-within:text-indigo-400 transition-colors" />
                                <input
                                    type="text"
                                    placeholder="Search Alumni..."
                                    value={params.search}
                                    onChange={e => updateParams({ search: e.target.value })}
                                    className="w-full pl-10 pr-4 py-2 bg-white dark:bg-slate-900/50 border-slate-300 dark:border-slate-800 text-sm text-slate-900 dark:text-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all font-medium"
                                />
                            </div>

                            {/* Session Filter */}
                            <div className="w-full sm:w-48">
                                <select
                                    value={params.academic_session_id}
                                    onChange={e => updateParams({ academic_session_id: e.target.value })}
                                    className="w-full px-3 py-2 bg-white dark:bg-slate-900/50 border-slate-300 dark:border-slate-800 text-sm text-slate-900 dark:text-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all cursor-pointer font-bold"
                                >
                                    <option value="">All Verification Sessions</option>
                                    {sessions.map(s => (
                                        <option key={s.id} value={s.id}>{s.name}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    }
                >
                    <div className="overflow-x-auto -mx-6">
                        <table className="w-full text-left border-collapse min-w-[800px]">
                            <thead>
                                <tr className="border-b border-slate-200 dark:border-slate-800/50">
                                    <th className="px-6 py-4 text-[10px] font-bold text-slate-700 dark:text-slate-400 uppercase tracking-widest">Student Details</th>
                                    <th className="px-6 py-4 text-[10px] font-bold text-slate-700 dark:text-slate-400 uppercase tracking-widest">Graduation Session</th>
                                    <th className="px-6 py-4 text-[10px] font-bold text-slate-700 dark:text-slate-400 uppercase tracking-widest">Date</th>
                                    <th className="px-6 py-4 text-[10px] font-bold text-slate-700 dark:text-slate-400 uppercase tracking-widest text-right">Remarks</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-200 dark:divide-slate-800/30">
                                {graduations.data.length === 0 ? (
                                    <tr>
                                        <td colSpan="5" className="px-6 py-12 text-center text-slate-500 italic">
                                            No graduation records found.
                                        </td>
                                    </tr>
                                ) : (
                                    graduations.data.map(grad => (
                                        <tr key={grad.id} className="group hover:bg-slate-50 dark:hover:bg-slate-800/20 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-500">
                                                        <GraduationCap size={20} />
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-black text-slate-800 dark:text-slate-200 tracking-tight uppercase">
                                                            {grad.student?.surname} {grad.student?.othername}
                                                        </p>
                                                        <p className="text-[10px] font-mono text-slate-500">{grad.student?.registration_number}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                                                    <Calendar size={12} />
                                                    {grad.academic_session?.name}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="text-sm font-medium text-slate-600 dark:text-slate-400">
                                                    {new Date(grad.graduated_at).toLocaleDateString()}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                {grad.final_remark ? (
                                                    <span className="text-xs text-slate-600 dark:text-slate-400 italic max-w-[200px] inline-block truncate" title={grad.final_remark}>
                                                        {grad.final_remark}
                                                    </span>
                                                ) : (
                                                    <span className="text-slate-300 dark:text-slate-700">-</span>
                                                )}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    <Pagination links={graduations.links} />
                </Card>
            </div>
        </AuthenticatedLayout>
    );
}
