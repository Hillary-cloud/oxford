import { Head, Link } from '@inertiajs/react';
import { GraduationCap, School } from 'lucide-react';

const METHOD_LABELS = { cash: 'Cash', transfer: 'Bank Transfer', pos: 'POS Terminal', bank_teller: 'Bank Teller' };
const STATUS_LABELS = { paid: 'PAID IN FULL', partial: 'PARTIAL PAYMENT', pending: 'PENDING' };

export default function Receipt({ auth, payment, schoolName, schoolAddress, schoolPhone, schoolEmail, logoUrl }) {
    const fmt = (n) => '₦' + Number(n || 0).toLocaleString('en-NG', { minimumFractionDigits: 2 });

    return (
        <>
            <Head title={`Receipt — ${payment.receipt_number}`} />

            <style>{`
                @media print {
                    .no-print { display: none !important; }
                    body { background: white !important; }
                    .receipt-container { box-shadow: none !important; margin: 0 !important; max-width: 100% !important; }
                }
                @page { margin: 12mm; }
            `}</style>

            {/* Print Controls */}
            <div className="no-print fixed top-4 right-4 flex gap-3 z-50">
                <button
                    onClick={() => window.print()}
                    className="px-5 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold rounded-2xl shadow-xl text-sm transition-all active:scale-95"
                >
                    🖨 Print Receipt
                </button>
                <Link
                    href={route('fees.payments.show', payment.id)}
                    className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-2xl text-sm transition-colors"
                >
                    ← Back
                </Link>
            </div>

            <div className="min-h-screen bg-slate-100 flex items-start justify-center py-8 px-4" style={{ fontFamily: '"Inter", system-ui, sans-serif' }}>
                <div className="receipt-container bg-white w-full max-w-[700px] shadow-2xl rounded-2xl overflow-hidden">

                    {/* Header */}
                    <div className="bg-gradient-to-r from-emerald-700 to-teal-700 px-8 py-6 text-white text-center sm:text-left">
                        <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
                            <div className="flex flex-col sm:flex-row items-center gap-6">
                                {logoUrl ? (
                                    <div className="bg-white p-2 rounded-2xl shadow-lg ring-4 ring-emerald-600/30">
                                        <img src={logoUrl} alt="School Logo" className="w-20 h-20 object-contain" />
                                    </div>
                                ) : (
                                    <div className="bg-white/20 p-4 rounded-2xl backdrop-blur-sm">
                                        <GraduationCap size={40} className="text-white" />
                                    </div>
                                )}
                                <div>
                                    <h1 className="text-2xl font-black tracking-tight uppercase leading-tight">{schoolName || 'School Name'}</h1>
                                    {schoolAddress && <p className="text-emerald-100 text-sm mt-1 max-w-sm">{schoolAddress}</p>}
                                    <div className="flex flex-wrap justify-center sm:justify-start gap-x-4 gap-y-1 mt-2 text-xs text-emerald-200">
                                        {schoolPhone && <span>📞 {schoolPhone}</span>}
                                        {schoolEmail && <span>✉ {schoolEmail}</span>}
                                    </div>
                                </div>
                            </div>
                            <div className="text-right w-full sm:w-auto">
                                <div className="bg-white/10 border border-white/20 backdrop-blur-md rounded-2xl px-5 py-4">
                                    <p className="text-[10px] font-black text-emerald-100 uppercase tracking-[0.2em]">OFFICIAL RECEIPT</p>
                                    <p className="text-2xl font-black text-white font-mono mt-1">{payment.receipt_number}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Status Banner */}
                    <div className={`px-8 py-2 text-center text-xs font-black uppercase tracking-widest ${payment.status === 'paid' ? 'bg-emerald-50 text-emerald-700' : payment.status === 'partial' ? 'bg-amber-50 text-amber-700' : 'bg-rose-50 text-rose-700'}`}>
                        {STATUS_LABELS[payment.status] || payment.status}
                    </div>

                    {/* Body */}
                    <div className="px-8 py-6">
                        {/* Student + Date row */}
                        <div className="flex flex-col sm:flex-row justify-between gap-6 mb-6 pb-6 border-b border-slate-100">
                            <div>
                                <p className="text-xs font-black text-slate-400 uppercase tracking-wider mb-2">RECEIVED FROM</p>
                                <p className="text-lg font-black text-slate-900">{payment.student.name}</p>
                                <p className="text-sm text-emerald-700 font-mono font-bold">{payment.student.reg}</p>
                                <p className="text-sm text-slate-500">{payment.student.class}</p>
                                <p className="text-xs text-slate-400 capitalize">{payment.student.gender}</p>
                            </div>
                            <div className="text-right">
                                <div className="mb-3">
                                    <p className="text-xs font-black text-slate-400 uppercase tracking-wider">DATE</p>
                                    <p className="text-sm font-bold text-slate-900">{payment.payment_date}</p>
                                </div>
                                <div className="mb-3">
                                    <p className="text-xs font-black text-slate-400 uppercase tracking-wider">SESSION</p>
                                    <p className="text-sm font-bold text-slate-900">{payment.academic_session}</p>
                                </div>
                                {payment.term && (
                                    <div>
                                        <p className="text-xs font-black text-slate-400 uppercase tracking-wider">TERM</p>
                                        <p className="text-sm font-bold text-slate-900">{payment.term}</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Fee Row */}
                        <div className="mb-6">
                            <p className="text-xs font-black text-slate-400 uppercase tracking-wider mb-3">FEE DETAILS</p>
                            <table className="w-full text-sm border-collapse">
                                <thead>
                                    <tr className="bg-slate-50 text-left">
                                        <th className="px-4 py-2.5 font-black text-slate-600 text-xs uppercase tracking-wider rounded-l-xl">Description</th>
                                        <th className="px-4 py-2.5 font-black text-slate-600 text-xs uppercase tracking-wider">Total</th>
                                        <th className="px-4 py-2.5 font-black text-slate-600 text-xs uppercase tracking-wider">Paid</th>
                                        <th className="px-4 py-2.5 font-black text-slate-600 text-xs uppercase tracking-wider rounded-r-xl">Balance</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        <td className="px-4 py-3 text-slate-900 font-semibold">{payment.fee_name}</td>
                                        <td className="px-4 py-3 font-bold text-slate-900">{fmt(payment.total_amount)}</td>
                                        <td className="px-4 py-3 font-black text-emerald-700">{fmt(payment.amount_paid)}</td>
                                        <td className={`px-4 py-3 font-black ${payment.balance > 0 ? 'text-rose-600' : 'text-emerald-700'}`}>{fmt(payment.balance)}</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>

                        {/* Payment Method Breakdown */}
                        <div className="mb-6">
                            <p className="text-xs font-black text-slate-400 uppercase tracking-wider mb-3">PAYMENT METHOD(S)</p>
                            <div className="space-y-2">
                                {payment.payment_items.map((item, i) => (
                                    <div key={i} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                                        <div>
                                            <span className="text-sm font-bold text-slate-800">{METHOD_LABELS[item.payment_method] ?? item.payment_method}</span>
                                            {item.account_name && <span className="text-xs text-slate-500 ml-2">via {item.account_name}</span>}
                                            {item.bank_name && <span className="text-xs text-slate-500 ml-1">({item.bank_name})</span>}
                                            {item.reference_number && <span className="text-xs font-mono text-slate-400 ml-2">Ref: {item.reference_number}</span>}
                                        </div>
                                        <span className="text-sm font-black text-emerald-700">{fmt(item.amount)}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Totals */}
                        <div className="border-t-2 border-slate-200 pt-4">
                            <div className="flex justify-end">
                                <div className="w-56">
                                    <div className="flex justify-between text-sm mb-1">
                                        <span className="text-slate-600">Total Amount Paid</span>
                                        <span className="font-black text-emerald-700 text-base">{fmt(payment.amount_paid)}</span>
                                    </div>
                                    {payment.balance > 0 && (
                                        <div className="flex justify-between text-sm">
                                            <span className="text-slate-600">Outstanding Balance</span>
                                            <span className="font-black text-rose-600">{fmt(payment.balance)}</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {payment.notes && (
                            <div className="mt-4 p-3 bg-slate-50 rounded-xl">
                                <p className="text-xs text-slate-500"><strong>Notes:</strong> {payment.notes}</p>
                            </div>
                        )}
                    </div>

                    {/* Footer */}
                    <div className="px-8 py-5 bg-slate-50 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
                        <div>
                            <p className="text-xs text-slate-500">Cashier: <strong>{payment.created_by}</strong></p>
                            <p className="text-xs text-slate-400 font-mono">Generated: {new Date().toLocaleString()}</p>
                        </div>
                        <div className="text-center sm:text-right">
                            <div className="border-t border-slate-400 w-32 mx-auto sm:ml-auto mb-1 mt-4 sm:mt-0" />
                            <p className="text-xs text-slate-500">Authorized Signature</p>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
