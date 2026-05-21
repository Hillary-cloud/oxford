import Checkbox from '@/Components/Checkbox';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import GuestLayout from '@/Layouts/GuestLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { Mail, Lock, LogIn, User, Eye, EyeOff } from 'lucide-react';
import { useState } from 'react';

export default function Login({ status, canResetPassword }) {
    const [showPassword, setShowPassword] = useState(false);
    const { data, setData, post, processing, errors, reset } = useForm({
        login: '',
        password: '',
        remember: false,
    });

    const submit = (e) => {
        e.preventDefault();

        post(route('login'), {
            onFinish: () => reset('password'),
        });
    };

    return (
        <GuestLayout>
            <Head title="Log in" />

            <div className="mb-8 text-center">
                <h1 className="text-3xl font-extrabold text-white tracking-tight mb-2">Welcome Back</h1>
                <p className="text-slate-400">Log in with your academic credentials</p>
            </div>

            {status && (
                <div className="mb-6 p-4 rounded-xl bg-green-500/10 border border-green-500/20 text-sm font-medium text-green-400">
                    {status}
                </div>
            )}

            <form onSubmit={submit} className="space-y-6">
                <div>
                    <InputLabel htmlFor="login" value="Email or Staff ID" className="text-slate-300" />
                    <div className="relative mt-1">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                            <User size={18} />
                        </div>
                        <TextInput
                            id="login"
                            type="text"
                            name="login"
                            value={data.login}
                            className="block w-full pl-10"
                            autoComplete="username"
                            isFocused={true}
                            onChange={(e) => setData('login', e.target.value)}
                            placeholder="e.g. j.doe@school.com or STAFF001"
                        />
                    </div>
                    <InputError message={errors.login} className="mt-2" />
                </div>

                <div>
                    {/* <div className="flex items-center justify-between">
                        <InputLabel htmlFor="password" value="Password" className="text-slate-300" />
                        {canResetPassword && (
                            <Link
                                href={route('password.request')}
                                className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors"
                            >
                                Forgot password?
                            </Link>
                        )}
                    </div> */}
                    <div className="relative mt-1">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                            <Lock size={18} />
                        </div>
                        <TextInput
                            id="password"
                            type={showPassword ? "text" : "password"}
                            name="password"
                            value={data.password}
                            className="block w-full pl-10 pr-10"
                            autoComplete="current-password"
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
                    <InputError message={errors.password} className="mt-2" />
                </div>

                <div className="flex items-center justify-between">
                    <label className="flex items-center group cursor-pointer">
                        <Checkbox
                            name="remember"
                            checked={data.remember}
                            onChange={(e) => setData('remember', e.target.checked)}
                        />
                        <span className="ms-2 text-sm text-slate-400 group-hover:text-slate-300 transition-colors">
                            Stay logged in
                        </span>
                    </label>
                </div>

                <PrimaryButton className="w-full py-3 text-base flex justify-center gap-2" disabled={processing}>
                    <LogIn size={20} />
                    Sign In
                </PrimaryButton>

                <div className="text-center pt-4">
                    <p className="text-sm text-slate-500 font-medium">
                        Secured by Advanced Educational Systems
                    </p>
                </div>
            </form>
        </GuestLayout>
    );
}
