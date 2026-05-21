import React, { useState, useEffect } from 'react';
import { Head } from '@inertiajs/react';
import { QRCodeSVG } from 'qrcode.react';
import { RefreshCw, Clock, ShieldCheck, AlertCircle, Users, ChevronLeft } from 'lucide-react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import axios from 'axios';

export default function Monitor({ auth }) {
    const [token, setToken] = useState('');
    const [timeLeft, setTimeLeft] = useState(60);
    const [loading, setLoading] = useState(true);
    const [isOffline, setIsOffline] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');

    const refreshToken = async () => {
        setLoading(true);
        try {
            const response = await axios.get(route('staff-attendance.generate-token'));
            setToken(response.data.token);
            setTimeLeft(60);
            setIsOffline(false);
            setErrorMsg('');
        } catch (error) {
            console.error('Failed to generate token:', error);
            if (error.response) {
                if (error.response.status === 403) {
                    setErrorMsg('Permission Denied: Ensure you are logged in as an Admin.');
                } else {
                    setErrorMsg(`Server Error: ${error.response.status}`);
                }
                setIsOffline(false); // It's a server/logic error, not "offline"
            } else {
                setIsOffline(true);
                setErrorMsg('Network unreachable. Checking connection...');
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        refreshToken();
        const timer = setInterval(() => {
            setTimeLeft((prev) => {
                if (prev <= 1) {
                    refreshToken();
                    return 60;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, []);

    return (
        <div className="bg-slate-900 min-h-screen flex items-center justify-center p-4">
            <Head title="Attendance Monitor" />

            <div className="max-w-4xl w-full">
                <div className="bg-white overflow-hidden shadow-[0_0_100px_rgba(79,70,229,0.3)] sm:rounded-[3rem] border border-white/20">
                    <div className="p-8 md:p-16 flex flex-col items-center">

                        <div className="text-center mb-10">
                            <h3 className="text-4xl font-black text-slate-900 mb-4 tracking-tight">Staff Attendance Portal</h3>
                            {isOffline ? (
                                <div className="flex flex-col items-center gap-3">
                                    <div className="flex items-center justify-center gap-2 text-rose-600 animate-pulse bg-rose-50 px-6 py-3 rounded-full border border-rose-100 shadow-sm">
                                        <AlertCircle className="w-5 h-5" />
                                        <span className="text-sm font-black uppercase tracking-widest">Offline - Showing last valid QR</span>
                                    </div>
                                    <button
                                        onClick={refreshToken}
                                        className="text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-indigo-600 underline transition-colors"
                                    >
                                        Retry Connection Now
                                    </button>
                                </div>
                            ) : errorMsg ? (
                                <div className="bg-amber-50 text-amber-700 px-6 py-3 rounded-2xl border border-amber-100 flex items-center gap-3 mb-4">
                                    <AlertCircle className="w-5 h-5 flex-shrink-0" />
                                    <p className="text-sm font-bold">{errorMsg}</p>
                                </div>
                            ) : (
                                <p className="text-slate-500 text-lg font-medium max-w-md mx-auto leading-relaxed">
                                    Please scan this QR code with your mobile device to clock in or out.
                                </p>
                            )}
                        </div>

                        <div className="relative group mb-12">
                            {/* Animated Background Aura */}
                            <div className="absolute -inset-10 bg-indigo-500/10 rounded-[60px] blur-3xl group-hover:bg-indigo-500/20 transition-all duration-700 animate-pulse"></div>

                            <div className="relative bg-white p-12 rounded-[48px] shadow-2xl border border-slate-50 transition-all duration-700 group-hover:scale-[1.05] group-hover:shadow-[0_40px_80px_-15px_rgba(0,0,0,0.1)]">
                                {loading && !token ? (
                                    <div className="w-[350px] h-[350px] flex items-center justify-center">
                                        <RefreshCw className="w-16 h-12 text-indigo-500 animate-spin" />
                                    </div>
                                ) : (
                                    <div className="relative">
                                        <QRCodeSVG
                                            value={token || 'fetching...'}
                                            size={350}
                                            level="H"
                                            includeMargin={false}
                                            className="rounded-2xl"
                                        />
                                        {loading && (
                                            <div className="absolute inset-0 bg-white/60 backdrop-blur-[2px] flex items-center justify-center rounded-2xl">
                                                <RefreshCw className="w-10 h-10 text-indigo-500 animate-spin" />
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="flex flex-col items-center gap-8 w-full max-w-xl">
                            {/* Timer Progress Bar */}
                            <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden shadow-inner">
                                <div
                                    className="h-full bg-gradient-to-r from-indigo-600 via-violet-600 to-indigo-600 transition-all duration-1000 ease-linear rounded-full shadow-[0_0_10px_rgba(79,70,229,0.5)]"
                                    style={{ width: `${(timeLeft / 60) * 100}%` }}
                                ></div>
                            </div>

                            <div className="flex items-center justify-between w-full text-slate-500 font-bold text-sm tracking-wide">
                                <div className="flex items-center gap-3">
                                    <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''} text-indigo-500`} />
                                    <span>Token refreshes in {timeLeft}s</span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <Clock className="w-5 h-5 text-indigo-500" />
                                    <span>{new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true })}</span>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-6 w-full mt-6">
                                <div className="bg-emerald-50 p-6 rounded-[2rem] border border-emerald-100 flex flex-col items-center text-center shadow-sm">
                                    <div className="w-10 h-10 bg-white rounded-2xl shadow-sm flex items-center justify-center mb-3">
                                        <ShieldCheck className="w-6 h-6 text-emerald-600" />
                                    </div>
                                    <span className="text-xs uppercase tracking-[0.2em] font-black text-emerald-800">Security</span>
                                    <span className="text-[10px] text-emerald-700/60 font-bold mt-1">SIGNED & ENCRYPTED</span>
                                </div>
                                <div className="bg-indigo-50 p-6 rounded-[2rem] border border-indigo-100 flex flex-col items-center text-center shadow-sm">
                                    <div className="w-10 h-10 bg-white rounded-2xl shadow-sm flex items-center justify-center mb-3">
                                        <Users className="w-6 h-6 text-indigo-600" />
                                    </div>
                                    <span className="text-xs uppercase tracking-[0.2em] font-black text-indigo-800">Support</span>
                                    <span className="text-[10px] text-indigo-700/60 font-bold mt-1">DEVICE BOUND REGISTRATION</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Minimal Back to Dashboard link for admins (floating) */}
            <a
                href={route('dashboard')}
                className="fixed top-8 left-8 text-white/40 hover:text-white flex items-center gap-2 text-xs font-black uppercase tracking-widest transition-all"
            >
                <ChevronLeft className="w-4 h-4" />
                Return to Dashboard
            </a>
        </div>
    );
}
