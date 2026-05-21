import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import ReportCardContent from '@/Components/ReportCardContent';
import { Head, Link, usePage } from '@inertiajs/react';
import { Printer, ArrowLeft, Download } from 'lucide-react';
import { useEffect } from 'react';

import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export default function ReportCard({ auth, student, historicClass, results, subjectStats, psychomotor, overall, caConfig, reportSettings, session, term, terminalRemark, grades, psychomotorSettings }) {
    const { settings } = usePage().props;
    const { theme_colors } = settings || {};
    const primaryColor = theme_colors?.result_primary || '#1e3a8a';

    const printReport = () => {
        window.print();
    };

    const downloadPDF = async () => {
        const element = document.getElementById('report-card-paper');
        if (!element) return;

        try {
            const canvas = await html2canvas(element, {
                scale: 2, // Higher scale for better quality
                useCORS: true, // Handle images from other domains
                logging: false,
                windowWidth: 1200 // Force width to desktop size for consistent rendering
            });

            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF('p', 'mm', 'a4');
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = pdf.internal.pageSize.getHeight();
            const imgWidth = canvas.width;
            const imgHeight = canvas.height;
            const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);
            const imgX = (pdfWidth - imgWidth * ratio) / 2;
            const imgY = 0;

            // In case the content is longer than one page, simple scaling might not be enough.
            // But for a report card typically designed for A4, scaling to fit width is usually desired.
            // We'll scale to fit width.
            const pWidth = pdfWidth;
            const pHeight = (canvas.height * pdfWidth) / canvas.width;

            pdf.addImage(imgData, 'PNG', 0, 0, pWidth, pHeight);
            pdf.save(`${student.surname}_${student.firstname}_Termly_Report.pdf`);

        } catch (error) {
            console.error('PDF Generation Error:', error);
            alert('Failed to generate PDF. Please try again or use the Print option.');
        }
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
                                class_section_id: student.class_section_id
                            })}
                            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-all"
                        >
                            <ArrowLeft size={20} />
                        </Link>
                        <div className="flex flex-col gap-1">
                            <h2 className="text-2xl font-bold tracking-tight dark:text-white text-slate-800">Academic Report Card</h2>
                            <p className="text-slate-500 text-sm">{term.name}, {session.name} Session</p>
                        </div>
                    </div>
                    <div className="flex flex-col md:flex-row items-center gap-3 w-full md:w-auto">
                        <button onClick={downloadPDF} className="w-full md:w-auto justify-center px-6 py-2.5 rounded-2xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold uppercase tracking-widest transition-all flex items-center gap-2 shadow-sm">
                            <Download size={18} />
                            Download PDF
                        </button>
                        <button onClick={printReport} className="w-full md:w-auto justify-center px-6 py-2.5 rounded-2xl bg-primary hover:opacity-90 text-white text-xs font-bold uppercase tracking-widest transition-all flex items-center gap-2 shadow-lg shadow-primary/20">
                            <Printer size={18} />
                            Print Report
                        </button>
                    </div>
                </div>
            }
        >
            <Head title={`Report Card - ${student.surname}`} />

            <div id="report-card-content" className="pdf-viewer-wrapper bg-slate-100 dark:bg-slate-950 p-4 sm:p-8 min-h-screen py-10 print:p-0 print:bg-white">
                <ReportCardContent
                    student={student}
                    historicClass={historicClass}
                    results={results}
                    subjectStats={subjectStats}
                    psychomotor={psychomotor}
                    overall={overall}
                    caConfig={caConfig}
                    reportSettings={reportSettings}
                    session={session}
                    term={term}
                    terminalRemark={terminalRemark}
                    grades={grades}
                    psychomotorSettings={psychomotorSettings}
                />
            </div>
        </AuthenticatedLayout>
    );
}
