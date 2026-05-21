import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, router, Link } from '@inertiajs/react';
import Card from '@/Components/Card';
import { useState } from 'react';
import { Users, Plus, Pencil, Trash2, X, Check, UserPlus, UserMinus, ChevronLeft } from 'lucide-react';
import Swal from 'sweetalert2';

function GroupModal({ group, onClose }) {
    const isEdit = !!group?.id;
    const { data, setData, post, put, processing, errors } = useForm({
        name: group?.name ?? '',
        description: group?.description ?? '',
    });

    const submit = (e) => {
        e.preventDefault();
        if (isEdit) {
            put(route('fees.groups.update', group.id), { onSuccess: onClose });
        } else {
            post(route('fees.groups.store'), { onSuccess: onClose });
        }
    };

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
            onClick={onClose}
        >
            <div
                className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl w-full max-w-sm border border-slate-200 dark:border-slate-800 overflow-hidden"
                onClick={e => e.stopPropagation()}
            >
                <div className="flex items-center justify-between p-6 border-b border-slate-100 dark:border-slate-800">
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white">{isEdit ? 'Edit Group' : 'Create Fee Group'}</h3>
                    <button onClick={onClose} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"><X size={20} className="text-slate-500" /></button>
                </div>
                <form onSubmit={submit} className="p-6 space-y-4">
                    <div>
                        <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1.5 font-mono uppercase tracking-tighter">Group Name *</label>
                        <input value={data.name} onChange={e => setData('name', e.target.value)} className="w-full px-4 py-2.5 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none text-sm shadow-inner transition-all" placeholder="e.g. Boarding, Scholarship" />
                        {errors.name && <p className="text-rose-500 text-xs mt-1 font-bold">{errors.name}</p>}
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1.5 font-mono uppercase tracking-tighter">Description</label>
                        <textarea value={data.description} onChange={e => setData('description', e.target.value)} rows={2} className="w-full px-4 py-2.5 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none text-sm resize-none shadow-inner transition-all" />
                    </div>
                    <div className="flex gap-3 pt-2">
                        <button type="button" onClick={onClose} className="flex-1 py-3 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs font-black text-slate-500 uppercase tracking-widest hover:bg-slate-50 dark:hover:bg-slate-800 transition-all active:scale-95">Cancel</button>
                        <button type="submit" disabled={processing} className="flex-1 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-black rounded-2xl text-xs uppercase tracking-widest hover:from-emerald-700 hover:to-teal-700 disabled:opacity-60 transition-all shadow-xl shadow-emerald-500/20 flex items-center justify-center gap-2 active:scale-95">
                            <Check size={18} />{isEdit ? 'Update' : 'Create Group'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

function MembersModal({ group, allStudents, onClose }) {
    const [addSearch, setAddSearch] = useState('');
    const [removeSearch, setRemoveSearch] = useState('');
    const [processingId, setProcessingId] = useState(null);
    const memberIds = new Set(group.students.map(s => s.id));

    const members = group.students.filter(s =>
        (removeSearch ? (s.surname + ' ' + s.othername + ' ' + s.registration_number).toLowerCase().includes(removeSearch.toLowerCase()) : true)
    );
    const nonMembers = allStudents.filter(s =>
        (addSearch ? (s.surname + ' ' + s.othername + ' ' + s.registration_number).toLowerCase().includes(addSearch.toLowerCase()) : !memberIds.has(s.id))
    );

    const addStudent = (studentId) => {
        setProcessingId(studentId);
        router.post(route('fees.groups.students.add', group.id), { student_id: studentId }, {
            preserveState: true, preserveScroll: true,
            onFinish: () => setProcessingId(null),
        });
    };
    const removeStudent = (student) => {
        Swal.fire({
            title: 'Remove Student?',
            text: `Are you sure you want to remove ${student.surname} from "${group.name}"?`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#ef4444',
            cancelButtonColor: '#64748b',
            confirmButtonText: 'Yes, remove!',
            background: document.documentElement.classList.contains('dark') ? '#0f172a' : '#ffffff',
            color: document.documentElement.classList.contains('dark') ? '#e2e8f0' : '#1e293b',
        }).then((result) => {
            if (result.isConfirmed) {
                setProcessingId(student.id);
                router.delete(route('fees.groups.students.remove', { feeGroup: group.id, student: student.id }), {
                    preserveState: true, preserveScroll: true,
                    onFinish: () => setProcessingId(null),
                });
            }
        });
    };

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
            onClick={onClose}
        >
            <div
                className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl w-full max-w-3xl border border-slate-200 dark:border-slate-800 max-h-[90vh] flex flex-col overflow-hidden"
                onClick={e => e.stopPropagation()}
            >
                <div className="flex items-center justify-between p-6 border-b border-slate-100 dark:border-slate-800 shrink-0 bg-slate-50/50 dark:bg-slate-900/50">
                    <div>
                        <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">Manage Group Members</h3>
                        <p className="text-xs text-emerald-600 font-bold mt-0.5 tracking-widest uppercase">Target: {group.name}</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-xl transition-colors"><X size={20} className="text-slate-500" /></button>
                </div>
                <div className="flex-1 overflow-y-auto p-6 scrollbar-hide">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Add Section */}
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <p className="text-xs font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                                    <UserPlus size={14} className="text-emerald-500" /> Available Students
                                </p>
                                <span className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-[10px] font-bold text-slate-500">{nonMembers.length} left</span>
                            </div>
                            <div className="relative">
                                <input value={addSearch} onChange={e => setAddSearch(e.target.value)} placeholder="Search name or reg no..." className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-emerald-500 outline-none transition-all shadow-inner" />
                            </div>
                            <div className="space-y-1.5 max-h-[40vh] overflow-y-auto pr-1 scrollbar-hide">
                                {nonMembers.slice(0, 30).map(s => {
                                    const isAdded = memberIds.has(s.id);
                                    return (
                                        <div key={s.id} className={`flex items-center justify-between p-3 rounded-2xl border transition-all group ${isAdded ? 'bg-slate-50 dark:bg-slate-800/20 border-slate-100 dark:border-slate-800/50 opacity-60' : 'bg-white dark:bg-slate-800/40 hover:bg-emerald-50 dark:hover:bg-emerald-900/10 border-transparent hover:border-emerald-100 dark:hover:border-emerald-900/30'}`}>
                                            <div className="min-w-0">
                                                <p className="text-xs font-black text-slate-800 dark:text-slate-200 truncate">{s.surname} {s.othername}</p>
                                                <p className="text-[10px] text-slate-400 font-bold font-mono tracking-tighter">{s.registration_number}</p>
                                            </div>
                                            {isAdded ? (
                                                <span className="flex items-center gap-1 text-[10px] font-black text-emerald-600 uppercase tracking-widest shrink-0 px-2 py-1 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg">
                                                    <Check size={12} /> Added
                                                </span>
                                            ) : (
                                                <button
                                                    onClick={() => addStudent(s.id)}
                                                    disabled={processingId === s.id}
                                                    className="p-2 bg-emerald-100 dark:bg-emerald-900/30 hover:bg-emerald-600 hover:text-white rounded-lg text-emerald-700 transition-all shrink-0 active:scale-90 shadow-sm disabled:opacity-50"
                                                >
                                                    {processingId === s.id ? (
                                                        <div className="w-3.5 h-3.5 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin" />
                                                    ) : (
                                                        <Plus size={14} />
                                                    )}
                                                </button>
                                            )}
                                        </div>
                                    );
                                })}
                                {nonMembers.length === 0 && (
                                    <div className="py-10 text-center opacity-40">
                                        <UserPlus size={24} className="mx-auto mb-2" />
                                        <p className="text-[10px] font-bold uppercase tracking-widest">No matching students</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Current Members Section */}
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <p className="text-xs font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                                    <Users size={14} className="text-indigo-500" /> Current Members
                                </p>
                                <span className="px-2 py-0.5 bg-indigo-50 dark:bg-indigo-900/20 rounded text-[10px] font-black text-indigo-600">{group.students.length} Total</span>
                            </div>
                            <div className="relative">
                                <input value={removeSearch} onChange={e => setRemoveSearch(e.target.value)} placeholder="Filter current members..." className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-indigo-500 outline-none transition-all shadow-inner" />
                            </div>
                            <div className="space-y-1.5 max-h-[40vh] overflow-y-auto pr-1 scrollbar-hide">
                                {members.map(s => (
                                    <div key={s.id} className="flex items-center justify-between p-3 bg-indigo-50/30 dark:bg-indigo-900/10 hover:bg-rose-50 dark:hover:bg-rose-900/10 rounded-2xl border border-indigo-100/50 dark:border-indigo-900/30 hover:border-rose-100 transition-all group">
                                        <div className="min-w-0">
                                            <p className="text-xs font-black text-slate-800 dark:text-slate-200 truncate">{s.surname} {s.othername}</p>
                                            <p className="text-[10px] text-indigo-400 font-bold font-mono tracking-tighter">{s.registration_number}</p>
                                        </div>
                                        <button
                                            onClick={() => removeStudent(s)}
                                            disabled={processingId === s.id}
                                            className="p-2 bg-rose-100 dark:bg-rose-900/30 hover:bg-rose-600 hover:text-white rounded-lg text-rose-600 transition-all shrink-0 active:scale-90 shadow-sm disabled:opacity-50"
                                        >
                                            {processingId === s.id ? (
                                                <div className="w-3.5 h-3.5 border-2 border-rose-600 border-t-transparent rounded-full animate-spin" />
                                            ) : (
                                                <X size={14} />
                                            )}
                                        </button>
                                    </div>
                                ))}
                                {members.length === 0 && (
                                    <div className="py-10 text-center opacity-40">
                                        <Users size={24} className="mx-auto mb-2" />
                                        <p className="text-[10px] font-bold uppercase tracking-widest">Group is empty</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
                <div className="p-6 border-t border-slate-100 dark:border-slate-800 shrink-0 bg-white dark:bg-slate-900">
                    <button onClick={onClose} className="w-full py-4 bg-slate-900 dark:bg-slate-800 text-white font-black rounded-2xl text-xs uppercase tracking-widest hover:bg-slate-800 transition-all shadow-xl active:scale-95">Save & Close</button>
                </div>
            </div>
        </div>
    );
}

export default function GroupsIndex({ auth, groups, allStudents }) {
    const [modal, setModal] = useState(null);

    const handleDelete = (group) => {
        Swal.fire({
            title: 'Delete Fee Group?',
            text: `Are you sure you want to delete "${group.name}"? All student associations will be removed.`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#ef4444',
            cancelButtonColor: '#64748b',
            confirmButtonText: 'Yes, delete!',
            background: document.documentElement.classList.contains('dark') ? '#0f172a' : '#ffffff',
            color: document.documentElement.classList.contains('dark') ? '#e2e8f0' : '#1e293b',
        }).then((result) => {
            if (result.isConfirmed) {
                router.delete(route('fees.groups.destroy', group.id));
            }
        });
    };

    const COLORS = ['from-indigo-500 to-purple-600', 'from-emerald-500 to-teal-600', 'from-amber-500 to-orange-600', 'from-rose-500 to-pink-600', 'from-blue-500 to-cyan-600'];

    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link href={route('fees.index')} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors">
                            <ChevronLeft size={20} className="text-slate-600" />
                        </Link>
                        <div>
                            <h2 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white leading-tight">Fee Groups</h2>
                            <p className="text-slate-500 text-sm font-medium">Segment students for targeted fee rules.</p>
                        </div>
                    </div>
                    <button
                        onClick={() => setModal({ type: 'group' })}
                        className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold rounded-2xl shadow-lg shadow-emerald-500/20 transition-all active:scale-95"
                    >
                        <Plus size={18} /> Create Group
                    </button>
                </div>
            }
        >
            <Head title="Fee Groups" />

            {modal?.type === 'group' && <GroupModal group={modal.group} onClose={() => setModal(null)} />}
            {modal?.type === 'members' && (
                <MembersModal
                    group={groups.find(g => g.id === modal.group.id) || modal.group}
                    allStudents={allStudents}
                    onClose={() => setModal(null)}
                />
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {groups.map((group, idx) => (
                    <Card key={group.id} className="border border-slate-200 dark:border-slate-800 shadow-xl hover:shadow-2xl transition-all overflow-hidden relative group p-6">
                        <div className="flex items-start justify-between mb-4">
                            <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${COLORS[idx % COLORS.length]} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform rotate-3 group-hover:rotate-0`}>
                                <Users size={28} className="text-white" />
                            </div>
                            <div className="flex gap-1.5 translate-x-2 -translate-y-2">
                                <button onClick={() => setModal({ type: 'group', group })} className="p-2.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-2xl transition-all text-slate-400 hover:text-indigo-600 hover:shadow-sm">
                                    <Pencil size={16} />
                                </button>
                                <button onClick={() => handleDelete(group)} className="p-2.5 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-2xl transition-all text-slate-400 hover:text-rose-600 hover:shadow-sm">
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        </div>

                        <h3 className="text-xl font-black text-slate-900 dark:text-white tracking-tight uppercase">{group.name}</h3>
                        {group.description && <p className="text-xs text-slate-500 mt-1 line-clamp-2 font-medium">{group.description}</p>}

                        <div className="mt-6 flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800/60">
                            <div className="flex flex-col">
                                <span className={`text-3xl font-black bg-gradient-to-br ${COLORS[idx % COLORS.length]} bg-clip-text text-transparent leading-none`}>
                                    {group.students_count}
                                </span>
                                <span className="text-[10px] text-slate-400 font-black uppercase tracking-widest mt-0.5">Students</span>
                            </div>
                            <button
                                onClick={() => setModal({ type: 'members', group })}
                                className="px-4 py-2.5 text-[10px] font-black uppercase tracking-widest text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 hover:bg-emerald-600 hover:text-white rounded-2xl transition-all flex items-center gap-2 active:scale-95 shadow-sm"
                            >
                                <Users size={14} /> Members
                            </button>
                        </div>
                    </Card>
                ))}

                {groups.length === 0 && (
                    <div className="col-span-full py-24 flex flex-col items-center justify-center text-slate-500 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-[3rem] bg-slate-50/50 dark:bg-slate-900/30">
                        <div className="p-6 bg-white dark:bg-slate-800 rounded-[2rem] shadow-xl mb-6">
                            <Users size={48} className="text-slate-300" />
                        </div>
                        <p className="text-lg font-black text-slate-900 dark:text-white tracking-tight">No fee groups yet</p>
                        <p className="text-sm text-slate-400 mt-1 max-w-xs text-center font-medium">Create groups to manage fee targeted assignments efficiently.</p>
                    </div>
                )}
            </div>
        </AuthenticatedLayout>
    );
}
