import { cn } from '../../lib/utils';

export const Card = ({ className, ...props }) => {
  return (
    <section
      className={cn(
        'rounded-2xl border border-[var(--outline)] bg-[var(--surface)] p-4 shadow-[0_10px_25px_-18px_rgba(0,0,0,0.8)]',
        className,
      )}
      {...props}
    />
  );
};
