import { cn } from '@/lib/utils';
import { ButtonHTMLAttributes, ReactNode } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  children: ReactNode;
}

export function Button({
  variant = 'primary',
  size = 'md',
  className,
  children,
  ...props
}: ButtonProps) {
  const baseStyles =
    'inline-flex items-center justify-center font-medium transition-all rounded-full disabled:opacity-50 disabled:cursor-not-allowed';

  const variants = {
    primary:
      'text-white bg-gradient-to-r from-[var(--brand-purple)] via-[var(--brand-blue)] to-[var(--brand-green)] hover:shadow-lg hover:scale-105',
    secondary: 'text-white bg-[var(--gray-800)] hover:bg-[var(--gray-700)]',
    outline:
      'text-[var(--text-primary)] border-2 border-[var(--border-color)] hover:border-[var(--brand-blue)] hover:text-[var(--brand-blue)]',
    ghost:
      'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--gray-100)]',
  };

  const sizes = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-3 text-base',
    lg: 'px-8 py-4 text-lg',
  };

  return (
    <button className={cn(baseStyles, variants[variant], sizes[size], className)} {...props}>
      {children}
    </button>
  );
}
