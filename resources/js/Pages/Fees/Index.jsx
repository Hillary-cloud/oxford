import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';
import Card from '@/Components/Card';
import {
    DollarSign, TrendingUp, AlertCircle, CheckCircle, Clock,
    CreditCard, ArrowRight, BarChart3, Settings, Users, Receipt,
    PlusCircle, Landmark
} from 'lucide-react';

export default function FeesIndex({ auth, stats, recentPayments, byFeeType, monthly }) {
    const fmt = (n) => '₦' + Number(n).toLocaleString('en-NG', { minimumFractionDigits: 2 });

    const statCards = [
        {
            name: 'Total Collected',
            value: fmt(stats.total_collected),
            icon: DollarSign,
            bg: 'bg-gradient-to-br from-emerald-500 to-teal-600',
            cardBg: 'bg-emerald-50/50 dark:bg-emerald-900/20',
            color: 'text-emerald-600',
        },
        {
            name: 'Outstanding Balance',
            value: fmt(stats.total_outstanding),
            icon: AlertCircle,
            bg: 'bg-gradient-to-br from-rose-500 to-pink-600',
            cardBg: 'bg-rose-50/50 dark:bg-rose-900/20',
            color: 'text-rose-600',
        },
        {
            name: 'Fully Paid',
            value: stats.paid_count,
            icon: CheckCircle,
            bg: 'bg-gradient-to-br from-indigo-500 to-purple-600',
            cardBg: 'bg-indigo-50/50 dark:bg-indigo-900/20',
            color: 'text-indigo-600',
        },
        {
            name: 'Partial Payments',
            value: stats.partial_count,
            icon: Clock,
            bg: 'bg-gradient-to-br from-amber-500 to-orange-600',
            cardBg: 'bg-amber-50/50 dark:bg-amber-900/20',
            color: 'text-amber-600',
        },
    ];

    const quickLinks = [
        { label: 'Record Payment', href: route('fees.payments.create'), icon: CreditCard, color: 'text-emerald-400', bg: 'bg-emerald-500/20' },
        { label: 'Manage Fee Types', href: route('fees.types.index'), icon: Settings, color: 'text-indigo-400', bg: 'bg-indigo-500/20' },
        { label: 'School Accounts', href: route('fees.accounts.index'), icon: Landmark, color: 'text-amber-400', bg: 'bg-amber-500/20' },
        { label: 'Payments Ledger', href: route('fees.payments.index'), icon: Receipt, color: 'text-blue-400', bg: 'bg-blue-500/20' },
        { label: 'Analytics & Reports', href: route('fees.reports.index'), icon: BarChart3, color: 'text-purple-400', bg: 'bg-purple-500/20' },
        { label: 'Fee Groups', href: route('fees.groups.index'), icon: Users, color: 'text-rose-400', bg: 'bg-rose-500/20' },
    ];

    const statusBadge = (s) => ({
        paid: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
        partial: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
        pending: 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400',
    }[s] || '');

    // Simple bar chart via CSS
    const maxBar = Math.max(...(monthly.map(m => m.total) || [1]));

    return (
        <AuthenticatedLayout
            header={
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h2 className="text-3xl font-black tracking-tight bg-gradient-to-r from-slate-900 via-emerald-900 to-slate-800 dark:from-white dark:via-emerald-200 dark:to-slate-100 bg-clip-text text-transparent">
                            Fees Management
                        </h2>
                        <p className="text-slate-600 dark:text-slate-400 text-sm font-medium tracking-wide mt-1">
                            Manage school fees, track payments, and generate receipts.
                        </p>
                    </div>
                    <Link
                        href={route('fees.payments.create')}
                        className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold rounded-2xl shadow-lg shadow-emerald-500/20 transition-all active:scale-95"
                    >
                        <PlusCircle size={18} />
                        Record Payment
                    </Link>
                </div>
            }
        >
            <Head title="Fees Management" />

            <div className="space-y-8">
                {/* Stats */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {statCards.map((stat) => (
                        <Card key={stat.name} className={`relative overflow-hidden border-none ${stat.cardBg} shadow-xl hover:shadow-2xl transition-all duration-300 group`}>
                            <div className="flex items-center gap-4">
                                <div className={`p-4 rounded-2xl ${stat.bg} shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                                    <stat.icon size={22} className="text-white" />
                                </div>
                                <div className="min-w-0">
                                    <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest truncate">{stat.name}</p>
                                    <h3 className={`text-2xl font-black ${stat.color} dark:text-white leading-tight truncate`}>{stat.value}</h3>
                                </div>
                            </div>
                        </Card>
                    ))}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Quick Links */}
                    <div>
                        <Card className="!p-6 bg-gradient-to-br from-slate-900 to-emerald-950 border-none shadow-2xl relative overflow-hidden">
                            <div className="absolute inset-0 bg-gradient-to-tr from-emerald-500/10 via-transparent to-transparent" />
                            <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2 relative z-10">
                                <TrendingUp size={20} className="text-emerald-400" />
                                Quick Actions
                            </h3>
                            <div className="space-y-2 relative z-10">
                                {quickLinks.map((l) => (
                                    <Link key={l.label} href={l.href}
                                        className="w-full flex items-center justify-between p-3.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl transition-all group/btn"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className={`p-2 ${l.bg} rounded-xl`}>
                                                <l.icon size={16} className={l.color} />
                                            </div>
                                            <span className="text-sm font-bold text-white tracking-wide">{l.label}</span>
                                        </div>
                                        <ArrowRight size={16} className="text-white/30 group-hover/btn:translate-x-1 group-hover/btn:text-emerald-400 transition-all" />
                                    </Link>
                                ))}
                            </div>
                        </Card>
                    </div>

                    {/* Monthly Chart */}
                    <div className="lg:col-span-2">
                        <Card className="!p-6 border border-slate-200 dark:border-slate-800 shadow-xl h-full">
                            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
                                <BarChart3 size={20} className="text-emerald-500" />
                                Monthly Collection ({new Date().getFullYear()})
                            </h3>
                            {monthly.length > 0 ? (
                                <div className="flex items-end gap-2 h-40">
                                    {monthly.map((m) => (
                                        <div key={m.month} className="flex-1 flex flex-col items-center gap-1">
                                            <div
                                                className="w-full bg-gradient-to-t from-emerald-600 to-teal-400 rounded-t-lg transition-all hover:opacity-80"
                                                style={{ height: `${maxBar > 0 ? Math.max(4, (m.total / maxBar) * 100) : 4}%` }}
                                                title={fmt(m.total)}
                                            />
                                            <span className="text-[10px] font-bold text-slate-500 uppercase">{m.month}</span>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="h-40 flex items-center justify-center text-slate-400 text-sm">No payment data yet</div>
                            )}

                            {/* By fee type mini list */}
                            {byFeeType.length > 0 && (
                                <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800">
                                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Collection by Fee Type</p>
                                    <div className="space-y-2">
                                        {byFeeType.slice(0, 4).map((f) => (
                                            <div key={f.fee_name} className="flex items-center justify-between">
                                                <span className="text-sm font-medium text-slate-700 dark:text-slate-300 truncate flex-1">{f.fee_name}</span>
                                                <span className="text-sm font-black text-emerald-600 dark:text-emerald-400 ml-4">{fmt(f.total)}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </Card>
                    </div>
                </div>

                {/* Recent Payments */}
                <Card className="!p-0 border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden">
                    <div className="p-6 border-b border-slate-100 dark:border-slate-800/60 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/50">
                        <div>
                            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Recent Payments</h3>
                            <p className="text-xs text-slate-500 font-medium mt-0.5">Last 10 transactions across all fee types</p>
                        </div>
                        <Link href={route('fees.payments.index')} className="text-sm font-bold text-emerald-600 hover:text-emerald-700 flex items-center gap-1">
                            View All <ArrowRight size={14} />
                        </Link>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead className="bg-slate-50 dark:bg-slate-900/40">
                                <tr>
                                    {['Receipt #', 'Student', 'Fee', 'Amount Paid', 'Balance', 'Status', 'Date'].map(h => (
                                        <th key={h} className="px-4 py-3 text-left text-xs font-black text-slate-500 uppercase tracking-wider">{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                {recentPayments.map((p) => (
                                    <tr key={p.id} className="hover:bg-slate-50 dark:hover:bg-slate-900/30 transition-colors">
                                        <td className="px-4 py-3">
                                            <Link href={route('fees.payments.show', p.id)} className="text-emerald-600 font-bold hover:underline">
                                                {p.receipt_number}
                                            </Link>
                                        </td>
                                        <td className="px-4 py-3 font-semibold text-slate-800 dark:text-slate-200">{p.student_name}</td>
                                        <td className="px-4 py-3 text-slate-600 dark:text-slate-400">{p.fee_name}</td>
                                        <td className="px-4 py-3 font-black text-emerald-600">{fmt(p.amount_paid)}</td>
                                        <td className="px-4 py-3 font-black text-rose-600">{fmt(p.balance)}</td>
                                        <td className="px-4 py-3">
                                            <span className={`px-2.5 py-1 rounded-full text-xs font-bold capitalize ${statusBadge(p.status)}`}>{p.status}</span>
                                        </td>
                                        <td className="px-4 py-3 text-slate-500">{p.payment_date}</td>
                                    </tr>
                                ))}
                                {recentPayments.length === 0 && (
                                    <tr>
                                        <td colSpan={7} className="px-4 py-12 text-center text-slate-400 text-sm">No payments recorded yet.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </Card>
            </div>
        </AuthenticatedLayout>
    );
}
