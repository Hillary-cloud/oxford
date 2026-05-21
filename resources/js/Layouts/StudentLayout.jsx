import { Link, usePage } from '@inertiajs/react';
import { LogOut } from 'lucide-react';
import { router } from '@inertiajs/react';

export default function StudentLayout({ children, header }) {
    const { student } = usePage().props;

    const handleLogout = () => {
        router.post(route('cbt.logout'));
    };

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900 font-sans">
            <nav className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 sticky top-0 z-30 shadow-sm backdrop-blur-md bg-opacity-90 dark:bg-opacity-90">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16">
                        <div className="flex">
                            <div className="shrink-0 flex items-center gap-2">
                                {usePage().props.settings?.school_identity?.logo ? (
                                    <img
                                        src={`/storage/${usePage().props.settings.school_identity.logo}`}
                                        alt="Logo"
                                        className="w-10 h-10 object-contain"
                                    />
                                ) : (
                                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-indigo-500/30">
                                        {usePage().props.settings?.school_identity?.school_name?.charAt(0) || 'S'}
                                    </div>
                                )}
                                <Link href={route('student.cbt.index')} className="font-bold text-xl text-slate-800 dark:text-white tracking-tight">
                                    {usePage().props.settings?.school_identity?.school_name || 'Student Portal'}
                                </Link>
                            </div>
                        </div>

                        <div className="flex items-center gap-4">
                            {student && (
                                <div className="text-sm text-slate-600 dark:text-slate-300 hidden sm:flex items-center gap-2 bg-slate-100 dark:bg-slate-700 px-3 py-1.5 rounded-full border border-slate-200 dark:border-slate-600">
                                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                                    <span className="font-medium">{student.surname} {student.othername}</span>
                                </div>
                            )}

                            <button
                                onClick={handleLogout}
                                className="flex items-center gap-2 text-sm text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 px-3 py-2 rounded-lg transition-all font-medium"
                            >
                                <LogOut size={18} />
                                <span className="hidden sm:inline">Logout</span>
                            </button>
                        </div>
                    </div>
                </div>
            </nav>

            {header && (
                <header className="bg-white dark:bg-slate-800 shadow-sm relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 opacity-50"></div>
                    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8 relative z-10">{header}</div>
                </header>
            )}

            <main className="pb-20">{children}</main>
        </div>
    );
}
