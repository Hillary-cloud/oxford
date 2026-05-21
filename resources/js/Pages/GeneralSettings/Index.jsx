import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, usePage, router, Link } from '@inertiajs/react';
import Card from '@/Components/Card';
import PrimaryButton from '@/Components/PrimaryButton';
import { toast } from 'react-toastify';
import { Settings, Image as ImageIcon, Palette, Save, School, Type, Hash, Calendar, ShieldCheck, Key, ExternalLink, Lock, Clock, Timer } from 'lucide-react';
import Swal from 'sweetalert2';
import { useEffect } from 'react';

export default function Index({ auth, settings }) {
    const { school_identity, theme_colors } = settings;

    // Identity Form
    const identityForm = useForm({
        type: 'identity',
        school_name: school_identity?.school_name || '',
        school_code: school_identity?.school_code || '',
        school_motto: school_identity?.school_motto || '',
        school_address: school_identity?.school_address || '',
        school_email: school_identity?.school_email || '',
        school_phone: school_identity?.school_phone || '',
        current_registration_year: school_identity?.current_registration_year || new Date().getFullYear(),
        logo: null,
    });

    // Theme Form
    const themeForm = useForm({
        type: 'theming',
        colors: {
            primary: theme_colors?.primary || '#6366f1',
            secondary: theme_colors?.secondary || '#ec4899',
            background: theme_colors?.background || '#e5e7eb',
            sidebar: theme_colors?.sidebar || '#1e293b',
            text: theme_colors?.text || '#0f172a',
            button: theme_colors?.button || theme_colors?.primary || '#4f46e5',
            result_primary: theme_colors?.result_primary || '#1e3a8a',
            result_secondary: theme_colors?.result_secondary || '#6366f1',
        }
    });

    // Security Form
    const securityForm = useForm({
        type: 'security',
        photo_upload_access_code: settings.photo_upload_access_code || '',
        system_lockdown: settings.system_lockdown || false,
    });

    // Attendance Form
    const attendanceForm = useForm({
        type: 'attendance',
        late_time: settings.staff_attendance_config?.late_time || '08:30',
        grace_period_minutes: settings.staff_attendance_config?.grace_period_minutes || 0,
    });

    // Synchronize form colors with server props (for reset/refresh support)
    useEffect(() => {
        if (theme_colors) {
            themeForm.setData('colors', {
                primary: theme_colors.primary || '#6366f1',
                secondary: theme_colors.secondary || '#ec4899',
                background: theme_colors.background || '#e5e7eb',
                sidebar: theme_colors.sidebar || '#1e293b',
                text: theme_colors.text || '#0f172a',
                button: theme_colors.button || theme_colors.primary || '#4f46e5',
                result_primary: theme_colors.result_primary || '#1e3a8a',
                result_secondary: theme_colors.result_secondary || '#6366f1',
            });
        }
    }, [theme_colors]);

    const handleIdentitySubmit = (e) => {
        e.preventDefault();
        identityForm.post(route('settings.general.update'), {
            onSuccess: () => { },
            forceFormData: true,
        });
    };

    const handleThemeSubmit = (e) => {
        e.preventDefault();
        themeForm.post(route('settings.general.update'), {
            onSuccess: () => { },
        });
    };

    const handleSecuritySubmit = (e) => {
        e.preventDefault();
        securityForm.post(route('settings.general.update'), {
            onSuccess: () => { },
        });
    };

    const handleAttendanceSubmit = (e) => {
        e.preventDefault();
        attendanceForm.post(route('settings.general.update'), {
            onSuccess: () => { },
        });
    };

    return (
        <AuthenticatedLayout
            header={<h2 className="font-semibold text-xl text-slate-800 dark:text-slate-200 leading-tight">General Configuration</h2>}
        >
            <Head title="General Settings" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8 space-y-12">

                    {/* School Identity Section */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div className="md:col-span-1 space-y-2">
                            <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                <School size={20} className="text-indigo-500" /> School Identity
                            </h3>
                            <p className="text-sm text-slate-500">
                                configure essential school details used for report cards, ID generation, and system branding.
                            </p>
                        </div>

                        <div className="md:col-span-2">
                            <Card className="!p-0 overflow-hidden">
                                <form onSubmit={handleIdentitySubmit} className="p-6 space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-sm font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                                                <Type size={14} /> School Name
                                            </label>
                                            <input
                                                type="text"
                                                value={identityForm.data.school_name}
                                                onChange={e => identityForm.setData('school_name', e.target.value)}
                                                className="w-full rounded-xl bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-sm focus:ring-indigo-500"
                                                placeholder="e.g. Huss International Academy"
                                            />
                                            {identityForm.errors.school_name && <p className="text-xs text-rose-500">{identityForm.errors.school_name}</p>}
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-sm font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                                                <Hash size={14} /> School Code (Short)
                                            </label>
                                            <input
                                                type="text"
                                                value={identityForm.data.school_code}
                                                onChange={e => identityForm.setData('school_code', e.target.value.toUpperCase())}
                                                maxLength={5}
                                                className="w-full rounded-xl bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-sm focus:ring-indigo-500 font-mono uppercase"
                                                placeholder="e.g. HUSS"
                                            />
                                            <p className="text-[10px] text-slate-400">Used for ID generation (e.g. HUSS/STU/2025/001)</p>
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-sm font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                                                <Type size={14} /> School Motto
                                            </label>
                                            <input
                                                type="text"
                                                value={identityForm.data.school_motto}
                                                onChange={e => identityForm.setData('school_motto', e.target.value)}
                                                className="w-full rounded-xl bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-sm focus:ring-indigo-500"
                                                placeholder="e.g. Excellence in Service"
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-sm font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                                                <School size={14} /> Address
                                            </label>
                                            <input
                                                type="text"
                                                value={identityForm.data.school_address}
                                                onChange={e => identityForm.setData('school_address', e.target.value)}
                                                className="w-full rounded-xl bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-sm focus:ring-indigo-500"
                                                placeholder="e.g. 123 Education St."
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-sm font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                                                <School size={14} /> Email
                                            </label>
                                            <input
                                                type="email"
                                                value={identityForm.data.school_email}
                                                onChange={e => identityForm.setData('school_email', e.target.value)}
                                                className="w-full rounded-xl bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-sm focus:ring-indigo-500"
                                                placeholder="e.g. info@school.com"
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-sm font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                                                <School size={14} /> Phone
                                            </label>
                                            <input
                                                type="text"
                                                value={identityForm.data.school_phone}
                                                onChange={e => identityForm.setData('school_phone', e.target.value)}
                                                className="w-full rounded-xl bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-sm focus:ring-indigo-500"
                                                placeholder="e.g. +1234567890"
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-sm font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                                                <Calendar size={14} /> Current Registration Year
                                            </label>
                                            <input
                                                type="number"
                                                value={identityForm.data.current_registration_year}
                                                onChange={e => identityForm.setData('current_registration_year', e.target.value)}
                                                className="w-full rounded-xl bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-sm focus:ring-indigo-500"
                                                min="2000" max="2099"
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-sm font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                                                <ImageIcon size={14} /> School Logo
                                            </label>
                                            <div className="flex items-center gap-4">
                                                {school_identity?.logo && (
                                                    <img src={`/storage/${school_identity.logo}`} alt="Current Logo" className="w-12 h-12 object-contain bg-white rounded-lg p-1 border border-slate-200" />
                                                )}
                                                <input
                                                    type="file"
                                                    onChange={e => identityForm.setData('logo', e.target.files[0])}
                                                    className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 dark:file:bg-indigo-500/10 dark:file:text-indigo-400"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-end">
                                        <PrimaryButton disabled={identityForm.processing} className="gap-2">
                                            <Save size={16} /> Save Identity
                                        </PrimaryButton>
                                    </div>
                                </form>
                            </Card>
                        </div>
                    </div>

                    <div className="w-full h-px bg-slate-200 dark:bg-slate-800" />

                    {/* Theming Section */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div className="md:col-span-1 space-y-2">
                            <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                <Palette size={20} className="text-pink-500" /> Display & Theming
                            </h3>
                            <p className="text-sm text-slate-500">
                                Customize the visual appearance of the system. Changes apply globally to all users.
                            </p>
                        </div>

                        <div className="md:col-span-2">
                            <Card className="!p-0 overflow-hidden">
                                <form onSubmit={handleThemeSubmit} className="p-6 space-y-6">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">

                                        {[
                                            { key: 'primary', label: 'Primary Brand Color' },
                                            { key: 'secondary', label: 'Secondary/Accent' },
                                            { key: 'sidebar', label: 'Sidebar Background' },
                                            { key: 'background', label: 'Page Background' },
                                            { key: 'text', label: 'Primary Text' },
                                            { key: 'button', label: 'Primary Button' },
                                        ].map(color => (
                                            <div key={color.key} className="space-y-2">
                                                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest block mb-2">{color.label}</label>
                                                <div className="flex items-center gap-3">
                                                    <input
                                                        type="color"
                                                        value={themeForm.data.colors[color.key]}
                                                        onChange={e => {
                                                            const newColors = { ...themeForm.data.colors, [color.key]: e.target.value };
                                                            themeForm.setData('colors', newColors);
                                                        }}
                                                        className="w-10 h-10 rounded-lg cursor-pointer border-0 p-0"
                                                    />
                                                    <input
                                                        type="text"
                                                        value={themeForm.data.colors[color.key]}
                                                        onChange={e => {
                                                            const newColors = { ...themeForm.data.colors, [color.key]: e.target.value };
                                                            themeForm.setData('colors', newColors);
                                                        }}
                                                        className="w-24 rounded-lg bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-xs font-mono"
                                                    />
                                                </div>
                                            </div>
                                        ))}

                                        {/* Result Specific Colors */}
                                        {[
                                            { key: 'result_primary', label: 'Result Header (Navy)', default: '#1e3a8a' },
                                            { key: 'result_secondary', label: 'Result Accent (Indigo)', default: '#6366f1' },
                                        ].map(color => (
                                            <div key={color.key} className="space-y-2">
                                                <label className="text-xs font-bold text-indigo-500 uppercase tracking-widest block mb-2">{color.label}</label>
                                                <div className="flex items-center gap-3">
                                                    <input
                                                        type="color"
                                                        value={themeForm.data.colors[color.key] || color.default}
                                                        onChange={e => {
                                                            const newColors = { ...themeForm.data.colors, [color.key]: e.target.value };
                                                            themeForm.setData('colors', newColors);
                                                        }}
                                                        className="w-10 h-10 rounded-lg cursor-pointer border-0 p-0"
                                                    />
                                                    <input
                                                        type="text"
                                                        value={themeForm.data.colors[color.key] || color.default}
                                                        onChange={e => {
                                                            const newColors = { ...themeForm.data.colors, [color.key]: e.target.value };
                                                            themeForm.setData('colors', newColors);
                                                        }}
                                                        className="w-24 rounded-lg bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-xs font-mono"
                                                    />
                                                </div>
                                            </div>
                                        ))}

                                    </div>

                                    <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-3">
                                        <button
                                            type="button"
                                            onClick={() => {
                                                Swal.fire({
                                                    title: 'Reset Theme?',
                                                    text: "Are you sure you want to reset to default colors? This action cannot be undone.",
                                                    icon: 'warning',
                                                    showCancelButton: true,
                                                    confirmButtonColor: '#ec4899', // Matches secondary/danger tone or pink button
                                                    cancelButtonColor: '#64748b', // Slate 500
                                                    confirmButtonText: 'Yes, reset it!',
                                                    background: document.documentElement.classList.contains('dark') ? '#1e293b' : '#fff',
                                                    color: document.documentElement.classList.contains('dark') ? '#f8fafc' : '#1e293b',
                                                }).then((result) => {
                                                    if (result.isConfirmed) {
                                                        router.post(route('settings.general.update'), { type: 'reset_theme' }, {
                                                            onSuccess: () => { },
                                                        });
                                                    }
                                                });
                                            }}
                                            className="px-4 py-2 text-sm font-bold text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 transition-colors"
                                        >
                                            Reset to Defaults
                                        </button>
                                        <PrimaryButton disabled={themeForm.processing} className="gap-2 bg-secondary hover:opacity-90 transition-opacity">
                                            <Save size={16} /> Save Theme
                                        </PrimaryButton>
                                    </div>
                                </form>
                            </Card>
                        </div>
                    </div>

                    <div className="w-full h-px bg-slate-200 dark:bg-slate-800" />

                    {/* Attendance Configuration Section */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div className="md:col-span-1 space-y-2">
                            <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                <Clock size={20} className="text-orange-500" /> Attendance Configuration
                            </h3>
                            <p className="text-sm text-slate-500">
                                Set official school start times and grace periods for staff attendance tracking.
                            </p>
                        </div>

                        <div className="md:col-span-2">
                            <Card className="!p-0 overflow-hidden">
                                <form onSubmit={handleAttendanceSubmit} className="p-6 space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-sm font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                                                <Clock size={14} /> Late Threshold Time (12-Hour)
                                            </label>
                                            <input
                                                type="time"
                                                value={attendanceForm.data.late_time}
                                                onChange={e => attendanceForm.setData('late_time', e.target.value)}
                                                className="w-full rounded-xl bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-sm focus:ring-indigo-500"
                                            />
                                            <p className="text-[10px] text-slate-400">Staff clocking in after this time (e.g., 08:30 AM) will be marked as "Late".</p>
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-sm font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                                                <Timer size={14} /> Grace Period (Minutes)
                                            </label>
                                            <input
                                                type="number"
                                                value={attendanceForm.data.grace_period_minutes}
                                                onChange={e => attendanceForm.setData('grace_period_minutes', e.target.value)}
                                                className="w-full rounded-xl bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-sm focus:ring-indigo-500"
                                                min="0"
                                                max="120"
                                            />
                                            <p className="text-[10px] text-slate-400">Extra minutes allowed before marking as late.</p>
                                        </div>
                                    </div>

                                    <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-end">
                                        <PrimaryButton disabled={attendanceForm.processing} className="gap-2 bg-orange-600 hover:bg-orange-700">
                                            <Save size={16} /> Save Attendance Settings
                                        </PrimaryButton>
                                    </div>
                                </form>
                            </Card>
                        </div>
                    </div>

                    <div className="w-full h-px bg-slate-200 dark:bg-slate-800" />

                    {/* Security Section */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div className="md:col-span-1 space-y-2">
                            <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                                <ShieldCheck size={20} className="text-emerald-500" /> Security & Access
                            </h3>
                            <p className="text-sm text-slate-500">
                                Manage access controls for external tools like the Photo Capture Portal.
                            </p>
                        </div>

                        <div className="md:col-span-2">
                            <Card className="!p-0 overflow-hidden">
                                <form onSubmit={handleSecuritySubmit} className="p-6 space-y-6">
                                    <div className="space-y-2">
                                        <div className="flex items-center justify-between">
                                            <label className="text-sm font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                                                <Key size={14} /> Photo Upload Access Code
                                            </label>
                                            <Link href={route('portal.login')} className="text-xs text-indigo-400 hover:underline flex items-center gap-1" target="_blank">
                                                Open Portal <ExternalLink size={10} />
                                            </Link>
                                        </div>
                                        <input
                                            type="text"
                                            value={securityForm.data.photo_upload_access_code}
                                            onChange={e => securityForm.setData('photo_upload_access_code', e.target.value)}
                                            className="w-full rounded-xl bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-sm focus:ring-indigo-500 font-mono tracking-widest"
                                            placeholder="Enter a secure code (e.g. 1234)"
                                            minLength={4}
                                            maxLength={20}
                                        />
                                        <p className="text-[10px] text-slate-400">
                                            Share this code with photographers/staff to allow them to access the
                                            <span className="font-mono text-indigo-400 mx-1">/portal/capture</span> page without an admin account.
                                        </p>
                                        {securityForm.errors.photo_upload_access_code && <p className="text-xs text-rose-500">{securityForm.errors.photo_upload_access_code}</p>}
                                    </div>

                                    {/* System Lockdown Toggle */}
                                    <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-4">
                                        <div className="flex items-center justify-between">
                                            <label className="text-sm font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                                                <Lock size={14} className="text-rose-500" /> System Lockdown (Maintenance Mode)
                                            </label>
                                            <div className="flex items-center">
                                                <label className="relative inline-flex items-center cursor-pointer">
                                                    <input
                                                        type="checkbox"
                                                        checked={securityForm.data.system_lockdown}
                                                        onChange={e => securityForm.setData('system_lockdown', e.target.checked)}
                                                        className="sr-only peer"
                                                    />
                                                    <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-rose-300 dark:peer-focus:ring-rose-800 rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-rose-600"></div>
                                                </label>
                                            </div>
                                        </div>
                                        <div className="p-3 bg-rose-50 dark:bg-rose-500/10 border border-rose-100 dark:border-rose-500/20 rounded-xl">
                                            <p className="text-[10px] text-rose-600 dark:text-rose-400 font-medium">
                                                <span className="font-bold">⚠️ Warning:</span> When enabled, <strong>ONLY Super Admins</strong> will be able to log in or access the system.
                                                All active users (Staff, Admins, Students) will be logged out immediately.
                                            </p>
                                        </div>
                                    </div>

                                    <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-end">
                                        <PrimaryButton disabled={securityForm.processing} className="gap-2 bg-emerald-600 hover:bg-emerald-700">
                                            <Save size={16} /> Save Security Settings
                                        </PrimaryButton>
                                    </div>
                                </form>
                            </Card>
                        </div>
                    </div>

                </div>
            </div>
        </AuthenticatedLayout>
    );
}
