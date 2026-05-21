import ApplicationLogo from '@/Components/ApplicationLogo';
import { Link, usePage } from '@inertiajs/react';
import { School } from 'lucide-react';

export default function GuestLayout({ children }) {
    const { settings } = usePage().props;
    const identity = settings?.school_identity || {};

    return (
        <div className="flex min-h-screen flex-col items-center bg-[#020617] pt-6 sm:justify-center sm:pt-0">
            <div>
                <Link href="/">
                    {identity.logo ? (
                        <img src={`/storage/${identity.logo}`} alt="Logo" className="w-20 h-20 object-contain" />
                    ) : (
                        <div className="w-20 h-20 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-2xl shadow-indigo-600/20">
                            <School className="text-white w-10 h-10" />
                        </div>
                    )}
                </Link>
            </div>

            <div className="mt-6 w-full overflow-hidden bg-slate-900/50 backdrop-blur-xl border border-slate-800 px-6 py-4 shadow-2xl rounded-2xl sm:max-w-md">
                {children}
            </div>
        </div>
    );
}
