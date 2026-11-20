import { TYPE_PT_MAP } from '../utils/pokemonNames';

interface TypeIconSvgProps {
  type: string;
  className?: string;
}

export function TypeIconSvg({ type, className = 'w-4 h-4' }: TypeIconSvgProps) {
  switch (type) {
    case 'fire':
      return (
        <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
          <path d="M12.6 2.2c.3 2.5-1.1 4.4-2.8 5.9-1.4 1.3-2.5 2.7-2.5 4.8 0 1.4.7 2.7 1.8 3.5-.4-.9-.3-2 .4-2.8.6-.7 1.6-1 2.2-1.8.4-.5.6-1.2.6-1.9 1.6 1 2.9 2.7 2.9 4.8 0 1.1-.4 2.1-1.1 2.9 2.3-.8 4-3 4-5.7 0-3.8-2.8-6.7-5.5-9.7ZM12 22a7.5 7.5 0 0 1-7.5-7.5c0-3.3 2-5.6 4.1-7.5 1.1-1 2.2-2.2 2.4-3.9 0-.5.6-.7.9-.3 3.7 3.7 7.6 7.3 7.6 11.7A7.5 7.5 0 0 1 12 22Z" />
        </svg>
      );
    case 'water':
      return (
        <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
          <path d="M12 2.5C12 2.5 5.5 10 5.5 14.8a6.5 6.5 0 1 0 13 0C18.5 10 12 2.5 12 2.5Zm-2.5 13.7a2.8 2.8 0 0 1-.8-2.4c.1-.4.6-.5.8-.1.3.7.8 1.5 1.7 1.9.4.2.3.8-.2.9-.5.1-1.1 0-1.5-.3Z" />
        </svg>
      );
    case 'grass':
      return (
        <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
          <path d="M19.8 4.2C14.1 4 8.2 6.8 6 12.1c-.8 1.8-.9 3.7-.4 5.3l4.7-4.7 1.4 1.4-4.7 4.7c1.6.5 3.5.4 5.3-.4 5.3-2.2 8.1-8.1 7.9-13.8a.4.4 0 0 0-.4-.4Z" />
        </svg>
      );
    case 'electric':
      return (
        <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
          <path d="M13.5 2L5 13.2h6.2L9.8 22l9.2-11.8h-6.1L13.5 2Z" />
        </svg>
      );
    case 'ice':
      return (
        <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
          <path d="M12 2l2.3 4.2 4.7-.5-1.9 4.4L21 12l-3.9 1.9 1.9 4.4-4.7-.5L12 22l-2.3-4.2-4.7.5 1.9-4.4L3 12l3.9-1.9L5 5.7l4.7.5L12 2Z" />
        </svg>
      );
    case 'fighting':
      return (
        <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
          <path d="M7 5a2 2 0 0 1 2 2v3h1V5.5a2 2 0 1 1 4 0V10h1V6.5a2 2 0 1 1 4 0v6.2c0 3.7-2.6 6.8-6.3 7.3H11c-3.3 0-6-2.7-6-6V7a2 2 0 0 1 2-2Z" />
        </svg>
      );
    case 'poison':
      return (
        <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
          <path d="M12 3a7 7 0 0 0-7 7c0 2.5 1.3 4.7 3.2 5.9V19a2 2 0 0 0 2 2h3.6a2 2 0 0 0 2-2v-3.1A7 7 0 0 0 12 3Zm-2.3 8.2a1.4 1.4 0 1 1 0-2.8 1.4 1.4 0 0 1 0 2.8Zm4.6 0a1.4 1.4 0 1 1 0-2.8 1.4 1.4 0 0 1 0 2.8Z" />
        </svg>
      );
    case 'ground':
      return (
        <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
          <path d="M3 18h18l-3.5-8-4.5 3.5L9.5 6 3 18Z" />
        </svg>
      );
    case 'flying':
      return (
        <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
          <path d="M21 5c-4.8.4-9.1 2.7-11.8 6.4-.8 1.1-1.3 2.3-1.6 3.6L3 13.5l3.2 3.8c1.7 1.8 4.4 2.2 6.6 1 3.5-1.9 6.6-6.2 8.2-13.3Z" />
        </svg>
      );
    case 'psychic':
      return (
        <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
          <path d="M12 5C6.5 5 2.4 9.1 1.5 12c.9 2.9 5 7 10.5 7s9.6-4.1 10.5-7C21.6 9.1 17.5 5 12 5Zm0 10.5A3.5 3.5 0 1 1 12 8.5a3.5 3.5 0 0 1 0 7Z" />
        </svg>
      );
    case 'bug':
      return (
        <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
          <path d="M15.5 6.2L17 4l-1.5-1-1.8 2.4a5.2 5.2 0 0 0-3.4 0L8.5 3 7 4l1.5 2.2A5.5 5.5 0 0 0 6.5 10H4v2h2.2v1.8H4v2h2.6a5.5 5.5 0 0 0 10.8 0H20v-2h-2.2V12H20v-2h-2.5a5.5 5.5 0 0 0-2-3.8Z" />
        </svg>
      );
    case 'rock':
      return (
        <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
          <path d="M7.5 4h9l4.5 7.5L16.5 20h-9L3 11.5 7.5 4Z" />
        </svg>
      );
    case 'ghost':
      return (
        <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
          <path d="M12 3a8 8 0 0 0-8 8v9.2c0 .6.7.9 1.2.5l2.5-2 2.3 2a.8.8 0 0 0 1 0l2-1.8 2 1.8a.8.8 0 0 0 1 0l2.3-2 2.5 2c.5.4 1.2.1 1.2-.5V11a8 8 0 0 0-8-8Zm-2.7 8.5a1.3 1.3 0 1 1 0-2.6 1.3 1.3 0 0 1 0 2.6Zm5.4 0a1.3 1.3 0 1 1 0-2.6 1.3 1.3 0 0 1 0 2.6Z" />
        </svg>
      );
    case 'dragon':
      return (
        <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
          <path d="M19.5 4.5C15.5 3.8 11 5.5 8.5 9l2.4 1.2C8.2 12 6.2 14.5 5 18l3.8-1.4c-.3 1.1-.2 2.1.3 3 3.7-.7 7.1-3.1 9-6.6 1.4-2.7 1.8-5.7 1.4-8.5Z" />
        </svg>
      );
    case 'dark':
      return (
        <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
          <path d="M15.8 3.2A9 9 0 1 0 20.8 16a7.2 7.2 0 0 1-5-12.8Z" />
        </svg>
      );
    case 'steel':
      return (
        <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
          <path d="M12 2l8.5 5v10L12 22l-8.5-5V7L12 2Zm0 5.5A4.5 4.5 0 1 0 12 16.5a4.5 4.5 0 0 0 0-9Z" />
        </svg>
      );
    case 'fairy':
      return (
        <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
          <path d="M12 2l2.6 6.2L21 9.4l-4.8 4.4 1.3 6.5L12 17l-5.5 3.3 1.3-6.5L3 9.4l6.4-1.2L12 2Z" />
        </svg>
      );
    default:
      return (
        <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
          <circle cx="12" cy="12" r="8" />
        </svg>
      );
  }
}

interface TypeBadgeProps {
  type: string;
  size?: 'sm' | 'md';
}

export function TypeBadge({ type, size = 'md' }: TypeBadgeProps) {
  const info = TYPE_PT_MAP[type] ?? {
    label: type,
    bg: '#475569',
    text: '#FFFFFF',
    border: '#334155',
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-semibold tracking-tight whitespace-nowrap shrink-0 rounded-lg border shadow-xs ${
        size === 'sm' ? 'px-2.5 py-1 text-xs' : 'px-3.5 py-1.5 text-sm'
      }`}
      style={{
        backgroundColor: info.bg,
        color: info.text,
        borderColor: info.border,
      }}
    >
      <TypeIconSvg type={type} className={size === 'sm' ? 'w-3.5 h-3.5' : 'w-4 h-4'} />
      <span>{info.label}</span>
    </span>
  );
}
