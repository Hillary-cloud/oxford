import React from 'react';
import { Head } from '@inertiajs/react';

export default function Broadsheet({ session, term, classSection, subjects, broadsheet, subjectStats, schoolSettings = {}, policy = {}, formTeacherName }) {
    const { identity } = schoolSettings;
    const theme = schoolSettings.theme || {};

    // Default Colors with Theme Support
    const primaryColor = theme.result_primary || '#1e3a8a'; // Default Navy
    const secondaryColor = theme.result_secondary || '#6366f1'; // Default Indigo

    // Policy Values
    const subjectPassMark = policy.pass_mark || 50;
    const avgPassMark = policy.min_avg_score || 50;

    // Helper for suffix
    const getOrdinal = (n) => {
        const s = ["th", "st", "nd", "rd"];
        const v = n % 100;
        return n + (s[(v - 20) % 10] || s[v] || s[0]);
    };

    // Calculate Class Stats
    const totalStudents = broadsheet.length;
    const classAverageByStudent = broadsheet.length > 0
        ? broadsheet.reduce((acc, row) => acc + (Number(row.average) || 0), 0) / broadsheet.length
        : 0;
    const highestScore = broadsheet.length > 0 ? Math.max(...broadsheet.map(r => Number(r.average) || 0)) : 0;
    const lowestScore = broadsheet.length > 0 ? Math.min(...broadsheet.map(r => Number(r.average) || 0)) : 0;

    const passedCount = broadsheet.filter(r => r.status === 'PASSED').length;
    const failedCount = totalStudents - passedCount;
    const passRate = totalStudents > 0 ? (passedCount / totalStudents) * 100 : 0;

    return (
        <div className="min-h-screen bg-white text-xs font-sans p-8 print:p-0">
            <Head title={`Broadsheet - ${classSection.school_class.name}${classSection.class_arm.name !== 'No arm' ? ` ${classSection.class_arm.name}` : ''}`} />

            {/* Header */}
            <div className="mb-4 border-b-4 pb-2" style={{ borderColor: primaryColor }}>
                <div className="flex items-center mb-2 px-4 relative justify-center">
                    {/* Logo - Pushed Left */}
                    {identity?.logo && (
                        <div className="absolute left-0 top-1/2 -translate-y-1/2">
                            <img src={`/storage/${identity.logo}`} alt="Logo" className="w-20 h-20 object-contain" />
                        </div>
                    )}

                    {/* School Details - Centered */}
                    <div className="text-center">
                        <h1 className="text-3xl font-bold uppercase tracking-tight" style={{ color: secondaryColor }}>{identity?.school_name || 'School Name'}</h1>
                        <p className="text-sm font-bold text-slate-600 uppercase tracking-widest">{identity?.school_address}</p>
                        <p className="text-[10px] italic text-slate-500 font-serif mt-0.5">{identity?.school_motto}</p>
                        <p className="text-xs text-slate-500 font-medium tracking-wider mt-1">{identity?.school_email} | {identity?.school_phone}</p>
                    </div>
                </div>

                <div className="py-1.5 font-bold tracking-[0.2em] text-lg uppercase text-white text-center rounded-sm shadow-sm" style={{ backgroundColor: primaryColor }}>
                    Score Summary Broadsheet
                </div>
            </div>

            {/* Info Bar */}
            <div className="flex justify-between items-center text-xs font-bold uppercase mb-4 px-2 py-2 bg-slate-50 border border-slate-200 rounded-lg">
                <p>Class: <span style={{ color: secondaryColor }} className="text-sm">
                    {classSection.school_class.name}
                    {classSection.class_arm.name !== 'No arm' ? ` ${classSection.class_arm.name}` : ''}
                </span></p>
                <p>Term: <span style={{ color: secondaryColor }} className="text-sm">{term?.name}</span></p>
                <p>Session: <span style={{ color: secondaryColor }} className="text-sm">{session?.name}</span></p>
                <p>Form Teacher: <span style={{ color: secondaryColor }} className="text-sm">{formTeacherName}</span></p>
            </div>

            {/* Main Table */}
            <div className="overflow-x-auto">
                <table className="w-full border-collapse border border-slate-400 text-[10px]">
                    <thead>
                        <tr className="text-white" style={{ backgroundColor: primaryColor }}>
                            <th className="border border-slate-300 p-1 w-8">S/N</th>
                            <th className="border border-slate-300 p-1 text-left min-w-[200px]">Name of Student</th>
                            {subjects.map(sub => (
                                <th key={sub.id} className="border border-slate-300 p-1 w-8 break-words align-bottom bg-black/10">
                                    <div className="transform -rotate-90 w-6 h-28 flex items-center justify-start translate-y-5">
                                        <span className="whitespace-nowrap overflow-visible font-bold tracking-tight">{sub.name}</span>
                                    </div>
                                </th>
                            ))}
                            <th className="border border-slate-300 p-1 w-10 vertical-text bg-black/20"><div className="-rotate-90 h-10 font-bold">Total</div></th>
                            <th className="border border-slate-300 p-1 w-10 vertical-text bg-black/20"><div className="-rotate-90 h-10 font-bold">Average</div></th>
                            <th className="border border-slate-300 p-1 w-8 vertical-text bg-black/20"><div className="-rotate-90 h-10 font-bold">Grade</div></th>
                            <th className="border border-slate-300 p-1 w-8 vertical-text"><div className="-rotate-90 h-10 font-bold">Position</div></th>
                            <th className="border border-slate-300 p-1 w-8 vertical-text"><div className="-rotate-90 h-10">Passed</div></th>
                            <th className="border border-slate-300 p-1 w-16">Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {broadsheet.map((row, idx) => (
                            <tr key={idx} className="hover:bg-slate-50 text-center font-medium text-slate-700">
                                <td className="border border-slate-300 p-1">{idx + 1}</td>
                                <td className="border border-slate-300 p-1 text-left uppercase text-xs font-bold text-slate-800">{row.student.surname} {row.student.othername}</td>
                                {subjects.map(sub => {
                                    const score = row.scores[sub.id];
                                    const isFail = score !== null && score < subjectPassMark;
                                    return (
                                        <td key={sub.id} className={`border border-slate-300 p-1 ${isFail ? 'text-red-600 font-extrabold bg-red-50' : ''}`}>
                                            {score !== null ? score : '-'}
                                        </td>
                                    );
                                })}
                                <td className="border border-slate-300 p-1 font-black bg-slate-50">{row.total_score}</td>
                                <td className="border border-slate-300 p-1 font-black bg-slate-50">{row.average}</td>
                                <td className="border border-slate-300 p-1 font-bold">{row.grade}</td>
                                <td className="border border-slate-300 p-1">{getOrdinal(row.position)}</td>
                                <td className="border border-slate-300 p-1 text-slate-500">{row.passed_count}</td>
                                <td className={`border border-slate-300 p-1 text-[9px] font-black ${row.status === 'PASSED' ? 'text-emerald-700' : 'text-red-600'}`}>{row.status}</td>
                            </tr>
                        ))}

                        {/* Summary Rows (Footer) */}
                        <tr className="bg-slate-100 font-bold text-center border-t-2 border-slate-400">
                            <td colSpan={2} className="border border-slate-300 p-1 text-right pr-2">Class Average</td>
                            {subjects.map(sub => (
                                <td key={sub.id} className="border border-slate-300 p-1 text-[10px]">{subjectStats[sub.id]?.average}</td>
                            ))}
                            <td colSpan={6} className="text-white border border-slate-300 text-[10px]" style={{ backgroundColor: secondaryColor }}>Avg: {classAverageByStudent.toFixed(2)}</td>
                        </tr>
                        <tr className="bg-slate-50 text-center text-[10px]">
                            <td colSpan={2} className="border border-slate-300 p-1 text-right pr-2 uppercase text-slate-500">Passed</td>
                            {subjects.map(sub => (
                                <td key={sub.id} className="border border-slate-300 p-1 font-bold text-emerald-600">{subjectStats[sub.id]?.passed}</td>
                            ))}
                            <td colSpan={6} className="bg-slate-200 border border-slate-300"></td>
                        </tr>
                        <tr className="bg-slate-50 text-center text-[10px]">
                            <td colSpan={2} className="border border-slate-300 p-1 text-right pr-2 uppercase text-slate-500">Failed</td>
                            {subjects.map(sub => (
                                <td key={sub.id} className="border border-slate-300 p-1 font-bold text-red-600">{subjectStats[sub.id]?.failed}</td>
                            ))}
                            <td colSpan={6} className="bg-slate-200 border border-slate-300"></td>
                        </tr>
                    </tbody>
                </table>
            </div>

            {/* Bottom Statistics Cards */}
            <div className="grid grid-cols-4 gap-4 mt-8 no-print-break-inside">
                <StatsCard label="Total Students" value={totalStudents} color={secondaryColor} />
                <StatsCard label="Class Average" value={classAverageByStudent.toFixed(2)} color={secondaryColor} />
                <StatsCard label="Highest Score" value={highestScore.toFixed(1)} color={secondaryColor} />
                <StatsCard label="Lowest Score" value={lowestScore.toFixed(1)} color={secondaryColor} />
            </div>

            {/* Analysis & Key */}
            <div className="grid grid-cols-2 gap-8 mt-4 no-print-break-inside text-[11px]">
                <div className="border rounded-lg overflow-hidden" style={{ borderColor: primaryColor }}>
                    <div className="text-white text-center py-1 font-bold text-xs uppercase" style={{ backgroundColor: primaryColor }}>Class Performance Statistics</div>
                    <div className="p-4 space-y-2 bg-slate-50">
                        <div className="flex justify-between border-b border-slate-200 pb-1"><span>Number of Students Passed:</span> <span className="font-bold text-emerald-600">{passedCount} Students</span></div>
                        <div className="flex justify-between border-b border-slate-200 pb-1"><span>Number of Students Failed:</span> <span className="font-bold text-red-600">{failedCount} Students</span></div>
                        <div className="flex justify-between pt-1"><span>Pass Rate:</span> <span className="font-bold text-slate-800">{passRate.toFixed(1)}%</span></div>
                    </div>
                </div>

                <div className="border rounded-lg overflow-hidden" style={{ borderColor: primaryColor }}>
                    <div className="text-white text-center py-1 font-bold text-xs uppercase" style={{ backgroundColor: primaryColor }}>Result Analysis (Criteria for passing)</div>
                    <div className="p-4 space-y-2 bg-slate-50">
                        {policy?.criteria && policy.criteria.length > 0 ? (
                            policy.criteria.map((criterion, idx) => (
                                <p key={idx} className="flex gap-2 text-slate-700">
                                    <span className="font-bold">{idx + 1}.</span>
                                    <span className="font-medium">{criterion}</span>
                                </p>
                            ))
                        ) : (
                            <p className="text-slate-500 italic">No specific criteria defined for this term.</p>
                        )}
                        <div className="mt-3 text-white text-center py-1.5 font-bold rounded shadow-sm text-xs" style={{ backgroundColor: isNaN(Number(subjectPassMark)) ? '#15803d' : (Number(subjectPassMark) >= 50 ? '#15803d' : '#ca8a04') }}>
                            Subject Pass Mark is {subjectPassMark}. Scores &lt; {subjectPassMark} are highlighted red.
                        </div>
                    </div>
                </div>
            </div>

            <div className="mt-8 text-center no-print">
                <button
                    onClick={() => window.print()}
                    className="text-white px-8 py-3 rounded-xl font-bold shadow-lg hover:shadow-xl hover:opacity-95 transition-all active:scale-95 flex items-center gap-2 mx-auto"
                    style={{ backgroundColor: primaryColor }}
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 6 2 18 2 18 9"></polyline><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path><rect x="6" y="14" width="12" height="8"></rect></svg>
                    Print Broadsheet
                </button>
            </div>
        </div>
    );
}

function StatsCard({ label, value, color }) {
    return (
        <div className="bg-white border border-slate-200 rounded-xl p-4 text-center shadow-sm">
            <p className="text-slate-500 text-[10px] uppercase font-bold tracking-wider">{label}</p>
            <p className="text-2xl font-black mt-1" style={{ color: color }}>{value}</p>
        </div>
    );
}
