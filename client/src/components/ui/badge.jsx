import { cn } from '../../lib/utils';

export const Badge = ({ className, children }) => {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border border-[var(--outline)] bg-[var(--surface-soft)] px-2.5 py-1 text-xs font-semibold uppercase tracking-wide text-[var(--text)]',
        className,
      )}
    >
      {children}
    </span>
  );
};
