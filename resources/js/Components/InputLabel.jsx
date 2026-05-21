export default function InputLabel({
    value,
    className = '',
    children,
    required = false,
    ...props
}) {
    return (
        <label
            {...props}
            className={
                `block text-sm font-medium text-slate-400 mb-2 ` + className
            }
        >
            {value ? value : children}
            {required && <span className="text-rose-400 ml-1">*</span>}
        </label>
    );
}
