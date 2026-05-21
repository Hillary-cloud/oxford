export default function SecondaryButton({
    type = 'button',
    className = '',
    disabled,
    children,
    ...props
}) {
    return (
        <button
            {...props}
            type={type}
            className={
                `inline-flex items-center px-5 py-2.5 bg-slate-900 border border-slate-800 rounded-xl font-semibold text-sm text-slate-300 tracking-widest hover:bg-slate-800 hover:text-white active:bg-slate-700 outline-none focus:ring-2 focus:ring-slate-700 focus:ring-offset-2 focus:ring-offset-[#020617] transition-all duration-200 transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed ${className
                }`
            }
            disabled={disabled}
        >
            {children}
        </button>
    );
}
