import { useId } from 'react';
import clsx from 'clsx';

const sizes = { sm: 24, md: 28, lg: 32 } as const;

interface LogoMarkProps {
  size?: keyof typeof sizes;
  className?: string;
}

export function LogoMark({ size = 'md', className }: LogoMarkProps) {
  const px = sizes[size];

  return (
    <svg
      width={px}
      height={px}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden
    >
      <rect width="32" height="32" rx="6" fill="var(--theme-accent)" />
      <rect x="7" y="6" width="14" height="18" rx="2" fill="white" fillOpacity="0.25" />
      <rect x="11" y="9" width="14" height="18" rx="2" fill="white" />
      <path d="M14 14h8" stroke="var(--theme-accent-deep)" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M14 17.5h5.5" stroke="#94a3b8" strokeWidth="1.25" strokeLinecap="round" />
      <path d="M14 21h7" stroke="#94a3b8" strokeWidth="1.25" strokeLinecap="round" />
    </svg>
  );
}

interface LogoProps {
  showText?: boolean;
  size?: keyof typeof sizes;
  className?: string;
  textClassName?: string;
}

export function Logo({ showText = true, size = 'md', className, textClassName }: LogoProps) {
  return (
    <div className={clsx('flex items-center gap-2', className)}>
      <LogoMark size={size} />
      {showText && (
        <span className={clsx('text-sm font-semibold tracking-tight text-ink', textClassName)}>
          CollabDocs
        </span>
      )}
    </div>
  );
}
