import { QRCodeSVG } from 'qrcode.react';
import { School, UserSquare2 } from 'lucide-react';

export default function Print({ users, type = 'student', settings, school }) {
    // Standard credit card ratio
    const cardStyle = {
        width: '3.37in', // 85.6mm
        height: '2.125in', // 53.98mm
    };

    return (
        <div className="print-container grid grid-cols-1 md:grid-cols-2 gap-8 print:block">
            <style>{`
                @media print {
                    @page { margin: 5mm; size: A4; }
                    body {
                        visibility: hidden;
                        background-color: white !important;
                    }
                    .print-container {
                        visibility: visible;
                        position: absolute;
                        top: 0;
                        left: 0;
                        min-height: 100vh;
                        width: 100%;
                        background-color: white;
                        z-index: 9999;
                        display: flex !important;
                        flex-direction: column !important;
                        align-items: center !important;
                        justify-content: flex-start !important; /* Start from top */
                        gap: 15mm !important;
                        padding-top: 5mm;
                        margin: 0 auto;
                    }
                    .print-container * {
                        visibility: visible;
                    }
                    .id-card-wrapper {
                        break-inside: avoid;
                        page-break-inside: avoid;
                        display: flex;
                        flex-direction: row;
                        justify-content: center;
                        gap: 10mm;
                        margin-bottom: 0;
                    }
                    * {
                        -webkit-print-color-adjust: exact !important;
                        print-color-adjust: exact !important;
                    }
                }
            `}</style>

            {users.map((user) => {
                let expDate = 'N/A';

                if (type === 'student') {
                    const sessId = user.academic_session_id;
                    const clsId = user.class_section?.school_class_id;
                    expDate = settings?.expirations?.[sessId]?.[clsId] || 'N/A';
                } else if (type === 'staff') {
                    expDate = settings?.staff_expiration || 'N/A';
                }

                const verifyUrl = route('id-cards.verify', user.id);

                // Static Manager Info (as requested)
                const managerName = 'Principal';
                const managerSig = ''; // Leave empty for manual signing or hardcode a specific signature text if desired
                // If the user wants a static name, we can just fetch the school admin name or keep it generic

                return (
                    <div key={user.id} className="id-card-wrapper flex flex-col md:flex-row gap-4 print:flex-row print:mb-4">
                        {/* FRONT */}
                        <div
                            className="bg-white border text-slate-900 relative overflow-hidden flex flex-col items-center justify-between p-4 shadow-sm"
                            style={cardStyle}
                        >
                            {/* Header */}
                            <div className="w-full flex items-center gap-3 border-b-2 border-indigo-600 pb-2 mb-2">
                                {school?.logo ? (
                                    <img src={`/storage/${school.logo}`} className="w-10 h-10 object-contain" />
                                ) : (
                                    <School className="w-10 h-10 text-indigo-600" />
                                )}
                                <div className="flex-1 min-w-0">
                                    <h1 className="font-bold text-xs uppercase tracking-tight leading-tight text-indigo-900 truncate">
                                        {school?.school_name || 'School Name'}
                                    </h1>
                                    <p className="text-[9px] text-slate-500 uppercase tracking-widest">Identity Card</p>
                                </div>
                            </div>

                            {/* Photo & Details */}
                            <div className="flex gap-4 w-full flex-1 items-center">
                                <div className="w-20 h-24 bg-slate-100 border border-slate-200 shadow-inner flex shrink-0 items-center justify-center overflow-hidden">
                                    {user.profile_picture || user.profile_image ? (
                                        <img src={`/storage/${user.profile_picture || user.profile_image}`} className="w-full h-full object-cover" />
                                    ) : (
                                        <UserSquare2 className="w-10 h-10 text-slate-300" />
                                    )}
                                </div>
                                <div className="flex-1 space-y-1 text-left min-w-0">
                                    <div>
                                        <h2 className="font-bold text-sm uppercase truncate leading-tight">
                                            {type === 'staff' ? user.name : (user.surname || user.last_name)}
                                        </h2>
                                        {type === 'student' && <p className="text-xs truncate">{user.first_name} {user.middle_name}</p>}
                                    </div>
                                    <div className="pt-1 space-y-0.5">
                                        {type === 'staff' ? (
                                            <>
                                                <p className="text-[9px] text-slate-500 uppercase">Designation</p>
                                                <p className="text-xs font-semibold">{user.roles?.[0]?.name || 'Staff'}</p>

                                                <p className="text-[9px] text-slate-500 uppercase mt-1">Staff ID</p>
                                                <p className="text-xs font-mono">{user.staff_id || 'N/A'}</p>
                                            </>
                                        ) : (
                                            <>
                                                <p className="text-[9px] text-slate-500 uppercase">Class</p>
                                                <p className="text-xs font-semibold">{user.class_section?.school_class?.name} {user.class_section?.class_arm?.name}</p>

                                                <p className="text-[9px] text-slate-500 uppercase mt-1">Admission No</p>
                                                <p className="text-xs font-mono">{user.registration_number}</p>
                                            </>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Footer Strip */}
                            <div className="w-full bg-indigo-600 text-white text-[9px] font-bold text-center py-1 mt-2 tracking-widest uppercase">
                                Student Not valid without seal
                            </div>
                        </div>

                        {/* BACK */}
                        <div
                            className="bg-slate-50 border text-slate-900 relative overflow-hidden flex flex-col p-4 shadow-sm"
                            style={cardStyle}
                        >
                            <div className="flex-1 space-y-3 text-[10px]">
                                <div className="text-center">
                                    <p className="font-bold uppercase tracking-wider text-slate-400">Property of</p>
                                    <p className="font-bold text-xs">{school?.school_name}</p>
                                    <p className="text-[9px] leading-tight mt-1">{school?.address || 'School Address'}</p>
                                </div>

                                <div className="flex items-end justify-between gap-4 pt-4">
                                    <div className="flex flex-col items-center">
                                        <div className="h-10 flex items-end mb-1">
                                            {managerSig ? (
                                                <span className="font-script text-lg leading-none -mb-2">{managerSig}</span>
                                            ) : (
                                                <div className="w-24 border-b border-black"></div>
                                            )}
                                        </div>
                                        <p className="text-[8px] uppercase border-t border-slate-300 pt-1 min-w-[100px] text-center">
                                            {managerName}
                                        </p>
                                    </div>

                                    <div className="flex flex-col items-end">
                                        <QRCodeSVG value={verifyUrl} size={50} />
                                        <p className="text-[8px] mt-1 text-slate-500">Scan to Verify</p>
                                    </div>
                                </div>
                            </div>

                            {/* Expiration */}
                            <div className="w-full border-t border-slate-200 pt-1.5 mt-auto flex justify-between items-center text-[9px] font-bold">
                                <span className="text-red-600">EXPIRES: {expDate}</span>
                                <span className="text-slate-400">If found return to school</span>
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
