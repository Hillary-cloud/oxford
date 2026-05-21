export default function TextInput({
    type = 'text',
    className = '',
    isFocused = false,
    ...props
}) {
    const inputStyle = `
        bg-white
        dark:bg-slate-900 
        border-slate-300
        dark:border-slate-800 
        text-slate-900
        dark:text-slate-200 
        placeholder:text-slate-400
        dark:placeholder:text-slate-600 
        rounded-xl 
        shadow-sm 
        focus:border-indigo-500 
        focus:ring-2 
        focus:ring-indigo-500/50 
        transition-all 
        duration-200
    `;

    return (
        <input
            {...props}
            type={type}
            className={`${inputStyle} ${className}`}
        />
    );
}
