import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';
import Card from '@/Components/Card';
import { useState } from 'react';
import { BarChart3, TrendingUp, DollarSign, AlertCircle, Download, Filter, Receipt, Search, ChevronLeft } from 'lucide-react';

const STATUS_COLORS = {
    paid: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
    partial: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
    pending: 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400',
};

export default function ReportsIndex({ auth, summary = {}, byClass = [], byFeeType = [], byBankMethod = [], outstanding = [], sessions = [], terms = [], filters }) {
    const fmt = (n) => '₦' + Number(n || 0).toLocaleString('en-NG', { minimumFractionDigits: 2 });

    const [sessId, setSessId] = useState(filters?.session_id ?? '');
    const [termId, setTermId] = useState(filters?.term_id ?? '');

    const apply = () => router.get(route('fees.reports.index'), { session_id: sessId, term_id: termId }, { preserveState: true });

    const maxCollected = Math.max(1, ...(byClass.map(c => c.collected) || []), ...(byBankMethod.map(b => b.total) || []));
    const maxFeeType = Math.max(1, ...(byFeeType.map(f => f.collected) || []));

    const selectCls = "px-3 py-2 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-emerald-500 outline-none disabled:opacity-50 disabled:cursor-not-allowed";

    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link href={route('fees.index')} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors">
                            <ChevronLeft size={20} className="text-slate-600 dark:text-slate-400" />
                        </Link>
                        <div>
                            <h2 className="text-3xl font-black tracking-tight bg-gradient-to-r from-slate-900 via-emerald-900 to-slate-800 dark:from-white dark:via-emerald-200 dark:to-slate-100 bg-clip-text text-transparent">
                                Analytics & Reports
                            </h2>
                            <p className="text-slate-600 dark:text-slate-400 text-sm font-medium mt-1">
                                Fee collection analytics, class-wise breakdown, and outstanding tracking.
                            </p>
                        </div>
                    </div>
                    <a
                        href={`${route('fees.reports.export')}?session_id=${sessId}&term_id=${termId}`}
                        className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold rounded-2xl shadow-lg shadow-emerald-500/20 transition-all active:scale-95"
                    >
                        <Download size={18} /> Export CSV
                    </a>
                </div>
            }
        >
            <Head title="Fee Reports" />

            {/* Filters */}
            <Card className="!p-4 border border-slate-200 dark:border-slate-800 shadow-lg mb-6">
                <div className="flex flex-wrap gap-3 items-center">
                    <select
                        value={sessId}
                        onChange={e => {
                            setSessId(e.target.value);
                            setTermId('');
                        }}
                        className={selectCls}
                    >
                        <option value="">All Sessions</option>
                        {sessions.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                    </select>
                    <select
                        value={termId}
                        onChange={e => setTermId(e.target.value)}
                        className={selectCls}
                        disabled={!sessId}
                    >
                        <option value="">All Terms</option>
                        {terms
                            .filter(t => !sessId || t.academic_session_id == sessId)
                            .map(t => <option key={t.id} value={t.id}>{t.name}</option>)
                        }
                    </select>
                    <button onClick={apply} className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-2xl text-sm flex items-center gap-2 transition-colors">
                        <Filter size={14} /> Apply
                    </button>
                </div>
            </Card>

            {/* KPI Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
                {[
                    { label: 'Total Expected', value: fmt(summary.total_expected), icon: DollarSign, bg: 'bg-gradient-to-br from-indigo-500 to-purple-600', card: 'bg-indigo-50/50 dark:bg-indigo-900/20' },
                    { label: 'Total Collected', value: fmt(summary.total_collected), icon: TrendingUp, bg: 'bg-gradient-to-br from-emerald-500 to-teal-600', card: 'bg-emerald-50/50 dark:bg-emerald-900/20' },
                    { label: 'Outstanding', value: fmt(summary.total_outstanding), icon: AlertCircle, bg: 'bg-gradient-to-br from-rose-500 to-pink-600', card: 'bg-rose-50/50 dark:bg-rose-900/20' },
                    { label: 'Collection Rate', value: summary.collection_rate + '%', icon: BarChart3, bg: 'bg-gradient-to-br from-amber-500 to-orange-600', card: 'bg-amber-50/50 dark:bg-amber-900/20' },
                ].map(k => (
                    <Card key={k.label} className={`border-none ${k.card} shadow-xl`}>
                        <div className="flex items-center gap-4">
                            <div className={`p-3 rounded-2xl ${k.bg} shadow-lg`}>
                                <k.icon size={20} className="text-white" />
                            </div>
                            <div>
                                <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">{k.label}</p>
                                <p className="text-xl font-black text-slate-900 dark:text-white">{k.value}</p>
                            </div>
                        </div>
                    </Card>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                {/* By Class */}
                <Card className="border border-slate-200 dark:border-slate-800 shadow-xl">
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-5 flex items-center gap-2">
                        <BarChart3 size={20} className="text-emerald-500" /> Collection by Class
                    </h3>
                    <div className="space-y-3">
                        {byClass.map(c => (
                            <div key={c.class_name}>
                                <div className="flex justify-between text-sm mb-1">
                                    <span className="font-bold text-slate-700 dark:text-slate-300">{c.class_name}</span>
                                    <span className="font-black text-emerald-600">{fmt(c.collected)}</span>
                                </div>
                                <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2">
                                    <div
                                        className="bg-gradient-to-r from-emerald-500 to-teal-500 h-2 rounded-full transition-all"
                                        style={{ width: `${maxCollected > 0 ? (c.collected / maxCollected) * 100 : 0}%` }}
                                    />
                                </div>
                                <div className="flex justify-between text-xs text-slate-500 mt-0.5">
                                    <span>{c.paid_count} paid · {c.partial_count} partial · {c.pending_count} pending</span>
                                    <span>{fmt(c.outstanding)} outstanding</span>
                                </div>
                            </div>
                        ))}
                        {byClass.length === 0 && <p className="text-center text-slate-400 text-sm py-8">No data for selected filters</p>}
                    </div>
                </Card>

                {/* By Fee Type */}
                <Card className="border border-slate-200 dark:border-slate-800 shadow-xl">
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-5 flex items-center gap-2">
                        <TrendingUp size={20} className="text-indigo-500" /> Collection by Fee Type
                    </h3>
                    <div className="space-y-3">
                        {byFeeType.map(f => (
                            <div key={f.fee_name}>
                                <div className="flex justify-between text-sm mb-1">
                                    <span className="font-bold text-slate-700 dark:text-slate-300">{f.fee_name}</span>
                                    <span className="font-black text-indigo-600">{fmt(f.collected)}</span>
                                </div>
                                <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2">
                                    <div
                                        className="bg-gradient-to-r from-indigo-500 to-purple-500 h-2 rounded-full transition-all"
                                        style={{ width: `${maxFeeType > 0 ? (f.collected / maxFeeType) * 100 : 0}%` }}
                                    />
                                </div>
                                <p className="text-xs text-slate-500 mt-0.5">{f.count} transactions</p>
                            </div>
                        ))}
                        {byFeeType.length === 0 && <p className="text-center text-slate-400 text-sm py-8">No data for selected filters</p>}
                    </div>
                </Card>

                {/* By Bank/Method */}
                <Card className="lg:col-span-2 border border-slate-200 dark:border-slate-800 shadow-xl">
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-5 flex items-center gap-2">
                        <DollarSign size={20} className="text-emerald-500" /> Collection by Bank & Payment Method
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {byBankMethod.map((b, i) => (
                            <div key={i} className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800 hover:border-emerald-500/30 transition-colors">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-xs font-black text-slate-400 uppercase tracking-wider">{b.payment_method?.replace('_', ' ') || 'Other'}</span>
                                    <span className="px-2 py-0.5 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 text-[10px] font-bold">LIVE</span>
                                </div>
                                <p className="text-base font-black text-slate-900 dark:text-white leading-tight">
                                    {b.account_name || 'Direct Collection'}
                                    {b.bank_name && <span className="block text-xs font-medium text-slate-500 mt-0.5">{b.bank_name}</span>}
                                </p>
                                <p className="text-xl font-black text-emerald-600 mt-3">{fmt(b.total)}</p>
                            </div>
                        ))}
                        {byBankMethod.length === 0 && <p className="col-span-full text-center text-slate-400 text-sm py-8">No bank-wise collections recorded yet.</p>}
                    </div>
                </Card>
            </div>

            {/* Outstanding Balances */}
            <Card className="!p-0 border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden mb-8">
                <div className="p-5 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex items-center justify-between">
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        <AlertCircle size={18} className="text-rose-500" /> Outstanding Balances
                    </h3>
                    <span className="text-xs text-slate-500 font-medium">Top 20 pending</span>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead className="bg-slate-50 dark:bg-slate-900/40">
                            <tr>
                                {['Student', 'Reg #', 'Class', 'Fee', 'Total', 'Paid', 'Balance', 'Status', 'Action'].map(h => (
                                    <th key={h} className="px-4 py-3 text-left text-xs font-black text-slate-500 uppercase tracking-wider whitespace-nowrap">{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                            {outstanding.map((row) => (
                                <tr key={row.id} className="hover:bg-slate-50 dark:hover:bg-slate-900/30 transition-colors">
                                    <td className="px-4 py-3 font-semibold text-slate-800 dark:text-slate-200 whitespace-nowrap">{row.student_name}</td>
                                    <td className="px-4 py-3 font-mono text-xs text-slate-500">{row.reg_number}</td>
                                    <td className="px-4 py-3 text-slate-600 dark:text-slate-400">{row.class_name}</td>
                                    <td className="px-4 py-3 text-slate-600 dark:text-slate-400">{row.fee_name}</td>
                                    <td className="px-4 py-3 font-bold">{fmt(row.total_amount)}</td>
                                    <td className="px-4 py-3 font-bold text-emerald-600">{fmt(row.amount_paid)}</td>
                                    <td className="px-4 py-3 font-black text-rose-600">{fmt(row.balance)}</td>
                                    <td className="px-4 py-3">
                                        <span className={`px-2.5 py-1 rounded-full text-xs font-bold capitalize ${STATUS_COLORS[row.status]}`}>{row.status}</span>
                                    </td>
                                    <td className="px-4 py-3">
                                        <Link
                                            href={`${route('fees.payments.create')}?student_id=${row.student_id}&fee_payment_id=${row.id}`}
                                            className="px-3 py-1.5 text-xs font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 hover:bg-emerald-100 rounded-xl transition-colors"
                                        >
                                            Pay Now
                                        </Link>
                                    </td>
                                </tr>
                            ))}
                            {outstanding.length === 0 && (
                                <tr><td colSpan={9} className="px-4 py-12 text-center text-slate-400 text-sm">🎉 No outstanding balances!</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </Card>
        </AuthenticatedLayout>
    );
}
