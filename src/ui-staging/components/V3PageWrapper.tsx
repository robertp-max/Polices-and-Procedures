import React, { useEffect, useState } from 'react';

/**
 * CSS-only page transition wrapper (extracted + adapted from ClaudeX2).
 * Replaces the framer-motion version from ClaudeExecute1.
 * 
 * On transitionKey change → remounts the div → restarts the v3PageIn animation
 * (scale 0.98 → 1 + blur(3px) → 0 + opacity, 0.7s cubic-bezier(0.16,1,0.3,1)).
 *
 * Use this in ui-staging previews to demonstrate the honest CSS-only transition system.
 */

interface V3PageWrapperProps {
  children: React.ReactNode;
  className?: string;
  /** Change this value to force a fresh enter animation (used for demo in the lab) */
  transitionKey?: string | number;
}

export const V3PageWrapper: React.FC<V3PageWrapperProps> = ({
  children,
  className = '',
  transitionKey,
}) => {
  const [animKey, setAnimKey] = useState(0);

  useEffect(() => {
    // Retrigger animation whenever the caller changes the key
    setAnimKey((prev) => prev + 1);
  }, [transitionKey]);

  return (
    <div
      key={animKey}
      className={`v3-page-animate ${className}`}
      style={{ width: '100%', minHeight: '100%' }}
    >
      {children}
    </div>
  );
};

/**
 * Lighter sub-view / tab / section transition (0.5s).
 * Re-animates content when viewKey changes.
 */
export const V3SubView: React.FC<{
  viewKey: string | number;
  children: React.ReactNode;
  className?: string;
}> = ({ viewKey, children, className = '' }) => (
  <div
    key={viewKey}
    className={`v3-subview-animate ${className}`}
    style={{ width: '100%' }}
  >
    {children}
  </div>
);
