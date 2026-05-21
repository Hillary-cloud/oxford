import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm, Link } from '@inertiajs/react';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import TextInput from '@/Components/TextInput';
import Card from '@/Components/Card';
import { Shield, Save, ArrowLeft, CheckSquare, Square } from 'lucide-react';

export default function Edit({ auth, role, permissions }) {
    const { data, setData, patch, processing, errors } = useForm({
        name: role.name || '',
        permissions: role.permissions.map((p) => p.name) || [],
    });

    const togglePermission = (name) => {
        const newPermissions = data.permissions.includes(name)
            ? data.permissions.filter((p) => p !== name)
            : [...data.permissions, name];
        setData('permissions', newPermissions);
    };

    const submit = (e) => {
        e.preventDefault();
        patch(route('roles.update', role.id));
    };

    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center gap-4">
                    <Link href={route('roles.index')} className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-all">
                        <ArrowLeft size={20} />
                    </Link>
                    <div className="flex flex-col gap-1">
                        <h2 className="text-2xl font-bold tracking-tight text-slate-800 dark:text-white">Edit Role: {role.name}</h2>
                        <p className="text-slate-600 dark:text-slate-400 text-sm">Update role identity and adjust system permissions.</p>
                    </div>
                </div>
            }
        >
            <Head title="Edit Role" />

            <div className="max-w-4xl">
                <form onSubmit={submit} className="space-y-8">
                    <Card title="Role Basics" description="Update the display name of this role.">
                        <div className="max-w-md">
                            <InputLabel htmlFor="name" value="Role Name" required />
                            <TextInput
                                id="name"
                                value={data.name}
                                className="block w-full"
                                onChange={(e) => setData('name', e.target.value)}
                                required
                            />
                            <InputError message={errors.name} />
                        </div>
                    </Card>

                    <Card title="Management Permissions" description="Control what users in this role can see and do.">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-white">
                            {permissions.map((permission) => (
                                <div
                                    key={permission.id}
                                    onClick={() => togglePermission(permission.name)}
                                    className={`flex items-center gap-3 p-4 rounded-xl border cursor-pointer transition-all ${data.permissions.includes(permission.name)
                                        ? 'bg-indigo-500/10 border-indigo-500/50 text-indigo-400 shadow-lg shadow-indigo-500/10'
                                        : 'bg-slate-900/50 border-slate-800 text-slate-400 hover:border-slate-700'
                                        }`}
                                >
                                    {data.permissions.includes(permission.name) ? (
                                        <CheckSquare size={20} className="shrink-0" />
                                    ) : (
                                        <Square size={20} className="shrink-0" />
                                    )}
                                    <span className="text-sm font-semibold capitalize">
                                        {permission.name.replace(/-/g, ' ')}
                                    </span>
                                </div>
                            ))}
                        </div>
                        <InputError message={errors.permissions} />
                    </Card>

                    <div className="flex items-center justify-end gap-3 pt-6 border-t border-slate-800/50">
                        <Link href={route('roles.index')}>
                            <SecondaryButton>Cancel</SecondaryButton>
                        </Link>
                        <PrimaryButton className="gap-2" disabled={processing}>
                            <Save size={18} />
                            Save Changes
                        </PrimaryButton>
                    </div>
                </form>
            </div>
        </AuthenticatedLayout>
    );
}
