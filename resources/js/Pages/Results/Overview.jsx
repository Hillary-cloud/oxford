import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm, router } from '@inertiajs/react';
import Card from '@/Components/Card';
import PrimaryButton from '@/Components/PrimaryButton';
import { BookOpen, Search, Filter, Plus, GraduationCap, Calculator, Pencil, Trash2, Calendar, Clock } from 'lucide-react';
import Pagination from '@/Components/Pagination';

export default function Overview({ auth, results, classSections, subjects, sessions, terms, filters }) {
    const { data, setData, get, processing } = useForm({
        academic_session_id: filters.academic_session_id || '',
        term_id: filters.term_id || '',
        class_section_id: filters.class_section_id || '',
        subject_id: filters.subject_id || '',
    });

    const handleSearch = (e) => {
        e.preventDefault();

        // Validate all fields are present
        if (!data.academic_session_id || !data.term_id || !data.class_section_id || !data.subject_id) {
            return;
        }

        get(route('results.index'), { preserveState: true });
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center justify-between">
                    <div className="flex flex-col gap-1">
                        <h2 className="text-2xl font-bold tracking-tight text-white">Subject Performance</h2>
                        <p className="text-slate-400 text-sm">View and manage compiled academic records.</p>
                    </div>
                    <Link href={route('results.compilation')}>
                        <PrimaryButton className="gap-2">
                            <Calculator size={18} />
                            Compile New Results
                        </PrimaryButton>
                    </Link>
                </div>
            }
        >
            <Head title="Performance Overview" />

            <div className="space-y-6">
                {/* Filters */}
                <Card>
                    <form onSubmit={handleSearch} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 items-end">
                        <div className="space-y-1">
                            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-1.5"><Calendar size={10} /> Session</label>
                            <select required value={data.academic_session_id} onChange={e => setData('academic_session_id', e.target.value)} className="w-full bg-slate-900 border-slate-800 text-slate-200 text-sm rounded-xl focus:border-indigo-500 transition-all">
                                <option value="">Select Session</option>
                                {sessions.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                            </select>
                        </div>
                        <div className="space-y-1">
                            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-1.5"><Clock size={10} /> Term</label>
                            <select
                                required
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
                            <select required value={data.class_section_id} onChange={e => setData('class_section_id', e.target.value)} className="w-full bg-slate-900 border-slate-800 text-slate-200 text-sm rounded-xl focus:border-indigo-500 transition-all">
                                <option value="">Select Class</option>
                                {classSections.map(cs => (
                                    <option key={cs.id} value={cs.id}>{cs.school_class?.name} - {cs.class_arm?.name}</option>
                                ))}
                            </select>
                        </div>
                        <div className="space-y-1">
                            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-1.5"><BookOpen size={10} /> Subject</label>
                            <select required value={data.subject_id} onChange={e => setData('subject_id', e.target.value)} className="w-full bg-slate-900 border-slate-800 text-slate-200 text-sm rounded-xl focus:border-indigo-500 transition-all">
                                <option value="">Select Subject</option>
                                {subjects.map(s => (
                                    <option key={s.id} value={s.id}>{s.name}</option>
                                ))}
                            </select>
                        </div>
                        <PrimaryButton
                            disabled={processing || !data.academic_session_id || !data.term_id || !data.class_section_id || !data.subject_id}
                            className="w-full justify-center h-[42px] gap-2"
                        >
                            <Filter size={16} /> Filter Records
                        </PrimaryButton>
                    </form>
                </Card>

                {/* Results Table */}
                {/* Results Table */}
                <Card title="Academic Records" description={results.data.length > 0 ? `Showing ${results.data.length} records.` : "Use filters to find records."}>
                    {results.data.length > 0 ? (
                        <>
                            <div className="overflow-x-auto -mx-6">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="border-b border-slate-800/50">
                                            <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Student</th>
                                            <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Subject</th>
                                            <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center">Score Breakdown</th>
                                            <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center">Total</th>
                                            <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-800/30">
                                        {results.data.map((result) => (
                                            <tr key={result.id} className="group hover:bg-slate-800/20 transition-colors">
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
                                                            <span className="font-bold text-xs">{result.student.surname[0]}</span>
                                                        </div>
                                                        <div>
                                                            <p className="text-sm font-bold text-slate-200">{result.student.surname} {result.student.othername}</p>
                                                            <p className="text-[10px] font-mono text-slate-400">{result.student.registration_number}</p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex flex-col">
                                                        <span className="text-sm font-medium text-slate-300">{result.subject.name}</span>
                                                        <span className="text-[10px] text-slate-400">
                                                            {result.class_section.school_class.name} {result.class_section.class_arm.name} • {result.term?.name} <span className="text-slate-500">({result.academic_session?.name})</span>
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-center">
                                                    <div className="inline-flex items-center gap-2 p-1 bg-slate-900 rounded-lg border border-slate-800">
                                                        <span className="text-[10px] text-slate-400 px-2 border-r border-slate-800">Exam: <span className="text-white font-mono">{result.exam_score}</span></span>
                                                        <span className="text-[10px] text-slate-400 px-2">CA: <span className="text-white font-mono">{Number(result.total_score - result.exam_score).toFixed(1)}</span></span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-center">
                                                    <div className="flex flex-col items-center gap-1">
                                                        <span className={`text-sm font-black px-2 py-0.5 rounded-md border ${result.grade === 'F' ? 'bg-rose-500/10 text-rose-400 border-rose-500/20' :
                                                            result.grade === 'A' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                                                                'bg-indigo-500/10 text-indigo-400 border-indigo-500/20'
                                                            }`}>
                                                            {result.total_score}
                                                        </span>
                                                        <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">{result.grade}</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-center">
                                                    <div className="flex justify-center gap-2">
                                                        <Link href={route('results.edit', result.id)} className="p-2 text-slate-400 hover:text-indigo-400 hover:bg-slate-800 rounded-lg transition-all" title="Edit Result">
                                                            <Pencil size={14} />
                                                        </Link>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                            <div className="mt-4">
                                <Pagination links={results.links} />
                            </div>
                        </>
                    ) : (
                        <div className="flex flex-col items-center justify-center py-24 text-center space-y-4 bg-slate-900/30 border border-dashed border-slate-800 rounded-[3rem]">
                            <div className="p-4 bg-slate-800/50 rounded-2xl text-slate-600">
                                <Search size={32} />
                            </div>
                            <div className="space-y-1">
                                <h3 className="text-slate-300 font-bold">Select Filters to View Results</h3>
                                <p className="text-slate-500 text-sm max-w-xs">Use the filters above to find students and their scores.</p>
                            </div>
                        </div>
                    )}
                </Card>
            </div>
        </AuthenticatedLayout>
    );
}
