import { Head, useForm, router } from '@inertiajs/react';
import { useState, useRef, useCallback } from 'react';
import axios from 'axios';
import Webcam from 'react-webcam';
import imageCompression from 'browser-image-compression';
import { Search, Camera, Upload, RefreshCw, X, LogOut, User, CheckCircle } from 'lucide-react';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';

export default function Capture({ school_name }) {
    const [searchQuery, setSearchQuery] = useState('');
    const [students, setStudents] = useState([]);
    const [selectedStudent, setSelectedStudent] = useState(null);
    const [capturedImage, setCapturedImage] = useState(null);
    const [isCameraOpen, setIsCameraOpen] = useState(false);
    const [uploading, setUploading] = useState(false);

    const webcamRef = useRef(null);

    // Search Logic
    const handleSearch = async (query) => {
        setSearchQuery(query);
        if (query.length < 2) {
            setStudents([]);
            return;
        }

        try {
            const response = await fetch(route('portal.search', { query }));
            const data = await response.json();
            setStudents(data);
        } catch (error) {
            console.error("Search error", error);
        }
    };

    // Camera Logic
    const capture = useCallback(() => {
        const imageSrc = webcamRef.current.getScreenshot();
        setCapturedImage(imageSrc);
        setIsCameraOpen(false);
    }, [webcamRef]);

    // Compression & Upload
    const uploadPhoto = async () => {
        if (!selectedStudent || !capturedImage) return;

        setUploading(true);

        try {
            // Convert Base64 to Blob
            const res = await fetch(capturedImage);
            const blob = await res.blob();
            const file = new File([blob], "profile.jpg", { type: "image/jpeg" });

            // Compress
            const options = {
                maxSizeMB: 0.05, // 50KB
                maxWidthOrHeight: 500,
                useWebWorker: true,
            };
            const compressedFile = await imageCompression(file, options);

            // Upload
            const formData = new FormData();
            formData.append('student_id', selectedStudent.id);
            formData.append('photo', compressedFile);

            const response = await axios.post(route('portal.upload'), formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });

            if (response.data.success) {
                toast.success(`Photo updated for ${selectedStudent.surname}`);
                setSelectedStudent(null);
                setCapturedImage(null);
                setSearchQuery('');
                setStudents([]);
            } else {
                toast.error("Upload failed. Try again.");
            }
        } catch (error) {
            console.error("Upload Error", error);
            toast.error("Error processing photo.");
        } finally {
            setUploading(false);
        }
    };

    const handleLogout = () => {
        router.post(route('portal.logout'));
    };

    return (
        <div className="min-h-screen bg-slate-950 text-white pb-20">
            <Head title="Photo Capture Portal" />
            <ToastContainer theme="dark" />

            {/* Header */}
            <div className="bg-slate-900 border-b border-slate-800 p-4 sticky top-0 z-10">
                <div className="max-w-3xl mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white font-bold">
                            <Camera size={20} />
                        </div>
                        <div>
                            <h1 className="font-bold text-lg leading-tight">{school_name}</h1>
                            <p className="text-xs text-slate-400">Photo Capture Portal</p>
                        </div>
                    </div>
                    <button
                        onClick={handleLogout}
                        className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-rose-400 transition-colors"
                        title="Logout"
                    >
                        <LogOut size={20} />
                    </button>
                </div>
            </div>

            <div className="max-w-3xl mx-auto p-4 space-y-6">

                {/* Search Section */}
                {!selectedStudent && (
                    <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="relative">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={20} />
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => handleSearch(e.target.value)}
                                placeholder="Search by name or Reg No..."
                                className="w-full bg-slate-900/50 border-slate-800 text-slate-200 text-lg rounded-2xl py-4 pl-12 focus:ring-indigo-500 focus:border-indigo-500 transition-all placeholder:text-slate-600"
                                autoFocus
                            />
                        </div>

                        <div className="space-y-2">
                            {students.map(student => (
                                <div
                                    key={student.id}
                                    onClick={() => setSelectedStudent(student)}
                                    className="bg-slate-900 border border-slate-800 p-4 rounded-2xl flex items-center gap-4 hover:border-indigo-500 cursor-pointer transition-all group"
                                >
                                    <div className="w-12 h-12 bg-slate-800 rounded-full flex items-center justify-center overflow-hidden border border-slate-700">
                                        {student.profile_picture ? (
                                            <img src={`/storage/${student.profile_picture}`} alt="" className="w-full h-full object-cover" />
                                        ) : (
                                            <User size={20} className="text-slate-500" />
                                        )}
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="font-bold text-slate-200 group-hover:text-indigo-400 transition-colors">{student.surname} {student.othername}</h3>
                                        <p className="text-sm text-slate-500">{student.class_section?.school_class?.name || 'No Class'} • <span className="font-mono text-xs">{student.registration_number}</span></p>
                                    </div>
                                    <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-slate-500 group-hover:bg-indigo-500 group-hover:text-white transition-all">
                                        <ArrowRightIcon />
                                    </div>
                                </div>
                            ))}
                            {searchQuery && students.length === 0 && (
                                <p className="text-slate-500 text-center py-8">No students found.</p>
                            )}
                        </div>
                    </div>
                )}

                {/* Capture Section */}
                {selectedStudent && (
                    <div className="space-y-6 animate-in zoom-in-95 duration-300">
                        {/* Student Header */}
                        <div className="flex items-center gap-4 bg-slate-900 p-4 rounded-2xl border border-slate-800">
                            <button onClick={() => { setSelectedStudent(null); setCapturedImage(null); }} className="p-2 hover:bg-slate-800 rounded-full text-slate-400">
                                <X size={20} />
                            </button>
                            <div className="flex-1">
                                <h2 className="font-bold text-xl">{selectedStudent.surname} {selectedStudent.othername}</h2>
                                <p className="text-indigo-400 text-sm">{selectedStudent.registration_number}</p>
                            </div>
                        </div>

                        {/* Camera/Preview Area */}
                        <div className="bg-black rounded-3xl overflow-hidden aspect-square relative shadow-2xl border-4 border-slate-800">
                            {capturedImage ? (
                                <img src={capturedImage} alt="Captured" className="w-full h-full object-cover" />
                            ) : isCameraOpen ? (
                                <Webcam
                                    audio={false}
                                    ref={webcamRef}
                                    screenshotFormat="image/jpeg"
                                    videoConstraints={{ facingMode: "environment", aspectRatio: 1 }}
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <div className="w-full h-full flex flex-col items-center justify-center bg-slate-900 gap-4">
                                    <User size={64} className="text-slate-700" />
                                    <p className="text-slate-500">Ready to capture</p>
                                </div>
                            )}

                            {/* Camera Controls */}
                            <div className="absolute bottom-6 left-0 right-0 flex justify-center gap-6">
                                {capturedImage ? (
                                    <>
                                        <button onClick={() => setCapturedImage(null)} className="p-4 bg-slate-800 rounded-full text-white shadow-lg border border-slate-600 hover:bg-slate-700">
                                            <RefreshCw size={24} />
                                        </button>
                                        <button onClick={uploadPhoto} disabled={uploading} className="p-4 bg-emerald-500 rounded-full text-white shadow-lg hover:bg-emerald-600 hover:scale-105 transition-all">
                                            {uploading ? <RefreshCw size={24} className="animate-spin" /> : <CheckCircle size={24} />}
                                        </button>
                                    </>
                                ) : isCameraOpen ? (
                                    <button onClick={capture} className="p-1 rounded-full border-4 border-white">
                                        <div className="w-16 h-16 bg-white rounded-full border-2 border-slate-900 hover:scale-95 transition-all" />
                                    </button>
                                ) : (
                                    <button onClick={() => setIsCameraOpen(true)} className="px-6 py-3 bg-indigo-600 text-white rounded-full font-bold shadow-lg hover:bg-indigo-700 flex items-center gap-2">
                                        <Camera size={20} /> Open Camera
                                    </button>
                                )}
                            </div>
                        </div>

                        <div className="text-center text-sm text-slate-500">
                            <p>Photo will be automatically compressed before upload.</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

function ArrowRightIcon() {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14" /><path d="m12 5 7 7-7 7" /></svg>
    )
}
