import { Head } from '@inertiajs/react';
import { CheckCircle2, XCircle, UserSquare2 } from 'lucide-react';

export default function Verify({ record, type, school }) {
    if (!record) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
                <div className="bg-white p-8 rounded-2xl shadow-xl text-center max-w-sm w-full">
                    <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <span className="text-2xl">⚠️</span>
                    </div>
                    <h1 className="text-xl font-bold text-slate-900 mb-2">Invalid ID</h1>
                    <p className="text-slate-600">The scanned link does not match any active record.</p>
                </div>
            </div>
        );
    }

    // Determine status color
    const isActive = record.status === 'active';
    const statusColor = isActive ? 'bg-emerald-500' : 'bg-red-500';

    return (
        <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
            <Head title={`Verify ID - ${record.first_name || record.name}`} />

            <div className="w-full max-w-md bg-white rounded-3xl overflow-hidden shadow-2xl relative">
                {/* Header Background */}
                <div className="h-32 bg-indigo-600 relative overflow-hidden">
                    <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
                    <div className="absolute bottom-0 left-0 w-full h-16 bg-gradient-to-t from-black/50 to-transparent"></div>
                </div>

                {/* Profile Photo */}
                <div className="relative px-6">
                    <div className="flex flex-col items-center mb-8 -mt-16">
                        <div className="w-32 h-32 bg-white rounded-2xl p-1 shadow-lg cursor-zoom-in">
                            <div className="w-full h-full bg-slate-200 rounded-xl overflow-hidden relative">
                                {record.profile_picture || record.profile_image ? (
                                    <img src={`/storage/${record.profile_picture || record.profile_image}`} className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-slate-400">
                                        <UserSquare2 className="w-12 h-12" />
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Content */}
                    <div className="space-y-6 pb-8">
                        <div className="text-center border-b border-slate-100 pb-6">
                            <h2 className="text-xl font-bold text-slate-900">{type === 'staff' ? record.name : `${record.first_name} ${record.last_name}`}</h2>
                            <p className="text-slate-500">{type === 'staff' ? (record.staff_id || 'Staff ID: N/A') : record.registration_number}</p>

                            <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold text-white mt-3 ${statusColor}`}>
                                {isActive ? <CheckCircle2 size={12} /> : <XCircle size={12} />}
                                <span className="uppercase">{record.status || 'Active'} {type === 'staff' ? 'STAFF' : 'STUDENT'}</span>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4 text-sm">
                            <div className="bg-slate-50 p-3 rounded-xl col-span-2">
                                <p className="text-xs text-slate-400 font-bold uppercase mb-1">School</p>
                                <p className="font-semibold text-slate-900">{school?.school_name || 'School Name'}</p>
                            </div>

                            {type === 'staff' ? (
                                <div className="bg-slate-50 p-3 rounded-xl col-span-2">
                                    <p className="text-xs text-slate-400 font-bold uppercase mb-1">Role / Designation</p>
                                    <p className="font-semibold text-slate-900">{record.qualification || 'Staff Member'}</p>
                                </div>
                            ) : (
                                <>
                                    <div className="bg-slate-50 p-3 rounded-xl">
                                        <p className="text-xs text-slate-400 font-bold uppercase mb-1">Current Class</p>
                                        <p className="font-semibold text-slate-900">{record.class_section?.school_class?.name || 'N/A'}</p>
                                    </div>
                                    <div className="bg-slate-50 p-3 rounded-xl">
                                        <p className="text-xs text-slate-400 font-bold uppercase mb-1">Session</p>
                                        <p className="font-semibold text-slate-900">{record.academic_session?.name || 'N/A'}</p>
                                    </div>
                                </>
                            )}
                        </div>

                        <div className="text-center pt-4">
                            <p className="text-xs text-slate-400">Verified by {school?.school_name || 'School'} System</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
