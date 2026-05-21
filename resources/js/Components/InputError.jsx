export default function InputError({ message, className = '', ...props }) {
    return message ? (
        <p
            {...props}
            className={'text-sm text-rose-500 mt-2 font-medium ' + className}
        >
            {message}
        </p>
    ) : null;
}
