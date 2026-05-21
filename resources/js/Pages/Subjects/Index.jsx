import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import Card from '@/Components/Card';
import PrimaryButton from '@/Components/PrimaryButton';
import { BookOpen, Pencil, Trash2, Plus, Code2 } from 'lucide-react';
import Swal from 'sweetalert2';

export default function Index({ auth, subjects }) {
    const { delete: destroy } = useForm();

    const handleDelete = (id) => {
        Swal.fire({
            title: 'Delete Subject?',
            text: "Are you sure you want to delete this subject? It may affect existing results and records.",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#e11d48', // Rose 600
            cancelButtonColor: '#64748b', // Slate 500
            confirmButtonText: 'Yes, delete it!',
            background: document.documentElement.classList.contains('dark') ? '#1e293b' : '#fff',
            color: document.documentElement.classList.contains('dark') ? '#f8fafc' : '#1e293b',
        }).then((result) => {
            if (result.isConfirmed) {
                destroy(route('subjects.destroy', id));
            }
        });
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex flex-col gap-1">
                    <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Subjects</h2>
                    <p className="text-slate-600 dark:text-slate-400 text-sm">Manage the curriculum and departmental courses.</p>
                </div>
            }
        >
            <Head title="Subjects" />

            <Card
                title="Curriculum Registry"
                description={`Currently managing ${subjects.length} academic subjects.`}
                actions={
                    (auth.user.roles.includes('Super Admin') || auth.user.permissions.includes('create subject')) && (
                        <Link href={route('subjects.create')}>
                            <PrimaryButton className="gap-2">
                                <Plus size={18} />
                                Add New Subject
                            </PrimaryButton>
                        </Link>
                    )
                }
            >
                <div className="overflow-x-auto -mx-6">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-slate-300 dark:border-slate-800/50 bg-slate-50 dark:bg-slate-900/30">
                                <th className="px-6 py-4 text-[10px] font-bold text-slate-700 dark:text-slate-500 uppercase tracking-widest">Subject Name</th>
                                <th className="px-6 py-4 text-[10px] font-bold text-slate-700 dark:text-slate-500 uppercase tracking-widest">Subject Code</th>
                                <th className="px-6 py-4 text-[10px] font-bold text-slate-700 dark:text-slate-500 uppercase tracking-widest">Status</th>
                                <th className="px-6 py-4 text-[10px] font-bold text-slate-700 dark:text-slate-500 uppercase tracking-widest text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200 dark:divide-slate-800/30">
                            {subjects.map((subject) => (
                                <tr key={subject.id} className="group hover:bg-indigo-50/50 dark:hover:bg-slate-800/20 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 font-bold">
                                                <BookOpen size={18} />
                                            </div>
                                            <div>
                                                <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">{subject.name}</p>
                                                <p className="text-[10px] text-slate-500 capitalize">{subject.type} Curriculum</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2">
                                            <Code2 size={12} className="text-slate-500" />
                                            <span className="text-sm font-mono text-slate-400">{subject.code || 'N/A'}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex items-center px-2 py-0.5 rounded-lg border text-[10px] font-bold uppercase ${subject.type === 'core'
                                            ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20'
                                            : 'bg-purple-500/10 text-purple-400 border-purple-500/20'
                                            }`}>
                                            {subject.type}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            {(auth.user.roles.includes('Super Admin') || auth.user.permissions.includes('manage subject')) && (
                                                <>
                                                    <Link
                                                        href={route('subjects.edit', subject.id)}
                                                        className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-blue-500 hover:border-blue-500 dark:hover:bg-slate-700 hover:text-white dark:hover:text-white transition-all shadow-sm"
                                                        title="Edit Subject"
                                                    >
                                                        <Pencil size={18} />
                                                    </Link>

                                                    <button
                                                        onClick={() => handleDelete(subject.id)}
                                                        className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-rose-500 dark:text-rose-400 hover:bg-rose-500 hover:border-rose-500 hover:text-white transition-all shadow-sm"
                                                        title="Delete Subject"
                                                    >
                                                        <Trash2 size={18} />
                                                    </button>
                                                </>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </Card>
        </AuthenticatedLayout>
    );
}
