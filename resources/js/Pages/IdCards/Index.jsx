import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, router } from '@inertiajs/react';
import Card from '@/Components/Card';
import PrimaryButton from '@/Components/PrimaryButton';
import { UserSquare2, Users, Settings, Filter, Printer, Save, CheckCircle2, Download } from 'lucide-react';
import { useState } from 'react';
import Pagination from '@/Components/Pagination';
import Modal from '@/Components/Modal';
import Print from './Print';

export default function Index({ auth, classes, sessions, students, staff, idConfig, filters, school }) {
    const activeTab = filters.tab || 'students';

    // Settings Form
    const settingsForm = useForm({
        class_expirations: idConfig?.class_expirations || {},
        staff_expiration: idConfig?.staff_expiration || '', // Global staff expiration
    });

    const [selectedSessionId, setSelectedSessionId] = useState(sessions[0]?.id || '');

    const [selectedUsers, setSelectedUsers] = useState([]);
    const [showingPrintModal, setShowingPrintModal] = useState(false);

    // Toggle user selection
    const toggleSelection = (id) => {
        if (selectedUsers.includes(id)) {
            setSelectedUsers(selectedUsers.filter(u => u !== id));
        } else {
            setSelectedUsers([...selectedUsers, id]);
        }
    };

    const toggleAll = (users) => {
        if (selectedUsers.length === users.length) {
            setSelectedUsers([]);
        } else {
            setSelectedUsers(users.map(u => u.id));
        }
    };

    const handleTabChange = (tab) => {
        router.get(route('id-cards.index'), { tab }, { preserveState: true });
    };

    const handleFilterChange = (key, value) => {
        router.get(route('id-cards.index'), {
            tab: activeTab,
            ...filters,
            [key]: value
        }, { preserveState: true });
    };

    const submitSettings = (e) => {
        e.preventDefault();
        settingsForm.post(route('id-cards.settings'), {
            preserveScroll: true,
            onSuccess: () => {
                // optional: show toast
            }
        });
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex flex-col gap-1">
                    <h2 className="text-2xl font-bold tracking-tight text-slate-800 dark:text-white">ID Card Management</h2>
                    <p className="text-slate-600 dark:text-slate-400 text-sm">Generate and manage identity cards for students and staff.</p>
                </div>
            }
        >
            <Head title="ID Cards" />

            <div className="flex gap-4 mb-6 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-slate-300 dark:scrollbar-thumb-slate-600">
                {[
                    { id: 'students', name: 'Students', icon: UserSquare2 },
                    { id: 'staff', name: 'Staff', icon: Users },
                    { id: 'settings', name: 'Configuration', icon: Settings },
                ].map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => handleTabChange(tab.id)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all whitespace-nowrap ${activeTab === tab.id
                            ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20'
                            : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-700 shadow-sm border border-slate-200 dark:border-slate-700'
                            }`}
                    >
                        <tab.icon size={16} />
                        {tab.name}
                    </button>
                ))}
            </div>

            {activeTab === 'students' && (
                <div className="space-y-6">
                    {/* Filters */}
                    <Card>
                        <div className="flex flex-col sm:flex-row items-end gap-4">
                            <div className="flex-1 w-full sm:w-auto">
                                <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Filter by Class</label>
                                <select
                                    value={filters.class_id || ''}
                                    onChange={(e) => handleFilterChange('class_id', e.target.value)}
                                    className="w-full bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-800 text-slate-700 dark:text-slate-200 rounded-xl focus:border-indigo-500 focus:ring-indigo-500"
                                >
                                    <option value="">All Classes</option>
                                    {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                </select>
                            </div>
                            <div className="flex-none w-full sm:w-auto">
                                <PrimaryButton
                                    onClick={() => setShowingPrintModal(true)}
                                    disabled={selectedUsers.length === 0}
                                    className="gap-2 w-full sm:w-auto justify-center"
                                >
                                    <Printer size={16} />
                                    Generate Selected ({selectedUsers.length})
                                </PrimaryButton>
                            </div>
                        </div>
                    </Card>

                    {/* Students List */}
                    <Card title="Student List" className="overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left text-slate-600 dark:text-slate-400">
                                <thead className="text-xs text-slate-500 uppercase bg-slate-50 dark:bg-slate-900/50">
                                    <tr>
                                        <th className="p-4 w-4">
                                            <input
                                                type="checkbox"
                                                className="rounded bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-indigo-600 focus:ring-indigo-600"
                                                onChange={() => toggleAll(students.data)}
                                                checked={students.data?.length > 0 && selectedUsers.length === students.data.length}
                                            />
                                        </th>
                                        <th className="p-4 whitespace-nowrap">Student Info</th>
                                        <th className="p-4 whitespace-nowrap">Admission No</th>
                                        <th className="p-4 whitespace-nowrap">Class</th>
                                        <th className="p-4 whitespace-nowrap">Expiration Date</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {students.data && students.data.map((student) => {
                                        return (
                                            <tr key={student.id} className="border-b border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                                                <td className="p-4">
                                                    <input
                                                        type="checkbox"
                                                        className="rounded bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-indigo-600 focus:ring-indigo-600"
                                                        checked={selectedUsers.includes(student.id)}
                                                        onChange={() => toggleSelection(student.id)}
                                                    />
                                                </td>
                                                <td className="p-4 font-medium text-slate-900 dark:text-white flex items-center gap-3">
                                                    <div className="w-8 h-8 shrink-0 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                                                        {student.profile_picture ? (
                                                            <img src={`/storage/${student.profile_picture}`} className="w-full h-full object-cover" />
                                                        ) : (
                                                            <UserSquare2 className="w-full h-full p-1.5 text-slate-500 dark:text-slate-400" />
                                                        )}
                                                    </div>
                                                    <span className="whitespace-nowrap">{student.first_name} {student.last_name}</span>
                                                </td>
                                                <td className="p-4 whitespace-nowrap">{student.registration_number}</td>
                                                <td className="p-4 whitespace-nowrap">{student.class_section?.school_class?.name} {student.class_section?.class_arm?.name}</td>
                                                <td className="p-4 whitespace-nowrap">
                                                    {/* Resolve expiration based on student session and class */}
                                                    {(() => {
                                                        const sessId = student.academic_session_id;
                                                        const clsId = student.class_section?.school_class_id;
                                                        const date = settingsForm.data.expirations?.[sessId]?.[clsId];

                                                        return date ? (
                                                            <span className="text-emerald-600 dark:text-emerald-400 font-medium">{date}</span>
                                                        ) : (
                                                            <span className="text-amber-500 dark:text-amber-400 flex items-center gap-1 text-xs font-medium"><CheckCircle2 size={14} /> Not Set</span>
                                                        );
                                                    })()}
                                                </td>
                                            </tr>
                                        );
                                    })}
                                    {students.data?.length === 0 && (
                                        <tr><td colSpan="5" className="p-8 text-center text-slate-500">No students found.</td></tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                        {students.links && <Pagination links={students.links} />}
                    </Card>
                </div>
            )}

            {activeTab === 'staff' && (
                <div className="space-y-6">
                    {/* Controls */}
                    <Card>
                        <div className="flex items-center justify-between gap-4">
                            <h3 className="font-bold text-slate-800 dark:text-slate-200">Staff Management</h3>
                            <div className="flex-none">
                                <PrimaryButton
                                    onClick={() => setShowingPrintModal(true)}
                                    disabled={selectedUsers.length === 0}
                                    className="gap-2"
                                >
                                    <Printer size={16} />
                                    Generate Selected ({selectedUsers.length})
                                </PrimaryButton>
                            </div>
                        </div>
                    </Card>

                    <Card title="Staff List" className="overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left text-slate-600 dark:text-slate-400">
                                <thead className="text-xs text-slate-500 uppercase bg-slate-50 dark:bg-slate-900/50">
                                    <tr>
                                        <th className="p-4 w-4">
                                            <input
                                                type="checkbox"
                                                className="rounded bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-indigo-600 focus:ring-indigo-600"
                                                onChange={() => toggleAll(staff.data)}
                                                checked={staff.data?.length > 0 && selectedUsers.length === staff.data.length}
                                            />
                                        </th>
                                        <th className="p-4 whitespace-nowrap">Staff Name</th>
                                        <th className="p-4 whitespace-nowrap">Staff ID</th>
                                        <th className="p-4 whitespace-nowrap">Role / Qualification</th>
                                        <th className="p-4 whitespace-nowrap">Expiration Date</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {staff.data && staff.data.map((user) => {
                                        return (
                                            <tr key={user.id} className="border-b border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                                                <td className="p-4">
                                                    <input
                                                        type="checkbox"
                                                        className="rounded bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-indigo-600 focus:ring-indigo-600"
                                                        checked={selectedUsers.includes(user.id)}
                                                        onChange={() => toggleSelection(user.id)}
                                                    />
                                                </td>
                                                <td className="p-4 font-medium text-slate-900 dark:text-white flex items-center gap-3">
                                                    <div className="w-8 h-8 shrink-0 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                                                        {user.profile_image ? (
                                                            <img src={`/storage/${user.profile_image}`} className="w-full h-full object-cover" />
                                                        ) : (
                                                            <UserSquare2 className="w-full h-full p-1.5 text-slate-500 dark:text-slate-400" />
                                                        )}
                                                    </div>
                                                    <span className="whitespace-nowrap">{user.name}</span>
                                                </td>
                                                <td className="p-4 whitespace-nowrap">{user.staff_id || 'N/A'}</td>
                                                <td className="p-4">
                                                    <div className="flex flex-col">
                                                        <span className="font-medium">{user.roles?.[0]?.name || 'Staff'}</span>
                                                        <span className="text-xs text-slate-500">{user.qualification}</span>
                                                    </div>
                                                </td>
                                                <td className="p-4 whitespace-nowrap">
                                                    {settingsForm.data.staff_expiration ? (
                                                        <span className="text-emerald-600 dark:text-emerald-400 font-medium">{settingsForm.data.staff_expiration}</span>
                                                    ) : (
                                                        <span className="text-amber-500 dark:text-amber-400 flex items-center gap-1 text-xs font-medium"><CheckCircle2 size={14} /> Not Set</span>
                                                    )}
                                                </td>
                                            </tr>
                                        );
                                    })}
                                    {staff.data?.length === 0 && (
                                        <tr><td colSpan="5" className="p-8 text-center text-slate-500">No staff members found.</td></tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                        {staff.links && <Pagination links={staff.links} />}
                    </Card>
                </div>
            )}

            {activeTab === 'settings' && (
                <div className="max-w-2xl mx-auto">
                    <Card title="ID Card Configuration" description="Manage global settings and expiration dates.">
                        <form onSubmit={submitSettings} className="space-y-6">

                            {/* Session Selector */}
                            <div>
                                <label className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-1">Select Session</label>
                                <select
                                    value={selectedSessionId}
                                    onChange={(e) => setSelectedSessionId(e.target.value)}
                                    className="w-full bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-800 text-slate-900 dark:text-slate-200 rounded-xl focus:border-indigo-500 focus:ring-indigo-500"
                                >
                                    {sessions.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                                </select>
                            </div>

                            {/* Class Expirations for Selected Session */}
                            {selectedSessionId && (
                                <div className="border-t border-slate-200 dark:border-slate-800 pt-6">
                                    <h3 className="font-bold text-slate-800 dark:text-white mb-4">Class Card Expirations for {sessions.find(s => s.id == selectedSessionId)?.name}</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {classes.map((cls) => {
                                            const currentVal = settingsForm.data.expirations?.[selectedSessionId]?.[cls.id] || '';
                                            return (
                                                <div key={cls.id}>
                                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">{cls.name}</label>
                                                    <input
                                                        type="date"
                                                        value={currentVal}
                                                        onChange={(e) => {
                                                            const newExps = { ...settingsForm.data.expirations };
                                                            if (!newExps[selectedSessionId]) newExps[selectedSessionId] = {};
                                                            newExps[selectedSessionId][cls.id] = e.target.value;
                                                            settingsForm.setData('expirations', newExps);
                                                        }}
                                                        className="w-full bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-800 text-slate-900 dark:text-slate-200 rounded-xl focus:border-indigo-500 focus:ring-indigo-500"
                                                    />
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}

                            {/* Staff Expiration */}
                            <div className="border-t border-slate-200 dark:border-slate-800 pt-6">
                                <h3 className="font-bold text-slate-800 dark:text-white mb-4">Staff ID Expiration</h3>
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Global Staff Expiration Date</label>
                                    <input
                                        type="date"
                                        value={settingsForm.data.staff_expiration}
                                        onChange={(e) => settingsForm.setData('staff_expiration', e.target.value)}
                                        className="w-full bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-800 text-slate-900 dark:text-slate-200 rounded-xl focus:border-indigo-500 focus:ring-indigo-500"
                                    />
                                    <p className="text-xs text-slate-500 mt-1">This date applies to ALL staff ID cards generated.</p>
                                </div>
                            </div>

                            <div className="flex justify-end pt-4">
                                <PrimaryButton disabled={settingsForm.processing} className="gap-2">
                                    <Save size={16} /> Save Configuration
                                </PrimaryButton>
                            </div>
                        </form>
                    </Card>
                </div>
            )}

            {/* Print Preview Modal */}
            <Modal show={showingPrintModal} onClose={() => setShowingPrintModal(false)} maxWidth="4xl">
                <div className="p-6 bg-white dark:bg-slate-900">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-lg font-bold text-slate-900 dark:text-white">Print Preview</h2>
                        <button onClick={() => window.print()} className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-500 no-print">
                            <Printer size={16} /> Print
                        </button>
                    </div>

                    {/* Render Print Component */}
                    {activeTab === 'students' && (
                        <div className="max-h-[70vh] overflow-y-auto bg-slate-100 p-8 rounded-xl border border-slate-200">
                            <Print
                                users={(students?.data || []).filter(u => selectedUsers.includes(u.id))}
                                type="student"
                                settings={idConfig}
                                school={school}
                            />
                        </div>
                    )}

                    {activeTab === 'staff' && (
                        <div className="max-h-[70vh] overflow-y-auto bg-slate-100 p-8 rounded-xl border border-slate-200">
                            <Print
                                users={(staff?.data || []).filter(u => selectedUsers.includes(u.id))}
                                type="staff"
                                settings={idConfig}
                                school={school}
                            />
                        </div>
                    )}
                </div>
            </Modal>

            {/* Hidden Print-Only Container - Renders only when printing to avoid modal clipping */}
            <div className="hidden print:block fixed inset-0 z-[99999] bg-white">
                <Print
                    users={activeTab === 'staff'
                        ? (staff?.data || []).filter(u => selectedUsers.includes(u.id))
                        : (students?.data || []).filter(u => selectedUsers.includes(u.id))
                    }
                    type={activeTab === 'staff' ? 'staff' : 'student'}
                    settings={idConfig}
                    school={school}
                />
            </div>
        </AuthenticatedLayout>
    );
}
