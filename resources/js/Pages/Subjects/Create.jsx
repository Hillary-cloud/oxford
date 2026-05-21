import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, Link } from '@inertiajs/react';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import TextInput from '@/Components/TextInput';
import Card from '@/Components/Card';
import { BookOpen, Plus, ArrowLeft } from 'lucide-react';

export default function Create({ auth }) {
    const { data, setData, post, processing, errors } = useForm({
        name: '',
        code: '',
        type: 'core',
        description: '',
    });

    const submit = (e) => {
        e.preventDefault();
        post(route('subjects.store'));
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center gap-4">
                    <Link href={route('subjects.index')} className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-white dark:hover:bg-slate-800 rounded-xl transition-all">
                        <ArrowLeft size={20} />
                    </Link>
                    <div className="flex flex-col gap-1">
                        <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Create Subject</h2>
                        <p className="text-slate-600 dark:text-slate-400 text-sm">Define a new course for the school curriculum.</p>
                    </div>
                </div>
            }
        >
            <Head title="Create Subject" />

            <div className="max-w-2xl mx-auto">
                <Card title="Subject Details" description="Define the name and unique code for this subject.">
                    <form onSubmit={submit} className="space-y-6">
                        <div>
                            <InputLabel htmlFor="name" value="Subject Name" />
                            <TextInput
                                id="name"
                                name="name"
                                value={data.name}
                                className="block w-full"
                                isFocused={true}
                                onChange={(e) => setData('name', e.target.value)}
                                required
                                placeholder="e.g. Mathematics"
                            />
                            <InputError message={errors.name} />
                        </div>

                        <div>
                            <InputLabel htmlFor="code" value="Subject Code (Optional)" />
                            <TextInput
                                id="code"
                                name="code"
                                value={data.code}
                                className="block w-full text-slate-200"
                                onChange={(e) => setData('code', e.target.value)}
                                placeholder="e.g. MAT 101"
                            />
                            <InputError message={errors.code} />
                        </div>

                        <div>
                            <InputLabel value="Subject Type" className="mb-3" />
                            <div className="flex gap-4">
                                <label className={`flex-1 flex items-center justify-center gap-3 p-4 rounded-xl border transition-all cursor-pointer ${data.type === 'core'
                                    ? 'bg-indigo-500/10 border-indigo-500/50 text-indigo-400'
                                    : 'bg-slate-50 dark:bg-slate-900 border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-400 hover:border-slate-400 dark:hover:border-slate-600'
                                    }`}>
                                    <input
                                        type="radio"
                                        className="hidden"
                                        name="type"
                                        value="core"
                                        checked={data.type === 'core'}
                                        onChange={(e) => setData('type', e.target.value)}
                                    />
                                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${data.type === 'core' ? 'border-indigo-500' : 'border-slate-600'
                                        }`}>
                                        {data.type === 'core' && <div className="w-2.5 h-2.5 rounded-full bg-indigo-500" />}
                                    </div>
                                    <span className="font-semibold uppercase text-xs tracking-wider">Core Subject</span>
                                </label>
                                <label className={`flex-1 flex items-center justify-center gap-3 p-4 rounded-xl border transition-all cursor-pointer ${data.type === 'elective'
                                    ? 'bg-purple-500/10 border-purple-500/50 text-purple-400'
                                    : 'bg-slate-50 dark:bg-slate-900 border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-400 hover:border-slate-400 dark:hover:border-slate-600'
                                    }`}>
                                    <input
                                        type="radio"
                                        className="hidden"
                                        name="type"
                                        value="elective"
                                        checked={data.type === 'elective'}
                                        onChange={(e) => setData('type', e.target.value)}
                                    />
                                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${data.type === 'elective' ? 'border-purple-500' : 'border-slate-600'
                                        }`}>
                                        {data.type === 'elective' && <div className="w-2.5 h-2.5 rounded-full bg-purple-500" />}
                                    </div>
                                    <span className="font-semibold uppercase text-xs tracking-wider">Elective Subject</span>
                                </label>
                            </div>
                            <InputError message={errors.type} className="mt-2" />
                        </div>

                        <div>
                            <InputLabel htmlFor="description" value="Description (Optional)" />
                            <textarea
                                id="description"
                                name="description"
                                value={data.description}
                                className="mt-1 block w-full bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-200 focus:border-indigo-500 focus:ring-indigo-500 rounded-xl shadow-sm transition-all"
                                rows="3"
                                onChange={(e) => setData('description', e.target.value)}
                                placeholder="Describe the course objectives..."
                            ></textarea>
                            <InputError message={errors.description} />
                        </div>

                        <div className="flex items-center justify-end gap-3 pt-6 border-t border-slate-800/50">
                            <Link href={route('subjects.index')}>
                                <SecondaryButton>Cancel</SecondaryButton>
                            </Link>
                            <PrimaryButton className="gap-2" disabled={processing}>
                                <Plus size={18} />
                                Create Subject
                            </PrimaryButton>
                        </div>
                    </form>
                </Card>
            </div>
        </AuthenticatedLayout>
    );
}
