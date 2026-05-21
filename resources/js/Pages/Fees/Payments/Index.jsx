import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm, router } from '@inertiajs/react';
import Card from '@/Components/Card';
import { useState } from 'react';
import { Search, Filter, Receipt, Eye, ArrowLeft, ArrowRight, PlusCircle, ChevronLeft } from 'lucide-react';

const STATUS_COLORS = {
    paid: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
    partial: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
    pending: 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400',
};

const METHOD_LABELS = { cash: 'Cash', transfer: 'Transfer', pos: 'POS', bank_teller: 'Teller' };

export default function PaymentsIndex({ auth, payments, feeTypes, sessions, terms, filters }) {
    const fmt = (n) => '₦' + Number(n).toLocaleString('en-NG', { minimumFractionDigits: 2 });

    const [search, setSearch] = useState(filters?.search ?? '');
    const [status, setStatus] = useState(filters?.status ?? '');
    const [feeId, setFeeId] = useState(filters?.fee_type_id ?? '');
    const [sessId, setSessId] = useState(filters?.session_id ?? '');
    const [termId, setTermId] = useState(filters?.term_id ?? '');

    const applyFilters = () => {
        router.get(route('fees.payments.index'), { search, status, fee_type_id: feeId, session_id: sessId, term_id: termId }, { preserveState: true });
    };

    const clearFilters = () => {
        setSearch(''); setStatus(''); setFeeId(''); setSessId(''); setTermId('');
        router.get(route('fees.payments.index'));
    };

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
                                Payments Ledger
                            </h2>
                            <p className="text-slate-600 dark:text-slate-400 text-sm font-medium mt-1">
                                Full history of all fee payments.
                            </p>
                        </div>
                    </div>
                    <Link
                        href={route('fees.payments.create')}
                        className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold rounded-2xl shadow-lg shadow-emerald-500/20 transition-all active:scale-95"
                    >
                        <PlusCircle size={18} /> Record Payment
                    </Link>
                </div>
            }
        >
            <Head title="Payments Ledger" />

            {/* Filters */}
            <Card className="!p-4 border border-slate-200 dark:border-slate-800 shadow-lg mb-6">
                <div className="flex flex-wrap gap-3 items-end">
                    <div className="flex-1 min-w-48 relative">
                        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            onKeyDown={e => e.key === 'Enter' && applyFilters()}
                            placeholder="Receipt # or student name..."
                            className="w-full pl-9 pr-4 py-2 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                        />
                    </div>
                    <select value={status} onChange={e => setStatus(e.target.value)} className={selectCls}>
                        <option value="">All Status</option>
                        <option value="paid">Paid</option>
                        <option value="partial">Partial</option>
                        <option value="pending">Pending</option>
                    </select>
                    <select value={feeId} onChange={e => setFeeId(e.target.value)} className={selectCls}>
                        <option value="">All Fee Types</option>
                        {feeTypes.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
                    </select>
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
                    <button onClick={applyFilters} className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-2xl text-sm transition-colors flex items-center gap-2">
                        <Filter size={14} /> Filter
                    </button>
                    <button onClick={clearFilters} className="px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold rounded-2xl text-sm transition-colors">
                        Clear
                    </button>
                </div>
            </Card>

            {/* Table */}
            <Card className="!p-0 border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead className="bg-slate-50 dark:bg-slate-900/40">
                            <tr>
                                {['Receipt #', 'Student', 'Fee', 'Total', 'Paid', 'Balance', 'Method(s)', 'Status', 'Date', ''].map(h => (
                                    <th key={h} className="px-4 py-3 text-left text-xs font-black text-slate-500 uppercase tracking-wider whitespace-nowrap">{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                            {payments.data.map((p) => (
                                <tr key={p.id} className="hover:bg-slate-50 dark:hover:bg-slate-900/30 transition-colors">
                                    <td className="px-4 py-3">
                                        <Link href={route('fees.payments.show', p.id)} className="text-emerald-600 font-black hover:underline font-mono text-xs">
                                            {p.receipt_number}
                                        </Link>
                                    </td>
                                    <td className="px-4 py-3">
                                        <div className="font-semibold text-slate-800 dark:text-slate-200 whitespace-nowrap">{p.student.name}</div>
                                        <div className="text-xs text-slate-500 font-mono">{p.student.reg}</div>
                                    </td>
                                    <td className="px-4 py-3 text-slate-600 dark:text-slate-400 whitespace-nowrap">{p.fee_name}</td>
                                    <td className="px-4 py-3 font-bold text-slate-700 dark:text-slate-300">{fmt(p.total_amount)}</td>
                                    <td className="px-4 py-3 font-black text-emerald-600">{fmt(p.amount_paid)}</td>
                                    <td className="px-4 py-3 font-black text-rose-600">{fmt(p.balance)}</td>
                                    <td className="px-4 py-3">
                                        <div className="flex flex-wrap gap-1">
                                            {p.methods.map(m => (
                                                <span key={m} className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-full text-xs font-bold">
                                                    {METHOD_LABELS[m] ?? m}
                                                </span>
                                            ))}
                                        </div>
                                    </td>
                                    <td className="px-4 py-3">
                                        <span className={`px-2.5 py-1 rounded-full text-xs font-bold capitalize ${STATUS_COLORS[p.status]}`}>{p.status}</span>
                                    </td>
                                    <td className="px-4 py-3 text-slate-500 whitespace-nowrap">{p.payment_date}</td>
                                    <td className="px-4 py-3">
                                        <div className="flex gap-1">
                                            <Link href={route('fees.payments.show', p.id)} className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors text-slate-500 hover:text-indigo-600" title="View">
                                                <Eye size={14} />
                                            </Link>
                                            <Link href={route('fees.payments.receipt', p.id)} className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors text-slate-500 hover:text-emerald-600" title="Receipt">
                                                <Receipt size={14} />
                                            </Link>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {payments.data.length === 0 && (
                                <tr>
                                    <td colSpan={10} className="px-4 py-16 text-center text-slate-400 text-sm">No payments found matching your filters.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {payments.last_page > 1 && (
                    <div className="p-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                        <p className="text-sm text-slate-500">
                            Showing {payments.from}–{payments.to} of {payments.total} payments
                        </p>
                        <div className="flex gap-2">
                            {payments.prev_page_url && (
                                <Link href={payments.prev_page_url} className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 flex items-center gap-1">
                                    <ArrowLeft size={12} /> Prev
                                </Link>
                            )}
                            {payments.next_page_url && (
                                <Link href={payments.next_page_url} className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 flex items-center gap-1">
                                    Next <ArrowRight size={12} />
                                </Link>
                            )}
                        </div>
                    </div>
                )}
            </Card>
        </AuthenticatedLayout>
    );
}
