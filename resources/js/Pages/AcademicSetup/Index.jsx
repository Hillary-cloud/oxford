import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm, router } from '@inertiajs/react';
import Card from '@/Components/Card';
import PrimaryButton from '@/Components/PrimaryButton';
import {
    Calendar, Pencil, Trash2, Plus, CheckCircle2, XCircle,
    Layers, Landmark, BookOpen, Eye, Clock, LayoutGrid,
    Save, Users2, PlusCircle, UserCheck, GraduationCap, BookMarked, Loader2
} from 'lucide-react';
import { useState, useEffect, useCallback } from 'react';
import Modal from '@/Components/Modal';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import InputError from '@/Components/InputError';
import Checkbox from '@/Components/Checkbox';
import SecondaryButton from '@/Components/SecondaryButton';
import { toast } from 'react-toastify';
import Swal from 'sweetalert2';
import axios from 'axios';

export default function Index({ auth, sessions, terms, classes, arms, availableArms, teachers = [], allSubjects = [], active_tab, currentSession, classSectionsForAssignment = [] }) {
    const [activeTab, setActiveTab] = useState(active_tab || 'sessions');
    const { delete: destroy } = useForm();

    // Modal Visibility State
    const [showingSessionModal, setShowingSessionModal] = useState(false);
    const [showingTermModal, setShowingTermModal] = useState(false);
    const [showingClassModal, setShowingClassModal] = useState(false);
    const [showingArmModal, setShowingArmModal] = useState(false);
    const [showingViewClassModal, setShowingViewClassModal] = useState(false);
    const [showingSubjectModal, setShowingSubjectModal] = useState(false);

    // Editing/Viewing state
    const [editingSession, setEditingSession] = useState(null);
    const [editingTerm, setEditingTerm] = useState(null);
    const [editingClass, setEditingClass] = useState(null);
    const [editingArm, setEditingArm] = useState(null);
    const [viewingClass, setViewingClass] = useState(null);
    const [targetSection, setTargetSection] = useState(null);

    // Form Hooks
    const sessionForm = useForm({
        name: '',
        start_date: '',
        end_date: '',
        is_current: false,
    });

    const termForm = useForm({
        academic_session_id: '',
        name: '',
        start_date: '',
        end_date: '',
        is_current: false,
    });

    const classForm = useForm({
        name: '',
        level: '',
        arm_ids: [],
    });

    const armForm = useForm({
        name: '',
    });

    const subjectForm = useForm({
        subjects: [],
    });

    // Submit Handlers
    const submitSession = (e) => {
        e.preventDefault();
        const action = editingSession
            ? sessionForm.patch(route('academic-sessions.update', editingSession.id))
            : sessionForm.post(route('academic-sessions.store'));

        action.then(() => {
            // onSuccess handled in callback below
        });
    };

    // Refined Submit Handlers with better callbacks
    const handleSessionSubmit = (e) => {
        e.preventDefault();
        if (editingSession) {
            sessionForm.patch(route('academic-sessions.update', editingSession.id), {
                onSuccess: () => {
                    setShowingSessionModal(false);
                    setEditingSession(null);
                    sessionForm.reset();
                },
            });
        } else {
            sessionForm.post(route('academic-sessions.store'), {
                onSuccess: () => {
                    setShowingSessionModal(false);
                    sessionForm.reset();
                },
            });
        }
    };

    const handleTermSubmit = (e) => {
        e.preventDefault();
        if (editingTerm) {
            termForm.patch(route('terms.update', editingTerm.id), {
                onSuccess: () => {
                    setShowingTermModal(false);
                    setEditingTerm(null);
                    termForm.reset();
                },
            });
        } else {
            termForm.post(route('terms.store'), {
                onSuccess: () => {
                    setShowingTermModal(false);
                    termForm.reset();
                },
            });
        }
    };

    const handleClassSubmit = (e) => {
        e.preventDefault();
        if (editingClass) {
            classForm.put(route('classes.update', editingClass.id), {
                onSuccess: () => {
                    setShowingClassModal(false);
                    setEditingClass(null);
                    classForm.reset();
                },
            });
        } else {
            classForm.post(route('classes.store'), {
                onSuccess: () => {
                    setShowingClassModal(false);
                    classForm.reset();
                },
            });
        }
    };

    const handleArmSubmit = (e) => {
        e.preventDefault();
        if (editingArm) {
            armForm.patch(route('class-arms.update', editingArm.id), {
                onSuccess: () => {
                    setShowingArmModal(false);
                    setEditingArm(null);
                    armForm.reset();
                },
            });
        } else {
            armForm.post(route('class-arms.store'), {
                onSuccess: () => {
                    setShowingArmModal(false);
                    armForm.reset();
                },
            });
        }
    };

    // Edit Openers
    const openEditSession = (session) => {
        setEditingSession(session);
        sessionForm.setData({
            name: session.name || '',
            start_date: session.start_date || '',
            end_date: session.end_date || '',
            is_current: !!session.is_current,
        });
        setShowingSessionModal(true);
    };

    const openEditTerm = (term) => {
        setEditingTerm(term);
        termForm.setData({
            academic_session_id: term.academic_session_id || '',
            name: term.name || '',
            start_date: term.start_date || '',
            end_date: term.end_date || '',
            is_current: !!term.is_current,
        });
        setShowingTermModal(true);
    };

    const openEditClass = (schoolClass) => {
        setEditingClass(schoolClass);
        classForm.setData({
            name: schoolClass.name || '',
            level: schoolClass.level || '',
            arm_ids: schoolClass.arms?.map(arm => arm.id) || [],
        });
        setShowingClassModal(true);
    };

    const openEditArm = (arm) => {
        setEditingArm(arm);
        armForm.setData({
            name: arm.name || '',
        });
        setShowingArmModal(true);
    };

    const toggleArm = (id) => {
        const armToToggle = availableArms.find(a => a.id === id);
        const isNoArm = armToToggle?.name === 'No arm';

        let newIds;
        if (isNoArm) {
            // If "No arm" is toggled on, remove all others. If toggled off, just clear.
            newIds = classForm.data.arm_ids.includes(id) ? [] : [id];
        } else {
            // If another arm is toggled, ensure "No arm" is removed.
            const filteredIds = classForm.data.arm_ids.filter(armId => {
                const arm = availableArms.find(a => a.id === armId);
                return arm?.name !== 'No arm';
            });

            newIds = classForm.data.arm_ids.includes(id)
                ? filteredIds.filter(armId => armId !== id)
                : [...filteredIds, id];
        }

        classForm.setData('arm_ids', newIds);
    };

    // -------------------------------------------------------
    // Subject Assignment Tab State
    // -------------------------------------------------------
    const [assignSessionId, setAssignSessionId] = useState(
        currentSession ? String(currentSession.id) : ''
    );
    const [assignSectionId, setAssignSectionId] = useState('');
    const [assignStudents, setAssignStudents] = useState([]);
    const [assignElectives, setAssignElectives] = useState([]);
    const [assignLoading, setAssignLoading] = useState(false);
    const [assignSaving, setAssignSaving] = useState(false);
    // Map of student_id -> Set of subject_ids
    const [assignSelections, setAssignSelections] = useState({});

    const loadAssignmentData = useCallback(() => {
        if (!assignSectionId || !assignSessionId) return;
        setAssignLoading(true);
        axios.post(route('student-subject-assignments.get-students'), {
            class_section_id: assignSectionId,
            academic_session_id: assignSessionId,
        }).then(({ data }) => {
            setAssignStudents(data.students);
            setAssignElectives(data.electiveSubjects);
            // Build selections map
            const sel = {};
            data.students.forEach(s => {
                sel[s.id] = new Set(s.assigned_subject_ids);
            });
            setAssignSelections(sel);
        }).catch(() => {
            toast.error('Failed to load students.');
        }).finally(() => setAssignLoading(false));
    }, [assignSectionId, assignSessionId]);

    useEffect(() => {
        if (activeTab === 'subject-assignment' && assignSectionId && assignSessionId) {
            loadAssignmentData();
        }
    }, [activeTab, assignSectionId, assignSessionId]);

    const toggleElectiveForStudent = (studentId, subjectId) => {
        setAssignSelections(prev => {
            const current = new Set(prev[studentId] || []);
            if (current.has(subjectId)) {
                current.delete(subjectId);
            } else {
                current.add(subjectId);
            }
            return { ...prev, [studentId]: current };
        });
    };

    const selectAllElectivesForStudent = (studentId) => {
        setAssignSelections(prev => ({
            ...prev,
            [studentId]: new Set(assignElectives.map(s => s.id)),
        }));
    };

    const clearElectivesForStudent = (studentId) => {
        setAssignSelections(prev => ({ ...prev, [studentId]: new Set() }));
    };

    const selectAllForEveryone = () => {
        const allElectiveIds = assignElectives.map(s => s.id);
        const newSelections = {};
        assignStudents.forEach(student => {
            newSelections[student.id] = new Set(allElectiveIds);
        });
        setAssignSelections(newSelections);
        toast.info('Selected all elective subjects for all students.');
    };

    const handleSaveAssignments = () => {
        if (!assignSectionId || !assignSessionId) return;
        setAssignSaving(true);
        const assignments = assignStudents.map(student => ({
            student_id: student.id,
            subject_ids: Array.from(assignSelections[student.id] || []),
        }));
        router.post(route('student-subject-assignments.store'), {
            class_section_id: assignSectionId,
            academic_session_id: assignSessionId,
            assignments,
        }, {
            preserveScroll: true,
            onSuccess: () => { toast.success('Assignments saved!'); },
            onError: () => { toast.error('Failed to save assignments.'); },
            onFinish: () => setAssignSaving(false),
        });
    };

    const tabs = [
        { id: 'sessions', name: 'Sessions', icon: Calendar },
        { id: 'terms', name: 'Terms', icon: Clock },
        { id: 'classes', name: 'Classes', icon: Landmark },
        { id: 'arms', name: 'Class Arms', icon: Layers },
        { id: 'allocations', name: 'Allocations', icon: BookOpen },
        { id: 'subject-assignment', name: 'Subject Assignment', icon: GraduationCap },
    ];

    const openViewClass = (schoolClass) => {
        // We need to ensure we have the full section details for the modal
        // The classes prop might already have sections/arms, but we should verify the depth
        setViewingClass(schoolClass);
        setShowingViewClassModal(true);
    };

    const handleDelete = (type, id) => {
        const routes = {
            sessions: 'academic-sessions.destroy',
            terms: 'terms.destroy',
            classes: 'classes.destroy',
            arms: 'class-arms.destroy',
        };

        Swal.fire({
            title: 'Are you sure?',
            text: `This ${type.slice(0, -1)} and all associated data will be permanently removed.`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#4f46e5',
            cancelButtonColor: '#ef4444',
            confirmButtonText: 'Yes, delete it!',
            background: '#0f172a',
            color: '#f8fafc',
            borderRadius: '1.5rem',
        }).then((result) => {
            if (result.isConfirmed) {
                destroy(route(routes[type], id), {
                    onSuccess: () => {
                        // Success message handled globally
                    }
                });
            }
        });
    };

    const handleAssignFormTeacher = (sectionId, teacherId, classId = null) => {
        const targetClassId = classId || viewingClass?.id;

        if (!targetClassId) {
            console.error("No class ID provided for assignment");
            return;
        }

        router.post(route('classes.assign-form-teacher', targetClassId), {
            class_section_id: sectionId,
            form_teacher_id: teacherId,
        }, {
            preserveScroll: true,
            onSuccess: () => {
                // Success message handled globally
            },
        });
    };

    const openSubjectModal = (section) => {
        setTargetSection(section);
        const assigned = section.section_subjects?.map(item => ({
            id: item.subject_id,
            teacher_id: item.teacher_id
        })) || [];
        subjectForm.setData('subjects', assigned);
        setShowingSubjectModal(true);
    };

    const toggleSubject = (subjectId) => {
        const isSelected = subjectForm.data.subjects.some(s => s.id === subjectId);
        let newSubjects;

        if (isSelected) {
            newSubjects = subjectForm.data.subjects.filter(s => s.id !== subjectId);
        } else {
            newSubjects = [...subjectForm.data.subjects, { id: subjectId, teacher_id: '' }];
        }

        subjectForm.setData('subjects', newSubjects);
    };

    const bulkAssignTeacher = (teacherId) => {
        const newSubjects = subjectForm.data.subjects.map(s => ({
            ...s,
            teacher_id: teacherId
        }));
        subjectForm.setData('subjects', newSubjects);
    };

    const updateSubjectTeacher = (subjectId, teacherId) => {
        const newSubjects = subjectForm.data.subjects.map(s => {
            if (s.id === subjectId) {
                return { ...s, teacher_id: teacherId };
            }
            return s;
        });
        subjectForm.setData('subjects', newSubjects);
    };

    const handleSubjectUpdate = (e) => {
        e.preventDefault();
        subjectForm.put(route('sections.subjects.update', targetSection.id), {
            onSuccess: () => {
                setShowingSubjectModal(false);
            },
        });
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex flex-col gap-1">
                        <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Academic Setup</h2>
                        <p className="text-slate-600 dark:text-white text-sm">Configure your school's structural foundation.</p>
                    </div>
                    {currentSession && (
                        <div className="flex items-center gap-2 bg-indigo-500/10 border border-indigo-500/20 px-4 py-2 rounded-2xl">
                            <Calendar size={14} className="text-indigo-400" />
                            <div className="flex flex-col">
                                <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest leading-none">Active Session</span>
                                <span className="text-xs font-bold text-slate-800 dark:text-white">{currentSession.name}</span>
                            </div>
                        </div>
                    )}
                </div>
            }
        >
            <Head title="Academic Setup" />

            <div className="space-y-6">
                {/* Tabs Navigation */}
                <div className="flex flex-wrap gap-2 p-1 bg-slate-100 dark:bg-slate-900/50 border border-slate-300 dark:border-slate-800 rounded-2xl w-fit">
                    {tabs.map((tab) => {
                        const Icon = tab.icon;
                        return (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all flex items-center gap-2 ${activeTab === tab.id
                                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20'
                                    : 'text-slate-600 dark:text-white hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-800'
                                    }`}
                            >
                                <Icon size={16} />
                                {tab.name}
                            </button>
                        );
                    })}
                </div>

                {/* Tab Content */}
                <div className="transition-all duration-300">
                    {activeTab === 'sessions' && (
                        <Card
                            title="Sessions Timeline"
                            description={`Tracking ${sessions.length} academic periods.`}
                            actions={
                                <PrimaryButton className="gap-2" onClick={() => { setEditingSession(null); sessionForm.reset(); setShowingSessionModal(true); }}>
                                    <Plus size={18} />
                                    Add New Session
                                </PrimaryButton>
                            }
                        >
                            <div className="overflow-x-auto -mx-6">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="border-b border-slate-300 dark:border-slate-800/50 bg-slate-50 dark:bg-slate-900/30">
                                            <th className="px-6 py-4 text-[10px] font-bold text-slate-700 dark:text-slate-500 uppercase tracking-widest">Session Name</th>
                                            <th className="px-6 py-4 text-[10px] font-bold text-slate-700 dark:text-slate-500 uppercase tracking-widest">Duration</th>
                                            <th className="px-6 py-4 text-[10px] font-bold text-slate-700 dark:text-slate-500 uppercase tracking-widest">Status</th>
                                            <th className="px-6 py-4 text-[10px] font-bold text-slate-700 dark:text-slate-500 uppercase tracking-widest text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-200 dark:divide-slate-800/30">
                                        {sessions.map((session) => (
                                            <tr key={session.id} className="group hover:bg-indigo-50/50 dark:hover:bg-slate-800/20 transition-colors">
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 font-bold">
                                                            <Calendar size={20} />
                                                        </div>
                                                        <div>
                                                            <p className="text-sm font-semibold text-slate-800 dark:text-white">{session.name}</p>
                                                            <p className="text-xs text-slate-500">Academic Year</p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex flex-col gap-0.5">
                                                        <span className="text-xs text-slate-700 dark:text-slate-300">Start: {session.start_date ? new Date(session.start_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Not set'}</span>
                                                        <span className="text-xs text-slate-500">End: {session.end_date ? new Date(session.end_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Not set'}</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    {session.is_current ? (
                                                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-600 border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20 border">
                                                            <CheckCircle2 size={10} />
                                                            Current
                                                        </span>
                                                    ) : (
                                                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-500/10 text-slate-500 border border-slate-500/20">
                                                            <XCircle size={10} />
                                                            Previous
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <div className="flex items-center justify-end gap-2">
                                                        <button
                                                            onClick={() => openEditSession(session)}
                                                            className="p-2 text-slate-800 dark:text-white hover:text-indigo-400 hover:bg-indigo-500/10 rounded-lg transition-all"
                                                            title="Edit Session"
                                                        >
                                                            <Pencil size={18} />
                                                        </button>
                                                        <button
                                                            onClick={() => handleDelete('sessions', session.id)}
                                                            className="p-2 text-slate-800 dark:text-white hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-all"
                                                            title="Delete Session"
                                                        >
                                                            <Trash2 size={18} />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </Card>
                    )}

                    {activeTab === 'terms' && (
                        <div className="space-y-6">
                            <div className="flex justify-end">
                                <PrimaryButton className="gap-2" onClick={() => { setEditingTerm(null); termForm.reset(); setShowingTermModal(true); }}>
                                    <Plus size={18} />
                                    Add New Term
                                </PrimaryButton>
                            </div>
                            {sessions.map((session) => (
                                <Card
                                    key={session.id}
                                    title={session.name}
                                    description={`${session.terms?.length || 0} terms defined.`}
                                    actions={
                                        <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-widest border ${session.is_current
                                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                                            : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-500 border-slate-300 dark:border-slate-700'
                                            }`}>
                                            {session.is_current ? 'Current Session' : 'Archived'}
                                        </span>
                                    }
                                >
                                    {(session.terms?.length || 0) > 0 ? (
                                        <div className="overflow-x-auto -mx-6">
                                            <table className="w-full text-left border-collapse">
                                                <thead>
                                                    <tr className="border-b border-slate-300 dark:border-slate-800/50 bg-slate-50 dark:bg-slate-900/30">
                                                        <th className="px-6 py-4 text-[10px] font-bold text-slate-700 dark:text-slate-500 uppercase tracking-widest">Term Name</th>
                                                        <th className="px-6 py-4 text-[10px] font-bold text-slate-700 dark:text-slate-500 uppercase tracking-widest">Timeline</th>
                                                        <th className="px-6 py-4 text-[10px] font-bold text-slate-700 dark:text-slate-500 uppercase tracking-widest text-right">Actions</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-slate-200 dark:divide-slate-800/30">
                                                    {session.terms.map((term) => (
                                                        <tr key={term.id} className="group hover:bg-indigo-50/50 dark:hover:bg-slate-800/20 transition-colors">
                                                            <td className="px-6 py-4">
                                                                <div className="flex items-center gap-3">
                                                                    <div className="w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 font-bold">
                                                                        <Clock size={14} />
                                                                    </div>
                                                                    <div>
                                                                        <p className="text-sm font-semibold text-slate-800 dark:text-white">{term.name}</p>
                                                                        {term.is_current && (
                                                                            <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold bg-emerald-500/20 dark:bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/30 dark:border-emerald-500/20">Active Term</span>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            </td>
                                                            <td className="px-6 py-4">
                                                                <div className="flex flex-col gap-0.5">
                                                                    <span className="text-xs text-slate-700 dark:text-slate-300">
                                                                        {term.start_date ? new Date(term.start_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'N/A'}
                                                                    </span>
                                                                    <span className="text-[10px] text-slate-500">
                                                                        to {term.end_date ? new Date(term.end_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'N/A'}
                                                                    </span>
                                                                </div>
                                                            </td>
                                                            <td className="px-6 py-4 text-right">
                                                                <div className="flex items-center justify-end gap-2">
                                                                    <button
                                                                        onClick={() => openEditTerm(term)}
                                                                        className="p-2 text-slate-800 dark:text-white hover:text-indigo-400 hover:bg-indigo-500/10 rounded-lg transition-all"
                                                                        title="Edit Term"
                                                                    >
                                                                        <Pencil size={16} />
                                                                    </button>
                                                                    <button
                                                                        onClick={() => handleDelete('terms', term.id)}
                                                                        className="p-2 text-slate-800 dark:text-white hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-all"
                                                                        title="Delete Term"
                                                                    >
                                                                        <Trash2 size={16} />
                                                                    </button>
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    ) : (
                                        <div className="p-8 text-center text-slate-500 text-sm">
                                            No terms added to this session yet.
                                        </div>
                                    )}
                                </Card>
                            ))}
                        </div>
                    )}

                    {activeTab === 'classes' && (
                        <Card
                            title="Class Registry"
                            description={`Organizing ${classes.length} levels with their respective arms.`}
                            actions={
                                <PrimaryButton className="gap-2" onClick={() => { setEditingClass(null); classForm.reset(); setShowingClassModal(true); }}>
                                    <Plus size={18} />
                                    Add New Class
                                </PrimaryButton>
                            }
                        >
                            <div className="overflow-x-auto -mx-6">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="border-b border-slate-300 dark:border-slate-800/50 bg-slate-50 dark:bg-slate-900/30">
                                            <th className="px-6 py-4 text-[10px] font-bold text-slate-700 dark:text-slate-500 uppercase tracking-widest text-left w-1/3">Class Name / Arms</th>
                                            <th className="px-6 py-4 text-[10px] font-bold text-slate-700 dark:text-slate-500 uppercase tracking-widest text-left w-1/4">Academic Level</th>
                                            <th className="px-6 py-4 text-[10px] font-bold text-slate-700 dark:text-slate-500 uppercase tracking-widest text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-200 dark:divide-slate-800/30">
                                        {classes.map((schoolClass) => (
                                            <tr key={schoolClass.id} className="group hover:bg-indigo-50/50 dark:hover:bg-slate-800/20 transition-colors">
                                                <td className="px-6 py-5">
                                                    <div className="flex flex-col gap-3">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 font-bold shrink-0">
                                                                <Landmark size={18} />
                                                            </div>
                                                            <div>
                                                                <p className="text-sm font-bold text-slate-800 dark:text-white">{schoolClass.name}</p>
                                                                <p className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">Academic Class</p>
                                                            </div>
                                                        </div>

                                                        {/* Class Arms Grid */}
                                                        <div className="pl-12">
                                                            <div className="flex flex-wrap gap-2">
                                                                {schoolClass.sections?.length > 0 ? (
                                                                    schoolClass.sections
                                                                        .filter(section => section.class_arm?.name !== 'No arm')
                                                                        .map(section => (
                                                                            (auth.user.roles.includes('Super Admin') || auth.user.permissions.includes('manage subject')) && (
                                                                                <button
                                                                                    key={section.id}
                                                                                    onClick={() => openSubjectModal(section)}
                                                                                    className="group/btn px-3 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-600 dark:text-slate-300 shadow-sm hover:shadow-md hover:border-indigo-500 dark:hover:border-indigo-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:-translate-y-0.5 transition-all duration-200 flex items-center gap-1.5 cursor-pointer ring-0 hover:ring-2 hover:ring-indigo-500/20"
                                                                                    title="Manage Subjects"
                                                                                >
                                                                                    <Layers size={14} className="text-slate-800 dark:text-white group-hover/btn:text-indigo-500 transition-colors" />
                                                                                    <span>{section.class_arm?.name}</span>
                                                                                </button>
                                                                            )
                                                                        ))
                                                                ) : (
                                                                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-dashed border-slate-300 dark:border-slate-700 text-xs text-white">
                                                                        <span className="italic">No arms allocated</span>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-5 align-top pt-8">
                                                    <span className="inline-block px-2.5 py-1 rounded-md bg-slate-100 dark:bg-slate-800 text-xs font-medium text-slate-600 dark:text-white border border-slate-200 dark:border-slate-700">
                                                        {schoolClass.level || 'No Level Set'}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <div className="flex items-center justify-end gap-2">
                                                        <button
                                                            onClick={() => openViewClass(schoolClass)}
                                                            className="px-3 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/30 transition-all flex items-center gap-2"
                                                        >
                                                            <Eye size={14} />
                                                            Manage Class
                                                        </button>
                                                        <button
                                                            onClick={() => openEditClass(schoolClass)}
                                                            className="p-2 text-slate-800 dark:text-white hover:text-indigo-400 hover:bg-indigo-500/10 rounded-lg transition-all"
                                                            title="Edit Class"
                                                        >
                                                            <Pencil size={18} />
                                                        </button>
                                                        <button
                                                            onClick={() => handleDelete('classes', schoolClass.id)}
                                                            className="p-2 text-slate-800 dark:text-white hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-all"
                                                            title="Delete Class"
                                                        >
                                                            <Trash2 size={18} />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </Card>
                    )}

                    {activeTab === 'arms' && (
                        <Card
                            title="Available Arms"
                            description={`Global registry of ${arms.length} class arms.`}
                            actions={
                                <PrimaryButton className="gap-2" onClick={() => { setEditingArm(null); armForm.reset(); setShowingArmModal(true); }}>
                                    <Plus size={18} />
                                    Add New Arm
                                </PrimaryButton>
                            }
                        >
                            <div className="overflow-x-auto -mx-6">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="border-b border-slate-300 dark:border-slate-800/50 bg-slate-50 dark:bg-slate-900/30">
                                            <th className="px-6 py-4 text-[10px] font-bold text-slate-700 dark:text-slate-500 uppercase tracking-widest">Arm Name</th>
                                            <th className="px-6 py-4 text-[10px] font-bold text-slate-700 dark:text-slate-500 uppercase tracking-widest">Usage Count</th>
                                            <th className="px-6 py-4 text-[10px] font-bold text-slate-700 dark:text-slate-500 uppercase tracking-widest text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-200 dark:divide-slate-800/30">
                                        {arms.length === 0 ? (
                                            <tr>
                                                <td colSpan="3" className="px-6 py-10 text-center text-slate-500 italic">
                                                    No arms defined yet.
                                                </td>
                                            </tr>
                                        ) : (
                                            arms.map((arm) => (
                                                <tr key={arm.id} className="group hover:bg-indigo-50/50 dark:hover:bg-slate-800/20 transition-colors">
                                                    <td className="px-6 py-4">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 font-bold">
                                                                <Layers size={18} />
                                                            </div>
                                                            <div>
                                                                <span className="text-sm font-semibold text-slate-800 dark:text-white">{arm.name}</span>
                                                                {arm.name === 'No arm' && (
                                                                    <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5 max-w-xs leading-relaxed">
                                                                        Use this for schools that have just one class per level. It marks the class as having no sub-divisions.
                                                                    </p>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <span className="text-sm text-slate-700 dark:text-white">Used in {arm.sections_count} class{arm.sections_count !== 1 ? 'es' : ''}</span>
                                                    </td>
                                                    <td className="px-6 py-4 text-right">
                                                        {arm.name !== 'No arm' && (
                                                            <div className="flex items-center justify-end gap-2">
                                                                <button
                                                                    onClick={() => openEditArm(arm)}
                                                                    className="p-2 text-slate-800 dark:text-white hover:text-indigo-400 hover:bg-indigo-500/10 rounded-lg transition-all"
                                                                    title="Edit Arm"
                                                                >
                                                                    <Pencil size={18} />
                                                                </button>
                                                                <button
                                                                    onClick={() => handleDelete('arms', arm.id)}
                                                                    className="p-2 text-slate-800 dark:text-white hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-all"
                                                                    title="Delete Arm"
                                                                >
                                                                    <Trash2 size={18} />
                                                                </button>
                                                            </div>
                                                        )}
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </Card>
                    )}

                    {activeTab === 'allocations' && (
                        <div className="space-y-6">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                <div>
                                    <h2 className="text-xl font-bold text-slate-800 dark:text-white">Class Allocations</h2>
                                    <p className="text-sm text-slate-600 dark:text-slate-400">Manage Form Teachers and Subject Teachers for all classes.</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 gap-6">
                                {classes.map((schoolClass) => (
                                    <div key={schoolClass.id} className="space-y-3">
                                        <h3 className="text-lg font-bold text-slate-700 dark:text-slate-300 px-1 border-l-4 border-indigo-500 pl-3">
                                            {schoolClass.name}
                                        </h3>
                                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                                            {(schoolClass.sections || []).map((section) => (
                                                <div key={section.id} className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden flex flex-col">
                                                    {/* Card Header */}
                                                    <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 flex items-center justify-between">
                                                        <div className="flex items-center gap-2">
                                                            {section.class_arm?.name !== 'No arm' && (
                                                                <>
                                                                    <div className="w-8 h-8 rounded-lg bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-bold text-sm">
                                                                        {section.class_arm?.name?.charAt(0) || section.name?.charAt(0)}
                                                                    </div>
                                                                    <span className="text-sm font-bold text-slate-800 dark:text-white">
                                                                        {section.class_arm?.name}
                                                                    </span>
                                                                </>
                                                            )}
                                                        </div>
                                                        <button
                                                            onClick={() => openSubjectModal(section)}
                                                            className="text-xs font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 transition-colors"
                                                        >
                                                            Manage Subjects &rarr;
                                                        </button>
                                                    </div>

                                                    {/* Form Teacher Section */}
                                                    <div className="p-4 bg-indigo-50/30 dark:bg-indigo-900/5 border-b border-indigo-100 dark:border-indigo-900/20">
                                                        <div className="flex items-center justify-between mb-2">
                                                            <span className="text-[10px] uppercase font-bold text-indigo-400 tracking-wider">Form Teacher</span>
                                                        </div>
                                                        <div className="flex items-center gap-3">
                                                            <div className="p-1.5 bg-white dark:bg-slate-700 rounded-full shadow-sm text-indigo-500">
                                                                <UserCheck size={14} />
                                                            </div>
                                                            <select
                                                                value={section.form_teacher_id || ''}
                                                                onChange={(e) => handleAssignFormTeacher(section.id, e.target.value, schoolClass.id)}
                                                                className="flex-1 bg-transparent border-0 border-b border-indigo-200 dark:border-indigo-800 text-sm font-semibold text-slate-800 dark:text-slate-200 focus:ring-0 focus:border-indigo-500 py-1 rounded-md"
                                                            >
                                                                <option value="" className='text-slate-900'>Assign Teacher...</option>
                                                                {teachers?.map(t => (
                                                                    <option key={t.id} value={t.id} className='text-slate-900'>{t.name}</option>
                                                                ))}
                                                            </select>
                                                        </div>
                                                    </div>

                                                    {/* Subjects Summary */}
                                                    <div className="p-4 flex-1 flex flex-col gap-3">
                                                        <div className="flex items-center justify-between">
                                                            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Assigned Curriculum</span>
                                                            <span className="px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-700 text-[10px] font-bold text-slate-600 dark:text-slate-300">
                                                                {section.section_subjects?.length || 0} Subjects
                                                            </span>
                                                        </div>

                                                        {section.section_subjects?.length > 0 ? (
                                                            <div className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto custom-scrollbar pr-1">
                                                                {section.section_subjects.map(subject => (
                                                                    <div key={subject.id} className="w-full flex items-center justify-between px-2 py-1.5 rounded-md bg-slate-50 dark:bg-slate-700/50 border border-slate-100 dark:border-slate-700">
                                                                        <span className="text-xs font-medium text-slate-700 dark:text-slate-300 truncate max-w-[50%]">
                                                                            {subject.subject?.name}
                                                                        </span>
                                                                        <span className="text-[10px] text-slate-500 dark:text-slate-400 flex items-center gap-1 max-w-[45%] truncate">
                                                                            {subject.teacher ? (
                                                                                <>
                                                                                    <span className="w-1.5 h-1.5 rounded-full bg-green-500 shrink-0"></span>
                                                                                    {subject.teacher.name.split(' ')[0]}
                                                                                </>
                                                                            ) : (
                                                                                <>
                                                                                    <span className="w-1.5 h-1.5 rounded-full bg-orange-400 shrink-0"></span>
                                                                                    <span className="italic">No Teacher</span>
                                                                                </>
                                                                            )}
                                                                        </span>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        ) : (
                                                            <div className="flex-1 flex flex-col items-center justify-center text-center py-4 text-slate-400 dark:text-slate-600 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-lg">
                                                                <BookOpen size={20} className="mb-2 opacity-50" />
                                                                <p className="text-xs">No subjects assigned</p>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            ))}
                                            {(!schoolClass.sections || schoolClass.sections.length === 0) && (
                                                <div className="col-span-full p-6 text-center bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-dashed border-slate-300 dark:border-slate-700">
                                                    <p className="text-sm text-slate-500 dark:text-slate-400">No sections defined for this class.</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Session Creation/Edit Modal */}
            <Modal show={showingSessionModal} onClose={() => { setShowingSessionModal(false); setEditingSession(null); sessionForm.reset(); }}>
                <div className="p-6">
                    <h2 className="text-lg font-medium text-slate-800 dark:text-white mb-1">{editingSession ? 'Edit' : 'Create'} Session</h2>
                    <p className="text-sm text-slate-600 dark:text-slate-500 mb-6 font-medium">{editingSession ? `Updating ${editingSession.name}` : 'Initialize a new academic calendar year.'}</p>

                    <form onSubmit={handleSessionSubmit} className="space-y-6">
                        <div>
                            <InputLabel htmlFor="name" value="Session Name" />
                            <TextInput
                                id="name"
                                type="text"
                                value={sessionForm.data.name}
                                className="block w-full"
                                onChange={(e) => sessionForm.setData('name', e.target.value)}
                                required
                                placeholder="e.g. 2024/2025"
                            />
                            <InputError message={sessionForm.errors.name} />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <InputLabel htmlFor="start_date" value="Start Date" />
                                <TextInput
                                    id="start_date"
                                    type="date"
                                    value={sessionForm.data.start_date}
                                    className="block w-full"
                                    onChange={(e) => sessionForm.setData('start_date', e.target.value)}
                                />
                                <InputError message={sessionForm.errors.start_date} />
                            </div>

                            <div>
                                <InputLabel htmlFor="end_date" value="End Date" />
                                <TextInput
                                    id="end_date"
                                    type="date"
                                    value={sessionForm.data.end_date}
                                    className="block w-full"
                                    onChange={(e) => sessionForm.setData('end_date', e.target.value)}
                                />
                                <InputError message={sessionForm.errors.end_date} />
                            </div>
                        </div>

                        <div className="p-4 bg-slate-100 dark:bg-slate-900 rounded-xl border border-slate-300 dark:border-slate-800">
                            <label className="flex items-center cursor-pointer group">
                                <Checkbox
                                    checked={sessionForm.data.is_current}
                                    onChange={(e) => sessionForm.setData('is_current', e.target.checked)}
                                />
                                <span className="ms-3 text-sm font-medium text-slate-700 dark:text-slate-300 group-hover:text-slate-900 dark:group-hover:text-white transition-colors">
                                    Set as the active current session
                                </span>
                            </label>
                            <InputError message={sessionForm.errors.is_current} />
                        </div>

                        <div className="flex items-center justify-end gap-3 pt-6 border-t border-slate-300 dark:border-slate-800">
                            <SecondaryButton onClick={() => { setShowingSessionModal(false); setEditingSession(null); sessionForm.reset(); }}>Cancel</SecondaryButton>
                            <PrimaryButton className="gap-2" disabled={sessionForm.processing}>
                                {editingSession ? <Save size={18} /> : <Plus size={18} />}
                                {editingSession ? 'Update' : 'Create'} Session
                            </PrimaryButton>
                        </div>
                    </form>
                </div>
            </Modal>

            {/* Term Creation/Edit Modal */}
            <Modal show={showingTermModal} onClose={() => { setShowingTermModal(false); setEditingTerm(null); termForm.reset(); }}>
                <div className="p-6">
                    <h2 className="text-lg font-medium text-slate-800 dark:text-white mb-1">{editingTerm ? 'Edit' : 'Create'} Term</h2>
                    <p className="text-sm text-slate-600 dark:text-slate-500 mb-6 font-medium">{editingTerm ? `Updating ${editingTerm.name}` : 'Define a new subdivision for an academic session.'}</p>

                    <form onSubmit={handleTermSubmit} className="space-y-6">
                        <div>
                            <InputLabel htmlFor="academic_session_id" value="Academic Session" />
                            <select
                                id="academic_session_id"
                                value={termForm.data.academic_session_id}
                                className="block w-full bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-800 text-slate-900 dark:text-white rounded-xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/50 transition-all px-4 py-2.5"
                                onChange={(e) => termForm.setData('academic_session_id', e.target.value)}
                                required
                            >
                                <option value="">Select a session</option>
                                {sessions.map((session) => (
                                    <option key={session.id} value={session.id}>{session.name} {session.is_current ? '(Current Session)' : ''}</option>
                                ))}
                            </select>
                            <InputError message={termForm.errors.academic_session_id} />
                        </div>

                        <div>
                            <InputLabel htmlFor="term_name" value="Term Name" />
                            <TextInput
                                id="term_name"
                                type="text"
                                value={termForm.data.name}
                                className="block w-full"
                                onChange={(e) => termForm.setData('name', e.target.value)}
                                required
                                placeholder="e.g. First Term"
                            />
                            <InputError message={termForm.errors.name} />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <InputLabel htmlFor="term_start_date" value="Start Date" />
                                <TextInput
                                    id="term_start_date"
                                    type="date"
                                    value={termForm.data.start_date}
                                    className="block w-full"
                                    onChange={(e) => termForm.setData('start_date', e.target.value)}
                                />
                                <InputError message={termForm.errors.start_date} />
                            </div>

                            <div>
                                <InputLabel htmlFor="term_end_date" value="End Date" />
                                <TextInput
                                    id="term_end_date"
                                    type="date"
                                    value={termForm.data.end_date}
                                    className="block w-full"
                                    onChange={(e) => termForm.setData('end_date', e.target.value)}
                                />
                                <InputError message={termForm.errors.end_date} />
                            </div>
                        </div>

                        <div className="p-4 bg-slate-100 dark:bg-slate-900 rounded-xl border border-slate-300 dark:border-slate-800">
                            <label className="flex items-center cursor-pointer group">
                                <Checkbox
                                    checked={termForm.data.is_current}
                                    onChange={(e) => termForm.setData('is_current', e.target.checked)}
                                />
                                <span className="ms-3 text-sm font-medium text-slate-700 dark:text-slate-300 group-hover:text-slate-900 dark:group-hover:text-white transition-colors">
                                    Set as the active term for this session
                                </span>
                            </label>
                            <InputError message={termForm.errors.is_current} />
                        </div>

                        <div className="flex items-center justify-end gap-3 pt-6 border-t border-slate-300 dark:border-slate-800">
                            <SecondaryButton onClick={() => { setShowingTermModal(false); setEditingTerm(null); termForm.reset(); }}>Cancel</SecondaryButton>
                            <PrimaryButton className="gap-2" disabled={termForm.processing}>
                                {editingTerm ? <Save size={18} /> : <Plus size={18} />}
                                {editingTerm ? 'Update' : 'Create'} Term
                            </PrimaryButton>
                        </div>
                    </form>
                </div>
            </Modal>

            {/* Class Creation/Edit Modal */}
            <Modal show={showingClassModal} onClose={() => { setShowingClassModal(false); setEditingClass(null); classForm.reset(); }}>
                <div className="p-6">
                    <h2 className="text-lg font-medium text-slate-800 dark:text-white mb-1">{editingClass ? 'Edit' : 'Create'} Class</h2>
                    <p className="text-sm text-slate-600 dark:text-slate-500 mb-6 font-medium">{editingClass ? `Updating ${editingClass.name}` : 'Define a new academic level for student grouping.'}</p>

                    <form onSubmit={handleClassSubmit} className="space-y-6">
                        <div>
                            <InputLabel htmlFor="class_name" value="Class Name" />
                            <TextInput
                                id="class_name"
                                type="text"
                                value={classForm.data.name}
                                className="block w-full"
                                onChange={(e) => classForm.setData('name', e.target.value)}
                                required
                                placeholder="e.g. Primary 1 or JSS 1"
                            />
                            <InputError message={classForm.errors.name} />
                        </div>

                        <div>
                            <InputLabel htmlFor="class_level" value="Numeric Level (Optional)" />
                            <TextInput
                                id="class_level"
                                type="text"
                                value={classForm.data.level}
                                className="block w-full"
                                onChange={(e) => classForm.setData('level', e.target.value)}
                                placeholder="e.g. 1, 2, 3"
                            />
                            <InputError message={classForm.errors.level} />
                        </div>

                        <div className="pt-2">
                            <InputLabel value="Assign Class Arms" className="mb-2" />
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-h-48 overflow-y-auto p-1">
                                {availableArms?.map((arm) => {
                                    const isNoArm = arm.name === 'No arm';
                                    const hasNoArmSelected = classForm.data.arm_ids.some(id => {
                                        const selectedArm = availableArms.find(a => a.id === id);
                                        return selectedArm?.name === 'No arm';
                                    });
                                    const hasOtherArmsSelected = classForm.data.arm_ids.some(id => {
                                        const selectedArm = availableArms.find(a => a.id === id);
                                        return selectedArm?.name !== 'No arm';
                                    });

                                    const isDisabled = (isNoArm && hasOtherArmsSelected) || (!isNoArm && hasNoArmSelected);

                                    return (
                                        <label
                                            key={arm.id}
                                            className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${isDisabled ? 'opacity-40 cursor-not-allowed bg-slate-50 dark:bg-slate-900/40 border-slate-200 dark:border-slate-800' : 'cursor-pointer'} ${classForm.data.arm_ids.includes(arm.id)
                                                ? 'bg-indigo-500/10 border-indigo-500/50 text-indigo-400'
                                                : isDisabled ? '' : 'bg-slate-100 dark:bg-slate-900 border-slate-300 dark:border-slate-800 text-slate-700 dark:text-white hover:border-slate-400 dark:hover:border-slate-700'
                                                }`}
                                        >
                                            <div className="relative flex items-center h-5">
                                                <input
                                                    type="checkbox"
                                                    className="opacity-0 absolute h-4 w-4 cursor-pointer disabled:cursor-not-allowed"
                                                    checked={classForm.data.arm_ids.includes(arm.id)}
                                                    onChange={() => !isDisabled && toggleArm(arm.id)}
                                                    disabled={isDisabled}
                                                />
                                                <div className={`w-4 h-4 rounded border flex items-center justify-center transition-all ${classForm.data.arm_ids.includes(arm.id) ? 'bg-indigo-500 border-indigo-500' : isDisabled ? 'border-slate-400 bg-slate-100 dark:bg-slate-800' : 'border-slate-600'}`}>
                                                    {classForm.data.arm_ids.includes(arm.id) && <Plus size={12} className="text-white" />}
                                                </div>
                                            </div>
                                            <span className="text-xs font-bold uppercase select-none">{arm.name}</span>
                                        </label>
                                    );
                                })}
                            </div>
                            <InputError message={classForm.errors.arm_ids} />
                        </div>

                        <div className="flex items-center justify-end gap-3 pt-6 border-t border-slate-300 dark:border-slate-800">
                            <SecondaryButton onClick={() => { setShowingClassModal(false); setEditingClass(null); classForm.reset(); }}>Cancel</SecondaryButton>
                            <PrimaryButton className="gap-2" disabled={classForm.processing}>
                                {editingClass ? <Save size={18} /> : <Plus size={18} />}
                                {editingClass ? 'Update' : 'Create'} Class
                            </PrimaryButton>
                        </div>
                    </form>
                </div>
            </Modal>

            {/* Class Arm Creation/Edit Modal */}
            <Modal show={showingArmModal} onClose={() => { setShowingArmModal(false); setEditingArm(null); armForm.reset(); }}>
                <div className="p-6">
                    <h2 className="text-lg font-medium text-slate-800 dark:text-white mb-1">{editingArm ? 'Edit' : 'Create'} New Arm</h2>
                    <p className="text-sm text-slate-600 dark:text-slate-500 mb-6 font-medium">{editingArm ? `Updating ${editingArm.name}` : 'Add a new arm to the global registry (e.g. A, B, Gold).'}</p>

                    <form onSubmit={handleArmSubmit} className="space-y-6">
                        <div>
                            <InputLabel htmlFor="arm_name" value="Arm Name" />
                            <TextInput
                                id="arm_name"
                                type="text"
                                value={armForm.data.name}
                                className="block w-full"
                                onChange={(e) => armForm.setData('name', e.target.value)}
                                required
                                placeholder="e.g. Arm A, Gold, Science"
                            />
                            <InputError message={armForm.errors.name} />
                        </div>

                        <div className="flex items-center justify-end gap-3 pt-6 border-t border-slate-300 dark:border-slate-800">
                            <SecondaryButton onClick={() => { setShowingArmModal(false); setEditingArm(null); armForm.reset(); }}>Cancel</SecondaryButton>
                            <PrimaryButton className="gap-2" disabled={armForm.processing}>
                                {editingArm ? <Save size={18} /> : <Plus size={18} />}
                                {editingArm ? 'Update' : 'Create'} Arm
                            </PrimaryButton>
                        </div>
                    </form>
                </div>
            </Modal>

            {/* View Class Detail Modal */}
            <Modal show={showingViewClassModal} onClose={() => setShowingViewClassModal(false)} maxWidth="xl">
                <div className="p-6 space-y-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-indigo-600 shadow-lg shadow-indigo-600/20 flex items-center justify-center text-white">
                                <Landmark size={24} />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-slate-900 dark:text-white">{viewingClass?.name}</h3>
                                <p className="text-xs text-slate-500 uppercase tracking-widest font-bold">Lvl: {viewingClass?.level || 'N/A'}</p>
                            </div>
                        </div>
                        <button onClick={() => setShowingViewClassModal(false)} className="p-2 text-slate-500 hover:text-slate-900 dark:hover:text-white transition-all bg-slate-100 dark:bg-slate-800 rounded-full">
                            <XCircle size={22} />
                        </button>
                    </div>

                    <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
                        {(viewingClass?.sections || viewingClass?.arms)?.map((section) => (
                            <div key={section.id} className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
                                <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-200 dark:border-slate-800/60">
                                    <div className="flex items-center gap-3">
                                        {section.class_arm?.name !== 'No arm' && (
                                            <>
                                                <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-bold text-lg">
                                                    {section.class_arm?.name?.charAt(0) || section.name?.charAt(0) || 'A'}
                                                </div>
                                                <h5 className="font-bold text-slate-800 dark:text-white text-base">
                                                    {section.class_arm?.name || section.name} Section
                                                </h5>
                                            </>
                                        )}
                                    </div>
                                    <button
                                        onClick={() => openSubjectModal(section)}
                                        className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:text-white transition-all bg-indigo-50 dark:bg-indigo-500/10 hover:bg-indigo-600 dark:hover:bg-indigo-600 px-4 py-2 rounded-lg border border-indigo-200 dark:border-indigo-500/20"
                                    >
                                        Manage Subjects
                                    </button>
                                </div>

                                <div className="flex flex-col gap-4">
                                    <div className="space-y-2 px-4 py-3 rounded-xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800/60">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2 overflow-hidden">
                                                <UserCheck size={16} className="text-indigo-500 flex-shrink-0" />
                                                <span className="text-sm font-bold text-slate-700 dark:text-slate-300 truncate">{section.form_teacher?.name || 'Unassigned'}</span>
                                            </div>
                                            <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Form Teacher</span>
                                        </div>
                                        <select
                                            value={section.form_teacher_id || ''}
                                            onChange={(e) => handleAssignFormTeacher(section.id, e.target.value)}
                                            className="w-full bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-sm rounded-lg text-slate-900 dark:text-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/50 py-2 px-3"
                                        >
                                            <option value="" className="text-slate-900 bg-white">Assign New Teacher...</option>
                                            {teachers?.map(t => (
                                                <option key={t.id} value={t.id} className="text-slate-900 bg-white">
                                                    {t.name}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    <div className="flex flex-wrap gap-2">
                                        {section.section_subjects?.length > 0 ? (
                                            <>
                                                {section.section_subjects.slice(0, 6).map(item => (
                                                    <span key={item.id} className="px-2.5 py-1 rounded-md bg-slate-200 dark:bg-slate-800 text-xs font-medium text-slate-700 dark:text-slate-400 border border-slate-300 dark:border-slate-700">
                                                        {item.subject?.code}
                                                    </span>
                                                ))}
                                                {section.section_subjects.length > 6 && (
                                                    <span className="text-xs text-slate-500 dark:text-slate-600 font-bold px-2 flex items-center">+ {section.section_subjects.length - 6} more</span>
                                                )}
                                            </>
                                        ) : (
                                            <span className="text-sm text-slate-500 dark:text-slate-600 italic px-2">No subjects assigned yet</span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="flex justify-end pt-4 border-t border-slate-200 dark:border-slate-800">
                        <SecondaryButton onClick={() => setShowingViewClassModal(false)} className="!py-2 !px-6">Close</SecondaryButton>
                    </div>
                </div>
            </Modal>

            {/* Subject Management Modal */}
            <Modal show={showingSubjectModal} onClose={() => setShowingSubjectModal(false)} maxWidth="2xl">
                <div className="p-6 space-y-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-indigo-600 flex items-center justify-center text-white shadow-lg shadow-indigo-600/20">
                                <BookOpen size={24} />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-slate-900 dark:text-white">Manage Curriculum</h3>
                                <p className="text-xs text-slate-500 uppercase tracking-widest font-bold mt-1">
                                    {viewingClass?.name || 'Class'} {targetSection?.class_arm?.name !== 'No arm' && <>— <span className="text-indigo-600 dark:text-indigo-400">{targetSection?.class_arm?.name || targetSection?.name} Section</span></>}
                                </p>
                            </div>
                        </div>
                        <button onClick={() => setShowingSubjectModal(false)} className="p-2 text-slate-500 hover:text-slate-900 dark:hover:text-white transition-all bg-slate-100 dark:bg-slate-800 rounded-full">
                            <XCircle size={22} />
                        </button>
                    </div>

                    <form onSubmit={handleSubjectUpdate} className="space-y-6">
                        {subjectForm.data.subjects.length > 0 && (
                            <div className="p-4 rounded-xl bg-indigo-50 dark:bg-indigo-900/10 border border-indigo-100 dark:border-indigo-500/20 flex flex-col sm:flex-row items-center justify-between gap-4">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-indigo-100 dark:bg-indigo-500/20 rounded-lg text-indigo-600 dark:text-indigo-400">
                                        <Users2 size={18} />
                                    </div>
                                    <span className="text-xs font-bold text-indigo-700 dark:text-indigo-300 uppercase tracking-wider">Global Teacher Assignment</span>
                                </div>
                                <select
                                    className="w-full sm:w-auto bg-white dark:bg-slate-900 border-indigo-200 dark:border-indigo-500/30 text-sm font-medium text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 rounded-lg py-2 pl-3 pr-10"
                                    onChange={(e) => bulkAssignTeacher(e.target.value)}
                                    value=""
                                >
                                    <option value="">Assign All Subjects To...</option>
                                    {teachers?.map(t => (
                                        <option key={t.id} value={t.id}>{t.name}</option>
                                    ))}
                                </select>
                            </div>
                        )}

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[50vh] overflow-y-auto pr-2 custom-scrollbar p-1">
                            {allSubjects?.map((subject) => {
                                const selection = subjectForm.data.subjects.find(s => s.id === subject.id);
                                const isSelected = !!selection;

                                return (
                                    <div
                                        key={subject.id}
                                        className={`p-4 rounded-xl border transition-all flex flex-col gap-3 ${isSelected
                                            ? 'bg-indigo-50 dark:bg-indigo-500/5 border-indigo-200 dark:border-indigo-500/30 shadow-sm'
                                            : 'bg-white dark:bg-slate-900/50 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                                            }`}
                                    >
                                        <div
                                            onClick={() => toggleSubject(subject.id)}
                                            className="flex items-start gap-3 cursor-pointer group select-none"
                                        >
                                            <div className={`shrink-0 rounded-lg p-2 transition-all ${isSelected ? 'bg-indigo-500 text-white shadow-md shadow-indigo-500/20' : 'bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 group-hover:text-slate-600 dark:group-hover:text-slate-300'
                                                }`}>
                                                <BookOpen size={18} />
                                            </div>
                                            <div className="flex-1 min-w-0 pt-0.5">
                                                <div className="flex items-center justify-between gap-2">
                                                    <p className={`text-sm font-bold transition-colors truncate ${isSelected ? 'text-indigo-700 dark:text-indigo-300' : 'text-slate-700 dark:text-slate-300 group-hover:text-slate-900 dark:group-hover:text-white'
                                                        }`}>
                                                        {subject.name}
                                                    </p>
                                                    {isSelected && <CheckCircle2 size={16} className="text-indigo-500 fill-indigo-500/10" />}
                                                </div>
                                                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mt-0.5">
                                                    {subject.code} • {subject.type}
                                                </p>
                                            </div>
                                        </div>

                                        {isSelected && (
                                            <div className="pt-3 border-t border-indigo-100 dark:border-indigo-500/10">
                                                <select
                                                    value={selection.teacher_id || ''}
                                                    onChange={(e) => updateSubjectTeacher(subject.id, e.target.value)}
                                                    className="w-full bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-xs font-medium rounded-lg text-slate-700 dark:text-slate-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 py-2"
                                                >
                                                    <option value="">Select Teacher (Optional)</option>
                                                    {teachers?.map(t => (
                                                        <option key={t.id} value={t.id}>{t.name}</option>
                                                    ))}
                                                </select>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>

                        <div className="flex items-center justify-end gap-3 pt-6 border-t border-slate-200 dark:border-slate-800">
                            <SecondaryButton onClick={() => setShowingSubjectModal(false)} className="!py-2.5">Cancel</SecondaryButton>
                            <PrimaryButton type="submit" className="gap-2 !py-2.5 !px-6 text-sm" disabled={subjectForm.processing}>
                                <Save size={18} />
                                Save Changes
                            </PrimaryButton>
                        </div>
                    </form>
                </div>
            </Modal>

            {/* ===== Subject Assignment Tab Content ===== */}
            {activeTab === 'subject-assignment' && (
                <div className="space-y-6">
                    {/* Filters */}
                    <Card
                        title="Elective Subject Assignment"
                        description="Assign elective subjects to individual students per class arm and session."
                    >
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                            {/* Session Selector */}
                            <div>
                                <InputLabel value="Academic Session" className="mb-1 text-xs font-bold uppercase tracking-widest text-slate-500" />
                                <select
                                    value={assignSessionId}
                                    onChange={e => {
                                        setAssignSessionId(e.target.value);
                                        setAssignSectionId(''); // Reset section when session changes
                                        setAssignStudents([]);
                                        setAssignSelections({});
                                    }}
                                    className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-white text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 px-3 py-2.5"
                                >
                                    <option value="">Select Session...</option>
                                    {sessions.map(s => (
                                        <option key={s.id} value={s.id}>
                                            {s.name} {s.is_current || s.id === currentSession?.id ? '(Current)' : ''}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Class Section Selector */}
                            <div>
                                <InputLabel value="Class / Arm" className="mb-1 text-xs font-bold uppercase tracking-widest text-slate-500" />
                                <select
                                    value={assignSectionId}
                                    disabled={!assignSessionId}
                                    onChange={e => { setAssignSectionId(e.target.value); setAssignStudents([]); setAssignSelections({}); }}
                                    className={`w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-white text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 px-3 py-2.5 ${!assignSessionId ? 'opacity-50 cursor-not-allowed' : ''}`}
                                >
                                    <option value="">{assignSessionId ? 'Select Class Arm...' : 'Choose Session First...'}</option>
                                    {classSectionsForAssignment.map(sec => (
                                        <option key={sec.id} value={sec.id}>
                                            {sec.school_class?.name}{sec.class_arm?.name && sec.class_arm.name !== 'No arm' ? ` ${sec.class_arm.name}` : ''}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {/* Load Button & Global Actions */}
                        {(assignSectionId && assignSessionId) && (
                            <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
                                <div className="flex items-center gap-2">
                                    <PrimaryButton onClick={loadAssignmentData} className="gap-2" disabled={assignLoading}>
                                        {assignLoading ? <Loader2 size={16} className="animate-spin" /> : <Users2 size={16} />}
                                        {assignLoading ? 'Loading Students' : 'Refresh Students'}
                                    </PrimaryButton>

                                    {assignStudents.length > 0 && assignElectives.length > 0 && (
                                        <SecondaryButton
                                            onClick={selectAllForEveryone}
                                            className="gap-2 !py-2.5"
                                            title="Assign all elective subjects to every student listed below"
                                        >
                                            <CheckCircle2 size={16} className="text-emerald-500" />
                                            Assign All to Everyone
                                        </SecondaryButton>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* No electives notice */}
                        {!assignLoading && assignStudents.length > 0 && assignElectives.length === 0 && (
                            <div className="rounded-xl border border-amber-400/30 bg-amber-50 dark:bg-amber-900/10 px-5 py-4 text-sm text-amber-700 dark:text-amber-400 flex items-center gap-3">
                                <BookMarked size={18} />
                                <span>No <strong>elective</strong> subjects are allocated to this class section yet. Go to the <strong>Classes</strong> tab and manage subjects for this arm first, then mark them as <em>Elective</em> in Subject management.</span>
                            </div>
                        )}

                        {/* Students Grid */}
                        {!assignLoading && assignStudents.length > 0 && assignElectives.length > 0 && (
                            <div className="space-y-4">
                                <div className="overflow-x-auto">
                                    <table className="w-full text-sm border-collapse">
                                        <thead>
                                            <tr className="border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/40">
                                                <th className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-widest text-slate-500 w-56">Student</th>
                                                {assignElectives.map(subj => (
                                                    <th key={subj.id} className="px-3 py-3 text-center text-[10px] font-bold uppercase tracking-widest text-slate-500">
                                                        <div className="flex flex-col items-center gap-0.5">
                                                            <span>{subj.name}</span>
                                                            <span className="text-[8px] text-indigo-400 font-black">{subj.code}</span>
                                                        </div>
                                                    </th>
                                                ))}
                                                <th className="px-3 py-3 text-center text-[10px] font-bold uppercase tracking-widest text-slate-500">Quick</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                            {assignStudents.map(student => (
                                                <tr key={student.id} className="hover:bg-indigo-50/40 dark:hover:bg-slate-800/30 transition-colors">
                                                    {/* Student Name */}
                                                    <td className="px-4 py-3">
                                                        <div>
                                                            <p className="font-semibold text-slate-800 dark:text-white text-sm">{student.name}</p>
                                                            <p className="text-[10px] text-slate-400 font-mono">{student.registration_number}</p>
                                                        </div>
                                                    </td>
                                                    {/* Elective Checkboxes */}
                                                    {assignElectives.map(subj => {
                                                        const isChecked = (assignSelections[student.id] || new Set()).has(subj.id);
                                                        return (
                                                            <td key={subj.id} className="px-3 py-3 text-center">
                                                                <button
                                                                    type="button"
                                                                    onClick={() => toggleElectiveForStudent(student.id, subj.id)}
                                                                    className={`w-6 h-6 rounded-md border-2 flex items-center justify-center mx-auto transition-all ${isChecked
                                                                        ? 'bg-indigo-600 border-indigo-600 text-white shadow-md shadow-indigo-500/20'
                                                                        : 'border-slate-300 dark:border-slate-600 hover:border-indigo-400'
                                                                        }`}
                                                                >
                                                                    {isChecked && <CheckCircle2 size={14} />}
                                                                </button>
                                                            </td>
                                                        );
                                                    })}
                                                    {/* Quick Actions */}
                                                    <td className="px-3 py-3">
                                                        <div className="flex items-center justify-center gap-1">
                                                            <button
                                                                type="button"
                                                                onClick={() => selectAllElectivesForStudent(student.id)}
                                                                className="text-[10px] px-2 py-1 rounded bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 font-bold hover:bg-indigo-500/20 transition-colors"
                                                                title="Select all"
                                                            >All</button>
                                                            <button
                                                                type="button"
                                                                onClick={() => clearElectivesForStudent(student.id)}
                                                                className="text-[10px] px-2 py-1 rounded bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400 font-bold hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
                                                                title="Clear all"
                                                            >None</button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>

                                {/* Save Button */}
                                <div className="flex items-center justify-between pt-4 border-t border-slate-200 dark:border-slate-800">
                                    <p className="text-xs text-slate-500">
                                        {assignStudents.length} student{assignStudents.length !== 1 ? 's' : ''} &bull; {assignElectives.length} elective{assignElectives.length !== 1 ? 's' : ''}
                                    </p>
                                    <PrimaryButton onClick={handleSaveAssignments} className="gap-2" disabled={assignSaving}>
                                        {assignSaving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                                        {assignSaving ? 'Saving...' : 'Save Assignments'}
                                    </PrimaryButton>
                                </div>
                            </div>
                        )}

                        {/* Empty state */}
                        {!assignLoading && assignStudents.length === 0 && assignSectionId && assignSessionId && (
                            <div className="text-center py-16 text-slate-400">
                                <GraduationCap size={48} className="mx-auto mb-3 opacity-30" />
                                <p className="text-sm font-medium">No students found in this class arm.</p>
                                <p className="text-xs mt-1">Make sure students are enrolled in this class section.</p>
                            </div>
                        )}

                        {/* Initial prompt */}
                        {!assignSectionId || !assignSessionId ? (
                            <div className="text-center py-16 text-slate-400">
                                <BookMarked size={48} className="mx-auto mb-3 opacity-30" />
                                <p className="text-sm font-medium">Select a session and class arm to begin.</p>
                            </div>
                        ) : null}
                    </Card>
                </div>
            )}
        </AuthenticatedLayout>
    );
}
