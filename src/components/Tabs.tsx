import React from 'react';

interface TabsProps {
  tabs: string[];
  activeTab: string;
  onTabChange: (tab: string) => void;
  className?: string;
}

const Tabs: React.FC<TabsProps> = ({ tabs, activeTab, onTabChange, className }) => (
  <div className={`flex gap-4 text-sm ${className || ''}`}>
    {tabs.map(tab => (
      <button
        key={tab}
        className={`font-semibold px-3 py-1 rounded-full transition ${activeTab === tab ? 'bg-black text-white' : 'bg-gray-200 text-black'}`}
        onClick={() => onTabChange(tab)}
      >
        {tab}
      </button>
    ))}
  </div>
);

export default Tabs; 