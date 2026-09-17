export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
export type ButtonSize = 'sm' | 'md' | 'lg';

const base =
  'inline-flex items-center justify-center gap-2 rounded-xl font-semibold transition-all duration-200 ' +
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-400 focus-visible:ring-offset-2 ' +
  'disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98]';

const variants: Record<ButtonVariant, string> = {
  primary:
    'bg-grad-primary text-white shadow-glow hover:shadow-glow-lg hover:brightness-105',
  secondary:
    'bg-primary-100 text-primary-700 hover:bg-primary-200',
  outline:
    'border border-ink-300/40 bg-white text-ink-700 hover:border-primary-300 hover:bg-primary-50 hover:text-primary-700',
  ghost: 'text-ink-500 hover:bg-primary-50 hover:text-primary-700',
  danger: 'bg-danger-50 text-danger-600 hover:bg-danger-100',
};

const sizes: Record<ButtonSize, string> = {
  sm: 'h-8 px-3 text-xs',
  md: 'h-10 px-4 text-sm',
  lg: 'h-12 px-6 text-base',
};

export function buttonClasses(variant: ButtonVariant = 'primary', size: ButtonSize = 'md', className = ''): string {
  return [base, variants[variant], sizes[size], className].filter(Boolean).join(' ');
}
