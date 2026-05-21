import { useState, useEffect } from 'react';
import { usePage, router } from '@inertiajs/react';
import Sidebar from '@/Components/Sidebar';
import TopNav from '@/Components/TopNav';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { ThemeProvider } from '@/Contexts/ThemeContext';

export default function AuthenticatedLayout({ header, children, noPadding = false }) {
    const { auth, settings, flash } = usePage().props;
    const [isMobileOpen, setIsMobileOpen] = useState(false);
    const [isCollapsed, setIsCollapsed] = useState(false);
    const theme = settings?.theme_colors || {};
    const identity = settings?.school_identity || {};

    useEffect(() => {
        if (!auth.user) {
            router.get(route('login'));
        }

        // Apply dynamic theme
        const root = document.documentElement;
        if (theme.primary) root.style.setProperty('--color-primary', theme.primary);
        if (theme.secondary) root.style.setProperty('--color-secondary', theme.secondary);
        if (theme.background) root.style.setProperty('--color-background', theme.background);
        if (theme.sidebar) root.style.setProperty('--color-sidebar', theme.sidebar);
        if (theme.text) root.style.setProperty('--color-text', theme.text);
        if (theme.button || theme.primary) root.style.setProperty('--color-button', theme.button || theme.primary);

    }, [auth.user, theme]);

    useEffect(() => {
        if (flash?.success) {
            toast.success(flash.success);
        }
        if (flash?.error) {
            toast.error(flash.error);
        }
        if (flash?.warning) {
            toast.warning(flash.warning);
        }
        if (flash?.info) {
            toast.info(flash.info);
        }
    }, [flash]);

    return (
        <ThemeProvider>
            <div className="min-h-screen transition-colors duration-300 bg-page-bg dark:bg-[#020617] text-primary-text dark:text-slate-200">
                <ToastContainer theme="dark" position="top-right" />

                {/* Sidebar */}
                <Sidebar
                    isCollapsed={isCollapsed}
                    setIsCollapsed={setIsCollapsed}
                    isMobileOpen={isMobileOpen}
                    setIsMobileOpen={setIsMobileOpen}
                />

                {/* Main Content Area */}
                <div
                    className={`transition-all duration-300 ease-in-out min-h-screen flex flex-col ${isCollapsed ? 'md:pl-20' : 'md:pl-64'
                        }`}
                >
                    {/* Top Navigation */}
                    <TopNav onMenuClick={() => setIsMobileOpen(!isMobileOpen)} />

                    {/* Main Content */}
                    <main className={`flex-1 overflow-x-hidden ${noPadding ? '' : 'p-4 md:p-8'}`}>
                        <div className={noPadding ? 'w-full' : 'mx-auto max-w-7xl'}>
                            {header && (
                                <div className={noPadding ? 'p-4 md:p-8' : 'mb-8'}>
                                    {header}
                                </div>
                            )}
                            {children}
                        </div>
                    </main>

                    {/* Simple Footer */}
                    <footer className="p-8 border-t border-slate-200 dark:border-slate-800/50 mt-auto">
                        <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-slate-500">
                            <p>© {new Date().getFullYear()} {identity.school_name || 'HUSS - High-End School Software'}. All rights reserved.</p>
                            <div className="flex gap-6">
                                <a href="#" className="hover:text-slate-700 dark:hover:text-slate-300 transition-colors">Documentation</a>
                                <a href="#" className="hover:text-slate-700 dark:hover:text-slate-300 transition-colors">Support</a>
                                <a href="#" className="hover:text-slate-700 dark:hover:text-slate-300 transition-colors">Terms</a>
                            </div>
                        </div>
                    </footer>
                </div>
            </div>
        </ThemeProvider>
    );
}
