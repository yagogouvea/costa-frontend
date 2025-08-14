import React from 'react';

export interface BadgeProps {
  children: React.ReactNode;
  color?: string;
  style?: React.CSSProperties;
  className?: string;
}

const Badge: React.FC<BadgeProps> = ({ children, color = '#eee', style, className }) => (
  <span
    className={className}
    style={{
      background: color,
      borderRadius: 4,
      padding: '2px 8px',
      fontSize: 12,
      display: 'inline-block',
      ...style,
    }}
  >
    {children}
  </span>
);

export default Badge; 