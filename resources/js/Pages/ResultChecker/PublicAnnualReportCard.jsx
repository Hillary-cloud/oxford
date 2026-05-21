import React, { useRef } from 'react';
import { Head, Link } from '@inertiajs/react';
import { Download, ArrowLeft, Printer, Home } from 'lucide-react';
import AnnualReportCardContent from '@/Components/AnnualReportCardContent';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

export default function PublicAnnualReportCard({
    student,
    historicClass,
    annualResults,
    annualSubjectStats,
    overall,
    promotionDecision,
    remarks,
    settings,
    session,
    reportSettings,
    grades,
    psychomotor,
    psychomotorSettings
}) {
    const reportRef = useRef();
    const { school_identity, theme_colors } = settings;

    // Debug logging
    console.log('Annual Results Data:', annualResults);
    console.log('Overall Data:', overall);
    console.log('Student Data:', student);

    const downloadPDF = async () => {
        const element = reportRef.current;
        const canvas = await html2canvas(element, { scale: 2 });
        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF('p', 'mm', 'a4');
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

        pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
        pdf.save(`${student.surname}_Annual_Report_${session.name}.pdf`);
    };

    return (
        <div className="min-h-screen bg-slate-100 p-0 md:p-8 font-sans">
            <Head title={`Annual Report - ${student.surname} ${student.othername}`} />

            {/* Actions Bar */}
            <div className="max-w-4xl mx-auto mb-6 flex flex-col md:flex-row justify-between items-center bg-white p-4 rounded-xl shadow-sm print:hidden gap-4">
                <Link href={route('result-checker.index')} className="flex items-center gap-2 text-slate-600 hover:text-indigo-600 transition-colors w-full md:w-auto">
                    <ArrowLeft size={20} />
                    <span className="font-bold">Back to Checker</span>
                </Link>

                <div className="flex flex-col md:flex-row items-center gap-3 w-full md:w-auto">
                    <Link href="/" className="p-2.5 rounded-xl bg-white text-slate-600 hover:text-indigo-600 shadow-sm transition-all border border-slate-200">
                        <Home size={20} />
                    </Link>
                    <button
                        onClick={downloadPDF}
                        className="w-full md:w-auto justify-center flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-bold shadow-lg shadow-indigo-500/30"
                    >
                        <Download size={18} />
                        Download PDF
                    </button>
                    <button onClick={() => window.print()} className="w-full md:w-auto justify-center px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold uppercase tracking-widest transition-all flex items-center gap-2 shadow-lg shadow-indigo-500/20">
                        <Printer size={18} />
                        Print
                    </button>
                </div>
            </div>

            <div className="pdf-viewer-wrapper">
                <div ref={reportRef}>
                    <AnnualReportCardContent
                        student={student}
                        historicClass={historicClass}
                        annualResults={annualResults}
                        annualSubjectStats={annualSubjectStats}
                        overall={overall}
                        promotionDecision={promotionDecision}
                        session={session}
                        reportSettings={reportSettings}
                        grades={grades}
                        psychomotor={psychomotor}
                        psychomotorSettings={psychomotorSettings}
                    />
                </div>
            </div>

            <div className="max-w-[210mm] mx-auto mt-8 text-center text-slate-500 text-[10px] no-print pb-8">
                &copy; {new Date().getFullYear()} {settings.school_identity?.school_name}. All rights reserved. <br />
                Generated via HUSS Result Checker.
            </div>
        </div>
    );
}
