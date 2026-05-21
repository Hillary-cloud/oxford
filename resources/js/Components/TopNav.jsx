import { Link, usePage } from '@inertiajs/react';
import { Bell, Search, Settings, HelpCircle, Menu, Sun, Moon, ChevronDown, LogOut } from 'lucide-react';
import Dropdown from '@/Components/Dropdown';
import { useTheme } from '@/Contexts/ThemeContext';

export default function TopNav({ onMenuClick }) {
    const { auth } = usePage().props;
    const user = auth.user;
    const { theme, toggleTheme } = useTheme();

    return (
        <header className="h-16 sticky top-0 z-40 bg-white/80 dark:bg-[#0f172a]/80 backdrop-blur-md border-b border-slate-200/60 dark:border-slate-800/60 flex items-center justify-between px-4 md:px-6 transition-all duration-300">
            <div className="flex items-center gap-4 md:gap-8 flex-1">
                <button
                    onClick={onMenuClick}
                    className="p-2 -ml-2 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg md:hidden transition-colors"
                >
                    <Menu size={20} />
                </button>

                <div className="hidden md:flex relative max-w-sm w-full group">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-primary transition-colors" />
                    <input
                        type="text"
                        placeholder="Search anything..."
                        className="w-full bg-slate-100/50 dark:bg-slate-900/50 border-none rounded-xl pl-10 pr-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:bg-white dark:focus:bg-slate-900 transition-all placeholder:text-slate-400"
                    />
                </div>
            </div>

            <div className="flex items-center gap-2 md:gap-4">
                <button
                    onClick={toggleTheme}
                    title="Toggle Theme"
                    className="p-2.5 text-slate-500 dark:text-slate-400 hover:text-amber-500 dark:hover:text-yellow-400 hover:bg-amber-50 dark:hover:bg-yellow-400/10 rounded-full transition-all duration-200"
                >
                    {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
                </button>

                <button title="Help & Support" className="hidden md:flex p-2.5 text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-500/10 rounded-full transition-all duration-200">
                    <HelpCircle size={20} />
                </button>

                <button title="Notifications" className="p-2.5 text-slate-500 dark:text-slate-400 hover:text-primary dark:hover:text-primary hover:bg-primary/10 dark:hover:bg-primary/10 rounded-full transition-all duration-200 relative">
                    <Bell size={20} />
                    <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-red-500 rounded-full ring-2 ring-white dark:ring-[#0f172a]"></span>
                </button>

                <div className="w-px h-8 bg-slate-200 dark:bg-slate-800 mx-1 md:mx-2"></div>

                {user && (
                    <Dropdown>
                        <Dropdown.Trigger>
                            <button className="flex items-center gap-3 pl-1 pr-2 py-1 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800/50 transition-all group border border-transparent hover:border-slate-200 dark:hover:border-slate-700">
                                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-primary to-secondary flex items-center justify-center text-white text-xs font-bold shadow-md shadow-primary/20 group-hover:shadow-primary/40 transition-all">
                                    {user.name?.charAt(0) || 'U'}
                                </div>
                                <div className="hidden md:block text-left">
                                    <p className="text-sm font-semibold text-slate-700 dark:text-slate-200 group-hover:text-primary transition-colors">
                                        {user.name?.split(' ')[0]}
                                    </p>
                                </div>
                                <ChevronDown size={14} className="text-slate-400 group-hover:text-primary transition-colors" />
                            </button>
                        </Dropdown.Trigger>

                        <Dropdown.Content align="right" width="48" contentClasses="py-1 bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 shadow-xl shadow-slate-200/20 dark:shadow-black/20 rounded-xl">
                            <div className="px-4 py-2 border-b border-slate-100 dark:border-slate-800">
                                <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Signed in as</p>
                                <p className="text-sm font-medium text-slate-900 dark:text-white truncate">{user.email}</p>
                            </div>
                            <Dropdown.Link href={route('profile.edit')} className="flex items-center gap-2 px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-primary/10 hover:text-primary">
                                <Settings size={16} />
                                Settings
                            </Dropdown.Link>
                            <Dropdown.Link href={route('logout')} method="post" as="button" className="flex items-center gap-2 px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 w-full text-left">
                                <LogOut size={16} />
                                Log Out
                            </Dropdown.Link>
                        </Dropdown.Content>
                    </Dropdown>
                )}
            </div>
        </header>
    );
}
