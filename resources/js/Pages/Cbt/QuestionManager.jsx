import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, Link, router } from '@inertiajs/react';
import Card from '@/Components/Card';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import TextInput from '@/Components/TextInput';
import InputLabel from '@/Components/InputLabel';
import InputError from '@/Components/InputError';
import Modal from '@/Components/Modal';
import { Plus, ArrowLeft, Trash, Save, Upload, FileSpreadsheet, CheckCircle, XCircle, Download, Edit } from 'lucide-react';
import { useState, useEffect } from 'react';
import Swal from 'sweetalert2';

export default function QuestionManager({ auth, exam }) {
    const [showAddModal, setShowAddModal] = useState(false);
    const [showBulkUploadModal, setShowBulkUploadModal] = useState(false);
    const [editingQuestion, setEditingQuestion] = useState(null);

    // Form for Single Question
    const { data, setData, post, put, processing, errors, reset } = useForm({
        question_text: '',
        question_type: 'single_choice', // single_choice, multi_choice, theory
        points: 1,
        options: [
            { id: 'A', text: '' },
            { id: 'B', text: '' },
            { id: 'C', text: '' },
            { id: 'D', text: '' }
        ],
        correct_answer: [] // Array of option IDs e.g. ['A']
    });

    // Enforce single choice constraint when switching types
    useEffect(() => {
        if (data.question_type === 'single_choice' && data.correct_answer.length > 1) {
            setData('correct_answer', [data.correct_answer[0]]);
        }
    }, [data.question_type]);

    // Form for Bulk Upload
    const bulkForm = useForm({
        file: null
    });

    const openAddModal = () => {
        setEditingQuestion(null);
        reset();
        setShowAddModal(true);
    };

    const openEditModal = (q) => {
        setEditingQuestion(q);
        setData({
            question_text: q.question_text,
            question_type: 'single_choice',
            points: q.points,
            options: q.options || [],
            correct_answer: Array.isArray(q.correct_answer) ? q.correct_answer : [q.correct_answer]
        });
        setShowAddModal(true);
    };

    const submitQuestion = (e) => {
        e.preventDefault();

        if (editingQuestion) {
            put(route('cbt.exams.questions.update', editingQuestion.id), {
                onSuccess: () => {
                    setShowAddModal(false);
                    reset();
                    setEditingQuestion(null);
                }
            });
        } else {
            post(route('cbt.exams.questions.store', exam.id), {
                onSuccess: () => {
                    setShowAddModal(false);
                    reset();
                }
            });
        }
    };

    const submitBulk = (e) => {
        e.preventDefault();
        bulkForm.post(route('cbt.exams.questions.bulk-upload', exam.id), {
            onSuccess: () => {
                setShowBulkUploadModal(false);
                bulkForm.reset();
            }
        });
    };

    const handleOptionChange = (idx, val) => {
        const newOptions = [...data.options];
        newOptions[idx].text = val;
        setData('options', newOptions);
    };

    const toggleCorrectAnswer = (optionId) => {
        let newCorrect = [...data.correct_answer];
        if (data.question_type === 'single_choice') {
            newCorrect = [optionId];
        } else {
            if (newCorrect.includes(optionId)) {
                newCorrect = newCorrect.filter(id => id !== optionId);
            } else {
                newCorrect.push(optionId);
            }
        }
        setData('correct_answer', newCorrect);
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex justify-between items-center">
                    <div className="flex items-center gap-4">
                        <Link href={route('cbt.exams.index')} className="p-2 bg-white dark:bg-slate-800 rounded-lg hover:text-indigo-500 transition-colors">
                            <ArrowLeft size={20} />
                        </Link>
                        <div>
                            <h2 className="text-xl font-bold text-slate-800 dark:text-white">Question Manager</h2>
                            <p className="text-sm text-slate-500">{exam.title} • {exam.subject?.name || 'General Subject'} • {exam.questions?.length || 0} Questions</p>
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <SecondaryButton onClick={() => setShowBulkUploadModal(true)} className="gap-2">
                            <Upload size={18} /> Bulk Upload
                        </SecondaryButton>
                        <PrimaryButton onClick={openAddModal} className="gap-2">
                            <Plus size={18} /> Add Question
                        </PrimaryButton>
                    </div>
                </div>
            }
        >
            <Head title={`Questions - ${exam.title}`} />

            <div className="space-y-6">
                <div className="grid grid-cols-1 gap-4">
                    {exam.questions && exam.questions.length > 0 ? (
                        exam.questions.map((q, index) => (
                            <Card key={q.id} className="relative group">
                                <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button
                                        className="p-2 text-slate-400 hover:text-indigo-500"
                                        onClick={() => openEditModal(q)}
                                        title="Edit Question"
                                    >
                                        <Edit size={16} />
                                    </button>
                                    <button
                                        className="p-2 text-slate-400 hover:text-red-500"
                                        onClick={() => {
                                            Swal.fire({
                                                title: 'Delete Question?',
                                                text: "This action cannot be undone!",
                                                icon: 'warning',
                                                showCancelButton: true,
                                                confirmButtonColor: '#d33',
                                                cancelButtonColor: '#3085d6',
                                                confirmButtonText: 'Yes, delete it!'
                                            }).then((result) => {
                                                if (result.isConfirmed) {
                                                    router.delete(route('cbt.exams.questions.destroy', q.id));
                                                }
                                            });
                                        }}
                                        title="Delete Question"
                                    >
                                        <Trash size={16} />
                                    </button>
                                </div>
                                <div className="flex gap-4">
                                    <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold shrink-0">
                                        {index + 1}
                                    </div>
                                    <div className="flex-1">
                                        <div className="prose dark:prose-invert max-w-none mb-4" dangerouslySetInnerHTML={{ __html: q.question_text }} />

                                        {q.question_type !== 'theory' && (
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                                {q.options.map((opt) => {
                                                    const isCorrect = Array.isArray(q.correct_answer)
                                                        ? q.correct_answer.includes(opt.id)
                                                        : q.correct_answer === opt.id;

                                                    return (
                                                        <div key={opt.id} className={`flex items-center gap-3 p-3 rounded-lg border ${isCorrect ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20' : 'border-slate-200 dark:border-slate-700'}`}>
                                                            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold border ${isCorrect ? 'bg-emerald-500 text-white border-emerald-500' : 'text-slate-500 border-slate-300'}`}>
                                                                {opt.id}
                                                            </div>
                                                            <span className={isCorrect ? 'font-medium text-emerald-700 dark:text-emerald-400' : ''}>{opt.text}</span>
                                                            {isCorrect && <CheckCircle size={16} className="ml-auto text-emerald-500" />}
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        )}

                                        <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-between text-xs text-slate-500">
                                            <span className="capitalize bg-slate-100 px-2 py-1 rounded">{q.question_type.replace('_', ' ')}</span>
                                            <span>{q.points} Points</span>
                                        </div>
                                    </div>
                                </div>
                            </Card>
                        ))
                    ) : (
                        <div className="text-center py-12 text-slate-500 bg-white rounded-xl border border-dashed border-slate-300">
                            <p>No questions added yet.</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Add/Edit Question Modal */}
            <Modal show={showAddModal} onClose={() => setShowAddModal(false)} maxWidth="2xl">
                <div className="p-6">
                    <h2 className="text-lg font-bold text-slate-900 mb-4">{editingQuestion ? 'Edit Question' : 'Add Question'}</h2>
                    <form onSubmit={submitQuestion} className="space-y-4">
                        <div>
                            <InputLabel value="Question Text" />
                            <textarea
                                value={data.question_text}
                                onChange={e => setData('question_text', e.target.value)}
                                className="w-full border-slate-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 p-2"
                                rows="3"
                                placeholder="Type question here..."
                            />
                            <InputError message={errors.question_text} />
                        </div>

                        {/* Question Type Hidden or Readonly (Forced Single Choice) */}
                        <div className="hidden">
                            <input type="hidden" value="single_choice" />
                        </div>

                        <div>
                            <InputLabel value="Points" />
                            <TextInput
                                type="number"
                                value={data.points}
                                onChange={e => setData('points', e.target.value)}
                                className="w-full"
                            />
                        </div>

                        <div className="space-y-3">
                            <InputLabel value="Options (Click circle to select Correct Answer)" />
                            {data.options.map((opt, idx) => (
                                <div key={idx} className="flex gap-2 items-center">
                                    <button
                                        type="button"
                                        onClick={() => toggleCorrectAnswer(opt.id)}
                                        className={`w-8 h-8 rounded-full flex items-center justify-center font-bold border shrink-0 transition-colors ${data.correct_answer.includes(opt.id)
                                            ? 'bg-emerald-500 border-emerald-500 text-white'
                                            : 'bg-white border-slate-300 text-slate-500 hover:border-indigo-500'
                                            }`}
                                        title="Mark as correct"
                                    >
                                        {opt.id}
                                    </button>
                                    <TextInput
                                        value={opt.text}
                                        onChange={e => handleOptionChange(idx, e.target.value)}
                                        className="flex-1"
                                        placeholder={`Option ${opt.id}`}
                                        required
                                    />
                                </div>
                            ))}
                            {data.correct_answer.length === 0 && (
                                <p className="text-sm text-red-500 font-bold">Please select the correct answer by clicking the option letter (A, B, C, D).</p>
                            )}
                        </div>

                        <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                            <SecondaryButton onClick={() => setShowAddModal(false)}>Cancel</SecondaryButton>
                            <PrimaryButton disabled={processing || data.correct_answer.length === 0}>
                                {editingQuestion ? 'Update Question' : 'Save Question'}
                            </PrimaryButton>
                        </div>
                    </form>
                </div>
            </Modal>

            {/* Bulk Upload Modal */}
            <Modal show={showBulkUploadModal} onClose={() => setShowBulkUploadModal(false)} maxWidth="lg">
                <div className="p-6 text-center">
                    <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4 text-indigo-600">
                        <FileSpreadsheet size={24} />
                    </div>
                    <h2 className="text-lg font-bold text-slate-900 mb-2">Bulk Upload Questions (CSV)</h2>
                    <div className="text-left mb-6 bg-slate-50 dark:bg-slate-800 p-4 rounded-lg border border-slate-200 dark:border-slate-700">
                        <p className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">Expected CSV Layout:</p>
                        <div className="overflow-x-auto">
                            <table className="w-full text-xs text-slate-600 dark:text-slate-400">
                                <thead>
                                    <tr className="border-b border-slate-200 dark:border-slate-700">
                                        <th className="py-1 px-2">Question</th>
                                        <th className="py-1 px-2">A</th>
                                        <th className="py-1 px-2">B</th>
                                        <th className="py-1 px-2">C</th>
                                        <th className="py-1 px-2">D</th>
                                        <th className="py-1 px-2">Correct</th>
                                        <th className="py-1 px-2">Points</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        <td className="py-1 px-2 italic">What is 2+2?</td>
                                        <td className="py-1 px-2 italic">1</td>
                                        <td className="py-1 px-2 italic">2</td>
                                        <td className="py-1 px-2 italic">3</td>
                                        <td className="py-1 px-2 italic">4</td>
                                        <td className="py-1 px-2 italic">D</td>
                                        <td className="py-1 px-2 italic">1</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                        <div className="flex justify-between items-center mt-3">
                            <p className="text-[10px] text-slate-500 italic">* Only 'Single Choice' questions supported. 'Correct' must be A, B, C, or D.</p>
                            <a
                                href={route('cbt.questions.download-sample')}
                                className="inline-flex items-center gap-1 text-xs font-bold text-indigo-600 hover:text-indigo-800 hover:underline transition-colors"
                            >
                                <Download size={14} /> Download Sample Template
                            </a>
                        </div>
                    </div>

                    <form onSubmit={submitBulk} className="space-y-4">
                        <input
                            type="file"
                            onChange={e => bulkForm.setData('file', e.target.files[0])}
                            className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                            accept=".csv, .txt"
                        />
                        {bulkForm.errors.file && <div className="text-red-500 text-sm">{bulkForm.errors.file}</div>}

                        <div className="flex justify-center gap-3 pt-4">
                            <SecondaryButton onClick={() => setShowBulkUploadModal(false)}>Cancel</SecondaryButton>
                            <PrimaryButton disabled={bulkForm.processing}>Upload & Import</PrimaryButton>
                        </div>
                    </form>
                </div>
            </Modal>
        </AuthenticatedLayout>
    );
}
