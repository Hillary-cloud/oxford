import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, router } from '@inertiajs/react';
import Card from '@/Components/Card';
import PrimaryButton from '@/Components/PrimaryButton';
import { Users, ArrowRight, GraduationCap, CheckCircle2, AlertCircle, Search, User } from 'lucide-react';
import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import Swal from 'sweetalert2';

export default function Index({ auth, sessions, classSections, students, filters }) {
    const { data: moveData, setData: setMoveData, post: postMove, processing: moving } = useForm({
        student_ids: [],
        target_class_section_id: '',
        target_academic_session_id: sessions.find(s => s.is_current)?.id || '',
        type: 'promotion',
    });

    const [selectAll, setSelectAll] = useState(false);
    const [sourceClassId, setSourceClassId] = useState(filters.class_section_id || '');

    const handleFilter = (e) => {
        e.preventDefault();
        if (!sourceClassId) {
            toast.error('Please select a source class first');
            return;
        }
        router.get(route('promotions.index'), {
            class_section_id: sourceClassId
        });
    };

    const toggleSelectAll = () => {
        if (selectAll) {
            setMoveData('student_ids', []);
        } else {
            setMoveData('student_ids', students.map(s => s.id));
        }
        setSelectAll(!selectAll);
    };

    const toggleStudent = (id) => {
        const current = moveData.student_ids;
        if (current.includes(id)) {
            setMoveData('student_ids', current.filter(sId => sId !== id));
        } else {
            setMoveData('student_ids', [...current, id]);
        }
    };

    const submitMove = (e) => {
        e.preventDefault();
        if (moveData.student_ids.length === 0) {
            toast.error('Please select at least one student.');
            return;
        }

        if (moveData.type === 'promotion') {
            if (!moveData.target_class_section_id) {
                toast.error('Please select a target class.');
                return;
            }

            Swal.fire({
                title: 'Confirm Promotion?',
                text: `You are about to move ${moveData.student_ids.length} students to the selected destination.`,
                icon: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#4f46e5',
                cancelButtonColor: '#334155',
                confirmButtonText: 'Yes, Promote/Transfer',
                background: '#0f172a',
                color: '#f1f5f9'
            }).then((result) => {
                if (result.isConfirmed) {
                    postMove(route('promotions.promote'), {
                        onSuccess: () => {
                            setMoveData('student_ids', []);
                            setSelectAll(false);
                        },
                    });
                }
            });

        } else if (moveData.type === 'graduation') {
            if (!moveData.target_academic_session_id) {
                toast.error('Please select a graduation session.');
                return;
            }
            if (!moveData.graduated_at) {
                toast.error('Please select a graduation date.');
                return;
            }

            Swal.fire({
                title: 'Confirm Graduation?',
                text: `You are about to GRADUATE ${moveData.student_ids.length} students. This will move them to the Alumni list.`,
                icon: 'question',
                showCancelButton: true,
                confirmButtonColor: '#10b981',
                cancelButtonColor: '#334155',
                confirmButtonText: 'Yes, Graduate Students',
                background: '#0f172a',
                color: '#f1f5f9'
            }).then((result) => {
                if (result.isConfirmed) {
                    // Use router.post directly to handle custom data mapping
                    router.post(route('graduations.store'), {
                        ...moveData,
                        academic_session_id: moveData.target_academic_session_id
                    }, {
                        onSuccess: () => {
                            setMoveData('student_ids', []);
                            setSelectAll(false);
                        },
                    });
                }
            });
        }
    };

    const currentClass = classSections.find(cs => cs.id == filters.class_section_id);

    return (
        <AuthenticatedLayout
            header={
                <div className="flex flex-col gap-1">
                    <h2 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white uppercase">Student Promotion Manager</h2>
                    <p className="text-slate-600 dark:text-slate-400 text-sm font-medium italic">Batch promote, demote or transfer students between classes.</p>
                </div>
            }
        >
            <Head title="Promotions" />

            <div className="space-y-8">
                {/* 1. Source Class Selection */}
                <Card title="Source Selection" description="Select the class you want to move students FROM.">
                    <form onSubmit={handleFilter} className="flex flex-col md:flex-row gap-4 items-end">
                        <div className="w-full md:w-1/2 space-y-1">
                            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest pl-1"><GraduationCap size={10} className="inline mr-1" /> Source Class Section</label>
                            <select
                                value={sourceClassId}
                                onChange={e => setSourceClassId(e.target.value)}
                                className="w-full bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-800 text-slate-900 dark:text-slate-200 text-sm rounded-xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/50 transition-all font-bold"
                            >
                                <option value="">Select Class Section</option>
                                {classSections.map(cs => (
                                    <option key={cs.id} value={cs.id}>
                                        {cs.school_class?.name}{cs.class_arm?.name !== 'No arm' ? ` - ${cs.class_arm?.name}` : ''}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <PrimaryButton type="submit" disabled={moving} className="h-[42px] px-8 gap-2">
                            <Search size={18} /> Load Students
                        </PrimaryButton>
                    </form>
                </Card>

                {filters.class_section_id ? (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* 2. Students List */}
                        <div className="lg:col-span-2">
                            <Card
                                title={`Students in ${currentClass?.school_class?.name || ''} ${currentClass?.class_arm?.name !== 'No arm' ? (currentClass?.class_arm?.name || '') : ''}`}
                                description={students.length > 0 ? `${students.length} students found.` : 'No Records Found'}
                                actions={students.length > 0 && (
                                    <button type="button" onClick={toggleSelectAll} className="text-xs font-bold text-indigo-400 hover:text-indigo-300 transition-colors">
                                        {selectAll ? 'Deselect All' : 'Select All'}
                                    </button>
                                )}
                            >
                                <div className="max-h-[600px] overflow-y-auto pr-2 space-y-2 custom-scrollbar">
                                    {students.length === 0 ? (
                                        <div className="py-20 text-center">
                                            <Users size={48} className="mx-auto text-slate-700 mb-4" />
                                            <p className="text-slate-500 italic">No active students in this class.</p>
                                        </div>
                                    ) : (
                                        students.map(student => (
                                            <div
                                                key={student.id}
                                                onClick={() => toggleStudent(student.id)}
                                                className={`p-4 rounded-2xl border cursor-pointer transition-all flex items-center gap-4 ${moveData.student_ids.includes(student.id)
                                                    ? 'bg-indigo-500/10 border-indigo-500/50 shadow-[0_0_20px_rgba(99,102,241,0.1)]'
                                                    : 'bg-slate-50 dark:bg-slate-900/50 border-slate-300 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800'
                                                    }`}
                                            >
                                                <div className={`w-5 h-5 rounded-lg border flex items-center justify-center transition-all ${moveData.student_ids.includes(student.id) ? 'bg-indigo-500 border-indigo-500 text-white' : 'border-slate-600'}`}>
                                                    {moveData.student_ids.includes(student.id) && <CheckCircle2 size={12} />}
                                                </div>
                                                <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 flex items-center justify-center text-slate-400 dark:text-slate-500">
                                                    <User size={18} />
                                                </div>
                                                <div className="flex-1">
                                                    <p className={`text-sm font-black uppercase ${moveData.student_ids.includes(student.id) ? 'text-slate-900 dark:text-white' : 'text-slate-700 dark:text-slate-300'}`}>
                                                        {student.surname} {student.othername}
                                                    </p>
                                                    <p className="text-[10px] font-mono text-slate-500 tracking-tighter">{student.registration_number}</p>
                                                </div>
                                                {/* {student.evaluation && (
                                                    <div className="text-right flex flex-col items-end gap-1">
                                                        <span className={`text-[9px] font-black uppercase px-2 py-1 rounded-md ${student.evaluation.status === 'Promoted' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'}`}>
                                                            {student.evaluation.status} ({Number(student.evaluation.average).toFixed(1)}%)
                                                        </span>
                                                        <p className="text-[8px] text-slate-500 italic max-w-[150px] truncate" title={student.evaluation.reason}>
                                                            {student.evaluation.reason}
                                                        </p>
                                                    </div>
                                                )} */}
                                            </div>
                                        ))
                                    )}
                                </div>
                            </Card>
                        </div>

                        {/* 3. Destination Panel */}
                        <div className="lg:col-span-1">
                            <div className="p-6 rounded-[2.5rem] bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 sticky top-6 shadow-2xl shadow-black/20">
                                <div className="flex items-center gap-3 mb-8 pb-6 border-b border-slate-800">
                                    <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 flex items-center justify-center text-indigo-400">
                                        <ArrowRight size={24} />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight">Destination</h3>
                                        <p className="text-xs text-slate-500 font-medium italic">Commit movement</p>
                                    </div>
                                </div>

                                <div className="space-y-6">
                                    {/* Mode Toggle */}
                                    <div className="flex p-1 bg-slate-100 dark:bg-slate-950 rounded-xl">
                                        <button
                                            type="button"
                                            onClick={() => setMoveData('type', 'promotion')}
                                            className={`flex-1 py-2 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all ${moveData.type === 'promotion' ? 'bg-white dark:bg-slate-800 text-indigo-500 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                                        >
                                            Promote / Transfer
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setMoveData('type', 'graduation')}
                                            className={`flex-1 py-2 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all ${moveData.type === 'graduation' ? 'bg-white dark:bg-slate-800 text-emerald-500 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                                        >
                                            Graduate
                                        </button>
                                    </div>

                                    <div className="space-y-1">
                                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] pl-1">
                                            {moveData.type === 'graduation' ? 'Graduation Session' : 'Target Session'}
                                        </label>
                                        <select
                                            value={moveData.target_academic_session_id}
                                            onChange={e => setMoveData('target_academic_session_id', e.target.value)}
                                            className="w-full bg-white dark:bg-slate-950 border-slate-300 dark:border-slate-800 text-slate-900 dark:text-slate-200 text-sm rounded-2xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/50 transition-all p-4 font-bold"
                                        >
                                            <option value="">Select Session</option>
                                            {sessions.map(s => (
                                                <option key={s.id} value={s.id}>{s.name} {s.is_current ? '(Active)' : ''}</option>
                                            ))}
                                        </select>
                                    </div>

                                    {moveData.type === 'promotion' ? (
                                        <div className="space-y-1">
                                            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] pl-1">Target Class Section</label>
                                            <select
                                                value={moveData.target_class_section_id}
                                                onChange={e => setMoveData('target_class_section_id', e.target.value)}
                                                className="w-full bg-white dark:bg-slate-950 border-slate-300 dark:border-slate-800 text-slate-900 dark:text-slate-200 text-sm rounded-2xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/50 transition-all p-4 font-bold"
                                            >
                                                <option value="">Select Destination</option>
                                                {classSections.map(cs => (
                                                    <option key={cs.id} value={cs.id} disabled={cs.id == filters.class_section_id}>
                                                        {cs.school_class?.name}{cs.class_arm?.name !== 'No arm' ? ` - ${cs.class_arm?.name}` : ''}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                    ) : (
                                        <div className="space-y-1">
                                            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] pl-1">Graduation Date</label>
                                            <input
                                                type="date"
                                                value={moveData.graduated_at || ''}
                                                onChange={e => setMoveData('graduated_at', e.target.value)}
                                                className="w-full bg-white dark:bg-slate-950 border-slate-300 dark:border-slate-800 text-slate-900 dark:text-slate-200 text-sm rounded-2xl focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/50 transition-all p-4 font-bold"
                                            />
                                        </div>
                                    )}

                                    {(moveData.target_class_section_id || moveData.type === 'graduation') && (
                                        <div className={`p-5 rounded-3xl border space-y-2 ${moveData.type === 'graduation' ? 'bg-emerald-500/5 border-emerald-500/10' : 'bg-indigo-500/5 border-indigo-500/10'}`}>
                                            <p className={`text-[10px] font-black uppercase tracking-widest text-center ${moveData.type === 'graduation' ? 'text-emerald-400' : 'text-indigo-400'}`}>
                                                {moveData.type === 'graduation' ? 'Graduation Preview' : 'Movement Preview'}
                                            </p>
                                            <p className="text-xs text-slate-400 text-center leading-relaxed">
                                                {moveData.type === 'graduation' ? (
                                                    <>Graduating <strong className="text-white">{moveData.student_ids.length}</strong> students.</>
                                                ) : (
                                                    <>
                                                        Moving <strong className="text-white">{moveData.student_ids.length}</strong> students to <br />
                                                        <span className="text-indigo-300 font-bold">{classSections.find(c => c.id == moveData.target_class_section_id)?.school_class?.name}{classSections.find(c => c.id == moveData.target_class_section_id)?.class_arm?.name !== 'No arm' ? ` ${classSections.find(c => c.id == moveData.target_class_section_id)?.class_arm?.name}` : ''}</span>
                                                    </>
                                                )}
                                            </p>
                                        </div>
                                    )}

                                    <PrimaryButton
                                        onClick={submitMove}
                                        disabled={moving || moveData.student_ids.length === 0 || (moveData.type === 'promotion' && !moveData.target_class_section_id) || (moveData.type === 'graduation' && (!moveData.target_academic_session_id || !moveData.graduated_at))}
                                        className={`w-full justify-center py-5 text-sm font-black uppercase tracking-widest shadow-xl transition-colors ${moveData.type === 'graduation' ? 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-600/20' : 'bg-indigo-600 hover:bg-indigo-500 shadow-indigo-600/20'}`}
                                    >
                                        {moving ? 'Processing...' : (moveData.type === 'graduation' ? `Graduate Students (${moveData.student_ids.length})` : `Commit Movement (${moveData.student_ids.length})`)}
                                    </PrimaryButton>

                                    <p className="text-[10px] text-center text-slate-600 font-medium">
                                        <AlertCircle size={10} className="inline mr-1" />
                                        Records will be updated immediately.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="py-32 text-center border-2 border-dashed border-slate-300 dark:border-slate-800 rounded-[3rem] bg-slate-100 dark:bg-slate-900/10 flex flex-col items-center">
                        <div className="w-20 h-20 bg-slate-200 dark:bg-slate-900 rounded-3xl border border-slate-300 dark:border-slate-800 flex items-center justify-center text-slate-400 dark:text-slate-700 mb-6 shadow-2xl shadow-black/20">
                            <Users size={40} />
                        </div>
                        <h3 className="text-slate-800 dark:text-slate-200 font-black text-2xl mb-3 tracking-tight uppercase">Ready for Batch Move</h3>
                        <p className="text-slate-600 dark:text-slate-500 text-sm max-w-sm mx-auto leading-relaxed font-medium italic">
                            Select a source class above and click "Load Students" to begin batch processing.
                        </p>
                    </div>
                )}
            </div>
        </AuthenticatedLayout>
    );
}
