import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';
import Card from '@/Components/Card';
import { ArrowLeft, Receipt as ReceiptIcon, Printer, CreditCard } from 'lucide-react';

const STATUS_COLORS = {
    paid: 'bg-emerald-100 text-emerald-700',
    partial: 'bg-amber-100 text-amber-700',
    pending: 'bg-rose-100 text-rose-700',
};

const METHOD_LABELS = { cash: 'Cash', transfer: 'Bank Transfer', pos: 'POS Terminal', bank_teller: 'Bank Teller' };

export default function ShowPayment({ auth, payment }) {
    const fmt = (n) => '₦' + Number(n || 0).toLocaleString('en-NG', { minimumFractionDigits: 2 });

    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link href={route('fees.payments.index')} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors text-slate-500">
                            <ArrowLeft size={22} />
                        </Link>
                        <div>
                            <h2 className="text-3xl font-black tracking-tight bg-gradient-to-r from-slate-900 via-emerald-900 to-slate-800 dark:from-white dark:via-emerald-200 dark:to-slate-100 bg-clip-text text-transparent">
                                Payment Details
                            </h2>
                            <p className="text-slate-500 text-sm font-mono mt-0.5">{payment.receipt_number}</p>
                        </div>
                    </div>
                    <div className="flex gap-3">
                        <Link
                            href={route('fees.payments.receipt', payment.id)}
                            className="inline-flex items-center gap-2 px-4 py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold rounded-2xl text-sm transition-colors"
                        >
                            <Printer size={16} /> Print Receipt
                        </Link>
                        {payment.status !== 'paid' && (
                            <Link
                                href={`${route('fees.payments.create')}?student_id=${payment.student.id}&fee_payment_id=${payment.id}`}
                                className="inline-flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold rounded-2xl text-sm transition-all"
                            >
                                <CreditCard size={16} /> Record Follow-up Payment
                            </Link>
                        )}
                    </div>
                </div>
            }
        >
            <Head title={`Payment — ${payment.receipt_number}`} />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main details */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Student Info */}
                    <Card className="border border-slate-200 dark:border-slate-800 shadow-xl">
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Student Information</h3>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                            {[
                                { label: 'Name', value: payment.student.name },
                                { label: 'Reg. Number', value: payment.student.reg },
                                { label: 'Class', value: payment.student.class },
                                { label: 'Gender', value: payment.student.gender },
                                { label: 'Session', value: payment.academic_session },
                                { label: 'Term', value: payment.term || 'N/A' },
                            ].map(({ label, value }) => (
                                <div key={label}>
                                    <p className="text-xs font-black text-slate-500 uppercase tracking-wider">{label}</p>
                                    <p className="text-sm font-bold text-slate-900 dark:text-white mt-0.5 capitalize">{value}</p>
                                </div>
                            ))}
                        </div>
                    </Card>

                    {/* Payment Method Breakdown */}
                    <Card className="border border-slate-200 dark:border-slate-800 shadow-xl">
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Payment Breakdown</h3>
                        <div className="space-y-3">
                            {payment.payment_items.map((item, i) => (
                                <div key={i} className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-700">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                                            <CreditCard size={18} className="text-emerald-600" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-black text-slate-900 dark:text-white">{METHOD_LABELS[item.payment_method] ?? item.payment_method}</p>
                                            {item.account_name && <p className="text-xs text-slate-500">{item.account_name} {item.bank_name ? `· ${item.bank_name}` : ''} {item.account_number ? `· ${item.account_number}` : ''}</p>}
                                            {item.reference_number && <p className="text-xs font-mono text-slate-500">Ref: {item.reference_number}</p>}
                                        </div>
                                    </div>
                                    <p className="text-lg font-black text-emerald-600">{fmt(item.amount)}</p>
                                </div>
                            ))}
                        </div>

                        {payment.notes && (
                            <div className="mt-4 p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl">
                                <p className="text-xs font-black text-slate-500 uppercase tracking-wider mb-1">Notes</p>
                                <p className="text-sm text-slate-700 dark:text-slate-300">{payment.notes}</p>
                            </div>
                        )}
                    </Card>
                </div>

                {/* Summary sidebar */}
                <div className="space-y-6">
                    <Card className={`border shadow-xl ${payment.status === 'paid' ? 'border-emerald-200 dark:border-emerald-800 bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20' : 'border-amber-200 dark:border-amber-800 bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20'}`}>
                        <div className="text-center mb-4">
                            <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-black uppercase tracking-wider ${STATUS_COLORS[payment.status]}`}>
                                <ReceiptIcon size={14} />
                                {payment.status}
                            </div>
                        </div>

                        <div className="space-y-3 text-sm">
                            <div className="flex justify-between">
                                <span className="text-slate-600 dark:text-slate-400">Fee</span>
                                <span className="font-bold text-slate-800 dark:text-slate-200">{payment.fee_name}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-slate-600 dark:text-slate-400">Total Fee</span>
                                <span className="font-bold">{fmt(payment.total_amount)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-slate-600 dark:text-slate-400">Amount Paid</span>
                                <span className="font-black text-emerald-700">{fmt(payment.amount_paid)}</span>
                            </div>
                            <div className="border-t border-slate-200 dark:border-slate-700 pt-3 flex justify-between">
                                <span className="font-bold">Balance</span>
                                <span className={`font-black text-xl ${payment.balance > 0 ? 'text-rose-600' : 'text-emerald-700'}`}>{fmt(payment.balance)}</span>
                            </div>
                        </div>

                        <div className="mt-4">
                            <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2.5">
                                <div
                                    className="bg-gradient-to-r from-emerald-500 to-teal-500 h-2.5 rounded-full"
                                    style={{ width: `${Math.round((payment.amount_paid / payment.total_amount) * 100)}%` }}
                                />
                            </div>
                            <p className="text-xs text-center text-slate-500 mt-1">
                                {Math.round((payment.amount_paid / payment.total_amount) * 100)}% paid
                            </p>
                        </div>
                    </Card>

                    <Card className="border border-slate-200 dark:border-slate-800 shadow-xl">
                        <p className="text-xs font-black text-slate-500 uppercase tracking-wider">Date</p>
                        <p className="text-sm font-bold text-slate-900 dark:text-white mt-1">{payment.payment_date}</p>
                        <p className="text-xs font-black text-slate-500 uppercase tracking-wider mt-4">Recorded By</p>
                        <p className="text-sm font-bold text-slate-900 dark:text-white mt-1">{payment.created_by}</p>
                        <p className="text-xs font-black text-slate-500 uppercase tracking-wider mt-4">Recorded At</p>
                        <p className="text-sm font-bold text-slate-900 dark:text-white mt-1">{payment.created_at}</p>
                    </Card>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
