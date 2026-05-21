import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';
import Card from '@/Components/Card';
import { ArrowLeft, Pencil, Trash2, User, Phone, MapPin, Calendar, Hash, ShieldCheck, GraduationCap, Mail, Info, Clock, BadgeCheck, Save, FileSpreadsheet } from 'lucide-react';
import Swal from 'sweetalert2';
import { toast } from 'react-toastify';

export default function Show({ auth, student }) {
    const deleteStudent = (id) => {
        Swal.fire({
            title: 'Delete Student Record?',
            text: "This action is permanent and will remove all student data.",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#ef4444',
            cancelButtonColor: '#334155',
            confirmButtonText: 'Yes, delete it!',
            background: '#0f172a',
            color: '#f1f5f9',
            customClass: {
                popup: 'rounded-[1.5rem] border border-slate-800 shadow-2xl',
                confirmButton: 'rounded-xl px-6 py-2.5 font-bold uppercase tracking-widest text-xs transition-all',
                cancelButton: 'rounded-xl px-6 py-2.5 font-bold uppercase tracking-widest text-xs transition-all'
            }
        }).then((result) => {
            if (result.isConfirmed) {
                router.delete(route('students.destroy', id), {
                    onSuccess: () => {
                        router.visit(route('students.index'));
                    },
                });
            }
        });
    };

    const getStatusStyle = (status) => {
        switch (status) {
            case 'active': return 'bg-emerald-500/20 text-emerald-700 border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20';
            case 'inactive': return 'bg-rose-500/20 text-rose-700 border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-400 dark:border-rose-500/20';
            case 'graduated': return 'bg-indigo-500/20 text-indigo-700 border-indigo-500/30 dark:bg-indigo-500/10 dark:text-indigo-400 dark:border-indigo-500/20';
            default: return 'bg-slate-500/20 text-slate-700 border-slate-500/30 dark:bg-slate-500/10 dark:text-slate-400 dark:border-slate-500/20';
        }
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center gap-4">
                    <Link href={route('students.index')} className="p-2 text-slate-600 dark:text-slate-400 hover:text-white hover:bg-indigo-600 dark:hover:bg-slate-800 rounded-xl transition-all">
                        <ArrowLeft size={20} />
                    </Link>
                    <div className="flex flex-col gap-1">
                        <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Student Profile</h2>
                        <p className="text-slate-600 dark:text-slate-400 text-sm">Detailed academic and personal record for {student.surname} {student.othername}.</p>
                    </div>
                </div>
            }
        >
            <Head title={`${student.surname} ${student.othername} - Profile`} />

            <div className="max-w-6xl space-y-8 pb-12">
                {/* Hero Header Card */}
                <div className="relative isolate overflow-hidden bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800/60 rounded-[2.5rem] p-8 lg:p-12">
                    <div className="absolute inset-0 -z-10 bg-[radial-gradient(45%_45%_at_50%_50%,rgba(99,102,241,0.08)_0,transparent_100%)] dark:bg-[radial-gradient(45%_45%_at_50%_50%,rgba(99,102,241,0.1)_0,transparent_100%)]"></div>

                    <div className="flex flex-col md:flex-row gap-10 items-center">
                        <div className="relative">
                            <div className="w-48 h-48 rounded-[3rem] bg-slate-100 dark:bg-slate-950 border-2 border-slate-300 dark:border-slate-800 overflow-hidden shadow-2xl flex items-center justify-center">
                                {student.profile_picture ? (
                                    <img src={`/storage/${student.profile_picture}`} alt="Profile" className="w-full h-full object-cover" />
                                ) : (
                                    <User size={64} className="text-slate-400 dark:text-slate-800" />
                                )}
                            </div>
                            <div className="absolute -bottom-2 -right-2 w-10 h-10 rounded-2xl bg-indigo-500 border-4 border-white dark:border-slate-900 flex items-center justify-center text-white shadow-xl">
                                <BadgeCheck size={20} />
                            </div>
                        </div>

                        <div className="flex-1 text-center md:text-left space-y-4">
                            <div className="space-y-1">
                                <div className="flex flex-wrap items-center justify-center md:justify-start gap-4">
                                    <h1 className="text-4xl font-black tracking-tight text-slate-900 dark:text-white">{student.surname} {student.othername}</h1>
                                    <span className={`px-4 py-1.5 rounded-2xl border text-[10px] font-black uppercase tracking-widest ${getStatusStyle(student.status)}`}>
                                        {student.status}
                                    </span>
                                </div>
                                <div className="flex items-center justify-center md:justify-start gap-4 text-slate-600 dark:text-slate-400">
                                    <div className="flex items-center gap-1.5">
                                        <Hash size={14} className="text-indigo-600 dark:text-indigo-400" />
                                        <span className="font-mono text-sm tracking-tight">{student.registration_number}</span>
                                    </div>
                                    <div className="w-1 h-1 rounded-full bg-slate-400 dark:bg-slate-800"></div>
                                    <div className="flex items-center gap-1.5">
                                        <GraduationCap size={14} className="text-emerald-600 dark:text-emerald-400" />
                                        <span className="text-sm font-bold">{student.class_section?.school_class?.name || 'Class Unknown'} • {student.class_section?.class_arm?.name || 'Arm Unknown'}</span>
                                    </div>
                                </div>
                            </div>

                            {(auth.user.roles.includes('Super Admin') || auth.user.permissions.includes('manage student')) && (
                                <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">

                                    <Link href={route('students.edit', student.id)}>
                                        <button className="px-6 py-2.5 rounded-2xl bg-slate-100 dark:bg-white/5 hover:bg-indigo-600 dark:hover:bg-white/10 border border-slate-300 dark:border-white/10 text-slate-700 dark:text-white hover:text-white text-xs font-bold uppercase tracking-widest transition-all flex items-center gap-2">
                                            <Pencil size={14} />
                                            Edit Profile
                                        </button>
                                    </Link>
                                    <button
                                        onClick={() => deleteStudent(student.id)}
                                        className="px-6 py-2.5 rounded-2xl bg-rose-100 dark:bg-rose-500/10 hover:bg-rose-500 text-rose-700 dark:text-rose-500 hover:text-white border border-rose-300 dark:border-rose-500/20 text-xs font-bold uppercase tracking-widest transition-all flex items-center gap-2"
                                    >
                                        <Trash2 size={14} />
                                        Purge Record
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Column - Core Info */}
                    <div className="lg:col-span-2 space-y-8">
                        <Card title="Detailed Record" description="Official academic and identity data.">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 py-4">
                                <div className="space-y-1">
                                    <p className="text-[10px] font-bold text-slate-600 dark:text-slate-500 uppercase tracking-widest flex items-center gap-2">
                                        <Info size={12} className="text-indigo-600 dark:text-indigo-400" /> Full Name
                                    </p>
                                    <p className="text-lg font-bold text-slate-800 dark:text-slate-200 capitalize">{student.surname} {student.othername}</p>
                                </div>

                                <div className="space-y-1">
                                    <p className="text-[10px] font-bold text-slate-600 dark:text-slate-500 uppercase tracking-widest flex items-center gap-2">
                                        <Calendar size={12} className="text-indigo-600 dark:text-indigo-400" /> Date of Birth
                                    </p>
                                    <p className="text-lg font-bold text-slate-800 dark:text-slate-200">
                                        {student.date_of_birth ? new Date(student.date_of_birth).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }) : 'N/A'}
                                    </p>
                                </div>

                                <div className="space-y-1">
                                    <p className="text-[10px] font-bold text-slate-600 dark:text-slate-500 uppercase tracking-widest flex items-center gap-2">
                                        <ShieldCheck size={12} className="text-indigo-600 dark:text-indigo-400" /> Gender
                                    </p>
                                    <p className="text-lg font-bold text-slate-800 dark:text-slate-200 capitalize">{student.gender || 'N/A'}</p>
                                </div>

                                <div className="space-y-1">
                                    <p className="text-[10px] font-bold text-slate-600 dark:text-slate-500 uppercase tracking-widest flex items-center gap-2">
                                        <MapPin size={12} className="text-indigo-600 dark:text-indigo-400" /> Physical Address
                                    </p>
                                    <p className="text-slate-700 dark:text-slate-300 font-medium leading-relaxed">{student.address || 'No address provided'}</p>
                                </div>
                            </div>
                        </Card>

                        <Card title="Academic Home" description="Sectional placement and trajectory.">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 py-4">
                                <div className="flex items-center gap-4 p-5 rounded-3xl bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 group hover:bg-indigo-100 dark:hover:border-indigo-500/30 hover:border-indigo-300 transition-all">
                                    <div className="w-12 h-12 rounded-2xl bg-indigo-500/15 dark:bg-indigo-500/10 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                                        <GraduationCap size={24} />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-bold text-slate-600 dark:text-slate-500 uppercase tracking-widest">Class</p>
                                        <p className="text-lg font-black text-slate-900 dark:text-white">{student.class_section?.school_class?.name || 'Unassigned'}</p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-4 p-5 rounded-3xl bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 group hover:bg-emerald-100 dark:hover:border-emerald-500/30 hover:border-emerald-300 transition-all">
                                    <div className="w-12 h-12 rounded-2xl bg-emerald-500/15 dark:bg-emerald-500/10 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                                        <ShieldCheck size={24} />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-bold text-slate-600 dark:text-slate-500 uppercase tracking-widest">Section / Arm</p>
                                        <p className="text-lg font-black text-slate-900 dark:text-white">{student.class_section?.class_arm?.name || 'Unassigned'}</p>
                                    </div>
                                </div>
                            </div>
                        </Card>
                    </div>

                    {/* Right Column - Guardian & Temporal info */}
                    <div className="lg:col-span-1 space-y-8">
                        <Card title="Guardian Details" description="Emergency contact channel.">
                            <div className="space-y-6 py-4">
                                <div className="flex items-start gap-4">
                                    <div className="p-3 bg-slate-100 dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-500">
                                        <User size={18} />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-bold text-slate-600 dark:text-slate-500 uppercase tracking-widest">Guardian Name</p>
                                        <p className="text-sm font-bold text-slate-800 dark:text-slate-200 mt-1">{student.guardian_name || 'Not Listed'}</p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-4">
                                    <div className="p-3 bg-slate-100 dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-500">
                                        <Phone size={18} />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-bold text-slate-600 dark:text-slate-500 uppercase tracking-widest">Contact Phone</p>
                                        <p className="text-sm font-bold text-slate-800 dark:text-slate-200 mt-1">{student.guardian_number || 'Not Listed'}</p>
                                    </div>
                                </div>
                            </div>
                        </Card>

                        <Card title="Metadata" description="System timestamps.">
                            <div className="space-y-4 py-2">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2 text-[10px] font-bold text-slate-600 dark:text-slate-500 uppercase tracking-widest">
                                        <Clock size={12} /> Registered On
                                    </div>
                                    <span className="text-xs font-mono text-slate-700 dark:text-slate-400">{new Date(student.created_at).toLocaleDateString()}</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2 text-[10px] font-bold text-slate-600 dark:text-slate-500 uppercase tracking-widest">
                                        <Save size={12} /> Last Updated
                                    </div>
                                    <span className="text-xs font-mono text-slate-700 dark:text-slate-400">{new Date(student.updated_at).toLocaleDateString()}</span>
                                </div>
                            </div>
                        </Card>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}