import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import ReportCardContent from '@/Components/ReportCardContent';
import { Head, Link, usePage } from '@inertiajs/react';
import { Printer, ArrowLeft } from 'lucide-react';
import { useEffect } from 'react';

export default function BulkReportCard({ auth, studentsData, subjectStats, caConfig, reportSettings, session, term, grades, psychomotorSettings, historicClass }) {
    const { settings } = usePage().props;
    const { theme_colors } = settings || {};
    const primaryColor = theme_colors?.result_primary || '#1e3a8a';

    const printReports = () => {
        window.print();
    };

    // Auto-trigger print if requested
    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        if (urlParams.get('print') === 'true') {
            setTimeout(() => {
                window.print();
            }, 1000);
        }
    }, []);

    return (
        <AuthenticatedLayout
            noPadding={true}
            header={
                <div className="flex flex-col md:flex-row items-center justify-between gap-4 w-full no-print">
                    <div className="flex items-center gap-4 w-full md:w-auto">
                        <Link
                            href={route('results.management', {
                                tab: 'report-cards',
                                academic_session_id: session.id,
                                term_id: term.id,
                                class_section_id: historicClass.id
                            })}
                            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-all"
                        >
                            <ArrowLeft size={20} />
                        </Link>
                        <div className="flex flex-col gap-1">
                            <h2 className="text-2xl font-bold tracking-tight dark:text-white text-slate-800">Bulk Report Cards</h2>
                            <p className="text-slate-500 text-sm">{historicClass.school_class.name} {historicClass.class_arm.name !== 'No arm' ? historicClass.class_arm.name : ''} - {term.name}, {session.name}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3 w-full md:w-auto">
                        <button onClick={printReports} className="w-full md:w-auto justify-center px-6 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold uppercase tracking-widest transition-all flex items-center gap-2 shadow-lg shadow-indigo-600/20">
                            <Printer size={18} />
                            Print All Reports
                        </button>
                    </div>
                </div>
            }
        >
            <Head title={`Bulk Report Cards - ${historicClass.school_class.name}`} />

            <div className="bulk-report-container space-y-8 no-print-padding">
                <style dangerouslySetInnerHTML={{
                    __html: `
                    @media print {
                        /* Robust CSS Reset for Printing */
                        html, body {
                            background: white !important;
                            height: auto !important;
                            overflow: visible !important;
                            margin: 0 !important;
                            padding: 0 !important;
                        }

                        /* Target all potential parent containers that might have overflow or height constraints */
                        #app, 
                        #app > div, 
                        div.min-h-screen, 
                        div[class*="min-h-screen"],
                        div.transition-all,
                        main,
                        .max-w-7xl {
                            background: white !important;
                            height: auto !important;
                            min-height: 0 !important;
                            max-height: none !important;
                            overflow: visible !important;
                            display: block !important;
                            position: static !important;
                            padding: 0 !important;
                            margin: 0 !important;
                            width: 100% !important;
                        }

                        /* Hide navigation and other UI elements */
                        .no-print, 
                        nav, 
                        aside, 
                        header, 
                        footer,
                        button,
                        [role="navigation"],
                        [role="complementary"] { 
                            display: none !important; 
                        }

                        .report-card-page { 
                            page-break-after: always !important;
                            page-break-inside: avoid !important;
                            display: block !important;
                            margin: 0 !important;
                            padding: 0 !important;
                            width: 100% !important;
                            visibility: visible !important;
                        }

                        .bulk-report-container { 
                            display: block !important;
                            width: 100% !important;
                            margin: 0 !important;
                            padding: 0 !important;
                        }
                    }
                `}} />

                <div className="pdf-viewer-wrapper bg-slate-100 dark:bg-slate-950 p-4 sm:p-8 min-h-screen py-10 print:p-0 print:bg-white">
                    {studentsData.map((data, index) => (
                        <div key={data.student.id} className="report-card-page relative">
                            <ReportCardContent
                                student={data.student}
                                historicClass={data.student.class_section}
                                results={data.results}
                                subjectStats={subjectStats}
                                psychomotor={data.psychomotor}
                                overall={data.overall}
                                caConfig={caConfig}
                                reportSettings={reportSettings}
                                session={session}
                                term={term}
                                terminalRemark={data.terminalRemark}
                                grades={grades}
                                psychomotorSettings={psychomotorSettings}
                            />
                        </div>
                    ))}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
