import { ReactNode } from 'react';
import { Link, LinkProps } from 'react-router-dom';
import { ButtonSize, ButtonVariant, buttonClasses } from './buttonStyles';

interface LinkButtonProps extends LinkProps {
  variant?: ButtonVariant;
  size?: ButtonSize;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  fullWidth?: boolean;
}

export default function LinkButton({
  variant = 'primary',
  size = 'md',
  leftIcon,
  rightIcon,
  fullWidth,
  className,
  children,
  ...rest
}: LinkButtonProps) {
  return (
    <Link className={buttonClasses(variant, size, `${fullWidth ? 'w-full' : ''} ${className ?? ''}`)} {...rest}>
      {leftIcon}
      {children}
      {rightIcon}
    </Link>
  );
}
