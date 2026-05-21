import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, router, Link } from '@inertiajs/react';
import Card from '@/Components/Card';
import PrimaryButton from '@/Components/PrimaryButton';
import { Search, Save, Calculator, User, Hash, BookOpen, Clock, Calendar, GraduationCap, Info, ArrowLeft } from 'lucide-react';
import { toast } from 'react-toastify';
import { useState, useEffect, useRef } from 'react';
import * as XLSX from 'xlsx';

export default function Compilation({ auth, classSections, subjects, students, caConfig, currentSession, currentTerm, filters, sessions }) {
    const { data, setData, post, processing, reset } = useForm({
        academic_session_id: filters.academic_session_id || '',
        term_id: filters.term_id || '',
        class_section_id: filters.class_section_id || '',
        subject_id: filters.subject_id || '',
        results: [],
    });

    const fileInputRef = useRef(null);

    const [availableTerms, setAvailableTerms] = useState([]);

    useEffect(() => {
        if (data.academic_session_id && sessions) {
            const selectedSession = sessions.find(s => s.id == data.academic_session_id);
            setAvailableTerms(selectedSession ? selectedSession.terms : []);
        } else {
            setAvailableTerms([]);
        }
    }, [data.academic_session_id, sessions]);

    // Initialize results array when students are fetched
    useEffect(() => {
        if (students && students.length > 0) {
            const initialResults = students.map(student => {
                const existingResult = student.results && student.results[0];
                return {
                    student_id: student.id,
                    surname: student.surname,
                    othername: student.othername,
                    registration_number: student.registration_number,
                    status: student.status,
                    assessments: caConfig.map(config => {
                        const existingAssessment = existingResult?.assessments?.find(a => a.name === config.name);
                        return {
                            name: config.name,
                            score: existingAssessment ? existingAssessment.score : 0,
                            max_score: config.max_score
                        };
                    }),
                    exam_score: existingResult ? existingResult.exam_score : 0,
                };
            });
            setData('results', initialResults);
        } else {
            setData('results', []);
        }
    }, [students, caConfig]);

    const handleSearch = (e) => {
        e.preventDefault();
        router.get(route('results.compilation'), {
            academic_session_id: data.academic_session_id,
            term_id: data.term_id,
            class_section_id: data.class_section_id,
            subject_id: data.subject_id
        });
    };

    const updateScore = (studentIndex, type, value, assessmentIndex = null) => {
        // ... (unchanged)
        if (parseFloat(value) < 0) return;
        const newResults = [...data.results];
        if (type === 'exam') {
            newResults[studentIndex].exam_score = parseFloat(value) || 0;
        } else if (type === 'ca' && assessmentIndex !== null) {
            newResults[studentIndex].assessments[assessmentIndex].score = parseFloat(value) || 0;
        }
        setData('results', newResults);
    };

    const submit = (e) => {
        e.preventDefault();
        post(route('results.store-bulk'), {
            onSuccess: () => {
                reset();
            },
            onError: () => toast.error('Validation failed. Check scores.'),
        });
    };

    const calculateTotal = (result) => {
        const caTotal = result.assessments.reduce((sum, a) => sum + (parseFloat(a.score) || 0), 0);
        return caTotal + (parseFloat(result.exam_score) || 0);
    };

    const exportTemplate = () => {
        if (!data.results || data.results.length === 0) {
            toast.warning('No students to export.');
            return;
        }

        const selectedSubject = subjects.find(s => s.id == data.subject_id);
        const selectedClass = classSections.find(cs => cs.id == data.class_section_id);

        // Header Structure: [Reg No, Surname, Othername, ...CA Names, Exam]
        const header = ['Registration Number', 'Surname', 'Othername'];
        caConfig.forEach(config => header.push(config.name));
        header.push('Exam Score');

        const rows = data.results.map(student => {
            const row = [student.registration_number, student.surname, student.othername];
            student.assessments.forEach(a => row.push(a.score || 0));
            row.push(student.exam_score || 0);
            return row;
        });

        const worksheet = XLSX.utils.aoa_to_sheet([header, ...rows]);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Results');

        const fileName = `${selectedClass?.school_class?.name || 'Class'}_${selectedSubject?.name || 'Subject'}_Scores.xlsx`;
        XLSX.writeFile(workbook, fileName);
        toast.info('Template downloaded.');
    };

    const handleImport = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (evt) => {
            try {
                const bstr = evt.target.result;
                const wb = XLSX.read(bstr, { type: 'binary' });
                const wsname = wb.SheetNames[0];
                const ws = wb.Sheets[wsname];
                const rows = XLSX.utils.sheet_to_json(ws);

                if (rows.length === 0) {
                    toast.error('The uploaded file is empty.');
                    return;
                }

                const newResults = [...data.results];
                let matchCount = 0;

                rows.forEach(row => {
                    const regNo = row['Registration Number'] || row['registration_number'] || row['Reg No'];
                    if (!regNo) return;

                    const studentIdx = newResults.findIndex(r => r.registration_number.toString().trim() === regNo.toString().trim());
                    if (studentIdx !== -1) {
                        matchCount++;
                        // Map CA scores
                        newResults[studentIdx].assessments = newResults[studentIdx].assessments.map(a => {
                            const importedScore = row[a.name];
                            return {
                                ...a,
                                score: importedScore !== undefined ? parseFloat(importedScore) || 0 : a.score
                            };
                        });
                        // Map Exam score
                        const examScore = row['Exam Score'] || row['exam_score'] || row['Exam'];
                        if (examScore !== undefined) {
                            newResults[studentIdx].exam_score = parseFloat(examScore) || 0;
                        }
                    }
                });

                if (matchCount > 0) {
                    setData('results', newResults);
                    toast.success(`Successfully matched and imported ${matchCount} student scores.`);
                } else {
                    toast.warning('No matching students found in the file. Please ensure Registration Numbers are correct.');
                }
            } catch (err) {
                console.error(err);
                toast.error('Error parsing Excel file. Ensure it follows the template format.');
            }
            e.target.value = null; // Reset file input
        };
        reader.readAsBinaryString(file);
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex flex-col gap-4">
                    <div className="flex items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                            <Link
                                href={route('results.management')}
                                className="w-10 h-10 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-center text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all shadow-sm hover:shadow-md"
                                title="Back to Dashboard"
                            >
                                <ArrowLeft size={20} />
                            </Link>
                            <div>
                                <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Academic Compiler</h2>
                                <p className="text-slate-500 dark:text-slate-400 text-sm">Bulk entry interface for subject results.</p>
                            </div>
                        </div>
                        <div className="flex gap-2">
                            {/* Optional Header Actions */}
                        </div>
                    </div>

                    {/* Filters Bar */}
                    <Card className="!p-4 bg-indigo-50/50 dark:bg-slate-900/50 border-indigo-100 dark:border-slate-800">
                        <form onSubmit={handleSearch} className="grid grid-cols-1 md:grid-cols-5 gap-3 items-end">
                            <div className="space-y-1">
                                <label className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest flex items-center gap-1.5"><Calendar size={10} /> Session</label>
                                <select
                                    value={data.academic_session_id}
                                    onChange={e => setData('academic_session_id', e.target.value)}
                                    className="w-full h-10 bg-white dark:bg-slate-900 border-indigo-200 dark:border-slate-700 text-slate-900 dark:text-slate-200 text-xs rounded-lg focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 shadow-sm"
                                >
                                    <option value="">Select Session</option>
                                    {sessions && sessions.map(s => (
                                        <option key={s.id} value={s.id}>{s.name} {s.is_current ? '(Active)' : ''}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="space-y-1">
                                <label className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest flex items-center gap-1.5"><Clock size={10} /> Term</label>
                                <select
                                    value={data.term_id}
                                    onChange={e => setData('term_id', e.target.value)}
                                    className="w-full h-10 bg-white dark:bg-slate-900 border-indigo-200 dark:border-slate-700 text-slate-900 dark:text-slate-200 text-xs rounded-lg focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 shadow-sm"
                                    disabled={!data.academic_session_id}
                                >
                                    <option value="">Select Term</option>
                                    {availableTerms.map(t => (
                                        <option key={t.id} value={t.id}>{t.name} {t.is_current ? '(Active)' : ''}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="space-y-1">
                                <label className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest flex items-center gap-1.5"><GraduationCap size={10} /> Class Section</label>
                                <select
                                    value={data.class_section_id}
                                    onChange={e => setData('class_section_id', e.target.value)}
                                    className="w-full h-10 bg-white dark:bg-slate-900 border-indigo-200 dark:border-slate-700 text-slate-900 dark:text-slate-200 text-xs rounded-lg focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 shadow-sm"
                                >
                                    <option value="">Select Class</option>
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
                                <label className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest flex items-center gap-1.5"><BookOpen size={10} /> Subject</label>
                                <select
                                    value={data.subject_id}
                                    onChange={e => setData('subject_id', e.target.value)}
                                    className="w-full h-10 bg-white dark:bg-slate-900 border-indigo-200 dark:border-slate-700 text-slate-900 dark:text-slate-200 text-xs rounded-lg focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 shadow-sm"
                                >
                                    <option value="">Select Subject</option>
                                    {(data.class_section_id
                                        ? (classSections.find(cs => cs.id == data.class_section_id)?.subjects?.length > 0
                                            ? classSections.find(cs => cs.id == data.class_section_id).subjects
                                            : subjects)
                                        : subjects
                                    ).map(s => (
                                        <option key={s.id} value={s.id}>{s.name}</option>
                                    ))}
                                </select>
                            </div>
                            <PrimaryButton
                                type="submit"
                                disabled={!data.class_section_id || !data.subject_id}
                                className="h-10 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg px-6 font-bold text-xs uppercase tracking-wider shadow-lg shadow-indigo-500/30 transition-all flex items-center justify-center gap-2"
                            >
                                <Search size={14} /> Fetch Sheet
                            </PrimaryButton>
                        </form>
                    </Card>
                    <div className="flex items-center gap-3">
                        {currentSession && (
                            <div className="hidden md:flex flex-col items-end">
                                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Active Session</span>
                                <div className="flex items-center gap-2 px-3 py-1 bg-indigo-500/10 border border-indigo-500/20 rounded-lg">
                                    <Calendar size={12} className="text-indigo-400" />
                                    <span className="text-xs font-bold text-indigo-300">{currentSession.name}</span>
                                </div>
                            </div>
                        )}
                        {currentTerm && (
                            <div className="hidden md:flex flex-col items-end">
                                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Current Term</span>
                                <div className="flex items-center gap-2 px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-lg">
                                    <Clock size={12} className="text-emerald-400" />
                                    <span className="text-xs font-bold text-emerald-300">{currentTerm.name}</span>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            }
        >
            <Head title="Result Entry" />

            <div className="space-y-8">


                {/* Entry Form */}
                {data.results.length > 0 ? (
                    <form onSubmit={submit}>
                        <Card
                            title="Score Compilation"
                            description={`Entering marks for ${data.results.length} students.`}
                            actions={
                                <div className="flex flex-wrap gap-2">
                                    <input
                                        type="file"
                                        ref={fileInputRef}
                                        onChange={handleImport}
                                        accept=".xlsx, .xls, .csv"
                                        className="hidden"
                                    />
                                    <button
                                        type="button"
                                        onClick={exportTemplate}
                                        className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-200 dark:border-indigo-500/20 text-indigo-600 dark:text-indigo-400 rounded-xl text-xs font-bold hover:bg-indigo-100 dark:hover:bg-indigo-500/20 transition-all shadow-sm"
                                    >
                                        <Calendar size={14} /> Download Template
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => fileInputRef.current?.click()}
                                        className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 text-emerald-600 dark:text-emerald-400 rounded-xl text-xs font-bold hover:bg-emerald-100 dark:hover:bg-emerald-500/20 transition-all shadow-sm"
                                    >
                                        <Hash size={14} /> Import Scores
                                    </button>
                                    <PrimaryButton disabled={processing} className="gap-2 !rounded-xl">
                                        <Save size={18} /> Save Records
                                    </PrimaryButton>
                                </div>
                            }
                        >
                            <div className="overflow-x-auto -mx-6">
                                <table className="w-full text-left border-collapse min-w-[800px]">
                                    <thead>
                                        <tr className="border-b border-slate-200 dark:border-slate-800/50">
                                            <th className="px-6 py-4 text-[10px] font-bold text-slate-700 dark:text-slate-400 uppercase tracking-widest">Student</th>
                                            {caConfig.map((config, idx) => (
                                                <th key={idx} className="px-4 py-4 text-[10px] font-bold text-slate-700 dark:text-slate-400 uppercase tracking-widest text-center">
                                                    {config.name} <br /> <span className="text-[8px] text-slate-600 dark:text-slate-500">Max: {config.max_score}</span>
                                                </th>
                                            ))}
                                            <th className="px-4 py-4 text-[10px] font-bold text-slate-700 dark:text-slate-400 uppercase tracking-widest text-center">Exam <br /> <span className="text-[8px] text-slate-600 dark:text-slate-500">Max: {100 - caConfig.reduce((s, c) => s + parseInt(c.max_score), 0)}</span></th>
                                            <th className="px-4 py-4 text-[10px] font-bold text-slate-700 dark:text-slate-400 uppercase tracking-widest text-center">Total (100)</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-200 dark:divide-slate-800/30">
                                        {data.results.map((result, sIdx) => (
                                            <tr key={result.student_id} className="group hover:bg-slate-50 dark:hover:bg-slate-800/20 transition-colors">
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-center text-slate-400 dark:text-slate-500">
                                                            <User size={14} />
                                                        </div>
                                                        <div>
                                                            <p className="text-xs font-bold text-slate-800 dark:text-slate-200 tracking-tight">
                                                                {result.surname} {result.othername}
                                                                {result.status === 'inactive' && (
                                                                    <span className="ml-2 text-[8px] uppercase font-bold text-rose-500 bg-rose-50 dark:bg-rose-500/10 px-1 py-0.5 rounded">Inactive</span>
                                                                )}
                                                            </p>
                                                            <p className="text-[9px] font-mono text-slate-600 dark:text-slate-500">{result.registration_number}</p>
                                                        </div>
                                                    </div>
                                                </td>
                                                {result.assessments.map((a, aIdx) => (
                                                    <td key={aIdx} className="px-4 py-4">
                                                        <input
                                                            type="number"
                                                            min="0"
                                                            step="0.01"
                                                            max={a.max_score}
                                                            value={a.score}
                                                            onChange={e => updateScore(sIdx, 'ca', e.target.value, aIdx)}
                                                            className="w-16 mx-auto block bg-slate-50 dark:bg-slate-950 border-slate-300 dark:border-slate-800 text-xs text-center rounded-lg focus:border-indigo-500 transition-all p-1.5 font-mono text-slate-900 dark:text-white"
                                                        />
                                                    </td>
                                                ))}
                                                <td className="px-4 py-4">
                                                    <input
                                                        type="number"
                                                        min="0"
                                                        step="0.01"
                                                        value={result.exam_score}
                                                        onChange={e => updateScore(sIdx, 'exam', e.target.value)}
                                                        className="w-16 mx-auto block bg-slate-50 dark:bg-slate-950 border-slate-300 dark:border-slate-800 text-xs text-center rounded-lg focus:border-indigo-500 transition-all p-1.5 font-mono text-slate-900 dark:text-white"
                                                    />
                                                </td>
                                                <td className="px-4 py-4 text-center">
                                                    <span className={`text-xs font-black px-2.5 py-1 rounded-lg border ${calculateTotal(result) >= 50 ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border-rose-500/20'}`}>
                                                        {calculateTotal(result).toFixed(1)}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </Card>
                    </form>
                ) : (
                    <div className="flex flex-col items-center justify-center py-24 text-center space-y-4 bg-slate-50 dark:bg-slate-900/30 border border-dashed border-slate-300 dark:border-slate-800/50 rounded-[3rem]">
                        <div className="w-16 h-16 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 flex items-center justify-center text-slate-400 dark:text-slate-600 mx-auto transition-transform hover:scale-105 shadow-sm">
                            <Calculator size={32} />
                        </div>
                        <div className="space-y-1">
                            <h3 className="text-slate-800 dark:text-slate-300 font-bold text-xl">
                                {!!(filters.academic_session_id || filters.term_id || filters.class_section_id || filters.subject_id) ? 'No Records Found' : 'Search Instructions'}
                            </h3>
                            <p className="text-slate-500 text-sm max-w-sm mx-auto leading-relaxed italic">
                                {!!(filters.academic_session_id || filters.term_id || filters.class_section_id || filters.subject_id)
                                    ? "We couldn't find any active students matching your selected criteria. Please verify the enrollment and class assignments."
                                    : "Select an academic session, term, class section, and subject above, then click 'Fetch Students' to begin score compilation."
                                }
                            </p>
                        </div>
                    </div>
                )}
            </div>
        </AuthenticatedLayout >
    );
}
