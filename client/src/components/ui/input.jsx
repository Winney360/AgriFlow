import { cn } from '../../lib/utils';

export const Input = ({ className, ...props }) => {
  return (
    <input
      className={cn(
        'h-11 w-full rounded-xl border border-[var(--outline)] bg-[var(--surface)] px-3 text-[var(--text)] placeholder:text-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-ring)]',
        className,
      )}
      {...props}
    />
  );
};
