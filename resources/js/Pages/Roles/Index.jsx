import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import PrimaryButton from '@/Components/PrimaryButton';
import Card from '@/Components/Card';
import { Shield, Plus, Edit2, Trash2, CheckCircle2 } from 'lucide-react';
import Swal from 'sweetalert2';

export default function Index({ auth, roles }) {
    const { delete: destroy } = useForm();

    const deleteRole = (id) => {
        Swal.fire({
            title: 'Delete Role?',
            text: "Are you sure you want to delete this role? This might affect system access for users assigned to it.",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#e11d48', // Rose 600
            cancelButtonColor: '#64748b', // Slate 500
            confirmButtonText: 'Yes, delete it!',
            background: document.documentElement.classList.contains('dark') ? '#1e293b' : '#fff',
            color: document.documentElement.classList.contains('dark') ? '#f8fafc' : '#1e293b',
        }).then((result) => {
            if (result.isConfirmed) {
                destroy(route('roles.destroy', id));
            }
        });
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center justify-between">
                    <div className="flex flex-col gap-1">
                        <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">System Roles</h2>
                        <p className="text-slate-600 dark:text-slate-400 text-sm">Define access levels and assign permissions.</p>
                    </div>
                    <Link href={route('roles.create')}>
                        <PrimaryButton className="gap-2">
                            <Plus size={18} />
                            Create Role
                        </PrimaryButton>
                    </Link>
                </div>
            }
        >
            <Head title="Roles & Permissions" />

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {roles.map((role) => (
                    <Card key={role.id}
                        title={
                            <div className="flex items-center gap-2">
                                <Shield className="text-indigo-400" size={20} />
                                <span>{role.name}</span>
                            </div>
                        }
                    >
                        <div className="space-y-4">
                            <div className="flex flex-wrap gap-2">
                                {role.permissions.map((permission) => (
                                    <span key={permission.id} className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-500/20 text-indigo-600 border-indigo-500/30 dark:bg-indigo-500/10 dark:text-indigo-400 dark:border-indigo-500/20 border">
                                        <CheckCircle2 size={10} />
                                        {permission.name}
                                    </span>
                                ))}
                                {role.permissions.length === 0 && (
                                    <span className="text-slate-500 text-xs italic">No permissions assigned</span>
                                )}
                            </div>

                            <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-800/50">
                                <Link href={route('roles.edit', role.id)} className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-indigo-500 hover:border-indigo-500 dark:hover:bg-slate-700 hover:text-white dark:hover:text-white transition-all shadow-sm">
                                    <Edit2 size={18} />
                                </Link>
                                {role.name !== 'Super Admin' && (
                                    <button
                                        onClick={() => deleteRole(role.id)}
                                        className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-rose-500 dark:text-rose-400 hover:bg-rose-500 hover:border-rose-500 hover:text-white transition-all shadow-sm"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                )}
                            </div>
                        </div>
                    </Card>
                ))}
            </div>
        </AuthenticatedLayout>
    );
}
