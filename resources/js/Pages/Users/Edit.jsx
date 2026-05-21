import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, Link } from '@inertiajs/react';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import TextInput from '@/Components/TextInput';
import Card from '@/Components/Card';
import { Save, ArrowLeft, Eye, EyeOff, Camera, ShieldCheck } from 'lucide-react';
import { useState, useEffect } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function Edit({ auth, user, roles, flash }) {
    const [showPassword, setShowPassword] = useState(false);
    const [previewImage, setPreviewImage] = useState(user.profile_image ? `/storage/${user.profile_image}` : null);

    const { data, setData, post, processing, errors } = useForm({
        _method: 'PUT',
        profile_image: null,
        name: user.name || '',
        staff_id: user.staff_id || '',
        phone: user.phone || '',
        email: user.email || '',
        password: '',
        address: user.address || '',
        qualification: user.qualification || '',
        date_of_birth: user.date_of_birth || '',
        employment_date: user.employment_date || '',
        employment_type: user.employment_type || 'full time',
        next_of_kin: user.next_of_kin || '',
        next_of_kin_phone: user.next_of_kin_phone || '',
        role: user.roles[0]?.name || '',
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
        post(route('users.update', user.id));
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center gap-4">
                    <Link href={route('users.index')} className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-white dark:hover:bg-slate-800 rounded-xl transition-all">
                        <ArrowLeft size={20} />
                    </Link>
                    <div className="flex flex-col gap-1">
                        <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Update Staff Profile</h2>
                        <p className="text-slate-600 dark:text-slate-400 text-sm">Modify information and manage administrative roles.</p>
                    </div>
                </div>
            }
        >
            <Head title="Edit Staff Profile" />


            <form onSubmit={submit} className="max-w-5xl space-y-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Column: Profile & Role */}
                    <div className="lg:col-span-1 space-y-8">
                        <Card title="Staff Identity" description="Update portrait and staff ID.">
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
                                        <Save size={16} />
                                    </label>
                                </div>
                                <div className="mt-6 w-full space-y-4">
                                    <div>
                                        <InputLabel htmlFor="staff_id" value="Staff ID" required />
                                        <TextInput
                                            id="staff_id"
                                            value={data.staff_id}
                                            className="block w-full bg-slate-900/50 text-slate-500 cursor-not-allowed opacity-75"
                                            readOnly
                                            disabled
                                        />
                                        <InputError message={errors.staff_id} />
                                    </div>
                                </div>
                            </div>
                        </Card>

                        <Card title="System Permissions" description="Assign administrative access.">
                            <div className="space-y-4">
                                <div>
                                    <div className="flex items-center gap-2 mb-2 text-indigo-400">
                                        <ShieldCheck size={18} />
                                        <InputLabel htmlFor="role" value="Access Role" className="mb-0 text-indigo-400" required />
                                    </div>
                                    <TextInput
                                        id="role"
                                        value={data.role}
                                        className="block w-full bg-slate-900/50 text-slate-500 cursor-not-allowed opacity-75"
                                        readOnly
                                        disabled
                                    />
                                    <InputError message={errors.role} />
                                </div>

                                <div className="pt-4 border-t border-slate-800/50">
                                    <InputLabel htmlFor="password" value="Update Password (Leave blank to keep)" />
                                    <div className="relative">
                                        <TextInput
                                            id="password"
                                            type={showPassword ? 'text' : 'password'}
                                            name="password"
                                            value={data.password}
                                            className="block w-full pr-10"
                                            onChange={(e) => setData('password', e.target.value)}
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

                    {/* Right Column: Information Sections */}
                    <div className="lg:col-span-2 space-y-8">
                        <Card title="Contact & Credentials" description="Email and phone settings.">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="md:col-span-2">
                                    <InputLabel htmlFor="name" value="Full Name" required />
                                    <TextInput
                                        id="name"
                                        value={data.name}
                                        className="block w-full"
                                        onChange={(e) => setData('name', e.target.value)}
                                        required
                                    />
                                    <InputError message={errors.name} />
                                </div>

                                <div>
                                    <InputLabel htmlFor="email" value="Email Address" required />
                                    <TextInput
                                        id="email"
                                        type="email"
                                        value={data.email}
                                        className="block w-full"
                                        onChange={(e) => setData('email', e.target.value)}
                                        required
                                    />
                                    <InputError message={errors.email} />
                                </div>

                                <div>
                                    <InputLabel htmlFor="phone" value="Phone Number" required />
                                    <TextInput
                                        id="phone"
                                        value={data.phone}
                                        className="block w-full"
                                        onChange={(e) => setData('phone', e.target.value)}
                                        required
                                    />
                                    <InputError message={errors.phone} />
                                </div>
                            </div>
                        </Card>

                        <Card title="Detailed Data" description="Personal background and employment history.">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <InputLabel htmlFor="date_of_birth" value="Date of Birth" required />
                                    <TextInput
                                        id="date_of_birth"
                                        type="date"
                                        value={data.date_of_birth}
                                        max={new Date().toISOString().split('T')[0]}
                                        className="block w-full"
                                        onChange={(e) => setData('date_of_birth', e.target.value)}
                                        required
                                    />
                                    <InputError message={errors.date_of_birth} />
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

                                <div>
                                    <InputLabel htmlFor="qualification" value="Educational Qualification" />
                                    <select
                                        id="qualification"
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
                        <SecondaryButton>Cancel Updates</SecondaryButton>
                    </Link>
                    <PrimaryButton className="gap-2 px-8" disabled={processing}>
                        <Save size={18} />
                        Save Changes
                    </PrimaryButton>
                </div>
            </form>
        </AuthenticatedLayout>
    );
}
