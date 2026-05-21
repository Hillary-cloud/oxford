import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, router, Link } from '@inertiajs/react';
import Card from '@/Components/Card';
import { useState } from 'react';
import {
    Settings2, Plus, Pencil, Trash2, X, Check, RefreshCw,
    ChevronDown, ChevronLeft, ChevronUp, Tag, CalendarDays, DollarSign, Users, User, GraduationCap
} from 'lucide-react';
import Swal from 'sweetalert2';

const TARGET_COLORS = {
    all: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400',
    class: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    student: 'bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400',
    group: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
    gender: 'bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-400',
};

const TARGET_ICONS = { all: Users, class: GraduationCap, student: User, group: Tag, gender: User };

function FeeTypeModal({ feeType, academicSessions, terms, onClose }) {
    const isEdit = !!feeType?.id;
    const { data, setData, post, put, processing, errors } = useForm({
        name: feeType?.name ?? '',
        description: feeType?.description ?? '',
        amount: feeType?.amount ?? '',
        is_recurring: feeType?.is_recurring ?? false,
        recurring_interval: feeType?.recurring_interval ?? '',
        academic_session_id: feeType?.academic_session?.id ?? '',
        term_id: feeType?.term?.id ?? '',
        due_date: feeType?.due_date ?? '',
        is_active: feeType?.is_active ?? true,
    });

    const submit = (e) => {
        e.preventDefault();
        if (isEdit) {
            put(route('fees.types.update', feeType.id), { onSuccess: onClose });
        } else {
            post(route('fees.types.store'), { onSuccess: onClose });
        }
    };

    const inputCls = "w-full px-4 py-2.5 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed";

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 overflow-y-auto"
            onClick={onClose}
        >
            <div
                className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl w-full max-w-lg border border-slate-200 dark:border-slate-800 my-8 overflow-hidden"
                onClick={e => e.stopPropagation()}
            >
                <div className="flex items-center justify-between p-6 border-b border-slate-100 dark:border-slate-800">
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white">{isEdit ? 'Edit Fee Type' : 'Create Fee Type'}</h3>
                    <button onClick={onClose} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors">
                        <X size={20} className="text-slate-500" />
                    </button>
                </div>
                <form onSubmit={submit} className="p-6 space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="col-span-full">
                            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1.5">Fee Name *</label>
                            <input value={data.name} onChange={e => setData('name', e.target.value)} className={inputCls} placeholder="e.g. School Fees, Bus Fee" />
                            {errors.name && <p className="text-rose-500 text-xs mt-1">{errors.name}</p>}
                        </div>

                        <div className="col-span-full">
                            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1.5">Description</label>
                            <textarea value={data.description} onChange={e => setData('description', e.target.value)} rows={2} className={inputCls + ' resize-none'} />
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1.5">Amount (₦) *</label>
                            <input type="number" min="0" step="0.01" value={data.amount} onChange={e => setData('amount', e.target.value)} className={inputCls} placeholder="50000" />
                            {errors.amount && <p className="text-rose-500 text-xs mt-1">{errors.amount}</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1.5">Due Date</label>
                            <input type="date" value={data.due_date} onChange={e => setData('due_date', e.target.value)} className={inputCls} />
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1.5">Session</label>
                            <select
                                value={data.academic_session_id}
                                onChange={e => {
                                    setData(val => ({ ...val, academic_session_id: e.target.value, term_id: '' }));
                                }}
                                className={inputCls}
                            >
                                <option value="">All Sessions</option>
                                {academicSessions.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1.5">Term</label>
                            <select
                                value={data.term_id}
                                onChange={e => setData('term_id', e.target.value)}
                                className={inputCls}
                                disabled={!data.academic_session_id}
                            >
                                <option value="">All Terms</option>
                                {terms
                                    .filter(t => !data.academic_session_id || t.academic_session_id == data.academic_session_id)
                                    .map(t => <option key={t.id} value={t.id}>{t.name}</option>)
                                }
                            </select>
                        </div>
                    </div>

                    <div className="flex items-center gap-6 p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl">
                        <div className="flex items-center gap-2">
                            <input type="checkbox" id="is_recurring" checked={data.is_recurring} onChange={e => setData('is_recurring', e.target.checked)} className="rounded text-emerald-600 focus:ring-emerald-500" />
                            <label htmlFor="is_recurring" className="text-sm font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2 cursor-pointer">
                                <RefreshCw size={14} className="text-emerald-500" />
                                Recurring
                            </label>
                        </div>

                        <div className="flex items-center gap-2">
                            <input type="checkbox" id="is_active2" checked={data.is_active} onChange={e => setData('is_active', e.target.checked)} className="rounded text-emerald-600 focus:ring-emerald-500" />
                            <label htmlFor="is_active2" className="text-sm font-bold text-slate-700 dark:text-slate-300 cursor-pointer">Active</label>
                        </div>
                    </div>

                    {data.is_recurring && (
                        <div className="animate-in fade-in slide-in-from-top-2">
                            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1.5">Recurrence Interval *</label>
                            <select value={data.recurring_interval} onChange={e => setData('recurring_interval', e.target.value)} className={inputCls}>
                                <option value="">Select interval</option>
                                <option value="termly">Termly</option>
                                <option value="monthly">Monthly</option>
                                <option value="annually">Annually</option>
                            </select>
                        </div>
                    )}

                    <div className="flex gap-3 pt-2">
                        <button type="button" onClick={onClose} className="flex-1 py-3 border border-slate-200 dark:border-slate-700 rounded-2xl text-sm font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">Cancel</button>
                        <button type="submit" disabled={processing} className="flex-1 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-bold rounded-2xl text-sm hover:from-emerald-700 hover:to-teal-700 disabled:opacity-60 transition-all flex items-center justify-center gap-2 active:scale-95 shadow-lg shadow-emerald-500/20">
                            <Check size={18} /> {isEdit ? 'Update Fee' : 'Create Fee'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

function AssignmentModal({ feeType, classes, feeGroups, onClose }) {
    const { data, setData, post, processing, errors } = useForm({
        target_type: 'all',
        school_class_id: '',
        student_id: '',
        fee_group_id: '',
        gender: '',
    });

    const submit = (e) => {
        e.preventDefault();
        post(route('fees.types.assignments.store', feeType.id), { onSuccess: onClose });
    };

    const inputCls = "w-full px-4 py-2.5 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none text-sm";

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
            onClick={onClose}
        >
            <div
                className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl w-full max-w-md border border-slate-200 dark:border-slate-800 overflow-hidden"
                onClick={e => e.stopPropagation()}
            >
                <div className="flex items-center justify-between p-6 border-b border-slate-100 dark:border-slate-800">
                    <div>
                        <h3 className="text-xl font-bold text-slate-900 dark:text-white">Add Assignment</h3>
                        <p className="text-xs text-slate-500 mt-0.5">For: <strong>{feeType.name}</strong></p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"><X size={20} className="text-slate-500" /></button>
                </div>
                <form onSubmit={submit} className="p-6 space-y-4">
                    <div>
                        <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Target Type *</label>
                        <div className="grid grid-cols-3 gap-2">
                            {['all', 'class', 'gender', 'group', 'student'].map(t => (
                                <button key={t} type="button" onClick={() => setData('target_type', t)}
                                    className={`py-2 px-3 rounded-xl text-xs font-bold capitalize border-2 transition-all ${data.target_type === t ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 shadow-sm' : 'border-slate-200 dark:border-slate-700 text-slate-500 hover:border-slate-300'}`}
                                >{t}</button>
                            ))}
                        </div>
                    </div>

                    {data.target_type === 'class' && (
                        <div className="animate-in fade-in slide-in-from-top-2">
                            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1.5">Select Class *</label>
                            <select value={data.school_class_id} onChange={e => setData('school_class_id', e.target.value)} className={inputCls}>
                                <option value="">Choose class...</option>
                                {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                            </select>
                        </div>
                    )}
                    {data.target_type === 'gender' && (
                        <div className="animate-in fade-in slide-in-from-top-2">
                            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1.5">Gender *</label>
                            <select value={data.gender} onChange={e => setData('gender', e.target.value)} className={inputCls}>
                                <option value="">Choose gender...</option>
                                <option value="male">Male</option>
                                <option value="female">Female</option>
                            </select>
                        </div>
                    )}
                    {data.target_type === 'group' && (
                        <div className="animate-in fade-in slide-in-from-top-2">
                            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1.5">Select Group *</label>
                            <select value={data.fee_group_id} onChange={e => setData('fee_group_id', e.target.value)} className={inputCls}>
                                <option value="">Choose group...</option>
                                {feeGroups.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
                            </select>
                        </div>
                    )}
                    {data.target_type === 'student' && (
                        <div className="animate-in fade-in slide-in-from-top-2">
                            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1.5">Enter Student Reg Number / Search *</label>
                            <input value={data.student_id} onChange={e => setData('student_id', e.target.value)} className={inputCls} placeholder="Type student registration number..." />
                            <p className="text-[10px] text-slate-400 mt-1 font-medium italic">Assignments by student require the exact registration number or selection from ledger.</p>
                        </div>
                    )}

                    {errors.error && <p className="text-rose-500 text-xs mt-1 font-bold">{errors.error}</p>}

                    <div className="flex gap-3 pt-2">
                        <button type="button" onClick={onClose} className="flex-1 py-3 border border-slate-200 dark:border-slate-700 rounded-2xl text-sm font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors uppercase tracking-widest text-[10px]">Cancel</button>
                        <button type="submit" disabled={processing} className="flex-1 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-bold rounded-2xl text-sm hover:from-emerald-700 hover:to-teal-700 transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 active:scale-95 uppercase tracking-widest text-[10px]">
                            <Plus size={16} /> Assign Fee
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default function FeeTypesIndex({ auth, feeTypes, academicSessions, terms, classes, feeGroups }) {
    const [modal, setModal] = useState(null);
    const [expanded, setExpanded] = useState({});

    const fmt = (n) => '₦' + Number(n).toLocaleString('en-NG', { minimumFractionDigits: 2 });

    const handleDeleteFee = (fee) => {
        Swal.fire({
            title: 'Delete Fee Type?',
            text: `Are you sure you want to delete "${fee.name}"? This will also remove all its individual assignments.`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#ef4444',
            cancelButtonColor: '#64748b',
            confirmButtonText: 'Yes, delete!',
            background: document.documentElement.classList.contains('dark') ? '#0f172a' : '#ffffff',
            color: document.documentElement.classList.contains('dark') ? '#e2e8f0' : '#1e293b',
        }).then((result) => {
            if (result.isConfirmed) {
                router.delete(route('fees.types.destroy', fee.id));
            }
        });
    };

    const handleDeleteAssignment = (id) => {
        Swal.fire({
            title: 'Remove Assignment?',
            text: 'Are you sure you want to remove this assignment?',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#ef4444',
            cancelButtonColor: '#64748b',
            confirmButtonText: 'Yes, remove!',
            background: document.documentElement.classList.contains('dark') ? '#0f172a' : '#ffffff',
            color: document.documentElement.classList.contains('dark') ? '#e2e8f0' : '#1e293b',
        }).then((result) => {
            if (result.isConfirmed) {
                router.delete(route('fees.assignments.destroy', id));
            }
        });
    };

    const toggle = (id) => setExpanded(prev => ({ ...prev, [id]: !prev[id] }));

    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link href={route('fees.index')} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors">
                            <ChevronLeft size={20} className="text-slate-600" />
                        </Link>
                        <div>
                            <h2 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white leading-tight">
                                Fee Types
                            </h2>
                            <p className="text-slate-500 text-sm font-medium">
                                Define fees and assign them to targets.
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={() => setModal({ type: 'fee' })}
                        className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold rounded-2xl shadow-lg shadow-emerald-500/20 transition-all active:scale-95"
                    >
                        <Plus size={18} /> Create Fee
                    </button>
                </div>
            }
        >
            <Head title="Fee Types" />

            {modal?.type === 'fee' && (
                <FeeTypeModal feeType={modal.feeType} academicSessions={academicSessions} terms={terms} onClose={() => setModal(null)} />
            )}
            {modal?.type === 'assign' && (
                <AssignmentModal feeType={modal.feeType} classes={classes} feeGroups={feeGroups} onClose={() => setModal(null)} />
            )}

            <div className="space-y-4">
                {feeTypes.map((fee) => (
                    <Card key={fee.id} className="!p-0 border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden">
                        {/* Header Row */}
                        <div className="p-5 flex flex-col sm:flex-row sm:items-center gap-4">
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-3 flex-wrap">
                                    <h3 className="text-lg font-black text-slate-900 dark:text-white">{fee.name}</h3>
                                    {fee.is_recurring && (
                                        <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400 flex items-center gap-1">
                                            <RefreshCw size={10} /> {fee.recurring_interval}
                                        </span>
                                    )}
                                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${fee.is_active ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' : 'bg-slate-100 text-slate-500'}`}>
                                        {fee.is_active ? 'Active' : 'Inactive'}
                                    </span>
                                </div>
                                {fee.description && <p className="text-sm text-slate-500 mt-0.5 truncate">{fee.description}</p>}
                                <div className="flex gap-4 mt-2 flex-wrap">
                                    <span className="text-sm font-black text-emerald-600">
                                        <DollarSign size={14} className="inline -mt-0.5" /> {fmt(fee.amount)}
                                    </span>
                                    {fee.academic_session && <span className="text-xs text-slate-500 font-medium">{fee.academic_session.name}</span>}
                                    {fee.term && <span className="text-xs text-slate-500 font-medium">{fee.term.name}</span>}
                                    {fee.due_date && (
                                        <span className="text-xs text-slate-500 font-medium flex items-center gap-1">
                                            <CalendarDays size={10} /> Due: {fee.due_date}
                                        </span>
                                    )}
                                    <span className="text-xs text-indigo-600 dark:text-indigo-400 font-bold">
                                        Collected: {fmt(fee.total_collected)}
                                    </span>
                                </div>
                            </div>

                            <div className="flex items-center gap-2 shrink-0">
                                <button
                                    onClick={() => setModal({ type: 'assign', feeType: fee })}
                                    className="px-3 py-2 bg-indigo-50 dark:bg-indigo-900/20 hover:bg-indigo-100 dark:hover:bg-indigo-900/40 text-indigo-600 rounded-xl text-xs font-bold transition-colors flex items-center gap-1"
                                >
                                    <Plus size={12} /> Assign
                                </button>
                                <button
                                    onClick={() => setModal({ type: 'fee', feeType: fee })}
                                    className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors text-slate-500 hover:text-indigo-600"
                                >
                                    <Pencil size={16} />
                                </button>
                                <button
                                    onClick={() => handleDeleteFee(fee)}
                                    className="p-2 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-xl transition-colors text-slate-500 hover:text-rose-600"
                                >
                                    <Trash2 size={16} />
                                </button>
                                <button
                                    onClick={() => toggle(fee.id)}
                                    className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors text-slate-500"
                                >
                                    {expanded[fee.id] ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                                </button>
                            </div>
                        </div>

                        {/* Assignments (expanded) */}
                        {expanded[fee.id] && (
                            <div className="px-5 pb-5 border-t border-slate-100 dark:border-slate-800/60 pt-4">
                                <p className="text-xs font-black text-slate-500 uppercase tracking-wider mb-3">Assignments ({fee.assignments.length})</p>
                                {fee.assignments.length === 0 ? (
                                    <p className="text-sm text-slate-400 italic">No targets yet — this fee applies to nobody. Add an assignment above.</p>
                                ) : (
                                    <div className="flex flex-wrap gap-2">
                                        {fee.assignments.map((a) => {
                                            const Icon = TARGET_ICONS[a.target_type] || Tag;
                                            return (
                                                <div key={a.id} className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold ${TARGET_COLORS[a.target_type]}`}>
                                                    <Icon size={12} />
                                                    <span>{a.label}</span>
                                                    <button onClick={() => handleDeleteAssignment(a)} className="hover:text-rose-600 transition-colors ml-1">
                                                        <X size={10} />
                                                    </button>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        )}
                    </Card>
                ))}

                {feeTypes.length === 0 && (
                    <div className="py-20 flex flex-col items-center justify-center text-slate-500 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-3xl">
                        <Settings2 size={48} className="opacity-20 mb-4" />
                        <p className="text-sm font-bold">No fee types yet</p>
                        <p className="text-xs mt-1">Create your first fee type using the button above.</p>
                    </div>
                )}
            </div>
        </AuthenticatedLayout>
    );
}
