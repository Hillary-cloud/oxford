import StudentLayout from '@/Layouts/StudentLayout';
import { Head, Link, usePage } from '@inertiajs/react';
import Card from '@/Components/Card';
import { Clock, CheckCircle, Play, FileText, AlertCircle, BarChart2, Calendar, Trophy } from 'lucide-react';
import { useEffect } from 'react';
import Swal from 'sweetalert2';

export default function Index({ auth, exams, student, error }) {
    const { flash } = usePage().props;

    useEffect(() => {
        if (flash?.success && flash?.last_score !== null && flash?.last_score !== undefined) {
            // We can find the exam that was just taken if we had the ID, 
            // but we can also just show the score since it's in the flash.
            Swal.fire({
                title: 'Exam Submitted!',
                html: `
                    <div class="py-4">
                        <div class="text-5xl font-bold text-indigo-600 mb-2">${flash.last_score} / ${flash.last_total}</div>
                        <p class="text-slate-500">Your results have been recorded successfully.</p>
                    </div>
                 `,
                icon: 'success',
                confirmButtonText: 'Great!',
                confirmButtonColor: '#4f46e5'
            });
        } else if (flash?.success) {
            Swal.fire({
                title: 'Success!',
                text: flash.success,
                icon: 'success',
                timer: 3000,
                showConfirmButton: false
            });
        }
    }, [flash]);

    // Calculate stats
    const pendingCount = exams?.filter(e => !['submitted', 'graded'].includes(e.attempt_status)).length || 0;
    const completedCount = exams?.filter(e => ['submitted', 'graded'].includes(e.attempt_status)).length || 0;

    const getTimeGreeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return 'Good Morning';
        if (hour < 18) return 'Good Afternoon';
        return 'Good Evening';
    };

    return (
        <StudentLayout
            header={
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="flex items-center gap-5">
                        <div className="relative group">
                            <div className="w-20 h-20 rounded-2xl bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600 overflow-hidden border-2 border-white dark:border-slate-700 shadow-xl shadow-indigo-500/10 transition-transform group-hover:scale-105">
                                {student?.profile_picture_url ? (
                                    <img src={student.profile_picture_url} alt="Profile" className="w-full h-full object-cover" />
                                ) : (
                                    <div className="text-2xl font-black opacity-30 select-none">
                                        {student?.surname?.charAt(0)}{student?.othername?.charAt(0)}
                                    </div>
                                )}
                            </div>
                            <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-emerald-500 border-2 border-white dark:border-slate-800 shadow-md flex items-center justify-center text-white">
                                <CheckCircle size={12} strokeWidth={3} />
                            </div>
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold text-slate-800 dark:text-white">
                                {getTimeGreeting()}, <span className="text-indigo-600 dark:text-indigo-400">{student?.surname}</span>
                            </h2>
                            <div className="flex flex-wrap items-center gap-2 mt-1">
                                {student?.class_section?.school_class && (
                                    <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 uppercase tracking-wider">
                                        {student?.class_section?.school_class?.name} - {student?.class_section?.class_arm?.name}
                                    </span>
                                )}

                            </div>
                        </div>
                    </div>

                    <div className="flex gap-4">
                        <div className="bg-white dark:bg-slate-700 rounded-xl px-4 py-2 shadow-sm border border-slate-100 dark:border-slate-600 flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-600 flex items-center justify-center">
                                <Clock size={20} />
                            </div>
                            <div>
                                <div className="text-sm text-slate-500 dark:text-slate-400 font-medium">Pending</div>
                                <div className="text-lg font-bold text-slate-800 dark:text-white">{pendingCount}</div>
                            </div>
                        </div>
                        <div className="bg-white dark:bg-slate-700 rounded-xl px-4 py-2 shadow-sm border border-slate-100 dark:border-slate-600 flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 flex items-center justify-center">
                                <CheckCircle size={20} />
                            </div>
                            <div>
                                <div className="text-sm text-slate-500 dark:text-slate-400 font-medium">Completed</div>
                                <div className="text-lg font-bold text-slate-800 dark:text-white">{completedCount}</div>
                            </div>
                        </div>
                    </div>
                </div>
            }
        >
            <Head title="My Exams" />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {error && (
                    <div className="mb-6 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-4 rounded-xl flex items-center gap-3 border border-red-100 dark:border-red-800">
                        <AlertCircle />
                        <p className="font-medium">{error}</p>
                    </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {exams && exams.length > 0 ? (
                        exams.map((exam, idx) => {
                            const isSubmitted = exam.attempt_status === 'submitted' || exam.attempt_status === 'graded';
                            const inProgress = exam.attempt_status === 'in_progress';

                            return (
                                <div
                                    key={exam.id}
                                    className="group bg-white dark:bg-slate-800 rounded-2xl p-0 shadow-sm hover:shadow-xl transition-all duration-300 border border-slate-200 dark:border-slate-700 overflow-hidden flex flex-col relative"
                                    style={{ animationDelay: `${idx * 100}ms` }}
                                >
                                    {/* Status Badge Strip */}
                                    <div className={`h-1.5 w-full ${isSubmitted ? 'bg-emerald-500' : inProgress ? 'bg-amber-500' : 'bg-slate-200 dark:bg-slate-700 group-hover:bg-indigo-500'
                                        } transition-colors`}></div>

                                    <div className="p-6 flex-1 flex flex-col">
                                        <div className="flex justify-between items-start mb-4">
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-50 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300">
                                                {exam.subject?.name || 'General'}
                                            </span>

                                            {isSubmitted ? (
                                                <span className="flex items-center gap-1 text-xs font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 px-2 py-1 rounded-lg">
                                                    <CheckCircle size={14} /> Done
                                                </span>
                                            ) : inProgress ? (
                                                <span className="flex items-center gap-1 text-xs font-bold text-amber-600 bg-amber-50 dark:bg-amber-900/20 px-2 py-1 rounded-lg animate-pulse">
                                                    <Play size={14} /> Resume
                                                </span>
                                            ) : (
                                                <span className="flex items-center gap-1 text-xs font-bold text-slate-500 bg-slate-100 dark:bg-slate-700 px-2 py-1 rounded-lg">
                                                    Not Started
                                                </span>
                                            )}
                                        </div>

                                        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                                            {(exam.academic_session?.name || exam.academicSession?.name)} • {(exam.term?.name)}
                                        </div>

                                        <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-2 leading-tight group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                                            {exam.title}
                                        </h3>

                                        <div className="mt-auto space-y-3 pt-4">
                                            <div className="flex items-center text-sm text-slate-500 dark:text-slate-400 gap-2">
                                                <Clock size={16} className="text-slate-400" />
                                                <span>{exam.duration_minutes} minutes</span>
                                            </div>
                                            <div className="flex items-center text-sm text-slate-500 dark:text-slate-400 gap-2">
                                                <FileText size={16} className="text-slate-400" />
                                                <span>Multiple Choice Questions</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="p-6 pt-0 mt-2">
                                        {isSubmitted ? (
                                            <button disabled className="w-full py-3 bg-slate-50 dark:bg-slate-700/50 text-slate-400 dark:text-slate-500 rounded-xl font-bold text-sm cursor-not-allowed border border-slate-100 dark:border-slate-700 flex items-center justify-center gap-2">
                                                <CheckCircle size={16} /> Exam Completed
                                            </button>
                                        ) : (
                                            <Link
                                                href={route('student.cbt.show', exam.id)}
                                                className={`flex items-center justify-center gap-2 w-full py-3 rounded-xl font-bold text-sm transition-all shadow-lg hover:translate-y-[-2px] hover:shadow-xl ${inProgress
                                                    ? 'bg-amber-500 hover:bg-amber-600 text-white shadow-amber-500/20'
                                                    : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-500/20'}`}
                                            >
                                                {inProgress ? 'Resume Exam' : 'Start Exam'} <Play size={16} fill="currentColor" />
                                            </Link>
                                        )}
                                    </div>
                                </div>
                            );
                        })
                    ) : (
                        <div className="col-span-full py-20 text-center">
                            <div className="bg-white dark:bg-slate-800 rounded-3xl p-12 shadow-sm border border-slate-200 dark:border-slate-700 max-w-lg mx-auto">
                                <div className="w-20 h-20 bg-indigo-50 dark:bg-indigo-900/20 rounded-full flex items-center justify-center mx-auto mb-6">
                                    <FileText className="w-10 h-10 text-indigo-400" />
                                </div>
                                <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-2">No Exams Available</h3>
                                <p className="text-slate-500 dark:text-slate-400 mb-8">
                                    There are no exams scheduled for your class at the moment. Please check back later or contact your administrator.
                                </p>
                                <button onClick={() => window.location.reload()} className="text-indigo-600 font-bold hover:underline">
                                    Refresh Page
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </StudentLayout>
    );
}
