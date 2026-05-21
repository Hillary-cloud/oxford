import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { Printer, ArrowLeft, School, User, MapPin, TrendingUp, ShieldCheck, Medal, Calendar, GraduationCap, Download } from 'lucide-react';
import { useEffect } from 'react';
import Swal from 'sweetalert2';
import AnnualReportCardContent from '@/Components/AnnualReportCardContent';

import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export default function AnnualReportCard({ student, historicClass, annualResults, annualSubjectStats, termAverages, overall, promotionDecision, session, reportSettings, grades, psychomotor, ranking_basis, psychomotorSettings }) {
    const { settings } = usePage().props;
    const { school_identity, theme_colors } = settings || {};
    const primaryColor = theme_colors?.result_primary || '#1e3a8a';
    const secondaryColor = theme_colors?.result_secondary || '#6366f1';

    const printReport = () => {
        window.print();
    };

    const downloadPDF = async () => {
        const element = document.getElementById('report-card-paper');
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
            pdf.save(`${student.surname}_${student.firstname}_Annual_Report.pdf`);

        } catch (error) {
            console.error('PDF Generation Error:', error);
            alert('Failed to generate PDF. Please try again or use the Print option.');
        }
    };

    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        if (urlParams.get('print') === 'true') {
            setTimeout(() => {
                window.print();
            }, 1000);
        }
    }, []);

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

    return (
        <AuthenticatedLayout
            noPadding={true}
            header={
                <div className="flex flex-col md:flex-row items-center justify-between gap-4 w-full no-print">
                    <div className="flex items-center gap-4 w-full md:w-auto">
                        <Link
                            href={route('results.management', {
                                tab: 'annual-reports',
                                academic_session_id: session.id,
                                school_class_id: historicClass ? historicClass.school_class_id : student.class_section?.school_class_id,
                                ranking_basis: ranking_basis
                            })}
                            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-all"
                        >
                            <ArrowLeft size={20} />
                        </Link>
                        <div className="flex flex-col gap-1">
                            <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Annual Report Card</h2>
                            <p className="text-slate-600 dark:text-slate-400 text-sm">{session.name} Academic Session</p>
                        </div>
                    </div>
                    <div className="flex flex-col md:flex-row items-center gap-3 w-full md:w-auto">
                        {/* Manual Promotion Control (No Print) */}
                        <div className="hidden md:flex items-center gap-2 bg-slate-800 p-1.5 rounded-lg border border-slate-700">
                            <select
                                defaultValue={promotionDecision?.status || ''}
                                onChange={(e) => {
                                    const newStatus = e.target.value;
                                    e.preventDefault();

                                    Swal.fire({
                                        title: 'Update Promotion Status?',
                                        text: `Change status to "${newStatus}"? This will override previous decisions.`,
                                        icon: 'warning',
                                        showCancelButton: true,
                                        confirmButtonColor: '#4f46e5',
                                        cancelButtonColor: '#ef4444',
                                        confirmButtonText: 'Yes, update it!'
                                    }).then((result) => {
                                        if (result.isConfirmed) {
                                            router.post(route('promotions.decision.update'), {
                                                student_id: student.id,
                                                academic_session_id: session.id,
                                                status: newStatus,
                                                reason: 'Manual Override from Report Card'
                                            }, {
                                                preserveScroll: true,
                                                onSuccess: () => Swal.fire({
                                                    title: 'Updated!',
                                                    text: 'Student promotion status has been updated.',
                                                    icon: 'success',
                                                    timer: 2000,
                                                    showConfirmButton: false
                                                })
                                            });
                                        } else {
                                            e.target.value = promotionDecision?.status || '';
                                        }
                                    });
                                }}
                                className="bg-slate-900 text-white text-[10px] border-slate-700 rounded h-8 px-2 focus:ring-1 focus:ring-indigo-500 font-bold uppercase"
                            >
                                <option value="" disabled>Change Status</option>
                                <option value="Promoted">Promoted</option>
                                <option value="Not Promoted">Not Promoted</option>
                                <option value="Promoted on Trial">Promoted on Trial</option>
                            </select>
                        </div>


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
            <Head title={`Annual Report - ${student.surname}`} />

            <div id="annual-report-content" className="pdf-viewer-wrapper bg-slate-100 dark:bg-slate-950 p-4 sm:p-8 min-h-screen py-10 print:p-0 print:bg-white">
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

        </AuthenticatedLayout >
    );
}
