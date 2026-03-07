import { cn } from '../../lib/utils';

export const Input = ({ className, ...props }) => {
  return (
    <input
      className={cn(
        'h-11 w-full rounded-xl border border-(--outline) bg-(--surface) px-3 text-(--text) placeholder:text-(--text-muted) focus:outline-none focus:ring-2 focus:ring-(--accent-ring)',
        className,
      )}
      {...props}
    />
  );
};
