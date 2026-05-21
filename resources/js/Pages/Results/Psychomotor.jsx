import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, router } from '@inertiajs/react';
import Card from '@/Components/Card';
import PrimaryButton from '@/Components/PrimaryButton';
import { Brain, Star, Save, User, Hash, GraduationCap, Calendar, Clock, Search, Info } from 'lucide-react';
import { toast } from 'react-toastify';
import { useEffect } from 'react';

export default function Psychomotor({ auth, sessions, terms, classSections, categories, students, filters }) {
    const { data, setData, post, processing } = useForm({
        academic_session_id: filters.academic_session_id || '',
        term_id: filters.term_id || '',
        class_section_id: filters.class_section_id || '',
        ratings: [],
    });

    useEffect(() => {
        if (students && students.length > 0) {
            const initialRatings = [];
            students.forEach(student => {
                categories.forEach(cat => {
                    cat.skills.forEach(skill => {
                        const existingRating = student.psychomotor_ratings?.find(r => r.skill_id === skill.id);
                        initialRatings.push({
                            student_id: student.id,
                            skill_id: skill.id,
                            rating: existingRating ? existingRating.rating : 3,
                            student_name: `${student.surname} ${student.othername}`,
                            skill_name: skill.name
                        });
                    });
                });
            });
            setData('ratings', initialRatings);
        }
    }, [students, categories]);

    const handleSearch = (e) => {
        e.preventDefault();
        router.get(route('results.psychomotor.index'), {
            academic_session_id: data.academic_session_id,
            term_id: data.term_id,
            class_section_id: data.class_section_id
        }, { preserveState: true });
    };

    const updateRating = (studentId, skillId, value) => {
        const index = data.ratings.findIndex(r => r.student_id === studentId && r.skill_id === skillId);

        if (index !== -1) {
            const newRatings = [...data.ratings];
            newRatings[index] = { ...newRatings[index], rating: value };
            setData('ratings', newRatings);
        }
    };

    const submit = (e) => {
        e.preventDefault();
        post(route('results.psychomotor.store'), {
            onSuccess: () => { },
        });
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex flex-col gap-1">
                    <h2 className="text-2xl font-bold tracking-tight text-white">Psychomotor Evaluation</h2>
                    <p className="text-slate-400 text-sm">Rate students' affective domains and behavioral traits.</p>
                </div>
            }
        >
            <Head title="Psychomotor Ratings" />

            <div className="space-y-8">
                <Card title="Context Selection" description="Select class and term to evaluate.">
                    <form onSubmit={handleSearch} className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div className="space-y-1">
                            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest"><Calendar size={10} className="inline mr-1" /> Session</label>
                            <select value={data.academic_session_id} onChange={e => setData('academic_session_id', e.target.value)} className="w-full bg-slate-900 border-slate-800 text-slate-200 text-xs rounded-xl focus:border-indigo-500">
                                <option value="">Select Session</option>
                                {sessions.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                            </select>
                        </div>
                        <div className="space-y-1">
                            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest"><Clock size={10} className="inline mr-1" /> Term</label>
                            <select
                                value={data.term_id}
                                onChange={e => setData('term_id', e.target.value)}
                                className="w-full bg-slate-900 border-slate-800 text-slate-200 text-xs rounded-xl focus:border-indigo-500"
                                disabled={!data.academic_session_id}
                            >
                                <option value="">{data.academic_session_id ? 'Select Term' : 'Select Session First'}</option>
                                {data.academic_session_id && sessions.find(s => s.id == data.academic_session_id)?.terms?.map(t => (
                                    <option key={t.id} value={t.id}>{t.name}</option>
                                ))}
                            </select>
                        </div>
                        <div className="space-y-1">
                            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest"><GraduationCap size={10} className="inline mr-1" /> Class Arm</label>
                            <select value={data.class_section_id} onChange={e => setData('class_section_id', e.target.value)} className="w-full bg-slate-900 border-slate-800 text-slate-200 text-xs rounded-xl focus:border-indigo-500">
                                {classSections.map(cs => (
                                    <option key={cs.id} value={cs.id}>
                                        {cs.school_class?.name}
                                        {cs.class_arm?.name !== 'No arm' ? ` - ${cs.class_arm?.name}` : ''}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="flex items-end">
                            <PrimaryButton className="w-full justify-center h-[42px] gap-2">
                                <Search size={16} /> Load Students
                            </PrimaryButton>
                        </div>
                    </form>
                </Card>

                {data.ratings.length > 0 ? (
                    <form onSubmit={submit}>
                        <Card
                            title="Competency Matrix"
                            description={`Rating ${students.length} students across multiple domains.`}
                            actions={
                                <PrimaryButton disabled={processing} className="gap-2">
                                    <Save size={18} /> Save Ratings
                                </PrimaryButton>
                            }
                        >
                            <div className="overflow-x-auto -mx-6">
                                <table className="w-full text-left border-collapse min-w-[1000px]">
                                    <thead>
                                        <tr className="border-b border-slate-800/50">
                                            <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Student</th>
                                            {categories.map(cat => (
                                                cat.skills.map(skill => (
                                                    <th key={skill.id} className="px-4 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest text-center whitespace-nowrap">
                                                        {skill.name} <br />
                                                        <span className="text-[8px] text-slate-600 font-normal">{cat.name}</span>
                                                    </th>
                                                ))
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-800/30">
                                        {students.map((student) => (
                                            <tr key={student.id} className="group hover:bg-slate-800/20 transition-colors">
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-8 h-8 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-500 group-hover:text-indigo-400 transition-all">
                                                            <User size={14} />
                                                        </div>
                                                        <div>
                                                            <p className="text-xs font-bold text-slate-200">{student.surname} {student.othername}</p>
                                                            <p className="text-[9px] font-mono text-slate-500">{student.registration_number}</p>
                                                        </div>
                                                    </div>
                                                </td>
                                                {categories.map(cat => (
                                                    cat.skills.map(skill => {
                                                        const ratingObj = data.ratings.find(r => r.student_id === student.id && r.skill_id === skill.id);
                                                        return (
                                                            <td key={skill.id} className="px-4 py-4">
                                                                <div className="flex items-center justify-center gap-1">
                                                                    {[1, 2, 3, 4, 5].map(val => (
                                                                        <button
                                                                            key={val}
                                                                            type="button"
                                                                            onClick={() => updateRating(student.id, skill.id, val)}
                                                                            className={`w-6 h-6 rounded-md flex items-center justify-center text-[10px] font-bold transition-all ${ratingObj?.rating >= val
                                                                                ? 'bg-indigo-500 text-white shadow-[0_0_10px_rgba(99,102,241,0.3)]'
                                                                                : 'bg-slate-950 text-slate-600 hover:bg-slate-800'
                                                                                }`}
                                                                        >
                                                                            {val}
                                                                        </button>
                                                                    ))}
                                                                </div>
                                                            </td>
                                                        );
                                                    })
                                                ))}
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </Card>
                    </form>
                ) : (
                    <div className="flex flex-col items-center justify-center py-24 text-center space-y-4 bg-slate-900/30 border border-dashed border-slate-800 rounded-[3rem]">
                        <div className="p-4 bg-slate-800/50 rounded-2xl text-slate-600">
                            <Brain size={32} />
                        </div>
                        <div className="space-y-1">
                            <h3 className="text-slate-300 font-bold">Domain Evaluation</h3>
                            <p className="text-slate-500 text-sm max-w-xs">Select session and class to rate behavioral traits.</p>
                        </div>
                    </div>
                )}
            </div>
        </AuthenticatedLayout>
    );
}
