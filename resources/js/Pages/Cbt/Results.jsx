import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';
import Card from '@/Components/Card';
import { ArrowLeft, UserCircle, CheckCircle, Clock } from 'lucide-react';

export default function Results({ auth, exam }) {
    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center gap-4">
                    <Link href={route('cbt.exams.index')} className="p-2 bg-white dark:bg-slate-800 rounded-lg hover:text-indigo-500 transition-colors">
                        <ArrowLeft size={20} />
                    </Link>
                    <div>
                        <h2 className="text-xl font-bold text-slate-800 dark:text-white">Exam Results</h2>
                        <p className="text-sm text-slate-500">{exam.title}</p>
                    </div>
                </div>
            }
        >
            <Head title={`Results - ${exam.title}`} />

            <Card>
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-slate-200 dark:border-slate-800">
                                <th className="p-4 text-sm font-semibold text-slate-500">Student</th>
                                <th className="p-4 text-sm font-semibold text-slate-500">Score</th>
                                <th className="p-4 text-sm font-semibold text-slate-500">Grade</th>
                                <th className="p-4 text-sm font-semibold text-slate-500">Submitted At</th>
                                <th className="p-4 text-sm font-semibold text-slate-500">Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {exam.attempts && exam.attempts.length > 0 ? (
                                exam.attempts.map(attempt => (
                                    <tr key={attempt.id} className="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50/50">
                                        <td className="p-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center">
                                                    <UserCircle size={16} className="text-slate-500" />
                                                </div>
                                                <div>
                                                    <div className="font-medium text-slate-700 dark:text-slate-200">{attempt.student?.surname} {attempt.student?.othername}</div>
                                                    <div className="text-xs text-slate-400">{attempt.student?.registration_number}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-4 font-bold text-slate-700 dark:text-slate-200">
                                            {attempt.score_obtained} / {exam.total_marks}
                                        </td>
                                        <td className="p-4">
                                            {/* Could calculate grade dynamically or store it */}
                                            {Math.round((attempt.score_obtained / exam.total_marks) * 100)}%
                                        </td>
                                        <td className="p-4 text-sm text-slate-500">
                                            {new Date(attempt.submitted_at).toLocaleString()}
                                        </td>
                                        <td className="p-4">
                                            <span className="px-2 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-700">
                                                {attempt.status}
                                            </span>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="5" className="p-8 text-center text-slate-500">
                                        No attempts recorded yet.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </Card>
        </AuthenticatedLayout>
    );
}
