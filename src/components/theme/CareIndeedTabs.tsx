import React from 'react';

export interface TabItem {
  id: string;
  label: string;
}

export interface CareIndeedTabsProps {
  tabs: TabItem[];
  activeTabId: string;
  onChange: (id: string) => void;
  className?: string;
}

export const CareIndeedTabs: React.FC<CareIndeedTabsProps> = ({
  tabs,
  activeTabId,
  onChange,
  className = '',
}) => {
  return (
    <div className={`flex space-x-8 border-b border-card bg-transparent px-2 ${className}`}>
      {tabs.map((tab) => {
        const isActive = tab.id === activeTabId;
        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => onChange(tab.id)}
            className={`py-4 text-sm font-semibold transition-all duration-150 border-b-4 focus:outline-none ${
              isActive
                ? 'border-brand-teal-deep text-brand-teal-deep'
                : 'border-transparent text-muted hover:text-brand-teal hover:border-gray-300'
            }`}
          >
            {tab.label}
          </button>
        );
      })}
    </div>
  );
};
