import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';
import {
    User, Mail, Phone, MapPin, Briefcase,
    Calendar, ShieldCheck, ArrowLeft,
    GraduationCap, Users, Power, Info
} from 'lucide-react';
import Card from '@/Components/Card';

export default function Show({ auth, user }) {
    const formatDate = (dateString) => {
        if (!dateString) return 'Not set';
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center gap-4">
                    <Link href={route('users.index')} className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-white dark:hover:bg-slate-800 rounded-xl transition-all">
                        <ArrowLeft size={20} />
                    </Link>
                    <div className="flex flex-col gap-1">
                        <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Staff Details</h2>
                        <p className="text-slate-600 dark:text-slate-400 text-sm">Detailed profile and system information for {user.name}.</p>
                    </div>
                </div>
            }
        >
            <Head title={`View Staff - ${user.name}`} />

            <div className="max-w-7xl mx-auto space-y-8">
                {/* Top Section: Hero Card */}
                <div className="relative overflow-hidden bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded-3xl p-8 shadow-2xl">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-600/10 blur-[100px] rounded-full -mr-32 -mt-32" />
                    <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-600/10 blur-[100px] rounded-full -ml-32 -mb-32" />

                    <div className="relative flex flex-col md:flex-row items-center gap-8">
                        <div className="w-40 h-40 rounded-full border-4 border-slate-300 dark:border-slate-800 flex items-center justify-center overflow-hidden bg-slate-100 dark:bg-slate-800 shadow-xl">
                            {user.profile_image ? (
                                <img src={`/storage/${user.profile_image}`} alt={user.name} className="w-full h-full object-cover" />
                            ) : (
                                <User size={64} className="text-slate-400 dark:text-slate-600" />
                            )}
                        </div>

                        <div className="flex-1 text-center md:text-left space-y-4">
                            <div>
                                <div className="flex flex-col md:flex-row md:items-center gap-3 mb-2">
                                    <h3 className="text-3xl font-bold text-slate-900 dark:text-white">{user.name}</h3>
                                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider ${user.status === 'active'
                                        ? 'bg-emerald-500/20 text-emerald-600 border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20'
                                        : 'bg-amber-500/20 text-amber-600 border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20'
                                        }`}>
                                        {user.status}
                                    </span>
                                </div>
                                <p className="text-indigo-400 font-mono tracking-wider">{user.staff_id}</p>
                            </div>

                            <div className="flex flex-wrap justify-center md:justify-start gap-4 text-slate-600 dark:text-slate-400">
                                <div className="flex items-center gap-2">
                                    <Mail size={16} />
                                    <span>{user.email}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Phone size={16} />
                                    <span>{user.phone}</span>
                                </div>
                                <div className="flex items-center gap-2 text-indigo-400">
                                    <ShieldCheck size={18} />
                                    <span className="font-semibold uppercase tracking-tight">{user.roles[0]?.name || 'No Role'}</span>
                                </div>
                            </div>
                        </div>

                        <div className="flex gap-3">
                            <Link href={route('users.edit', user.id)}>
                                <button className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl transition-all shadow-lg hover:shadow-indigo-500/50 flex items-center gap-2">
                                    <Edit size={18} />
                                    Edit Profile
                                </button>
                            </Link>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Column: Essential Details */}
                    <div className="lg:col-span-1 space-y-8">
                        <Card title="System Context" description="Core administrative data.">
                            <div className="space-y-6">
                                <DetailItem
                                    icon={<ShieldCheck className="text-indigo-400" size={20} />}
                                    label="Administrative Role"
                                    value={user.roles[0]?.name || 'No Role assigned'}
                                />
                                <DetailItem
                                    icon={<Power className={user.status === 'active' ? "text-green-400" : "text-yellow-400"} size={20} />}
                                    label="Account Status"
                                    value={user.status.charAt(0).toUpperCase() + user.status.slice(1)}
                                />
                                <DetailItem
                                    icon={<Briefcase className="text-slate-400" size={20} />}
                                    label="Employment Type"
                                    value={user.employment_type?.toUpperCase() || 'Full Time'}
                                />
                                <DetailItem
                                    icon={<Calendar className="text-slate-400" size={20} />}
                                    label="Joined Date"
                                    value={formatDate(user.employment_date)}
                                />
                            </div>
                        </Card>

                        <Card title="Academic Profile" description="Educational background.">
                            <div className="space-y-6">
                                <DetailItem
                                    icon={<GraduationCap className="text-indigo-400" size={20} />}
                                    label="Qualification"
                                    value={user.qualification || 'No qualification listed'}
                                />
                            </div>
                        </Card>
                    </div>

                    {/* Right Column: Personal Data */}
                    <div className="lg:col-span-2 space-y-8">
                        <Card title="Personal Information" description="Demographics and contact details.">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <DetailItem
                                    icon={<Mail className="text-slate-400" size={20} />}
                                    label="Primary Email"
                                    value={user.email}
                                />
                                <DetailItem
                                    icon={<Phone className="text-slate-400" size={20} />}
                                    label="Phone Number"
                                    value={user.phone}
                                />
                                <DetailItem
                                    icon={<Calendar className="text-slate-400" size={20} />}
                                    label="Date of Birth"
                                    value={formatDate(user.date_of_birth)}
                                />
                                <div className="md:col-span-2">
                                    <DetailItem
                                        icon={<MapPin className="text-slate-400" size={20} />}
                                        label="Residential Address"
                                        value={user.address || 'No address provided'}
                                    />
                                </div>
                            </div>
                        </Card>

                        <Card title="Emergency Contact" description="Next of kin details.">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <DetailItem
                                    icon={<Users className="text-slate-400" size={20} />}
                                    label="Contact Person"
                                    value={user.next_of_kin || 'Not specified'}
                                />
                                <DetailItem
                                    icon={<Phone className="text-slate-400" size={20} />}
                                    label="Emergency Phone"
                                    value={user.next_of_kin_phone || 'Not specified'}
                                />
                            </div>
                        </Card>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}

function DetailItem({ icon, label, value }) {
    return (
        <div className="flex gap-4 p-4 rounded-2xl bg-slate-50 dark:bg-white/5 hover:bg-slate-100 dark:hover:bg-white/10 transition-all group">
            <div className="mt-1">{icon}</div>
            <div className="space-y-1">
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest">{label}</p>
                <p className="text-slate-700 dark:text-slate-200 group-hover:text-slate-900 dark:group-hover:text-white transition-colors">{value}</p>
            </div>
        </div>
    );
}

function Edit({ size }) {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width={size}
            height={size}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
            <path d="m15 5 4 4" />
        </svg>
    );
}
