import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { useRef, useState, useEffect } from 'react';
import { Head, Link, useForm, router } from '@inertiajs/react';
import Swal from 'sweetalert2';
import Card from '@/Components/Card';
import PrimaryButton from '@/Components/PrimaryButton';
import Pagination from '@/Components/Pagination';
import {
    FileSpreadsheet, Search, Filter, Plus, GraduationCap,
    Calculator, Pencil, Trash2, Calendar, Clock, BookOpen,
    User, Brain, Save, Info, Sliders, Layout, Award, PlusCircle, LayoutGrid,
    Printer, TrendingUp,
    CheckCircle2,
    AlertTriangle,
    Unlock,
    Lock,
    Key,
    Globe,
    XCircle
} from 'lucide-react';
import { toast } from 'react-toastify';
import TextInput from '@/Components/TextInput';
import InputLabel from '@/Components/InputLabel';
import InputError from '@/Components/InputError';
import Modal from '@/Components/Modal';
import SecondaryButton from '@/Components/SecondaryButton';
import PinManagement from './Tabs/PinManagement';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
    PieChart, Pie, Cell, LineChart, Line, AreaChart, Area
} from 'recharts';

// Reusing some component-like logic from the originals
export default function Index({
    auth, results = { data: [] }, reportCardStudents = { data: [] }, psychomotorStudents = [], categories = [],
    remarksStudents = [], broadsheetStudents = [], broadsheetSubjects = [], annualReportStudents = [], levels = [],
    caConfig = [], reportCardSettings = {}, grades = [], psychomotorCategories = [], promotionRules = [],
    sessions, classSections, subjects, active_tab, filters, currentSession, currentTerm, globalRule, pinHistory, analysisData
}) {


    const canManageOverview = auth.user.roles.includes('Super Admin') || auth.user.permissions.includes('manage result overview');
    const canManagePsychomotor = auth.user.roles.includes('Super Admin') || auth.user.permissions.includes('manage psychomotor');
    const canManageRemark = auth.user.roles.includes('Super Admin') || auth.user.permissions.includes('manage remark');
    const canManageSettings = auth.user.roles.includes('Super Admin') || auth.user.permissions.includes('manage result settings');

    const isTeacherOnly = auth.user.roles.includes('Teacher') && !auth.user.roles.includes('Super Admin') && !auth.user.roles.includes('Admin');
    const formTeacherClasses = isTeacherOnly ? classSections.filter(cs => cs.form_teacher_id === auth.user.id) : classSections;
    const tabs = [
        { id: 'overview', name: 'Subject Performance', icon: FileSpreadsheet, permission: 'view result overview' },
        { id: 'report-cards', name: 'Report Cards', icon: Layout, permission: 'view report card' },
        { id: 'psychomotor', name: 'Behavioral Traits', icon: Brain, permission: 'view psychomotor' },
        { id: 'remarks', name: 'Official Remarks', icon: Award, permission: 'view remark' },
        { id: 'broadsheet', name: 'Cumulative Broadsheet', icon: FileSpreadsheet, permission: 'view broadsheet' },
        { id: 'annual-reports', name: 'Annual Reports', icon: LayoutGrid, permission: 'view annual report' },
        { id: 'settings', name: 'Result Settings', icon: Sliders, permission: 'view result settings' },
        { id: 'analysis', name: 'Result Analysis', icon: TrendingUp, permission: 'view result analysis' },
        { id: 'pins', name: 'PIN Management', icon: Key, permission: 'manage result pins' },
    ].filter(tab => {
        // Base permission check
        const hasPermission = auth.user.roles.includes('Super Admin') || auth.user.permissions.includes(tab.permission);
        if (!hasPermission) return false;

        // Additional restriction for teachers regarding Form Teacher tabs
        if (isTeacherOnly && (tab.id === 'psychomotor' || tab.id === 'remarks')) {
            return formTeacherClasses.length > 0;
        }

        return true;
    });

    const [activeTab, setActiveTab] = useState((active_tab && tabs.some(t => t.id === active_tab)) ? active_tab : (tabs[0]?.id || ''));
    const [showingResultModal, setShowingResultModal] = useState(false);
    const [editingResult, setEditingResult] = useState(null);
    const [editingRule, setEditingRule] = useState(null);
    const [showingRuleModal, setShowingRuleModal] = useState(false);

    // Forms for each tab
    const [isSyncing, setIsSyncing] = useState(false);

    const overviewForm = useForm({
        academic_session_id: filters.academic_session_id || currentSession?.id || '',
        term_id: filters.term_id || currentTerm?.id || '',
        class_section_id: filters.class_section_id || '',
        subject_id: filters.subject_id || '',
    });

    const reportCardForm = useForm({
        academic_session_id: filters.academic_session_id || currentSession?.id || '',
        term_id: filters.term_id || currentTerm?.id || '',
        class_section_id: filters.class_section_id || '',
    });

    const psychomotorForm = useForm({
        academic_session_id: filters.academic_session_id || currentSession?.id || '',
        term_id: filters.term_id || currentTerm?.id || '',
        class_section_id: filters.class_section_id || '',
        ratings: [],
    });

    const remarksForm = useForm({
        academic_session_id: filters.academic_session_id || currentSession?.id || '',
        term_id: filters.term_id || currentTerm?.id || '',
        class_section_id: filters.class_section_id || '',
        remarks: []
    });

    const broadsheetForm = useForm({
        academic_session_id: filters.academic_session_id || currentSession?.id || '',
        class_section_id: filters.class_section_id || '',
    });

    const annualReportForm = useForm({
        academic_session_id: filters.academic_session_id || currentSession?.id || '',
        school_class_id: filters.school_class_id || '',
        ranking_basis: filters.ranking_basis || 'arm',
    });

    const analysisForm = useForm({
        academic_session_id: filters.academic_session_id || currentSession?.id || '',
        term_id: filters.term_id || currentTerm?.id || '',
        class_section_id: filters.class_section_id || '',
    });



    const isOverviewFiltered = !!(overviewForm.data.academic_session_id || overviewForm.data.term_id || overviewForm.data.class_section_id || overviewForm.data.subject_id);
    const isReportCardFiltered = !!(reportCardForm.data.academic_session_id || reportCardForm.data.term_id || reportCardForm.data.class_section_id);
    const isPsychomotorFiltered = !!(psychomotorForm.data.academic_session_id || psychomotorForm.data.term_id || psychomotorForm.data.class_section_id);
    const isRemarksFiltered = !!(remarksForm.data.academic_session_id || remarksForm.data.term_id || remarksForm.data.class_section_id);
    const isBroadsheetFiltered = !!(broadsheetForm.data.academic_session_id || broadsheetForm.data.class_section_id);
    const isAnnualReportFiltered = !!(annualReportForm.data.academic_session_id || annualReportForm.data.school_class_id);
    const isAnalysisFiltered = !!(analysisForm.data.academic_session_id || analysisForm.data.term_id || analysisForm.data.class_section_id);

    const isOverviewSearched = !!(filters.academic_session_id || filters.term_id || filters.class_section_id || filters.subject_id);
    const isReportCardSearched = !!(filters.academic_session_id || filters.term_id || filters.class_section_id);
    const isPsychomotorSearched = !!(filters.academic_session_id || filters.term_id || filters.class_section_id);
    const isBroadsheetSearched = !!(filters.academic_session_id || filters.class_section_id);
    const isAnnualReportSearched = !!(filters.academic_session_id || filters.school_class_id);

    // Settings Forms
    const caForm = useForm({ config: caConfig || [] });
    const settingsForm = useForm({ settings: reportCardSettings || {} });

    // Sync settings form when prop updates (e.g. after save)
    useEffect(() => {
        if (reportCardSettings) {
            settingsForm.setData('settings', reportCardSettings);
        }
    }, [reportCardSettings]);

    // Sync Form Teacher Name when Class Section changes in Remarks Tab
    useEffect(() => {
        if (activeTab === 'remarks' && remarksForm.data.class_section_id) {
            const section = classSections.find(s => s.id === remarksForm.data.class_section_id);
            if (section) {
                const teacherName = section.form_teacher
                    ? (section.form_teacher.name || `${section.form_teacher.surname} ${section.form_teacher.othername}`)
                    : '';

                // Only update if different to avoid infinite loops or unnecessary renders
                if (settingsForm.data.settings.form_teacher_name !== teacherName) {
                    settingsForm.setData('settings', {
                        ...settingsForm.data.settings,
                        form_teacher_name: teacherName
                    });
                }
            }
        }
    }, [remarksForm.data.class_section_id, classSections, activeTab]);
    const gradeForm = useForm({
        name: '', min_score: '', max_score: '', remarks: '', color: '#4f46e5'
    });
    const categoryForm = useForm({ name: '' });
    const skillForm = useForm({ category_id: '', name: '' });
    const promotionRuleForm = useForm({
        id: globalRule?.id || '',
        min_average: globalRule?.min_average || 45,
        max_failed_subjects: globalRule?.max_failed_subjects || 3,
        core_subject_ids: globalRule?.core_subject_ids || [],
        is_rule1_termly: globalRule?.is_rule1_termly ?? true,
        is_rule1_annual: globalRule?.is_rule1_annual ?? true,
        is_rule2_termly: globalRule?.is_rule2_termly ?? false,
        is_rule2_annual: globalRule?.is_rule2_annual ?? false,
        is_rule3_termly: globalRule?.is_rule3_termly ?? false,
        is_rule3_annual: globalRule?.is_rule3_annual ?? false,
        is_rule4_termly: globalRule?.is_rule4_termly ?? false,
        is_rule4_annual: globalRule?.is_rule4_annual ?? false,
        pass_other_subjects_count: globalRule?.pass_other_subjects_count || 5,
        trial_min_average: globalRule?.trial_min_average || '',
    });

    const resultEditForm = useForm({
        assessments: [],
        exam_score: 0,
    });

    // Handlers
    const handleTabFilter = (tabId, form) => {
        router.get(route('results.management'), {
            tab: tabId,
            ...form.data
        }, { preserveState: true });
    };

    const openEditResult = (result) => {
        // Check if result is locked
        // Check if result is locked for the SPECIFIC session
        const isLocked = result.student.promotion_decisions?.some(d =>
            d.is_locked && d.academic_session_id === result.academic_session_id
        );

        if (isLocked) {
            Swal.fire({
                title: 'Result Locked',
                text: 'This result belongs to a finalized/locked academic session. You cannot edit it.',
                icon: 'warning',
                confirmButtonColor: '#f43f5e',
                confirmButtonText: 'Okay'
            });
            return;
        }

        setEditingResult(result);

        // Align assessments with current caConfig
        const currentAssessments = Array.isArray(result.assessments) ? result.assessments : [];
        const alignedAssessments = (caConfig || []).map(config => {
            const configName = config.name.trim().toLowerCase();
            const existing = currentAssessments.find(a => a.name && a.name.trim().toLowerCase() === configName);
            return {
                name: config.name,
                score: existing ? existing.score : 0,
                max_score: config.max_score
            };
        });

        resultEditForm.setData({
            assessments: alignedAssessments,
            exam_score: result.exam_score || 0,
        });
        setShowingResultModal(true);
    };

    const updateEditAssessment = (index, value) => {
        if (parseFloat(value) < 0) return;
        const newAssessments = [...resultEditForm.data.assessments];
        newAssessments[index].score = parseFloat(value) || 0;
        resultEditForm.setData('assessments', newAssessments);
    };

    const handleResultUpdate = (e) => {
        e.preventDefault();
        resultEditForm.put(route('results.update', editingResult.id), {
            onSuccess: () => {
                setShowingResultModal(false);
                setEditingResult(null);
            },
        });
    };

    const calculateEditTotal = () => {
        const caTotal = resultEditForm.data.assessments.reduce((sum, a) => sum + (parseFloat(a.score) || 0), 0);
        return caTotal + (parseFloat(resultEditForm.data.exam_score) || 0);
    };

    const handleRuleUpdate = (e) => {
        e.preventDefault();
        promotionRuleForm.post(route('promotions.update-rule'), {
            onSuccess: () => {
                setShowingRuleModal(false);
                setEditingRule(null);
                toast.success('Promotion policy updated and applied successfully.');
            },
        });
    };

    // Psychomotor Effects
    useEffect(() => {
        if (activeTab === 'psychomotor') {
            if (psychomotorStudents && psychomotorStudents.length > 0) {
                const initialRatings = [];
                psychomotorStudents.forEach(student => {
                    categories.forEach(cat => {
                        cat.skills.forEach(skill => {
                            const existingRating = student.psychomotor_ratings?.find(r => r.skill_id === skill.id);
                            initialRatings.push({
                                student_id: student.id,
                                skill_id: skill.id,
                                rating: existingRating ? existingRating.rating : 3,
                                student_name: `${student.surname} ${student.othername}`,
                                skill_name: skill.name
                            });
                        });
                    });
                });
                psychomotorForm.setData('ratings', initialRatings);
            } else {
                psychomotorForm.setData('ratings', []);
            }
        }
    }, [psychomotorStudents, categories, activeTab]);

    const updateRating = (studentId, skillId, value) => {
        const index = psychomotorForm.data.ratings.findIndex(r => r.student_id === studentId && r.skill_id === skillId);
        if (index !== -1) {
            const newRatings = [...psychomotorForm.data.ratings];
            newRatings[index] = { ...newRatings[index], rating: value };
            psychomotorForm.setData('ratings', newRatings);
        }
    };

    // Remarks Effects
    useEffect(() => {
        if (activeTab === 'remarks') {
            // Basic equality check to prevent infinite loops if dependencies are new references but same content
            // We check if we already have data for the current students
            const currentStudentIds = remarksForm.data.remarks.map(r => r.student_id).sort().join(',');
            const newStudentIds = remarksStudents.map(s => s.id).sort().join(',');

            if (currentStudentIds !== newStudentIds) {
                if (remarksStudents && remarksStudents.length > 0) {
                    const initialRemarks = remarksStudents.map(student => {
                        const existing = student.terminal_remarks && student.terminal_remarks[0];
                        return {
                            student_id: student.id,
                            student_name: `${student.surname} ${student.othername}`,
                            form_teacher_remark: existing ? existing.form_teacher_remark : '',
                            principal_remark: existing ? existing.principal_remark : '',
                            promotion_status: existing ? existing.promotion_status : ''
                        };
                    });
                    // Only update if actually different to prevent "Maximum update depth"
                    remarksForm.setData('remarks', initialRemarks);
                } else {
                    remarksForm.setData('remarks', []);
                }
            }
        }
    }, [remarksStudents, activeTab]);

    const updateStudentRemark = (studentId, field, value) => {
        const index = remarksForm.data.remarks.findIndex(r => r.student_id === studentId);
        if (index !== -1) {
            const newRemarks = [...remarksForm.data.remarks];
            newRemarks[index] = { ...newRemarks[index], [field]: value };
            remarksForm.setData('remarks', newRemarks);
        }
    };

    // Auto-populate Form Teacher Name when class is selected in Remarks tab
    useEffect(() => {
        if (activeTab === 'remarks' && remarksForm.data.class_section_id) {
            const selectedClass = classSections.find(cs => cs.id == remarksForm.data.class_section_id);
            if (selectedClass && selectedClass.form_teacher) {
                const teacherName = `${selectedClass.form_teacher.surname || ''} ${selectedClass.form_teacher.othername || ''} ${selectedClass.form_teacher.firstname || ''}`.trim();
                // Only update if different to avoid infinite loops or overwriting manual edits immediately (though this overrides on class switch)
                if (settingsForm.data.settings.form_teacher_name !== teacherName) {
                    settingsForm.setData('settings', {
                        ...settingsForm.data.settings,
                        form_teacher_name: teacherName
                    });
                }
            }
        }
    }, [remarksForm.data.class_section_id, activeTab, classSections]);

    // Removal of Form Reset on Tab Change to allow filter persistence
    // as requested by user.

    // Synchronize filters props across all forms when they update
    useEffect(() => {
        if (filters.academic_session_id) {
            overviewForm.setData('academic_session_id', filters.academic_session_id);
            reportCardForm.setData('academic_session_id', filters.academic_session_id);
            psychomotorForm.setData('academic_session_id', filters.academic_session_id);
            remarksForm.setData('academic_session_id', filters.academic_session_id);
            broadsheetForm.setData('academic_session_id', filters.academic_session_id);
            annualReportForm.setData('academic_session_id', filters.academic_session_id);
            analysisForm.setData('academic_session_id', filters.academic_session_id);
        }
        if (filters.term_id) {
            overviewForm.setData('term_id', filters.term_id);
            reportCardForm.setData('term_id', filters.term_id);
            psychomotorForm.setData('term_id', filters.term_id);
            remarksForm.setData('term_id', filters.term_id);
            analysisForm.setData('term_id', filters.term_id);
        }
        if (filters.class_section_id) {
            overviewForm.setData('class_section_id', filters.class_section_id);
            reportCardForm.setData('class_section_id', filters.class_section_id);
            psychomotorForm.setData('class_section_id', filters.class_section_id);
            remarksForm.setData('class_section_id', filters.class_section_id);
            broadsheetForm.setData('class_section_id', filters.class_section_id);
            analysisForm.setData('class_section_id', filters.class_section_id);
        }
        if (filters.school_class_id) {
            annualReportForm.setData('school_class_id', filters.school_class_id);
        }
        if (filters.ranking_basis) {
            annualReportForm.setData('ranking_basis', filters.ranking_basis);
        }
        if (filters.subject_id) {
            overviewForm.setData('subject_id', filters.subject_id);
        }
    }, [filters]);

    // Update activeTab when prop changes (e.g. on navigation back)
    useEffect(() => {
        if (active_tab && activeTab !== active_tab) {
            setActiveTab(active_tab);
        }
    }, [active_tab]);

    const bulkUpdatePromotionStatus = (status) => {
        const newRemarks = remarksForm.data.remarks.map(r => ({
            ...r,
            promotion_status: status
        }));
        remarksForm.setData('remarks', newRemarks);
        toast.info(`All students marked as ${status}`);
    };

    const getAIRemarkText = (average) => {
        const teacherPool = {
            outstanding: [
                "An exceptional student with an inquiring mind. Your work consistently exceeds expectations.",
                "Outstanding performance! Your dedication to academic excellence is truly commendable.",
                "A brilliant term! Your grasp of complex concepts is well above grade level.",
                "Exemplary performance across all subjects. You are a role model for your peers.",
                "Magnificent academic display! You have shown that hard work and focus lead to great results."
            ],
            strong: [
                "Strong academic results! Your hard work is clearly reflected in your grades.",
                "Very good performance. You consistently demonstrate a high level of competence.",
                "A very successful term. Continue to maintain this high standard of academic rigor.",
                "Diligence and focus have led to these impressive results. Keep pushing boundaries.",
                "Your commitment to excellence is evident. A very solid performance indeed."
            ],
            good: [
                "Good academic standing. With more consistent study habits, you can reach even higher heights.",
                "A satisfactory performance. You have shown steady progress throughout the term.",
                "Steady work this term. Focus on refining your analytical skills in core subjects.",
                "Good progress. More active participation in class discussions will be beneficial.",
                "A reliable performance. Consistent effort will yield even better results."
            ],
            fair: [
                "A fair performance, but there is significant room for improvement in your core subjects.",
                "You have potential that is yet to be fully realized. Consistent study is required.",
                "An average result. You need to be more committed to your academic responsibilities.",
                "Basic understanding demonstrated. More intensive review of course work is needed.",
                "Results are modest. Increased focus on your weak areas is highly recommended."
            ],
            weak: [
                "Performance is below the required standard. Urgent improvement is needed in most areas.",
                "A disappointing result. Closer supervision and a revised study plan are essential.",
                "Struggling to meet academic expectations. More focus and less distractions are required.",
                "Critical improvement needed. Please seek additional help in your weak subjects.",
                "Immediate academic intervention is necessary to improve these grades."
            ]
        };

        const principalPool = {
            outstanding: [
                "A truly distinguished result. The school is proud of your academic achievements.",
                "Excellent work. You have proven yourself to be a top-tier student. Congratulations.",
                "Brilliant! Your academic records are a testament to your hard work and discipline.",
                "Top-notch performance. Maintain this pinnacle of excellence.",
                "A scholarly performance! You are an asset to this institution."
            ],
            strong: [
                "A very commendable performance. You are on the right path to success.",
                "Impressive results. Your commitment to your studies is highly valued.",
                "Well done! You have maintained a very good academic standard this term.",
                "Satisfactory progress at a high level. Keep up the good work.",
                "Consistent and disciplined. These are the marks of a successful student."
            ],
            good: [
                "A solid performance. Consistency will be key to your future success.",
                "Good results overall. I encourage you to target even higher benchmarks next term.",
                "You are making good progress. Stay focused and disciplined.",
                "A decent term. Continue to work hard to unlock your full potential.",
                "Academic progress is stable. Aim for higher targets in the coming term."
            ],
            fair: [
                "A modest result. You must double your efforts to achieve better standing next term.",
                "Results are acceptable but could be much better with more focus.",
                "I expect more dedication to your studies in the coming academic period.",
                "An average performance. Work harder to move above the class median.",
                "The board expects more rigor in your academic approach. Sit up!"
            ],
            weak: [
                "Unsatisfactory result. You are capable of better than this. Take your studies seriously.",
                "Weak performance. This academic standing requires immediate and drastic improvement.",
                "Please sit up. This level of performance is not acceptable for your grade.",
                "Academic probation recommended if no significant improvement is seen next term.",
                "Serious concerns about your academic standing. Immediate improvement is mandated."
            ]
        };

        let tier = "weak";
        if (average >= 75) tier = "outstanding";
        else if (average >= 65) tier = "strong";
        else if (average >= 50) tier = "good";
        else if (average >= 40) tier = "fair";

        const randomIdx = (pool) => Math.floor(Math.random() * pool.length);

        return {
            teacher: teacherPool[tier][randomIdx(teacherPool[tier])],
            principal: principalPool[tier][randomIdx(principalPool[tier])]
        };
    };

    const generateAIRemark = (studentId, average) => {
        const { teacher, principal } = getAIRemarkText(average);
        updateStudentRemark(studentId, 'form_teacher_remark', teacher);
        updateStudentRemark(studentId, 'principal_remark', principal);
    };

    const generateAllRemarks = () => {
        const newRemarks = remarksForm.data.remarks.map(remark => {
            const studentData = remarksStudents.find(s => s.id === remark.student_id);
            const { teacher, principal } = getAIRemarkText(studentData?.average_score || 0);
            return {
                ...remark,
                form_teacher_remark: teacher,
                principal_remark: principal
            };
        });
        remarksForm.setData('remarks', newRemarks);
        toast.info("AI Logic: Unique remarks generated for all students.");
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex flex-col gap-1">
                        <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Result Management</h2>
                        <p className="text-slate-600 dark:text-white text-sm">Centralized control for scores, report cards, and behavioral evaluations.</p>
                    </div>
                    {currentSession && (
                        <div className="flex items-center gap-2 bg-indigo-500/10 border border-indigo-500/20 px-3 py-1.5 rounded-xl">
                            <Calendar size={14} className="text-indigo-400" />
                            <div className="flex flex-col">
                                <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest leading-none">Active Session</span>
                                <span className="text-xs font-bold text-slate-800 dark:text-white">{currentSession.name} {currentTerm ? `• ${currentTerm.name}` : ''}</span>
                            </div>
                        </div>
                    )}
                </div>
            }
        >
            <Head title="Result Management" />

            <div className="space-y-6">
                {/* Tabs Navigation */}
                <div className="flex flex-wrap gap-2 p-1 bg-slate-100 dark:bg-slate-900/50 border border-slate-300 dark:border-slate-800 rounded-2xl w-fit">
                    {tabs.map((tab) => {
                        const Icon = tab.icon;

                        if (tab.href) {
                            return (
                                <Link
                                    key={tab.id}
                                    href={tab.href}
                                    className={`px-4 py-2 rounded-xl text-sm font-medium transition-all flex items-center gap-2 text-slate-600 dark:text-white hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-800`}
                                >
                                    <Icon size={16} />
                                    {tab.name}
                                </Link>
                            );
                        }

                        return (
                            <button
                                key={tab.id}
                                onClick={() => {
                                    setActiveTab(tab.id);
                                    // Update URL to preserve tab state on navigation back
                                    router.get(route('results.management'), {
                                        tab: tab.id,
                                        // Filters cleared on tab switch
                                    }, { preserveState: false, replace: true, preserveScroll: true });
                                }}
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
                    {/* 1. Overview Tab */}
                    {activeTab === 'overview' && (
                        <div className="space-y-6">
                            <Card>
                                <form onSubmit={e => { e.preventDefault(); handleTabFilter('overview', overviewForm); }} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 items-end">
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-1.5"><Calendar size={10} /> Session</label>
                                        <select
                                            value={overviewForm.data.academic_session_id}
                                            onChange={e => overviewForm.setData('academic_session_id', e.target.value)}
                                            className="w-full bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-800 text-slate-900 dark:text-white text-sm rounded-xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/50"
                                        >
                                            <option value="">Select Session</option>
                                            {sessions.map(s => <option key={s.id} value={s.id}>{s.name} {s.is_current ? '(Active)' : ''}</option>)}
                                        </select>
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-1.5"><Clock size={10} /> Term</label>
                                        <select
                                            value={overviewForm.data.term_id}
                                            onChange={e => overviewForm.setData('term_id', e.target.value)}
                                            className="w-full bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-800 text-slate-900 dark:text-white text-sm rounded-xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/50"
                                            disabled={!overviewForm.data.academic_session_id}
                                        >
                                            <option value="">{overviewForm.data.academic_session_id ? 'All Terms' : 'Select Session First'}</option>
                                            {overviewForm.data.academic_session_id && sessions.find(s => s.id == overviewForm.data.academic_session_id)?.terms?.map(t => (
                                                <option key={t.id} value={t.id}>{t.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-1.5"><GraduationCap size={10} /> Class</label>
                                        <select value={overviewForm.data.class_section_id} onChange={e => overviewForm.setData('class_section_id', e.target.value)} className="w-full bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-800 text-slate-900 dark:text-white text-sm rounded-xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/50">
                                            <option value="">All Classes</option>
                                            {classSections.map(cs => (
                                                <option key={cs.id} value={cs.id}>
                                                    {cs.school_class?.name}
                                                    {cs.class_arm?.name !== 'No arm' ? ` - ${cs.class_arm?.name}` : ''}
                                                    {cs.form_teacher_id === auth.user.id ? ' (Form Teacher)' : ''}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-1.5"><BookOpen size={10} /> Subject</label>
                                        <select value={overviewForm.data.subject_id} onChange={e => overviewForm.setData('subject_id', e.target.value)} className="w-full bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-800 text-slate-900 dark:text-white text-sm rounded-xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/50">
                                            <option value="">All Subjects</option>
                                            {(overviewForm.data.class_section_id
                                                ? (classSections.find(cs => cs.id == overviewForm.data.class_section_id)?.subjects?.length > 0
                                                    ? classSections.find(cs => cs.id == overviewForm.data.class_section_id).subjects
                                                    : subjects)
                                                : subjects
                                            ).map(s => (
                                                <option key={s.id} value={s.id}>{s.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="flex gap-2">
                                        <button
                                            type="submit"
                                            disabled={!overviewForm.data.academic_session_id || !overviewForm.data.term_id || !overviewForm.data.class_section_id || !overviewForm.data.subject_id}
                                            className="flex-1 h-[42px] bg-indigo-600 text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-indigo-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            <Filter size={16} /> Filter
                                        </button>
                                    </div>
                                </form>
                            </Card>

                            <Card
                                title="Academic Records"
                                description={results?.data?.length > 0
                                    ? `Showing ${results.data.length} records.`
                                    : (isOverviewSearched ? "No Records Found" : "Apply filters to view academic performance data.")
                                }
                                actions={
                                    canManageOverview && (
                                        <Link href={route('results.compilation')}>
                                            <button className="px-4 py-2 bg-indigo-600 text-indigo-200 rounded-xl font-bold text-xs flex items-center gap-2 hover:bg-indigo-600 hover:text-white transition-all">
                                                <Calculator size={14} /> Compile New Result
                                            </button>
                                        </Link>
                                    )
                                }
                            >
                                {results?.data?.length > 0 ? (
                                    <>
                                        <div className="overflow-x-auto -mx-6">
                                            <table className="w-full text-left border-collapse">
                                                <thead>
                                                    <tr className="border-b border-slate-200 dark:border-slate-800/50">
                                                        <th className="px-6 py-4 text-[10px] font-bold text-slate-700 dark:text-white uppercase tracking-widest">Student</th>
                                                        <th className="px-6 py-4 text-[10px] font-bold text-slate-700 dark:text-white uppercase tracking-widest">Subject</th>
                                                        <th className="px-6 py-4 text-[10px] font-bold text-slate-700 dark:text-white uppercase tracking-widest text-center">Breakdown</th>
                                                        <th className="px-6 py-4 text-[10px] font-bold text-slate-700 dark:text-white uppercase tracking-widest text-center">Total</th>
                                                        <th className="px-6 py-4 text-[10px] font-bold text-slate-700 dark:text-white uppercase tracking-widest text-center">Actions</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-slate-200 dark:divide-slate-800/30">
                                                    {results.data.map((result) => (
                                                        <tr key={result.id} className="group hover:bg-slate-50 dark:hover:bg-slate-800/20 transition-colors">
                                                            <td className="px-6 py-4">
                                                                <div className="flex items-center gap-3">
                                                                    <div className="w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
                                                                        <span className="font-bold text-xs">{result.student.surname[0]}</span>
                                                                    </div>
                                                                    <div>
                                                                        <p className="text-sm font-bold text-slate-800 dark:text-white">{result.student.surname} {result.student.othername}</p>
                                                                        <p className="text-[10px] font-mono text-slate-600 dark:text-slate-300">{result.student.registration_number}</p>
                                                                    </div>
                                                                </div>
                                                            </td>
                                                            <td className="px-6 py-4">
                                                                <div className="flex flex-col">
                                                                    <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{result.subject.name}</span>
                                                                    <span className="text-[10px] text-slate-500">
                                                                        {result.class_section.school_class.name}
                                                                        {result.class_section.class_arm?.name !== 'No arm' ? ` ${result.class_section.class_arm?.name}` : ''}
                                                                    </span>
                                                                </div>
                                                            </td>
                                                            <td className="px-6 py-4 text-center">
                                                                <div className="inline-flex items-center gap-2 p-3 bg-slate-100 dark:bg-slate-900 rounded-lg border border-slate-300 dark:border-slate-800 text-[12px]">
                                                                    <span className="text-slate-700 dark:text-white px-2 border-r border-slate-300 dark:border-slate-800">Exam: <span className="text-slate-900 dark:text-white">{result.exam_score}</span></span>
                                                                    {result.assessments && result.assessments.length > 0 ? (
                                                                        result.assessments.map((ass, idx) => (
                                                                            <span key={idx} className={`text-slate-700 dark:text-white px-2 ${idx < result.assessments.length - 1 ? 'border-r border-slate-300 dark:border-slate-800' : ''}`}>
                                                                                {ass.name}: <span className="text-slate-900 dark:text-white">{ass.score}</span>
                                                                            </span>
                                                                        ))
                                                                    ) : (
                                                                        <span className="text-slate-700 dark:text-white px-2">CA: <span className="text-slate-900 dark:text-white">{Number(result.total_score - result.exam_score).toFixed(1)}</span></span>
                                                                    )}
                                                                </div>
                                                            </td>
                                                            <td className="px-6 py-4 text-center">
                                                                <div className="flex flex-col items-center">
                                                                    <span className={`text-sm font-black px-2 py-0.5 rounded border ${result.grade === 'F' ? 'bg-rose-500/10 text-rose-400 border-rose-500/20' : 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20'}`}>
                                                                        {result.total_score}
                                                                    </span>
                                                                    <span className="text-[10px] font-bold text-slate-500 uppercase">{result.grade}</span>
                                                                </div>
                                                            </td>
                                                            <td className="px-6 py-4 text-center">
                                                                <div className="flex items-center justify-center gap-2">
                                                                    {canManageOverview && (
                                                                        <>
                                                                            <button
                                                                                onClick={() => openEditResult(result)}
                                                                                className="p-2 text-indigo-600 hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-slate-800 rounded-lg transition-all"
                                                                                title="Update Result"
                                                                            >
                                                                                <Pencil size={14} />
                                                                            </button>
                                                                            <button
                                                                                onClick={() => {
                                                                                    const isLocked = result.student.promotion_decisions?.some(d =>
                                                                                        d.is_locked && d.academic_session_id === result.academic_session_id
                                                                                    );

                                                                                    if (isLocked) {
                                                                                        Swal.fire({
                                                                                            title: 'Access Denied',
                                                                                            text: 'This result is part of a locked academic session and cannot be deleted.',
                                                                                            icon: 'error',
                                                                                            confirmButtonColor: '#f43f5e'
                                                                                        });
                                                                                        return;
                                                                                    }

                                                                                    Swal.fire({
                                                                                        title: 'Are you sure?',
                                                                                        text: "You won't be able to revert this score deletion!",
                                                                                        icon: 'warning',
                                                                                        showCancelButton: true,
                                                                                        confirmButtonColor: '#4f46e5',
                                                                                        cancelButtonColor: '#ef4444',
                                                                                        confirmButtonText: 'Yes, delete it!',
                                                                                        background: '#0f172a',
                                                                                        color: '#f8fafc',
                                                                                        borderRadius: '1.5rem',
                                                                                    }).then((confirmRes) => {
                                                                                        if (confirmRes.isConfirmed) {
                                                                                            router.delete(route('results.destroy', result.id), {
                                                                                                onSuccess: () => {
                                                                                                    // Success handled globally
                                                                                                }
                                                                                            });
                                                                                        }
                                                                                    });
                                                                                }}
                                                                                className="p-2 text-slate-500 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition-all"
                                                                            >
                                                                                <Trash2 size={14} />
                                                                            </button>
                                                                        </>
                                                                    )}
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                        <div className="mt-4">
                                            <Pagination links={results.links} />
                                        </div>
                                    </>
                                ) : (
                                    <div className="py-24 text-center">
                                        <div className="w-16 h-16 bg-slate-200 dark:bg-slate-900 rounded-3xl border border-slate-300 dark:border-slate-800 flex items-center justify-center text-white dark:text-slate-600 mx-auto mb-4">
                                            <FileSpreadsheet size={32} />
                                        </div>
                                        <h3 className="text-slate-800 dark:text-slate-300 font-bold mb-1 text-lg">
                                            {isOverviewSearched ? 'No Records Found' : 'Search Instructions'}
                                        </h3>
                                        <p className="text-slate-500 text-sm italic max-w-xs mx-auto">
                                            {isOverviewSearched
                                                ? "We couldn't find any results matching your current filters. Try adjusting your selection or search criteria."
                                                : "Select a session, term, class, and subject from the fields above, then click 'Filter' to view and manage academic performance data."
                                            }
                                        </p>
                                    </div>
                                )}
                            </Card>
                        </div>
                    )}

                    {/* 2. Report Cards Tab */}
                    {activeTab === 'report-cards' && (
                        <div className="space-y-6">
                            <Card>
                                <form onSubmit={e => { e.preventDefault(); handleTabFilter('report-cards', reportCardForm); }} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-1.5"><Calendar size={10} /> Session</label>
                                        <select
                                            value={reportCardForm.data.academic_session_id}
                                            onChange={e => reportCardForm.setData('academic_session_id', e.target.value)}
                                            className="w-full bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-800 text-slate-900 dark:text-white text-sm rounded-xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/50"
                                        >
                                            <option value="">Select Session</option>
                                            {sessions.map(s => <option key={s.id} value={s.id}>{s.name} {s.is_current ? '(Active)' : ''}</option>)}
                                        </select>
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest"><Clock size={10} /> Term</label>
                                        <select
                                            value={reportCardForm.data.term_id}
                                            onChange={e => reportCardForm.setData('term_id', e.target.value)}
                                            className="w-full bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-800 text-slate-900 dark:text-white text-sm rounded-xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/50 p-2.5"
                                            disabled={!reportCardForm.data.academic_session_id}
                                        >
                                            <option value="">{reportCardForm.data.academic_session_id ? 'Select Term' : 'Select Session First'}</option>
                                            {reportCardForm.data.academic_session_id && sessions.find(s => s.id == reportCardForm.data.academic_session_id)?.terms?.map(t => (
                                                <option key={t.id} value={t.id}>{t.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest"><GraduationCap size={10} /> Class</label>
                                        <select value={reportCardForm.data.class_section_id} onChange={e => reportCardForm.setData('class_section_id', e.target.value)} className="w-full bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-800 text-slate-900 dark:text-white text-sm rounded-xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/50 p-2.5">
                                            <option value="">Select Class</option>
                                            {classSections.map(cs => (
                                                <option key={cs.id} value={cs.id}>
                                                    {cs.school_class?.name}
                                                    {cs.class_arm?.name !== 'No arm' ? ` - ${cs.class_arm?.name}` : ''}
                                                </option>
                                            ))}
                                        </select>

                                    </div>
                                    <div className='space-y-1'>
                                        <button type="submit" className="w-full sm:flex-1 h-[42px] bg-indigo-600 text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-indigo-500 transition-all">
                                            <Filter size={16} /> Fetch Students
                                        </button>
                                    </div>

                                    {reportCardForm.data.academic_session_id && reportCardForm.data.term_id && reportCardForm.data.class_section_id && (

                                        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                                            <a
                                                href={route('results.broadsheet', {
                                                    academic_session_id: reportCardForm.data.academic_session_id,
                                                    term_id: reportCardForm.data.term_id,
                                                    class_section_id: reportCardForm.data.class_section_id
                                                })}
                                                target="_blank"
                                                className="w-full sm:h-[42px] py-2.5 sm:py-0 px-4 bg-white dark:bg-slate-800 text-blue-600 border border-blue-200 hover:bg-blue-50 dark:hover:bg-slate-700 rounded-xl flex items-center justify-center gap-2 font-bold text-sm transition-all shadow-sm"
                                                title="View Score Summary Broadsheet"
                                            >
                                                <Printer size={16} /> Broadsheet
                                            </a>
                                            <a
                                                href={route('results.bulk-report-card', {
                                                    academic_session_id: reportCardForm.data.academic_session_id,
                                                    term_id: reportCardForm.data.term_id,
                                                    class_section_id: reportCardForm.data.class_section_id
                                                })}
                                                target="_blank"
                                                className="w-full sm:h-[42px] py-2.5 sm:py-0 px-4 bg-indigo-500 text-white hover:bg-indigo-600 rounded-xl flex items-center justify-center gap-2 font-bold text-sm transition-all shadow-lg shadow-indigo-500/20"
                                                title="Print all report cards for this class"
                                            >
                                                <Layout size={16} /> Bulk Print
                                            </a>
                                        </div>

                                    )}

                                </form>
                            </Card>

                            <Card title="Student Registry" description={reportCardStudents?.data && reportCardStudents.data.length > 0
                                ? `Found ${reportCardStudents.total} students.`
                                : (isReportCardSearched ? "No Records Found" : "Select filters to view student registry.")
                            }>
                                {reportCardStudents?.data?.length > 0 ? (
                                    <>
                                        <div className="overflow-x-auto -mx-6">
                                            <table className="w-full text-left border-collapse">
                                                <thead>
                                                    <tr className="border-b border-slate-800/50">
                                                        <th className="px-6 py-4 text-[10px] font-bold text-slate-700 dark:text-white uppercase tracking-widest">Student</th>
                                                        <th className="px-6 py-4 text-[10px] font-bold text-slate-700 dark:text-white uppercase tracking-widest text-center">Registration</th>
                                                        <th className="px-6 py-4 text-[10px] font-bold text-slate-700 dark:text-white uppercase tracking-widest text-center">Action</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-slate-200 dark:divide-slate-800/30">
                                                    {reportCardStudents.data.map((student) => (
                                                        <tr key={student.id} className="group hover:bg-slate-50 dark:hover:bg-slate-800/20 transition-colors">
                                                            <td className="px-6 py-4">
                                                                <div className="flex items-center gap-3">
                                                                    <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-center text-white dark:text-slate-500">
                                                                        <User size={14} />
                                                                    </div>
                                                                    <div>
                                                                        <p className="text-sm font-bold text-slate-800 dark:text-white">{student.surname} {student.othername}</p>
                                                                        <p className="text-[10px] text-slate-500 capitalize">{student.gender}</p>
                                                                    </div>
                                                                </div>
                                                            </td>
                                                            <td className="px-6 py-4 text-center">
                                                                <span className="font-mono text-xs text-slate-600 dark:text-white bg-slate-100 dark:bg-slate-950 px-2 py-1 rounded border border-slate-200 dark:border-slate-800">
                                                                    {student.registration_number}
                                                                </span>
                                                            </td>
                                                            <td className="px-6 py-4 text-center">
                                                                <div className="flex items-center justify-center gap-2">
                                                                    <a
                                                                        href={route('results.report-card', {
                                                                            student: student.id,
                                                                            academic_session_id: reportCardForm.data.academic_session_id,
                                                                            term_id: reportCardForm.data.term_id
                                                                        })}
                                                                        className="px-3 py-1.5 bg-indigo-600/10 text-indigo-400 rounded-lg text-[10px] font-bold flex items-center gap-2 hover:bg-indigo-600 hover:text-white transition-all shadow-sm"
                                                                    >
                                                                        <Layout size={12} /> View / Print Report Card
                                                                    </a>
                                                                    {/* Print button removed as View Card leads to the same page which has a print button */}
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                        <div className="mt-4">
                                            <Pagination links={reportCardStudents.links} />
                                        </div>
                                    </>
                                ) : (
                                    <div className="py-20 text-center">
                                        <div className="w-16 h-16 bg-slate-200 dark:bg-slate-900 rounded-3xl border border-slate-300 dark:border-slate-800 flex items-center justify-center text-white dark:text-slate-600 mx-auto mb-4">
                                            <Layout size={32} />
                                        </div>
                                        <h3 className="text-slate-800 dark:text-slate-300 font-bold mb-1 text-lg">
                                            {isReportCardSearched ? 'No Records Found' : 'Search Instructions'}
                                        </h3>
                                        <p className="text-slate-500 text-sm max-w-xs mx-auto">
                                            {isReportCardSearched
                                                ? "We couldn't find any students matching your criteria for the selected class section."
                                                : "Select an active session, term, and class above, then click 'Fetch Students' to generate comprehensive report cards."
                                            }
                                        </p>
                                    </div>
                                )}
                            </Card>
                        </div>
                    )}

                    {/* 3. Psychomotor Tab */}
                    {activeTab === 'psychomotor' && (
                        <div className="space-y-6">
                            <Card title="Context Selection" description="Select class and term to evaluate.">
                                <form onSubmit={e => { e.preventDefault(); handleTabFilter('psychomotor', psychomotorForm); }} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Session</label>
                                        <select value={psychomotorForm.data.academic_session_id} onChange={e => psychomotorForm.setData('academic_session_id', e.target.value)} className="w-full bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-800 text-slate-900 dark:text-white text-xs rounded-xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/50">
                                            <option value="">Select Session</option>
                                            {sessions.map(s => <option key={s.id} value={s.id}>{s.name} {s.is_current ? '(Current)' : ''}</option>)}
                                        </select>
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Term</label>
                                        <select
                                            value={psychomotorForm.data.term_id}
                                            onChange={e => psychomotorForm.setData('term_id', e.target.value)}
                                            className="w-full bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-800 text-slate-900 dark:text-white text-xs rounded-xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/50"
                                            disabled={!psychomotorForm.data.academic_session_id}
                                        >
                                            <option value="">{psychomotorForm.data.academic_session_id ? 'Select Term' : 'Select Session First'}</option>
                                            {psychomotorForm.data.academic_session_id && sessions.find(s => s.id == psychomotorForm.data.academic_session_id)?.terms?.map(t => (
                                                <option key={t.id} value={t.id}>{t.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Class</label>
                                        <select value={psychomotorForm.data.class_section_id} onChange={e => psychomotorForm.setData('class_section_id', e.target.value)} className="w-full bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-800 text-slate-900 dark:text-white text-xs rounded-xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/50">
                                            <option value="">Select Section</option>
                                            {formTeacherClasses.map(cs => (
                                                <option key={cs.id} value={cs.id}>
                                                    {cs.school_class?.name}
                                                    {cs.class_arm?.name !== 'No arm' ? ` - ${cs.class_arm?.name}` : ''}
                                                    {cs.form_teacher_id === auth.user.id ? ' (Form Teacher)' : ''}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    <button type="submit" className="h-[42px] bg-indigo-600 text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-indigo-500">
                                        <Search size={16} /> Load Students
                                    </button>
                                </form>
                            </Card>

                            {isPsychomotorSearched ? (
                                <Card
                                    title="Competency Matrix"
                                    description={psychomotorStudents?.length > 0
                                        ? `Rating ${psychomotorStudents.length} students across domains.`
                                        : "No and existing records found."
                                    }
                                    actions={psychomotorStudents?.length > 0 && canManagePsychomotor && (
                                        <button onClick={() => psychomotorForm.post(route('results.psychomotor.store'), { onSuccess: () => { } })} disabled={psychomotorForm.processing} className="px-4 py-2 bg-indigo-600 text-white rounded-xl font-bold text-xs flex items-center gap-2 hover:bg-indigo-500 transition-all">
                                            <Save size={14} /> Synchronize All
                                        </button>
                                    )}
                                >
                                    {psychomotorStudents?.length > 0 ? (
                                        <div className="overflow-x-auto -mx-6">
                                            <table className="w-full text-left border-collapse min-w-[1000px]">
                                                <thead>
                                                    <tr className="border-b border-slate-300 dark:border-slate-800/50">
                                                        <th className="px-6 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest sticky left-0 bg-white dark:bg-slate-900">Student</th>
                                                        {categories.map(cat => (
                                                            cat.skills.map(skill => (
                                                                <th key={skill.id} className="px-4 py-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest text-center whitespace-nowrap">
                                                                    {skill.name} <br />
                                                                    <span className="text-[8px] text-slate-600 font-normal">{cat.name}</span>
                                                                </th>
                                                            ))
                                                        ))}
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-slate-200 dark:divide-slate-800/30">
                                                    {psychomotorStudents.map((student) => (
                                                        <tr key={student.id} className="group hover:bg-slate-50 dark:hover:bg-slate-800/20 transition-colors">
                                                            <td className="px-6 py-4 sticky left-0 bg-white dark:bg-slate-900 group-hover:bg-slate-50 dark:group-hover:bg-slate-800 transition-colors border-r border-slate-200 dark:border-slate-800">
                                                                <div className="flex items-center gap-3">
                                                                    <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-center text-white dark:text-slate-500">
                                                                        <User size={12} />
                                                                    </div>
                                                                    <div>
                                                                        <p className="text-xs font-bold text-slate-800 dark:text-white">{student.surname} {student.othername}</p>
                                                                        <p className="text-[9px] font-mono text-slate-500">{student.registration_number}</p>
                                                                    </div>
                                                                </div>
                                                            </td>
                                                            {categories.map(cat => (
                                                                cat.skills.map(skill => {
                                                                    const ratingObj = psychomotorForm.data.ratings.find(r => r.student_id === student.id && r.skill_id === skill.id);
                                                                    return (
                                                                        <td key={skill.id} className="px-4 py-4 text-center">
                                                                            <div className="flex items-center justify-center gap-0.5">
                                                                                {[1, 2, 3, 4, 5].map(val => (
                                                                                    <button
                                                                                        key={val}
                                                                                        type="button"
                                                                                        onClick={() => updateRating(student.id, skill.id, val)}
                                                                                        disabled={!canManagePsychomotor}
                                                                                        className={`w-6 h-6 rounded-md flex items-center justify-center text-[10px] font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed ${ratingObj?.rating >= val
                                                                                            ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20'
                                                                                            : 'bg-slate-100 dark:bg-slate-950 text-white dark:text-slate-600 hover:bg-slate-200 dark:hover:bg-slate-800'
                                                                                            }`}
                                                                                    >
                                                                                        {val}
                                                                                    </button>
                                                                                ))}
                                                                            </div>
                                                                        </td>
                                                                    );
                                                                })
                                                            ))}
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    ) : (
                                        <div className="py-20 text-center">
                                            <div className="w-16 h-16 bg-slate-900 rounded-3xl border border-slate-800 flex items-center justify-center text-slate-600 mx-auto mb-4">
                                                <Brain size={32} />
                                            </div>
                                            <h3 className="text-slate-300 font-bold mb-1 text-lg">No Records Found</h3>
                                            <p className="text-slate-500 text-sm max-w-sm mx-auto italic">
                                                We couldn't find any students for the selected criteria. Please ensure the students are active in the selected class section.
                                            </p>
                                        </div>
                                    )}
                                </Card>
                            ) : (
                                <div className="py-24 text-center border-2 border-dashed border-slate-300 dark:border-slate-800/50 rounded-[2.5rem] bg-slate-50 dark:bg-slate-900/10">
                                    <div className="w-16 h-16 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 flex items-center justify-center text-white dark:text-slate-600 mx-auto mb-5 shadow-xl shadow-black/5 dark:shadow-black/20">
                                        <Brain size={32} />
                                    </div>
                                    <h3 className="text-slate-800 dark:text-white font-bold text-xl mb-2">
                                        {isPsychomotorSearched ? 'No Records Found' : 'Search Instructions'}
                                    </h3>
                                    <p className="text-slate-500 text-sm max-w-md mx-auto leading-relaxed italic">
                                        {isPsychomotorSearched
                                            ? "The selected class section appears to have no active students registered for this academic period."
                                            : "To evaluate student behavior, select an academic session, term, and class above, then click 'Load Students' to populate the matrix."
                                        }
                                    </p>
                                </div>
                            )}
                        </div>
                    )}

                    {/* 4. Official Remarks Tab */}
                    {activeTab === 'remarks' && (
                        <div className="space-y-6">
                            <Card title="Terminal Remarks Matrix" description="Enter student comments and manage signatures for the term.">
                                <form onSubmit={e => { e.preventDefault(); handleTabFilter('remarks', remarksForm); }} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end mb-8 border-b border-slate-800/50 pb-8">
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-1.5"><Calendar size={10} /> Session</label>
                                        <select
                                            value={remarksForm.data.academic_session_id}
                                            onChange={e => remarksForm.setData('academic_session_id', e.target.value)}
                                            className="w-full bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-800 text-slate-900 dark:text-white text-sm rounded-xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/50"
                                        >
                                            <option value="">Select Session</option>
                                            {sessions.map(s => <option key={s.id} value={s.id}>{s.name} {s.is_current ? '(Active)' : ''}</option>)}
                                        </select>
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-1.5"><Clock size={10} /> Term</label>
                                        <select
                                            value={remarksForm.data.term_id}
                                            onChange={e => remarksForm.setData('term_id', e.target.value)}
                                            className="w-full bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-800 text-slate-900 dark:text-white text-xs rounded-xl focus:border-indigo-500 transition-all focus:ring-2 focus:ring-indigo-500/50"
                                            disabled={!remarksForm.data.academic_session_id}
                                        >
                                            <option value="">{remarksForm.data.academic_session_id ? 'Select Term' : 'Select Session First'}</option>
                                            {remarksForm.data.academic_session_id && sessions.find(s => s.id == remarksForm.data.academic_session_id)?.terms?.map(t => (
                                                <option key={t.id} value={t.id}>{t.name} {t.is_current ? '(Current)' : ''}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-1.5"><GraduationCap size={10} /> Class</label>
                                        <select value={remarksForm.data.class_section_id} onChange={e => remarksForm.setData('class_section_id', e.target.value)} className="w-full bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-800 text-slate-900 dark:text-white text-xs rounded-xl focus:border-indigo-500 transition-all focus:ring-2 focus:ring-indigo-500/50">
                                            <option value="">Select Class</option>
                                            {formTeacherClasses.map(cs => (
                                                <option key={cs.id} value={cs.id}>
                                                    {cs.school_class?.name}
                                                    {cs.class_arm?.name !== 'No arm' ? ` - ${cs.class_arm?.name}` : ''}
                                                    {cs.form_teacher_id === auth.user.id ? ' (Form Teacher)' : ''}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    <PrimaryButton
                                        type="button"
                                        onClick={() => {
                                            router.get(route('results.management'), {
                                                tab: 'remarks',
                                                academic_session_id: remarksForm.data.academic_session_id,
                                                term_id: remarksForm.data.term_id,
                                                class_section_id: remarksForm.data.class_section_id
                                            }, {
                                                preserveState: true,
                                                preserveScroll: true,
                                                onSuccess: () => toast.success('Registry loaded')
                                            });
                                        }}
                                        disabled={remarksForm.processing || !remarksForm.data.class_section_id}
                                        className="justify-center h-[42px] gap-2"
                                    >
                                        <Search size={16} /> Load Students
                                    </PrimaryButton>
                                </form>

                                {remarksForm.data.remarks.length > 0 ? (
                                    <>
                                        {/* Global Signature Inputs */}
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8 bg-indigo-500/5 p-6 rounded-3xl border border-indigo-500/10">
                                            <div className="space-y-1">
                                                <label className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.2em] mb-2 block">Form Teacher Name</label>
                                                <input
                                                    type="text"
                                                    value={settingsForm.data.settings.form_teacher_name || ''}
                                                    onChange={e => settingsForm.setData('settings', { ...settingsForm.data.settings, form_teacher_name: e.target.value })}
                                                    placeholder="e.g. Mr. John Doe"
                                                    className="w-full bg-white dark:bg-slate-950 border-slate-300 dark:border-slate-800 text-sm rounded-xl px-4 py-2.5 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500/50"
                                                />
                                            </div>
                                            <div className="space-y-1">
                                                <label className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.2em] mb-2 block">Principal Name</label>
                                                <input
                                                    type="text"
                                                    value={settingsForm.data.settings.principal_name || ''}
                                                    onChange={e => settingsForm.setData('settings', { ...settingsForm.data.settings, principal_name: e.target.value })}
                                                    placeholder="e.g. Dr. Hussein J."
                                                    className="w-full bg-white dark:bg-slate-950 border-slate-300 dark:border-slate-800 text-sm rounded-xl px-4 py-2.5 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500/50"
                                                />
                                            </div>
                                            <div className="md:col-span-2 flex justify-end">
                                                {canManageRemark && (
                                                    <button
                                                        onClick={() => settingsForm.post(route('settings.results.report-update'), {
                                                            preserveScroll: true,
                                                            preserveState: true,
                                                            onSuccess: () => toast.success('Signatures updated')
                                                        })}
                                                        className="text-[10px] font-bold text-indigo-400 hover:text-white transition-colors flex items-center gap-1.5"
                                                    >
                                                        <Save size={12} /> Sync Signatures to Settings
                                                    </button>
                                                )}
                                            </div>
                                        </div>

                                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                                            <div className="space-y-1">
                                                <h4 className="text-sm font-bold text-white">Remarks Registry</h4>
                                                <p className="text-[10px] text-slate-500 font-medium">Manage individual student remarks below or use the AI tools.</p>
                                            </div>
                                            {canManageRemark && (
                                                <button
                                                    type="button"
                                                    onClick={generateAllRemarks}
                                                    className="px-6 py-2.5 bg-indigo-600 text-white rounded-2xl text-[11px] font-black uppercase hover:bg-indigo-700 transition-all flex items-center gap-2 shadow-lg shadow-indigo-600/20 group"
                                                >
                                                    <Brain size={14} className="group-hover:animate-pulse" />
                                                    Genius Bulk Class Automation
                                                </button>
                                            )}
                                        </div>

                                        <div className="overflow-x-auto -mx-6 bg-slate-900/10 rounded-[2rem] border border-slate-800/20">
                                            <table className="w-full text-left border-collapse">
                                                <thead>
                                                    <tr className="border-b border-slate-200 dark:border-slate-800/50 bg-slate-50 dark:bg-slate-800/10">
                                                        <th className="px-6 py-5 text-[9px] font-black text-slate-500 uppercase tracking-[0.2em] w-[18%]">Student</th>

                                                        <th className="px-4 py-5 text-[9px] font-black text-slate-500 uppercase tracking-[0.2em] w-[30%]">Teacher's Comment</th>
                                                        <th className="px-4 py-5 text-[9px] font-black text-slate-500 uppercase tracking-[0.2em] w-[30%]">Principal's Remark</th>
                                                        <th className="px-4 py-5 text-[9px] font-black text-slate-500 uppercase tracking-[0.2em] text-center w-[7%]">AI</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-slate-800/30">
                                                    {remarksForm.data.remarks.map((remark) => {
                                                        const studentData = remarksStudents.find(s => s.id === remark.student_id);
                                                        return (
                                                            <tr key={remark.student_id} className="group hover:bg-slate-50 dark:hover:bg-white/[0.02] transition-colors">
                                                                <td className="px-6 py-4 vertical-top">
                                                                    <div className="space-y-1.5">
                                                                        <p className="text-[11px] font-black text-slate-900 dark:text-slate-100 uppercase truncate" title={remark.student_name}>{remark.student_name}</p>
                                                                        <div className="flex flex-col gap-1">
                                                                            <span className={`text-[10px] px-2 py-0.5 rounded-md font-black tracking-tighter w-fit flex items-center gap-1 ${studentData?.average_score >= 50 ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'}`}>
                                                                                {studentData?.average_score}%
                                                                            </span>
                                                                            <span className="text-[10px] px-2 py-0.5 bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-200 rounded-md font-black border border-slate-300 dark:border-slate-700/50 w-fit">
                                                                                P:{studentData?.position}/{studentData?.total_in_class}
                                                                            </span>
                                                                        </div>
                                                                    </div>
                                                                </td>

                                                                <td className="px-4 py-4">
                                                                    <textarea
                                                                        value={remark.form_teacher_remark}
                                                                        onChange={e => updateStudentRemark(remark.student_id, 'form_teacher_remark', e.target.value)}
                                                                        className="w-full bg-white dark:bg-slate-950/30 border-slate-300 dark:border-slate-800 text-[12px] rounded-xl focus:border-indigo-500 h-20 resize-none p-3 text-slate-900 dark:text-slate-300 leading-relaxed shadow-inner placeholder:text-white dark:placeholder:text-slate-700 transition-all border-dashed focus:border-solid hover:border-slate-400 dark:hover:border-slate-700 disabled:opacity-50"
                                                                        placeholder="Teacher's evaluation..."
                                                                        disabled={!canManageRemark}
                                                                    />
                                                                </td>
                                                                <td className="px-4 py-4">
                                                                    <textarea
                                                                        value={remark.principal_remark}
                                                                        onChange={e => updateStudentRemark(remark.student_id, 'principal_remark', e.target.value)}
                                                                        className="w-full bg-white dark:bg-slate-950/30 border-slate-300 dark:border-slate-800 text-[12px] rounded-xl focus:border-indigo-500 h-20 resize-none p-3 text-slate-900 dark:text-slate-300 leading-relaxed shadow-inner placeholder:text-white dark:placeholder:text-slate-700 transition-all border-dashed focus:border-solid hover:border-slate-400 dark:hover:border-slate-700 disabled:opacity-50"
                                                                        placeholder="Principal's summary..."
                                                                        disabled={!canManageRemark}
                                                                    />
                                                                </td>
                                                                <td className="px-4 py-4 text-center">
                                                                    {canManageRemark && (
                                                                        <button
                                                                            type="button"
                                                                            onClick={() => generateAIRemark(remark.student_id, studentData?.average_score)}
                                                                            className="w-10 h-10 bg-indigo-600/5 text-indigo-400 rounded-xl hover:bg-indigo-600 hover:text-white transition-all flex items-center justify-center mx-auto border border-indigo-500/10 group/ai active:scale-95"
                                                                            title="AI"
                                                                        >
                                                                            <Brain size={16} className="group-hover/ai:animate-pulse" />
                                                                        </button>
                                                                    )}
                                                                </td>
                                                            </tr>
                                                        );
                                                    })}
                                                </tbody>
                                            </table>
                                        </div>
                                        <div className="mt-8 flex justify-end">
                                            {canManageRemark && (
                                                <PrimaryButton
                                                    onClick={e => {
                                                        e.preventDefault();
                                                        remarksForm.post(route('results.terminal-remarks.store'), {
                                                            preserveScroll: true,
                                                            preserveState: true,
                                                            onSuccess: () => toast.success('Remarks synchronized successfully')
                                                        });
                                                    }}
                                                    disabled={remarksForm.processing}
                                                    className="px-8 gap-2 shadow-xl shadow-indigo-600/20"
                                                >
                                                    <Save size={18} /> Synchronize All Remarks
                                                </PrimaryButton>
                                            )}
                                        </div>
                                    </>
                                ) : (
                                    <div className="flex flex-col items-center justify-center py-24 text-center space-y-4 bg-slate-900/10 border border-dashed border-slate-800/50 rounded-[3rem]">
                                        <div className="p-4 bg-slate-800/50 rounded-2xl text-slate-600">
                                            <Award size={32} />
                                        </div>
                                        <div className="space-y-1">
                                            <p className="text-slate-800 dark:text-slate-300 font-bold">No Students Loaded</p>
                                            <p className="text-slate-500 text-sm max-w-xs font-medium">Select a class section and academic term to load the official remarks registry.</p>
                                        </div>
                                    </div>
                                )}
                            </Card>
                        </div>
                    )}
                    {activeTab === 'broadsheet' && (
                        <div className="space-y-6">
                            <Card title="Session Cumulative Broadsheet" description="View annual performance averages (Term 1-3) for all subjects.">
                                <form onSubmit={e => { e.preventDefault(); handleTabFilter('broadsheet', broadsheetForm); }} className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end mb-8 border-b border-slate-800/50 pb-8">
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-1.5"><Calendar size={10} /> Session</label>
                                        <select
                                            value={broadsheetForm.data.academic_session_id}
                                            onChange={e => broadsheetForm.setData('academic_session_id', e.target.value)}
                                            className="w-full bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-800 text-slate-900 dark:text-white text-sm rounded-xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/50"
                                        >
                                            <option value="">Select Session</option>
                                            {sessions.map(s => <option key={s.id} value={s.id}>{s.name} {s.is_current ? '(Active)' : ''}</option>)}
                                        </select>
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-1.5"><GraduationCap size={10} /> Class</label>
                                        <select value={broadsheetForm.data.class_section_id} onChange={e => broadsheetForm.setData('class_section_id', e.target.value)} className="w-full bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-800 text-slate-900 dark:text-white text-xs rounded-xl focus:border-indigo-500 transition-all focus:ring-2 focus:ring-indigo-500/50">
                                            <option value="">Select Class</option>
                                            {classSections.map(cs => (
                                                <option key={cs.id} value={cs.id}>
                                                    {cs.school_class?.name}
                                                    {cs.class_arm?.name !== 'No arm' ? ` - ${cs.class_arm?.name}` : ''}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    <div className="flex gap-2">
                                        <PrimaryButton
                                            type="submit"
                                            disabled={broadsheetForm.processing || !broadsheetForm.data.class_section_id}
                                            className="justify-center h-[42px] gap-2"
                                        >
                                            <Search size={16} /> Load Broadsheet
                                        </PrimaryButton>

                                        {broadsheetForm.data.class_section_id && (
                                            <SecondaryButton
                                                type="button"
                                                disabled={isSyncing}
                                                onClick={() => {
                                                    Swal.fire({
                                                        title: 'Synchronize Data?',
                                                        text: "This will recompute annual averages for all students in this class. Any manual overrides will be preserved.",
                                                        icon: 'question',
                                                        showCancelButton: true,
                                                        confirmButtonText: 'Yes, synchronize',
                                                        cancelButtonText: 'Cancel',
                                                        confirmButtonColor: '#4f46e5'
                                                    }).then((result) => {
                                                        if (result.isConfirmed) {
                                                            setIsSyncing(true);
                                                            router.post(route('promotions.compute-annual'), {
                                                                class_section_id: broadsheetForm.data.class_section_id
                                                            }, {
                                                                preserveScroll: true,
                                                                onSuccess: () => {
                                                                    toast.success('Cumulative data synchronized successfully');
                                                                    setIsSyncing(false);
                                                                    handleTabFilter('broadsheet', broadsheetForm);
                                                                },
                                                                onError: () => {
                                                                    toast.error('Failed to synchronize data');
                                                                    setIsSyncing(false);
                                                                }
                                                            });
                                                        }
                                                    });
                                                }}
                                                className="justify-center h-[42px] gap-2 border-slate-700/50 hover:bg-slate-800/30"
                                            >
                                                <Calculator size={16} className={isSyncing ? 'animate-spin' : ''} />
                                                {isSyncing ? 'Syncing...' : 'Sync All'}
                                            </SecondaryButton>
                                        )}
                                    </div>
                                </form>

                                {broadsheetStudents.length > 0 ? (
                                    <div className="overflow-x-auto -mx-6 bg-slate-900/10 rounded-[2rem] border border-slate-800/20">
                                        <table className="w-full text-left border-collapse">
                                            <thead>
                                                <tr className="border-b border-slate-200 dark:border-slate-800/50 bg-slate-100 dark:bg-slate-800/10">
                                                    <th className="px-6 py-5 text-[9px] font-black text-slate-500 uppercase tracking-[0.2em] sticky left-0 bg-white/90 dark:bg-slate-900/90 backdrop-blur z-20 min-w-[200px]">Student Name</th>
                                                    {(broadsheetSubjects.length > 0 ? broadsheetSubjects : subjects).map(subject => (
                                                        <th key={subject.id} className="px-4 py-5 text-[9px] font-black text-slate-500 uppercase tracking-[0.2em] text-center border-l border-slate-800/30 min-w-[120px]">
                                                            {subject.name}
                                                        </th>
                                                    ))}
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-slate-800/30">
                                                {broadsheetStudents.map(student => (
                                                    <tr key={student.id} className="group hover:bg-slate-50 dark:hover:bg-white/[0.02] transition-colors">
                                                        <td className="px-6 py-4 sticky left-0 bg-white/80 dark:bg-slate-950/80 backdrop-blur z-10 group-hover:bg-slate-50 dark:group-hover:bg-slate-900 transition-colors border-r border-slate-200 dark:border-slate-800/30">
                                                            <p className="text-[10px] font-black text-slate-800 dark:text-slate-100 uppercase truncate" title={`${student.surname} ${student.othername}`}>
                                                                {student.surname} {student.othername}
                                                            </p>
                                                            <p className="text-[8px] font-mono text-slate-500 tracking-tighter">{student.registration_number}</p>
                                                        </td>
                                                        {(broadsheetSubjects.length > 0 ? broadsheetSubjects : subjects).map(subject => {
                                                            const annualRes = student.annual_results?.find(ar => ar.subject_id === subject.id);
                                                            return (
                                                                <td key={subject.id} className="px-4 py-4 text-center border-l border-slate-200 dark:border-slate-800/30">
                                                                    <div className="flex flex-col gap-1 items-center">
                                                                        <div className="flex gap-1.5 mb-1">
                                                                            <div className="flex flex-col items-center">
                                                                                <span className="text-[8px] text-slate-600 uppercase font-black">1st</span>
                                                                                <span className="text-[9px] text-slate-500 font-bold">{annualRes?.term1_score ? Math.round(annualRes.term1_score) : '-'}</span>
                                                                            </div>
                                                                            <div className="flex flex-col items-center">
                                                                                <span className="text-[8px] text-slate-600 uppercase font-black">2nd</span>
                                                                                <span className="text-[9px] text-slate-500 font-bold">{annualRes?.term2_score ? Math.round(annualRes.term2_score) : '-'}</span>
                                                                            </div>
                                                                            <div className="flex flex-col items-center">
                                                                                <span className="text-[8px] text-slate-600 uppercase font-black">3rd</span>
                                                                                <span className="text-[9px] text-slate-500 font-bold">{annualRes?.term3_score ? Math.round(annualRes.term3_score) : '-'}</span>
                                                                            </div>
                                                                        </div>
                                                                        <div className="h-px w-8 bg-slate-200 dark:bg-slate-800/50 mb-1" />
                                                                        <span className={`text-[10px] font-black ${annualRes?.annual_score >= 50 ? 'text-emerald-400' : 'text-white'}`}>
                                                                            {annualRes ? `${Number(annualRes.annual_score).toFixed(1)}%` : 'N/A'}
                                                                        </span>
                                                                        {annualRes?.grade && (
                                                                            <span className="text-[7px] font-black text-indigo-400 bg-indigo-500/10 px-1 rounded-sm tracking-tighter uppercase">
                                                                                {annualRes.grade}
                                                                            </span>
                                                                        )}
                                                                    </div>
                                                                </td>
                                                            );
                                                        })}
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center justify-center py-24 text-center space-y-4 bg-slate-900/10 border border-dashed border-slate-800/50 rounded-[3rem]">
                                        <div className="p-4 bg-slate-800/50 rounded-2xl text-slate-600">
                                            <FileSpreadsheet size={32} />
                                        </div>
                                        <div className="space-y-1">
                                            <p className="text-slate-800 dark:text-slate-300 font-bold">{isBroadsheetSearched ? 'No Records Found' : 'Cumulative Broadsheet Ready'}</p>
                                            <p className="text-slate-500 text-sm max-w-xs font-medium">
                                                {isBroadsheetSearched
                                                    ? 'No annual results found for this class. Try clicking "Sync All" above to generate cumulative data.'
                                                    : 'Select a class section and click "Load Broadsheet" to view the annual performance matrix.'
                                                }
                                            </p>
                                        </div>
                                    </div>
                                )}
                            </Card>
                        </div>
                    )}
                    {activeTab === 'annual-reports' && (
                        <div className="space-y-6">
                            <Card title="Annual Report Management" description="Generate and print session-wide annual report cards with custom ranking.">
                                <form onSubmit={e => { e.preventDefault(); handleTabFilter('annual-reports', annualReportForm); }} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end mb-8 border-b border-slate-800/50 pb-8">
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-1.5"><Calendar size={10} /> Session</label>
                                        <select
                                            value={annualReportForm.data.academic_session_id}
                                            onChange={e => annualReportForm.setData('academic_session_id', e.target.value)}
                                            className="w-full bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-800 text-slate-900 dark:text-white text-sm rounded-xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/50"
                                        >
                                            <option value="">Select Session</option>
                                            {sessions.map(s => <option key={s.id} value={s.id}>{s.name} {s.is_current ? '(Active)' : ''}</option>)}
                                        </select>
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-1.5"><GraduationCap size={10} /> Class Level</label>
                                        <select value={annualReportForm.data.school_class_id} onChange={e => annualReportForm.setData('school_class_id', e.target.value)} className="w-full bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-800 text-slate-900 dark:text-white text-sm rounded-xl focus:border-indigo-500 transition-all focus:ring-2 focus:ring-indigo-500/50">
                                            <option value="">Select Level</option>
                                            {levels.map(l => (
                                                <option key={l.id} value={l.id}>{l.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-1.5"><TrendingUp size={10} /> Ranking Basis</label>
                                        <select
                                            value={annualReportForm.data.ranking_basis}
                                            onChange={e => annualReportForm.setData('ranking_basis', e.target.value)}
                                            className="w-full bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-800 text-slate-900 dark:text-white text-sm rounded-xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/50"
                                        >
                                            <option value="arm">Rank by Class</option>
                                            <option value="class">Rank by Class Level</option>
                                        </select>
                                    </div>

                                    <div className="flex flex-col sm:flex-row gap-2 w-full">
                                        <PrimaryButton
                                            type="submit"
                                            disabled={annualReportForm.processing || !annualReportForm.data.school_class_id}
                                            className="justify-center h-[42px] gap-2 w-full sm:flex-1"
                                        >
                                            <Search size={16} /> Load Students
                                        </PrimaryButton>

                                        {annualReportStudents.length > 0 && (
                                            <a
                                                href={route('results.bulk-annual-report-card', {
                                                    academic_session_id: annualReportForm.data.academic_session_id,
                                                    school_class_id: annualReportForm.data.school_class_id,
                                                    ranking_basis: annualReportForm.data.ranking_basis
                                                })}
                                                target="_blank"
                                                className="w-full sm:w-auto h-[42px] px-4 bg-indigo-500 text-white hover:bg-indigo-600 rounded-xl flex items-center justify-center gap-2 font-bold text-sm transition-all shadow-lg shadow-indigo-500/20"
                                                title="Print all annual report cards for this level"
                                            >
                                                <Printer size={16} /> Bulk Print
                                            </a>
                                        )}
                                    </div>
                                </form>

                                {annualReportStudents.length > 0 ? (
                                    <div className="overflow-x-auto -mx-6 bg-slate-900/10 rounded-[2rem] border border-slate-800/20">
                                        <table className="w-full text-left border-collapse">
                                            <thead>
                                                <tr className="border-b border-slate-200 dark:border-slate-800/50 bg-slate-100 dark:bg-slate-800/10">
                                                    <th className="px-6 py-5 text-[9px] font-black text-slate-500 uppercase tracking-[0.2em]">Student Details</th>
                                                    <th className="px-6 py-5 text-[9px] font-black text-slate-500 uppercase tracking-[0.2em] text-center">Class</th>
                                                    <th className="px-6 py-5 text-[9px] font-black text-slate-500 uppercase tracking-[0.2em] text-center">Annual Avg</th>
                                                    <th className="px-6 py-5 text-[9px] font-black text-slate-500 uppercase tracking-[0.2em] text-center">Position ({annualReportStudents[0]?.rank_scope === 'Class Level' ? 'Level' : 'Class'})</th>
                                                    <th className="px-6 py-5 text-[9px] font-black text-slate-500 uppercase tracking-[0.2em] text-center w-[15%]">
                                                        <div className="flex flex-col items-center gap-2">
                                                            <span>Promotion Status</span>
                                                            <div className="flex items-center gap-1">
                                                                {annualReportStudents.some(s => s.promotion_decisions?.[0]?.is_locked) ? (
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => {
                                                                            Swal.fire({
                                                                                title: 'Unlock All Results?',
                                                                                text: 'This will UNLOCK the results for all students in this level, allowing you to edit scores again.',
                                                                                icon: 'warning',
                                                                                showCancelButton: true,
                                                                                confirmButtonColor: '#ef4444',
                                                                                cancelButtonColor: '#64748b',
                                                                                confirmButtonText: 'Yes, Unlock System!',
                                                                                background: '#1e293b',
                                                                                color: '#f8fafc'
                                                                            }).then((result) => {
                                                                                if (result.isConfirmed) {
                                                                                    router.post(route('promotions.reset'), {
                                                                                        academic_session_id: annualReportForm.data.academic_session_id,
                                                                                        school_class_id: annualReportForm.data.school_class_id,
                                                                                    }, { onSuccess: () => Swal.fire({ title: 'Unlocked!', text: 'Results are now editable.', icon: 'success', background: '#1e293b', color: '#f8fafc' }) });
                                                                                }
                                                                            });
                                                                        }}
                                                                        className="px-2 py-0.5 bg-rose-500 text-white hover:bg-rose-600 rounded text-[9px] font-black uppercase transition-all tracking-tighter flex items-center gap-1 mr-2 animate-pulse shadow-lg shadow-rose-500/30"
                                                                        title="Results are LOCKED. Click to Unlock."
                                                                    >
                                                                        <Lock size={10} /> Unlock Results
                                                                    </button>
                                                                ) : (
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => {
                                                                            Swal.fire({
                                                                                title: 'Lock All Results?',
                                                                                text: 'This will LOCK the results again, preventing further edits until unlocked.',
                                                                                icon: 'warning',
                                                                                showCancelButton: true,
                                                                                confirmButtonColor: '#10b981',
                                                                                cancelButtonColor: '#64748b',
                                                                                confirmButtonText: 'Yes, Lock System!',
                                                                                background: '#1e293b',
                                                                                color: '#f8fafc'
                                                                            }).then((result) => {
                                                                                if (result.isConfirmed) {
                                                                                    router.post(route('promotions.lock'), {
                                                                                        academic_session_id: annualReportForm.data.academic_session_id,
                                                                                        school_class_id: annualReportForm.data.school_class_id,
                                                                                    }, { onSuccess: () => Swal.fire({ title: 'Locked!', text: 'Results are now finalized.', icon: 'success', background: '#1e293b', color: '#f8fafc' }) });
                                                                                }
                                                                            });
                                                                        }}
                                                                        className="px-2 py-0.5 bg-emerald-500 text-white hover:bg-emerald-600 rounded text-[9px] font-black uppercase transition-all tracking-tighter flex items-center gap-1 mr-2 shadow-lg shadow-emerald-500/30"
                                                                        title="Click to Lock Results"
                                                                    >
                                                                        <Unlock size={10} /> Lock Results
                                                                    </button>
                                                                )}
                                                                <button
                                                                    type="button"
                                                                    onClick={() => {
                                                                        Swal.fire({
                                                                            title: 'Promote All Students?',
                                                                            text: 'This will set the status of all visible students to "Promoted".',
                                                                            icon: 'warning',
                                                                            showCancelButton: true,
                                                                            confirmButtonColor: '#10b981',
                                                                            cancelButtonColor: '#64748b',
                                                                            confirmButtonText: 'Yes, promote all!'
                                                                        }).then((result) => {
                                                                            if (result.isConfirmed) {
                                                                                const decisions = annualReportStudents.map(s => ({ student_id: s.id, status: 'Promoted' }));
                                                                                router.post(route('promotions.decision.bulk-update'), {
                                                                                    academic_session_id: annualReportForm.data.academic_session_id,
                                                                                    decisions: decisions
                                                                                }, { onSuccess: () => Swal.fire('Promoted!', 'All students have been promoted.', 'success') });
                                                                            }
                                                                        });
                                                                    }}
                                                                    className="px-2 py-0.5 bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500 hover:text-white rounded text-[7px] font-black uppercase transition-all tracking-tighter"
                                                                    title="Promote All Students"
                                                                >
                                                                    Promote All
                                                                </button>
                                                                <button
                                                                    type="button"
                                                                    onClick={() => {
                                                                        Swal.fire({
                                                                            title: 'Promote All on Trial?',
                                                                            text: 'This will set the status of all visible students to "Promoted on Trial".',
                                                                            icon: 'warning',
                                                                            showCancelButton: true,
                                                                            confirmButtonColor: '#f59e0b',
                                                                            cancelButtonColor: '#64748b',
                                                                            confirmButtonText: 'Yes, promote on trial!'
                                                                        }).then((result) => {
                                                                            if (result.isConfirmed) {
                                                                                const decisions = annualReportStudents.map(s => ({ student_id: s.id, status: 'Promoted on Trial' }));
                                                                                router.post(route('promotions.decision.bulk-update'), {
                                                                                    academic_session_id: annualReportForm.data.academic_session_id,
                                                                                    decisions: decisions
                                                                                }, { onSuccess: () => Swal.fire('Updated!', 'All students promoted on trial.', 'success') });
                                                                            }
                                                                        });
                                                                    }}
                                                                    className="px-2 py-0.5 bg-amber-500/10 text-amber-600 hover:bg-amber-500 hover:text-white rounded text-[7px] font-black uppercase transition-all tracking-tighter"
                                                                    title="Promote All on Trial"
                                                                >
                                                                    Promote (Trial)
                                                                </button>
                                                                <button
                                                                    type="button"
                                                                    onClick={() => {
                                                                        Swal.fire({
                                                                            title: 'Fail All Students?',
                                                                            text: 'This will set the status of all visible students to "Not Promoted".',
                                                                            icon: 'warning',
                                                                            showCancelButton: true,
                                                                            confirmButtonColor: '#f43f5e',
                                                                            cancelButtonColor: '#64748b',
                                                                            confirmButtonText: 'Yes, fail all!'
                                                                        }).then((result) => {
                                                                            if (result.isConfirmed) {
                                                                                const decisions = annualReportStudents.map(s => ({ student_id: s.id, status: 'Not Promoted' }));
                                                                                router.post(route('promotions.decision.bulk-update'), {
                                                                                    academic_session_id: annualReportForm.data.academic_session_id,
                                                                                    decisions: decisions
                                                                                }, { onSuccess: () => Swal.fire('Updated!', 'All students marked as not promoted.', 'success') });
                                                                            }
                                                                        });
                                                                    }}
                                                                    className="px-2 py-0.5 bg-rose-500/10 text-rose-500 hover:bg-rose-500 hover:text-white rounded text-[7px] font-black uppercase transition-all tracking-tighter"
                                                                    title="Fail All Students"
                                                                >
                                                                    Fail All
                                                                </button>
                                                            </div>
                                                        </div>
                                                    </th>
                                                    <th className="px-6 py-5 text-[9px] font-black text-slate-500 uppercase tracking-[0.2em] text-right">Actions</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-slate-800/30">
                                                {annualReportStudents.map(student => (
                                                    <tr key={student.id} className="group hover:bg-slate-50 dark:hover:bg-white/[0.02] transition-colors">
                                                        <td className="px-6 py-4">
                                                            <div className="flex items-center gap-3">
                                                                <div className="w-8 h-8 rounded-full bg-indigo-500/10 flex items-center justify-center text-indigo-400 border border-indigo-500/20 text-[10px] font-black uppercase">
                                                                    {student.surname?.[0]}{student.othername?.[0]}
                                                                </div>
                                                                <div>
                                                                    <p className="text-[10px] font-black text-slate-900 dark:text-slate-100 uppercase">{student.surname} {student.othername}</p>
                                                                    <p className="text-[8px] font-mono text-slate-500">{student.registration_number}</p>
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-4 text-center">
                                                            <span className="text-[10px] font-bold text-slate-600 dark:text-white bg-slate-100 dark:bg-slate-800/50 px-2 py-1 rounded-lg">
                                                                {student.class_section?.school_class?.name}
                                                                {student.class_section?.class_arm?.name !== 'No arm' ? ` ${student.class_section?.class_arm?.name}` : ''}
                                                            </span>
                                                        </td>
                                                        <td className="px-6 py-4 text-center">
                                                            <span className={`text-[11px] font-black ${student.annual_avg >= 50 ? 'text-emerald-400' : 'text-rose-400'}`}>
                                                                {Number(student.annual_avg).toFixed(1)}%
                                                            </span>
                                                        </td>
                                                        <td className="px-6 py-4 text-center">
                                                            <div className="flex flex-col items-center">
                                                                <span className="text-[11px] font-black text-indigo-400">
                                                                    {student.rank}<sup>{student.rank === 1 ? 'st' : student.rank === 2 ? 'nd' : student.rank === 3 ? 'rd' : 'th'}</sup>
                                                                </span>
                                                                <span className="text-[8px] text-slate-500 font-bold uppercase tracking-tight">of {student.rank_total}</span>
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-4 text-center">
                                                            <div className="flex flex-col gap-2 scale-90 items-start pl-4 border-r border-slate-200 dark:border-slate-800/30 pr-4">
                                                                <label className={`flex items-center gap-2 cursor-pointer transition-all ${student.promotion_decisions?.[0]?.status === 'Promoted' ? 'text-emerald-400' : 'text-slate-500 hover:text-white'}`}>
                                                                    <input
                                                                        type="radio"
                                                                        name={`annual_promo_${student.id}`}
                                                                        value="Promoted"
                                                                        checked={student.promotion_decisions?.[0]?.status === 'Promoted'}
                                                                        onChange={() => {
                                                                            Swal.fire({
                                                                                title: 'Promote Student?',
                                                                                text: `Mark ${student.surname} as Promoted?`,
                                                                                icon: 'question',
                                                                                showCancelButton: true,
                                                                                confirmButtonColor: '#10b981',
                                                                                cancelButtonColor: '#64748b',
                                                                                confirmButtonText: 'Yes'
                                                                            }).then((result) => {
                                                                                if (result.isConfirmed) {
                                                                                    router.post(route('promotions.decision.update'), {
                                                                                        student_id: student.id,
                                                                                        academic_session_id: annualReportForm.data.academic_session_id,
                                                                                        status: 'Promoted',
                                                                                        reason: 'Manual Update from Annual Report Manager'
                                                                                    }, {
                                                                                        preserveScroll: true, onSuccess: () => Swal.fire({
                                                                                            title: 'Updated!', text: 'Status set to Promoted.', icon: 'success', timer: 1500, showConfirmButton: false
                                                                                        })
                                                                                    });
                                                                                }
                                                                            });
                                                                        }}
                                                                        className="w-3.5 h-3.5 bg-slate-100 dark:bg-slate-950 border-slate-300 dark:border-slate-800 text-emerald-500 focus:ring-0 focus:ring-offset-0"
                                                                    />
                                                                    <span className="text-[9px] font-black uppercase tracking-tight">Promoted</span>
                                                                </label>
                                                                <label className={`flex items-center gap-2 cursor-pointer transition-all ${student.promotion_decisions?.[0]?.status === 'Promoted on Trial' ? 'text-amber-400' : 'text-slate-500 hover:text-white'}`}>
                                                                    <input
                                                                        type="radio"
                                                                        name={`annual_promo_${student.id}`}
                                                                        value="Promoted on Trial"
                                                                        checked={student.promotion_decisions?.[0]?.status === 'Promoted on Trial'}
                                                                        onChange={() => {
                                                                            Swal.fire({
                                                                                title: 'Promote on Trial?',
                                                                                text: `Mark ${student.surname} as Promoted on Trial?`,
                                                                                icon: 'question',
                                                                                showCancelButton: true,
                                                                                confirmButtonColor: '#f59e0b',
                                                                                cancelButtonColor: '#64748b',
                                                                                confirmButtonText: 'Yes'
                                                                            }).then((result) => {
                                                                                if (result.isConfirmed) {
                                                                                    router.post(route('promotions.decision.update'), {
                                                                                        student_id: student.id,
                                                                                        academic_session_id: annualReportForm.data.academic_session_id,
                                                                                        status: 'Promoted on Trial',
                                                                                        reason: 'Manual Update from Annual Report Manager'
                                                                                    }, {
                                                                                        preserveScroll: true, onSuccess: () => Swal.fire({
                                                                                            title: 'Updated!', text: 'Status set to Promoted on Trial.', icon: 'success', timer: 1500, showConfirmButton: false
                                                                                        })
                                                                                    });
                                                                                }
                                                                            });
                                                                        }}
                                                                        className="w-3.5 h-3.5 bg-slate-100 dark:bg-slate-950 border-slate-300 dark:border-slate-800 text-amber-500 focus:ring-0 focus:ring-offset-0"
                                                                    />
                                                                    <span className="text-[9px] font-black uppercase tracking-tight">Promoted (Trial)</span>
                                                                </label>
                                                                <label className={`flex items-center gap-2 cursor-pointer transition-all ${student.promotion_decisions?.[0]?.status === 'Not Promoted' ? 'text-rose-400' : 'text-slate-500 hover:text-white'}`}>
                                                                    <input
                                                                        type="radio"
                                                                        name={`annual_promo_${student.id}`}
                                                                        value="Not Promoted"
                                                                        checked={student.promotion_decisions?.[0]?.status === 'Not Promoted'}
                                                                        onChange={() => {
                                                                            Swal.fire({
                                                                                title: 'Not Promote?',
                                                                                text: `Mark ${student.surname} as Not Promoted?`,
                                                                                icon: 'question',
                                                                                showCancelButton: true,
                                                                                confirmButtonColor: '#f43f5e',
                                                                                cancelButtonColor: '#64748b',
                                                                                confirmButtonText: 'Yes'
                                                                            }).then((result) => {
                                                                                if (result.isConfirmed) {
                                                                                    router.post(route('promotions.decision.update'), {
                                                                                        student_id: student.id,
                                                                                        academic_session_id: annualReportForm.data.academic_session_id,
                                                                                        status: 'Not Promoted',
                                                                                        reason: 'Manual Update from Annual Report Manager'
                                                                                    }, {
                                                                                        preserveScroll: true, onSuccess: () => Swal.fire({
                                                                                            title: 'Updated!', text: 'Status set to Not Promoted.', icon: 'success', timer: 1500, showConfirmButton: false
                                                                                        })
                                                                                    });
                                                                                }
                                                                            });
                                                                        }}
                                                                        className="w-3.5 h-3.5 bg-slate-100 dark:bg-slate-950 border-slate-300 dark:border-slate-800 text-rose-500 focus:ring-0 focus:ring-offset-0"
                                                                    />
                                                                    <span className="text-[9px] font-black uppercase tracking-tight">Not Promoted</span>
                                                                </label>
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-4 text-right">
                                                            <div className="flex justify-end gap-2">
                                                                <Link
                                                                    href={route('results.annual-report-card', {
                                                                        student: student.id,
                                                                        academic_session_id: annualReportForm.data.academic_session_id,
                                                                        ranking_basis: annualReportForm.data.ranking_basis
                                                                    })}
                                                                    className="p-2 bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-xl hover:bg-indigo-600 dark:hover:bg-slate-700 hover:text-white dark:hover:text-white transition-all border border-slate-300 dark:border-slate-700/50 group/btn"
                                                                    title="View/Print Annual Report"
                                                                >
                                                                    <Printer size={14} className="group-hover/btn:scale-110 transition-transform" />
                                                                </Link>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center justify-center py-24 text-center space-y-4 bg-slate-900/10 border border-dashed border-slate-800/50 rounded-[3rem]">
                                        <div className="p-4 bg-slate-800/50 rounded-2xl text-slate-600">
                                            <LayoutGrid size={32} />
                                        </div>
                                        <div className="space-y-1">
                                            <p className="text-slate-800 dark:text-slate-300 font-bold">{isAnnualReportSearched ? 'No Records Found' : 'Annual Reports Ready'}</p>
                                            <p className="text-slate-500 text-sm max-w-xs font-medium">
                                                {isAnnualReportSearched
                                                    ? 'No annual results found for this class level. Ensure results are compiled and promotions finalized.'
                                                    : 'Select a Class Level and Ranking Basis to generate session-wide report cards.'
                                                }
                                            </p>
                                        </div>
                                    </div>
                                )}
                            </Card>
                        </div>
                    )}

                    {activeTab === 'analysis' && (
                        <div className="space-y-6">
                            <Card>
                                <form onSubmit={e => { e.preventDefault(); handleTabFilter('analysis', analysisForm); }} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-1.5"><Calendar size={10} /> Session</label>
                                        <select
                                            value={analysisForm.data.academic_session_id}
                                            onChange={e => analysisForm.setData('academic_session_id', e.target.value)}
                                            className="w-full bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-800 text-slate-900 dark:text-white text-sm rounded-xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/50"
                                        >
                                            <option value="">Select Session</option>
                                            {sessions.map(s => <option key={s.id} value={s.id}>{s.name} {s.is_current ? '(Active)' : ''}</option>)}
                                        </select>
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-1.5"><Clock size={10} /> Term</label>
                                        <select
                                            value={analysisForm.data.term_id}
                                            onChange={e => analysisForm.setData('term_id', e.target.value)}
                                            className="w-full bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-800 text-slate-900 dark:text-white text-sm rounded-xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/50"
                                            disabled={!analysisForm.data.academic_session_id}
                                        >
                                            <option value="">{analysisForm.data.academic_session_id ? 'All Terms' : 'Select Session First'}</option>
                                            {analysisForm.data.academic_session_id && sessions.find(s => s.id == analysisForm.data.academic_session_id)?.terms?.map(t => (
                                                <option key={t.id} value={t.id}>{t.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-1.5"><GraduationCap size={10} /> Class</label>
                                        <select value={analysisForm.data.class_section_id} onChange={e => analysisForm.setData('class_section_id', e.target.value)} className="w-full bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-800 text-slate-900 dark:text-white text-sm rounded-xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/50">
                                            <option value="">All Classes</option>
                                            {classSections.map(cs => (
                                                <option key={cs.id} value={cs.id}>
                                                    {cs.school_class?.name}
                                                    {cs.class_arm?.name !== 'No arm' ? ` - ${cs.class_arm?.name}` : ''}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="flex gap-2">
                                        <button
                                            type="submit"
                                            disabled={!analysisForm.data.academic_session_id || !analysisForm.data.class_section_id}
                                            className="flex-1 h-[42px] bg-indigo-600 text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-indigo-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            <Filter size={16} /> Analyze Results
                                        </button>
                                    </div>
                                </form>
                            </Card>

                            {/* Analysis Visualization */}
                            {analysisData ? (
                                <div className="space-y-6">
                                    {/* Stats Cards */}
                                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                        {[
                                            { label: 'Highest Score', value: analysisData.stats.highest_score, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
                                            { label: 'Lowest Score', value: analysisData.stats.lowest_score, color: 'text-rose-500', bg: 'bg-rose-500/10' },
                                            { label: 'Overall Average', value: analysisData.stats.overall_average, color: 'text-indigo-500', bg: 'bg-indigo-500/10' },
                                            { label: 'Total Students', value: analysisData.stats.total_students, color: 'text-amber-500', bg: 'bg-amber-500/10' },
                                        ].map((stat, i) => (
                                            <div key={i} className={`p-4 rounded-2xl border border-slate-200 dark:border-slate-800 ${stat.bg} space-y-1`}>
                                                <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">{stat.label}</p>
                                                <p className={`text-2xl font-black ${stat.color}`}>{stat.value}</p>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                        {/* Grade Distribution Chart */}
                                        <Card title="Grade Distribution" description="Cumulative breakdown of overall student grades for the term.">
                                            <div className="h-[300px] w-full pt-4">
                                                <ResponsiveContainer width="100%" height="100%">
                                                    <BarChart data={analysisData.gradeDistribution}>
                                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#33415520" />
                                                        <XAxis dataKey="name" stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} />
                                                        <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} />
                                                        <Tooltip
                                                            cursor={{ fill: '#f1f5f9' }}
                                                            contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                                                        />
                                                        <Bar dataKey="value" fill="#4f46e5" radius={[4, 4, 0, 0]} barSize={15} />
                                                    </BarChart>
                                                </ResponsiveContainer>
                                            </div>
                                        </Card>

                                        {/* Pass/Fail Ratio Chart */}
                                        <Card title="Success Ratio" description="Percentage comparison of passing vs failing scores.">
                                            <div className="h-[300px] w-full flex items-center justify-center">
                                                <ResponsiveContainer width="100%" height="100%">
                                                    <PieChart>
                                                        <Pie
                                                            data={analysisData.passFailRatio}
                                                            cx="50%"
                                                            cy="50%"
                                                            innerRadius={60}
                                                            outerRadius={80}
                                                            paddingAngle={5}
                                                            dataKey="value"
                                                            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                                        >
                                                            {analysisData.passFailRatio.map((entry, index) => (
                                                                <Cell key={`cell-${index}`} fill={entry.color} />
                                                            ))}
                                                        </Pie>
                                                        <Tooltip />
                                                        <Legend verticalAlign="bottom" height={36} />
                                                    </PieChart>
                                                </ResponsiveContainer>
                                            </div>
                                        </Card>

                                        {/* Subject Performance */}
                                        <Card className="lg:col-span-2" title="Subject Performance" description="Comparative analysis of average scores and pass rates for each academic subject.">
                                            <div className="h-[400px] w-full pt-4">
                                                <ResponsiveContainer width="100%" height="100%">
                                                    <BarChart data={analysisData.subjectAverages} margin={{ top: 10, right: 30, left: 0, bottom: 60 }}>
                                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#33415520" />
                                                        <XAxis
                                                            dataKey="name"
                                                            stroke="#94a3b8"
                                                            fontSize={10}
                                                            tickLine={false}
                                                            axisLine={false}
                                                            angle={-45}
                                                            textAnchor="end"
                                                            interval={0}
                                                        />
                                                        <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} />
                                                        <Tooltip
                                                            contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                                                        />
                                                        <Legend verticalAlign="top" height={36} />
                                                        <Bar dataKey="average" name="Average Score" fill="#6366f1" radius={[4, 4, 0, 0]} barSize={20} />
                                                        <Bar dataKey="pass_rate" name="Pass Rate (%)" fill="#10b981" radius={[4, 4, 0, 0]} barSize={20} />
                                                    </BarChart>
                                                </ResponsiveContainer>
                                            </div>
                                        </Card>
                                    </div>
                                </div>
                            ) : (
                                <div className="py-24 text-center">
                                    <div className="w-16 h-16 bg-slate-200 dark:bg-slate-900 rounded-3xl border border-slate-300 dark:border-slate-800 flex items-center justify-center text-slate-400 dark:text-slate-600 mx-auto mb-4">
                                        <TrendingUp size={32} />
                                    </div>
                                    <h3 className="text-slate-800 dark:text-slate-300 font-bold mb-1 text-lg">
                                        Result Performance Analytics
                                    </h3>
                                    <p className="text-slate-500 text-sm max-w-sm mx-auto">
                                        Select a session and class to view comprehensive performance charts and statistical breakdowns.
                                    </p>
                                </div>
                            )}
                        </div>
                    )}

                    {activeTab === 'pins' && (
                        <div className="pb-12">
                            <PinManagement
                                sessions={sessions}
                                terms={currentSession?.terms || []}
                                classes={classSections}
                                annualRankingBasis={reportCardSettings?.annual_ranking_basis}
                                pinHistory={pinHistory}
                            />
                        </div>
                    )}

                    {activeTab === 'settings' && (
                        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 pb-12">
                            <div className="space-y-6">
                                <form onSubmit={e => { e.preventDefault(); caForm.post(route('settings.results.ca-update'), { onSuccess: () => { } }); }}>
                                    <Card title="Assessment Structure (CA)" description="Define Continuous Assessment breakdown." actions={canManageSettings && <button type="button" onClick={() => caForm.setData('config', [...caForm.data.config, { name: '', max_score: 10 }])} className="p-2 bg-indigo-500/10 text-indigo-400 rounded-lg transition-all hover:bg-indigo-500 hover:text-white"><Plus size={16} /></button>}>
                                        <div className="space-y-4">
                                            {caForm.data.config.map((ca, index) => (
                                                <div key={index} className="flex items-end gap-3 p-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800">
                                                    <div className="flex-1 space-y-1">
                                                        <label className="text-[10px] font-bold text-slate-500 uppercase">Name</label>
                                                        <input type="text" disabled={!canManageSettings} value={ca.name} onChange={e => { const n = [...caForm.data.config]; n[index].name = e.target.value; caForm.setData('config', n); }} className="w-full bg-slate-50 dark:bg-slate-950 border-slate-300 dark:border-slate-800 text-xs rounded-lg px-3 py-2 disabled:opacity-50 text-slate-900 dark:text-white" />
                                                    </div>
                                                    <div className="w-20 space-y-1">
                                                        <label className="text-[10px] font-bold text-slate-500 uppercase text-center">Max</label>
                                                        <input type="number" disabled={!canManageSettings} value={ca.max_score} onChange={e => { const n = [...caForm.data.config]; n[index].max_score = e.target.value; caForm.setData('config', n); }} className="w-full bg-slate-50 dark:bg-slate-950 border-slate-300 dark:border-slate-800 text-xs rounded-lg px-3 py-2 text-center disabled:opacity-50 text-slate-900 dark:text-white" />
                                                    </div>
                                                    {canManageSettings && <button type="button" onClick={() => { const n = [...caForm.data.config]; n.splice(index, 1); caForm.setData('config', n); }} className="p-2 text-rose-500 hover:bg-rose-500/10 rounded-lg transition-all"><Trash2 size={16} /></button>}
                                                </div>
                                            ))}
                                            <div className="flex justify-end">{canManageSettings && <PrimaryButton disabled={caForm.processing} className="h-9 text-xs"><Save size={14} className="mr-2" /> Save</PrimaryButton>}</div>
                                        </div>
                                    </Card>
                                </form>

                                <Card title="Grading System" description="Manage academic performance scales.">
                                    <div className="space-y-6">
                                        {canManageSettings && (
                                            <form onSubmit={e => { e.preventDefault(); gradeForm.post(route('settings.results.grade-store'), { onSuccess: () => { gradeForm.reset(); } }); }} className="grid grid-cols-2 gap-3 p-4 rounded-2xl bg-indigo-500/5 border border-indigo-500/10">
                                                <div className="space-y-1">
                                                    <input type="text" value={gradeForm.data.name} onChange={e => gradeForm.setData('name', e.target.value)} placeholder="Grade (e.g. A)" className="w-full bg-slate-50 dark:bg-slate-950 border-slate-300 dark:border-slate-800 text-xs rounded-lg px-3 py-2 text-slate-900 dark:text-white" />
                                                    <InputError message={gradeForm.errors.name} />
                                                </div>
                                                <div className="space-y-1">
                                                    <input type="text" value={gradeForm.data.remarks} onChange={e => gradeForm.setData('remarks', e.target.value)} placeholder="Remark (e.g. Excellent)" className="w-full bg-slate-50 dark:bg-slate-950 border-slate-300 dark:border-slate-800 text-xs rounded-lg px-3 py-2 text-slate-900 dark:text-white" />
                                                    <InputError message={gradeForm.errors.remarks} />
                                                </div>
                                                <div className="space-y-1">
                                                    <input type="number" value={gradeForm.data.min_score} onChange={e => gradeForm.setData('min_score', e.target.value)} placeholder="Min %" className="w-full bg-slate-50 dark:bg-slate-950 border-slate-300 dark:border-slate-800 text-xs rounded-lg px-3 py-2 text-slate-900 dark:text-white" />
                                                    <InputError message={gradeForm.errors.min_score} />
                                                </div>
                                                <div className="space-y-1">
                                                    <input type="number" value={gradeForm.data.max_score} onChange={e => gradeForm.setData('max_score', e.target.value)} placeholder="Max %" className="w-full bg-slate-50 dark:bg-slate-950 border-slate-300 dark:border-slate-800 text-xs rounded-lg px-3 py-2 text-slate-900 dark:text-white" />
                                                    <InputError message={gradeForm.errors.max_score} />
                                                </div>
                                                <PrimaryButton type="submit" disabled={gradeForm.processing} className="h-9 text-xs col-span-2">Add Assessment Scale</PrimaryButton>
                                            </form>
                                        )}
                                        <div className="space-y-2">
                                            {grades.map((grade) => (
                                                <div key={grade.id} className="flex items-center justify-between p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex items-center justify-center font-black text-slate-700 dark:text-white text-xs">{grade.name}</div>
                                                        <div><p className="text-[11px] font-bold text-slate-800 dark:text-white">{grade.remarks}</p><p className="text-[9px] text-slate-500">{grade.min_score}% — {grade.max_score}%</p></div>
                                                    </div>
                                                    {canManageSettings && (
                                                        <button
                                                            onClick={() => {
                                                                Swal.fire({
                                                                    title: 'Delete Grade Scale?',
                                                                    text: "This adjustment may affect how student totals are categorized.",
                                                                    icon: 'warning',
                                                                    showCancelButton: true,
                                                                    confirmButtonColor: '#4f46e5',
                                                                    cancelButtonColor: '#ef4444',
                                                                    confirmButtonText: 'Yes, delete it!',
                                                                    background: '#0f172a',
                                                                    color: '#f8fafc',
                                                                    borderRadius: '1.5rem',
                                                                }).then((confirmRes) => {
                                                                    if (confirmRes.isConfirmed) {
                                                                        router.delete(route('settings.results.grade-destroy', grade.id), {
                                                                            onSuccess: () => { }
                                                                        });
                                                                    }
                                                                });
                                                            }}
                                                            className="p-1.5 text-slate-600 hover:text-rose-500 transition-all font-bold"
                                                        >
                                                            <Trash2 size={14} />
                                                        </button>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </Card>
                            </div>

                            <div className="space-y-6">
                                <form onSubmit={e => { e.preventDefault(); settingsForm.post(route('settings.results.report-update'), { onSuccess: () => { } }); }}>
                                    <Card title="Report Card Display" description="Manage visibility of sections and global data.">
                                        <div className="space-y-6">
                                            {/* Toggles Group */}
                                            <div className="space-y-2">
                                                <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest pl-1 mb-2">Visibility Toggles</h4>
                                                <div className="grid grid-cols-1 gap-2">
                                                    {Object.entries(settingsForm.data.settings).filter(([key]) => key.startsWith('show_') || key.startsWith('require_')).map(([key, value]) => (
                                                        <label key={key} className={`flex items-center justify-between p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 transition-all ${canManageSettings ? 'cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-850' : 'cursor-not-allowed opacity-75'}`}>
                                                            <span className="text-xs font-medium text-slate-700 dark:text-slate-300 capitalize">{key.replace(/_/g, ' ')}</span>
                                                            <div onClick={() => { if (canManageSettings) settingsForm.setData('settings', { ...settingsForm.data.settings, [key]: !value }); }} className={`w-10 h-5 rounded-full relative transition-all ${value ? 'bg-indigo-600' : 'bg-slate-300 dark:bg-slate-700'}`}>
                                                                <div className={`absolute top-1 w-3 h-3 rounded-full bg-white transition-all ${value ? 'left-6' : 'left-1'}`}></div>
                                                            </div>
                                                        </label>
                                                    ))}
                                                </div>
                                            </div>

                                            {/* Global Data Inputs */}
                                            <div className="space-y-4 pt-4 border-t border-slate-300 dark:border-slate-800/50">
                                                <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest pl-1">Global Default Values</h4>
                                                <div className="grid grid-cols-1 gap-4">
                                                    <div className="space-y-1">
                                                        <label className="text-[10px] font-bold text-slate-500 uppercase">Next Term Fee (Global)</label>
                                                        <input
                                                            type="text"
                                                            value={settingsForm.data.settings.next_term_fee || ''}
                                                            onChange={e => settingsForm.setData('settings', { ...settingsForm.data.settings, next_term_fee: e.target.value })}
                                                            placeholder="e.g. 125,000.00"
                                                            className="w-full bg-white dark:bg-slate-950 border-slate-300 dark:border-slate-800 text-xs rounded-xl px-3 py-2 text-slate-900 dark:text-white disabled:opacity-50 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/50"
                                                            disabled={!canManageSettings}
                                                        />
                                                    </div>
                                                    <div className="grid grid-cols-2 gap-4">
                                                        <div className="space-y-1">
                                                            <label className="text-[10px] font-bold text-slate-500 uppercase">Next Term Resumption</label>
                                                            <input
                                                                type="date"
                                                                value={settingsForm.data.settings.next_term_begin || ''}
                                                                min={new Date().toISOString().split('T')[0]}
                                                                onChange={e => settingsForm.setData('settings', { ...settingsForm.data.settings, next_term_begin: e.target.value })}
                                                                className="w-full bg-white dark:bg-slate-950 border-slate-300 dark:border-slate-800 text-xs rounded-xl px-3 py-2 text-slate-900 dark:text-white disabled:opacity-50 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/50"
                                                                disabled={!canManageSettings}
                                                            />
                                                        </div>
                                                        <div className="space-y-1">
                                                            <label className="text-[10px] font-bold text-slate-500 uppercase">Next Term Closing</label>
                                                            <input
                                                                type="date"
                                                                value={settingsForm.data.settings.next_term_end || ''}
                                                                min={settingsForm.data.settings.next_term_begin || new Date().toISOString().split('T')[0]}
                                                                onChange={e => settingsForm.setData('settings', { ...settingsForm.data.settings, next_term_end: e.target.value })}
                                                                className="w-full bg-white dark:bg-slate-950 border-slate-300 dark:border-slate-800 text-xs rounded-xl px-3 py-2 text-slate-900 dark:text-white disabled:opacity-50 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/50"
                                                                disabled={!canManageSettings}
                                                            />
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex justify-end pt-4">{canManageSettings && <PrimaryButton disabled={settingsForm.processing} className="h-10 px-6 gap-2"><Save size={16} /> Update Layout Settings</PrimaryButton>}</div>
                                        </div>
                                    </Card>
                                </form>

                                <Card title="Session Promotion & Pass Policy" description="Universal rules for this academic session.">
                                    <div className="space-y-6">
                                        <div className="overflow-x-auto border border-slate-300 dark:border-slate-800 rounded-3xl">
                                            <table className="w-full text-left">
                                                <thead className="bg-slate-100 dark:bg-slate-900/50">
                                                    <tr>
                                                        <th className="p-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Type</th>
                                                        <th className="p-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Active Metric</th>
                                                        <th className="p-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Threshold</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-slate-200 dark:divide-slate-800/50">
                                                    {/* Termly Status Indicator */}
                                                    <tr className="bg-slate-50 dark:bg-slate-950 group hover:bg-slate-100 dark:hover:bg-slate-900/40 transition-colors">
                                                        <td className="p-4">
                                                            <span className="text-[10px] font-black text-indigo-400 bg-indigo-500/10 px-2 py-1 rounded-md uppercase">Termly</span>
                                                        </td>
                                                        <td className="p-4">
                                                            <div className="flex items-center gap-2">
                                                                {globalRule?.is_rule1_termly && <><Calculator size={12} className="text-white" /><span className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-tight">Rule 1: Performance Average</span></>}
                                                                {globalRule?.is_rule2_termly && <><CheckCircle2 size={12} className="text-white" /><span className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-tight">Rule 2: Core + Subject Passes</span></>}
                                                                {globalRule?.is_rule3_termly && <><AlertTriangle size={12} className="text-white" /><span className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-tight">Rule 3: Core + Failure Limit</span></>}
                                                                {globalRule?.is_rule4_termly && <><GraduationCap size={12} className="text-white" /><span className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-tight">Rule 4: Avg + Core Subjects</span></>}
                                                            </div>
                                                        </td>
                                                        <td className="p-4">
                                                            <span className="text-xs font-black text-emerald-400">
                                                                {globalRule?.is_rule1_termly && `${globalRule?.min_average}%`}
                                                                {globalRule?.is_rule2_termly && `${globalRule?.pass_other_subjects_count} Passes`}
                                                                {globalRule?.is_rule3_termly && `Max ${globalRule?.max_failed_subjects} Fails`}
                                                                {globalRule?.is_rule4_termly && `${globalRule?.min_average}% + All Core`}
                                                            </span>
                                                        </td>
                                                    </tr>
                                                    {/* Annual Status Indicator */}
                                                    <tr className="bg-slate-50 dark:bg-slate-950 group hover:bg-slate-100 dark:hover:bg-slate-900/40 transition-colors">
                                                        <td className="p-4">
                                                            <span className="text-[10px] font-black text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded-md uppercase">Annual</span>
                                                        </td>
                                                        <td className="p-4">
                                                            <div className="flex items-center gap-2">
                                                                {globalRule?.is_rule1_annual && <><Calculator size={12} className="text-white" /><span className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-tight">Rule 1: Performance Average</span></>}
                                                                {globalRule?.is_rule2_annual && <><CheckCircle2 size={12} className="text-white" /><span className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-tight">Rule 2: Core + Subject Passes</span></>}
                                                                {globalRule?.is_rule3_annual && <><AlertTriangle size={12} className="text-white" /><span className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-tight">Rule 3: Core + Failure Limit</span></>}
                                                                {globalRule?.is_rule4_annual && <><GraduationCap size={12} className="text-white" /><span className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-tight">Rule 4: Avg + Core Subjects</span></>}
                                                            </div>
                                                        </td>
                                                        <td className="p-4">
                                                            <span className="text-xs font-black text-emerald-400">
                                                                {globalRule?.is_rule1_annual && `${globalRule?.min_average}%`}
                                                                {globalRule?.is_rule2_annual && `${globalRule?.pass_other_subjects_count} Passes`}
                                                                {globalRule?.is_rule3_annual && `Max ${globalRule?.max_failed_subjects} Fails`}
                                                                {globalRule?.is_rule4_annual && `${globalRule?.min_average}% + All Core`}
                                                            </span>
                                                        </td>
                                                    </tr>
                                                </tbody>
                                            </table>
                                        </div>
                                        <div className="pt-2">
                                            {canManageSettings && (
                                                <PrimaryButton
                                                    onClick={() => {
                                                        promotionRuleForm.setData({
                                                            id: globalRule?.id || '',
                                                            min_average: globalRule?.min_average || 45,
                                                            trial_min_average: globalRule?.trial_min_average || '',
                                                            max_failed_subjects: globalRule?.max_failed_subjects || 3,
                                                            core_subject_ids: globalRule?.core_subject_ids || [],
                                                            is_rule1_termly: !!globalRule?.is_rule1_termly,
                                                            is_rule1_annual: !!globalRule?.is_rule1_annual,
                                                            is_rule2_termly: !!globalRule?.is_rule2_termly,
                                                            is_rule2_annual: !!globalRule?.is_rule2_annual,
                                                            is_rule3_termly: !!globalRule?.is_rule3_termly,
                                                            is_rule3_annual: !!globalRule?.is_rule3_annual,
                                                            is_rule4_termly: !!globalRule?.is_rule4_termly,
                                                            is_rule4_annual: !!globalRule?.is_rule4_annual,
                                                            pass_other_subjects_count: globalRule?.pass_other_subjects_count || 5,
                                                        });
                                                        setShowingRuleModal(true);
                                                    }}
                                                    className="w-full justify-center gap-2"
                                                >
                                                    <Sliders size={18} /> Modify Session Policy
                                                </PrimaryButton>
                                            )}
                                        </div>
                                    </div>
                                </Card>

                                <Card title="Behavioral Domains" description="Skill categories.">
                                    <div className="space-y-6">
                                        <form onSubmit={e => { e.preventDefault(); categoryForm.post(route('settings.results.psychomotor-category-store'), { onSuccess: () => { categoryForm.reset(); } }); }} className="flex gap-2">
                                            <input type="text" value={categoryForm.data.name} onChange={e => categoryForm.setData('name', e.target.value)} placeholder="New Domain..." className="flex-1 bg-white dark:bg-slate-950 border-slate-300 dark:border-slate-800 text-xs rounded-xl px-3 py-2 text-slate-900 dark:text-white" />
                                            <button className="p-2.5 bg-indigo-600 rounded-xl text-white"><PlusCircle size={18} /></button>
                                        </form>
                                        <div className="space-y-6">
                                            {psychomotorCategories.map((cat) => (
                                                <div key={cat.id} className="space-y-2">
                                                    <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-1">
                                                        <h4 className="text-[9px] font-black text-indigo-400 uppercase tracking-widest">{cat.name}</h4>
                                                        <button
                                                            onClick={() => {
                                                                Swal.fire({
                                                                    title: 'Remove Domain?',
                                                                    text: "This will also remove all associated traits and ratings for this domain.",
                                                                    icon: 'warning',
                                                                    showCancelButton: true,
                                                                    confirmButtonColor: '#4f46e5',
                                                                    cancelButtonColor: '#ef4444',
                                                                    confirmButtonText: 'Yes, delete it!',
                                                                    background: '#0f172a',
                                                                    color: '#f8fafc',
                                                                    borderRadius: '1.5rem',
                                                                }).then((confirmRes) => {
                                                                    if (confirmRes.isConfirmed) {
                                                                        router.delete(route('settings.results.psychomotor-category-destroy', cat.id), {
                                                                            onSuccess: () => { }
                                                                        });
                                                                    }
                                                                });
                                                            }}
                                                            className="text-slate-600 hover:text-rose-500 font-bold"
                                                        >
                                                            <Trash2 size={10} />
                                                        </button>
                                                    </div>
                                                    <div className="space-y-1.5">
                                                        {cat.skills?.map(skill => (
                                                            <div key={skill.id} className="flex items-center justify-between p-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg group ">
                                                                <span className="text-[11px] text-slate-700 dark:text-slate-300">{skill.name}</span>
                                                                <button
                                                                    onClick={() => {
                                                                        Swal.fire({
                                                                            title: 'Delete Trait?',
                                                                            text: "Historical ratings for this specific trait will be lost.",
                                                                            icon: 'warning',
                                                                            showCancelButton: true,
                                                                            confirmButtonColor: '#4f46e5',
                                                                            cancelButtonColor: '#ef4444',
                                                                            confirmButtonText: 'Yes, delete it!',
                                                                            background: '#0f172a',
                                                                            color: '#f8fafc',
                                                                            borderRadius: '1.5rem',
                                                                        }).then((confirmRes) => {
                                                                            if (confirmRes.isConfirmed) {
                                                                                router.delete(route('settings.results.psychomotor-skill-destroy', skill.id), {
                                                                                    onSuccess: () => { }
                                                                                });
                                                                            }
                                                                        });
                                                                    }}
                                                                    className="text-slate-600 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-all font-bold"
                                                                >
                                                                    <Trash2 size={12} />
                                                                </button>
                                                            </div>
                                                        ))}
                                                        <form onSubmit={e => { e.preventDefault(); skillForm.post(route('settings.results.psychomotor-skill-store'), { onSuccess: () => { skillForm.reset(); } }); }} className="flex gap-2">
                                                            <input type="text" value={skillForm.data.category_id === cat.id ? skillForm.data.name : ''} onChange={e => skillForm.setData({ category_id: cat.id, name: e.target.value })} placeholder="Add trait..." className="flex-1 bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800/50 text-[10px] rounded-lg px-2 py-1.5 text-slate-900 dark:text-white" />
                                                            <button className="text-indigo-400 hover:text-indigo-600 dark:hover:text-white"><Plus size={14} /></button>
                                                        </form>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </Card>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Result Edit Modal */}
            <Modal show={showingResultModal} onClose={() => { setShowingResultModal(false); setEditingResult(null); }}>
                <div className="p-6">
                    <h2 className="text-lg font-medium text-slate-900 dark:text-white mb-1">Edit Result</h2>
                    <p className="text-sm text-slate-500 mb-6 font-medium">Modify scores for {editingResult?.student?.surname} {editingResult?.student?.othername}</p>

                    <form onSubmit={handleResultUpdate} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* CA Inputs */}
                            <div className="space-y-4">
                                <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest border-b border-slate-800 pb-2">Assessments (CA)</h4>
                                <div className="space-y-3 max-h-60 overflow-y-auto pr-2">
                                    {resultEditForm.data.assessments.map((ca, index) => (
                                        <div key={index} className="space-y-1">
                                            <div className="flex justify-between">
                                                <label className="text-[10px] font-bold text-slate-500 dark:text-white uppercase">{ca.name}</label>
                                                <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">Max: {ca.max_score}</span>
                                            </div>
                                            <input
                                                type="number"
                                                min="0"
                                                step="0.01"
                                                max={ca.max_score}
                                                value={ca.score}
                                                onChange={e => updateEditAssessment(index, e.target.value)}
                                                className="w-full bg-slate-50 dark:bg-slate-900 border-slate-300 dark:border-slate-800 text-sm rounded-xl focus:border-indigo-500 px-3 py-2 text-slate-900 dark:text-white"
                                            />
                                        </div>
                                    ))}
                                    {resultEditForm.data.assessments.length === 0 && (
                                        <p className="text-xs text-slate-600 italic">No CA components configured.</p>
                                    )}
                                </div>
                            </div>

                            {/* Exam Input */}
                            <div className="space-y-4">
                                <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest border-b border-slate-800 pb-2">Examination</h4>
                                <div className="space-y-1">
                                    <div className="flex justify-between">
                                        <label className="text-[10px] font-bold text-slate-500 dark:text-white uppercase">Exam Score</label>
                                        <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">Max: {100 - (caConfig || []).reduce((s, c) => s + parseInt(c.max_score || 0), 0)}</span>
                                    </div>
                                    <input
                                        type="number"
                                        min="0"
                                        step="0.01"
                                        value={resultEditForm.data.exam_score}
                                        onChange={e => {
                                            if (e.target.value < 0) return;
                                            resultEditForm.setData('exam_score', e.target.value)
                                        }}
                                        className="w-full bg-slate-50 dark:bg-slate-900 border-slate-300 dark:border-slate-800 text-sm rounded-xl focus:border-indigo-500 px-3 py-2 text-slate-900 dark:text-white"
                                    />
                                    <InputError message={resultEditForm.errors.exam_score} />
                                </div>
                                <div className="mt-8 p-4 bg-indigo-500/5 rounded-2xl border border-indigo-500/10">
                                    <div className="flex items-center justify-between">
                                        <span className="text-xs font-bold text-white uppercase">Resulting Total</span>
                                        <span className="text-2xl font-black text-indigo-400">{calculateEditTotal().toFixed(1)}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                    </form>
                    <div className="flex items-center justify-end gap-3 pt-6 border-t border-slate-200 dark:border-slate-800 mt-6">
                        <SecondaryButton onClick={() => { setShowingResultModal(false); setEditingResult(null); }}>Cancel</SecondaryButton>
                        <PrimaryButton onClick={handleResultUpdate} className="gap-2" disabled={resultEditForm.processing}>
                            <Save size={18} /> Update Result
                        </PrimaryButton>
                    </div>
                </div>
            </Modal>

            {/* Promotion Rule Modal */}
            <Modal show={showingRuleModal} onClose={() => setShowingRuleModal(false)} maxWidth="2xl">
                <div className="p-8 max-h-[90vh] overflow-y-auto custom-scrollbar">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h2 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight flex items-center gap-3">
                                <Sliders className="text-indigo-500" /> Promotion Configuration
                            </h2>
                            <p className="text-slate-600 dark:text-white font-medium text-sm">Fine-tune pass criteria for the academic session.</p>
                            <div className="mt-4 p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl flex gap-3 items-center">
                                <Info size={16} className="text-amber-500 shrink-0" />
                                <p className="text-[10px] text-amber-600 dark:text-amber-400 font-medium italic">
                                    Updating these rules will affect all future result re-computations. <strong>Already finalized annual results will not be altered unless unlocked and re-computed.</strong>
                                </p>
                            </div>
                        </div>
                    </div>

                    <form onSubmit={handleRuleUpdate} className="space-y-8">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

                            {/* Core Subjects Selection */}
                            <div className="md:col-span-2 space-y-3">
                                <h4 className="text-[10px] font-black text-slate-600 dark:text-white uppercase tracking-widest border-b border-slate-200 dark:border-slate-800 pb-2">Rule Parameter: Core Subjects</h4>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 max-h-40 overflow-y-auto p-2 bg-slate-50 dark:bg-slate-950/50 rounded-2xl border border-slate-200 dark:border-slate-800 custom-scrollbar">
                                    {subjects.map(subject => (
                                        <label key={subject.id} className={`flex items-center gap-2 p-2 rounded-xl border transition-all cursor-pointer ${promotionRuleForm.data.core_subject_ids.includes(subject.id) ? 'bg-indigo-600/10 border-indigo-500/30 text-indigo-600 dark:text-indigo-400' : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-white hover:border-slate-300 dark:hover:border-slate-700'}`}>
                                            <input
                                                type="checkbox"
                                                checked={promotionRuleForm.data.core_subject_ids.includes(subject.id)}
                                                onChange={e => {
                                                    const ids = [...promotionRuleForm.data.core_subject_ids];
                                                    if (e.target.checked) ids.push(subject.id);
                                                    else return promotionRuleForm.setData('core_subject_ids', ids.filter(id => id !== subject.id));
                                                    promotionRuleForm.setData('core_subject_ids', ids);
                                                }}
                                                className="rounded bg-slate-100 dark:bg-slate-950 border-slate-300 dark:border-slate-800 text-indigo-600 focus:ring-0"
                                            />
                                            <span className="text-[10px] font-bold truncate">{subject.name}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            {/* New Mutually Exclusive Rule Selection */}
                            <div className="md:col-span-2 p-6 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl space-y-6">
                                <h4 className="text-[10px] font-black text-indigo-400 border-b border-indigo-500/10 pb-2 uppercase tracking-[0.2em]">Active Policy Selection</h4>
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left border-separate border-spacing-y-2">
                                        <thead>
                                            <tr>
                                                <th className="text-[9px] font-black text-slate-600 dark:text-white uppercase px-4">Promotion Criteria</th>
                                                <th className="text-[9px] font-black text-slate-600 dark:text-white uppercase px-4 text-center">Termly Result</th>
                                                <th className="text-[9px] font-black text-slate-600 dark:text-white uppercase px-4 text-center">Annual Promotion</th>
                                            </tr>
                                        </thead>
                                        <tbody className="space-y-2">
                                            {/* Rule 1 Row */}
                                            <tr className="bg-white dark:bg-slate-950/50 rounded-2xl overflow-hidden">
                                                <td className="p-4 rounded-l-2xl border-y border-l border-slate-200 dark:border-slate-800">
                                                    <div className="flex items-center gap-3">
                                                        <div className="p-2 bg-indigo-500/10 text-indigo-400 rounded-lg"><Calculator size={14} /></div>
                                                        <div>
                                                            <p className="text-xs font-black text-slate-800 dark:text-white uppercase tracking-tight">Rule 1: Performance Avg</p>
                                                            <p className="text-[9px] text-slate-600 dark:text-white italic">Pass mark based on percentage score.</p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="p-4 border-y border-slate-800 text-center">
                                                    <input
                                                        type="radio"
                                                        name="termly_rule"
                                                        checked={promotionRuleForm.data.is_rule1_termly}
                                                        onChange={() => promotionRuleForm.setData({
                                                            ...promotionRuleForm.data,
                                                            is_rule1_termly: true, is_rule2_termly: false, is_rule3_termly: false, is_rule4_termly: false
                                                        })}
                                                        className="w-4 h-4 bg-slate-100 dark:bg-slate-900 border-slate-300 dark:border-slate-700 text-indigo-600 focus:ring-0"
                                                    />
                                                </td>
                                                <td className="p-4 rounded-r-2xl border-y border-r border-slate-800 text-center">
                                                    <input
                                                        type="radio"
                                                        name="annual_rule"
                                                        checked={promotionRuleForm.data.is_rule1_annual}
                                                        onChange={() => promotionRuleForm.setData({
                                                            ...promotionRuleForm.data,
                                                            is_rule1_annual: true, is_rule2_annual: false, is_rule3_annual: false, is_rule4_annual: false
                                                        })}
                                                        className="w-4 h-4 bg-slate-100 dark:bg-slate-900 border-slate-300 dark:border-slate-700 text-indigo-600 focus:ring-0"
                                                    />
                                                </td>
                                            </tr>

                                            {/* Rule 2 Row */}
                                            <tr className="bg-white dark:bg-slate-950/50 rounded-2xl overflow-hidden">
                                                <td className="p-4 rounded-l-2xl border-y border-l border-slate-200 dark:border-slate-800">
                                                    <div className="flex items-center gap-3">
                                                        <div className="p-2 bg-emerald-500/10 text-emerald-400 rounded-lg"><CheckCircle2 size={14} /></div>
                                                        <div>
                                                            <p className="text-xs font-black text-slate-800 dark:text-white uppercase tracking-tight">Rule 2: Core + Passes</p>
                                                            <p className="text-[9px] text-slate-600 dark:text-white italic">Core subjects + min other passes.</p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="p-4 border-y border-slate-800 text-center">
                                                    <input
                                                        type="radio"
                                                        name="termly_rule"
                                                        checked={promotionRuleForm.data.is_rule2_termly}
                                                        onChange={() => promotionRuleForm.setData({
                                                            ...promotionRuleForm.data,
                                                            is_rule1_termly: false, is_rule2_termly: true, is_rule3_termly: false, is_rule4_termly: false
                                                        })}
                                                        className="w-4 h-4 bg-slate-100 dark:bg-slate-900 border-slate-300 dark:border-slate-700 text-emerald-600 focus:ring-0"
                                                    />
                                                </td>
                                                <td className="p-4 rounded-r-2xl border-y border-r border-slate-800 text-center">
                                                    <input
                                                        type="radio"
                                                        name="annual_rule"
                                                        checked={promotionRuleForm.data.is_rule2_annual}
                                                        onChange={() => promotionRuleForm.setData({
                                                            ...promotionRuleForm.data,
                                                            is_rule1_annual: false, is_rule2_annual: true, is_rule3_annual: false, is_rule4_annual: false
                                                        })}
                                                        className="w-4 h-4 bg-slate-100 dark:bg-slate-900 border-slate-300 dark:border-slate-700 text-emerald-600 focus:ring-0"
                                                    />
                                                </td>
                                            </tr>

                                            {/* Rule 3 Row */}
                                            <tr className="bg-white dark:bg-slate-950/50 rounded-2xl overflow-hidden">
                                                <td className="p-4 rounded-l-2xl border-y border-l border-slate-200 dark:border-slate-800">
                                                    <div className="flex items-center gap-3">
                                                        <div className="p-2 bg-rose-500/10 text-rose-400 rounded-lg"><AlertTriangle size={14} /></div>
                                                        <div>
                                                            <p className="text-xs font-black text-slate-800 dark:text-white uppercase tracking-tight">Rule 3: Core + Failure Limit</p>
                                                            <p className="text-[9px] text-slate-600 dark:text-white italic">Core subjects + max allowed fails.</p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="p-4 border-y border-slate-800 text-center">
                                                    <input
                                                        type="radio"
                                                        name="termly_rule"
                                                        checked={promotionRuleForm.data.is_rule3_termly}
                                                        onChange={() => promotionRuleForm.setData({
                                                            ...promotionRuleForm.data,
                                                            is_rule1_termly: false, is_rule2_termly: false, is_rule3_termly: true, is_rule4_termly: false
                                                        })}
                                                        className="w-4 h-4 bg-slate-100 dark:bg-slate-900 border-slate-300 dark:border-slate-700 text-rose-600 focus:ring-0"
                                                    />
                                                </td>
                                                <td className="p-4 rounded-r-2xl border-y border-r border-slate-800 text-center">
                                                    <input
                                                        type="radio"
                                                        name="annual_rule"
                                                        checked={promotionRuleForm.data.is_rule3_annual}
                                                        onChange={() => promotionRuleForm.setData({
                                                            ...promotionRuleForm.data,
                                                            is_rule1_annual: false, is_rule2_annual: false, is_rule3_annual: true, is_rule4_annual: false
                                                        })}
                                                        className="w-4 h-4 bg-slate-100 dark:bg-slate-900 border-slate-300 dark:border-slate-700 text-rose-600 focus:ring-0"
                                                    />
                                                </td>
                                            </tr>
                                            {/* Rule 4 Row */}
                                            <tr className="bg-white dark:bg-slate-950/50 rounded-2xl overflow-hidden">
                                                <td className="p-4 rounded-l-2xl border-y border-l border-slate-200 dark:border-slate-800">
                                                    <div className="flex items-center gap-3">
                                                        <div className="p-2 bg-indigo-500/10 text-indigo-400 rounded-lg"><GraduationCap size={14} /></div>
                                                        <div>
                                                            <p className="text-xs font-black text-slate-800 dark:text-white uppercase tracking-tight">Rule 4: Avg + Core Subjects</p>
                                                            <p className="text-[9px] text-slate-600 dark:text-white italic">Score % requirement AND must pass all core subjects.</p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="p-4 border-y border-slate-800 text-center">
                                                    <input
                                                        type="radio"
                                                        name="termly_rule"
                                                        checked={promotionRuleForm.data.is_rule4_termly}
                                                        onChange={() => promotionRuleForm.setData({
                                                            ...promotionRuleForm.data,
                                                            is_rule1_termly: false, is_rule2_termly: false, is_rule3_termly: false, is_rule4_termly: true
                                                        })}
                                                        className="w-4 h-4 bg-slate-100 dark:bg-slate-900 border-slate-300 dark:border-slate-700 text-indigo-600 focus:ring-0"
                                                    />
                                                </td>
                                                <td className="p-4 rounded-r-2xl border-y border-r border-slate-800 text-center">
                                                    <input
                                                        type="radio"
                                                        name="annual_rule"
                                                        checked={promotionRuleForm.data.is_rule4_annual}
                                                        onChange={() => promotionRuleForm.setData({
                                                            ...promotionRuleForm.data,
                                                            is_rule1_annual: false, is_rule2_annual: false, is_rule3_annual: false, is_rule4_annual: true
                                                        })}
                                                        className="w-4 h-4 bg-slate-100 dark:bg-slate-900 border-slate-300 dark:border-slate-700 text-indigo-600 focus:ring-0"
                                                    />
                                                </td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            {/* Parameters Grid */}
                            <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div className="p-4 bg-white dark:bg-slate-950/50 border border-slate-300 dark:border-slate-800 rounded-2xl space-y-1">
                                    <label className="text-[10px] font-black text-slate-600 dark:text-white uppercase tracking-widest pl-1">Average Score Threshold (Rule 1 & 4)</label>
                                    <input
                                        type="number"
                                        value={promotionRuleForm.data.min_average}
                                        onChange={e => promotionRuleForm.setData('min_average', e.target.value)}
                                        className="w-full bg-slate-50 dark:bg-slate-900 border-slate-300 dark:border-slate-800 text-sm rounded-xl px-4 py-2 focus:border-indigo-500 text-slate-900 dark:text-white"
                                    />
                                    <InputError message={promotionRuleForm.errors.min_average} />
                                </div>
                                <div className="p-4 bg-white dark:bg-slate-950/50 border border-slate-300 dark:border-slate-800 rounded-2xl space-y-1">
                                    <label className="text-[10px] font-black text-amber-500 uppercase tracking-widest pl-1">Trial Avg Threshold (Rule 1 & 4)</label>
                                    <input
                                        type="number"
                                        value={promotionRuleForm.data.trial_min_average}
                                        onChange={e => promotionRuleForm.setData('trial_min_average', e.target.value)}
                                        placeholder="Optional"
                                        className="w-full bg-slate-50 dark:bg-slate-900 border-slate-300 dark:border-slate-800 text-sm rounded-xl px-4 py-2 focus:border-amber-500 text-slate-900 dark:text-white"
                                    />
                                    <InputError message={promotionRuleForm.errors.trial_min_average} />
                                </div>
                                <div className="p-4 bg-white dark:bg-slate-950/50 border border-slate-300 dark:border-slate-800 rounded-2xl space-y-1">
                                    <label className="text-[10px] font-black text-slate-600 dark:text-white uppercase tracking-widest pl-1">Rule 2 Req. Passes</label>
                                    <input
                                        type="number"
                                        value={promotionRuleForm.data.pass_other_subjects_count}
                                        onChange={e => promotionRuleForm.setData('pass_other_subjects_count', e.target.value)}
                                        className="w-full bg-slate-50 dark:bg-slate-900 border-slate-300 dark:border-slate-800 text-sm rounded-xl px-4 py-2 focus:border-emerald-500 text-slate-900 dark:text-white"
                                    />
                                    <InputError message={promotionRuleForm.errors.pass_other_subjects_count} />
                                </div>
                                <div className="p-4 bg-white dark:bg-slate-950/50 border border-slate-300 dark:border-slate-800 rounded-2xl space-y-1">
                                    <label className="text-[10px] font-black text-slate-600 dark:text-white uppercase tracking-widest pl-1">Rule 3 Max Fails</label>
                                    <input
                                        type="number"
                                        value={promotionRuleForm.data.max_failed_subjects}
                                        onChange={e => promotionRuleForm.setData('max_failed_subjects', e.target.value)}
                                        className="w-full bg-slate-50 dark:bg-slate-900 border-slate-300 dark:border-slate-800 text-sm rounded-xl px-4 py-2 focus:border-rose-500 text-slate-900 dark:text-white"
                                    />
                                    <InputError message={promotionRuleForm.errors.max_failed_subjects} />
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center justify-end gap-3 pt-6 border-t border-slate-200 dark:border-slate-800">
                            <SecondaryButton onClick={() => setShowingRuleModal(false)}>Cancel</SecondaryButton>
                            <PrimaryButton type="submit" className="gap-2" disabled={promotionRuleForm.processing}>
                                {promotionRuleForm.processing ? (
                                    <>Processing...</>
                                ) : (
                                    <>
                                        <Save size={18} /> Update Configuration
                                    </>
                                )}
                            </PrimaryButton>
                        </div>
                    </form>
                </div>
            </Modal>
        </AuthenticatedLayout>
    );
}
