export default function Card({ children, title, description, actions, className = '' }) {
    return (
        <div className={`bg-white dark:bg-[#0f172a] rounded-2xl overflow-hidden shadow-xl shadow-slate-200/60 dark:shadow-black/40 ring-1 ring-slate-200 dark:ring-slate-800 ${className}`}>
            {(title || actions) && (
                <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800/50 flex items-center justify-between gap-4">
                    <div>
                        {title && <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200">{title}</h3>}
                        {description && <p className="text-sm text-slate-500 mt-0.5">{description}</p>}
                    </div>
                    {actions && <div className="flex items-center gap-2">{actions}</div>}
                </div>
            )}
            <div className="p-6">
                {children}
            </div>
        </div>
    );
}
