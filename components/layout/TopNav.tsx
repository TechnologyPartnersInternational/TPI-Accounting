'use client';

import { useRouter } from 'next/navigation';
import { ChevronLeft, Search, Bell, User } from 'lucide-react';

export function TopNav() {
  const router = useRouter();

  return (
    <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 sticky top-0 z-10 w-full">
      
      {/* Left: Back Navigation */}
      <div className="flex items-center lg:w-1/3">
        <button 
          onClick={() => router.back()}
          className="flex items-center text-gray-500 hover:text-[#0f172a] transition-colors text-sm font-medium group"
        >
          <ChevronLeft size={16} className="mr-1 group-hover:-translate-x-1 transition-transform" />
          <span>Back</span>
        </button>
      </div>

      {/* Middle: Universal Search Bar */}
      <div className="hidden lg:flex justify-center flex-1 lg:w-1/3">
        <div className="relative w-full max-w-md group">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search size={16} className="text-gray-400 group-focus-within:text-[#0f172a] transition-colors" />
          </div>
          <input
            type="text"
            className="block w-full pl-10 pr-3 py-2 border border-gray-200 rounded-full text-sm placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-[#0f172a] focus:border-[#0f172a] bg-gray-50 focus:bg-white transition-all"
            placeholder="Search clients, jobs, or ID..."
          />
        </div>
      </div>

      {/* Right: Notifications & User Profile */}
      <div className="flex items-center justify-end space-x-4 lg:w-1/3">
        <button className="text-gray-400 hover:text-[#0f172a] transition-colors p-2 rounded-full hover:bg-gray-50 relative">
          <Bell size={20} />
          {/* Status dot example */}
          <span className="absolute top-2 right-2.5 block h-1.5 w-1.5 rounded-full ring-2 ring-white bg-red-400"></span>
        </button>
        
        <div className="h-6 w-px bg-gray-200 mx-2"></div>
        
        {/* User Dropdown Button (simplified for now but shows exactly what is meant to be there) */}
        <button className="flex items-center space-x-3 text-left group">
          <div className="hidden sm:block">
            <p className="text-sm font-semibold text-[#0f172a] leading-none">TPI Accounts</p>
            <p className="text-[11px] text-gray-400 mt-1">Admin Access</p>
          </div>
          <div className="h-9 w-9 bg-[#f8fafc] text-[#0f172a] group-hover:bg-[#0f172a] group-hover:text-white transition-colors border border-gray-200 rounded-full flex items-center justify-center">
            <User size={18} />
          </div>
        </button>
      </div>

    </header>
  );
}
