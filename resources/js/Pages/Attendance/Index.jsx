import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';
import Card from '@/Components/Card';
import {
    Users,
    UserCheck,
    UserMinus,
    Calendar,
    History,
    ArrowRight,
    Search,
    BookOpen
} from 'lucide-react';

export default function Index({ auth, stats, sections }) {
    const user = auth.user;

    const statCards = [
        {
            name: 'Total Students',
            value: stats.total_students,
            icon: Users,
            color: 'text-indigo-600 dark:text-indigo-400',
            bg: 'bg-gradient-to-br from-indigo-500 to-purple-600',
            cardBg: 'bg-indigo-50/50 dark:bg-indigo-900/20',
        },
        {
            name: 'Present Today',
            value: stats.present_today,
            icon: UserCheck,
            color: 'text-emerald-600 dark:text-emerald-400',
            bg: 'bg-gradient-to-br from-emerald-500 to-teal-600',
            cardBg: 'bg-emerald-50/50 dark:bg-emerald-900/20',
        },
        {
            name: 'Absent Today',
            value: stats.absent_today,
            icon: UserMinus,
            color: 'text-rose-600 dark:text-rose-400',
            bg: 'bg-gradient-to-br from-rose-500 to-pink-600',
            cardBg: 'bg-rose-50/50 dark:bg-rose-900/20',
        },
    ];

    return (
        <AuthenticatedLayout
            header={
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h2 className="text-3xl font-black tracking-tight bg-gradient-to-r from-slate-900 via-indigo-900 to-slate-800 dark:from-white dark:via-indigo-200 dark:to-slate-100 bg-clip-text text-transparent">
                            Attendance Management
                        </h2>
                        <p className="text-slate-600 dark:text-slate-400 text-sm font-medium tracking-wide mt-1">
                            Track and monitor student daily presence.
                        </p>
                    </div>
                </div>
            }
        >
            <Head title="Attendance" />

            <div className="space-y-8">
                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {statCards.map((stat) => (
                        <Card key={stat.name} className={`relative overflow-hidden border-none ${stat.cardBg} shadow-xl hover:shadow-2xl transition-all duration-300 group`}>
                            <div className="flex items-center gap-4 relative z-10">
                                <div className={`p-4 rounded-2xl ${stat.bg} shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                                    <stat.icon size={24} className="text-white" />
                                </div>
                                <div>
                                    <p className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">{stat.name}</p>
                                    <h3 className="text-3xl font-black text-slate-900 dark:text-white leading-tight">{stat.value}</h3>
                                </div>
                            </div>
                            <div className={`absolute bottom-0 right-0 w-32 h-32 ${stat.bg} opacity-5 rounded-full -mr-16 -mb-16 blur-2xl group-hover:opacity-10 transition-opacity`}></div>
                        </Card>
                    ))}
                </div>

                {/* Quick Actions & Class Sections */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Column: Quick Actions */}
                    <div className="space-y-6">
                        <Card className="!p-6 bg-gradient-to-br from-slate-900 to-indigo-950 border-none shadow-2xl relative overflow-hidden group">
                            <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500/10 via-transparent to-transparent"></div>
                            <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2 relative z-10">
                                <Calendar size={20} className="text-indigo-400" />
                                Quick Actions
                            </h3>

                            <div className="space-y-3 relative z-10">
                                <Link
                                    href={route('attendance.take')}
                                    className="w-full flex items-center justify-between p-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl transition-all group/btn"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-indigo-500/20 rounded-xl">
                                            <Calendar size={18} className="text-indigo-400" />
                                        </div>
                                        <span className="text-sm font-bold text-white tracking-wide">Take Attendance</span>
                                    </div>
                                    <ArrowRight size={18} className="text-white/30 group-hover/btn:translate-x-1 group-hover/btn:text-indigo-400 transition-all" />
                                </Link>

                                <Link
                                    href={route('attendance.history')}
                                    className="w-full flex items-center justify-between p-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl transition-all group/btn"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-purple-500/20 rounded-xl">
                                            <History size={18} className="text-purple-400" />
                                        </div>
                                        <span className="text-sm font-bold text-white tracking-wide">View History</span>
                                    </div>
                                    <ArrowRight size={18} className="text-white/30 group-hover/btn:translate-x-1 group-hover/btn:text-purple-400 transition-all" />
                                </Link>
                            </div>
                        </Card>

                        <Card className="!p-6 border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden relative">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full blur-3xl -mr-16 -mt-16"></div>
                            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                                <Search size={18} className="text-indigo-500" />
                                Attendance Tips
                            </h3>
                            <div className="space-y-4">
                                <div className="flex gap-3">
                                    <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full mt-2 shrink-0"></div>
                                    <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed font-medium">
                                        Attendance should be taken daily before classes begin to ensure accurate tracking.
                                    </p>
                                </div>
                                <div className="flex gap-3">
                                    <div className="w-1.5 h-1.5 bg-purple-500 rounded-full mt-2 shrink-0"></div>
                                    <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed font-medium">
                                        You can mark students as Late or Absent with optional remarks for parent notifications.
                                    </p>
                                </div>
                            </div>
                        </Card>
                    </div>

                    {/* Right Column: Your Classes */}
                    <div className="lg:col-span-2">
                        <Card className="!p-0 border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden h-full">
                            <div className="p-6 border-b border-slate-100 dark:border-slate-800/60 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/50">
                                <div>
                                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                                        {user.roles.includes('Super Admin') || user.roles.includes('Admin') ? 'Active Class Sections' : 'Your Form Classes'}
                                    </h3>
                                    <p className="text-xs text-slate-500 font-medium">Select a class to manage its attendance records.</p>
                                </div>
                                <div className="p-2 bg-indigo-500/10 rounded-xl">
                                    <BookOpen size={20} className="text-indigo-500" />
                                </div>
                            </div>

                            <div className="p-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {sections.map((section) => (
                                        <div
                                            key={section.id}
                                            className="group relative p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl hover:border-indigo-500 dark:hover:border-indigo-400 transition-all duration-300 shadow-sm hover:shadow-lg overflow-hidden"
                                        >
                                            <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>

                                            <div className="flex items-start justify-between relative z-10">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-12 h-12 rounded-xl bg-indigo-100 dark:bg-indigo-900/40 flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-black text-xl shadow-inner">
                                                        {section.class_arm?.name?.charAt(0) || section.school_class?.name?.charAt(0)}
                                                    </div>
                                                    <div>
                                                        <h4 className="font-black text-slate-900 dark:text-white tracking-tight">
                                                            {section.school_class?.name} {section.class_arm?.name !== 'No arm' && section.class_arm?.name}
                                                        </h4>
                                                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-0.5">
                                                            {section.school_class?.level_name || 'Academic Class'}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="mt-6 flex items-center gap-2 relative z-10">
                                                <Link
                                                    href={route('attendance.take', { class_section_id: section.id })}
                                                    className="flex-1 text-center py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-indigo-500/20 active:scale-95"
                                                >
                                                    Take Today
                                                </Link>
                                                <Link
                                                    href={route('attendance.history', { class_section_id: section.id })}
                                                    className="px-4 py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-xl text-xs font-bold transition-all active:scale-95"
                                                >
                                                    History
                                                </Link>
                                            </div>
                                        </div>
                                    ))}

                                    {sections.length === 0 && (
                                        <div className="col-span-full py-12 flex flex-col items-center justify-center text-slate-500 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-3xl">
                                            <Users size={48} className="opacity-20 mb-4" />
                                            <p className="text-sm font-bold tracking-wide">No classes assigned to you.</p>
                                            <p className="text-xs mt-1">Contact your admin to be assigned a form class.</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </Card>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
