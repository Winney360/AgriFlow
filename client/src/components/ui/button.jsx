import { cva } from 'class-variance-authority';
import { cn } from '../../lib/utils';

const buttonVariants = cva(
  'inline-flex items-center justify-center rounded-xl font-semibold transition duration-200 disabled:pointer-events-none disabled:opacity-60',
  {
    variants: {
      variant: {
        primary: 'bg-[var(--button)] text-white hover:brightness-95',
        cta: 'bg-[var(--cta)] text-white hover:brightness-95',
        ghost: 'bg-transparent text-[var(--text)] hover:bg-black/5 dark:hover:bg-white/5',
        outline:
          'border border-[var(--outline)] bg-transparent text-[var(--text)] hover:bg-black/5 dark:hover:bg-white/5',
      },
      size: {
        sm: 'h-9 px-3 text-sm',
        md: 'h-11 px-4 text-base',
        lg: 'h-12 px-5 text-base',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
    },
  },
);

export const Button = ({ className, variant, size, ...props }) => {
  return <button className={cn(buttonVariants({ variant, size }), className)} {...props} />;
};
