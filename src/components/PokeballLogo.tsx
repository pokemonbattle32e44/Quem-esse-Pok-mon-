interface PokeballLogoProps {
  className?: string;
}

export function PokeballLogo({ className = 'w-8 h-8' }: PokeballLogoProps) {
  return (
    <svg
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <circle cx="32" cy="32" r="29" fill="#FFFFFF" stroke="#0F294A" strokeWidth="4" />
      <path
        d="M5 32C5 17.088 17.088 5 32 5C46.912 5 59 17.088 59 32H5Z"
        fill="#E3350D"
      />
      <rect x="3" y="29" width="58" height="6" fill="#0F294A" />
      <circle cx="32" cy="32" r="10.5" fill="#FFFFFF" stroke="#0F294A" strokeWidth="4" />
      <circle cx="32" cy="32" r="5" fill="#FFCB05" />
    </svg>
  );
}
