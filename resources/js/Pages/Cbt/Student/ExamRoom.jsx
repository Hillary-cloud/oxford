import { Head, router, usePage } from '@inertiajs/react';
import { Clock, Wifi, WifiOff, Save, CheckCircle, ChevronLeft, ChevronRight, Menu, HelpCircle, AlertCircle, Maximize, Minimize, UserCircle, Lock, X } from 'lucide-react';
import axios from 'axios';
import Swal from 'sweetalert2';
import { useEffect, useRef, useState } from 'react';

export default function ExamRoom({ auth, exam, questions, attempt, student }) {
    // --- State ---
    const [currentIndex, setCurrentIndex] = useState(0);
    const [answers, setAnswers] = useState({}); // { question_id: answer }
    const [timeLeft, setTimeLeft] = useState(attempt.remaining_seconds || 0);
    const [isOnline, setIsOnline] = useState(navigator.onLine);
    const [syncStatus, setSyncStatus] = useState('synced'); // synced, syncing, error
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showPalette, setShowPalette] = useState(false); // Mobile toggle
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [hasStarted, setHasStarted] = useState(false); // Force explicit start for fullscreen

    // Obfuscation Key (Simple session-based)
    const STORAGE_KEY = `cbt_attempt_${attempt.id}`;

    // --- Handlers ---
    const startExamSession = () => {
        // Request Fullscreen
        const elem = document.documentElement;
        if (elem.requestFullscreen) {
            elem.requestFullscreen().catch(err => {
                console.error(`Error attempting to enable fullscreen: ${err.message}`);
            });
        }
        setHasStarted(true);
    };

    // --- Refs ---
    // --- Refs ---
    const timerRef = useRef(null);
    const saveIntervalRef = useRef(null);
    const answersRef = useRef(answers);
    const timeLeftRef = useRef(timeLeft);

    // Keep answersRef synced with state
    useEffect(() => {
        answersRef.current = answers;
    }, [answers]);

    useEffect(() => {
        timeLeftRef.current = timeLeft;
    }, [timeLeft]);

    // --- Sync Logic ---
    const syncProgress = async () => {
        if (!navigator.onLine) {
            setSyncStatus('error');
            return;
        }
        setSyncStatus('syncing');
        try {
            await axios.post(route('student.cbt.sync', exam.id), {
                attempt_id: attempt.id,
                remaining_seconds: timeLeftRef.current,
                data_snapshot: answersRef.current
            });
            setSyncStatus('synced');
        } catch (error) {
            console.error("Sync failed", error);
            setSyncStatus('error');
        }
    };

    // --- Initialization ---
    useEffect(() => {
        const handleFsChange = () => setIsFullscreen(!!document.fullscreenElement);
        document.addEventListener('fullscreenchange', handleFsChange);

        const localData = localStorage.getItem(STORAGE_KEY);
        if (localData) {
            try {
                const parsed = JSON.parse(atob(localData));
                setAnswers(parsed.answers || {});
                // Ref will sync via effect
            } catch (e) {
                console.error("Failed to load local data", e);
            }
        } else if (attempt.data_snapshot) {
            setAnswers(attempt.data_snapshot || {});
        }

        window.addEventListener('online', () => setIsOnline(true));
        window.addEventListener('offline', () => setIsOnline(false));

        timerRef.current = setInterval(() => {
            setTimeLeft(prev => {
                if (prev <= 0) {
                    submitExam(true); // Auto submit
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        saveIntervalRef.current = setInterval(syncProgress, 30000);

        return () => {
            clearInterval(timerRef.current);
            clearInterval(saveIntervalRef.current);
            window.removeEventListener('online', () => setIsOnline(true));
            window.removeEventListener('offline', () => setIsOnline(false));
        };
    }, []);

    // --- Persistence (Auto-Save to LocalStorage) ---
    useEffect(() => {
        const payload = JSON.stringify({
            answers,
            timestamp: Date.now()
        });
        localStorage.setItem(STORAGE_KEY, btoa(payload));
    }, [answers]);

    // --- Handlers ---
    const handleAnswer = (val) => {
        const qId = questions[currentIndex].id;

        // Force single choice logic
        setAnswers(prev => {
            return { ...prev, [qId]: val };
        });
    };

    const submitExam = (auto = false) => {
        if (isSubmitting) return;

        const proceedSubmission = () => {
            setIsSubmitting(true);
            clearInterval(timerRef.current);
            clearInterval(saveIntervalRef.current);

            // Use ref to get latest answers even in closure
            const finalAnswers = answersRef.current;

            const formattedAnswers = Object.entries(finalAnswers).map(([qId, ans]) => ({
                question_id: qId,
                answer: ans
            }));

            router.post(route('student.cbt.submit', exam.id), {
                attempt_id: attempt.id,
                answers: formattedAnswers
            }, {
                onSuccess: () => {
                    localStorage.removeItem(STORAGE_KEY);
                },
                onError: (errors) => {
                    console.error("Submission Error:", errors);
                    setIsSubmitting(false);
                    let errorMessage = 'Submission failed. Please try again.';
                    if (errors && typeof errors === 'object') {
                        errorMessage = Object.values(errors).flat().join('\n') || errorMessage;
                    }

                    Swal.fire({
                        title: 'Error!',
                        text: errorMessage + ' (Check console for details)',
                        icon: 'error'
                    });
                }
            });
        };

        if (auto) {
            proceedSubmission();
        } else {
            Swal.fire({
                title: 'Submit Exam?',
                text: "You are about to submit your exam. This action cannot be undone.",
                icon: 'question',
                showCancelButton: true,
                confirmButtonColor: '#10b981',
                cancelButtonColor: '#ef4444',
                confirmButtonText: 'Yes, Submit!',
                cancelButtonText: 'Keep Checking'
            }).then((result) => {
                if (result.isConfirmed) {
                    proceedSubmission();
                }
            });
        }
    };

    // --- Helpers ---
    const formatTime = (seconds) => {
        const h = Math.floor(seconds / 3600);
        const m = Math.floor((seconds % 3600) / 60);
        const s = seconds % 60;
        return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    };

    const currentQ = questions[currentIndex];
    const isAnswered = (idx) => {
        const qId = questions[idx].id;
        const ans = answers[qId];
        return ans && (Array.isArray(ans) ? ans.length > 0 : true);
    };

    const getAnsweredCount = () => {
        return questions.filter((_, idx) => isAnswered(idx)).length;
    };

    // --- Empty Questions State ---
    if (questions.length === 0) {
        return (
            <div className="h-screen w-screen flex flex-col items-center justify-center bg-slate-900 text-white p-6">
                <Head title="No Questions" />
                <div className="max-w-md w-full text-center space-y-6">
                    <div className="w-20 h-20 bg-amber-500 rounded-2xl flex items-center justify-center mx-auto shadow-xl shadow-amber-500/30">
                        <AlertCircle size={40} className="text-white" />
                    </div>
                    <h1 className="text-2xl font-bold">No Questions Found</h1>
                    <p className="text-slate-400">
                        This exam does not have any questions yet. Please contact your subject teacher or administrator.
                    </p>
                    <button
                        onClick={() => router.get(route('student.cbt.index'))}
                        className="w-full py-3 bg-white text-slate-900 font-bold rounded-xl transition-all hover:bg-slate-200"
                    >
                        Return to Dashboard
                    </button>
                </div>
            </div>
        );
    }

    // --- Start Overlay ---
    if (!hasStarted) {
        return (
            <div className="h-screen w-screen flex flex-col items-center justify-center bg-slate-950 text-white p-6 relative overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-900/40 via-slate-950 to-slate-950"></div>

                <Head title={`Start Exam: ${exam.title}`} />
                <div className="max-w-md w-full text-center space-y-8 relative z-10">
                    <div className="w-24 h-24 bg-indigo-600 rounded-3xl flex items-center justify-center mx-auto shadow-2xl shadow-indigo-500/30 ring-4 ring-indigo-500/20 animate-pulse">
                        <Lock size={48} className="text-white" />
                    </div>
                    <div>
                        <h1 className="text-4xl font-bold mb-3 tracking-tight">Exam Locked</h1>
                        <p className="text-slate-400 text-lg">
                            You are about to enter a secure exam environment.
                        </p>
                    </div>

                    <div className="bg-slate-900/50 backdrop-blur-md rounded-2xl p-6 border border-slate-800 text-left space-y-3">
                        <div className="flex items-center gap-3 text-slate-300">
                            <Clock size={18} className="text-indigo-400" />
                            <span>Duration: <span className="font-bold text-white">{exam.duration_minutes} minutes</span></span>
                        </div>
                        <div className="flex items-center gap-3 text-slate-300">
                            <HelpCircle size={18} className="text-indigo-400" />
                            <span>Questions: <span className="font-bold text-white">{questions.length}</span></span>
                        </div>
                        <div className="flex items-center gap-3 text-slate-300">
                            <Maximize size={18} className="text-indigo-400" />
                            <span>Mode: <span className="font-bold text-white">Fullscreen</span></span>
                        </div>
                    </div>

                    <button
                        onClick={startExamSession}
                        className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-2xl text-lg shadow-xl shadow-indigo-600/20 transition-all transform hover:scale-[1.02] active:scale-[0.98] ring-offset-2 ring-offset-slate-950 focus:ring-2 focus:ring-indigo-600"
                    >
                        Enter Exam Room
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="h-screen flex flex-col lg:flex-row bg-gray-400 dark:bg-slate-900 overflow-hidden font-sans">
            <Head title={`Exam: ${exam.title}`} />

            {/* Left Panel: Main Workspace (Questions) */}
            <main className="flex-1 flex flex-col h-full overflow-hidden relative z-0">
                {/* Header (Mobile Only) */}
                <header className="lg:hidden h-16 bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between px-4 z-20 shrink-0">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold text-sm shadow-lg shadow-indigo-500/30">
                            Q
                        </div>
                        <h1 className="font-bold text-slate-800 dark:text-white truncate max-w-[150px]">{exam.title}</h1>
                    </div>

                    <div className="flex items-center gap-2">
                        <div className={`px-2 py-1 rounded-md font-mono font-bold text-sm border ${timeLeft < 300 ? 'bg-red-50 text-red-600 border-red-200' : 'bg-slate-100 text-slate-700 border-slate-200'}`}>
                            {formatTime(timeLeft)}
                        </div>
                        <button onClick={() => setShowPalette(!showPalette)} className="p-2 text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-700 rounded-lg">
                            <Menu size={20} />
                        </button>
                    </div>
                </header>

                {/* Progress Bar */}
                <div className="h-1 w-full bg-slate-200 dark:bg-slate-700">
                    <div
                        className="h-full bg-indigo-600 transition-all duration-300 ease-out"
                        style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
                    ></div>
                </div>

                {/* Question Area - Split Layout Container */}
                <div className="flex-1 flex flex-col lg:flex-row overflow-hidden bg-slate-50/50 dark:bg-slate-900/50 relative">

                    {/* Left Pane: Question Text */}
                    <div className="flex-1 lg:w-1/2 overflow-y-auto p-6 lg:p-8 scrollbar-thin scrollbar-thumb-slate-300 dark:scrollbar-thumb-slate-600 border-r border-slate-200 dark:border-slate-700/50">
                        <div className="max-w-3xl mx-auto min-h-full flex flex-col">
                            {/* Question Card */}
                            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden mb-6 relative">
                                {/* Colorful Top Accent */}
                                <div className="h-1.5 w-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500"></div>

                                <div className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-700/50 px-6 py-4 flex justify-between items-center">
                                    <span className="font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider text-xs lg:text-sm">
                                        Question {currentIndex + 1} of {questions.length}
                                    </span>
                                    <span className="text-xs font-semibold px-2 py-1 bg-indigo-50 text-indigo-600 rounded border border-indigo-100 dark:bg-indigo-900/20 dark:text-indigo-300 dark:border-indigo-800">
                                        {currentQ.points} Point{currentQ.points > 1 ? 's' : ''}
                                    </span>
                                </div>

                                <div className="p-6 lg:p-8">
                                    <div className="prose dark:prose-invert prose-lg lg:prose-xl max-w-none text-slate-800 dark:text-slate-100 leading-relaxed font-serif"
                                        dangerouslySetInnerHTML={{ __html: currentQ.question_text }} />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Pane: Options */}
                    <div className="flex-1 lg:w-1/2 overflow-y-auto p-6 lg:p-8 scrollbar-thin scrollbar-thumb-slate-300 dark:scrollbar-thumb-slate-600 bg-white/50 dark:bg-slate-800/30">
                        <div className="max-w-2xl mx-auto min-h-full flex flex-col justify-center">
                            <div className="space-y-4 pb-20 lg:pb-0">
                                <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-2 px-1">Select Answer</h3>
                                {/* Options Section */}
                                <div className="grid gap-4">
                                    {currentQ.options.map((opt, idx) => {
                                        const isSelected = answers[currentQ.id] === opt.id;

                                        return (
                                            <div
                                                key={opt.id}
                                                onClick={() => handleAnswer(opt.id)}
                                                className={`group relative p-5 rounded-xl border-2 cursor-pointer transition-all duration-200 flex items-center gap-5 shadow-sm ${isSelected
                                                    ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-900/40 ring-2 ring-indigo-500/20 translate-x-1'
                                                    : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-indigo-300 dark:hover:border-indigo-700 hover:bg-slate-50 dark:hover:bg-slate-700/50 hover:shadow-md'
                                                    }`}
                                                style={{ animationDelay: `${idx * 50}ms` }}
                                            >
                                                {/* Selection Indicator Bar */}
                                                {isSelected && <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-indigo-600 rounded-l-xl"></div>}

                                                <div className={`shrink-0 w-10 h-10 rounded-lg flex items-center justify-center font-bold text-lg border-2 transition-colors shadow-sm ${isSelected
                                                    ? 'bg-indigo-600 border-indigo-600 text-white'
                                                    : 'bg-slate-100 dark:bg-slate-700 border-slate-300 dark:border-slate-500 text-slate-500 dark:text-slate-400 group-hover:border-indigo-400 group-hover:text-indigo-600 group-hover:bg-white'
                                                    }`}>
                                                    {opt.id}
                                                </div>
                                                <div className="flex-1 z-10">
                                                    <span className={`text-lg font-medium block leading-snug transition-colors ${isSelected ? 'text-indigo-900 dark:text-indigo-100' : 'text-slate-700 dark:text-slate-200 group-hover:text-slate-900 dark:group-hover:text-white'
                                                        }`}>
                                                        {opt.text}
                                                    </span>
                                                </div>
                                                {isSelected && (
                                                    <div className="animate-in fade-in zoom-in duration-300 text-emerald-500">
                                                        <CheckCircle size={24} strokeWidth={3} fill="currentColor" className="text-white" />
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Bottom Navigation Bar */}
                <div className="bg-white dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700 p-4 lg:px-8 lg:py-4 flex items-center justify-between z-10">
                    <button
                        onClick={() => setCurrentIndex(prev => Math.max(0, prev - 1))}
                        disabled={currentIndex === 0}
                        className="flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-30 disabled:hover:bg-transparent transition-all"
                    >
                        <ChevronLeft size={20} /> <span className="hidden sm:inline">Previous</span>
                    </button>

                    <div className="text-sm font-medium text-slate-400 hidden sm:block">
                        Question {currentIndex + 1} of {questions.length}
                    </div>

                    <button
                        onClick={() => setCurrentIndex(prev => Math.min(questions.length - 1, prev + 1))}
                        disabled={currentIndex === questions.length - 1}
                        className="flex items-center gap-2 px-8 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-lg shadow-indigo-500/20 disabled:opacity-50 disabled:shadow-none transition-all font-bold transform active:scale-95"
                    >
                        <span className="hidden sm:inline">Next Question</span> <span className="sm:hidden">Next</span> <ChevronRight size={20} />
                    </button>
                </div>
            </main>

            {/* Right Panel: Sidebar Information (Always Visible Desktop, Drawer Mobile) */}
            <aside className={`
                fixed lg:relative inset-y-0 right-0 w-80 lg:w-96 bg-slate-900 text-white z-30 transform transition-transform duration-300 ease-in-out lg:translate-x-0
                ${showPalette ? 'translate-x-0 shadow-2xl' : 'translate-x-full lg:shadow-none'}
            `}>
                <div className="h-full flex flex-col bg-slate-900">
                    {/* Header: Student Profile */}
                    <div className="p-6 border-b border-slate-800 bg-slate-900 flex flex-col items-center text-center gap-4 relative overflow-hidden">
                        {/* Mobile Close Button */}
                        <button onClick={() => setShowPalette(false)} className="lg:hidden absolute top-4 right-4 text-slate-500 hover:text-white">
                            <X size={24} />
                        </button>

                        <div className="w-24 h-24 rounded-full p-1 bg-gradient-to-tr from-indigo-500 to-purple-500 shadow-xl shadow-indigo-900/50">
                            <div className="w-full h-full rounded-full bg-slate-800 overflow-hidden relative border-2 border-slate-900">
                                {student?.profile_picture_url ? (
                                    <img src={student.profile_picture_url} alt="Profile" className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-3xl font-bold text-slate-600">
                                        {student?.surname?.charAt(0)}
                                    </div>
                                )}
                            </div>
                        </div>

                        <div>
                            <h2 className="text-xl font-bold leading-tight">{student?.surname} {student?.othername}</h2>
                            <p className="text-sm text-slate-400 mt-1 font-medium">{student?.class_section?.school_class?.name} - {student?.class_section?.class_arm?.name}</p>
                            <p className="text-xs text-slate-200 mt-1 tracking-wider uppercase font-mono bg-slate-800 px-2 py-0.5 rounded-md inline-block">{student?.registration_number}</p>
                        </div>
                    </div>

                    {/* Timer Section */}
                    <div className="p-6 border-b border-slate-800 bg-slate-900/50">
                        <div className="bg-slate-800 rounded-xl p-5 flex flex-col items-center border border-slate-700/50 shadow-inner relative overflow-hidden group">
                            <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-br from-white/5 to-transparent rounded-bl-full pointer-events-none"></div>
                            <span className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5">Time Remaining</span>
                            <div className={`font-mono text-4xl font-black tracking-tight ${timeLeft < 180 ? 'text-red-500 animate-pulse' : 'text-white group-hover:scale-105 transition-transform'}`}>
                                {formatTime(timeLeft)}
                            </div>
                        </div>

                        <div className="flex justify-between items-center mt-5 text-xs text-slate-500 font-medium px-1">
                            <span className={syncStatus === 'synced' ? 'text-emerald-500 flex items-center gap-1.5 transition-colors' : 'text-amber-500 flex items-center gap-1.5 transition-colors'}>
                                {syncStatus === 'synced' ? <CheckCircle size={14} /> : <WifiOff size={14} />}
                                {syncStatus === 'synced' ? 'Progress Saved' : 'Syncing...'}
                            </span>
                            <button
                                onClick={() => {
                                    if (!document.fullscreenElement) {
                                        document.documentElement.requestFullscreen().catch(e => console.log(e));
                                    } else {
                                        document.exitFullscreen();
                                    }
                                }}
                                className="hover:text-white transition-colors flex items-center gap-1.5 group"
                            >
                                <Maximize size={14} className="group-hover:scale-110 transition-transform" /> Fullscreen
                            </button>
                        </div>
                    </div>

                    {/* Question Palette */}
                    <div className="flex-1 overflow-y-auto p-6 scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent hover:scrollbar-thumb-slate-600 transition-colors">
                        <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4">Question Palette</h3>
                        <div className="grid grid-cols-5 gap-2.5">
                            {questions.map((q, idx) => {
                                const active = idx === currentIndex;
                                const answered = isAnswered(idx);
                                return (
                                    <button
                                        key={idx}
                                        onClick={() => {
                                            setCurrentIndex(idx);
                                            setShowPalette(false);
                                        }}
                                        className={`
                                            aspect-square rounded-lg flex items-center justify-center text-sm font-bold transition-all duration-200 relative
                                            ${active
                                                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30 scale-110 z-10 border border-indigo-400'
                                                : answered
                                                    ? 'bg-emerald-600/20 text-emerald-400 border border-emerald-600/30 hover:bg-emerald-600/30'
                                                    : 'bg-slate-800 text-slate-500 border border-slate-700 hover:bg-slate-700 hover:text-slate-300'
                                            }
                                        `}
                                    >
                                        {idx + 1}
                                        {active && <span className="absolute -bottom-1 w-1 h-1 rounded-full bg-white"></span>}
                                    </button>
                                );
                            })}
                        </div>

                        <div className="mt-8 space-y-3 px-2">
                            <div className="flex items-center gap-3 text-xs font-medium text-slate-400">
                                <span className="w-3 h-3 bg-emerald-600/20 border border-emerald-600/30 rounded-sm"></span>
                                <span>Answered ({getAnsweredCount()})</span>
                            </div>
                            <div className="flex items-center gap-3 text-xs font-medium text-slate-400">
                                <span className="w-3 h-3 bg-slate-800 border border-slate-700 rounded-sm"></span>
                                <span>Not Answered</span>
                            </div>
                            <div className="flex items-center gap-3 text-xs font-medium text-slate-400">
                                <span className="w-3 h-3 bg-indigo-600 rounded-sm"></span>
                                <span>Current Question</span>
                            </div>
                        </div>
                    </div>

                    {/* Submit Section */}
                    <div className="p-6 border-t border-slate-800 bg-slate-950/30">
                        <button
                            onClick={() => submitExam()}
                            disabled={isSubmitting}
                            className="w-full bg-emerald-600 hover:bg-emerald-500 text-white py-4 rounded-xl font-bold shadow-lg shadow-emerald-900/20 flex items-center justify-center gap-2 transition-all transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isSubmitting ? (
                                <>
                                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                    Submitting...
                                </>
                            ) : (
                                <>
                                    <CheckCircle size={20} /> Submit Exam
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </aside>

            {/* Backdrop for Mobile Drawer */}
            {showPalette && (
                <div
                    className="fixed inset-0 bg-black/50 backdrop-blur-sm z-20 lg:hidden"
                    onClick={() => setShowPalette(false)}
                ></div>
            )}
        </div>
    );
}
