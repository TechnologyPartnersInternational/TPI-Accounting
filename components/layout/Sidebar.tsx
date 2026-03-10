'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  FilePlus,
  List,
  Users,
  Search,
  BarChart3,
  Download,
  DollarSign,
  Menu,
  ChevronLeft,
  Flag,
  Upload
} from 'lucide-react';

export function Sidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const pathname = usePathname();

  const navGroups = [
    {
      title: 'Main',
      items: [
        { label: 'Dashboard', href: '/', icon: LayoutDashboard },
      ]
    },
    {
      title: 'Job Management',
      items: [
        { label: 'New Job Entry', href: '/jobs/new', icon: FilePlus },
        { label: 'All Jobs', href: '/jobs', icon: List },
        { label: 'Bulk Upload', href: '/jobs/bulk', icon: Upload },
      ]
    },
    {
      title: 'Clients',
      items: [
        { label: 'Client List', href: '/clients', icon: Users },
        { label: 'Search Jobs', href: '/search', icon: Search },
      ]
    },
    {
      title: 'Reports',
      items: [
        { label: 'Monthly Summary', href: '/reports/monthly', icon: BarChart3 },
        { label: 'Export Data', href: '/reports/export', icon: Download },
      ]
    },
    {
      title: 'Settings',
      items: [
        { label: 'Currency Rates', href: '/settings/currency', icon: DollarSign },
      ]
    }
  ];

  return (
    <aside 
      className={`bg-white border-r border-gray-200 transition-all h-screen sticky top-0 flex flex-col shrink-0
        ${isCollapsed ? 'w-20' : 'w-64'}
      `}
    >
      {/* Sidebar Header Built specifically for matching design */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-gray-100">
        <div className={`flex items-center space-x-2 overflow-hidden transition-all text-[#0f172a] ${isCollapsed ? 'w-0 opacity-0 hidden' : 'w-auto opacity-100'}`}>
          <Flag size={24} fill="#0f172a" stroke="#0f172a" strokeWidth={1} className="shrink-0" />
          <span className="font-bold text-lg whitespace-nowrap">TPI Accounting</span>
        </div>
        
        <button 
          onClick={() => setIsCollapsed(!isCollapsed)}
          className={`p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 transition-colors shrink-0 ${isCollapsed ? 'mx-auto' : ''}`}
        >
          {isCollapsed ? <Menu size={20} /> : <ChevronLeft size={20} />}
        </button>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 py-4 px-3 space-y-6 overflow-y-auto overflow-x-hidden custom-scrollbar">
        {navGroups.map((group, groupIndex) => (
          <div key={groupIndex} className="space-y-1">
            {!isCollapsed && group.title !== 'Main' && (
              <p className="px-3 text-xs font-bold tracking-wider text-gray-400 uppercase mb-2">
                {group.title}
              </p>
            )}
            
            {group.items.map((item) => {
              const isActive = pathname === item.href || (
                pathname.startsWith(item.href + '/') && 
                item.href !== '/' && 
                !navGroups.some(g => g.items.some(i => i.href !== item.href && pathname.startsWith(i.href)))
              );
              
              return (
                <Link 
                  key={item.href} 
                  href={item.href}
                  className={`
                    flex items-center px-3 py-2.5 rounded-lg transition-all group relative
                    ${isActive 
                      ? 'bg-indigo-50/50 text-[#0f172a] font-semibold' 
                      : 'text-gray-500 hover:bg-gray-50 hover:text-[#0f172a]'
                    }
                  `}
                  title={isCollapsed ? item.label : undefined}
                >
                  {isActive && (
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-[#0f172a] rounded-r-md"></div>
                  )}
                  <item.icon 
                    size={isCollapsed ? 22 : 18} 
                    className={`shrink-0 ${isCollapsed ? 'mx-auto' : 'mr-3'} ${isActive ? 'text-[#0f172a]' : 'text-gray-400 group-hover:text-gray-600'}`} 
                  />
                  <span 
                    className={`text-sm whitespace-nowrap transition-all duration-300
                      ${isCollapsed ? 'opacity-0 w-0 hidden' : 'opacity-100 w-auto'}
                    `}
                  >
                    {item.label}
                  </span>
                </Link>
              );
            })}
          </div>
        ))}
      </nav>
      
      {/* Footer minimal info when expanded */}
      {!isCollapsed && (
        <div className="p-4 text-xs text-gray-400 border-t border-gray-100">
          <p>&copy; {new Date().getFullYear()} TPI</p>
          <p className="mt-0.5 truncate">Internal Tracking System</p>
        </div>
      )}
    </aside>
  );
}
