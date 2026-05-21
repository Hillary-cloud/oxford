import ReportCardContent from '@/Components/ReportCardContent';
import { Head, Link } from '@inertiajs/react';
import { Printer, ArrowLeft, Home, Download } from 'lucide-react';
import { useEffect } from 'react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export default function PublicReportCard({ student, results, subjectStats, psychomotor, overall, caConfig, reportSettings, session, term, terminalRemark, settings, grades }) {

    const printReport = () => {
        window.print();
    };

    const downloadPDF = async () => {
        const element = document.getElementById('public-report-card-content');
        if (!element) return;

        try {
            const canvas = await html2canvas(element, {
                scale: 2,
                useCORS: true,
                logging: false,
                windowWidth: 1200
            });

            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF('p', 'mm', 'a4');
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = pdf.internal.pageSize.getHeight();
            const imgWidth = canvas.width;
            const imgHeight = canvas.height;
            const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);

            const pWidth = pdfWidth;
            const pHeight = (canvas.height * pdfWidth) / canvas.width;

            pdf.addImage(imgData, 'PNG', 0, 0, pWidth, pHeight);
            pdf.save(`${student.surname}_${student.firstname}_Termly_Result.pdf`);

        } catch (error) {
            console.error('PDF Generation Error:', error);
            alert('Failed to generate PDF. Please try again or use the Print option.');
        }
    };

    return (
        <div className="min-h-screen bg-slate-100 p-0 md:p-6 print:p-0">
            <Head title={`Result - ${student.surname}`} />

            <div className="max-w-[210mm] mx-auto mb-6 flex items-center justify-between no-print">
                <Link href={route('result-checker.index')} className="flex items-center gap-2 text-slate-600 hover:text-indigo-600 transition-colors">
                    <ArrowLeft size={20} />
                    <span className="font-bold">Back to Checker</span>
                </Link>

                <div className="flex flex-col md:flex-row items-center gap-3 w-full md:w-auto mt-4 md:mt-0">
                    <Link href="/" className="p-2.5 rounded-xl bg-white text-slate-600 hover:text-indigo-600 shadow-sm transition-all">
                        <Home size={20} />
                    </Link>
                    <button onClick={downloadPDF} className="w-full md:w-auto justify-center px-6 py-2.5 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-indigo-600 text-xs font-bold uppercase tracking-widest transition-all flex items-center gap-2 shadow-sm">
                        <Download size={18} />
                        Download PDF
                    </button>
                    <button onClick={printReport} className="w-full md:w-auto justify-center px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold uppercase tracking-widest transition-all flex items-center gap-2 shadow-lg shadow-indigo-500/20">
                        <Printer size={18} />
                        Print Result
                    </button>
                </div>
            </div>

            <div className="pdf-viewer-wrapper">
                <div id="public-report-card-content">
                    <ReportCardContent
                        student={student}
                        results={results}
                        subjectStats={subjectStats}
                        psychomotor={psychomotor}
                        overall={overall}
                        caConfig={caConfig}
                        reportSettings={reportSettings}
                        session={session}
                        term={term}
                        terminalRemark={terminalRemark}
                        settings={settings}
                        grades={grades}
                    />
                </div>

                <div className="max-w-[210mm] mx-auto mt-8 text-center text-slate-500 text-[10px] no-print pb-8">
                    &copy; {new Date().getFullYear()} {settings.school_identity?.school_name}. All rights reserved. <br />
                    Generated via HUSS Result Checker.
                </div>
            </div>
        </div>
    );
}
