import { Head, useForm } from '@inertiajs/react';
import PrimaryButton from '@/Components/PrimaryButton';
import { Lock, ArrowRight, ShieldCheck } from 'lucide-react';

export default function Login({ school_name }) {
    const { data, setData, post, processing, errors } = useForm({
        access_code: '',
    });

    const submit = (e) => {
        e.preventDefault();
        post(route('portal.authenticate'));
    };

    return (
        <div className="min-h-screen flex flex-col sm:justify-center items-center pt-6 sm:pt-0 bg-slate-950 text-white selection:bg-indigo-500 selection:text-white">
            <Head title="Portal Access" />

            <div className="w-full sm:max-w-md mt-6 px-6 py-8 bg-slate-900 shadow-xl overflow-hidden sm:rounded-2xl border border-slate-800">
                <div className="flex flex-col items-center mb-8 text-center space-y-2">
                    <div className="w-12 h-12 bg-indigo-500/10 rounded-xl flex items-center justify-center text-indigo-400 mb-2">
                        <ShieldCheck size={28} />
                    </div>
                    <h2 className="text-xl font-bold tracking-tight">{school_name || "School Portal"}</h2>
                    <p className="text-slate-400 text-sm">External Photo Upload Access</p>
                </div>

                <form onSubmit={submit} className="space-y-6">
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-widest block">Access Code</label>
                        <div className="relative">
                            <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                            <input
                                type="password"
                                value={data.access_code}
                                onChange={(e) => setData('access_code', e.target.value)}
                                className="w-full bg-slate-950 border-slate-800 text-slate-200 text-center text-2xl tracking-[0.5em] font-mono rounded-xl focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 py-3 pl-10 transition-all font-bold placeholder:tracking-normal placeholder:font-sans placeholder:text-sm placeholder:text-slate-600"
                                placeholder="Enter code"
                                autoFocus
                            />
                        </div>
                        {errors.access_code && <p className="text-xs text-rose-500 text-center">{errors.access_code}</p>}
                    </div>

                    <PrimaryButton className="w-full justify-center py-3 bg-indigo-600 hover:bg-indigo-700 text-base" disabled={processing}>
                        Enter Portal <ArrowRight size={18} className="ml-2" />
                    </PrimaryButton>

                    <p className="text-xs text-slate-600 text-center mt-4 pt-4 border-t border-slate-800">
                        This portal allows authorized personnel to upload student photos securely.
                    </p>
                </form>
            </div>
        </div>
    );
}
