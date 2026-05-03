/**
 * Layout Component
 * Main application layout with sidebar and topbar
 */

import { ReactNode, useState } from 'react';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';

interface LayoutProps {
  children: ReactNode;
  onSearch?: (query: string) => void;
}

export function Layout({ children, onSearch }: LayoutProps) {
  return (
    <div className="flex min-h-screen bg-background">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <div className="flex flex-col flex-1 ml-[230px]">
        {/* Topbar */}
        <Topbar onSearch={onSearch} />

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
