import React from 'react';

interface PageLayoutProps {
  children: React.ReactNode;
  className?: string;
}

const PageLayout: React.FC<PageLayoutProps> = ({ children, className }) => (
  <main className={`max-w-7xl mx-auto px-4 py-10 ${className || ''}`}>
    {children}
  </main>
);

export default PageLayout; 