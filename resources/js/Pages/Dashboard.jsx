import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, usePage } from '@inertiajs/react';
import Card from '@/Components/Card';
import {
    Users,
    GraduationCap,
    BookOpen,
    TrendingUp,
    Calendar,
    Clock,
    UserCheck,
    UserMinus,
    ArrowUpRight,
    Activity
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, Legend } from 'recharts';
import Pagination from '@/Components/Pagination';

export default function Dashboard({ auth, stats, activity_log, enrollment_chart, class_population, teacher_info }) {
    const user = auth.user;
    const canViewStats = user.roles.includes('Super Admin') || user.permissions.includes('view dashboard stats');
    const canViewCharts = user.roles.includes('Super Admin') || user.permissions.includes('view dashboard charts');
    const canViewActivity = user.roles.includes('Super Admin') || user.permissions.includes('view activity log');

    const statCards = [
        {
            name: 'Total Students',
            value: stats.total_students,
            icon: Users,
            color: 'text-indigo-600 dark:text-indigo-400',
            bg: 'bg-gradient-to-br from-indigo-500 to-purple-600',
            cardBg: 'bg-indigo-50/50 dark:bg-indigo-900/20',
            borderAccent: 'border-indigo-200 dark:border-indigo-500/30'
        },
        {
            name: 'Active Students',
            value: stats.active_students,
            icon: UserCheck,
            color: 'text-emerald-600 dark:text-emerald-400',
            bg: 'bg-gradient-to-br from-emerald-500 to-teal-600',
            cardBg: 'bg-emerald-50/50 dark:bg-emerald-900/20',
            borderAccent: 'border-emerald-200 dark:border-emerald-500/30'
        },
        {
            name: 'Inactive Students',
            value: stats.inactive_students,
            icon: UserMinus,
            color: 'text-amber-600 dark:text-amber-400',
            bg: 'bg-gradient-to-br from-amber-500 to-orange-600',
            cardBg: 'bg-amber-50/50 dark:bg-amber-900/20',
            borderAccent: 'border-amber-200 dark:border-amber-500/30'
        },
        {
            name: 'Graduated',
            value: stats.graduated_students,
            icon: GraduationCap,
            color: 'text-purple-600 dark:text-purple-400',
            bg: 'bg-gradient-to-br from-purple-500 to-pink-600',
            cardBg: 'bg-purple-50/50 dark:bg-purple-900/20',
            borderAccent: 'border-purple-200 dark:border-purple-500/30'
        },
        {
            name: 'Staff',
            value: stats.staff_count,
            icon: BookOpen,
            color: 'text-sky-600 dark:text-sky-400',
            bg: 'bg-gradient-to-br from-sky-500 to-blue-600',
            cardBg: 'bg-sky-50/50 dark:bg-sky-900/20',
            borderAccent: 'border-sky-200 dark:border-sky-500/30'
        },
    ];
    
    return (
        <AuthenticatedLayout
            header={
                <div className="flex flex-col gap-2 relative">
                    <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/5 via-purple-500/5 to-pink-500/5 dark:from-indigo-500/10 dark:via-purple-500/10 dark:to-pink-500/10 -mx-6 rounded-3xl"></div>
                    <h2 className="text-3xl font-black tracking-tight bg-gradient-to-r from-slate-900 via-indigo-900 to-slate-800 dark:from-white dark:via-indigo-200 dark:to-slate-100 bg-clip-text text-transparent relative z-10">
                        Welcome back, {user.name}
                    </h2>
                    <p className="text-slate-600 dark:text-slate-400 text-sm font-medium tracking-wide relative z-10">
                        Here's what's happening in your school today.
                    </p>

                    {teacher_info && (
                        <div className="mt-4 relative z-10 space-y-3">
                            {/* Form Teacher Display */}
                            {teacher_info.form_classes.length > 0 && (
                                <div className="flex items-center gap-2 p-3 bg-white/50 dark:bg-slate-800/50 rounded-xl border border-indigo-100 dark:border-indigo-900/30 backdrop-blur-sm w-fit">
                                    <div className="p-1.5 bg-indigo-100 dark:bg-indigo-900/50 rounded-lg">
                                        <Users size={16} className="text-indigo-600 dark:text-indigo-400" />
                                    </div>
                                    <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                                        You are the <span className="text-indigo-600 dark:text-indigo-400 font-bold">Form Teacher</span> for: {teacher_info.form_classes.join(', ')}
                                    </span>
                                </div>
                            )}

                            {/* Subject Teacher Display */}
                            {Object.keys(teacher_info.subject_assignments).length > 0 && (
                                <div className="flex flex-col gap-2 p-4 bg-white/50 dark:bg-slate-800/50 rounded-xl border border-purple-100 dark:border-purple-900/30 backdrop-blur-sm">
                                    <div className="flex items-center gap-2 mb-1">
                                        <div className="p-1.5 bg-purple-100 dark:bg-purple-900/50 rounded-lg">
                                            <BookOpen size={16} className="text-purple-600 dark:text-purple-400" />
                                        </div>
                                        <span className="text-sm font-bold text-slate-800 dark:text-white">Assigned Subjects</span>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                                        {Object.entries(teacher_info.subject_assignments).map(([className, subjects]) => (
                                            <div key={className} className="flex flex-col gap-1 p-3 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-700 shadow-sm">
                                                <span className="text-xs font-black text-slate-500 uppercase tracking-widest">{className}</span>
                                                <div className="flex flex-wrap gap-1.5">
                                                    {subjects.map((sub, idx) => (
                                                        <span key={idx} className="px-2 py-0.5 bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300 text-xs rounded-md font-medium border border-purple-100 dark:border-purple-800/30">
                                                            {sub}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            }
        >
            <Head title="Dashboard" />

            {/* Stats Grid */}
            {
                canViewStats && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
                        {statCards.map((stat, index) => (
                            <Card key={stat.name} className={`!p-0 border-2 ${stat.borderAccent} ${stat.cardBg} shadow-lg hover:shadow-xl transition-all duration-300 group overflow-hidden relative h-36`}>
                                <div className="absolute inset-0 bg-gradient-to-br from-white/40 to-transparent dark:from-white/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>

                                <div className="flex flex-col items-center h-full text-center relative z-10">
                                    <ArrowUpRight className="absolute top-3 right-3 w-4 h-4 text-slate-400 dark:text-slate-500 group-hover:text-indigo-500 dark:group-hover:text-indigo-400 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all duration-300" strokeWidth={2.5} />

                                    <div className="relative mb-3">
                                        <div className={`absolute inset-0 ${stat.bg} rounded-2xl blur-lg opacity-40 group-hover:opacity-60 transition-opacity`}></div>
                                        <div className={`relative p-2.5 rounded-2xl ${stat.bg} shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                                            <stat.icon className="w-5 h-5 text-white drop-shadow-md" strokeWidth={2.5} />
                                        </div>
                                    </div>

                                    <div>
                                        <h3 className="text-slate-500 dark:text-slate-400 text-[11px] font-bold uppercase tracking-widest leading-tight mb-1">{stat.name}</h3>
                                        <p className="text-3xl font-black text-slate-900 dark:text-white tracking-tight leading-none">{stat.value}</p>
                                    </div>
                                </div>
                                <div className={`absolute bottom-0 left-0 right-0 h-1.5 ${stat.bg} opacity-0 group-hover:opacity-100 transition-opacity`}></div>
                            </Card>
                        ))}
                    </div>
                )
            }

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Charts Section */}
                {canViewCharts && (
                    <div className="lg:col-span-2 space-y-6">
                        <Card
                            title="Student Enrollment"
                            description="Registration trends across academic sessions."
                            className="!bg-gradient-to-br from-white via-slate-50/50 to-white dark:from-slate-900 dark:via-slate-800/50 dark:to-slate-900 !border-slate-200/60 dark:!border-slate-700/40 shadow-xl hover:shadow-2xl transition-all duration-300 overflow-hidden relative group"
                        >
                            <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 via-purple-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                            <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-indigo-500/10 to-purple-500/10 rounded-full blur-3xl opacity-0 group-hover:opacity-50 transition-opacity -mr-32 -mt-32"></div>

                            <div className="h-[350px] w-full mt-6 relative z-10">
                                {enrollment_chart && enrollment_chart.length > 0 ? (
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={enrollment_chart} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                            <defs>
                                                <linearGradient id="barGradient1" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="0%" stopColor="#6366f1" stopOpacity={1} />
                                                    <stop offset="100%" stopColor="#8b5cf6" stopOpacity={0.8} />
                                                </linearGradient>
                                                <linearGradient id="barGradient2" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="0%" stopColor="#818cf8" stopOpacity={1} />
                                                    <stop offset="100%" stopColor="#a78bfa" stopOpacity={0.8} />
                                                </linearGradient>
                                            </defs>
                                            <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.3} vertical={false} />
                                            <XAxis
                                                dataKey="session"
                                                stroke="#64748b"
                                                fontSize={12}
                                                fontWeight={600}
                                                tickLine={false}
                                                axisLine={false}
                                            />
                                            <YAxis
                                                stroke="#64748b"
                                                fontSize={12}
                                                fontWeight={600}
                                                tickLine={false}
                                                axisLine={false}
                                            />
                                            <Tooltip
                                                contentStyle={{
                                                    backgroundColor: '#0f172a',
                                                    borderColor: '#334155',
                                                    borderRadius: '12px',
                                                    color: '#f8fafc',
                                                    boxShadow: '0 10px 40px rgba(0,0,0,0.3)',
                                                    border: '1px solid rgba(99, 102, 241, 0.3)'
                                                }}
                                                itemStyle={{ color: '#fff', fontWeight: 600 }}
                                                cursor={{ fill: '#1e293b', opacity: 0.4, radius: 8 }}
                                            />
                                            <Bar dataKey="students" radius={[8, 8, 0, 0]}>
                                                {enrollment_chart.map((entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={index % 2 === 0 ? 'url(#barGradient1)' : 'url(#barGradient2)'} />
                                                ))}
                                            </Bar>
                                        </BarChart>
                                    </ResponsiveContainer>
                                ) : (
                                    <div className="h-full flex flex-col items-center justify-center text-slate-500 gap-3 border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-2xl bg-slate-50/50 dark:bg-slate-800/30">
                                        <div className="relative">
                                            <div className="absolute inset-0 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl blur-xl opacity-20"></div>
                                            <div className="relative p-4 bg-slate-100 dark:bg-slate-800 rounded-2xl">
                                                <TrendingUp size={40} className="opacity-30 text-slate-400" strokeWidth={2} />
                                            </div>
                                        </div>
                                        <p className="text-sm font-semibold">No enrollment data available.</p>
                                    </div>
                                )}
                            </div>
                        </Card>

                        <Card
                            title="Class Population"
                            description="Active vs Inactive students per class."
                            className="!bg-gradient-to-br from-white via-slate-50/50 to-white dark:from-slate-900 dark:via-slate-800/50 dark:to-slate-900 !border-slate-200/60 dark:!border-slate-700/40 shadow-xl hover:shadow-2xl transition-all duration-300 overflow-hidden relative group"
                        >
                            <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 via-teal-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                            <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-emerald-500/10 to-teal-500/10 rounded-full blur-3xl opacity-0 group-hover:opacity-50 transition-opacity -mr-32 -mt-32"></div>

                            <div className="h-[400px] w-full mt-6 relative z-10">
                                {class_population && class_population.length > 0 ? (
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={class_population} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                            <defs>
                                                <linearGradient id="activeGradient" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="0%" stopColor="#10b981" stopOpacity={1} />
                                                    <stop offset="100%" stopColor="#14b8a6" stopOpacity={0.8} />
                                                </linearGradient>
                                                <linearGradient id="inactiveGradient" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="0%" stopColor="#f59e0b" stopOpacity={1} />
                                                    <stop offset="100%" stopColor="#f97316" stopOpacity={0.8} />
                                                </linearGradient>
                                            </defs>
                                            <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.3} vertical={false} />
                                            <XAxis dataKey="name" stroke="#64748b" fontSize={10} fontWeight={600} tickLine={false} axisLine={false} interval={0} />
                                            <YAxis stroke="#64748b" fontSize={12} fontWeight={600} tickLine={false} axisLine={false} />
                                            <Tooltip
                                                contentStyle={{
                                                    backgroundColor: '#0f172a',
                                                    borderColor: '#334155',
                                                    borderRadius: '12px',
                                                    color: '#f8fafc',
                                                    boxShadow: '0 10px 40px rgba(0,0,0,0.3)',
                                                    border: '1px solid rgba(16, 185, 129, 0.3)'
                                                }}
                                                itemStyle={{ fontWeight: 600 }}
                                                cursor={{ fill: '#1e293b', opacity: 0.4 }}
                                            />
                                            <Legend
                                                wrapperStyle={{ paddingTop: '20px', fontWeight: 600 }}
                                                iconType="circle"
                                            />
                                            <Bar dataKey="active" stackId="a" fill="url(#activeGradient)" radius={[0, 0, 8, 8]} name="Active" />
                                            <Bar dataKey="inactive" stackId="a" fill="url(#inactiveGradient)" radius={[8, 8, 0, 0]} name="Inactive" />
                                        </BarChart>
                                    </ResponsiveContainer>
                                ) : (
                                    <div className="h-full flex flex-col items-center justify-center text-slate-500 gap-3 border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-2xl bg-slate-50/50 dark:bg-slate-800/30">
                                        <div className="relative">
                                            <div className="absolute inset-0 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl blur-xl opacity-20"></div>
                                            <div className="relative p-4 bg-slate-100 dark:bg-slate-800 rounded-2xl">
                                                <Users size={40} className="opacity-30 text-slate-400" strokeWidth={2} />
                                            </div>
                                        </div>
                                        <p className="text-sm font-semibold">No class data available.</p>
                                    </div>
                                )}
                            </div>
                        </Card>
                    </div>
                )}

                {/* Sidebar Cards */}
                <div className="space-y-6">
                    {canViewActivity && (
                        <Card
                            title="Activity Log"
                            description="Recent system updates."
                            className="!bg-gradient-to-br from-white via-slate-50/50 to-white dark:from-slate-900 dark:via-slate-800/50 dark:to-slate-900 !border-slate-200/60 dark:!border-slate-700/40 shadow-xl hover:shadow-2xl transition-all duration-300 overflow-hidden relative group"
                        >
                            <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>

                            <div className="space-y-0 mt-4 relative z-10">
                                {activity_log?.data?.length > 0 ? (
                                    activity_log.data.map((log, index) => (
                                        <div key={index} className="flex gap-4 p-4 border-b border-slate-200/60 dark:border-slate-800/50 last:border-0 hover:bg-gradient-to-r hover:from-slate-50 hover:to-transparent dark:hover:from-slate-800/40 dark:hover:to-transparent transition-all duration-200 rounded-lg group/item">
                                            <div className="mt-1">
                                                <div className="relative">
                                                    <div className={`absolute inset-0 rounded-full blur-md opacity-0 group-hover/item:opacity-40 transition-opacity ${log.category === 'Registration'
                                                        ? 'bg-gradient-to-br from-emerald-500 to-teal-600'
                                                        : 'bg-gradient-to-br from-indigo-500 to-purple-600'
                                                        }`}></div>
                                                    <div className={`relative w-10 h-10 rounded-xl flex items-center justify-center shadow-lg group-hover/item:scale-110 transition-transform duration-300 ${log.category === 'Registration'
                                                        ? 'bg-gradient-to-br from-emerald-500 to-teal-600'
                                                        : 'bg-gradient-to-br from-indigo-500 to-purple-600'
                                                        }`}>
                                                        <Activity size={18} className="text-white drop-shadow-lg" strokeWidth={2.5} />
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <p className="text-sm font-semibold text-slate-700 dark:text-slate-200 line-clamp-2 mb-2">{log.description}</p>
                                                <div className="flex items-center gap-2">
                                                    <div className="px-2 py-1 bg-slate-100 dark:bg-slate-800 rounded-lg">
                                                        <span className="text-[10px] text-slate-600 dark:text-slate-400 font-mono font-semibold">{log.time}</span>
                                                    </div>
                                                    <div className="w-1 h-1 bg-slate-400 dark:bg-slate-600 rounded-full"></div>
                                                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-500">{log.category}</span>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="flex flex-col items-center justify-center py-12 gap-3">
                                        <div className="relative">
                                            <div className="absolute inset-0 bg-gradient-to-br from-slate-400 to-slate-500 rounded-2xl blur-xl opacity-20"></div>
                                            <div className="relative p-4 bg-slate-100 dark:bg-slate-800 rounded-2xl">
                                                <Activity size={32} className="opacity-30 text-slate-400" strokeWidth={2} />
                                            </div>
                                        </div>
                                        <p className="text-sm font-semibold text-slate-500">No recent activity.</p>
                                    </div>
                                )}
                            </div>
                            <div className="mt-4 px-4 pb-2 relative z-20">
                                <Pagination links={activity_log?.links || []} />
                            </div>
                        </Card>
                    )}

                    <Card className="!p-0 !bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 !border-none shadow-2xl shadow-indigo-500/30 hover:shadow-indigo-500/50 transition-all duration-300 overflow-hidden relative group">
                        <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity -mr-32 -mt-32"></div>
                        <div className="absolute bottom-0 left-0 w-48 h-48 bg-purple-500/20 rounded-full blur-3xl"></div>

                        <div className="relative z-10 p-6">
                            <div className="flex items-center gap-2 mb-1">
                                <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                                <h3 className="text-white font-black text-xl tracking-tight drop-shadow-lg">Quick Actions</h3>
                            </div>
                            <p className="text-indigo-100 text-xs font-medium mb-6 tracking-wide">Shortcuts for common tasks</p>

                            <div className="grid grid-cols-2 gap-3">
                                <button className="relative p-4 bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-2xl text-xs font-bold text-white transition-all duration-300 text-left border border-white/20 hover:border-white/40 shadow-lg hover:shadow-xl group/btn overflow-hidden hover:scale-105">
                                    <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover/btn:opacity-100 transition-opacity"></div>
                                    <div className="relative z-10 flex items-center gap-2">
                                        <div className="p-1.5 bg-white/20 rounded-lg">
                                            <Users size={14} strokeWidth={2.5} />
                                        </div>
                                        <span className="tracking-wide">New Student</span>
                                    </div>
                                </button>
                                <button className="relative p-4 bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-2xl text-xs font-bold text-white transition-all duration-300 text-left border border-white/20 hover:border-white/40 shadow-lg hover:shadow-xl group/btn overflow-hidden hover:scale-105">
                                    <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover/btn:opacity-100 transition-opacity"></div>
                                    <div className="relative z-10 flex items-center gap-2">
                                        <div className="p-1.5 bg-white/20 rounded-lg">
                                            <BookOpen size={14} strokeWidth={2.5} />
                                        </div>
                                        <span className="tracking-wide">Record Result</span>
                                    </div>
                                </button>
                                <button className="relative p-4 bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-2xl text-xs font-bold text-white transition-all duration-300 text-left border border-white/20 hover:border-white/40 shadow-lg hover:shadow-xl group/btn overflow-hidden hover:scale-105">
                                    <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover/btn:opacity-100 transition-opacity"></div>
                                    <div className="relative z-10 flex items-center gap-2">
                                        <div className="p-1.5 bg-white/20 rounded-lg">
                                            <TrendingUp size={14} strokeWidth={2.5} />
                                        </div>
                                        <span className="tracking-wide">Print Report</span>
                                    </div>
                                </button>
                                <button className="relative p-4 bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-2xl text-xs font-bold text-white transition-all duration-300 text-left border border-white/20 hover:border-white/40 shadow-lg hover:shadow-xl group/btn overflow-hidden hover:scale-105">
                                    <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover/btn:opacity-100 transition-opacity"></div>
                                    <div className="relative z-10 flex items-center gap-2">
                                        <div className="p-1.5 bg-white/20 rounded-lg">
                                            <GraduationCap size={14} strokeWidth={2.5} />
                                        </div>
                                        <span className="tracking-wide">View Promoted</span>
                                    </div>
                                </button>
                            </div>
                        </div>
                    </Card>
                </div>
            </div>
        </AuthenticatedLayout >
    );
}