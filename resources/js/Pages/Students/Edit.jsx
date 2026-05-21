import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, Link } from '@inertiajs/react';
import Card from '@/Components/Card';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import { Save, ArrowLeft, Upload, User, Phone, MapPin, Calendar, Hash, ShieldCheck, GraduationCap } from 'lucide-react';
import { toast } from 'react-toastify';
import { useState } from 'react';

export default function Edit({ auth, student, classSections }) {
    const { data, setData, post, processing, errors } = useForm({
        _method: 'PUT',
        registration_number: student.registration_number || '',
        surname: student.surname || '',
        othername: student.othername || '',
        gender: student.gender || '',
        date_of_birth: student.date_of_birth || '',
        address: student.address || '',
        guardian_name: student.guardian_name || '',
        guardian_number: student.guardian_number || '',
        guardian_email: student.guardian_email || '',
        class_section_id: student.class_section_id || '',
        status: student.status || 'active',
        profile_picture: null,
    });

    const [preview, setPreview] = useState(student.profile_picture ? `/storage/${student.profile_picture}` : null);

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setData('profile_picture', file);
            setPreview(URL.createObjectURL(file));
        }
    };

    const submit = (e) => {
        e.preventDefault();
        // Use POST with _method PUT for multipart compatibility
        post(route('students.update', student.id));
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center gap-4">
                    <Link href={route('students.index')} className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-all">
                        <ArrowLeft size={20} />
                    </Link>
                    <div className="flex flex-col gap-1">
                        <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Edit Student: {student.surname} {student.othername}</h2>
                        <p className="text-slate-600 dark:text-slate-400 text-sm">Update profile information and enrollment status.</p>
                    </div>
                </div>
            }
        >
            <Head title={`Edit - ${student.surname}`} />

            <div className="max-w-5xl">
                <form onSubmit={submit} className="space-y-8">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Profile Section */}
                        <div className="lg:col-span-1 space-y-6">
                            <Card title="Student Profile" description="Update identity image.">
                                <div className="flex flex-col items-center gap-6 py-4">
                                    <div className="relative group">
                                        <div className="w-40 h-40 rounded-[2.5rem] bg-slate-100 dark:bg-slate-900 border-2 border-dashed border-slate-300 dark:border-slate-700 overflow-hidden flex items-center justify-center transition-all group-hover:border-indigo-400 dark:group-hover:border-indigo-500/50">
                                            {preview ? (
                                                <img src={preview} alt="Profile" className="w-full h-full object-cover" />
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
                                        <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Update Photo</p>
                                        <p className="text-[10px] text-slate-600 mt-1">Leave empty to keep current image</p>
                                    </div>
                                    {errors.profile_picture && <p className="text-rose-500 text-[10px] font-bold mt-1">{errors.profile_picture}</p>}
                                </div>
                            </Card>

                            <Card title="Life Cycle Status" description="Current student condition.">
                                <div className="space-y-4">
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block">Enrollment Status</label>
                                        <select
                                            value={data.status}
                                            onChange={e => setData('status', e.target.value)}
                                            className="w-full bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-800 text-slate-900 dark:text-slate-200 text-sm rounded-xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/50 transition-all"
                                        >
                                            <option value="active">Active</option>
                                            <option value="inactive">Inactive</option>
                                            {student.status === 'graduated' && <option value="graduated">Graduated</option>}
                                        </select>
                                    </div>
                                    {errors.status && <p className="text-rose-500 text-xs font-medium">{errors.status}</p>}
                                </div>
                            </Card>
                        </div>

                        {/* Data Sections */}
                        <div className="lg:col-span-2 space-y-6">
                            <Card title="Identification Data" description="Primary academic and personal details.">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-1.5">
                                            <Hash size={10} /> Registration Number
                                        </label>
                                        <input
                                            type="text"
                                            value={data.registration_number}
                                            readOnly
                                            disabled
                                            className="w-full bg-slate-100 dark:bg-slate-900/50 border border-slate-300 dark:border-slate-800 text-slate-600 dark:text-slate-400 text-sm rounded-xl px-4 py-2.5 italic"
                                        />
                                        {errors.registration_number && <p className="text-rose-500 text-xs font-medium">{errors.registration_number}</p>}
                                    </div>

                                    <div className="space-y-1">
                                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-1.5">
                                            <GraduationCap size={10} /> Current Class Arm <span className="text-red-500">*</span>
                                        </label>
                                        <select
                                            value={data.class_section_id}
                                            onChange={e => setData('class_section_id', e.target.value)}
                                            className="w-full bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-800 text-slate-900 dark:text-slate-200 text-sm rounded-xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/50 transition-all"
                                        >
                                            <option value="">Transfer Class...</option>
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
                                    </div>
                                </div>
                            </Card>

                            <Card title="Guardian & Contact" description="Information for record keeping.">
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
                                    Save Changes
                                </PrimaryButton>
                            </div>
                        </div>
                    </div>
                </form>
            </div>
        </AuthenticatedLayout>
    );
}
