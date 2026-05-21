import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, Link, router } from '@inertiajs/react';
import Card from '@/Components/Card';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import { ArrowLeft, Upload, FileSpreadsheet, Save, Trash2, AlertCircle, CheckCircle } from 'lucide-react';
import { toast } from 'react-toastify';
import { useState, useRef } from 'react';
import * as XLSX from 'xlsx';

export default function Import({ auth, classSections, sessions }) {
    const [importedData, setImportedData] = useState([]);
    const [fileName, setFileName] = useState('');
    const fileInputRef = useRef(null);
    const [isProcessing, setIsProcessing] = useState(false);

    // Default configurations
    const currentSessionId = sessions.find(s => s.is_current)?.id || sessions[0]?.id;

    // Helper to format date for HTML date input (YYYY-MM-DD)
    const formatDateForInput = (val) => {
        if (!val) return '';

        try {
            // Handle JS Date objects
            if (val instanceof Date) {
                if (isNaN(val.getTime())) return '';
                const y = val.getFullYear();
                const m = String(val.getMonth() + 1).padStart(2, '0');
                const d = String(val.getDate()).padStart(2, '0');
                return `${y}-${m}-${d}`;
            }

            // Handle Excel serial numbers (if they come through as numbers)
            if (typeof val === 'number') {
                const date = new Date(Math.round((val - 25569) * 86400 * 1000));
                if (!isNaN(date.getTime())) {
                    const y = date.getFullYear();
                    const m = String(date.getMonth() + 1).padStart(2, '0');
                    const d = String(date.getDate()).padStart(2, '0');
                    return `${y}-${m}-${d}`;
                }
            }

            // If it's a string, attempt careful parsing
            if (typeof val === 'string') {
                const trimmed = val.trim();
                if (!trimmed) return '';

                // Match DD/MM/YYYY or D/M/YYYY (common in localized Excel)
                let match = trimmed.match(/^(\d{1,2})[-/.](\d{1,2})[-/.](\d{4})$/);
                if (match) {
                    const d = match[1].padStart(2, '0');
                    const m = match[2].padStart(2, '0');
                    const y = match[3];
                    return `${y}-${m}-${d}`;
                }

                // Match YYYY/MM/DD
                match = trimmed.match(/^(\d{4})[-/.](\d{1,2})[-/.](\d{1,2})$/);
                if (match) {
                    const y = match[1];
                    const m = match[2].padStart(2, '0');
                    const d = match[3].padStart(2, '0');
                    return `${y}-${m}-${d}`;
                }

                // Fallback to native Date.parse
                const parsed = new Date(trimmed);
                if (!isNaN(parsed.getTime())) {
                    const y = parsed.getFullYear();
                    const m = String(parsed.getMonth() + 1).padStart(2, '0');
                    const d = String(parsed.getDate()).padStart(2, '0');
                    return `${y}-${m}-${d}`;
                }
            }

            return val;
        } catch (e) {
            console.error("Date parsing error:", e, val);
            return '';
        }
    };

    // Handle File Upload & Parsing
    const handleFileUpload = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setFileName(file.name);
        const reader = new FileReader();

        reader.onload = (evt) => {
            try {
                const bstr = evt.target.result;
                const workbook = XLSX.read(bstr, { type: 'binary', cellDates: true });
                const wsname = workbook.SheetNames[0];
                const ws = workbook.Sheets[wsname];
                const data = XLSX.utils.sheet_to_json(ws);

                // Map and sanitize data immediately
                const mappedData = data.map((row, index) => ({
                    id: index, // Temporary ID for UI key
                    surname: row['Surname'] || row['surname'] || '',
                    othername: row['Othername'] || row['othername'] || row['Firstname'] || '',
                    gender: (row['Gender'] || row['gender'] || 'male').toLowerCase(),
                    date_of_birth: formatDateForInput(row['Date of Birth'] || row['DOB']),
                    address: row['Address'] || '',
                    guardian_name: row['Guardian'] || row['Guardian Name'] || '',
                    guardian_number: row['Guardian Phone'] || row['Guardian Number'] || '',
                    guardian_email: row['Guardian Email'] || '',
                    class_section_id: '', // User must select or we try to map
                    academic_session_id: currentSessionId,
                    errors: [],
                }));

                if (mappedData.length === 0) {
                    toast.error("The uploaded file appears to be empty.");
                    return;
                }

                setImportedData(mappedData);
                toast.success(`Loaded ${mappedData.length} students. Please review and assign classes.`);
            } catch (error) {
                console.error("Error parsing file:", error);
                toast.error("Failed to parse Excel file. Please ensure it is a valid .xlsx or .csv file.");
            }
        };

        reader.readAsBinaryString(file);
    };

    // Update cell data
    const updateRow = (id, field, value) => {
        setImportedData(prev => prev.map(row => {
            if (row.id === id) {
                return { ...row, [field]: value };
            }
            return row;
        }));
    };

    // Bulk update class
    const [bulkClassId, setBulkClassId] = useState('');
    const applyBulkClass = () => {
        if (!bulkClassId) return;
        setImportedData(prev => prev.map(row => ({ ...row, class_section_id: bulkClassId })));
        toast.info("Applied class to all records.");
    };

    // Remove row
    const deleteRow = (id) => {
        setImportedData(prev => prev.filter(row => row.id !== id));
    };

    // Submit Data
    const submitImport = () => {
        // Validation
        const cleanData = [];
        let hasErrors = false;

        const validatesData = importedData.map(row => {
            const errors = [];
            if (!row.surname) errors.push("Surname required");
            if (!row.othername) errors.push("Othername required");
            if (!row.class_section_id) errors.push("Class required");

            if (errors.length > 0) hasErrors = true;

            return { ...row, errors };
        });

        if (hasErrors) {
            setImportedData(validatesData);
            toast.error("Please fix errors highlighted in the grid before uploading.");
            return;
        }

        setIsProcessing(true);

        router.post(route('students.import.store'), { students: importedData }, {
            onSuccess: () => {
                setImportedData([]);
                setFileName('');
            },
            onError: (err) => {
                setIsProcessing(false);
                console.log(err);
            },
            onFinish: () => setIsProcessing(false)
        });
    };

    // Download Template
    const downloadTemplate = () => {
        const headers = ["Surname", "Othername", "Gender", "Date of Birth", "Address", "Guardian Name", "Guardian Phone", "Guardian Email"];
        const sampleData = [
            ["Doe", "John", "Male", "2010-05-15", "123 School Lane", "Jane Doe", "08012345678", "jane@example.com"],
        ];

        const wb = XLSX.utils.book_new();
        const ws = XLSX.utils.aoa_to_sheet([headers, ...sampleData]);
        XLSX.utils.book_append_sheet(wb, ws, "Students");
        XLSX.writeFile(wb, "Student_Import_Template.xlsx");
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center gap-4">
                    <Link href={route('students.index')} className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-all">
                        <ArrowLeft size={20} />
                    </Link>
                    <div className="flex flex-col gap-1">
                        <h2 className="text-2xl font-bold tracking-tight dark:text-white">Bulk Registration</h2>
                        <p className="text-slate-400 text-sm">Import students from Excel/CSV file.</p>
                    </div>
                </div>
            }
        >
            <Head title="Import Students" />

            <div className="space-y-6">
                {/* File Upload Section */}
                <Card>
                    <div className="flex flex-col md:flex-row items-center gap-6 p-4">
                        <div className="flex-1 w-full">
                            <label className="flex flex-col dark:bg-slate-900 dark:border-slate-800 items-center justify-center w-full h-32 border-2 border-dashed border-slate-700 rounded-2xl cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800/50 hover:border-indigo-500 dark:hover:border-indigo-500 transition-all bg-white dark:bg-slate-900 group">
                                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                    <FileSpreadsheet className="w-10 h-10 mb-3 text-slate-500 group-hover:text-indigo-400" />
                                    <p className="mb-2 text-sm text-slate-400"><span className="font-semibold">Click to upload</span> or drag and drop</p>
                                    <p className="text-xs text-slate-500 text-center">XLSX or CSV files</p>
                                </div>
                                <input ref={fileInputRef} type="file" className="hidden" accept=".xlsx, .xls, .csv" onChange={handleFileUpload} />
                            </label>
                        </div>
                        <div className="flex-1 space-y-4 w-full">
                            <div className="flex items-center justify-between">
                                <h3 className="text-lg font-semibold text-white">Instructions</h3>
                                <button
                                    onClick={downloadTemplate}
                                    className="text-xs font-bold text-indigo-400 hover:text-indigo-300 underline flex items-center gap-1"
                                >
                                    <FileSpreadsheet size={14} /> Download Template
                                </button>
                            </div>
                            <ul className="text-sm text-slate-400 space-y-2 list-disc pl-4">
                                <li>File must contain headers: <strong>Surname, Othername, Gender</strong>.</li>
                                <li>Optional headers: <strong>DOB, Address, Guardian, Guardian Phone</strong>.</li>
                                <li>Review the data in the grid below after uploading.</li>
                                <li>You can assign a Class to all students at once using the bulk tool.</li>
                            </ul>
                            {fileName && (
                                <div className="flex items-center gap-2 px-3 py-2 bg-indigo-500/10 text-indigo-400 rounded-lg text-sm border border-indigo-500/20">
                                    <FileSpreadsheet size={16} />
                                    <span className="truncate flex-1">{fileName}</span>
                                    <button onClick={() => { setImportedData([]); setFileName(''); if (fileInputRef.current) fileInputRef.current.value = ''; }} className="hover:text-red-400"><Trash2 size={16} /></button>
                                </div>
                            )}
                        </div>
                    </div>
                </Card>

                {/* Data Grid */}
                {importedData.length > 0 && (
                    <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        {/* Bulk Tools */}
                        <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-200 dark:border-slate-700">
                            <div className="flex flex-col sm:flex-row items-center gap-4 w-full md:w-auto">
                                <div className="flex items-center gap-2 w-full sm:w-auto">
                                    <select
                                        value={bulkClassId}
                                        onChange={(e) => setBulkClassId(e.target.value)}
                                        className="w-full sm:w-auto bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                                    >
                                        <option value="">Select Class to Apply All...</option>
                                        {classSections.map(cs => (
                                            <option key={cs.id} value={cs.id}>{cs.school_class?.name}{cs.class_arm?.name !== 'No arm' ? ` - ${cs.class_arm?.name}` : ''}</option>
                                        ))}
                                    </select>
                                    <button onClick={applyBulkClass} className="px-3 py-2 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-700 dark:text-white rounded-lg text-sm transition-colors whitespace-nowrap">
                                        Apply
                                    </button>
                                </div>
                                <div className="text-slate-600 dark:text-slate-400 text-sm whitespace-nowrap">
                                    <strong>{importedData.length}</strong> students ready.
                                </div>
                            </div>
                            <PrimaryButton onClick={submitImport} disabled={isProcessing} className="w-full md:w-auto gap-2 justify-center">
                                {isProcessing ? (
                                    <>Processing...</>
                                ) : (
                                    <>
                                        <Save size={18} /> Upload All
                                    </>
                                )}
                            </PrimaryButton>
                        </div>

                        {/* Table */}
                        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden overflow-x-auto shadow-sm">
                            <table className="w-full text-sm text-left text-slate-600 dark:text-slate-400">
                                <thead className="text-xs text-slate-700 dark:text-slate-400 uppercase bg-slate-100 dark:bg-slate-800">
                                    <tr>
                                        <th className="px-4 py-3 font-bold">Surname *</th>
                                        <th className="px-4 py-3 font-bold">Othername *</th>
                                        <th className="px-4 py-3 font-bold">Gender *</th>
                                        <th className="px-4 py-3 font-bold w-48">Class *</th>
                                        <th className="px-4 py-3 font-bold">DOB</th>
                                        <th className="px-4 py-3 font-bold">Guardian</th>
                                        <th className="px-4 py-3 font-bold">Phone</th>
                                        <th className="px-4 py-3 font-bold">Email</th>
                                        <th className="px-4 py-3 text-center font-bold">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                    {importedData.map((student) => (
                                        <tr key={student.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                                            <td className="px-2 py-2">
                                                <input
                                                    type="text"
                                                    value={student.surname}
                                                    onChange={e => updateRow(student.id, 'surname', e.target.value)}
                                                    className={`w-full bg-transparent border-0 border-b border-transparent focus:border-indigo-500 focus:ring-0 px-2 py-1 text-slate-800 dark:text-slate-200 placeholder-slate-400 ${student.errors?.includes('Surname required') ? 'border-red-500' : ''}`}
                                                    placeholder="Surname"
                                                />
                                            </td>
                                            <td className="px-2 py-2">
                                                <input
                                                    type="text"
                                                    value={student.othername}
                                                    onChange={e => updateRow(student.id, 'othername', e.target.value)}
                                                    className={`w-full bg-transparent border-0 border-b border-transparent focus:border-indigo-500 focus:ring-0 px-2 py-1 text-slate-800 dark:text-slate-200 placeholder-slate-400 ${student.errors?.includes('Othername required') ? 'border-red-500' : ''}`}
                                                    placeholder="Othername"
                                                />
                                            </td>
                                            <td className="px-2 py-2">
                                                <select
                                                    value={student.gender}
                                                    onChange={e => updateRow(student.id, 'gender', e.target.value)}
                                                    className="bg-white dark:bg-slate-800 border-0 text-slate-800 dark:text-slate-300 focus:ring-0 w-24 cursor-pointer rounded-lg"
                                                >
                                                    <option value="male">Male</option>
                                                    <option value="female">Female</option>
                                                    <option value="other">Other</option>
                                                </select>
                                            </td>
                                            <td className="px-2 py-2">
                                                <select
                                                    value={student.class_section_id}
                                                    onChange={e => updateRow(student.id, 'class_section_id', e.target.value)}
                                                    className={`bg-white dark:bg-slate-800 border-0 border-b ${student.errors?.includes('Class required') ? 'border-red-500' : 'border-transparent'} text-slate-800 dark:text-slate-300 focus:ring-0 w-full cursor-pointer rounded-lg`}
                                                >
                                                    <option value="">Select Class...</option>
                                                    {classSections.map(cs => (
                                                        <option key={cs.id} value={cs.id}>{cs.school_class?.name}{cs.class_arm?.name !== 'No arm' ? ` - ${cs.class_arm?.name}` : ''}</option>
                                                    ))}
                                                </select>
                                            </td>
                                            <td className="px-2 py-2">
                                                <input
                                                    type="date"
                                                    value={student.date_of_birth}
                                                    onChange={e => updateRow(student.id, 'date_of_birth', e.target.value)}
                                                    className="bg-transparent border-0 focus:ring-0 text-xs w-32 text-slate-800 dark:text-slate-300"
                                                />
                                            </td>
                                            <td className="px-2 py-2">
                                                <input
                                                    type="text"
                                                    value={student.guardian_name}
                                                    onChange={e => updateRow(student.id, 'guardian_name', e.target.value)}
                                                    className="w-full bg-transparent border-0 border-b border-transparent focus:border-indigo-500 focus:ring-0 px-2 py-1 text-xs text-slate-800 dark:text-slate-300 placeholder-slate-400"
                                                    placeholder="Guardian Name"
                                                />
                                            </td>
                                            <td className="px-2 py-2">
                                                <input
                                                    type="text"
                                                    value={student.guardian_number}
                                                    onChange={e => updateRow(student.id, 'guardian_number', e.target.value)}
                                                    className="w-full bg-transparent border-0 border-b border-transparent focus:border-indigo-500 focus:ring-0 px-2 py-1 text-xs text-slate-800 dark:text-slate-300 placeholder-slate-400"
                                                    placeholder="Phone"
                                                />
                                            </td>
                                            <td className="px-2 py-2">
                                                <input
                                                    type="email"
                                                    value={student.guardian_email}
                                                    onChange={e => updateRow(student.id, 'guardian_email', e.target.value)}
                                                    className="w-full bg-transparent border-0 border-b border-transparent focus:border-indigo-500 focus:ring-0 px-2 py-1 text-xs text-slate-800 dark:text-slate-300 placeholder-slate-400"
                                                    placeholder="Email"
                                                />
                                            </td>
                                            <td className="px-2 py-2 text-center">
                                                <button onClick={() => deleteRow(student.id)} className="p-1 text-slate-400 hover:text-red-500 transition-colors">
                                                    <Trash2 size={16} />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>
        </AuthenticatedLayout>
    );
}
