import React, { useEffect, useState, useRef } from 'react';
import { Head, router } from '@inertiajs/react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { Camera, AlertTriangle, CheckCircle, Info, ArrowLeft, Loader2, Smartphone } from 'lucide-react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';

export default function Scan({ auth, error, success, info }) {
    const [scanning, setScanning] = useState(true);
    const [deviceId, setDeviceId] = useState('');
    const scannerRef = useRef(null);

    const [syncing, setSyncing] = useState(false);
    const [pendingCount, setPendingCount] = useState(0);

    useEffect(() => {
        // Initialize or retrieve Device ID
        let id = localStorage.getItem('huss_staff_device_id');
        if (!id) {
            id = 'dev_' + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
            localStorage.setItem('huss_staff_device_id', id);
        }
        setDeviceId(id);

        // Check for pending scans on load
        updatePendingCount();

        const scanner = new Html5QrcodeScanner(
            "reader",
            {
                fps: 10,
                qrbox: { width: 250, height: 250 },
                aspectRatio: 1.0,
                showTorchButtonIfSupported: true,
                supportedScanTypes: [0], // 0: CAMERA
                videoConstraints: {
                    facingMode: { ideal: "environment" }
                }
            },
            /* verbose= */ false
        );

        scanner.render(onScanSuccess, onScanFailure);
        scannerRef.current = scanner;

        // Auto-sync when online
        const handleOnline = () => syncOfflineScans();
        window.addEventListener('online', handleOnline);

        // Periodic check for sync
        const syncInterval = setInterval(syncOfflineScans, 30000);

        return () => {
            scanner.clear().catch(error => console.error("Failed to clear scanner", error));
            window.removeEventListener('online', handleOnline);
            clearInterval(syncInterval);
        };
    }, []);

    const updatePendingCount = () => {
        const queue = JSON.parse(localStorage.getItem('huss_attendance_queue') || '[]');
        setPendingCount(queue.length);
    };

    const syncOfflineScans = async () => {
        if (!navigator.onLine || syncing) return;
        const queue = JSON.parse(localStorage.getItem('huss_attendance_queue') || '[]');
        if (queue.length === 0) return;

        setSyncing(true);
        const newQueue = [...queue];
        const item = newQueue[0];

        router.post(item.url, { device_id: item.device_id }, {
            preserveScroll: true,
            onSuccess: () => {
                newQueue.shift();
                localStorage.setItem('huss_attendance_queue', JSON.stringify(newQueue));
                updatePendingCount();
                setSyncing(false);
                if (newQueue.length > 0) syncOfflineScans();
            },
            onError: () => {
                setSyncing(false);
            },
            onFinish: () => setSyncing(false)
        });
    };

    const onScanSuccess = (decodedText) => {
        setScanning(false);
        if (scannerRef.current) {
            scannerRef.current.clear();
        }

        const deviceId = localStorage.getItem('huss_staff_device_id');

        if (!navigator.onLine) {
            // Save to offline queue
            const queue = JSON.parse(localStorage.getItem('huss_attendance_queue') || '[]');
            queue.push({ url: decodedText, device_id: deviceId, timestamp: Date.now() });
            localStorage.setItem('huss_attendance_queue', JSON.stringify(queue));
            updatePendingCount();
            router.reload({
                data: { info: "Scan saved! You are offline. We will sync this once you have internet." }
            });
            return;
        }

        // decodedText is the signed URL from generateToken
        router.post(decodedText, {
            device_id: deviceId
        }, {
            preserveScroll: true,
            onError: (err) => {
                console.error("Post error:", err);
                // If it's a network error, queue it
                if (!navigator.onLine) {
                    const queue = JSON.parse(localStorage.getItem('huss_attendance_queue') || '[]');
                    queue.push({ url: decodedText, device_id: deviceId, timestamp: Date.now() });
                    localStorage.setItem('huss_attendance_queue', JSON.stringify(queue));
                    updatePendingCount();
                }
                setScanning(true);
            }
        });
    };

    const onScanFailure = (error) => {
        // Quietly fail for most frames where no QR is found
    };

    const restartScanner = () => {
        router.get(route('staff-attendance.scan'), {}, {
            onFinish: () => {
                setScanning(true);
            }
        });
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="font-semibold text-xl text-slate-800 leading-tight">Attendance Scanner</h2>}
        >
            <Head title="Scan QR Code" />

            <div className="py-6 bg-slate-50 min-h-[calc(100vh-64px)] px-4">
                <div className="max-w-md mx-auto">

                    {/* Status Messages */}
                    {error && (
                        <div className="mb-6 p-4 bg-rose-50 border border-rose-100 rounded-2xl flex items-start gap-3 animate-in fade-in slide-in-from-top-4 duration-300">
                            <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                            <div>
                                <h4 className="text-sm font-bold text-rose-900">Scan Failed</h4>
                                <p className="text-xs text-rose-700 font-medium leading-relaxed">{error}</p>
                                <button onClick={restartScanner} className="mt-3 text-[10px] font-black uppercase tracking-widest text-rose-600 bg-white px-3 py-1.5 rounded-lg border border-rose-200 hover:bg-rose-50 transition-colors">
                                    Try Again
                                </button>
                            </div>
                        </div>
                    )}

                    {success && (
                        <div className="mb-6 p-5 bg-emerald-50 border border-emerald-100 rounded-2xl flex flex-col items-center text-center animate-in zoom-in duration-500">
                            <div className="w-12 h-12 bg-white rounded-2xl shadow-sm flex items-center justify-center mb-4">
                                <CheckCircle className="w-8 h-8 text-emerald-500" />
                            </div>
                            <h4 className="text-lg font-black text-emerald-900">Success!</h4>
                            <p className="text-sm text-emerald-700 font-medium mt-1">{success}</p>
                            <button onClick={restartScanner} className="mt-6 w-full py-3 bg-emerald-600 text-white rounded-xl text-xs font-black uppercase tracking-widest shadow-lg shadow-emerald-600/20 active:scale-95 transition-all">
                                Done
                            </button>
                        </div>
                    )}

                    {info && (
                        <div className="mb-6 p-5 bg-indigo-50 border border-indigo-100 rounded-2xl flex flex-col items-center text-center">
                            <Info className="w-6 h-6 text-indigo-600 mb-3" />
                            <p className="text-sm text-indigo-900 font-bold">{info}</p>
                            <button onClick={restartScanner} className="mt-4 text-xs font-black uppercase tracking-widest text-indigo-600 underline">
                                Back to Scanner
                            </button>
                        </div>
                    )}

                    {/* Scanner UI */}
                    {!success && !error && !info && (
                        <div className="bg-white rounded-[2.5rem] shadow-2xl border border-slate-200 overflow-hidden">
                            <div className="p-8 text-center italic border-b border-slate-50 bg-slate-50/50">
                                <Smartphone className="w-8 h-8 text-slate-400 mx-auto mb-2 opacity-50" />
                                <h3 className="text-xl font-black text-slate-800 tracking-tight not-italic">Clock In / Out</h3>
                                <p className="text-xs text-slate-500 font-medium mt-1 not-italic">Point your camera at the office monitor QR code</p>
                            </div>

                            <div className="p-4 relative">
                                <div id="reader" className="overflow-hidden rounded-3xl border-none"></div>

                                {/* Overlay decorations */}
                                <div className="absolute top-8 left-8 w-8 h-8 border-t-4 border-l-4 border-indigo-500 rounded-tl-lg pointer-events-none opacity-40"></div>
                                <div className="absolute top-8 right-8 w-8 h-8 border-t-4 border-r-4 border-indigo-500 rounded-tr-lg pointer-events-none opacity-40"></div>
                                <div className="absolute bottom-8 left-8 w-8 h-8 border-b-4 border-l-4 border-indigo-500 rounded-bl-lg pointer-events-none opacity-40"></div>
                                <div className="absolute bottom-8 right-8 w-8 h-8 border-b-4 border-r-4 border-indigo-500 rounded-br-lg pointer-events-none opacity-40"></div>
                            </div>

                            <div className="p-8 bg-slate-50 flex flex-col items-center">
                                <div className="flex items-center gap-2 text-slate-400 text-[10px] font-black uppercase tracking-widest mb-4">
                                    <Loader2 className="w-3 h-3 animate-spin" />
                                    <span>Scanning Live...</span>
                                </div>
                                <p className="text-[10px] text-slate-400 text-center max-w-[200px]">
                                    Device ID: <span className="text-slate-500">{deviceId ? `${deviceId.substring(0, 8)}...` : 'Initializing...'}</span>
                                </p>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Hidden styles to clean up html5-qrcode UI */}
            <style dangerouslySetInnerHTML={{
                __html: `
                #reader__scan_region { background: #fff !important; }
                #reader__dashboard_section_csr button { 
                    padding: 8px 16px !important; 
                    background: #6366f1 !important; 
                    color: white !important; 
                    border-radius: 12px !important; 
                    border: none !important;
                    font-size: 12px !important;
                    font-weight: 800 !important;
                    text-transform: uppercase !important;
                    letter-spacing: 0.1em !important;
                    box-shadow: 0 10px 15px -3px rgba(99, 102, 241, 0.3) !important;
                }
                #html5-qrcode-button-file-selection,
                #reader__dashboard_section_csr > div > button:nth-child(2) { 
                    display: none !important; 
                }
                select {
                    background: #f8fafc !important;
                    border: 1px solid #e2e8f0 !important;
                    border-radius: 12px !important;
                    font-size: 12px !important;
                    padding: 8px !important;
                }
            `}} />
        </AuthenticatedLayout>
    );
}
