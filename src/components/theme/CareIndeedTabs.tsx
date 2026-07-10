import React from 'react';
import {
  workspaceCompactTabClass,
  workspaceTabActiveClass,
  workspaceTabInactiveClass,
} from './workspaceTabChrome';

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
    <div className={`flex max-w-full items-stretch overflow-x-auto border-b border-card bg-transparent font-montserrat ${className}`} role="tablist">
      {tabs.map((tab) => {
        const isActive = tab.id === activeTabId;
        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => onChange(tab.id)}
            className={`${workspaceCompactTabClass} whitespace-nowrap ${
              isActive ? workspaceTabActiveClass : workspaceTabInactiveClass
            }`}
            role="tab"
            aria-selected={isActive}
          >
            {tab.label}
          </button>
        );
      })}
    </div>
  );
};
