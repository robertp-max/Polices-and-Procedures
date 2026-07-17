import React from 'react';

interface InteractiveGroupProps extends React.SVGProps<SVGGElement> {
  id: string;
  label: string;
  onActivate: () => void;
  isActive?: boolean;
  isCompleted?: boolean;
  children: React.ReactNode;
}

export const InteractiveGroup: React.FC<InteractiveGroupProps> = ({
  id,
  label,
  onActivate,
  isActive = false,
  isCompleted = false,
  children,
  style,
  className = '',
  ...props
}) => {
  const handleKeyDown = (e: React.KeyboardEvent<SVGGElement>) => {
    if (e.key === ' ' || e.key === 'Enter') {
      e.preventDefault();
      onActivate();
    }
  };

  return (
    <g
      id={id}
      role="button"
      tabIndex={0}
      aria-label={label}
      aria-pressed={isActive}
      onKeyDown={handleKeyDown}
      onClick={(e) => {
        e.stopPropagation();
        onActivate();
      }}
      style={{
        cursor: 'pointer',
        outline: 'none',
        ...style,
      }}
      className={`lvn-interactive-group ${isActive ? 'active' : ''} ${isCompleted ? 'completed' : ''} ${className}`}
      {...props}
    >
      {children}
    </g>
  );
};
