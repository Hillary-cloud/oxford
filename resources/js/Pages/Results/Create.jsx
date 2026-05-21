import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, Link } from '@inertiajs/react';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import TextInput from '@/Components/TextInput';
import Card from '@/Components/Card';
import { Calculator, ArrowLeft, Save } from 'lucide-react';

export default function Create({ auth, students, subjects, sessions, terms, classSections }) {
    const { data, setData, post, processing, errors } = useForm({
        student_id: '',
        academic_session_id: '',
        term_id: '',
        subject_id: '',
        class_section_id: '',
        ca_score: '',
        exam_score: '',
        remarks: '',
    });

    const submit = (e) => {
        e.preventDefault();
        post(route('results.store'));
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center gap-4">
                    <Link href={route('results.management')} className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-all">
                        <ArrowLeft size={20} />
                    </Link>
                    <div className="flex flex-col gap-1">
                        <h2 className="text-2xl font-bold tracking-tight text-white">Compute Result</h2>
                        <p className="text-slate-400 text-sm">Calculate and record scores for a specific academic period.</p>
                    </div>
                </div>
            }
        >
            <Head title="Compute Result" />

            <div className="max-w-4xl">
                <form onSubmit={submit} className="space-y-8">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {/* Context Selection */}
                        <Card title="Academic Context" description="Select the student and academic period.">
                            <div className="space-y-6">
                                <div>
                                    <InputLabel htmlFor="student_id" value="Student" />
                                    <select
                                        id="student_id"
                                        name="student_id"
                                        value={data.student_id}
                                        className="block w-full bg-slate-900 border-slate-800 text-slate-200 rounded-xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/50 transition-all px-4 py-2.5"
                                        onChange={(e) => setData('student_id', e.target.value)}
                                        required
                                    >
                                        <option value="" className="bg-slate-900">Select Student</option>
                                        {students.map((student) => (
                                            <option key={student.id} value={student.id} className="bg-slate-900 text-sm">
                                                {student.first_name} {student.last_name} ({student.admission_number})
                                            </option>
                                        ))}
                                    </select>
                                    <InputError message={errors.student_id} />
                                </div>

                                <div>
                                    <InputLabel htmlFor="subject_id" value="Subject" />
                                    <select
                                        id="subject_id"
                                        name="subject_id"
                                        value={data.subject_id}
                                        className="block w-full bg-slate-900 border-slate-800 text-slate-200 rounded-xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/50 transition-all px-4 py-2.5"
                                        onChange={(e) => setData('subject_id', e.target.value)}
                                        required
                                    >
                                        <option value="" className="bg-slate-900">Select Subject</option>
                                        {subjects.map((subject) => (
                                            <option key={subject.id} value={subject.id} className="bg-slate-900">
                                                {subject.name}
                                            </option>
                                        ))}
                                    </select>
                                    <InputError message={errors.subject_id} />
                                </div>

                                <div>
                                    <InputLabel htmlFor="class_section_id" value="Class & Level" />
                                    <select
                                        id="class_section_id"
                                        name="class_section_id"
                                        value={data.class_section_id}
                                        className="block w-full bg-slate-900 border-slate-800 text-slate-200 rounded-xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/50 transition-all px-4 py-2.5"
                                        onChange={(e) => setData('class_section_id', e.target.value)}
                                        required
                                    >
                                        <option value="" className="bg-slate-900">Select Class Section</option>
                                        {classSections.map((section) => (
                                            <option key={section.id} value={section.id} className="bg-slate-900">
                                                {section.school_class?.name} {section.class_arm?.name}
                                            </option>
                                        ))}
                                    </select>
                                    <InputError message={errors.class_section_id} />
                                </div>
                            </div>
                        </Card>

                        {/* Timing Context */}
                        <div className="space-y-8">
                            <Card title="Session & Term" description="Specify when these results were earned.">
                                <div className="space-y-6">
                                    <div>
                                        <InputLabel htmlFor="academic_session_id" value="Academic Session" />
                                        <select
                                            id="academic_session_id"
                                            name="academic_session_id"
                                            value={data.academic_session_id}
                                            className="block w-full bg-slate-900 border-slate-800 text-slate-200 rounded-xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/50 transition-all px-4 py-2.5"
                                            onChange={(e) => setData('academic_session_id', e.target.value)}
                                            required
                                        >
                                            <option value="" className="bg-slate-900">Select Session</option>
                                            {sessions.map((session) => (
                                                <option key={session.id} value={session.id} className="bg-slate-900">
                                                    {session.name}
                                                </option>
                                            ))}
                                        </select>
                                        <InputError message={errors.academic_session_id} />
                                    </div>

                                    <div>
                                        <InputLabel htmlFor="term_id" value="Term" />
                                        <select
                                            id="term_id"
                                            name="term_id"
                                            value={data.term_id}
                                            className="block w-full bg-slate-900 border-slate-800 text-slate-200 rounded-xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/50 transition-all px-4 py-2.5"
                                            onChange={(e) => setData('term_id', e.target.value)}
                                            required
                                        >
                                            <option value="" className="bg-slate-900">Select Term</option>
                                            {terms.map((term) => (
                                                <option key={term.id} value={term.id} className="bg-slate-900">
                                                    {term.name} ({term.academic_session?.name})
                                                </option>
                                            ))}
                                        </select>
                                        <InputError message={errors.term_id} />
                                    </div>
                                </div>
                            </Card>

                            {/* Scores & Performance */}
                            <Card title="Scores" description="Enter the raw data for computations.">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <InputLabel htmlFor="ca_score" value="CA (Max 40)" />
                                        <TextInput
                                            id="ca_score"
                                            type="number"
                                            name="ca_score"
                                            value={data.ca_score}
                                            className="block w-full"
                                            onChange={(e) => setData('ca_score', e.target.value)}
                                            required
                                            min="0"
                                            max="40"
                                            placeholder="40"
                                        />
                                        <InputError message={errors.ca_score} />
                                    </div>

                                    <div>
                                        <InputLabel htmlFor="exam_score" value="Exam (Max 60)" />
                                        <TextInput
                                            id="exam_score"
                                            type="number"
                                            name="exam_score"
                                            value={data.exam_score}
                                            className="block w-full"
                                            onChange={(e) => setData('exam_score', e.target.value)}
                                            required
                                            min="0"
                                            max="60"
                                            placeholder="60"
                                        />
                                        <InputError message={errors.exam_score} />
                                    </div>
                                </div>
                            </Card>
                        </div>
                    </div>

                    <Card title="Additional Feedback" description="Optional comments on student performance.">
                        <textarea
                            id="remarks"
                            name="remarks"
                            value={data.remarks}
                            className="block w-full bg-slate-900 border-slate-800 text-slate-200 rounded-xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/50 transition-all px-4 py-2.5 min-h-[100px]"
                            onChange={(e) => setData('remarks', e.target.value)}
                            placeholder="Provide descriptive feedback for the student report..."
                        />
                        <InputError message={errors.remarks} />
                    </Card>

                    <div className="flex items-center justify-end gap-3 pt-6 border-t border-slate-800/50">
                        <Link href={route('results.management')}>
                            <SecondaryButton>Cancel</SecondaryButton>
                        </Link>
                        <PrimaryButton className="gap-2" disabled={processing}>
                            <Save size={18} />
                            Communicate Result
                        </PrimaryButton>
                    </div>
                </form>
            </div>
        </AuthenticatedLayout>
    );
}
