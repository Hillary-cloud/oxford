import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, Link } from '@inertiajs/react';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import TextInput from '@/Components/TextInput';
import Card from '@/Components/Card';
import { UserPlus, ArrowLeft, Eye, EyeOff, Camera, MapPin, Phone, Briefcase, Users } from 'lucide-react';
import { useState, useEffect } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function Create({ auth, flash }) {
    const [showPassword, setShowPassword] = useState(false);
    const [previewImage, setPreviewImage] = useState(null);

    const { data, setData, post, processing, errors, reset } = useForm({
        profile_image: null,
        name: '',
        staff_id: '',
        phone: '',
        email: '',
        password: '',
        address: '',
        qualification: '',
        date_of_birth: '',
        employment_date: '',
        employment_type: 'full time',
        next_of_kin: '',
        next_of_kin_phone: '',
    });



    const handleImageChange = (e) => {
        const file = e.target.files[0];
        setData('profile_image', file);
        if (file) {
            setPreviewImage(URL.createObjectURL(file));
        }
    };

    const submit = (e) => {
        e.preventDefault();
        post(route('users.store'), {
            onSuccess: () => reset('password'),
            onFinish: () => reset('password'),
        });
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center gap-4">
                    <Link href={route('users.index')} className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-white dark:hover:bg-slate-800 rounded-xl transition-all">
                        <ArrowLeft size={20} />
                    </Link>
                    <div className="flex flex-col gap-1">
                        <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Register Staff</h2>
                        <p className="text-slate-600 dark:text-slate-400 text-sm">Create a new staff profile with default teacher privileges.</p>
                    </div>
                </div>
            }
        >
            <Head title="Add New Staff" />


            <form onSubmit={submit} className="max-w-5xl space-y-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Column: Profile & Account */}
                    <div className="lg:col-span-1 space-y-8">
                        <Card title="Profile Photo" description="Official staff portrait.">
                            <div className="flex flex-col items-center">
                                <div className="relative group">
                                    <div className="w-40 h-40 rounded-[2.5rem] bg-slate-100 dark:bg-slate-900 border-2 border-dashed border-slate-300 dark:border-slate-700 flex items-center justify-center overflow-hidden group-hover:border-indigo-400 dark:group-hover:border-indigo-500/50 transition-all">
                                        {previewImage ? (
                                            <img src={previewImage} alt="Preview" className="w-full h-full object-cover" />
                                        ) : (
                                            <Camera className="text-slate-400 dark:text-slate-600 group-hover:text-indigo-500 dark:group-hover:text-indigo-400" size={32} />
                                        )}
                                    </div>
                                    <input
                                        type="file"
                                        id="profile_image"
                                        className="hidden"
                                        onChange={handleImageChange}
                                        accept="image/*"
                                    />
                                    <label
                                        htmlFor="profile_image"
                                        className="absolute -bottom-2 -right-2 p-3 bg-indigo-500 text-white rounded-2xl shadow-xl shadow-indigo-500/20 cursor-pointer hover:bg-indigo-600 transition-all hover:scale-110"
                                    >
                                        <UserPlus size={16} />
                                    </label>
                                </div>
                                <p className="text-xs text-slate-600 dark:text-slate-500 text-center mt-4">PNG, JPG or GIF. Max 2MB.</p>
                                <InputError message={errors.profile_image} className="mt-2" />
                            </div>
                        </Card>

                        <Card title="Access Credentials" description="Login credentials.">
                            <div className="space-y-4">
                                <div>
                                    <InputLabel htmlFor="staff_id" value="Staff ID" />
                                    <div className="block w-full bg-slate-100 dark:bg-slate-900/50 border border-slate-300 dark:border-slate-800 text-slate-600 dark:text-slate-400 text-sm rounded-xl px-4 py-2.5 italic mt-1">
                                        Auto-generated by system (e.g. HUSS/STAFF/041)
                                    </div>
                                    <p className="text-[10px] text-slate-500 mt-1">Assigned automatically based on school configuration.</p>
                                </div>

                                <div>
                                    <InputLabel htmlFor="email" value="Email Address" required />
                                    <TextInput
                                        id="email"
                                        type="email"
                                        name="email"
                                        value={data.email}
                                        className="block w-full"
                                        onChange={(e) => setData('email', e.target.value)}
                                        required
                                        placeholder="staff@school.com"
                                    />
                                    <InputError message={errors.email} />
                                </div>

                                <div>
                                    <InputLabel htmlFor="password" value="System Password" required />
                                    <div className="relative">
                                        <TextInput
                                            id="password"
                                            type={showPassword ? 'text' : 'password'}
                                            name="password"
                                            value={data.password}
                                            className="block w-full pr-10"
                                            onChange={(e) => setData('password', e.target.value)}
                                            required
                                            placeholder="••••••••"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-500 hover:text-indigo-400 transition-colors"
                                        >
                                            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                        </button>
                                    </div>
                                    <InputError message={errors.password} />
                                </div>
                            </div>
                        </Card>
                    </div>

                    {/* Right Column: Personal & Employment Details */}
                    <div className="lg:col-span-2 space-y-8">
                        <Card title="Personal Information" description="Legal name and contact details.">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="md:col-span-2">
                                    <InputLabel htmlFor="name" value="Full Name" required />
                                    <TextInput
                                        id="name"
                                        name="name"
                                        value={data.name}
                                        className="block w-full"
                                        onChange={(e) => setData('name', e.target.value)}
                                        required
                                        placeholder="John Doe"
                                    />
                                    <InputError message={errors.name} />
                                </div>

                                <div>
                                    <InputLabel htmlFor="phone" value="Phone Number" required />
                                    <TextInput
                                        id="phone"
                                        name="phone"
                                        value={data.phone}
                                        className="block w-full"
                                        onChange={(e) => setData('phone', e.target.value)}
                                        required
                                        placeholder="+234 000 000 0000"
                                    />
                                    <InputError message={errors.phone} />
                                </div>

                                <div>
                                    <InputLabel htmlFor="date_of_birth" value="Date of Birth" required />
                                    <TextInput
                                        id="date_of_birth"
                                        type="date"
                                        name="date_of_birth"
                                        value={data.date_of_birth}
                                        max={new Date().toISOString().split('T')[0]}
                                        className="block w-full"
                                        onChange={(e) => setData('date_of_birth', e.target.value)}
                                        required
                                    />
                                    <InputError message={errors.date_of_birth} />
                                </div>

                                <div className="md:col-span-2">
                                    <InputLabel htmlFor="qualification" value="Educational Qualification" />
                                    <select
                                        id="qualification"
                                        name="qualification"
                                        value={data.qualification}
                                        className="block w-full bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-800 text-slate-900 dark:text-slate-200 rounded-xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/50 transition-all px-4 py-2.5"
                                        onChange={(e) => setData('qualification', e.target.value)}
                                    >
                                        <option value="">Select Qualification...</option>
                                        <option value="SSCE">SSCE (Senior School Certificate Examination)</option>
                                        <option value="ND">ND (National Diploma)</option>
                                        <option value="HND">HND (Higher National Diploma)</option>
                                        <option value="NCE">NCE (National Certificate in Education)</option>
                                        <option value="B.Sc">B.Sc (Bachelor of Science)</option>
                                        <option value="B.Tech">B.Tech (Bachelor of Technology)</option>
                                        <option value="B.A">B.A (Bachelor of Arts)</option>
                                        <option value="B.Eng">B.Eng (Bachelor of Engineering)</option>
                                        <option value="M.Sc">M.Sc (Master of Science)</option>
                                        <option value="MBA">MBA (Master of Business Administration)</option>
                                        <option value="M.Ed">M.Ed (Master of Education)</option>
                                        <option value="M.A">M.A (Master of Arts)</option>
                                        <option value="PhD">PhD (Doctor of Philosophy)</option>
                                        <option value="Others">Others</option>
                                    </select>
                                    <InputError message={errors.qualification} />
                                </div>

                                <div>
                                    <InputLabel htmlFor="employment_type" value="Employment Type" required />
                                    <select
                                        id="employment_type"
                                        value={data.employment_type}
                                        className="block w-full bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-800 text-slate-900 dark:text-slate-200 rounded-xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/50 transition-all px-4 py-2.5"
                                        onChange={(e) => setData('employment_type', e.target.value)}
                                        required
                                    >
                                        <option value="full time">Full Time</option>
                                        <option value="contract">Contract</option>
                                        <option value="part time">Part Time</option>
                                    </select>
                                    <InputError message={errors.employment_type} />
                                </div>

                                <div>
                                    <InputLabel htmlFor="employment_date" value="Date of Employment" required />
                                    <TextInput
                                        id="employment_date"
                                        type="date"
                                        value={data.employment_date}
                                        className="block w-full"
                                        onChange={(e) => setData('employment_date', e.target.value)}
                                        required
                                    />
                                    <InputError message={errors.employment_date} />
                                </div>

                                <div className="md:col-span-2">
                                    <InputLabel htmlFor="address" value="Residential Address" required />
                                    <textarea
                                        id="address"
                                        value={data.address}
                                        className="block w-full bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-800 text-slate-900 dark:text-slate-200 rounded-xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/50 transition-all px-4 py-2.5 min-h-[80px]"
                                        onChange={(e) => setData('address', e.target.value)}
                                        required
                                    ></textarea>
                                    <InputError message={errors.address} />
                                </div>
                            </div>
                        </Card>

                        <Card title="Emergency Contact" description="Next of kin information (Optional).">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <InputLabel htmlFor="next_of_kin" value="Next of Kin Name" />
                                    <TextInput
                                        id="next_of_kin"
                                        name="next_of_kin"
                                        value={data.next_of_kin}
                                        className="block w-full"
                                        onChange={(e) => setData('next_of_kin', e.target.value)}
                                        placeholder="Jane Doe"
                                    />
                                    <InputError message={errors.next_of_kin} />
                                </div>

                                <div>
                                    <InputLabel htmlFor="next_of_kin_phone" value="Next of Kin Phone" />
                                    <TextInput
                                        id="next_of_kin_phone"
                                        name="next_of_kin_phone"
                                        value={data.next_of_kin_phone}
                                        className="block w-full"
                                        onChange={(e) => setData('next_of_kin_phone', e.target.value)}
                                        placeholder="+234 000 000 0000"
                                    />
                                    <InputError message={errors.next_of_kin_phone} />
                                </div>
                            </div>
                        </Card>
                    </div>
                </div>

                <div className="flex items-center justify-end gap-3 py-6 border-t border-slate-800/50">
                    <Link href={route('users.index')}>
                        <SecondaryButton>Discard Registration</SecondaryButton>
                    </Link>
                    <PrimaryButton className="gap-2 px-8" disabled={processing}>
                        <UserPlus size={18} />
                        Complete Registration
                    </PrimaryButton>
                </div>
            </form>
        </AuthenticatedLayout>
    );
}
