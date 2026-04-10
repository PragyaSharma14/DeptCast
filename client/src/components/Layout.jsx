import React from 'react';
import { Navbar } from './Navbar';
import { Sidebar } from './Sidebar';
import { ThreeBackground } from './ThreeBackground';

export const Layout = ({ children }) => {
  return (
    <div className="relative min-h-screen font-sans font-light selection:bg-brand/30 flex">
      {/* Dynamic 3D background */}
      <ThreeBackground />
      
      <Sidebar />
      
      {/* Main Content Wrapper - shifted right to account for Sidebar on standard screens */}
      <div className="flex-1 flex flex-col min-w-0 md:ml-64 relative z-10 transition-all">
          <Navbar />
          <main className="flex-1 w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-in fade-in duration-500">
            {children}
          </main>
      </div>
    </div>
  );
};
