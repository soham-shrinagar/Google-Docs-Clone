import { useId } from 'react';
import clsx from 'clsx';

const sizes = { sm: 28, md: 32, lg: 40 } as const;

interface LogoMarkProps {
  size?: keyof typeof sizes;
  className?: string;
}

/** CollabDocs mark — overlapping pages + live cursor dots */
export function LogoMark({ size = 'md', className }: LogoMarkProps) {
  const uid = useId().replace(/:/g, '');
  const gradId = `logo-grad-${uid}`;
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
      <defs>
        <linearGradient id={gradId} x1="4" y1="2" x2="28" y2="30" gradientUnits="userSpaceOnUse">
          <stop stopColor="#818cf8" />
          <stop offset="1" stopColor="#4f46e5" />
        </linearGradient>
      </defs>
      <rect width="32" height="32" rx="8" fill={`url(#${gradId})`} />
      {/* back page */}
      <rect x="6" y="5" width="15" height="19" rx="2.5" fill="white" fillOpacity="0.28" />
      {/* front page */}
      <rect x="10" y="8" width="15" height="19" rx="2.5" fill="white" />
      <path d="M13.5 13.5h9" stroke="#6366f1" strokeWidth="1.75" strokeLinecap="round" />
      <path d="M13.5 17h6.5" stroke="#c7d2fe" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M13.5 20.5h8" stroke="#c7d2fe" strokeWidth="1.5" strokeLinecap="round" />
      {/* collaboration cursors */}
      <circle cx="23.5" cy="10" r="2.75" fill="#6366f1" stroke="white" strokeWidth="1.25" />
      <circle cx="26.5" cy="24" r="2.25" fill="#a5b4fc" stroke="white" strokeWidth="1.25" />
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
    <div className={clsx('flex items-center gap-2.5', className)}>
      <LogoMark size={size} />
      {showText && (
        <span className={clsx('font-semibold tracking-tight text-ink', textClassName)}>
          CollabDocs
        </span>
      )}
    </div>
  );
}
