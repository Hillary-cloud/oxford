import { User } from 'lucide-react';
import { usePage } from '@inertiajs/react';

export default function ReportCardContent({ student, historicClass, results, subjectStats, psychomotor, overall, caConfig, reportSettings, session, term, terminalRemark, grades = [], psychomotorSettings }) {
    const { settings } = usePage().props;
    const { school_identity, theme_colors } = settings || {};
    const primaryColor = theme_colors?.result_primary || '#1e3a8a';
    const secondaryColor = theme_colors?.result_secondary || '#6366f1';

    const calculateAge = (dob) => {
        if (!dob) return 'N/A';
        try {
            const birthDate = new Date(dob);
            if (isNaN(birthDate.getTime())) return 'N/A';

            const today = new Date();
            let age = today.getFullYear() - birthDate.getFullYear();
            const monthDiff = today.getMonth() - birthDate.getMonth();
            if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
                age--;
            }
            return age > 0 ? age : 0;
        } catch (e) {
            return 'N/A';
        }
    };

    const getOrdinalSuffix = (num) => {
        const n = parseInt(num);
        if (isNaN(n)) return num;
        const j = n % 10, k = n % 100;
        let suffix = 'th';
        if (j === 1 && k !== 11) suffix = "st";
        else if (j === 2 && k !== 12) suffix = "nd";
        else if (j === 3 && k !== 13) suffix = "rd";
        return <>{n}<sup className="text-[0.8em]">{suffix}</sup></>;
    };

    const getGradeColor = (grade) => {
        switch (grade) {
            case 'A': return 'text-emerald-700 font-bold';
            case 'B': return 'text-blue-700 font-bold';
            case 'C': return 'text-indigo-600 font-bold';
            case 'D': return 'text-amber-600 font-bold';
            default: return 'text-rose-600 font-bold';
        }
    };

    return (
        <div id="report-card-paper" className="max-w-[210mm] mx-auto bg-white text-slate-900 overflow-hidden shadow-2xl print:shadow-none print:m-0 print:w-full font-sans report-card-container">
            {/* Dynamic Styles */}
            <style>{`
                .theme-text { color: ${primaryColor} !important; }
                .theme-accent-text { color: ${secondaryColor} !important; }
                .theme-bg { background-color: ${primaryColor} !important; color: white !important; }
                .theme-accent-bg { background-color: ${secondaryColor} !important; color: white !important; }
                .theme-border { border-color: ${primaryColor} !important; }
                .theme-accent-border { border-color: ${secondaryColor} !important; }
                @media print {
                    .theme-bg, .theme-accent-bg { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
                    html, body { background: white !important; margin: 0 !important; padding: 0 !important; }
                    /* Removed restrictive height/overflow hidden as it breaks bulk printing */
                    nav, aside, header, footer, .no-print { display: none !important; }
                    div[class*="pl-20"], div[class*="pl-64"] { padding-left: 0 !important; }
                    
                    /* A4 Container */
                    .report-card-container { 
                        width: 210mm !important; 
                        max-width: none !important; 
                        margin: 0 auto !important; 
                        padding: 0 !important;
                        box-shadow: none !important;
                        page-break-after: always;
                    }
                    
                    @page { size: A4; margin: 0; }
                    .pdf-viewer-wrapper { padding: 0 !important; background: white !important; min-height: 0 !important; }
                }

                @media screen and (max-width: 210mm) {
                    .pdf-viewer-wrapper { 
                        padding: 1rem 0 !important;
                        display: flex;
                        flex-direction: column;
                        align-items: center !important;
                        justify-content: flex-start;
                        gap: 2rem;
                        overflow-x: hidden;
                        
                        
                    }
                    .report-card-container {
                        margin: 0 !important;
                        transform-origin: top center !important;
                        scale: calc(98vw / 210mm);
                        border-radius: 0 !important;
                    }
                }
            `}</style>

            {/* School Header */}
            <div className="p-4 text-center border-b-2 border-slate-900 border-double theme-border">
                <div className="flex flex-col items-center justify-center gap-2">
                    <div className="flex items-center justify-center gap-4 mb-1 w-full">
                        <div className="w-16 h-16 shrink-0">
                            {school_identity?.logo ? (
                                <img src={`/storage/${school_identity.logo}`} alt="Logo" className="w-full h-full object-contain" />
                            ) : (
                                <img src="/logo.png" alt="Logo" className="w-full h-full object-contain" onError={(e) => e.target.src = 'https://ui-avatars.com/api/?name=HUSS&background=1e3a8a&color=fff&size=128'} />
                            )}
                        </div>
                        <div className="text-center flex-1">
                            <h1 className="text-2xl font-black uppercase tracking-wide leading-tight" style={{ color: secondaryColor }}>{school_identity?.school_name || 'HUSS INTERNATIONAL ACADEMY'}</h1>
                            <p className="text-xs font-bold text-slate-600 uppercase tracking-widest">{school_identity?.school_address || '123 Education Way, Tech City'}</p>
                            <div className="flex flex-wrap justify-center gap-4 text-[10px] font-bold text-slate-500 mt-1">
                                {school_identity?.school_email && <span>{school_identity.school_email}</span>}
                                {school_identity?.school_phone && <span>{school_identity.school_phone}</span>}
                            </div>
                            <p className="text-[10px] italic text-slate-500 font-serif mt-0.5">"{school_identity?.school_motto || 'Excellence in Knowledge, Virtue and Service'}"</p>
                        </div>
                        <div className="w-16 h-20 bg-slate-100 border border-slate-300 shrink-0 overflow-hidden relative">
                            {student.profile_picture ? (
                                <img src={`/storage/${student.profile_picture}`} alt="Student" className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full flex flex-col items-center justify-center text-slate-300">
                                    <User size={24} />
                                    <span className="text-[6px] font-bold uppercase mt-1">Passport</span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Banner */}
            <div className="text-center py-1.5 font-bold uppercase tracking-widest text-xs border-y border-slate-900 theme-border" style={{ backgroundColor: primaryColor, color: 'white' }}>
                TERMLY ACADEMIC PERFORMANCE REPORT
            </div>

            {/* Student Info Grid (Compact) */}
            <div className="p-4">
                <div className="border border-slate-300 text-[10px]">
                    {/* Row 1 */}
                    <div className="flex border-b border-slate-300">
                        <div className="w-24 bg-slate-50 p-1.5 font-bold text-slate-700 border-r border-slate-300 uppercase">Name:</div>
                        <div className="flex-1 p-1.5 font-black uppercase" style={{ color: secondaryColor }}>{student.surname} {student.othername}</div>
                        <div className="w-32 border-l border-slate-300 flex">
                            <div className="w-12 bg-slate-50 p-1.5 font-bold text-slate-700 border-r border-slate-300 uppercase">Sex:</div>
                            <div className="flex-1 p-1.5 font-bold capitalize">{student.gender}</div>
                        </div>
                    </div>
                    {/* Row 2 */}
                    <div className="flex border-b border-slate-300">
                        <div className="w-24 bg-slate-50 p-1.5 font-bold text-slate-700 border-r border-slate-300 uppercase">Reg No:</div>
                        <div className="flex-1 p-1.5 font-bold text-slate-900 uppercase font-mono">{student.registration_number}</div>
                        <div className="w-32 border-l border-slate-300 flex">
                            <div className="w-12 bg-slate-50 p-1.5 font-bold text-slate-700 border-r border-slate-300 uppercase">Age:</div>
                            <div className="flex-1 p-1.5 font-bold">{calculateAge(student.date_of_birth)}</div>
                        </div>
                    </div>
                    {/* Row 3 */}
                    <div className="flex border-b border-slate-300">
                        <div className="w-24 bg-slate-50 p-1.5 font-bold text-slate-700 border-r border-slate-300 uppercase">Class:</div>
                        <div className="flex-1 p-1.5 font-bold text-slate-900 uppercase">
                            {historicClass
                                ? `${historicClass.school_class?.name}${historicClass.class_arm?.name !== 'No arm' ? ` ${historicClass.class_arm?.name}` : ''}`
                                : `${student.class_section?.school_class?.name}${student.class_section?.class_arm?.name !== 'No arm' ? ` ${student.class_section?.class_arm?.name}` : ''}`
                            }
                        </div>
                        <div className="w-32 border-l border-slate-300 flex">
                            <div className="w-12 bg-slate-50 p-1.5 font-bold text-slate-700 border-r border-slate-300 uppercase">Term:</div>
                            <div className="flex-1 p-1.5 font-bold capitalize">{term.name}</div>
                        </div>
                    </div>
                    {/* Row 4 */}
                    <div className="flex border-b border-slate-300">
                        <div className="w-24 bg-slate-50 p-1.5 font-bold text-slate-700 border-r border-slate-300 uppercase">Session:</div>
                        <div className="flex-1 p-1.5 font-bold text-slate-900">{session.name}</div>
                        <div className="w-32 border-l border-slate-300 flex">
                            <div className="w-12 bg-slate-50 p-1.5 font-bold text-slate-700 border-r border-slate-300 uppercase">Pos:</div>
                            <div className="flex-1 p-1.5 font-bold">{getOrdinalSuffix(overall.position)} out of {overall.total_students}</div>
                        </div>
                    </div>
                    {/* Row 5 */}
                    <div className="flex border-b border-slate-300">
                        <div className="w-24 bg-slate-50 p-1.5 font-bold text-slate-700 border-r border-slate-300 uppercase">Total Score:</div>
                        <div className="flex-1 p-1.5 font-bold text-slate-900">{(Array.isArray(results) ? results : [])
                            .reduce((acc, curr) => acc + parseFloat(curr?.total_score || 0), 0)
                            .toFixed(1)}
                        </div>
                        <div className="w-32 border-l border-slate-300 flex">
                            <div className="w-12 bg-slate-50 p-1.5 font-bold text-slate-700 border-r border-slate-300 uppercase text-[9px]">Average: </div>
                            <div className="flex-1 p-1.5 font-bold border-r border-slate-300">{overall.average}</div>
                        </div>
                    </div>
                    {/* Row 6: Remark/Status */}
                    <div className="flex">
                        <div className="w-24 bg-slate-50 p-1.5 font-bold text-slate-700 border-r border-slate-300 uppercase">Status:</div>
                        <div className={`flex-1 p-1.5 font-black uppercase ${overall.status === 'Failed' ? 'text-rose-600' : 'theme-accent-text'}`}>
                            {overall.status}
                        </div>
                    </div>
                </div>
            </div>

            {/* Results Table */}
            <div className="px-4 mb-4 overflow-x-auto">
                <table className="w-full border-collapse border border-slate-900 min-w-[600px]">
                    <thead>
                        <tr style={{ backgroundColor: primaryColor, color: 'white' }}>
                            <th className="border border-white/20 px-1 py-1 text-[9px] uppercase font-bold w-8">S/N</th>
                            <th className="border border-white/20 px-2 py-1 text-[9px] uppercase font-bold text-left">Subject</th>
                            {caConfig.map((ca, i) => (
                                <th key={i} className="border border-white/20 px-1 py-1 text-[9px] uppercase font-bold text-center w-8">
                                    <div className="flex flex-col leading-tight">
                                        <span>{ca.name}</span>
                                        <span className="text-[7px] opacity-80">{ca.max_score}</span>
                                    </div>
                                </th>
                            ))}
                            <th className="border border-white/20 px-1 py-1 text-[9px] uppercase font-bold text-center w-10">
                                <div className="flex flex-col leading-tight">
                                    <span>Exam</span>
                                    <span className="text-[7px] opacity-80">60</span>
                                </div>
                            </th>
                            <th className="border border-white/20 px-1 py-1 text-[9px] uppercase font-bold text-center w-10 bg-white/10">
                                <div className="flex flex-col leading-tight">
                                    <span>Total</span>
                                    <span className="text-[7px] opacity-80">100</span>
                                </div>
                            </th>

                            {/* Stats Columns */}
                            <th className="border border-white/20 px-1 py-1 text-[9px] uppercase font-bold text-center w-12 text-yellow-300">Class Avg</th>
                            <th className="border border-white/20 px-1 py-1 text-[9px] uppercase font-bold text-center w-16 text-green-300">Class Highest</th>
                            <th className="border border-white/20 px-1 py-1 text-[9px] uppercase font-bold text-center w-16 text-red-300">Class Lowest</th>

                            <th className="border border-white/20 px-1 py-1 text-[9px] uppercase font-bold text-center w-10">Pos</th>
                            <th className="border border-white/20 px-1 py-1 text-[9px] uppercase font-bold text-center w-12">Grade</th>
                            <th className="border border-white/20 px-1 py-1 text-[9px] uppercase font-bold text-center w-16">Remark</th>
                        </tr>
                    </thead>
                    <tbody>
                        {results.map((res, index) => (
                            <tr key={res.id} className="text-[10px] border-b border-slate-300 hover:bg-slate-50">
                                <td className="border-r border-slate-300 px-1 py-1 text-center">{index + 1}</td>
                                <td className="border-r border-slate-300 px-2 py-1 font-bold text-slate-800">{res.subject?.name}</td>
                                {caConfig.map((ca, i) => {
                                    const score = res.assessments?.find(a => a.name === ca.name)?.score || 0;
                                    return <td key={i} className="border-r border-slate-300 px-1 py-1 text-center">{score}</td>;
                                })}
                                <td className="border-r border-slate-300 px-1 py-1 text-center">{res.exam_score}</td>
                                <td className="border-r border-slate-300 px-1 py-1 text-center font-bold bg-slate-100">{res.total_score}</td>

                                {/* Stats Data */}
                                <td className="border-r border-slate-300 px-1 py-1 text-center font-medium text-slate-600">
                                    {(subjectStats[res.subject_id]?.average ?? '-') === '-' ? '-' : subjectStats[res.subject_id].average}
                                </td>
                                <td className="border-r border-slate-300 px-1 py-1 text-center font-medium text-slate-600">
                                    {(subjectStats[res.subject_id]?.highest ?? '-') === '-' ? '-' : subjectStats[res.subject_id].highest}
                                </td>
                                <td className="border-r border-slate-300 px-1 py-1 text-center font-medium text-slate-600">
                                    {(subjectStats[res.subject_id]?.lowest ?? '-') === '-' ? '-' : subjectStats[res.subject_id].lowest}
                                </td>

                                <td className="border-r border-slate-300 px-1 py-1 text-center">
                                    {getOrdinalSuffix(res.position)}
                                </td>
                                <td className={`border-r border-slate-300 px-1 py-1 text-center ${getGradeColor(res.grade)}`}>{res.grade}</td>
                                <td className="px-1 py-1 text-center text-[9px] uppercase font-medium truncate max-w-[60px]">{res.remarks}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Bottom Section: Grading, Character, Psychomotor */}
            <div className="px-4 mb-4">
                <div className="mb-3">
                    <div className="text-[9px] font-bold" style={{ color: secondaryColor }}>
                        KEY TO GRADES: {[...grades].sort((a, b) => b.min_score - a.min_score).map((g, i) => (
                            <span key={i} className="mr-2 last:mr-0">
                                {g.name} = {g.min_score}{g.max_score < 100 ? `-${g.max_score}` : '+'}%
                                {i < grades.length - 1 ? ',' : ''}
                            </span>
                        ))}
                    </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                    {/* Character */}
                    <div className="border border-slate-900 rounded-lg overflow-hidden">
                        <div className="text-white text-center py-0.5 text-[9px] font-bold uppercase" style={{ backgroundColor: primaryColor }}>Character Development</div>
                        <div className="text-[9px]">
                            {[
                                { name: 'Attentiveness', val: 5 },
                                { name: 'Politeness', val: 5 },
                                { name: 'Neatness', val: 5 },
                                { name: 'Moral Concepts', val: 5 },
                            ].map((item, i) => (
                                <div key={i} className="flex justify-between border-b border-slate-200 last:border-0 px-2 py-0.5">
                                    <span>{item.name}</span>
                                    <span className="font-bold">{item.val}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Rating Key */}
                    <div className="border border-slate-900 rounded-lg overflow-hidden">
                        <div className="text-white text-center py-0.5 text-[9px] font-bold uppercase" style={{ backgroundColor: primaryColor }}>Rating Key</div>
                        <div className="text-[9px]">
                            {psychomotorSettings?.map((item, i) => (
                                <div key={i} className="flex border-b border-slate-200 last:border-0 px-2 py-0.5">
                                    <span className="w-8 text-center border-r border-slate-200 font-bold">{item.scale}</span>
                                    <span className="flex-1 text-center">{item.desc}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Psychomotor */}
                    <div className="border border-slate-900 rounded-lg overflow-hidden">
                        <div className="text-white text-center py-0.5 text-[9px] font-bold uppercase" style={{ backgroundColor: primaryColor }}>Psychomotor Skills</div>
                        <div className="text-[9px]">
                            {psychomotor && psychomotor.length > 0 ? (
                                psychomotor.map((rating, i) => (
                                    <div key={i} className="flex justify-between border-b border-slate-200 last:border-0 px-2 py-0.5">
                                        <span>{rating.skill?.name}</span>
                                        <span className="font-bold">{rating.rating}</span>
                                    </div>
                                ))
                            ) : (
                                <div className="p-2 text-center italic text-[8px] text-slate-500">No ratings available</div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Next Term / Admin Info */}
            {(reportSettings.show_next_term_begin || reportSettings.show_next_term_end || reportSettings.show_next_term_fee) && (
                <div className="px-4 mb-4">
                    <div className="border border-slate-900 rounded-lg overflow-hidden">
                        <div className="text-white text-center py-0.5 text-[9px] font-bold uppercase" style={{ backgroundColor: primaryColor }}>Administrative Information</div>
                        <div className="grid grid-cols-3 divide-x divide-slate-200 text-[9px]">
                            {[
                                { label: 'Next Term Begins', value: reportSettings.next_term_begin ? new Date(reportSettings.next_term_begin).toDateString() : 'TBD', show: reportSettings.show_next_term_begin },
                                { label: 'Next Term Ends', value: reportSettings.next_term_end ? new Date(reportSettings.next_term_end).toDateString() : 'TBD', show: reportSettings.show_next_term_end },
                                {
                                    label: 'Next Term School Fees',
                                    value: reportSettings.next_term_fee
                                        ? (isNaN(parseFloat(String(reportSettings.next_term_fee).replace(/,/g, '')))
                                            ? reportSettings.next_term_fee
                                            : '₦' + parseFloat(String(reportSettings.next_term_fee).replace(/,/g, '')).toLocaleString('en-NG', { minimumFractionDigits: 2 }))
                                        : 'N/A',
                                    show: reportSettings.show_next_term_fee
                                },
                            ].filter(i => i.show !== false).map((item, idx) => (
                                <div key={idx} className="p-1 px-2 text-center">
                                    <div className="font-bold uppercase text-slate-500 text-[8px]">{item.label}</div>
                                    <div className="font-bold text-slate-900">{item.value}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* Comments & Signatures */}
            <div className="px-4 mb-6">
                <div className="border border-slate-900 rounded-lg overflow-hidden mb-6">
                    <div className="text-white text-center py-0.5 text-[9px] font-bold uppercase" style={{ backgroundColor: primaryColor }}>Comments</div>
                    <div className="text-[10px]">
                        <div className="flex border-b border-slate-200">
                            <div className="w-24 p-1.5 font-bold bg-slate-100 border-r border-slate-200">Class Teacher</div>
                            <div className="flex-1 p-1.5 italic">"{terminalRemark?.form_teacher_remark || 'Excellent performance.'}"</div>
                        </div>
                        <div className="flex">
                            <div className="w-24 p-1.5 font-bold bg-slate-100 border-r border-slate-200">Principal</div>
                            <div className="flex-1 p-1.5 italic">"{terminalRemark?.principal_remark || 'Excellent result.'}"</div>
                        </div>
                    </div>
                </div>

                <div className="flex items-center justify-between text-[10px] font-bold pt-2">
                    <div className="border-t border-slate-900 pt-1 w-48 text-center">
                        {reportSettings?.form_teacher_name ? (
                            <div className="flex flex-col">
                                <span className="uppercase">{reportSettings.form_teacher_name}</span>
                                <span className="text-[8px] font-normal text-slate-500">Class Teacher</span>
                            </div>
                        ) : "Class Teacher's Signature"}
                    </div>
                    <div className="border-t border-slate-900 pt-1 w-48 text-center">
                        {reportSettings?.principal_name ? (
                            <div className="flex flex-col">
                                <span className="uppercase">{reportSettings.principal_name}</span>
                                <span className="text-[8px] font-normal text-slate-500">Principal</span>
                            </div>
                        ) : "Principal's Signature"}
                    </div>
                </div>
            </div>
        </div>
    );
}
