// ============================================================
// NERIXA — Embedded Feather SVG Icons
// Zero-dependency SVG replacements for react-icons/fi
// ============================================================
import React from 'react';

export interface IconProps extends React.SVGProps<SVGSVGElement> {
  size?: number | string;
  className?: string;
  color?: string;
}

const baseProps = (size: number | string = 18, color: string = 'currentColor', className: string = '', extra?: React.SVGProps<SVGSVGElement>) => ({
  width: size,
  height: size,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: color,
  strokeWidth: 2,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
  className,
  ...extra,
});

export const FiNavigation: React.FC<IconProps> = ({ size = 18, color = 'currentColor', className = '', ...props }) => (
  <svg {...baseProps(size, color, className, props)}>
    <polygon points="3 11 22 2 13 21 11 13 3 11" />
  </svg>
);

export const FiAlertTriangle: React.FC<IconProps> = ({ size = 18, color = 'currentColor', className = '', ...props }) => (
  <svg {...baseProps(size, color, className, props)}>
    <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
    <line x1="12" y1="9" x2="12" y2="13" />
    <line x1="12" y1="17" x2="12.01" y2="17" />
  </svg>
);

export const FiCheckCircle: React.FC<IconProps> = ({ size = 18, color = 'currentColor', className = '', ...props }) => (
  <svg {...baseProps(size, color, className, props)}>
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
    <polyline points="22 4 12 14.01 9 11.01" />
  </svg>
);

export const FiWifi: React.FC<IconProps> = ({ size = 18, color = 'currentColor', className = '', ...props }) => (
  <svg {...baseProps(size, color, className, props)}>
    <path d="M5 12.55a11 11 0 0 1 14.08 0" />
    <path d="M1.42 9a16 16 0 0 1 21.16 0" />
    <path d="M8.53 16.11a6 6 0 0 1 6.95 0" />
    <line x1="12" y1="20" x2="12.01" y2="20" />
  </svg>
);

export const FiWifiOff: React.FC<IconProps> = ({ size = 18, color = 'currentColor', className = '', ...props }) => (
  <svg {...baseProps(size, color, className, props)}>
    <line x1="1" y1="1" x2="23" y2="23" />
    <path d="M16.72 11.06A10.94 10.94 0 0 1 19 12.55" />
    <path d="M5 12.55a10.94 10.94 0 0 1 5.17-2.39" />
    <path d="M10.71 5.05A16 16 0 0 1 22.58 9" />
    <path d="M1.42 9a15.91 15.91 0 0 1 4.7-2.88" />
    <path d="M8.53 16.11a6 6 0 0 1 6.95 0" />
    <line x1="12" y1="20" x2="12.01" y2="20" />
  </svg>
);

export const FiRefreshCw: React.FC<IconProps> = ({ size = 18, color = 'currentColor', className = '', ...props }) => (
  <svg {...baseProps(size, color, className, props)}>
    <polyline points="23 4 23 10 17 10" />
    <polyline points="1 20 1 14 7 14" />
    <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
  </svg>
);

export const FiCompass: React.FC<IconProps> = ({ size = 18, color = 'currentColor', className = '', ...props }) => (
  <svg {...baseProps(size, color, className, props)}>
    <circle cx="12" cy="12" r="10" />
    <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" />
  </svg>
);

export const FiShield: React.FC<IconProps> = ({ size = 18, color = 'currentColor', className = '', ...props }) => (
  <svg {...baseProps(size, color, className, props)}>
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
  </svg>
);

