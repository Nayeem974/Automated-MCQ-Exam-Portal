import { HTMLAttributes, ReactNode, forwardRef } from 'react';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  padded?: boolean;
  hoverable?: boolean;
}

const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ children, padded = true, hoverable = false, className, ...rest }, ref) => {
    return (
      <div
        ref={ref}
        className={[
          'rounded-2xl border border-primary-100/60 bg-white shadow-soft',
          padded ? 'p-5' : '',
          hoverable ? 'transition-all duration-200 hover:-translate-y-0.5 hover:shadow-card-hover' : '',
          className ?? '',
        ].join(' ')}
        {...rest}
      >
        {children}
      </div>
    );
  },
);
Card.displayName = 'Card';

export function CardHeader({
  title,
  subtitle,
  action,
}: {
  title: ReactNode;
  subtitle?: ReactNode;
  action?: ReactNode;
}) {
  return (
    <div className="mb-4 flex items-start justify-between gap-3">
      <div>
        <h2 className="font-semibold text-ink-900">{title}</h2>
        {subtitle && <p className="mt-0.5 text-sm text-ink-400">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}

export default Card;
