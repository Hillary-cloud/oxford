import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm, router } from '@inertiajs/react';
import Card from '@/Components/Card';
import { useState } from 'react';
import { Landmark, Plus, Pencil, Power, X, Check, Building2, Smartphone, Banknote, ChevronLeft } from 'lucide-react';
import Swal from 'sweetalert2';

const TYPE_ICONS = { bank: Building2, pos: Smartphone, cash: Banknote };
const TYPE_COLORS = {
    bank: 'text-indigo-500 bg-indigo-100 dark:bg-indigo-900/30',
    pos: 'text-amber-500 bg-amber-100 dark:bg-amber-900/30',
    cash: 'text-emerald-500 bg-emerald-100 dark:bg-emerald-900/30',
};

function AccountModal({ account, onClose }) {
    const isEdit = !!account?.id;
    const { data, setData, post, put, processing, errors } = useForm({
        name: account?.name ?? '',
        account_number: account?.account_number ?? '',
        bank_name: account?.bank_name ?? '',
        account_type: account?.account_type ?? 'bank',
        description: account?.description ?? '',
        is_active: account?.is_active ?? true,
    });

    const submit = (e) => {
        e.preventDefault();
        if (isEdit) {
            put(route('fees.accounts.update', account.id), { onSuccess: onClose });
        } else {
            post(route('fees.accounts.store'), { onSuccess: onClose });
        }
    };

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
            onClick={onClose}
        >
            <div
                className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl w-full max-w-lg border border-slate-200 dark:border-slate-800 overflow-hidden"
                onClick={e => e.stopPropagation()}
            >
                <div className="flex items-center justify-between p-6 border-b border-slate-100 dark:border-slate-800">
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                        {isEdit ? 'Edit Account' : 'Add School Account'}
                    </h3>
                    <button onClick={onClose} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors">
                        <X size={20} className="text-slate-500" />
                    </button>
                </div>

                <form onSubmit={submit} className="p-6 space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="col-span-full sm:col-span-1">
                            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1.5">Account Name *</label>
                            <input
                                value={data.name}
                                onChange={e => setData('name', e.target.value)}
                                className="w-full px-4 py-2.5 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none text-sm"
                                placeholder="e.g. GTBank Main Account"
                            />
                            {errors.name && <p className="text-rose-500 text-xs mt-1">{errors.name}</p>}
                        </div>
                        <div className="col-span-full sm:col-span-1">
                            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1.5">Account Type *</label>
                            <select
                                value={data.account_type}
                                onChange={e => setData('account_type', e.target.value)}
                                className="w-full px-4 py-2.5 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none text-sm"
                            >
                                <option value="bank">Bank Account</option>
                                <option value="pos">POS Terminal</option>
                                <option value="cash">Cash/Hand</option>
                            </select>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1.5">Bank Name</label>
                            <input
                                value={data.bank_name}
                                onChange={e => setData('bank_name', e.target.value)}
                                className="w-full px-4 py-2.5 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none text-sm"
                                placeholder="e.g. GTBank"
                                disabled={data.account_type === 'cash'}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1.5">Account Number</label>
                            <input
                                value={data.account_number}
                                onChange={e => setData('account_number', e.target.value)}
                                className="w-full px-4 py-2.5 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none text-sm"
                                placeholder="0123456789"
                                disabled={data.account_type === 'cash'}
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1.5">Description</label>
                        <textarea
                            value={data.description}
                            onChange={e => setData('description', e.target.value)}
                            rows={2}
                            className="w-full px-4 py-2.5 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none text-sm resize-none"
                            placeholder="Optional description..."
                        />
                    </div>

                    <div className="flex items-center gap-3">
                        <input
                            type="checkbox"
                            id="is_active"
                            checked={data.is_active}
                            onChange={e => setData('is_active', e.target.checked)}
                            className="rounded text-emerald-600 focus:ring-emerald-500"
                        />
                        <label htmlFor="is_active" className="text-sm font-bold text-slate-700 dark:text-slate-300">Active (available for payments)</label>
                    </div>

                    <div className="flex gap-3 pt-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 py-3 border border-slate-200 dark:border-slate-700 rounded-2xl text-sm font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={processing}
                            className="flex-1 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-bold rounded-2xl text-sm hover:from-emerald-700 hover:to-teal-700 transition-all disabled:opacity-60 flex items-center justify-center gap-2"
                        >
                            <Check size={18} />
                            {isEdit ? 'Update Account' : 'Save Account'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default function AccountsIndex({ auth, accounts }) {
    const [modal, setModal] = useState(null);

    const toggleStatus = (account) => {
        const action = account.is_active ? 'deactivate' : 'activate';
        const color = account.is_active ? '#ef4444' : '#10b981';

        Swal.fire({
            title: `${action.charAt(0).toUpperCase() + action.slice(1)} Account?`,
            text: `Are you sure you want to ${action} "${account.name}"?`,
            icon: account.is_active ? 'warning' : 'question',
            showCancelButton: true,
            confirmButtonColor: color,
            cancelButtonColor: '#64748b',
            confirmButtonText: `Yes, ${action}!`,
            cancelButtonText: 'Cancel',
            background: document.documentElement.classList.contains('dark') ? '#0f172a' : '#ffffff',
            color: document.documentElement.classList.contains('dark') ? '#e2e8f0' : '#1e293b',
        }).then((result) => {
            if (result.isConfirmed) {
                router.delete(route('fees.accounts.destroy', account.id), { preserveScroll: true });
            }
        });
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link href={route('fees.index')} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors">
                            <ChevronLeft size={20} className="text-slate-600" />
                        </Link>
                        <div>
                            <h2 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">
                                School Accounts
                            </h2>
                            <p className="text-slate-500 text-sm font-medium">
                                Manage bank, POS, and cash accounts.
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={() => setModal({})}
                        className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold rounded-2xl shadow-lg shadow-emerald-500/20 transition-all active:scale-95"
                    >
                        <Plus size={18} />
                        Add Account
                    </button>
                </div>
            }
        >
            <Head title="School Accounts" />

            {modal !== null && (
                <AccountModal account={modal.id ? modal : undefined} onClose={() => setModal(null)} />
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {accounts.map((account) => {
                    const Icon = TYPE_ICONS[account.account_type] || Landmark;
                    return (
                        <Card key={account.id} className={`relative overflow-hidden border border-slate-200 dark:border-slate-800 shadow-xl hover:shadow-2xl transition-all group ${!account.is_active ? 'opacity-75 bg-slate-50/50 dark:bg-slate-900/20' : ''}`}>
                            <div className="flex items-start justify-between mb-4">
                                <div className={`p-3 rounded-2xl ${TYPE_COLORS[account.account_type]}`}>
                                    <Icon size={22} />
                                </div>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => setModal(account)}
                                        className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors text-slate-500 hover:text-indigo-600"
                                    >
                                        <Pencil size={18} />
                                    </button>
                                    <button
                                        onClick={() => toggleStatus(account)}
                                        className={`p-2 rounded-xl transition-colors ${account.is_active ? 'hover:bg-rose-50 text-slate-500 hover:text-rose-600' : 'hover:bg-emerald-50 text-emerald-600'}`}
                                        title={account.is_active ? 'Deactivate' : 'Activate'}
                                    >
                                        {account.is_active ? <Power size={18} /> : <Check size={18} />}
                                    </button>
                                </div>
                            </div>

                            <h3 className="text-lg font-black text-slate-900 dark:text-white leading-tight">{account.name}</h3>

                            {account.bank_name && (
                                <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">{account.bank_name}</p>
                            )}
                            {account.account_number && (
                                <p className="text-sm font-mono font-bold text-slate-700 dark:text-slate-300 mt-1">{account.account_number}</p>
                            )}

                            <div className="mt-4 flex items-center gap-2">
                                <span className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider ${TYPE_COLORS[account.account_type]}`}>
                                    {account.account_type}
                                </span>
                                <span className={`px-3 py-1 rounded-full text-xs font-bold ${account.is_active ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' : 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400'}`}>
                                    {account.is_active ? 'Active' : 'Inactive'}
                                </span>
                            </div>

                            {account.description && (
                                <p className="text-xs text-slate-500 mt-3 line-clamp-2">{account.description}</p>
                            )}
                        </Card>
                    );
                })}

                {accounts.length === 0 && (
                    <div className="col-span-full py-20 flex flex-col items-center justify-center text-slate-500 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-3xl">
                        <Landmark size={48} className="opacity-20 mb-4" />
                        <p className="text-sm font-bold">No accounts yet</p>
                        <p className="text-xs mt-1">Add your first school payment account above.</p>
                    </div>
                )}
            </div>
        </AuthenticatedLayout>
    );
}

