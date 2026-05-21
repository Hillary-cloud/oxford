import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';
import Card from '@/Components/Card';
import { Receipt, Calendar, ArrowLeft, Download, DollarSign, Clock, CheckCircle2, AlertCircle } from 'lucide-react';

const STATUS_COLORS = {
    paid: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20',
    partial: 'text-amber-600 bg-amber-50 dark:bg-amber-900/20',
    pending: 'text-rose-600 bg-rose-50 dark:bg-rose-900/20',
};

export default function StudentLedger({ auth, student, payments, total_paid, total_balance }) {
    const fmt = (n) => '₦' + Number(n || 0).toLocaleString('en-NG', { minimumFractionDigits: 2 });

    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link href={route('fees.payments.index')} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors">
                            <ArrowLeft size={20} className="text-slate-600" />
                        </Link>
                        <div>
                            <h2 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">Student Payment Ledger</h2>
                            <p className="text-slate-500 text-sm font-medium">{student.name} ({student.reg})</p>
                        </div>
                    </div>
                    <div className="flex gap-4">
                        <div className="hidden sm:flex flex-col items-end">
                            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Balance</span>
                            <span className="text-xl font-black text-rose-600">{fmt(total_balance)}</span>
                        </div>
                    </div>
                </div>
            }
        >
            <Head title={`Ledger — ${student.name}`} />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <Card className="bg-gradient-to-br from-emerald-500 to-teal-600 text-white border-none shadow-xl">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-white/20 rounded-2xl">
                            <DollarSign size={24} />
                        </div>
                        <div>
                            <p className="text-xs font-bold uppercase tracking-widest opacity-80">Total Paid</p>
                            <p className="text-2xl font-black">{fmt(total_paid)}</p>
                        </div>
                    </div>
                </Card>

                <Card className="bg-emerald-50/50 dark:bg-emerald-900/10 border-emerald-100 dark:border-emerald-900/30">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 rounded-2xl">
                            <CheckCircle2 size={24} />
                        </div>
                        <div>
                            <p className="text-xs font-bold uppercase tracking-widest text-slate-500">Payments Made</p>
                            <p className="text-2xl font-black text-slate-900 dark:text-white">{payments.length}</p>
                        </div>
                    </div>
                </Card>

                <Card className="bg-rose-50/50 dark:bg-rose-900/10 border-rose-100 dark:border-rose-900/30">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-rose-100 dark:bg-rose-900/30 text-rose-600 rounded-2xl">
                            <AlertCircle size={24} />
                        </div>
                        <div>
                            <p className="text-xs font-bold uppercase tracking-widest text-slate-500">Outstanding Balance</p>
                            <p className="text-2xl font-black text-rose-600">{fmt(total_balance)}</p>
                        </div>
                    </div>
                </Card>
            </div>

            <Card className="!p-0 border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden">
                <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/50">
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        <Receipt size={20} className="text-emerald-500" /> Transaction History
                    </h3>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead className="bg-slate-50 dark:bg-slate-900/40">
                            <tr>
                                <th className="px-6 py-4 text-left text-xs font-black text-slate-500 uppercase tracking-widest">Receipt #</th>
                                <th className="px-6 py-4 text-left text-xs font-black text-slate-500 uppercase tracking-widest">Fee Type</th>
                                <th className="px-6 py-4 text-left text-xs font-black text-slate-500 uppercase tracking-widest">Session / Term</th>
                                <th className="px-6 py-4 text-left text-xs font-black text-slate-500 uppercase tracking-widest">Amount</th>
                                <th className="px-6 py-4 text-left text-xs font-black text-slate-500 uppercase metallic-widest">Paid</th>
                                <th className="px-6 py-4 text-left text-xs font-black text-slate-500 uppercase tracking-widest">Balance</th>
                                <th className="px-6 py-4 text-left text-xs font-black text-slate-500 uppercase tracking-widest">Status</th>
                                <th className="px-6 py-4 text-left text-xs font-black text-slate-500 uppercase tracking-widest">Date</th>
                                <th className="px-6 py-4 text-right text-xs font-black text-slate-500 uppercase tracking-widest">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                            {payments.map((p) => (
                                <tr key={p.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                                    <td className="px-6 py-4 font-mono font-bold text-slate-900 dark:text-white uppercase">{p.receipt_number}</td>
                                    <td className="px-6 py-4 text-slate-700 dark:text-slate-300 font-semibold">{p.fee_name}</td>
                                    <td className="px-6 py-4 text-slate-500 text-xs">
                                        <div className="font-bold">{p.session}</div>
                                        <div>{p.term || '—'}</div>
                                    </td>
                                    <td className="px-6 py-4 text-slate-900 dark:text-white font-bold">{fmt(p.total_amount)}</td>
                                    <td className="px-6 py-4 text-emerald-600 font-black">{fmt(p.amount_paid)}</td>
                                    <td className={`px-6 py-4 font-black ${p.balance > 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
                                        {fmt(p.balance)}
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`px-3 py-1 rounded-2xl text-[10px] font-black uppercase tracking-widest ${STATUS_COLORS[p.status]}`}>
                                            {p.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-slate-500 text-xs">
                                        <div className="flex items-center gap-1">
                                            <Calendar size={12} />
                                            {p.payment_date}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <Link
                                            href={route('fees.payments.show', p.id)}
                                            className="px-4 py-2 bg-slate-100 hover:bg-emerald-100 hover:text-emerald-700 dark:bg-slate-800 dark:hover:bg-emerald-900/30 text-slate-600 dark:text-slate-400 rounded-xl text-xs font-bold transition-all inline-flex items-center gap-2"
                                        >
                                            View Details
                                        </Link>
                                    </td>
                                </tr>
                            ))}
                            {payments.length === 0 && (
                                <tr>
                                    <td colSpan="9" className="px-6 py-20 text-center text-slate-400">
                                        <div className="flex flex-col items-center gap-4">
                                            <Clock size={48} className="opacity-20" />
                                            <div className="font-bold">No payment history found for this student.</div>
                                            {/* Pre-fill record payment for this student */}
                                            <Link
                                                href={`${route('fees.payments.create')}?student_id=${student.id}`}
                                                className="text-emerald-600 hover:underline font-bold text-sm"
                                            >
                                                Record First Payment →
                                            </Link>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </Card>
        </AuthenticatedLayout>
    );
}
