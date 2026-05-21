export default function PrimaryButton({
    className = '',
    disabled,
    children,
    ...props
}) {
    return (
        <button
            {...props}
            disabled={disabled}
            className={
                `inline-flex items-center px-5 py-2.5 bg-button border border-white/10 rounded-xl font-semibold text-sm text-white tracking-widest hover:opacity-90 active:scale-95 focus:outline-none focus:ring-2 focus:ring-button focus:ring-offset-2 focus:ring-offset-[#020617] transition-all duration-200 ease-in-out transform shadow-lg disabled:opacity-50 disabled:cursor-not-allowed ${className
                }`
            }
        >
            {children}
        </button >
    );
}
