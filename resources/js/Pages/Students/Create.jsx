import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, Link } from '@inertiajs/react';
import Card from '@/Components/Card';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import { UserPlus, ArrowLeft, Save, Upload, User, Phone, MapPin, Calendar, Hash, ShieldCheck, GraduationCap } from 'lucide-react';
import { toast } from 'react-toastify';
import { useState } from 'react';

export default function Create({ auth, classSections, sessions }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        registration_number: '',
        surname: '',
        othername: '',
        gender: '',
        date_of_birth: '',
        address: '',
        guardian_name: '',
        guardian_number: '',
        guardian_email: '',
        class_section_id: '',
        academic_session_id: '',
        status: 'active',
        profile_picture: null,
    });

    const [preview, setPreview] = useState(null);

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setData('profile_picture', file);
            setPreview(URL.createObjectURL(file));
        }
    };

    const submit = (e) => {
        e.preventDefault();
        post(route('students.store'), {
            onSuccess: () => reset(),
        });
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center gap-4">
                    <Link href={route('students.index')} className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-white dark:hover:bg-slate-800 rounded-xl transition-all">
                        <ArrowLeft size={20} />
                    </Link>
                    <div className="flex flex-col gap-1">
                        <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Register New Student</h2>
                        <p className="text-slate-600 dark:text-slate-400 text-sm">Enroll a new student into the school curriculum.</p>
                    </div>
                </div>
            }
        >
            <Head title="Register Student" />

            <div className="max-w-5xl">
                <form onSubmit={submit} className="space-y-8">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Profile Section */}
                        <div className="lg:col-span-1 space-y-6">
                            <Card title="Student Profile" description="Basic identity and photo.">
                                <div className="flex flex-col items-center gap-6 py-4">
                                    <div className="relative group">
                                        <div className="w-40 h-40 rounded-[2.5rem] bg-slate-100 dark:bg-slate-900 border-2 border-dashed border-slate-300 dark:border-slate-700 overflow-hidden flex items-center justify-center transition-all group-hover:border-indigo-400 dark:group-hover:border-indigo-500/50">
                                            {preview ? (
                                                <img src={preview} alt="Preview" className="w-full h-full object-cover" />
                                            ) : (
                                                <User size={48} className="text-slate-700" />
                                            )}
                                        </div>
                                        <label className="absolute -bottom-2 -right-2 p-3 bg-indigo-500 text-white rounded-2xl shadow-xl shadow-indigo-500/20 cursor-pointer hover:bg-indigo-600 transition-all hover:scale-110">
                                            <Upload size={18} />
                                            <input type="file" className="hidden" onChange={handleImageChange} accept="image/*" />
                                        </label>
                                    </div>
                                    <div className="text-center">
                                        <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Profile Picture</p>
                                        <p className="text-[10px] text-slate-600 dark:text-slate-500 mt-1">Recommended: Square image, max 2MB</p>
                                    </div>
                                    {errors.profile_picture && <p className="text-rose-500 text-[10px] font-bold mt-1">{errors.profile_picture}</p>}
                                </div>
                            </Card>

                            <Card title="Academic Status" description="Enrollment condition.">
                                <div className="space-y-4">
                                    <div>
                                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5 block">Status</label>
                                        <select
                                            value={data.status}
                                            onChange={e => setData('status', e.target.value)}
                                            className="w-full bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-800 text-slate-900 dark:text-slate-200 text-sm rounded-xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/50 transition-all"
                                        >
                                            <option value="active">Active</option>
                                            <option value="inactive">Inactive</option>
                                        </select>
                                    </div>
                                    {errors.status && <p className="text-rose-500 text-xs font-medium">{errors.status}</p>}
                                </div>
                            </Card>
                        </div>

                        {/* Personal & Academic Data */}
                        <div className="lg:col-span-2 space-y-6">
                            <Card title="Personal Information" description="Required fields for student identity.">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-1.5">
                                            <Hash size={10} /> Registration Number
                                        </label>
                                        <div className="w-full bg-slate-100 dark:bg-slate-900/50 border border-slate-300 dark:border-slate-800 text-slate-600 dark:text-slate-400 text-sm rounded-xl px-4 py-2.5 italic">
                                            Auto-generated by system (e.g. HUSS/STU/2025/xxx)
                                        </div>
                                        <p className="text-[10px] text-slate-500 mt-1">This ID will be assigned automatically upon completion.</p>
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-1.5">
                                            <Calendar size={10} /> Admission Session <span className="text-red-500">*</span>
                                        </label>
                                        <select
                                            value={data.academic_session_id}
                                            onChange={e => setData('academic_session_id', e.target.value)}
                                            className="w-full bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-800 text-slate-900 dark:text-slate-200 text-sm rounded-xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/50 transition-all"
                                        >
                                            <option value="">Select Session</option>
                                            {sessions.map(session => (
                                                <option key={session.id} value={session.id}>{session.name} {session.is_current ? '(Current)' : ''}</option>
                                            ))}
                                        </select>
                                        {errors.academic_session_id && <p className="text-rose-500 text-xs font-medium">{errors.academic_session_id}</p>}
                                    </div>

                                    <div className="space-y-1">
                                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-1.5">
                                            <GraduationCap size={10} /> Assign Class Section <span className="text-red-500">*</span>
                                        </label>
                                        <select
                                            value={data.class_section_id}
                                            onChange={e => setData('class_section_id', e.target.value)}
                                            className="w-full bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-800 text-slate-900 dark:text-slate-200 text-sm rounded-xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/50 transition-all"
                                        >
                                            <option value="">Select Level & Arm</option>
                                            {classSections.map(cs => (
                                                <option key={cs.id} value={cs.id}>
                                                    {cs.school_class?.name}{cs.class_arm?.name !== 'No arm' ? ` - ${cs.class_arm?.name}` : ''}
                                                </option>
                                            ))}
                                        </select>
                                        {errors.class_section_id && <p className="text-rose-500 text-xs font-medium">{errors.class_section_id}</p>}
                                    </div>

                                    <div className="space-y-1">
                                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-1.5">
                                            <User size={10} /> Surname <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            value={data.surname}
                                            onChange={e => setData('surname', e.target.value)}
                                            className="w-full bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-800 text-slate-900 dark:text-slate-200 text-sm rounded-xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/50 transition-all"
                                        />
                                        {errors.surname && <p className="text-rose-500 text-xs font-medium">{errors.surname}</p>}
                                    </div>

                                    <div className="space-y-1">
                                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-1.5">
                                            <User size={10} /> Othername <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            value={data.othername}
                                            onChange={e => setData('othername', e.target.value)}
                                            className="w-full bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-800 text-slate-900 dark:text-slate-200 text-sm rounded-xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/50 transition-all"
                                        />
                                        {errors.othername && <p className="text-rose-500 text-xs font-medium">{errors.othername}</p>}
                                    </div>

                                    <div className="space-y-1">
                                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-1.5">
                                            <Calendar size={10} /> Date of Birth <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="date"
                                            value={data.date_of_birth}
                                            max={new Date().toISOString().split('T')[0]}
                                            onChange={e => setData('date_of_birth', e.target.value)}
                                            className="w-full bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-800 text-slate-900 dark:text-slate-200 text-sm rounded-xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/50 transition-all p-2.5"
                                        />
                                        {errors.date_of_birth && <p className="text-rose-500 text-xs font-medium">{errors.date_of_birth}</p>}
                                    </div>

                                    <div className="space-y-1">
                                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-1.5">
                                            <ShieldCheck size={10} /> Gender <span className="text-red-500">*</span>
                                        </label>
                                        <div className="flex gap-4 pt-2">
                                            {['male', 'female', 'other'].map((g) => (
                                                <label key={g} className="flex items-center gap-2 cursor-pointer group">
                                                    <input
                                                        type="radio"
                                                        name="gender"
                                                        value={g}
                                                        checked={data.gender === g}
                                                        onChange={e => setData('gender', e.target.value)}
                                                        className="text-sm text-slate-600 dark:text-slate-400 group-hover:text-slate-900 dark:group-hover:text-slate-200 transition-colors capitalize"
                                                    />
                                                    <span className="text-sm text-slate-600 dark:text-slate-400 group-hover:text-slate-900 dark:group-hover:text-slate-200 transition-colors capitalize">{g}</span>
                                                </label>
                                            ))}
                                        </div>
                                        {errors.gender && <p className="text-rose-500 text-xs font-medium">{errors.gender}</p>}
                                    </div>
                                </div>
                            </Card>

                            <Card title="Guardian & Contact" description="Information for emergency and notification.">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-1.5">
                                            <User size={10} /> Guardian Name
                                        </label>
                                        <input
                                            type="text"
                                            value={data.guardian_name}
                                            onChange={e => setData('guardian_name', e.target.value)}
                                            className="w-full bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-800 text-slate-900 dark:text-slate-200 text-sm rounded-xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/50 transition-all"
                                        />
                                        {errors.guardian_name && <p className="text-rose-500 text-xs font-medium">{errors.guardian_name}</p>}
                                    </div>

                                    <div className="space-y-1">
                                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-1.5">
                                            <Phone size={10} /> Guardian Number
                                        </label>
                                        <input
                                            type="text"
                                            value={data.guardian_number}
                                            onChange={e => setData('guardian_number', e.target.value)}
                                            className="w-full bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-800 text-slate-900 dark:text-slate-200 text-sm rounded-xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/50 transition-all"
                                        />
                                        {errors.guardian_number && <p className="text-rose-500 text-xs font-medium">{errors.guardian_number}</p>}
                                    </div>

                                    <div className="md:col-span-2 space-y-1">
                                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-1.5">
                                            <User size={10} /> Guardian Email
                                        </label>
                                        <input
                                            type="email"
                                            value={data.guardian_email}
                                            onChange={e => setData('guardian_email', e.target.value)}
                                            className="w-full bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-800 text-slate-900 dark:text-slate-200 text-sm rounded-xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/50 transition-all"
                                            placeholder="optional@example.com"
                                        />
                                        {errors.guardian_email && <p className="text-rose-500 text-xs font-medium">{errors.guardian_email}</p>}
                                    </div>

                                    <div className="md:col-span-2 space-y-1">
                                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-1.5">
                                            <MapPin size={10} /> Resident Address
                                        </label>
                                        <textarea
                                            value={data.address}
                                            onChange={e => setData('address', e.target.value)}
                                            rows="2"
                                            className="w-full bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-800 text-slate-900 dark:text-slate-200 text-sm rounded-xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/50 transition-all"
                                        ></textarea>
                                        {errors.address && <p className="text-rose-500 text-xs font-medium">{errors.address}</p>}
                                    </div>
                                </div>
                            </Card>

                            <div className="flex items-center justify-end gap-3 pt-4">
                                <Link href={route('students.index')}>
                                    <SecondaryButton>Cancel</SecondaryButton>
                                </Link>
                                <PrimaryButton disabled={processing} className="gap-2">
                                    <Save size={18} />
                                    Complete Registration
                                </PrimaryButton>
                            </div>
                        </div>
                    </div>
                </form>
            </div>
        </AuthenticatedLayout>
    );
}
