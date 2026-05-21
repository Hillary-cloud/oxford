import StudentLayout from '@/Layouts/StudentLayout';
import { Head, useForm, Link } from '@inertiajs/react';
import Card from '@/Components/Card';
import { Clock, Info, AlertTriangle, ArrowRight, Shield, CheckCircle, Wifi, FileText } from 'lucide-react';

export default function Instruction({ auth, exam, student }) {
    const { post, processing } = useForm({});

    const startExam = () => {
        post(route('student.cbt.start', exam.id));
    };

    return (
        <StudentLayout>
            <Head title={`Instructions - ${exam.title}`} />

            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">

                {/* Header Card */}
                <div className="bg-white dark:bg-slate-800 rounded-3xl p-8 mb-8 shadow-sm border border-slate-200 dark:border-slate-700 relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-8 opacity-10">
                        <Shield size={200} className="text-indigo-600" />
                    </div>

                    <div className="relative z-10">
                        <span className="inline-block px-3 py-1 bg-indigo-50 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300 rounded-full text-xs font-bold uppercase tracking-wider mb-4">
                            Exam Briefing
                        </span>
                        <h1 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-4">
                            {exam.title}
                        </h1>
                        <p className="text-lg text-slate-600 dark:text-slate-300 max-w-2xl">
                            {exam.description || 'You are about to start a computer-based test. Please review the details and regulations below carefully.'}
                        </p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    {/* Stat Cards */}
                    <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-slate-200 dark:border-slate-700 flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-orange-100 dark:bg-orange-900/20 text-orange-600 flex items-center justify-center">
                            <Clock size={24} />
                        </div>
                        <div>
                            <div className="text-sm text-slate-500 dark:text-slate-400 font-medium uppercase tracking-wide">Duration</div>
                            <div className="text-xl font-bold text-slate-800 dark:text-white">{exam.duration_minutes} Minutes</div>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-slate-200 dark:border-slate-700 flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-purple-100 dark:bg-purple-900/20 text-purple-600 flex items-center justify-center">
                            <FileText size={24} />
                        </div>
                        <div>
                            <div className="text-sm text-slate-500 dark:text-slate-400 font-medium uppercase tracking-wide">Subject</div>
                            <div className="text-xl font-bold text-slate-800 dark:text-white">{exam.subject?.name || 'General'}</div>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-slate-200 dark:border-slate-700 flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-blue-100 dark:bg-blue-900/20 text-blue-600 flex items-center justify-center">
                            <Info size={24} />
                        </div>
                        <div>
                            <div className="text-sm text-slate-500 dark:text-slate-400 font-medium uppercase tracking-wide">Total Marks</div>
                            <div className="text-xl font-bold text-slate-800 dark:text-white">{exam.total_marks} Points</div>
                        </div>
                    </div>
                </div>

                {/* Instructions List */}
                <div className="bg-white dark:bg-slate-800 rounded-3xl p-8 shadow-sm border border-slate-200 dark:border-slate-700 mb-8">
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
                        <Shield className="text-indigo-600" size={24} />
                        Examination Rules
                    </h3>

                    <ul className="space-y-4">
                        {[
                            { icon: Clock, text: "The timer starts counting down individually for you once you click Start." },
                            { icon: CheckCircle, text: "Your progress is saved automatically to this device and synced every 30s." },
                            { icon: AlertTriangle, text: "Do not navigate away or close the browser window." },
                            { icon: Shield, text: "Wait for the confirmation message after submitting your exam." }
                        ].map((item, idx) => (
                            <li key={idx} className="flex items-start gap-4 p-4 rounded-xl bg-slate-50 dark:bg-slate-900/50">
                                <item.icon className="text-slate-400 shrink-0 mt-0.5" size={20} />
                                <span className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed">{item.text}</span>
                            </li>
                        ))}
                    </ul>
                </div>

                {/* Confirm Action */}
                <div className="flex flex-col md:flex-row gap-4 justify-center items-center">
                    <Link href={route('student.cbt.index')} className="w-full md:w-auto">
                        <button className="w-full md:w-auto px-8 py-4 rounded-xl font-bold text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800 transition-colors">
                            Return to Dashboard
                        </button>
                    </Link>

                    <button
                        onClick={startExam}
                        disabled={processing}
                        className="w-full md:w-auto px-10 py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold shadow-xl shadow-indigo-600/20 hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-3 disabled:opacity-70 disabled:hover:scale-100"
                    >
                        {processing ? 'Loading...' : 'Start Assessment'} <ArrowRight size={20} />
                    </button>
                </div>

                <p className="text-center text-xs text-slate-400 mt-6">
                    By clicking "Start Assessment", you agree to follow the examination conduct rules.
                </p>
            </div>
        </StudentLayout>
    );
}
