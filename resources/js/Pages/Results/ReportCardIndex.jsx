import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm, router } from '@inertiajs/react';
import Card from '@/Components/Card';
import PrimaryButton from '@/Components/PrimaryButton';
import { BookOpen, Search, Filter, FileSpreadsheet, GraduationCap, User, Calendar, Clock } from 'lucide-react';
import Pagination from '@/Components/Pagination';

export default function ReportCardIndex({ auth, students, classSections, sessions, terms, filters }) {
    const { data, setData, get, processing } = useForm({
        academic_session_id: filters.academic_session_id || '',
        term_id: filters.term_id || '',
        class_section_id: filters.class_section_id || '',
    });

    const handleSearch = (e) => {
        e.preventDefault();
        get(route('results.report-cards.index'), { preserveState: true });
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex flex-col gap-1">
                    <h2 className="text-2xl font-bold tracking-tight text-white">Report Cards</h2>
                    <p className="text-slate-400 text-sm">Generate and print official student result sheets.</p>
                </div>
            }
        >
            <Head title="Report Cards" />

            <div className="space-y-6">
                {/* Filters */}
                <Card>
                    <form onSubmit={handleSearch} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                        <div className="space-y-1">
                            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-1.5"><Calendar size={10} /> Session</label>
                            <select value={data.academic_session_id} onChange={e => setData('academic_session_id', e.target.value)} className="w-full bg-slate-900 border-slate-800 text-slate-200 text-sm rounded-xl focus:border-indigo-500 transition-all">
                                <option value="">Select Session</option>
                                {sessions.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                            </select>
                        </div>
                        <div className="space-y-1">
                            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-1.5"><Clock size={10} /> Term</label>
                            <select
                                value={data.term_id}
                                onChange={e => setData('term_id', e.target.value)}
                                className="w-full bg-slate-900 border-slate-800 text-slate-200 text-sm rounded-xl focus:border-indigo-500 transition-all"
                                disabled={!data.academic_session_id}
                            >
                                <option value="">{data.academic_session_id ? 'Select Term' : 'Select Session First'}</option>
                                {data.academic_session_id && sessions.find(s => s.id == data.academic_session_id)?.terms?.map(t => (
                                    <option key={t.id} value={t.id}>{t.name}</option>
                                ))}
                            </select>
                        </div>
                        <div className="space-y-1">
                            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-1.5"><GraduationCap size={10} /> Class Section</label>
                            <select value={data.class_section_id} onChange={e => setData('class_section_id', e.target.value)} className="w-full bg-slate-900 border-slate-800 text-slate-200 text-sm rounded-xl focus:border-indigo-500 transition-all">
                                <option value="">Select Class</option>
                                {classSections.map(cs => (
                                    <option key={cs.id} value={cs.id}>
                                        {cs.school_class?.name}
                                        {cs.class_arm?.name !== 'No arm' ? ` - ${cs.class_arm?.name}` : ''}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <PrimaryButton disabled={processing} className="justify-center h-[42px] gap-2">
                            <Filter size={16} /> Fetch Students
                        </PrimaryButton>
                    </form>
                </Card>

                {/* Students Table */}
                <Card title="Student Registry" description={students.data ? `Found ${students.total} active students.` : "Select filters to view students."}>
                    {students.data && students.data.length > 0 ? (
                        <>
                            <div className="overflow-x-auto -mx-6">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="border-b border-slate-800/50">
                                            <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Student Details</th>
                                            <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest text-center">Reference</th>
                                            <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest text-center">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-800/30">
                                        {students.data.map((student) => (
                                            <tr key={student.id} className="group hover:bg-slate-800/20 transition-colors">
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-500">
                                                            {student.profile_picture ? (
                                                                <img src={`/storage/${student.profile_picture}`} className="w-full h-full object-cover rounded-xl" />
                                                            ) : (
                                                                <User size={18} />
                                                            )}
                                                        </div>
                                                        <div>
                                                            <p className="text-sm font-bold text-slate-200">{student.surname} {student.othername}</p>
                                                            <p className="text-[10px] text-slate-500 capitalize">{student.gender}</p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-center">
                                                    <span className="font-mono text-xs text-slate-400 bg-slate-950 px-2 py-1 rounded border border-slate-800">
                                                        {student.registration_number}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-center">
                                                    <a
                                                        href={route('results.report-card', {
                                                            student: student.id,
                                                            academic_session_id: data.academic_session_id,
                                                            term_id: data.term_id
                                                        })}
                                                        target="_blank"
                                                    >
                                                        <PrimaryButton className="gap-2 text-xs h-8 bg-indigo-600 hover:bg-indigo-500">
                                                            <FileSpreadsheet size={14} /> Generate Report
                                                        </PrimaryButton>
                                                    </a>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                            <div className="mt-4">
                                <Pagination links={students.links} />
                            </div>
                        </>
                    ) : (
                        <div className="flex flex-col items-center justify-center py-12 text-center space-y-3">
                            <div className="p-3 bg-slate-800/50 rounded-xl text-slate-600">
                                <User size={24} />
                            </div>
                            <p className="text-slate-500 text-sm">Use the filters above to find students.</p>
                        </div>
                    )}
                </Card>
            </div>
        </AuthenticatedLayout>
    );
}
