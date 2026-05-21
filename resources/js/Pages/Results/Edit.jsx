import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, Link } from '@inertiajs/react';
import Card from '@/Components/Card';
import PrimaryButton from '@/Components/PrimaryButton';
import { Save, ArrowLeft, Calculator, GraduationCap, BookOpen, User } from 'lucide-react';
import { toast } from 'react-toastify';
import { useEffect } from 'react';

export default function Edit({ auth, result, assessments, caConfig }) {
    const { data, setData, put, processing, errors } = useForm({
        assessments: assessments || [],
        exam_score: result.exam_score || 0,
    });

    // Recalculate if assessments change
    const calculateTotal = () => {
        const caTotal = data.assessments.reduce((sum, a) => sum + (parseFloat(a.score) || 0), 0);
        return caTotal + (parseFloat(data.exam_score) || 0);
    };

    const updateAssessment = (index, value) => {
        if (parseFloat(value) < 0) return;
        const newAssessments = [...data.assessments];
        newAssessments[index].score = parseFloat(value) || 0;
        setData('assessments', newAssessments);
    };

    const submit = (e) => {
        e.preventDefault();
        put(route('results.update', result.id), {
            onSuccess: () => { },
        });
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center gap-4">
                    <Link
                        href={route('results.management', {
                            tab: 'overview',
                            academic_session_id: result.academic_session_id,
                            term_id: result.term_id,
                            class_section_id: result.class_section_id,
                            subject_id: result.subject_id
                        })}
                        className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-all"
                    >
                        <ArrowLeft size={20} />
                    </Link>
                    <div className="flex flex-col gap-1">
                        <h2 className="text-2xl font-bold tracking-tight text-white">Edit Result</h2>
                        <p className="text-slate-400 text-sm">Modify scores for {result.student.surname} {result.student.othername}</p>
                    </div>
                </div>
            }
        >
            <Head title="Edit Result" />

            <div className="max-w-3xl mx-auto">
                <form onSubmit={submit}>
                    <Card
                        title="Score Modification"
                        description="Update assessment and exam scores."
                        actions={
                            <PrimaryButton disabled={processing} className="gap-2">
                                <Save size={18} /> Update Result
                            </PrimaryButton>
                        }
                    >
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-4">
                            {/* Student & Subject Info */}
                            <div className="col-span-full flex items-center gap-4 p-4 bg-slate-900 rounded-2xl border border-slate-800">
                                <div className="w-12 h-12 rounded-xl bg-slate-950 flex items-center justify-center text-slate-500">
                                    <User size={24} />
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-white">{result.student.surname} {result.student.othername}</h3>
                                    <div className="flex items-center gap-3 text-xs text-slate-400">
                                        <span className="flex items-center gap-1"><GraduationCap size={12} /> {result.class_section.school_class.name}</span>
                                        <span className="flex items-center gap-1"><BookOpen size={12} /> {result.subject.name}</span>
                                    </div>
                                </div>
                                <div className="ml-auto text-right">
                                    <span className="block text-2xl font-black text-indigo-400">{calculateTotal().toFixed(1)}</span>
                                    <span className="text-[10px] uppercase font-bold text-slate-500 tracking-widest">Total Score</span>
                                </div>
                            </div>

                            {/* CA Inputs */}
                            <div className="space-y-4">
                                <h4 className="text-xs font-black text-slate-500 uppercase tracking-widest mb-4 border-b border-slate-800 pb-2">Assessments (CA)</h4>
                                {data.assessments.map((ca, index) => (
                                    <div key={index} className="space-y-1">
                                        <div className="flex justify-between">
                                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{ca.name}</label>
                                            <span className="text-[10px] text-slate-600">Max: {ca.max_score}</span>
                                        </div>
                                        <input
                                            type="number"
                                            min="0"
                                            step="0.01"
                                            max={ca.max_score}
                                            value={ca.score}
                                            onChange={e => updateAssessment(index, e.target.value)}
                                            className="w-full bg-slate-950 border-slate-800 text-sm rounded-xl focus:border-indigo-500 px-3 py-2 font-mono"
                                        />
                                    </div>
                                ))}
                            </div>

                            {/* Exam Input */}
                            <div className="space-y-4">
                                <h4 className="text-xs font-black text-slate-500 uppercase tracking-widest mb-4 border-b border-slate-800 pb-2">Examination</h4>
                                <div className="space-y-1">
                                    <div className="flex justify-between">
                                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Exam Score</label>
                                        <span className="text-[10px] text-slate-600">Max: {100 - caConfig.reduce((s, c) => s + (parseInt(c.max_score) || 0), 0)}</span>
                                    </div>
                                    <input
                                        type="number"
                                        min="0"
                                        step="0.01"
                                        value={data.exam_score}
                                        onChange={e => {
                                            if (e.target.value < 0) return;
                                            setData('exam_score', e.target.value)
                                        }}
                                        className="w-full bg-slate-950 border-slate-800 text-sm rounded-xl focus:border-indigo-500 px-3 py-2 font-mono"
                                    />
                                    {errors.exam_score && <p className="text-red-500 text-xs mt-1">{errors.exam_score}</p>}
                                </div>
                            </div>
                        </div>
                    </Card>
                </form>
            </div>
        </AuthenticatedLayout>
    );
}
