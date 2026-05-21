import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, Link, router } from '@inertiajs/react';
import Card from '@/Components/Card';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import TextInput from '@/Components/TextInput';
import InputLabel from '@/Components/InputLabel';
import InputError from '@/Components/InputError';
import Modal from '@/Components/Modal';
import Checkbox from '@/Components/Checkbox';
import Swal from 'sweetalert2';
import { Plus, Search, FileText, Clock, Calendar, CheckCircle, XCircle, MoreVertical, Edit, Trash, BookOpen, BarChart2, RefreshCcw } from 'lucide-react';
import { useState, useEffect } from 'react';

export default function Index({ auth, exams, sessions, terms, subjects, classes, assessment_config }) {
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [editingExam, setEditingExam] = useState(null);

    // Initial values
    const { data, setData, post, put, processing, errors, reset } = useForm({
        title: '',
        academic_session_id: sessions[0]?.id || '',
        term_id: '',
        subject_id: '',
        school_class_id: '',
        section_ids: [],
        duration_minutes: 60,
        start_date: '',
        result_assessment_name: '', // Now mandatory for marks
        shuffle_questions: true,
        show_result_immediately: true,
        is_published: false
    });

    // Derived State
    const filteredTerms = terms.filter(t => t.academic_session_id == data.academic_session_id);
    const selectedClass = classes.find(c => c.id == data.school_class_id);
    const classSections = selectedClass?.sections || [];

    // Filter subjects based on selected class arms (sections)
    const isTeacherOnly = auth.user.roles.includes('Teacher') && !auth.user.roles.includes('Super Admin') && !auth.user.roles.includes('Admin');

    let filteredSubjects = (data.section_ids.length > 0)
        ? [...new Map(
            classSections
                .filter(s => data.section_ids.includes(String(s.id)))
                .flatMap(s => s.subjects || [])
                .map(sub => [sub.id, sub])
        ).values()]
        : subjects;

    // For Admins, if filtering yields nothing (e.g. class has no subjects assigned yet), fallback to all subjects
    // For Teachers, strict filtering is enforced (they can only create exams for what they teach)
    const availableSubjects = (!isTeacherOnly && data.section_ids.length > 0 && filteredSubjects.length === 0)
        ? subjects
        : filteredSubjects;

    // Reset Term when Session changes (Only when creating)
    useEffect(() => {
        if (!editingExam && filteredTerms.length > 0 && !filteredTerms.find(t => t.id == data.term_id)) {
            setData('term_id', filteredTerms[0]?.id || '');
        }
    }, [data.academic_session_id]);


    // Clear sections that don't belong to the selected class
    useEffect(() => {
        if (data.school_class_id && classSections.length > 0) {
            const currentIds = data.section_ids || [];
            let validIds = currentIds.filter(id =>
                classSections.some(s => String(s.id) === String(id))
            );

            // Auto-select "No arm" if it exists for this class
            const noArmSection = classSections.find(s => s.class_arm?.name === 'No arm');
            if (noArmSection && !validIds.includes(String(noArmSection.id))) {
                validIds = [...validIds, String(noArmSection.id)];
            }

            if (validIds.length !== currentIds.length) {
                setData('section_ids', validIds);
            }
        } else if (!data.school_class_id && data.section_ids.length > 0) {
            setData('section_ids', []);
        }
    }, [data.school_class_id, classSections]);

    const openCreateModal = () => {
        setEditingExam(null);
        reset();
        // Set defaults
        setData({
            title: '',
            academic_session_id: sessions[0]?.id || '',
            term_id: filteredTerms[0]?.id || '',
            subject_id: '',
            school_class_id: '',
            section_ids: [],
            duration_minutes: 60,
            start_date: '',
            result_assessment_name: '',
            shuffle_questions: true,
            show_result_immediately: true,
            is_published: false
        });
        setShowCreateModal(true);
    };

    const openEditModal = (exam) => {
        setEditingExam(exam);
        setData({
            title: exam.title,
            academic_session_id: exam.academic_session_id,
            term_id: exam.term_id,
            subject_id: exam.subject_id,
            school_class_id: exam.school_class_id,
            section_ids: exam.sections.map(s => String(s.id)),
            duration_minutes: exam.duration_minutes,
            start_date: exam.start_date ? String(exam.start_date).replace(' ', 'T').substring(0, 16) : '',
            result_assessment_name: exam.result_assessment_name || '',
            shuffle_questions: exam.shuffle_questions,
            show_result_immediately: exam.show_result_immediately,
            is_published: exam.is_published
        });
        setShowCreateModal(true);
    };

    const submit = (e) => {
        e.preventDefault();

        if (editingExam) {
            router.post(route('cbt.exams.update', editingExam.id), {
                ...data,
                _method: 'put'
            }, {
                onSuccess: () => {
                    setShowCreateModal(false);
                    reset();
                    setEditingExam(null);
                    Swal.fire({
                        toast: true,
                        icon: 'success',
                        title: 'Exam updated successfully',
                        position: 'top-end',
                        showConfirmButton: false,
                        timer: 3000
                    });
                },
                onError: () => {
                    Swal.fire('Form Error', 'Please check the marked fields and try again.', 'error');
                }
            });
        } else {
            post(route('cbt.exams.store'), {
                onSuccess: () => {
                    setShowCreateModal(false);
                    reset();
                    Swal.fire({
                        toast: true,
                        icon: 'success',
                        title: 'Exam created successfully',
                        position: 'top-end',
                        showConfirmButton: false,
                        timer: 3000
                    });
                },
                onError: () => {
                    Swal.fire('Form Error', 'Please check the marked fields and try again.', 'error');
                }
            });
        }
    };

    const handleSync = (exam) => {
        if (!exam.result_assessment_name) {
            Swal.fire('No Category', 'Please edit this exam and set a Result Category (e.g. CA1) before syncing.', 'warning');
            return;
        }

        const arms = exam.sections
            ?.filter(s => s.class_arm?.name !== 'No arm')
            ?.map(s => s.class_arm?.name)
            .join(', ');

        Swal.fire({
            title: 'Sync to Results?',
            html: `
                <div class="text-left space-y-2 p-4 bg-slate-50 rounded-2xl border border-slate-200 mb-4">
                    <div class="flex items-center gap-2 mb-2 pb-2 border-b">
                        <div class="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold">Q</div>
                        <div>
                            <p class="font-bold text-slate-800 leading-none">${exam.title}</p>
                            <p class="text-[10px] text-slate-500 uppercase font-bold tracking-wider mt-1">${exam.result_assessment_name} Column</p>
                        </div>
                    </div>
                    
                    <div class="grid grid-cols-2 gap-3 text-xs">
                        <div>
                            <p class="text-[10px] text-slate-400 uppercase font-bold">Session</p>
                            <p class="font-semibold text-slate-700">${exam.academic_session?.name}</p>
                        </div>
                        <div>
                            <p class="text-[10px] text-slate-400 uppercase font-bold">Term</p>
                            <p class="font-semibold text-slate-700">${exam.term?.name}</p>
                        </div>
                        <div class="col-span-2">
                            <p class="text-[10px] text-slate-400 uppercase font-bold">Subject</p>
                            <p class="font-semibold text-slate-700">${exam.subject?.name}</p>
                        </div>
                        <div class="col-span-2">
                            <p class="text-[10px] text-slate-400 uppercase font-bold">Class & Arms</p>
                            <p class="font-semibold text-slate-700">${exam.school_class?.name}${arms ? ` (${arms})` : ''}</p>
                        </div>
                    </div>
                </div>
                <p class="text-sm font-medium text-slate-600 px-2">
                    Are you sure you want to push these <strong>${exam.submitted_attempts_count}</strong> scores into the official <strong>${exam.result_assessment_name}</strong> records?
                </p>
            `,
            icon: 'question',
            showCancelButton: true,
            confirmButtonText: '<div class="flex items-center gap-2">Yes, Sync Scores</div>',
            confirmButtonColor: '#10b981',
            cancelButtonText: 'Cancel',
            showLoaderOnConfirm: true,
            preConfirm: () => {
                return router.post(route('cbt.exams.sync-results', exam.id), {}, {
                    onSuccess: () => {
                        // Handled by global flash
                    }
                });
            }
        });
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleString();
    };

    const handleSectionToggle = (sectionId) => {
        const idStr = String(sectionId);
        if (data.section_ids.includes(idStr)) {
            setData('section_ids', data.section_ids.filter(id => id !== idStr));
        } else {
            setData('section_ids', [...data.section_ids, idStr]);
        }
    };

    const getCalculatedMaxScore = () => {
        if (!data.result_assessment_name) return 'N/A';
        if (data.result_assessment_name === 'Exam') {
            const used = assessment_config.reduce((acc, curr) => acc + parseInt(curr.max_score), 0);
            return 100 - used;
        }
        const config = assessment_config.find(c => c.name === data.result_assessment_name);
        return config ? config.max_score : 'N/A';
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex justify-between items-center">
                    <div>
                        <h2 className="text-xl font-bold text-slate-800 dark:text-white">CBT Exams</h2>
                        <p className="text-sm text-slate-500">Manage computer based tests and assessments.</p>
                    </div>
                    <PrimaryButton onClick={openCreateModal} className="gap-2">
                        <Plus size={18} /> Create Exam
                    </PrimaryButton>
                </div>
            }
        >
            <Head title="CBT Exams" />

            <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {exams.data.map((exam) => (
                        <Card key={exam.id} className="group hover:border-indigo-500 transition-all cursor-pointer relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-3">
                                <span className={`px-2 py-1 rounded text-xs font-bold uppercase ${exam.is_published ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
                                    {exam.is_published ? 'Published' : 'Draft'}
                                </span>
                            </div>

                            <div className="mb-4">
                                <p className="text-[10px] uppercase font-bold text-slate-400 mb-1">{exam.academic_session?.name} • {exam.term?.name}</p>
                                <h3 className="font-bold text-lg text-slate-800 dark:text-white mb-1">{exam.title}</h3>
                                <div className="text-xs text-slate-500 flex items-center gap-2 mb-2">
                                    <span className="bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded">{exam.subject?.name || 'General'}</span>
                                    <span>•</span>
                                    <span>{exam.school_class?.name || 'General'}</span>
                                </div>
                                <div className="flex flex-wrap gap-1 mt-1">
                                    {exam.sections
                                        ?.filter(s => s.class_arm?.name !== 'No arm')
                                        ?.slice(0, 3)
                                        .map(s => (
                                            <span key={s.id} className="text-[10px] bg-slate-100 text-slate-600 px-1.5 rounded border border-slate-200">
                                                {s.class_arm?.name}
                                            </span>
                                        ))}
                                    {exam.sections?.filter(s => s.class_arm?.name !== 'No arm')?.length > 3 && (
                                        <span className="text-[10px] text-slate-400">
                                            +{exam.sections.filter(s => s.class_arm?.name !== 'No arm').length - 3} more
                                        </span>
                                    )}
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-y-2 text-sm text-slate-600 dark:text-slate-400 mb-6 mt-4">
                                <div className="flex items-center gap-1.5">
                                    <Clock size={14} /> {exam.duration_minutes} mins
                                </div>
                                <div className="flex items-center gap-1.5">
                                    <BarChart2 size={14} /> {exam.total_marks} Marks
                                </div>
                                <div className="flex items-center gap-1.5 col-span-2">
                                    <Calendar size={14} /> {formatDate(exam.start_date)}
                                </div>
                            </div>


                            <div className="flex flex-col gap-2 pt-4 border-t border-slate-100 dark:border-slate-800">
                                <Link
                                    href={route('cbt.exams.questions', exam.id)}
                                    className="w-full text-center px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-sm font-bold transition-all"
                                >
                                    Manage Questions
                                </Link>

                                {exam.submitted_attempts_count > 0 && (
                                    <div className="flex gap-2">
                                        <Link
                                            href={route('cbt.exams.results', exam.id)}
                                            className="flex-1 text-center px-3 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-lg text-sm font-bold transition-all border border-indigo-100"
                                        >
                                            Results ({exam.submitted_attempts_count})
                                        </Link>

                                        <button
                                            onClick={() => handleSync(exam)}
                                            className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-bold transition-all shadow-md shadow-emerald-500/20"
                                            title="Sync to Result Management"
                                        >
                                            <RefreshCcw size={14} /> Sync
                                        </button>
                                    </div>
                                )}
                            </div>

                            <div className="mt-2 pt-2 border-t border-slate-50 dark:border-slate-800">
                                <button
                                    type="button"
                                    onClick={(e) => {
                                        e.preventDefault();
                                        router.patch(route('cbt.exams.publish', exam.id), {}, {
                                            preserveScroll: true,
                                            onSuccess: () => {
                                                Swal.fire({
                                                    toast: true,
                                                    icon: 'success',
                                                    title: exam.is_published ? 'Unpublished' : 'Published Live',
                                                    position: 'top-end',
                                                    showConfirmButton: false,
                                                    timer: 3000
                                                });
                                            },
                                            onError: (errors) => {
                                                console.error(errors);
                                                alert('Action failed. See console.');
                                            }
                                        });
                                    }}
                                    className={`w-full py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors ${exam.is_published
                                        ? 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700'
                                        : 'bg-amber-50 hover:bg-amber-100 text-amber-700'
                                        }`}
                                >
                                    {exam.is_published ? 'Published (Click to Unpublish)' : 'Draft (Click to Publish)'}
                                </button>
                            </div>

                            <div className="flex items-center justify-end gap-2 mt-1">
                                <button
                                    onClick={() => openEditModal(exam)}
                                    className="p-2 text-slate-400 hover:text-indigo-600 rounded-lg hover:bg-indigo-50 transition-colors"
                                    title="Edit Exam"
                                >
                                    <Edit size={16} />
                                </button>

                                <button
                                    onClick={() => {
                                        Swal.fire({
                                            title: 'Are you sure?',
                                            text: "You won't be able to revert this!",
                                            icon: 'warning',
                                            showCancelButton: true,
                                            confirmButtonColor: '#3085d6',
                                            cancelButtonColor: '#d33',
                                            confirmButtonText: 'Yes, delete it!'
                                        }).then((result) => {
                                            if (result.isConfirmed) {
                                                router.delete(route('cbt.exams.destroy', exam.id));
                                            }
                                        });
                                    }}
                                    className="p-2 text-slate-400 hover:text-red-500 rounded-lg hover:bg-red-50 transition-colors"
                                    title="Delete Exam"
                                >
                                    <Trash size={16} />
                                </button>
                            </div>
                        </Card>
                    ))}

                    {exams.data.length === 0 && (
                        <div className="col-span-full py-12 text-center text-slate-500 bg-white rounded-xl border border-dashed border-slate-300">
                            <BookOpen className="w-12 h-12 mx-auto mb-3 text-slate-300" />
                            <p>No exams created yet.</p>
                            <button onClick={openCreateModal} className="text-indigo-600 font-bold hover:underline mt-2">Create your first exam</button>
                        </div>
                    )}
                </div>
            </div>

            {/* Create/Edit Exam Modal */}
            <Modal show={showCreateModal} onClose={() => setShowCreateModal(false)} maxWidth="2xl">
                <div className="p-6 max-h-[85vh] overflow-y-auto custom-scrollbar">
                    <h2 className="text-lg font-bold dark:text-white text-slate-900 mb-4">{editingExam ? 'Edit Exam' : 'Create New Exam'}</h2>
                    <form onSubmit={submit} className="space-y-5">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <InputLabel value="Academic Session" className="text-slate-900 dark:text-slate-200" />
                                <select
                                    value={data.academic_session_id}
                                    onChange={e => setData('academic_session_id', e.target.value)}
                                    className="w-full border-slate-300 dark:border-slate-700 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                                >
                                    <option value="">Select Session</option>
                                    {sessions.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                                </select>
                                <InputError message={errors.academic_session_id} />
                            </div>
                            <div>
                                <InputLabel value="Term" className="text-slate-900 dark:text-slate-200" />
                                <select
                                    value={data.term_id}
                                    onChange={e => setData('term_id', e.target.value)}
                                    className="w-full border-slate-300 dark:border-slate-700 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                                    required
                                >
                                    <option value="">Select Term</option>
                                    {filteredTerms.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                                </select>
                                <InputError message={errors.term_id} />
                            </div>
                        </div>

                        <div>
                            <InputLabel value="Exam Title" className="text-slate-900 dark:text-slate-200" />
                            <TextInput
                                value={data.title}
                                onChange={e => setData('title', e.target.value)}
                                className="w-full bg-white dark:bg-slate-900 text-slate-900 dark:text-white border-slate-300 dark:border-slate-700"
                                placeholder="e.g. 1st CA Mathematics"
                                required
                            />
                            <InputError message={errors.title} />
                        </div>

                        <div>
                            <InputLabel value="Result Compilation Category" className="text-slate-900 dark:text-slate-200" />
                            <select
                                value={data.result_assessment_name}
                                onChange={e => setData('result_assessment_name', e.target.value)}
                                className="w-full border-slate-300 dark:border-slate-700 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                                required
                            >
                                <option value="">Select Category...</option>
                                {assessment_config.map((conf, idx) => (
                                    <option key={idx} value={conf.name}>{conf.name} (Max {conf.max_score})</option>
                                ))}
                                <option value="Exam">Main Exam</option>
                                {data.result_assessment_name &&
                                    !['Exam', ...assessment_config.map(c => c.name)].includes(data.result_assessment_name) && (
                                        <option value={data.result_assessment_name}>{data.result_assessment_name} (Legacy)</option>
                                    )}
                            </select>
                            <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                                Max Score: <span className="font-bold text-slate-800 dark:text-slate-200">{getCalculatedMaxScore()}</span> (Auto-calculated from Result Settings)
                            </p>
                            <InputError message={errors.result_assessment_name} />
                        </div>

                        <div className="border-t border-b border-slate-100 dark:border-slate-700 py-4">
                            <div className="mb-4">
                                <InputLabel value="Target Class" className="text-slate-900 dark:text-slate-200" />
                                <select
                                    value={data.school_class_id}
                                    onChange={e => {
                                        const newClassId = e.target.value;
                                        setData(d => ({
                                            ...d,
                                            school_class_id: newClassId,
                                            section_ids: [] // Clear arms when class is manually changed
                                        }));
                                    }}
                                    className="w-full border-slate-300 dark:border-slate-700 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                                    required
                                >
                                    <option value="">Select Class</option>
                                    {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                </select>
                                <InputError message={errors.school_class_id} />
                            </div>

                            {data.school_class_id && (
                                <>
                                    <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 mb-4">
                                        <InputLabel value="Select Class Arms (One or more)" className="mb-2 text-slate-900 dark:text-slate-200" />
                                        <div className="grid grid-cols-2 gap-2 max-h-32 overflow-y-auto custom-scrollbar">
                                            {classSections.map(section => (
                                                <label key={section.id} className="flex items-center gap-2 cursor-pointer hover:bg-white dark:hover:bg-slate-700 p-2 rounded border border-transparent hover:border-slate-200 dark:hover:border-slate-600 transition-colors">
                                                    <Checkbox
                                                        checked={data.section_ids.includes(String(section.id))}
                                                        onChange={() => handleSectionToggle(section.id)}
                                                        disabled={section.class_arm?.name === 'No arm'}
                                                    />
                                                    <span className="text-sm text-slate-700 dark:text-slate-200 font-medium">{section.class_arm?.name || 'Section ' + section.id.substr(0, 4)}</span>
                                                </label>
                                            ))}
                                        </div>
                                        <InputError message={errors.section_ids || Object.keys(errors).find(k => k.startsWith('section_ids.')) ? "One or more selected arms are invalid" : null} />
                                        {classSections.length === 0 && <p className="text-xs text-red-500">No arms found for this class.</p>}
                                    </div>

                                    {data.section_ids.length > 0 && (
                                        <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                                            <InputLabel value="Subject" className="text-slate-900 dark:text-slate-200" />
                                            <select
                                                value={data.subject_id}
                                                onChange={e => setData('subject_id', e.target.value)}
                                                className="w-full border-slate-300 dark:border-slate-700 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                                                required
                                            >
                                                <option value="">Select Subject</option>
                                                {availableSubjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                                            </select>
                                            <InputError message={errors.subject_id} />
                                        </div>
                                    )}
                                </>
                            )}
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <InputLabel value="Duration (Minutes)" className="text-slate-900 dark:text-slate-200" />
                                <TextInput
                                    type="number"
                                    value={data.duration_minutes}
                                    onChange={e => setData('duration_minutes', e.target.value)}
                                    className="w-full bg-white dark:bg-slate-900 text-slate-900 dark:text-white border-slate-300 dark:border-slate-700"
                                    required
                                />
                                <InputError message={errors.duration_minutes} />
                            </div>
                            <div>
                                <InputLabel value="Start Date & Time" className="text-slate-900 dark:text-slate-200" />
                                <TextInput
                                    type="datetime-local"
                                    value={data.start_date}
                                    onChange={e => setData('start_date', e.target.value)}
                                    className="w-full bg-white dark:bg-slate-900 text-slate-900 dark:text-white border-slate-300 dark:border-slate-700"
                                    required
                                />
                                <InputError message={errors.start_date} />
                            </div>
                        </div>

                        <div className="flex flex-col gap-3 pt-2">
                            <label className="flex items-center gap-2 cursor-pointer">
                                <Checkbox
                                    checked={data.shuffle_questions}
                                    onChange={e => setData('shuffle_questions', e.target.checked)}
                                />
                                <span className="text-sm text-slate-700 dark:text-slate-300">Shuffle Questions (Randomize order for students)</span>
                            </label>
                            <label className="flex items-center gap-2 cursor-pointer">
                                <Checkbox
                                    checked={data.show_result_immediately}
                                    onChange={e => setData('show_result_immediately', e.target.checked)}
                                />
                                <span className="text-sm text-slate-700 dark:text-slate-300">Show Result Immediately (Student sees score after submission)</span>
                            </label>
                            <label className="flex items-center gap-2 cursor-pointer">
                                <Checkbox
                                    checked={data.is_published}
                                    onChange={e => setData('is_published', e.target.checked)}
                                />
                                <span className="text-sm text-slate-700 dark:text-slate-300 font-bold text-indigo-600">Publish Live (Make visible to students)</span>
                            </label>
                        </div>

                        <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                            <SecondaryButton className="text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700" onClick={() => setShowCreateModal(false)}>Cancel</SecondaryButton>
                            <PrimaryButton disabled={processing} className="bg-indigo-600 hover:bg-indigo-700 text-white">
                                {editingExam ? 'Update Exam' : 'Create Exam'}
                            </PrimaryButton>
                        </div>
                    </form>
                </div>
            </Modal>
        </AuthenticatedLayout>
    );
}
