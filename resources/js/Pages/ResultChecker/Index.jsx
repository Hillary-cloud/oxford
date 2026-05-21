import GuestLayout from '@/Layouts/GuestLayout';
import { Head, useForm } from '@inertiajs/react';
import { Search, Loader2 } from 'lucide-react';

export default function Index({ sessions, terms, school_identity }) {
    const currentSession = sessions.find(s => s.is_current) || sessions[0];
    const initialTerm = terms.find(t => t.academic_session_id === currentSession?.id);

    const { data, setData, post, processing, errors } = useForm({
        registration_number: '',
        academic_session_id: currentSession?.id || '',
        term_id: initialTerm?.id || '',
        pin_code: '',
    });

    const submit = (e) => {
        e.preventDefault();
        post(route('result-checker.check'));
    };

    return (
        <GuestLayout>
            <Head title="Check Results" />

            <div className="mb-6 text-center">
                <h2 className="text-xl font-bold text-white mb-2">Check Result</h2>
                <p className="text-slate-400 text-sm">Enter your credentials to access your report card.</p>
            </div>

            <form onSubmit={submit} className="space-y-4">
                {/* Reg No */}
                <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1">Registration Number</label>
                    <input
                        type="text"
                        value={data.registration_number}
                        onChange={(e) => setData('registration_number', e.target.value)}
                        className="w-full bg-slate-800 border-slate-700 rounded-lg text-white placeholder-slate-500 focus:ring-indigo-500 focus:border-indigo-500"
                        placeholder="e.g. HUSS/2023/001"
                    />
                    {errors.registration_number && <div className="mt-1 text-xs text-red-500">{errors.registration_number}</div>}
                </div>

                {/* Session & Term */}
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-1">Session</label>
                        <select
                            value={data.academic_session_id}
                            onChange={(e) => {
                                setData(d => ({ ...d, academic_session_id: e.target.value, term_id: '' }));
                            }}
                            className="w-full bg-slate-800 border-slate-700 rounded-lg text-white focus:ring-indigo-500 focus:border-indigo-500"
                        >
                            <option value="">Select Session</option>
                            {sessions.map(s => (
                                <option key={s.id} value={s.id}>{s.name}</option>
                            ))}
                        </select>
                        {errors.academic_session_id && <div className="mt-1 text-xs text-red-500">{errors.academic_session_id}</div>}
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-1">Term</label>
                        <select
                            value={data.term_id}
                            onChange={(e) => setData('term_id', e.target.value)}
                            disabled={!data.academic_session_id}
                            className={`w-full bg-slate-800 border-slate-700 rounded-lg text-white focus:ring-indigo-500 focus:border-indigo-500 ${!data.academic_session_id ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                            <option value="">Select Term</option>
                            {terms
                                .filter(t => t.academic_session_id === data.academic_session_id)
                                .map(t => (
                                    <option key={t.id} value={t.id}>{t.name}</option>
                                ))}
                            {sessions.find(s => s.id === data.academic_session_id)?.terms_count > 2 && (
                                <option value="annual">Annual Result (End of Session)</option>
                            )}
                        </select>
                        {errors.term_id && <div className="mt-1 text-xs text-red-500">{errors.term_id}</div>}
                    </div>
                </div>

                {/* PIN */}
                <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1">Result PIN</label>
                    <input
                        type="text" // Or password if we want to hide it, but usually PINs are visible on input for clarity
                        value={data.pin_code}
                        onChange={(e) => setData('pin_code', e.target.value)}
                        className="w-full bg-slate-800 border-slate-700 rounded-lg text-white placeholder-slate-500 focus:ring-indigo-500 focus:border-indigo-500 font-mono tracking-widest text-center text-lg"
                        placeholder="12-Digit PIN"
                        maxLength={20}
                    />
                    {errors.pin_code && <div className="mt-1 text-xs text-red-500">{errors.pin_code}</div>}
                </div>

                <button
                    type="submit"
                    disabled={processing}
                    className="w-full mt-4 flex justify-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 transition-all uppercase tracking-wider"
                >
                    {processing ? (
                        <Loader2 className="animate-spin w-5 h-5" />
                    ) : (
                        <div className="flex items-center gap-2">
                            <Search size={18} />
                            <span>Check Result</span>
                        </div>
                    )}
                </button>
            </form>

            <div className="mt-6 border-t border-slate-800 pt-4 text-center">
                <p className="text-xs text-slate-500">
                    Need a PIN? Contact the school administrator.
                </p>
            </div>
        </GuestLayout>
    );
}
