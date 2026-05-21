import { Head, useForm } from '@inertiajs/react';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import InputError from '@/Components/InputError';
import PrimaryButton from '@/Components/PrimaryButton';
import axios from 'axios';

export default function Login() {
    const { data, setData, post, processing, errors, reset } = useForm({
        admission_number: '',
        surname: '',
    });

    const submit = (e) => {
        e.preventDefault();
        post(route('cbt.login.submit'), {
            onFinish: () => reset('surname'),
        });
    };

    return (
        <div className="min-h-screen flex flex-col sm:justify-center items-center pt-6 sm:pt-0 bg-gray-100 dark:bg-gray-900">
            <Head title="CBT Login" />

            <div className="w-full sm:max-w-md mt-6 px-6 py-10 bg-white dark:bg-gray-800 shadow-md overflow-hidden sm:rounded-lg">
                <div className="text-center mb-8">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Student CBT Portal</h2>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">Enter your details to start your assessment</p>
                </div>

                <form onSubmit={submit}>
                    <div>
                        <InputLabel htmlFor="admission_number" value="Admission Number" />
                        <TextInput
                            id="admission_number"
                            type="text"
                            name="admission_number"
                            value={data.admission_number}
                            className="mt-1 block w-full"
                            isFocused={true}
                            onChange={(e) => setData('admission_number', e.target.value)}
                        />
                        <InputError message={errors.admission_number} className="mt-2" />
                    </div>

                    <div className="mt-4">
                        <InputLabel htmlFor="surname" value="Surname" />
                        <TextInput
                            id="surname"
                            type="text" // Treat as password conceptually, but it's just text
                            name="surname"
                            value={data.surname}
                            className="mt-1 block w-full"
                            onChange={(e) => setData('surname', e.target.value)}
                        />
                        <InputError message={errors.surname} className="mt-2" />
                        <p className="text-xs text-gray-500 mt-1">Enter your surname as your password.</p>
                    </div>

                    <div className="flex items-center justify-end mt-8">
                        <PrimaryButton className="w-full justify-center py-3" disabled={processing}>
                            {processing ? 'Verifying...' : 'Start Assessment'}
                        </PrimaryButton>
                    </div>
                </form>
            </div>
        </div>
    );
}
