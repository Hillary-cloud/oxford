import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm, router } from '@inertiajs/react';
import Card from '@/Components/Card';
import { useState, useEffect, useRef } from 'react';
import {
    Search, Plus, Trash2, CreditCard, Building2, Smartphone,
    Banknote, Wallet, ArrowLeft, ChevronLeft, User, GraduationCap,
    Check, Calendar, FileText, Info
} from 'lucide-react';

const METHOD_ICONS = { cash: Banknote, transfer: Building2, pos: Smartphone, bank_teller: Wallet };
const METHOD_LABELS = { cash: 'Cash', transfer: 'Bank Transfer', pos: 'POS Terminal', bank_teller: 'Bank Teller' };

function StudentSearch({ onSelect, preselectedStudent, error }) {
    const [query, setQuery] = useState(preselectedStudent ? `${preselectedStudent.name}` : '');
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const [selected, setSelected] = useState(preselectedStudent ?? null);
    const [showDropdown, setShowDropdown] = useState(false);
    const dropdownRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setShowDropdown(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    useEffect(() => {
        if (selected) return;
        if (query.length < 2) { setResults([]); setShowDropdown(false); return; }

        const t = setTimeout(async () => {
            setLoading(true);
            try {
                const res = await fetch(`/students?search=${encodeURIComponent(query)}&format=json`);
                const data = await res.json();
                setResults(data.students ?? []);
                setShowDropdown(true);
            } catch { } finally { setLoading(false); }
        }, 400);
        return () => clearTimeout(t);
    }, [query, selected]);

    const pick = (s) => {
        setSelected(s);
        setQuery(`${s.surname} ${s.othername}`);
        setResults([]);
        setShowDropdown(false);
        onSelect(s);
    };

    const clear = () => {
        setSelected(null);
        setQuery('');
        setResults([]);
        onSelect(null);
    };

    return (
        <div className="relative group" ref={dropdownRef}>
            <div className="relative">
                <div className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors ${loading ? 'animate-pulse text-emerald-500' : 'text-slate-400 group-focus-within:text-emerald-500'}`}>
                    <Search size={18} />
                </div>
                <input
                    value={query}
                    onChange={e => {
                        setQuery(e.target.value);
                        if (selected) clear();
                    }}
                    onFocus={() => { if (results.length > 0) setShowDropdown(true); }}
                    placeholder="Type student name or registration number..."
                    className={`w-full pl-12 pr-12 py-3.5 rounded-2xl border ${error ? 'border-rose-300 dark:border-rose-900 ring-4 ring-rose-500/10' : 'border-slate-200 dark:border-slate-700 focus:border-emerald-500'} bg-white dark:bg-slate-900 text-slate-900 dark:text-white dark:focus:ring-emerald-500/20 focus:ring-4 focus:ring-emerald-500/10 outline-none text-sm transition-all shadow-sm`}
                />

                {selected ? (
                    <button
                        type="button"
                        onClick={clear}
                        className="absolute right-4 top-1/2 -translate-y-1/2 p-1.5 hover:bg-rose-50 dark:hover:bg-rose-900/30 rounded-lg text-rose-500 transition-all active:scale-90"
                    >
                        <Trash2 size={16} />
                    </button>
                ) : (
                    query.length > 0 && !loading && (
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-black uppercase text-slate-400 tracking-widest pointer-events-none">
                            Searching...
                        </div>
                    )
                )}
            </div>

            {showDropdown && (
                <div className="absolute z-50 left-0 right-0 mt-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                    {results.length > 0 ? (
                        <div className="max-h-64 overflow-y-auto scrollbar-hide py-2">
                            <p className="px-4 py-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">Select Student</p>
                            {results.map(s => (
                                <button
                                    key={s.id}
                                    type="button"
                                    onClick={() => pick(s)}
                                    className="w-full text-left px-4 py-3 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-all flex items-center justify-between group/item"
                                >
                                    <div className="min-w-0">
                                        <div className="font-black text-slate-900 dark:text-white text-sm group-hover/item:text-emerald-700 dark:group-hover/item:text-emerald-400 transition-colors uppercase tracking-tight">{s.surname} {s.othername}</div>
                                        <div className="text-[10px] text-slate-500 font-bold font-mono uppercase mt-0.5">{s.registration_number} · {s.class_name}</div>
                                    </div>
                                    <Plus size={14} className="text-slate-300 group-hover/item:text-emerald-500 transition-colors" />
                                </button>
                            ))}
                        </div>
                    ) : query.length >= 2 && !loading ? (
                        <div className="p-8 text-center">
                            <User size={32} className="mx-auto text-slate-300 mb-2 opacity-20" />
                            <p className="text-xs font-black text-slate-400 uppercase tracking-widest">No students found</p>
                        </div>
                    ) : null}
                </div>
            )}

            {selected && (
                <div className="mt-4 p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-[2rem] border border-emerald-100 dark:border-emerald-900/30 flex items-center gap-4 animate-in slide-in-from-top-2">
                    <div className="w-12 h-12 rounded-2xl bg-emerald-600 flex items-center justify-center text-white shadow-lg shadow-emerald-500/20">
                        <User size={24} />
                    </div>
                    <div>
                        <p className="text-sm font-black text-emerald-900 dark:text-emerald-300 leading-none uppercase tracking-tight">{selected.surname ?? selected.name} {selected.othername ?? ''}</p>
                        <p className="text-[10px] text-emerald-600/70 dark:text-emerald-400/70 font-black font-mono mt-1 uppercase tracking-widest">{selected.registration_number ?? selected.reg} · {selected.class_name ?? selected.class}</p>
                    </div>
                    <div className="ml-auto flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                        <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Selected</span>
                    </div>
                </div>
            )}
        </div>
    );
}

export default function RecordPayment({ auth, feeTypes, sessions, terms, accounts, classSections, preselectedStudent, existingBalance }) {
    const fmt = (n) => '₦' + Number(n || 0).toLocaleString('en-NG', { minimumFractionDigits: 2 });

    const { data, setData, post, processing, errors } = useForm({
        student_id: preselectedStudent?.id ?? '',
        fee_type_id: existingBalance?.fee_type_id ?? '',
        academic_session_id: '',
        term_id: '',
        payment_date: new Date().toISOString().split('T')[0],
        notes: '',
        fee_payment_id: existingBalance?.id ?? '',
        payment_items: [
            { method: 'cash', amount: '', account_id: '', reference: '', notes: '' }
        ],
    });

    const selectedFee = feeTypes.find(f => f.id === data.fee_type_id);
    const totalItemAmount = data.payment_items.reduce((sum, i) => sum + (parseFloat(i.amount) || 0), 0);
    const feeAmount = existingBalance ? parseFloat(existingBalance.balance) : (parseFloat(selectedFee?.amount) || 0);
    const remainingBalance = Math.max(0, feeAmount - totalItemAmount);

    const addItem = () => setData('payment_items', [...data.payment_items, { method: 'cash', amount: '', account_id: '', reference: '', notes: '' }]);
    const removeItem = (i) => setData('payment_items', data.payment_items.filter((_, idx) => idx !== i));
    const updateItem = (i, field, value) => {
        const items = [...data.payment_items];
        items[i] = { ...items[i], [field]: value };
        setData('payment_items', items);
    };

    const submit = (e) => {
        e.preventDefault();
        post(route('fees.payments.store'));
    };

    const inputCls = "w-full px-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none text-sm transition-all font-medium";
    const labelCls = "block text-[10px] font-black text-slate-500 dark:text-slate-400 mb-1.5 uppercase tracking-widest px-1";

    const nonCashAccounts = accounts.filter(a => a.account_type !== 'cash');

    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link href={route('fees.payments.index')} className="p-2.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-2xl transition-all text-slate-500 hover:text-slate-900 dark:hover:text-white active:scale-90 bg-white dark:bg-slate-900 shadow-sm border border-slate-100 dark:border-slate-800">
                            <ChevronLeft size={20} />
                        </Link>
                        <div>
                            <h2 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white leading-tight uppercase">
                                Record Payment
                            </h2>
                            <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mt-0.5">
                                {existingBalance ? 'Completing Previous Payment' : 'Process New Fee Transaction'}
                            </p>
                        </div>
                    </div>
                </div>
            }
        >
            <Head title="Record Payment" />

            <form onSubmit={submit} className="grid grid-cols-1 lg:grid-cols-12 gap-8 max-w-7xl mx-auto">
                {/* Left Side: Forms */}
                <div className="lg:col-span-8 space-y-6">
                    {/* Identification */}
                    <Card className="border-0 shadow-2xl shadow-slate-200/50 dark:shadow-none bg-white dark:bg-slate-900 overflow-visible p-8">
                        <div className="flex items-center gap-3 mb-8">
                            <div className="w-10 h-10 rounded-2xl bg-indigo-500/10 flex items-center justify-center text-indigo-600">
                                <GraduationCap size={20} />
                            </div>
                            <h3 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight">Student & Fee Identity</h3>
                        </div>

                        <div className="space-y-6">
                            <div className="relative z-30">
                                <label className={labelCls}>Select Student *</label>
                                <StudentSearch
                                    preselectedStudent={preselectedStudent}
                                    onSelect={(s) => setData('student_id', s?.id ?? '')}
                                    error={errors.student_id}
                                />
                                {errors.student_id && <p className="text-rose-500 text-[10px] mt-2 font-black uppercase tracking-widest">{errors.student_id}</p>}
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 relative z-10">
                                {!existingBalance ? (
                                    <div className="col-span-full">
                                        <label className={labelCls}>Fee Type *</label>
                                        <div className="relative group">
                                            <select value={data.fee_type_id} onChange={e => setData('fee_type_id', e.target.value)} className={inputCls + " appearance-none"}>
                                                <option value="">Choose a fee to pay...</option>
                                                {feeTypes.map(f => (
                                                    <option key={f.id} value={f.id}>{f.name} — {fmt(f.amount)}</option>
                                                ))}
                                            </select>
                                            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 group-hover:text-emerald-500 transition-colors">
                                                <Plus size={16} />
                                            </div>
                                        </div>
                                        {errors.fee_type_id && <p className="text-rose-500 text-[10px] mt-2 font-black uppercase tracking-widest">{errors.fee_type_id}</p>}
                                    </div>
                                ) : (
                                    <div className="col-span-full p-5 bg-amber-50 dark:bg-amber-900/10 border-2 border-dashed border-amber-200 dark:border-amber-800 rounded-3xl flex items-start gap-4">
                                        <div className="p-3 bg-amber-100 dark:bg-amber-900/30 rounded-2xl text-amber-600">
                                            <Info size={20} />
                                        </div>
                                        <div>
                                            <p className="text-sm font-black text-amber-800 dark:text-amber-200 uppercase tracking-tight">Continuing Partial Payment</p>
                                            <p className="text-xs text-amber-600 dark:text-amber-400 mt-1 font-medium leading-relaxed">
                                                Recording a follow-up payment for <strong className="font-black text-amber-900 dark:text-amber-100 uppercase">{existingBalance.fee_name}</strong>.
                                                Balance: <strong className="text-base font-black ml-1">{fmt(existingBalance.balance)}</strong>
                                            </p>
                                        </div>
                                    </div>
                                )}

                                <div>
                                    <label className={labelCls}>Academic Session *</label>
                                    <select
                                        value={data.academic_session_id}
                                        onChange={e => {
                                            const val = e.target.value;
                                            setData(d => ({ ...d, academic_session_id: val, term_id: '' }));
                                        }}
                                        className={inputCls}
                                    >
                                        <option value="">Select session...</option>
                                        {sessions.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                                    </select>
                                    {errors.academic_session_id && <p className="text-rose-500 text-[10px] mt-1.5 font-bold">{errors.academic_session_id}</p>}
                                </div>
                                <div>
                                    <label className={labelCls}>Academic Term</label>
                                    <select
                                        value={data.term_id}
                                        onChange={e => setData('term_id', e.target.value)}
                                        className={inputCls}
                                        disabled={!data.academic_session_id}
                                    >
                                        <option value="">N/A (Full Year)</option>
                                        {terms
                                            .filter(t => !data.academic_session_id || t.academic_session_id == data.academic_session_id)
                                            .map(t => <option key={t.id} value={t.id}>{t.name}</option>)
                                        }
                                    </select>
                                </div>

                                <div>
                                    <label className={labelCls}>Transaction Date *</label>
                                    <div className="relative group">
                                        <input type="date" value={data.payment_date} onChange={e => setData('payment_date', e.target.value)} className={inputCls} />
                                        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                                            <Calendar size={16} />
                                        </div>
                                    </div>
                                </div>

                                <div className="col-span-full">
                                    <label className={labelCls}>Internal Notes</label>
                                    <div className="relative group">
                                        <textarea value={data.notes} onChange={e => setData('notes', e.target.value)} rows={2} className={inputCls + ' resize-none pt-3'} placeholder="Reference info, special instructions..." />
                                        <div className="absolute right-4 top-4 pointer-events-none text-slate-300">
                                            <FileText size={16} />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </Card>

                    {/* Multi-Method Payments */}
                    <Card className="border-0 shadow-2xl shadow-slate-200/50 dark:shadow-none bg-white dark:bg-slate-900 p-8">
                        <div className="flex items-center justify-between mb-8">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-600">
                                    <Banknote size={20} />
                                </div>
                                <h3 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight">Payment Split</h3>
                            </div>
                            <button type="button" onClick={addItem} className="group flex items-center gap-2 px-4 py-2 bg-emerald-50 dark:bg-emerald-900/30 hover:bg-emerald-600 transition-all text-emerald-700 dark:text-emerald-400 hover:text-white font-black text-[10px] uppercase tracking-widest rounded-xl active:scale-95 shadow-sm border border-emerald-100 dark:border-emerald-900/40">
                                <Plus size={14} className="group-hover:rotate-90 transition-transform" /> Add Split
                            </button>
                        </div>

                        <div className="space-y-6">
                            {data.payment_items.map((item, i) => {
                                const Icon = METHOD_ICONS[item.method] || CreditCard;
                                const needsAccount = item.method !== 'cash';
                                return (
                                    <div key={i} className="group/split relative p-6 bg-slate-50 dark:bg-slate-800/40 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 transition-all hover:border-emerald-200 dark:hover:border-emerald-900/30">
                                        <div className="flex items-center justify-between mb-6">
                                            <div className="flex items-center gap-3">
                                                <div className="p-2 bg-white dark:bg-slate-900 rounded-xl shadow-sm text-emerald-600 group-hover/split:scale-110 transition-transform">
                                                    <Icon size={18} />
                                                </div>
                                                <span className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-widest">Entry #{i + 1}</span>
                                            </div>
                                            {data.payment_items.length > 1 && (
                                                <button type="button" onClick={() => removeItem(i)} className="p-2 bg-white dark:bg-slate-900 hover:bg-rose-50 dark:hover:bg-rose-900/20 text-slate-300 hover:text-rose-500 rounded-xl transition-all shadow-sm active:scale-90 opacity-0 group-hover/split:opacity-100">
                                                    <Trash2 size={16} />
                                                </button>
                                            )}
                                        </div>

                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                            <div>
                                                <label className={labelCls}>Gateway / Method</label>
                                                <select value={item.method} onChange={e => updateItem(i, 'method', e.target.value)} className={inputCls}>
                                                    {Object.entries(METHOD_LABELS).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                                                </select>
                                            </div>
                                            <div>
                                                <label className={labelCls}>Amount Paid (₦)</label>
                                                <div className="relative group">
                                                    <input
                                                        type="number" min="0" step="0.01"
                                                        value={item.amount}
                                                        onChange={e => updateItem(i, 'amount', e.target.value)}
                                                        className={inputCls + " pl-10"}
                                                        placeholder="0.00"
                                                    />
                                                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">₦</div>
                                                </div>
                                            </div>

                                            {needsAccount && (
                                                <div className="sm:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-6 p-5 bg-white dark:bg-slate-900/50 rounded-3xl border border-slate-100 dark:border-slate-800 animate-in zoom-in-95">
                                                    <div>
                                                        <label className={labelCls}>Destination Account *</label>
                                                        <select value={item.account_id} onChange={e => updateItem(i, 'account_id', e.target.value)} className={inputCls}>
                                                            <option value="">Select target account...</option>
                                                            {nonCashAccounts.map(a => (
                                                                <option key={a.id} value={a.id}>{a.name} {a.account_number ? `(${a.account_number})` : ''}</option>
                                                            ))}
                                                        </select>
                                                    </div>
                                                    <div>
                                                        <label className={labelCls}>Ref / ID / Teller</label>
                                                        <input
                                                            value={item.reference}
                                                            onChange={e => updateItem(i, 'reference', e.target.value)}
                                                            className={inputCls}
                                                            placeholder="Txn ID or receipt ref..."
                                                        />
                                                    </div>
                                                </div>
                                            )}

                                            <div className="sm:col-span-2">
                                                <label className={labelCls}>Line Item Note</label>
                                                <input value={item.notes} onChange={e => updateItem(i, 'notes', e.target.value)} className={inputCls} placeholder="e.g. Paid by uncle, partial for Jan..." />
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {errors.payment_items && (
                            <div className="mt-4 p-4 bg-rose-50 dark:bg-rose-900/10 border border-rose-100 dark:border-rose-900/20 rounded-2xl flex items-center gap-3">
                                <Info size={16} className="text-rose-600" />
                                <p className="text-[10px] font-black text-rose-600 uppercase tracking-widest leading-relaxed">{errors.payment_items}</p>
                            </div>
                        )}
                    </Card>
                </div>

                {/* Right Side: Floating Summary */}
                <div className="lg:col-span-4 lg:sticky lg:top-8 self-start">
                    <Card className="border-0 shadow-2xl shadow-emerald-200/50 dark:shadow-none bg-gradient-to-br from-slate-900 via-emerald-950 to-slate-900 p-8 rounded-[3rem] text-white">
                        <div className="flex items-center gap-2 mb-8 text-emerald-400">
                            <Wallet size={18} />
                            <h3 className="text-sm font-black uppercase tracking-[0.2em]">Transaction Ledger</h3>
                        </div>

                        <div className="space-y-4">
                            <div className="flex justify-between items-center group">
                                <span className="text-xs font-bold text-slate-400 group-hover:text-white transition-colors uppercase tracking-widest">Gross Bill</span>
                                <span className="text-lg font-black tracking-tighter">{feeAmount > 0 ? fmt(feeAmount) : '—'}</span>
                            </div>
                            <div className="flex justify-between items-center py-4 border-y border-white/10 group">
                                <span className="text-xs font-bold text-emerald-400 uppercase tracking-widest">Credits Input</span>
                                <div className="text-right">
                                    <span className="text-2xl font-black tracking-tighter block">{fmt(totalItemAmount)}</span>
                                    {data.payment_items.length > 1 && (
                                        <span className="text-[10px] text-emerald-500/60 font-black uppercase tracking-widest">({data.payment_items.length} units total)</span>
                                    )}
                                </div>
                            </div>
                            <div className="flex justify-between items-center pt-2">
                                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Residual Balance</span>
                                <span className={`text-xl font-black tracking-tighter ${remainingBalance > 0 ? 'text-rose-400' : 'text-emerald-400'}`}>
                                    {feeAmount > 0 ? fmt(remainingBalance) : '—'}
                                </span>
                            </div>
                        </div>

                        {feeAmount > 0 && totalItemAmount > 0 && (
                            <div className="mt-10 p-6 bg-white/5 rounded-[2rem] border border-white/10">
                                <div className="flex justify-between text-[10px] font-black uppercase tracking-[0.2em] mb-3 text-slate-400">
                                    <span>Coverage Factor</span>
                                    <span className="text-emerald-400">{Math.min(100, Math.round((totalItemAmount / feeAmount) * 100))}%</span>
                                </div>
                                <div className="w-full bg-white/10 rounded-full h-2.5 overflow-hidden">
                                    <div
                                        className="bg-gradient-to-r from-emerald-400 via-teal-400 to-emerald-500 h-full transition-all duration-700 ease-out shadow-[0_0_15px_rgba(52,211,153,0.3)]"
                                        style={{ width: `${Math.min(100, (totalItemAmount / feeAmount) * 100)}%` }}
                                    />
                                </div>
                                {totalItemAmount > feeAmount && (
                                    <div className="mt-4 flex items-center justify-center gap-2 text-[10px] font-black text-rose-400 uppercase tracking-widest text-center">
                                        <Info size={12} /> Overpayment Registered
                                    </div>
                                )}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={processing || !data.student_id || !data.fee_type_id || !data.academic_session_id || totalItemAmount <= 0}
                            className="w-full mt-10 py-5 bg-white text-slate-900 font-black rounded-3xl shadow-2xl hover:bg-emerald-50 transition-all disabled:opacity-30 disabled:cursor-not-allowed active:scale-95 flex items-center justify-center gap-3 text-sm uppercase tracking-widest"
                        >
                            {processing ? (
                                <>
                                    <div className="w-5 h-5 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin" />
                                    <span>Syncing...</span>
                                </>
                            ) : (
                                <>
                                    <Check size={20} className="text-emerald-600" />
                                    <span>Commit Payment</span>
                                </>
                            )}
                        </button>

                        <div className="mt-6 flex flex-col items-center gap-1 opacity-40">
                            <p className="text-[10px] font-black uppercase tracking-widest text-center leading-relaxed">System-generated receipt will follow commitment</p>
                            <div className="flex gap-2">
                                <div className="w-1 h-1 rounded-full bg-white" />
                                <div className="w-1 h-1 rounded-full bg-white" />
                                <div className="w-1 h-1 rounded-full bg-white" />
                            </div>
                        </div>
                    </Card>

                    <div className="mt-6 p-6 bg-slate-50 dark:bg-slate-800/20 rounded-[2.5rem] border border-slate-100 dark:border-slate-800/40">
                        <div className="flex items-start gap-4">
                            <div className="p-2 bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-100 dark:border-slate-800">
                                <Smartphone size={16} className="text-slate-400" />
                            </div>
                            <p className="text-[10px] font-bold text-slate-500 leading-relaxed uppercase tracking-tight">
                                This module supports split payments across offline bank teller deposits, POS card receipts, and manual cash handovers.
                            </p>
                        </div>
                    </div>
                </div>
            </form>
        </AuthenticatedLayout>
    );
}
