import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';
import Card from '@/Components/Card';
import PrimaryButton from '@/Components/PrimaryButton';
import Pagination from '@/Components/Pagination';
import { UserPlus, Pencil, Trash2, Search, Filter, Hash, User, GraduationCap, MapPin, Eye, Upload } from 'lucide-react';
import Swal from 'sweetalert2';
import { toast } from 'react-toastify';
import { useState } from 'react';

export default function Index({ auth, students, classes, classArms = [], filters }) {
    const [params, setParams] = useState({
        search: filters.search || '',
        status: filters.status || 'all',
        class_id: filters.class_id || 'all',
        class_arm_id: filters.class_arm_id || 'all'
    });

    const [selectedStudents, setSelectedStudents] = useState([]);

    // Check if all students on current page are selected
    const allSelected = students.data.length > 0 && selectedStudents.length === students.data.length;

    const handleSelectAll = (e) => {
        if (e.target.checked) {
            setSelectedStudents(students.data.map(student => student.id));
        } else {
            setSelectedStudents([]);
        }
    };

    const handleSelectStudent = (id) => {
        if (selectedStudents.includes(id)) {
            setSelectedStudents(selectedStudents.filter(studentId => studentId !== id));
        } else {
            setSelectedStudents([...selectedStudents, id]);
        }
    };

    const handleBulkDelete = () => {
        Swal.fire({
            title: 'Delete Selected Students?',
            text: `This will permanently delete ${selectedStudents.length} student records.`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#ef4444',
            cancelButtonColor: '#334155',
            confirmButtonText: 'Yes, delete them!',
            background: '#0f172a',
            color: '#f1f5f9',
            customClass: {
                popup: 'rounded-[1.5rem] border border-slate-800 shadow-2xl',
                confirmButton: 'rounded-xl px-6 py-2.5 font-bold uppercase tracking-widest text-xs transition-all',
                cancelButton: 'rounded-xl px-6 py-2.5 font-bold uppercase tracking-widest text-xs transition-all'
            }
        }).then((result) => {
            if (result.isConfirmed) {
                router.post(route('students.bulk-delete'), { student_ids: selectedStudents }, {
                    onSuccess: () => {
                        setSelectedStudents([]);
                    },
                    onError: () => toast.error('Failed to delete students')
                });
            }
        });
    };

    // Debounce search update
    const updateParams = (newParams) => {
        setParams(prev => ({ ...prev, ...newParams }));

        router.get(route('students.index'), { ...params, ...newParams }, {
            preserveState: true,
            preserveScroll: true,
            replace: true
        });
    };

    const deleteStudent = (id) => {
        Swal.fire({
            title: 'Delete Student Record?',
            text: "This action is permanent and will remove all student data.",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#ef4444',
            cancelButtonColor: '#334155',
            confirmButtonText: 'Yes, delete it!',
            background: '#0f172a',
            color: '#f1f5f9',
            customClass: {
                popup: 'rounded-[1.5rem] border border-slate-800 shadow-2xl',
                confirmButton: 'rounded-xl px-6 py-2.5 font-bold uppercase tracking-widest text-xs transition-all',
                cancelButton: 'rounded-xl px-6 py-2.5 font-bold uppercase tracking-widest text-xs transition-all'
            }
        }).then((result) => {
            if (result.isConfirmed) {
                router.delete(route('students.destroy', id));
            }
        });
    };

    const getStatusStyle = (status) => {
        switch (status) {
            case 'active': return 'bg-emerald-500/20 text-emerald-600 border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20';
            case 'inactive': return 'bg-rose-500/20 text-rose-600 border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-400 dark:border-rose-500/20';
            case 'graduated': return 'bg-indigo-500/20 text-indigo-600 border-indigo-500/30 dark:bg-indigo-500/10 dark:text-indigo-400 dark:border-indigo-500/20';
            default: return 'bg-slate-500/20 text-slate-600 border-slate-500/30 dark:bg-slate-500/10 dark:text-slate-400 dark:border-slate-500/20';
        }
    };

    return (
        <AuthenticatedLayout
            header={
                < div className="flex flex-col gap-1" >
                    <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Student Registry</h2>
                    <p className="text-slate-600 dark:text-slate-400 text-sm">Manage and monitor all enrolled students across all levels.</p>
                </div >
            }
        >
            <Head title="Students" />

            <div className="space-y-6">
                <Card
                    title="Student Directory"
                    description={`Overseeing ${students.total} students in the current database.`}
                    actions={
                        <div className="flex flex-col gap-3">
                            {/* Filters Row */}
                            <div className="flex flex-col sm:flex-row items-center gap-3">
                                {/* Search */}
                                <div className="relative group w-full sm:w-48">
                                    <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 dark:text-slate-500 group-focus-within:text-indigo-600 dark:group-focus-within:text-indigo-400 transition-colors" />
                                    <input
                                        type="text"
                                        placeholder="Search..."
                                        value={params.search}
                                        onChange={e => updateParams({ search: e.target.value })}
                                        className="w-full pl-10 pr-4 py-2 bg-white dark:bg-slate-900/50 border-slate-300 dark:border-slate-800 text-sm text-slate-900 dark:text-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all"
                                    />
                                </div>

                                {/* Status Filter */}
                                <div className="w-full sm:w-32">
                                    <select
                                        value={params.status}
                                        onChange={e => updateParams({ status: e.target.value })}
                                        className="w-full px-3 py-2 bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-800 text-sm text-slate-900 dark:text-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all cursor-pointer shadow-sm"
                                    >
                                        <option value="all">All Status</option>
                                        <option value="active">Active</option>
                                        <option value="inactive">Inactive</option>
                                        <option value="graduated">Graduated</option>
                                    </select>
                                </div>

                                {/* Class Filter */}
                                <div className="w-full sm:w-40">
                                    <select
                                        value={params.class_id}
                                        onChange={e => updateParams({ class_id: e.target.value })}
                                        className="w-full px-3 py-2 bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-800 text-sm text-slate-900 dark:text-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all cursor-pointer shadow-sm"
                                    >
                                        <option value="all">All Classes</option>
                                        {classes.map(cls => (
                                            <option key={cls.id} value={cls.id}>{cls.name}</option>
                                        ))}
                                    </select>
                                </div>

                                {/* Class Arm Filter */}
                                <div className="w-full sm:w-32">
                                    <select
                                        value={params.class_arm_id}
                                        onChange={e => updateParams({ class_arm_id: e.target.value })}
                                        className="w-full px-3 py-2 bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-800 text-sm text-slate-900 dark:text-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all cursor-pointer shadow-sm"
                                    >
                                        <option value="all">All Arms</option>
                                        {classArms.filter(arm => arm.name !== 'No arm').map(arm => (
                                            <option key={arm.id} value={arm.id}>{arm.name}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            {/* Actions Row */}
                            {(auth.user.roles.includes('Super Admin') || auth.user.permissions.includes('create student')) && (
                                <div className="flex gap-2 w-full sm:w-auto sm:ml-auto">
                                    <Link href={route('students.import')}>
                                        <PrimaryButton className="gap-2 bg-slate-700 hover:bg-slate-600 border border-slate-600 w-full sm:w-auto justify-center">
                                            <Upload size={18} />
                                            <span className="hidden lg:inline">Import</span>
                                        </PrimaryButton>
                                    </Link>
                                    <Link href={route('students.create')}>
                                        <PrimaryButton className="gap-2 w-full sm:w-auto justify-center">
                                            <UserPlus size={18} />
                                            <span className="hidden lg:inline">Register</span>
                                        </PrimaryButton>
                                    </Link>
                                    {selectedStudents.length > 0 && (
                                        <button
                                            onClick={handleBulkDelete}
                                            className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl shadow-lg shadow-rose-500/30 transition-all flex items-center gap-2 font-bold text-xs uppercase tracking-widest"
                                        >
                                            <Trash2 size={16} />
                                            <span>Delete ({selectedStudents.length})</span>
                                        </button>
                                    )}
                                </div>
                            )}
                        </div>
                    }
                >
                    <div className="overflow-x-auto -mx-6">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-slate-300 dark:border-slate-800/50 bg-slate-50 dark:bg-slate-900/30">
                                    <th className="px-6 py-4">
                                        <input
                                            type="checkbox"
                                            checked={allSelected}
                                            onChange={handleSelectAll}
                                            className="w-4 h-4 rounded border-slate-400 text-indigo-600 focus:ring-indigo-500 bg-white dark:bg-slate-800 dark:border-slate-600"
                                        />
                                    </th>
                                    <th className="px-6 py-4 text-[10px] font-bold text-slate-700 dark:text-slate-500 uppercase tracking-widest">Student</th>
                                    <th className="px-6 py-4 text-[10px] font-bold text-slate-700 dark:text-slate-500 uppercase tracking-widest">Registration</th>
                                    <th className="px-6 py-4 text-[10px] font-bold text-slate-700 dark:text-slate-500 uppercase tracking-widest">Enrollment</th>
                                    <th className="px-6 py-4 text-[10px] font-bold text-slate-700 dark:text-slate-500 uppercase tracking-widest">Status</th>
                                    <th className="px-6 py-4 text-[10px] font-bold text-slate-700 dark:text-slate-500 uppercase tracking-widest text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-200 dark:divide-slate-800/30">
                                {students.data.length === 0 ? (
                                    <tr>
                                        <td colSpan="6" className="py-24 text-center">
                                            <div className="w-16 h-16 bg-slate-100 dark:bg-slate-900 rounded-3xl border border-slate-300 dark:border-slate-800 flex items-center justify-center text-slate-400 dark:text-slate-600 mx-auto mb-4">
                                                <User size={32} />
                                            </div>
                                            <h3 className="text-slate-800 dark:text-slate-300 font-bold mb-1 text-lg">No Records Found</h3>
                                            <p className="text-slate-600 dark:text-slate-500 text-sm italic max-w-xs mx-auto">
                                                {params.search
                                                    ? `We couldn't find any students matching "${params.search}". Try a different spelling or keyword.`
                                                    : "The student directory is currently empty."
                                                }
                                            </p>
                                        </td>
                                    </tr>
                                ) : (
                                    students.data.map((student) => (
                                        <tr key={student.id} className="group hover:bg-indigo-50/50 dark:hover:bg-slate-800/20 transition-colors">
                                            <td className="px-6 py-4">
                                                <input
                                                    type="checkbox"
                                                    checked={selectedStudents.includes(student.id)}
                                                    onChange={() => handleSelectStudent(student.id)}
                                                    className="w-4 h-4 rounded border-slate-400 text-indigo-600 focus:ring-indigo-500 bg-white dark:bg-slate-800 dark:border-slate-600"
                                                />
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-800 overflow-hidden flex items-center justify-center">
                                                        {student.profile_picture ? (
                                                            <img src={`/storage/${student.profile_picture}`} alt="" className="w-full h-full object-cover" />
                                                        ) : (
                                                            <User size={20} className="text-slate-400 dark:text-slate-700" />
                                                        )}
                                                    </div>
                                                    <div>
                                                        <Link href={route('students.show', student.id)}>
                                                            <p className="text-sm font-bold text-slate-800 dark:text-slate-200 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors cursor-pointer">{student.surname} {student.othername}</p>
                                                        </Link>
                                                        <div className="flex items-center gap-1.5 mt-0.5">
                                                            <MapPin size={10} className="text-slate-500 dark:text-slate-600" />
                                                            <p className="text-[10px] text-slate-600 dark:text-slate-500 truncate max-w-[150px]">{student.address || 'No address'}</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-6 h-6 rounded-md bg-indigo-500/15 dark:bg-indigo-500/10 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                                                        <Hash size={12} />
                                                    </div>
                                                    <code className="text-xs font-mono text-slate-700 dark:text-slate-400 tracking-tighter">{student.registration_number}</code>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex flex-col">
                                                    <p className="text-xs font-bold text-slate-800 dark:text-slate-300">
                                                        {student.class_section?.school_class?.name || 'N/A'}
                                                    </p>
                                                    <div className="flex items-center gap-1 mt-1">
                                                        <GraduationCap size={10} className="text-slate-500 dark:text-slate-500" />
                                                        <span className="text-[10px] text-slate-600 dark:text-slate-500 font-medium">Arm: {student.class_section?.class_arm?.name === 'No arm' ? 'Classwide' : student.class_section?.class_arm?.name || 'Unassigned'}</span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`px-2.5 py-1 rounded-lg border text-[10px] font-black uppercase tracking-widest ${getStatusStyle(student.status)}`}>
                                                    {student.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    <Link
                                                        href={route('students.show', student.id)}
                                                        className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-indigo-500 hover:border-indigo-500 dark:hover:bg-slate-700 hover:text-white dark:hover:text-white transition-all shadow-sm"
                                                        title="View Profile"
                                                    >
                                                        <Eye size={16} />
                                                    </Link>
                                                    {(auth.user.roles.includes('Super Admin') || auth.user.permissions.includes('manage student')) && (
                                                        <>
                                                            <Link
                                                                href={route('students.edit', student.id)}
                                                                className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-blue-500 hover:border-blue-500 dark:hover:bg-slate-700 hover:text-white dark:hover:text-white transition-all shadow-sm"
                                                                title="Edit Record"
                                                            >
                                                                <Pencil size={16} />
                                                            </Link>
                                                            <button
                                                                onClick={() => deleteStudent(student.id)}
                                                                className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-rose-500 dark:text-rose-400 hover:bg-rose-500 hover:border-rose-500 hover:text-white transition-all shadow-sm"
                                                                title="Delete Student"
                                                            >
                                                                <Trash2 size={16} />
                                                            </button>
                                                        </>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                    <Pagination links={students.links} />
                </Card>
            </div>
        </AuthenticatedLayout >
    );
}