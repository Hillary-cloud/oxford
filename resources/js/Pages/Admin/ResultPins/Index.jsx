import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import { Key, Download, Loader2, CheckCircle, AlertCircle, Users, User } from 'lucide-react';
import Swal from 'sweetalert2';

export default function Index({ auth, sessions, terms, classes }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        academic_session_id: sessions.find(s => s.is_current)?.id || sessions[0]?.id || '',
        term_id: '',
        class_section_ids: [],
        student_ids: [],
        generation_mode: 'class', // 'class' or 'student'
    });

    const [students, setStudents] = useState([]);
    const [loadingStudents, setLoadingStudents] = useState(false);

    // Fetch students when classes change in student mode
    useEffect(() => {
        if (data.generation_mode === 'student' && data.class_section_ids.length > 0) {
            fetchStudents();
        } else {
            setStudents([]);
        }
    }, [data.class_section_ids, data.generation_mode]);

    const fetchStudents = async () => {
        setLoadingStudents(true);
        try {
            const response = await axios.post(route('result-pins.get-students'), {
                class_section_ids: data.class_section_ids
            });
            setStudents(response.data);
        } catch (error) {
            console.error('Failed to fetch students', error);
            toast.error('Failed to load students');
        } finally {
            setLoadingStudents(false);
        }
    };

    const submit = async (e) => {
        e.preventDefault();

        // Warning Step: Check for existing PINs first
        let shouldProceed = true;

        try {
            Swal.fire({
                title: 'Checking...',
                text: 'Checking for existing PINs...',
                allowOutsideClick: false,
                didOpen: () => Swal.showLoading()
            });

            const checkResponse = await axios.post(route('result-pins.check-existence'), { ...data });
            Swal.close();

            if (checkResponse.data.count > 0) {
                const result = await Swal.fire({
                    title: 'PINs Already Exist!',
                    text: `Found ${checkResponse.data.count} existing PIN(s) for the selected students in this session/term. Generating new ones will invalidate the old PINs. Do you want to continue?`,
                    icon: 'warning',
                    showCancelButton: true,
                    confirmButtonColor: '#d33',
                    cancelButtonColor: '#3085d6',
                    confirmButtonText: 'Yes, overwrite them',
                    cancelButtonText: 'No, cancel'
                });

                if (!result.isConfirmed) {
                    shouldProceed = false;
                }
            }
        } catch (error) {
            console.error(error);
            Swal.close();
            Swal.fire('Error', 'Failed to check existing PINs.', 'error');
            return;
        }

        if (!shouldProceed) return;

        // Show loading state
        Swal.fire({
            title: 'Generating PINs...',
            text: 'Please wait while we generate and prepare your file.',
            allowOutsideClick: false,
            didOpen: () => {
                Swal.showLoading();
            }
        });

        try {
            const response = await axios.post(route('result-pins.store'), {
                ...data
            }, {
                responseType: 'blob'
            });

            // Create download link
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;

            // Extract filename from headers if possible, or default
            const contentDisposition = response.headers['content-disposition'];
            let filename = 'result_pins.csv';
            if (contentDisposition) {
                const fileNameMatch = contentDisposition.match(/filename="?([^"]+)"?/);
                if (fileNameMatch && fileNameMatch.length === 2)
                    filename = fileNameMatch[1];
            }

            link.setAttribute('download', filename);
            document.body.appendChild(link);
            link.click();
            link.remove();

            Swal.fire({
                title: 'Success!',
                text: 'PINs generated and downloaded successfully.',
                icon: 'success',
                timer: 3000
            });

        } catch (error) {
            console.error('Download error:', error);

            // Try to read the blob as JSON to show validation errors
            if (error.response && error.response.data instanceof Blob) {
                const reader = new FileReader();
                reader.onload = () => {
                    try {
                        const errorData = JSON.parse(reader.result);
                        // Inertia validation errors come as { errors: { field: [msg] } } usually 
                        // but standard Laravel validation response is { message: ..., errors: ... }
                        // Let's try to parse meaningful message
                        let errorMessage = errorData.message || 'Failed to generate PINs.';
                        if (errorData.errors) {
                            errorMessage = Object.values(errorData.errors).flat().join('\n');
                        }
                        Swal.fire('Error', errorMessage, 'error');
                    } catch (e) {
                        Swal.fire('Error', 'An unexpected error occurred during generation.', 'error');
                    }
                };
                reader.readAsText(error.response.data);
            } else {
                Swal.fire('Error', 'Could not connect to the server.', 'error');
            }
        }
    };

    const toggleClass = (id) => {
        const current = data.class_section_ids;
        if (current.includes(id)) {
            setData('class_section_ids', current.filter(c => c !== id));
        } else {
            setData('class_section_ids', [...current, id]);
        }
    };

    const toggleAllClasses = () => {
        if (data.class_section_ids.length === classes.length) {
            setData('class_section_ids', []);
        } else {
            setData('class_section_ids', classes.map(c => c.id));
        }
    };

    const toggleStudent = (id) => {
        const current = data.student_ids;
        if (current.includes(id)) {
            setData('student_ids', current.filter(s => s !== id));
        } else {
            setData('student_ids', [...current, id]);
        }
    };

    const toggleAllStudents = () => {
        if (data.student_ids.length === students.length) {
            setData('student_ids', []);
        } else {
            setData('student_ids', students.map(s => s.id));
        }
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="font-semibold text-xl text-gray-800 dark:text-gray-200 leading-tight">PIN Management</h2>}
        >
            <Head title="Result PINs" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white dark:bg-slate-800 overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6 text-gray-900 dark:text-gray-100">

                            <div className="mb-6 flex items-start gap-4 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 rounded-lg">
                                <Key className="text-blue-600 dark:text-blue-400 shrink-0 mt-1" />
                                <div>
                                    <h3 className="font-bold text-blue-800 dark:text-blue-300 text-lg">Generate Result PINs</h3>
                                    <p className="text-blue-700 dark:text-blue-400 text-sm">
                                        Generate unique 12-digit PINs for students to check their results.
                                        The PINs will be downloaded as a CSV file containing Student Name, Reg No, and PIN.
                                        Only specific PINs (CSV) are visible once at the time of generation.
                                    </p>
                                </div>
                            </div>

                            <div className="space-y-6">
                                {/* Mode Selection Toggle */}
                                <div className="flex justify-center mb-4">
                                    <div className="bg-gray-100 dark:bg-slate-700 p-1 rounded-lg inline-flex">
                                        <button
                                            type="button"
                                            onClick={() => setData('generation_mode', 'class')}
                                            className={`px-4 py-2 rounded-md text-sm font-medium transition-all flex items-center gap-2 ${data.generation_mode === 'class'
                                                ? 'bg-white dark:bg-slate-600 text-indigo-600 dark:text-indigo-400 shadow-sm'
                                                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                                                }`}
                                        >
                                            <Users size={16} />
                                            Whole Class
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setData('generation_mode', 'student')}
                                            className={`px-4 py-2 rounded-md text-sm font-medium transition-all flex items-center gap-2 ${data.generation_mode === 'student'
                                                ? 'bg-white dark:bg-slate-600 text-indigo-600 dark:text-indigo-400 shadow-sm'
                                                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                                                }`}
                                        >
                                            <User size={16} />
                                            Specific Students
                                        </button>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Academic Session</label>
                                        <select
                                            value={data.academic_session_id}
                                            onChange={e => setData('academic_session_id', e.target.value)}
                                            className="w-full border-gray-300 dark:border-slate-700 dark:bg-slate-900 dark:text-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                        >
                                            <option value="">Select Session</option>
                                            {sessions.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Term</label>
                                        <select
                                            value={data.term_id}
                                            onChange={e => setData('term_id', e.target.value)}
                                            className="w-full border-gray-300 dark:border-slate-700 dark:bg-slate-900 dark:text-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                            disabled={!data.academic_session_id}
                                        >
                                            <option value="">{data.academic_session_id ? 'Select Term' : 'Select Session First'}</option>
                                            {data.academic_session_id && terms
                                                .filter(t => t.academic_session_id == data.academic_session_id)
                                                .map(t => (
                                                    <option key={t.id} value={t.id}>{t.name}</option>
                                                ))
                                            }
                                        </select>
                                    </div>
                                </div>

                                <div>
                                    <div className="flex justify-between items-center mb-2">
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Select Classes</label>
                                        <button
                                            type="button"
                                            onClick={toggleAllClasses}
                                            className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300"
                                        >
                                            {data.class_section_ids.length === classes.length ? 'Deselect All' : 'Select All'}
                                        </button>
                                    </div>
                                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 max-h-60 overflow-y-auto border border-gray-200 dark:border-slate-700 rounded-md p-4 bg-gray-50 dark:bg-slate-900/50">
                                        {classes.map(c => (
                                            <div
                                                key={c.id}
                                                onClick={() => toggleClass(c.id)}
                                                className={`cursor-pointer flex items-center gap-2 p-2 rounded border transition-all ${data.class_section_ids.includes(c.id)
                                                    ? 'bg-indigo-50 dark:bg-indigo-900/20 border-indigo-300 dark:border-indigo-700 text-indigo-700 dark:text-indigo-300'
                                                    : 'bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-600 hover:border-gray-300 dark:hover:border-slate-500 text-gray-700 dark:text-gray-300'
                                                    }`}
                                            >
                                                <div className={`w-4 h-4 rounded border flex items-center justify-center ${data.class_section_ids.includes(c.id) ? 'bg-indigo-600 border-indigo-600' : 'border-gray-400 bg-white dark:bg-slate-700 dark:border-slate-500'
                                                    }`}>
                                                    {data.class_section_ids.includes(c.id) && <CheckCircle size={12} className="text-white" />}
                                                </div>
                                                <span className="text-sm font-medium truncate">
                                                    {c.name || `${c.school_class?.name || c.schoolClass?.name || ''}${c.class_arm?.name !== 'No arm' && c.classArm?.name !== 'No arm' ? ' ' + (c.class_arm?.name || c.classArm?.name || '') : ''}`.trim()}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                    {errors.class_section_ids && <p className="mt-1 text-sm text-red-600">{errors.class_section_ids}</p>}
                                </div>

                                {/* Student Selection Area (Only in Student Mode) */}
                                {data.generation_mode === 'student' && (
                                    <div className="pt-4 border-t border-gray-100 dark:border-slate-700">
                                        <div className="flex justify-between items-center mb-2">
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                                Select Students
                                                <span className="text-xs font-normal text-gray-500 ml-2">
                                                    (Select classes above to load students)
                                                </span>
                                            </label>
                                            <button
                                                type="button"
                                                onClick={toggleAllStudents}
                                                disabled={students.length === 0}
                                                className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 disabled:opacity-50"
                                            >
                                                {data.student_ids.length === students.length && students.length > 0 ? 'Deselect All' : 'Select All'}
                                            </button>
                                        </div>

                                        {loadingStudents ? (
                                            <div className="flex justify-center p-8 bg-gray-50 dark:bg-slate-900/50 rounded-md border border-gray-200 dark:border-slate-700">
                                                <Loader2 className="animate-spin text-indigo-600" />
                                                <span className="ml-2 text-sm text-gray-600 dark:text-gray-400">Loading students...</span>
                                            </div>
                                        ) : students.length > 0 ? (
                                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 max-h-80 overflow-y-auto border border-gray-200 dark:border-slate-700 rounded-md p-4 bg-gray-50 dark:bg-slate-900/50">
                                                {students.map(student => (
                                                    <div
                                                        key={student.id}
                                                        onClick={() => toggleStudent(student.id)}
                                                        className={`cursor-pointer flex items-center gap-3 p-3 rounded border transition-all ${data.student_ids.includes(student.id)
                                                            ? 'bg-indigo-50 dark:bg-indigo-900/20 border-indigo-300 dark:border-indigo-700 ring-1 ring-indigo-300 dark:ring-indigo-700'
                                                            : 'bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-600 hover:border-gray-300 dark:hover:border-slate-500'
                                                            }`}
                                                    >
                                                        <div className={`w-5 h-5 rounded border flex items-center justify-center shrink-0 ${data.student_ids.includes(student.id)
                                                            ? 'bg-indigo-600 border-indigo-600'
                                                            : 'border-gray-400 bg-white dark:bg-slate-700 dark:border-slate-500'
                                                            }`}>
                                                            {data.student_ids.includes(student.id) && <CheckCircle size={14} className="text-white" />}
                                                        </div>
                                                        <div className="min-w-0">
                                                            <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                                                                {student.surname} {student.othername}
                                                            </p>
                                                            <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                                                                {student.registration_number}
                                                            </p>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <div className="text-center p-8 bg-gray-50 dark:bg-slate-900/50 rounded-md border border-dashed border-gray-300 dark:border-slate-700">
                                                <Users className="mx-auto h-8 w-8 text-gray-400 mb-2" />
                                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                                    {data.class_section_ids.length === 0
                                                        ? 'Please select one or more classes above to see students.'
                                                        : 'No students found in the selected classes.'}
                                                </p>
                                            </div>
                                        )}
                                        {errors.student_ids && <p className="mt-1 text-sm text-red-600">{errors.student_ids}</p>}
                                    </div>
                                )}

                                <div className="flex justify-end pt-4 border-t border-gray-100 dark:border-slate-700">
                                    <button
                                        onClick={submit}
                                        disabled={processing || !data.term_id || (data.generation_mode === 'class' ? data.class_section_ids.length === 0 : data.student_ids.length === 0)}
                                        className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 text-white rounded-lg font-bold shadow-lg shadow-indigo-500/30 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                                    >
                                        <Download size={18} />
                                        Generate & Download CSV
                                    </button>
                                </div>
                            </div>

                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
