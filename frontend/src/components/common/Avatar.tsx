import { getInitials } from '../../lib/format';

const sizeClasses = {
  sm: 'h-8 w-8 text-xs',
  md: 'h-10 w-10 text-sm',
  lg: 'h-14 w-14 text-lg',
  xl: 'h-20 w-20 text-2xl',
};

export default function Avatar({
  name,
  email,
  size = 'md',
  className,
}: {
  name?: string | null;
  email?: string | null;
  size?: keyof typeof sizeClasses;
  className?: string;
}) {
  return (
    <div
      className={`flex shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary-500 to-primary-700 font-bold text-white ${sizeClasses[size]} ${className ?? ''}`}
      aria-hidden
    >
      {getInitials(name, email)}
    </div>
  );
}
