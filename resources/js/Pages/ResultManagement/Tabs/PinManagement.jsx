import { useForm, router } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import { Key, Download, Loader2, CheckCircle, AlertCircle, Users, User, Send } from 'lucide-react';
import Swal from 'sweetalert2';
import axios from 'axios';

export default function PinManagement({ sessions, terms, classes, annualRankingBasis = 'class', pinHistory = [] }) {
    const { data, setData, post, processing, errors } = useForm({
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
                class_section_ids: data.class_section_ids,
                academic_session_id: data.academic_session_id,
                term_id: data.term_id
            });
            setStudents(response.data);
        } catch (error) {
            console.error('Failed to fetch students', error);
            // toast.error('Failed to load students');
        } finally {
            setLoadingStudents(false);
        }
    };

    const handleSendSms = async () => {
        if (!data.term_id) return;

        // 1. Fetch Preview
        Swal.fire({
            title: 'Preparing Preview...',
            text: 'Fetching messages and calculating units...',
            allowOutsideClick: false,
            didOpen: () => Swal.showLoading()
        });

        try {
            const previewResponse = await axios.post(route('result-pins.preview-sms'), data);
            Swal.close();

            if (!previewResponse.data.success) {
                Swal.fire('Error', previewResponse.data.message, 'error');
                return;
            }

            const { messages, total_recipients, total_units } = previewResponse.data;

            // 2. Show Preview Modal
            const result = await Swal.fire({
                title: 'SMS Delivery Preview',
                width: '800px',
                html: `
                    <div class="text-left">
                        <div class="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded border border-blue-100 dark:border-blue-800 text-sm">
                            <div class="flex justify-between">
                                <span><strong>Total Recipients:</strong> ${total_recipients}</span>
                                <span><strong>Estimated Units:</strong> ${total_units}</span>
                            </div>
                        </div>
                        <div class="max-h-[400px] overflow-y-auto border border-gray-200 dark:border-slate-700 rounded-lg">
                            <table class="w-full text-xs text-left border-collapse">
                                <thead class="bg-gray-50 dark:bg-slate-900 sticky top-0 border-b border-gray-200 dark:border-slate-700">
                                    <tr>
                                        <th class="p-3 font-bold text-gray-700 dark:text-gray-300">Guardian / Phone</th>
                                        <th class="p-3 font-bold text-gray-700 dark:text-gray-300">Message Content Preview</th>
                                    </tr>
                                </thead>
                                <tbody class="divide-y divide-gray-100 dark:divide-slate-800">
                                    ${messages.map(m => `
                                        <tr class="hover:bg-gray-50 dark:hover:bg-slate-800/50">
                                            <td class="p-3 align-top whitespace-nowrap border-r border-gray-50 dark:border-slate-800">
                                                <div class="font-bold text-indigo-600 dark:text-indigo-400">${m.guardian}</div>
                                                <div class="text-gray-500 font-mono">${m.phone}</div>
                                                <div class="mt-1 text-[10px] text-gray-400 italic">Students: ${m.students.join(', ')}</div>
                                            </td>
                                            <td class="p-3 align-top text-gray-600 dark:text-gray-400 italic font-serif leading-relaxed">
                                                "${m.message}"
                                                <div class="mt-1 not-italic font-sans text-[10px] text-gray-400">
                                                    ${m.char_count} chars • ${m.units} unit(s)
                                                </div>
                                            </td>
                                        </tr>
                                    `).join('')}
                                </tbody>
                            </table>
                        </div>
                    </div>
                `,
                showCancelButton: true,
                confirmButtonText: 'Yes, Send Now',
                cancelButtonText: 'Cancel & Edit',
                confirmButtonColor: '#10b981',
                cancelButtonColor: '#6b7280',
            });

            if (!result.isConfirmed) return;

            // 3. Final Sending
            Swal.fire({
                title: 'Sending SMS...',
                allowOutsideClick: false,
                didOpen: () => Swal.showLoading()
            });

            const response = await axios.post(route('result-pins.send-sms'), data);

            if (response.data.success) {
                Swal.fire('Success!', response.data.message, 'success');
            } else {
                Swal.fire('Failure', response.data.message, 'error');
            }

        } catch (error) {
            console.error('SMS Send Error:', error);
            Swal.fire('Error', `Request failed: ${error.response?.data?.message || error.message}`, 'error');
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
        <div className="space-y-6">
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
                        {data.academic_session_id && sessions
                            .find(s => s.id == data.academic_session_id)
                            ?.terms?.map(t => (
                                <option key={t.id} value={t.id}>{t.name}</option>
                            ))
                        }
                    </select>
                </div>
            </div>

            {/* Annual Ranking Basis Setting */}
            <div className="p-4 bg-orange-50 dark:bg-orange-900/10 border border-orange-200 dark:border-orange-800 rounded-lg flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h4 className="text-sm font-bold text-orange-800 dark:text-orange-300">Annual Ranking Basis</h4>
                    <p className="text-xs text-orange-700 dark:text-orange-400">
                        Determine how student positions are calculated for Annual Reports.
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <select
                        value={annualRankingBasis}
                        onChange={(e) => {
                            router.post(route('settings.results.report-update'), {
                                settings: { annual_ranking_basis: e.target.value }
                            }, {
                                preserveScroll: true,
                                onSuccess: () => Swal.fire('Updated', 'Ranking basis updated successfully.', 'success')
                            });
                        }}
                        className="bg-white dark:bg-slate-900 border-orange-300 dark:border-orange-700 text-sm rounded-lg focus:ring-orange-500 focus:border-orange-500"
                    >
                        <option value="class">Rank by Class Level (Entire Set)</option>
                        <option value="arm">Rank by Class Arm (Section Only)</option>
                    </select>
                </div>
            </div>

            {/* Publish Control */}
            {data.term_id && (
                <div className={`mt-6 p-4 rounded-xl border flex items-center justify-between ${sessions.find(s => s.id == data.academic_session_id)?.terms?.find(t => t.id == data.term_id)?.result_published_at
                    ? 'bg-emerald-50 dark:bg-emerald-900/10 border-emerald-200 dark:border-emerald-800'
                    : 'bg-amber-50 dark:bg-amber-900/10 border-amber-200 dark:border-amber-800'
                    }`}>
                    <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-full ${sessions.find(s => s.id == data.academic_session_id)?.terms?.find(t => t.id == data.term_id)?.result_published_at
                            ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600'
                            : 'bg-amber-100 dark:bg-amber-900/30 text-amber-600'
                            }`}>
                            {sessions.find(s => s.id == data.academic_session_id)?.terms?.find(t => t.id == data.term_id)?.result_published_at
                                ? <CheckCircle size={20} />
                                : <AlertCircle size={20} />
                            }
                        </div>
                        <div>
                            <h4 className={`text-sm font-bold ${sessions.find(s => s.id == data.academic_session_id)?.terms?.find(t => t.id == data.term_id)?.result_published_at
                                ? 'text-emerald-800 dark:text-emerald-300'
                                : 'text-amber-800 dark:text-amber-300'
                                }`}>
                                {sessions.find(s => s.id == data.academic_session_id)?.terms?.find(t => t.id == data.term_id)?.result_published_at
                                    ? 'Results Published'
                                    : 'Results Unpublished'
                                }
                            </h4>
                            <p className="text-xs opacity-80 dark:text-slate-400">
                                {sessions.find(s => s.id == data.academic_session_id)?.terms?.find(t => t.id == data.term_id)?.result_published_at
                                    ? 'Students can check their results online.'
                                    : 'Results are hidden from public view.'
                                }
                            </p>
                        </div>
                    </div>
                    <button
                        type="button"
                        onClick={() => {
                            const term = sessions.find(s => s.id == data.academic_session_id)?.terms?.find(t => t.id == data.term_id);
                            Swal.fire({
                                title: term?.result_published_at ? 'Unpublish Results?' : 'Publish Results?',
                                text: term?.result_published_at
                                    ? 'This will hide results from parents and students immediately.'
                                    : 'This will make results visible to parents and students who have valid PINs.',
                                icon: 'warning',
                                showCancelButton: true,
                                confirmButtonColor: term?.result_published_at ? '#f43f5e' : '#10b981',
                                confirmButtonText: term?.result_published_at ? 'Yes, Unpublish' : 'Yes, Publish Live',
                            }).then((result) => {
                                if (result.isConfirmed) {
                                    router.post(route('results.management.publish'), {
                                        term_id: term?.id,
                                        publish: !term?.result_published_at
                                    }, {
                                        onSuccess: () => {
                                            Swal.fire(
                                                'Success!',
                                                `Results have been ${!term?.result_published_at ? 'published' : 'unpublished'}.`,
                                                'success'
                                            );
                                        }
                                    });
                                }
                            });
                        }}
                        className={`px-4 py-2 rounded-lg font-bold text-xs transition-all shadow-lg flex items-center gap-2 ${sessions.find(s => s.id == data.academic_session_id)?.terms?.find(t => t.id == data.term_id)?.result_published_at
                            ? 'bg-white border border-rose-200 text-rose-600 hover:bg-rose-50'
                            : 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-emerald-500/30'
                            }`}
                    >
                        {sessions.find(s => s.id == data.academic_session_id)?.terms?.find(t => t.id == data.term_id)?.result_published_at
                            ? 'Unpublish'
                            : 'Publish Results'
                        }
                    </button>
                </div>
            )}

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
                    {classes.map(c => {
                        const className = c.name || `${c.school_class?.name || c.schoolClass?.name || ''}${c.class_arm?.name !== 'No arm' && c.classArm?.name !== 'No arm' ? ' ' + (c.class_arm?.name || c.classArm?.name || '') : ''}`.trim();
                        return (
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
                                <span className="text-sm font-medium truncate">{className || 'Unknown Class'}</span>
                            </div>
                        )
                    })}
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

            <div className="flex flex-wrap justify-end gap-3 pt-4 border-t border-gray-100 dark:border-slate-700">
                
                <button
                    onClick={submit}
                    disabled={processing || !data.term_id || (data.generation_mode === 'class' ? data.class_section_ids.length === 0 : data.student_ids.length === 0)}
                    className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 text-white rounded-lg font-bold shadow-lg shadow-indigo-500/30 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                    <Download size={18} />
                    Generate & Download CSV
                </button>
                <button
                    type="button"
                    onClick={handleSendSms}
                    disabled={processing || !data.term_id || (data.generation_mode === 'class' ? data.class_section_ids.length === 0 : data.student_ids.length === 0)}
                    className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white rounded-lg font-bold shadow-lg shadow-blue-500/30 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                    <Send size={18} />
                    Send SMS to Parents
                </button>
            </div>

            {/* History Section */}
            {/* <div className="mt-8 border-t border-gray-200 dark:border-slate-800 pt-6">
                <h3 className="font-bold text-gray-800 dark:text-gray-200 text-lg mb-4">Generated Batches</h3>

                {pinHistory && pinHistory.length > 0 ? (
                    <div className="overflow-x-auto border border-gray-200 dark:border-slate-700 rounded-lg">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-gray-50 dark:bg-slate-900 border-b border-gray-200 dark:border-slate-700">
                                <tr>
                                    <th className="px-4 py-3 font-semibold text-gray-700 dark:text-gray-300">Session</th>
                                    <th className="px-4 py-3 font-semibold text-gray-700 dark:text-gray-300">Term</th>
                                    <th className="px-4 py-3 font-semibold text-gray-700 dark:text-gray-300">Generated On</th>
                                    <th className="px-4 py-3 font-semibold text-gray-700 dark:text-gray-300 text-center">PIN Count</th>
                                    <th className="px-4 py-3 font-semibold text-gray-700 dark:text-gray-300">Generated By</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 dark:divide-slate-800">
                                {pinHistory.map((batch, idx) => (
                                    <tr key={idx} className="hover:bg-gray-50 dark:hover:bg-slate-800/50">
                                        <td className="px-4 py-3 text-gray-800 dark:text-gray-300">
                                            {batch.academic_session?.name || 'Unknown Session'}
                                        </td>
                                        <td className="px-4 py-3 text-gray-600 dark:text-gray-400">
                                            {batch.term?.name || 'Unknown Term'}
                                        </td>
                                        <td className="px-4 py-3 text-gray-600 dark:text-gray-400">
                                            {new Date(batch.created_date).toLocaleDateString(undefined, {
                                                year: 'numeric', month: 'long', day: 'numeric'
                                            })}
                                        </td>
                                        <td className="px-4 py-3 text-center text-indigo-600 dark:text-indigo-400 font-bold">
                                            {batch.count}
                                        </td>
                                        <td className="px-4 py-3 text-gray-600 dark:text-gray-400 text-xs">
                                            {batch.creator?.name || 'System / Unknown'}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="text-center py-8 bg-gray-50 dark:bg-slate-900/50 rounded-lg border border-dashed border-gray-300 dark:border-slate-700">
                        <Users className="mx-auto h-8 w-8 text-gray-400 mb-2 opacity-50" />
                        <p className="text-sm text-gray-500 dark:text-gray-400">No PIN generation history found.</p>
                    </div>
                )}
            </div> */}
        </div>
    );
}