export const FiX: React.FC<IconProps> = ({ size = 18, color = 'currentColor', className = '', ...props }) => (
  <svg {...baseProps(size, color, className, props)}>
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

export const FiCheck: React.FC<IconProps> = ({ size = 18, color = 'currentColor', className = '', ...props }) => (
  <svg {...baseProps(size, color, className, props)}>
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

export const FiActivity: React.FC<IconProps> = ({ size = 18, color = 'currentColor', className = '', ...props }) => (
  <svg {...baseProps(size, color, className, props)}>
    <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
  </svg>
);

export const FiAlertCircle: React.FC<IconProps> = ({ size = 18, color = 'currentColor', className = '', ...props }) => (
  <svg {...baseProps(size, color, className, props)}>
    <circle cx="12" cy="12" r="10" />
    <line x1="12" y1="8" x2="12" y2="12" />
    <line x1="12" y1="16" x2="12.01" y2="16" />
  </svg>
);

export const FiXCircle: React.FC<IconProps> = ({ size = 18, color = 'currentColor', className = '', ...props }) => (
  <svg {...baseProps(size, color, className, props)}>
    <circle cx="12" cy="12" r="10" />
    <line x1="15" y1="9" x2="9" y2="15" />
    <line x1="9" y1="9" x2="15" y2="15" />
  </svg>
);

export const FiRadio: React.FC<IconProps> = ({ size = 18, color = 'currentColor', className = '', ...props }) => (
  <svg {...baseProps(size, color, className, props)}>
    <circle cx="12" cy="12" r="2" />
    <path d="M16.24 7.76a6 6 0 0 1 0 8.49m-8.48-.01a6 6 0 0 1 0-8.49m11.31-2.82a10 10 0 0 1 0 14.14m-14.14 0a10 10 0 0 1 0-14.14" />
  </svg>
);

export const FiCloudRain: React.FC<IconProps> = ({ size = 18, color = 'currentColor', className = '', ...props }) => (
  <svg {...baseProps(size, color, className, props)}>
    <line x1="16" y1="13" x2="16" y2="21" />
    <line x1="8" y1="13" x2="8" y2="21" />
    <line x1="12" y1="15" x2="12" y2="23" />
    <path d="M20 16.58A5 5 0 0 0 18 7h-1.26A8 8 0 1 0 4 15.25" />
  </svg>
);

export const FiMapPin: React.FC<IconProps> = ({ size = 18, color = 'currentColor', className = '', ...props }) => (
  <svg {...baseProps(size, color, className, props)}>
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
    <circle cx="12" cy="10" r="3" />
  </svg>
);

export const FiCamera: React.FC<IconProps> = ({ size = 18, color = 'currentColor', className = '', ...props }) => (
  <svg {...baseProps(size, color, className, props)}>
    <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
    <circle cx="12" cy="13" r="4" />
  </svg>
);

export const FiLayers: React.FC<IconProps> = ({ size = 18, color = 'currentColor', className = '', ...props }) => (
  <svg {...baseProps(size, color, className, props)}>
    <polygon points="12 2 2 7 12 12 22 7 12 2" />
    <polyline points="2 17 12 22 22 17" />
    <polyline points="2 12 12 17 22 12" />
  </svg>
);

export const FiTruck: React.FC<IconProps> = ({ size = 18, color = 'currentColor', className = '', ...props }) => (
  <svg {...baseProps(size, color, className, props)}>
    <rect x="1" y="3" width="15" height="13" />
    <polygon points="16 8 20 8 23 11 23 16 16 16 16 8" />
    <circle cx="5.5" cy="18.5" r="2.5" />
    <circle cx="18.5" cy="18.5" r="2.5" />
  </svg>
);

export const FiSlash: React.FC<IconProps> = ({ size = 18, color = 'currentColor', className = '', ...props }) => (
  <svg {...baseProps(size, color, className, props)}>
    <circle cx="12" cy="12" r="10" />
    <line x1="4.93" y1="4.93" x2="19.07" y2="19.07" />
  </svg>
);

export const FiClock: React.FC<IconProps> = ({ size = 18, color = 'currentColor', className = '', ...props }) => (
  <svg {...baseProps(size, color, className, props)}>
    <circle cx="12" cy="12" r="10" />
    <polyline points="12 6 12 12 16 14" />
  </svg>
);

export const FiCpu: React.FC<IconProps> = ({ size = 18, color = 'currentColor', className = '', ...props }) => (
  <svg {...baseProps(size, color, className, props)}>
    <rect x="4" y="4" width="16" height="16" rx="2" />
    <rect x="9" y="9" width="6" height="6" />
    <line x1="9" y1="1" x2="9" y2="4" />
    <line x1="15" y1="1" x2="15" y2="4" />
    <line x1="9" y1="20" x2="9" y2="23" />
    <line x1="15" y1="20" x2="15" y2="23" />
    <line x1="20" y1="9" x2="23" y2="9" />
    <line x1="20" y1="14" x2="23" y2="14" />
    <line x1="1" y1="9" x2="4" y2="9" />
    <line x1="1" y1="14" x2="4" y2="14" />
  </svg>
);

export const FiUploadCloud: React.FC<IconProps> = ({ size = 18, color = 'currentColor', className = '', ...props }) => (
  <svg {...baseProps(size, color, className, props)}>
    <polyline points="16 16 12 12 8 16" />
    <line x1="12" y1="12" x2="12" y2="21" />
    <path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3" />
    <polyline points="16 16 12 12 8 16" />
  </svg>
);

export const FiArrowLeft: React.FC<IconProps> = ({ size = 18, color = 'currentColor', className = '', ...props }) => (
  <svg {...baseProps(size, color, className, props)}>
    <line x1="19" y1="12" x2="5" y2="12" />
    <polyline points="12 19 5 12 12 5" />
  </svg>
);
