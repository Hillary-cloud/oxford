import { Link, usePage } from '@inertiajs/react';
import {
    LayoutDashboard,
    Users,
    UserSquare2,
    BookOpen,
    FileSpreadsheet,
    Calendar,
    Clock,
    School,
    ChevronLeft,
    ChevronRight,
    ChevronDown,
    LogOut,
    UserCircle,
    Shield,
    Layers,
    Settings,
    Brain,
    TrendingUp,
    LayoutGrid,
    X,
    GraduationCap,
    BadgeCheck,
    DollarSign
} from 'lucide-react';
import { useState, useEffect } from 'react';

export default function Sidebar({ isCollapsed, setIsCollapsed, isMobileOpen, setIsMobileOpen }) {
    const { auth, settings } = usePage().props;
    const user = auth.user;
    const identity = settings?.school_identity || {};

    const hasRole = (role) => user?.roles?.includes(role) ?? false;
    const hasPermission = (permission) => user?.permissions?.includes(permission) ?? false;

    const menuItems = [
        { name: 'Dashboard', icon: LayoutDashboard, route: 'dashboard', active: 'dashboard' },
        {
            name: 'Staff',
            icon: Users,
            route: 'users.index',
            active: 'users.*',
            show: hasPermission('view user') || hasRole('Super Admin') || hasRole('Admin')
        },
        {
            name: 'Roles',
            icon: Shield,
            route: 'roles.index',
            active: 'roles.*',
            show: hasRole('Super Admin')
        },
        {
            name: 'Students',
            icon: UserSquare2,
            route: 'students.index',
            active: 'students.*',
            show: hasPermission('view student') || hasRole('Super Admin') || hasRole('Admin')
        },
        {
            name: 'Promotions',
            icon: TrendingUp,
            route: 'promotions.index',
            active: 'promotions.*',
            show: hasRole('Super Admin') || hasPermission('manage promotions')
        },
        {
            name: 'Student Attendance',
            icon: Calendar,
            route: 'attendance.index',
            active: 'attendance.*',
            show: hasRole('Super Admin') || hasPermission('view attendance') || hasPermission('take attendance')
        },
        {
            name: 'Staff Attendance',
            icon: Clock,
            show: true,
            children: [
                {
                    name: 'Scan QR Code',
                    route: 'staff-attendance.scan',
                    active: 'staff-attendance.scan',
                    show: hasRole('Super Admin') || hasPermission('mark staff attendance')
                },
                {
                    name: 'QR Monitor',
                    route: 'staff-attendance.monitor',
                    active: 'staff-attendance.monitor',
                    show: hasRole('Super Admin') || hasPermission('view staff attendance monitor')
                },
                {
                    name: 'Attendance Logs',
                    route: 'staff-attendance.index',
                    active: 'staff-attendance.index',
                    show: hasRole('Super Admin') || hasPermission('view staff attendance logs')
                },
            ]
        },
        {
            name: 'Alumni',
            icon: GraduationCap,
            route: 'graduations.index',
            active: 'graduations.*',
            show: hasRole('Super Admin') || hasPermission('manage graduations')
        },
        {
            name: 'Fees',
            icon: DollarSign,
            route: 'fees.index',
            active: 'fees.*',
            show: hasRole('Super Admin') || hasPermission('view fees')
        },
        {
            name: 'Subjects',
            icon: BookOpen,
            route: 'subjects.index',
            active: 'subjects.*',
            show: hasPermission('view subject') || hasRole('Super Admin') || hasRole('Admin')
        },
        {
            name: 'Results Management',
            icon: FileSpreadsheet,
            route: 'results.management',
            active: 'results.*',
            show: hasRole('Super Admin') || hasPermission('view results') || hasPermission('manage results')
        },
        {
            name: 'ID Cards',
            icon: BadgeCheck,
            route: 'id-cards.index',
            active: 'id-cards.*',
            show: hasPermission('manage id card') || hasRole('Super Admin')
        },
        {
            name: 'CBT Exams',
            icon: Brain,
            route: 'cbt.exams.index',
            active: 'cbt.*',
            show: hasPermission('manage cbt') || hasRole('Super Admin')
        },
        {
            name: 'Academic Setup',
            icon: LayoutGrid,
            route: 'academic-setup.index',
            active: 'academic-setup.*',
            show: hasRole('Super Admin') || hasPermission('manage setup')
        },
        {
            name: 'General Config',
            icon: Settings,
            route: 'settings.general.index',
            active: 'settings.general.*',
            show: hasRole('Super Admin')
        },
    ];

    const [openMenus, setOpenMenus] = useState({});

    const toggleMenu = (name) => {
        setOpenMenus(prev => ({ ...prev, [name]: !prev[name] }));
    };

    useEffect(() => {
        // Auto-expand menu if child is active
        menuItems.forEach(item => {
            if (item.children && item.children.some(child => route().current(child.active))) {
                setOpenMenus(prev => ({ ...prev, [item.name]: true }));
            }
        });
    }, []);

    return (
        <>
            {/* Mobile Overlay */}
            {isMobileOpen && (
                <div
                    className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 md:hidden animate-in fade-in"
                    onClick={() => setIsMobileOpen(false)}
                />
            )}

            <aside
                className={`fixed inset-y-0 left-0 z-50 h-screen transition-all duration-300 ease-in-out bg-sidebar-bg dark:bg-[#0f172a] border-r border-slate-100 dark:border-slate-800 shadow-2xl shadow-slate-200/50 dark:shadow-black/50 flex flex-col 
                    ${isMobileOpen ? 'translate-x-0 w-64' : '-translate-x-full w-64'} 
                    md:translate-x-0 ${isCollapsed ? 'md:w-20' : 'md:w-64'}
                `}
            >
                {/* Header */}
                <div className="p-6 flex items-center justify-between">
                    {!isCollapsed && (
                        <Link href='/dashboard' className="flex flex-col items-center justify-center gap-2">
                            {identity.logo ? (
                                <img src={`/storage/${identity.logo}`} alt="Logo" className="w-20 object-contain" />
                            ) : (
                                <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center font-bold text-white">
                                    <School className="w-5 h-5 text-white" />
                                </div>
                            )}
                            <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400 dark:from-white dark:to-slate-400 group-hover:text-slate-900 dark:group-hover:text-white truncate max-w-[140px]" title={identity.school_name}>
                                {identity.school_name || 'SMART SCHOOL'}
                            </span>
                        </Link>
                    )}

                    {/* Condensed Logo for Collapsed State */}
                    {isCollapsed && (
                        <div className="mx-auto">
                            {identity.logo ? (
                                <img src={`/storage/${identity.logo}`} alt="Logo" className="w-12 h-12 object-contain" />
                            ) : (
                                <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center font-bold text-white">
                                    <School className="w-5 h-5 text-white" />
                                </div>
                            )}
                        </div>
                    )}

                    {/* Mobile Close Button */}
                    <button
                        onClick={() => setIsMobileOpen(false)}
                        className="md:hidden text-slate-400 hover:text-white transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Navigation */}
                <nav className="flex-1 px-4 py-4 space-y-2 overflow-y-auto overflow-x-hidden scrollbar-hide">
                    {menuItems.filter(item => item.show !== false).map((item) => {
                        const active = item.children
                            ? item.children.some(child => route().current(child.active))
                            : route().current(item.active);
                        const Icon = item.icon;

                        if (item.children) {
                            return (
                                <div key={item.name} className="space-y-1">
                                    <button
                                        onClick={() => !isCollapsed && toggleMenu(item.name)}
                                        className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl transition-all duration-300 group ${active
                                            ? 'bg-gradient-to-r from-primary to-secondary text-white shadow-lg shadow-primary/30 ring-1 ring-white/20'
                                            : 'text-slate-400 hover:bg-white/10 hover:text-white dark:hover:bg-white/5 dark:hover:text-slate-200'
                                            }`}
                                    >
                                        <div className="flex items-center gap-3">
                                            <Icon className={`w-5 h-5 shrink-0 transition-transform duration-300 ${!active && 'group-hover:scale-110'}`} />
                                            {!isCollapsed && <span className="font-medium text-sm">{item.name}</span>}
                                        </div>
                                        {!isCollapsed && (
                                            <div className={`transition-transform duration-300 ${openMenus[item.name] ? 'rotate-180' : ''}`}>
                                                <ChevronDown size={14} className={active ? 'text-white/80' : ''} />
                                            </div>
                                        )}
                                    </button>

                                    <div className={`overflow-hidden transition-all duration-300 ease-in-out ${openMenus[item.name] && !isCollapsed ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}>
                                        <div className="pl-4 space-y-1 mt-1">
                                            {item.children.filter(child => child.show !== false).map(child => {
                                                const childActive = route().current(child.active);
                                                return (
                                                    <Link
                                                        key={child.name}
                                                        href={route(child.route)}
                                                        className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-all ${childActive
                                                            ? 'text-primary dark:text-indigo-400 bg-white/10 dark:bg-indigo-500/10 border-l-2 border-primary dark:border-indigo-400 pl-2.5'
                                                            : 'text-slate-400 hover:text-white dark:hover:text-slate-300 hover:bg-white/5 dark:hover:bg-white/5 border-l-2 border-transparent'
                                                            }`}
                                                    >
                                                        {/* <div className={`w-1.5 h-1.5 rounded-full ${childActive ? 'bg-indigo-500' : 'bg-slate-400'}`}></div> */}
                                                        <span>{child.name}</span>
                                                    </Link>
                                                );
                                            })}
                                        </div>
                                    </div>
                                </div>
                            );
                        }

                        return (
                            <Link
                                key={item.name}
                                href={route(item.route)}
                                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-300 group ${active
                                    ? 'bg-gradient-to-r from-primary to-secondary text-white shadow-lg shadow-primary/30 ring-1 ring-white/20'
                                    : 'text-slate-400 hover:bg-white/10 hover:text-white dark:hover:bg-white/5 dark:hover:text-slate-200'
                                    }`}
                            >
                                <Icon className={`w-5 h-5 shrink-0 transition-transform duration-300 ${!active && 'group-hover:scale-110'}`} />
                                {!isCollapsed && <span className="font-medium text-sm">{item.name}</span>}
                            </Link>
                        );
                    })}
                </nav>

                {/* User Profile / Footer */}
                {user && (
                    <div className="p-4 border-t border-slate-200 dark:border-slate-800/50">
                        <div className={`flex items-center gap-3 p-2 rounded-xl transition-all ${isCollapsed ? 'justify-center' : 'bg-slate-50 dark:bg-slate-900/40'}`}>
                            <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center border border-slate-300 dark:border-slate-700 overflow-hidden shrink-0">
                                {user.profile_image ? (
                                    <img src={`/storage/${user.profile_image}`} alt="" className="w-full h-full object-cover" />
                                ) : (
                                    <UserCircle className="w-6 h-6 text-slate-400" />
                                )}
                            </div>
                            {!isCollapsed && (
                                <div className="flex-1 min-w-0">
                                    <p className="text-xs font-semibold text-slate-700 dark:text-slate-200 truncate">{user.name}</p>
                                    <p className="text-[10px] text-slate-500 truncate">{user.staff_id || user.email}</p>
                                </div>
                            )}
                        </div>
                        {!isCollapsed && (
                            <Link
                                href={route('logout')}
                                method="post"
                                as="button"
                                className="w-full mt-3 flex items-center gap-3 px-3 py-2 rounded-xl text-slate-500 hover:bg-red-500/10 hover:text-red-400 transition-colors text-sm font-medium"
                            >
                                <LogOut className="w-4 h-4" />
                                <span>Log Out</span>
                            </Link>
                        )}
                    </div>
                )}

                {/* Collapse Toggle */}
                <button
                    onClick={() => setIsCollapsed(!isCollapsed)}
                    className="hidden md:flex absolute -right-3 top-20 w-6 h-6 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-full items-center justify-center text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
                >
                    {isCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
                </button>
            </aside>
        </>
    );
}
