interface IconProps {
  size?: number;
  color?: string;
  className?: string;
}

export const ArrowLeft = ({ size = 16, color = 'currentColor', className } : IconProps) => (
  <svg width={size} height={size} viewBox="0 0 16 16" fill="none" className={className}>
    <path d="M10 3L5 8L10 13" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

export const Check = ({ size = 14, color = 'currentColor', className } : IconProps) => (
  <svg width={size} height={size} viewBox="0 0 14 14" fill="none" className={className}>
    <path d="M2.5 7.5L5.5 10.5L11.5 3.5" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

export const Cross = ({ size = 14, color = 'currentColor', className } : IconProps) => (
  <svg width={size} height={size} viewBox="0 0 14 14" fill="none" className={className}>
    <path d="M3 3L11 11M11 3L3 11" stroke={color} strokeWidth="2" strokeLinecap="round"/>
  </svg>
);

export const Trash = ({ size = 14, color = 'currentColor', className } : IconProps) => (
  <svg width={size} height={size} viewBox="0 0 10 12" fill="none" className={className}>
    <path d="M0.5 2.7H1.5M1.5 2.7H9.5M1.5 2.7L1.5 10.4C1.5 10.6917 1.60536 10.9715 1.79289 11.1778C1.98043 11.3841 2.23478 11.5 2.5 11.5H7.5C7.76522 11.5 8.01957 11.3841 8.20711 11.1778C8.39464 10.9715 8.5 10.6917 8.5 10.4V2.7M3 2.7V1.6C3 1.30826 3.10536 1.02847 3.29289 0.822183C3.48043 0.615892 3.73478 0.5 4 0.5H6C6.26522 0.5 6.51957 0.615892 6.70711 0.822183C6.89464 1.02847 7 1.30826 7 1.6V2.7M4 5.45V8.75M6 5.45V8.75" stroke={color} strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

export const Clock = ({ size = 16, color = 'currentColor', className } : IconProps) => (
  <svg width={size} height={size} viewBox="0 0 16 16" fill="none" className={className}>
    <circle cx="8" cy="8" r="6" stroke={color} strokeWidth="1.5"/>
    <path d="M8 4.5V8L10.5 10" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

export const Circle = ({ size = 14, color = 'currentColor', className } : IconProps) => (
  <svg width={size} height={size} viewBox="0 0 14 14" fill="none" className={className}>
    <circle cx="7" cy="7" r="5.5" stroke={color} strokeWidth="1.5"/>
  </svg>
);
