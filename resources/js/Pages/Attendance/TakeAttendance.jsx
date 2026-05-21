import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, Link } from '@inertiajs/react';
import Card from '@/Components/Card';
import {
    Calendar,
    Users,
    CheckCircle2,
    XCircle,
    Clock,
    Save,
    Search,
    ChevronLeft,
    CheckCircle,
    AlertCircle,
    ArrowLeft
} from 'lucide-react';
import { useState, useEffect } from 'react';
import axios from 'axios';

export default function TakeAttendance({ auth, sections, sessions, terms, filters }) {
    const { data, setData, post, processing, errors } = useForm({
        class_section_id: filters.class_section_id || '',
        academic_session_id: sessions[0]?.id || '',
        term_id: terms[0]?.id || '',
        date: filters.date || new Date().toISOString().split('T')[0],
        attendance: [], // [{ student_id, status, remarks }]
    });

    const [students, setStudents] = useState([]);
    const [loadingStudents, setLoadingStudents] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        if (data.class_section_id) {
            fetchStudents(data.class_section_id);
        }
    }, [data.class_section_id]);

    const fetchStudents = async (sectionId) => {
        setLoadingStudents(true);
        try {
            const response = await axios.get(route('attendance.get-students', sectionId));
            setStudents(response.data);

            // Initialize attendance data if not already present
            const attendanceData = response.data.map(student => ({
                student_id: student.id,
                status: 'present',
                remarks: '',
                student_name: `${student.surname} ${student.othername}`
            }));
            setData('attendance', attendanceData);
        } catch (error) {
            console.error('Error fetching students:', error);
        } finally {
            setLoadingStudents(false);
        }
    };

    const handleStatusChange = (studentId, status) => {
        const newAttendance = data.attendance.map(item =>
            item.student_id === studentId ? { ...item, status } : item
        );
        setData('attendance', newAttendance);
    };

    const handleRemarksChange = (studentId, remarks) => {
        const newAttendance = data.attendance.map(item =>
            item.student_id === studentId ? { ...item, remarks } : item
        );
        setData('attendance', newAttendance);
    };

    const markAllAs = (status) => {
        const newAttendance = data.attendance.map(item => ({ ...item, status }));
        setData('attendance', newAttendance);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route('attendance.store'), {
            preserveScroll: true,
            onSuccess: () => {
                // Potential notification or redirect
            }
        });
    };

    const filteredAttendance = data.attendance.filter(item =>
        item.student_name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const stats = {
        total: data.attendance.length,
        present: data.attendance.filter(a => a.status === 'present').length,
        absent: data.attendance.filter(a => a.status === 'absent').length,
        late: data.attendance.filter(a => a.status === 'late').length,
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center gap-4">
                    <Link
                        href={route('attendance.index')}
                        className="bg-white dark:bg-slate-900 p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-500 hover:text-indigo-600 hover:border-indigo-200 transition-all shadow-sm group"
                    >
                        <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
                    </Link>
                    <div className="flex flex-col gap-1">
                        <h2 className="text-3xl font-black tracking-tight bg-gradient-to-r from-slate-900 via-indigo-900 to-slate-800 dark:from-white dark:via-indigo-200 dark:to-slate-100 bg-clip-text text-transparent">
                            Daily Attendance
                        </h2>
                        <p className="text-slate-600 dark:text-slate-400 text-sm font-medium tracking-wide">
                            Select a class and date to mark student presence.
                        </p>
                    </div>
                </div>
            }
        >
            <Head title="Take Attendance" />

            <div className="space-y-6">
                {/* Configuration Card */}
                <Card className="border border-slate-200 dark:border-slate-800 shadow-xl overflow-visible relative z-30">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            {/* Class Selector */}
                            <div className="space-y-1.5">
                                <label className="text-xs font-black text-slate-500 uppercase tracking-widest ml-1">Class Section</label>
                                <select
                                    className="w-full bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 rounded-xl text-sm font-semibold focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all cursor-pointer"
                                    value={data.class_section_id}
                                    onChange={e => setData('class_section_id', e.target.value)}
                                >
                                    <option value="">Select a class</option>
                                    {sections.map(section => (
                                        <option key={section.id} value={section.id}>
                                            {section.school_class?.name} {section.class_arm?.name !== 'No arm' && section.class_arm?.name}
                                        </option>
                                    ))}
                                </select>
                                {errors.class_section_id && <p className="text-[10px] text-rose-500 font-bold ml-1">{errors.class_section_id}</p>}
                            </div>

                            {/* Date Selector */}
                            <div className="space-y-1.5">
                                <label className="text-xs font-black text-slate-500 uppercase tracking-widest ml-1">Attendance Date</label>
                                <div className="relative">
                                    <input
                                        type="date"
                                        className="w-full bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 rounded-xl text-sm font-semibold focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all pl-10"
                                        value={data.date}
                                        onChange={e => setData('date', e.target.value)}
                                        max={new Date().toISOString().split('T')[0]}
                                    />
                                    <Calendar className="absolute left-3 top-2.5 text-slate-400" size={16} />
                                </div>
                            </div>

                            {/* Session Selector */}
                            <div className="space-y-1.5">
                                <label className="text-xs font-black text-slate-500 uppercase tracking-widest ml-1">Session</label>
                                <select
                                    className="w-full bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 rounded-xl text-sm font-semibold focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all cursor-pointer"
                                    value={data.academic_session_id}
                                    onChange={e => {
                                        const val = e.target.value;
                                        setData(d => ({ ...d, academic_session_id: val, term_id: '' }));
                                    }}
                                >
                                    <option value="">Select session</option>
                                    {sessions.map(s => (
                                        <option key={s.id} value={s.id}>{s.name}</option>
                                    ))}
                                </select>
                            </div>

                            {/* Term Selector */}
                            <div className="space-y-1.5">
                                <label className="text-xs font-black text-slate-500 uppercase tracking-widest ml-1">Term</label>
                                <select
                                    className="w-full bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 rounded-xl text-sm font-semibold focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                                    value={data.term_id}
                                    onChange={e => setData('term_id', e.target.value)}
                                    disabled={!data.academic_session_id}
                                >
                                    <option value="">Select term</option>
                                    {terms
                                        .filter(t => !data.academic_session_id || t.academic_session_id == data.academic_session_id)
                                        .map(t => (
                                            <option key={t.id} value={t.id}>{t.name}</option>
                                        ))
                                    }
                                </select>
                            </div>
                        </div>
                    </form>
                </Card>

                {/* Main Content */}
                {data.class_section_id ? (
                    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                        {/* Attendance Stats Overlay for desktop */}
                        <div className="lg:col-span-1 space-y-4">
                            <Card className="!p-5 bg-gradient-to-br from-indigo-600 to-purple-700 border-none shadow-xl sticky top-6">
                                <h3 className="text-white font-black text-sm tracking-widest uppercase mb-4 opacity-80">Summary</h3>
                                <div className="space-y-4">
                                    <div className="flex justify-between items-end border-b border-white/10 pb-2 text-white">
                                        <div className="flex items-center gap-2">
                                            <Users size={16} className="opacity-70" />
                                            <span className="text-sm font-bold opacity-80">Total</span>
                                        </div>
                                        <span className="text-xl font-black">{stats.total}</span>
                                    </div>
                                    <div className="flex justify-between items-end border-b border-white/10 pb-2 text-emerald-300">
                                        <div className="flex items-center gap-2">
                                            <CheckCircle2 size={16} className="opacity-70" />
                                            <span className="text-sm font-bold opacity-80">Present</span>
                                        </div>
                                        <span className="text-xl font-black">{stats.present}</span>
                                    </div>
                                    <div className="flex justify-between items-end border-b border-white/10 pb-2 text-rose-300">
                                        <div className="flex items-center gap-2">
                                            <XCircle size={16} className="opacity-70" />
                                            <span className="text-sm font-bold opacity-80">Absent</span>
                                        </div>
                                        <span className="text-xl font-black">{stats.absent}</span>
                                    </div>
                                    <div className="flex justify-between items-end border-b border-white/10 pb-2 text-amber-300">
                                        <div className="flex items-center gap-2">
                                            <Clock size={16} className="opacity-70" />
                                            <span className="text-sm font-bold opacity-80">Late</span>
                                        </div>
                                        <span className="text-xl font-black">{stats.late}</span>
                                    </div>
                                </div>

                                <button
                                    onClick={handleSubmit}
                                    disabled={processing || data.attendance.length === 0}
                                    className="w-full mt-8 py-4 bg-white text-indigo-700 rounded-2xl text-sm font-black uppercase tracking-widest shadow-xl shadow-black/20 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed group"
                                >
                                    <Save size={18} className="group-hover:rotate-12 transition-transform" />
                                    {processing ? 'Saving...' : 'Save Attendance'}
                                </button>
                            </Card>

                            <div className="p-4 bg-indigo-50 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900/30 rounded-2xl flex items-start gap-3">
                                <AlertCircle size={18} className="text-indigo-600 dark:text-indigo-400 shrink-0 mt-0.5" />
                                <p className="text-[10px] text-slate-600 dark:text-slate-400 font-medium leading-relaxed uppercase tracking-wider">
                                    Submitting attendance for a date that already has records will <span className="text-indigo-600 dark:text-indigo-400 font-black italic">overwrite</span> previous values for the selected students.
                                </p>
                            </div>
                        </div>

                        {/* Student List */}
                        <div className="lg:col-span-3 space-y-4">
                            <Card className="!p-0 border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden">
                                {/* Toolbar */}
                                <div className="p-4 bg-slate-50/50 dark:bg-slate-900/50 border-b border-slate-100 dark:border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
                                    <div className="relative flex-1 max-w-sm">
                                        <Search className="absolute left-3 top-2.5 text-slate-400" size={16} />
                                        <input
                                            type="text"
                                            placeholder="Search students..."
                                            className="w-full bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 rounded-xl text-xs font-semibold pl-10 focus:ring-2 focus:ring-indigo-500/20 transition-all"
                                            value={searchTerm}
                                            onChange={e => setSearchTerm(e.target.value)}
                                        />
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest mr-2">Quick Mark:</span>
                                        <button
                                            onClick={() => markAllAs('present')}
                                            className="px-3 py-1.5 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-emerald-500 hover:text-white transition-all border border-emerald-500/20"
                                        >
                                            All Present
                                        </button>
                                        <button
                                            onClick={() => markAllAs('absent')}
                                            className="px-3 py-1.5 bg-rose-500/10 text-rose-600 dark:text-rose-400 rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-rose-500 hover:text-white transition-all border border-rose-500/20"
                                        >
                                            All Absent
                                        </button>
                                    </div>
                                </div>

                                {/* Table */}
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left border-collapse">
                                        <thead>
                                            <tr className="bg-slate-50 dark:bg-slate-800/40">
                                                <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Student Details</th>
                                                <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest text-center">Status</th>
                                                <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Remarks</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                            {loadingStudents ? (
                                                <tr>
                                                    <td colSpan="3" className="py-20 text-center">
                                                        <div className="flex flex-col items-center gap-3">
                                                            <div className="w-10 h-10 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin"></div>
                                                            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest animate-pulse">Loading class...</span>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ) : filteredAttendance.length > 0 ? (
                                                filteredAttendance.map((record) => (
                                                    <tr key={record.student_id} className="group hover:bg-slate-50 dark:hover:bg-slate-800/20 transition-colors">
                                                        <td className="px-6 py-4">
                                                            <div className="flex items-center gap-3">
                                                                <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 font-bold text-sm shadow-inner group-hover:scale-110 transition-transform">
                                                                    {record.student_name.charAt(0)}
                                                                </div>
                                                                <div>
                                                                    <p className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-tight">{record.student_name}</p>
                                                                    <p className="text-[10px] text-slate-500 font-medium">#{record.student_id.slice(0, 8)}</p>
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            <div className="flex items-center justify-center gap-1 bg-slate-100/50 dark:bg-slate-800/50 p-1 rounded-xl border border-slate-200/50 dark:border-slate-700/50 w-fit mx-auto">
                                                                <button
                                                                    onClick={() => handleStatusChange(record.student_id, 'present')}
                                                                    className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${record.status === 'present'
                                                                        ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/30'
                                                                        : 'text-slate-400 hover:text-emerald-500 hover:bg-emerald-500/10'
                                                                        }`}
                                                                >
                                                                    Present
                                                                </button>
                                                                <button
                                                                    onClick={() => handleStatusChange(record.student_id, 'absent')}
                                                                    className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${record.status === 'absent'
                                                                        ? 'bg-rose-500 text-white shadow-lg shadow-rose-500/30'
                                                                        : 'text-slate-400 hover:text-rose-500 hover:bg-rose-500/10'
                                                                        }`}
                                                                >
                                                                    Absent
                                                                </button>
                                                                <button
                                                                    onClick={() => handleStatusChange(record.student_id, 'late')}
                                                                    className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${record.status === 'late'
                                                                        ? 'bg-amber-500 text-white shadow-lg shadow-amber-500/30'
                                                                        : 'text-slate-400 hover:text-amber-500 hover:bg-amber-500/10'
                                                                        }`}
                                                                >
                                                                    Late
                                                                </button>
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            <input
                                                                type="text"
                                                                placeholder="Add remarks..."
                                                                className="w-full bg-white dark:bg-slate-900 border-transparent border-b-slate-200 dark:border-b-slate-800 focus:border-indigo-500 focus:ring-0 text-xs font-medium placeholder:italic transition-all"
                                                                value={record.remarks}
                                                                onChange={e => handleRemarksChange(record.student_id, e.target.value)}
                                                            />
                                                        </td>
                                                    </tr>
                                                ))
                                            ) : (
                                                <tr>
                                                    <td colSpan="3" className="py-20 text-center text-slate-500 font-bold uppercase tracking-widest text-xs opacity-40">
                                                        No students found matching your search.
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </Card>
                        </div>
                    </div>
                ) : (
                    <Card className="flex flex-col items-center justify-center py-24 text-center border border-dashed border-slate-300 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/20 rounded-[2.5rem]">
                        <div className="relative mb-6">
                            <div className="absolute inset-0 bg-indigo-500/10 rounded-full blur-3xl"></div>
                            <div className="relative w-20 h-20 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl flex items-center justify-center text-indigo-500">
                                <Users size={40} strokeWidth={1.5} />
                            </div>
                        </div>
                        <h3 className="text-xl font-black text-slate-900 dark:text-white mb-2 tracking-tight">Ready to Mark Attendance?</h3>
                        <p className="text-sm font-medium text-slate-500 dark:text-slate-400 max-w-sm">
                            Please select a class from the dropdown above to view the student list and start recording today's presence.
                        </p>
                    </Card>
                )}
            </div>
        </AuthenticatedLayout>
    );
}
