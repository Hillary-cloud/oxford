import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import { Transition } from '@headlessui/react';
import { useForm } from '@inertiajs/react';
import { useRef, useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

export default function UpdatePasswordForm({ className = '' }) {
    const passwordInput = useRef();
    const currentPasswordInput = useRef();
    const [showValues, setShowValues] = useState({ current: false, new: false, confirm: false });

    const toggleShow = (field) => {
        setShowValues(prev => ({ ...prev, [field]: !prev[field] }));
    };

    const {
        data,
        setData,
        errors,
        put,
        reset,
        processing,
        recentlySuccessful,
    } = useForm({
        current_password: '',
        password: '',
        password_confirmation: '',
    });

    const updatePassword = (e) => {
        e.preventDefault();

        put(route('password.update'), {
            preserveScroll: true,
            onSuccess: () => reset(),
            onError: (errors) => {
                if (errors.password) {
                    reset('password', 'password_confirmation');
                    passwordInput.current.focus();
                }

                if (errors.current_password) {
                    reset('current_password');
                    currentPasswordInput.current.focus();
                }
            },
        });
    };

    return (
        <section className={className}>
            <header>
                <h2 className="text-lg font-medium text-slate-900 dark:text-white">
                    Update Password
                </h2>

                <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                    Ensure your account is using a long, random password to stay
                    secure.
                </p>
            </header>

            <form onSubmit={updatePassword} className="mt-6 space-y-6">
                <div>
                    <InputLabel
                        htmlFor="current_password"
                        value="Current Password"
                    />

                    <div className="relative mt-1">
                        <TextInput
                            id="current_password"
                            ref={currentPasswordInput}
                            value={data.current_password}
                            onChange={(e) =>
                                setData('current_password', e.target.value)
                            }
                            type={showValues.current ? "text" : "password"}
                            className="block w-full pr-10"
                            autoComplete="current-password"
                        />
                        <button
                            type="button"
                            onClick={() => toggleShow('current')}
                            className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-500 hover:text-indigo-500"
                        >
                            {showValues.current ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                    </div>

                    <InputError
                        message={errors.current_password}
                        className="mt-2"
                    />
                </div>

                <div>
                    <InputLabel htmlFor="password" value="New Password" />

                    <div className="relative mt-1">
                        <TextInput
                            id="password"
                            ref={passwordInput}
                            value={data.password}
                            onChange={(e) => setData('password', e.target.value)}
                            type={showValues.new ? "text" : "password"}
                            className="block w-full pr-10"
                            autoComplete="new-password"
                        />
                        <button
                            type="button"
                            onClick={() => toggleShow('new')}
                            className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-500 hover:text-indigo-500"
                        >
                            {showValues.new ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                    </div>

                    <InputError message={errors.password} className="mt-2" />
                </div>

                <div>
                    <InputLabel
                        htmlFor="password_confirmation"
                        value="Confirm Password"
                    />

                    <div className="relative mt-1">
                        <TextInput
                            id="password_confirmation"
                            value={data.password_confirmation}
                            onChange={(e) =>
                                setData('password_confirmation', e.target.value)
                            }
                            type={showValues.confirm ? "text" : "password"}
                            className="block w-full pr-10"
                            autoComplete="new-password"
                        />
                        <button
                            type="button"
                            onClick={() => toggleShow('confirm')}
                            className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-500 hover:text-indigo-500"
                        >
                            {showValues.confirm ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                    </div>

                    <InputError
                        message={errors.password_confirmation}
                        className="mt-2"
                    />
                </div>

                <div className="flex items-center gap-4">
                    <PrimaryButton disabled={processing}>Save</PrimaryButton>

                    <Transition
                        show={recentlySuccessful}
                        enter="transition ease-in-out"
                        enterFrom="opacity-0"
                        leave="transition ease-in-out"
                        leaveTo="opacity-0"
                    >
                        <p className="text-sm text-slate-600 dark:text-slate-400">
                            Saved.
                        </p>
                    </Transition>
                </div>
            </form>
        </section>
    );
}
