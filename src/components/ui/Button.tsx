'use client';

import { type ButtonHTMLAttributes } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
}

export default function Button({
  variant = 'primary',
  size = 'md',
  className = '',
  children,
  ...props
}: ButtonProps) {
  const base =
    'inline-flex items-center justify-center font-medium rounded-md transition-all duration-200 focus:outline-none focus:ring-2 disabled:opacity-50 disabled:pointer-events-none';

  const variants: Record<string, React.CSSProperties> = {
    primary: {
      backgroundColor: 'var(--accent)',
      color: '#ffffff',
    },
    secondary: {
      backgroundColor: 'var(--bg-secondary)',
      color: 'var(--text-primary)',
      border: '1px solid var(--border)',
    },
    ghost: {
      color: 'var(--text-secondary)',
      backgroundColor: 'transparent',
    },
    danger: {
      backgroundColor: '#ef4444',
      color: '#ffffff',
    },
  };

  const sizes: Record<string, string> = {
    sm: 'px-3 py-1.5 text-sm gap-1.5',
    md: 'px-4 py-2 text-sm gap-2',
    lg: 'px-6 py-3 text-base gap-2',
  };

  return (
    <button
      className={`${base} ${sizes[size]} ${className}`}
      style={{
        ...variants[variant],
        '--tw-ring-color': variant === 'danger' ? '#ef4444' : 'var(--accent)',
      } as React.CSSProperties}
      onMouseEnter={(e) => {
        if (variant === 'primary') {
          e.currentTarget.style.backgroundColor = 'var(--accent-hover)';
        } else if (variant === 'secondary') {
          e.currentTarget.style.backgroundColor = 'var(--bg-tertiary)';
        } else if (variant === 'ghost') {
          e.currentTarget.style.backgroundColor = 'var(--bg-secondary)';
        } else if (variant === 'danger') {
          e.currentTarget.style.backgroundColor = '#dc2626';
        }
      }}
      onMouseLeave={(e) => {
        const reset = variants[variant];
        if (reset.backgroundColor) {
          e.currentTarget.style.backgroundColor = reset.backgroundColor;
        } else {
          e.currentTarget.style.backgroundColor = 'transparent';
        }
      }}
      {...props}
    >
      {children}
    </button>
  );
}
