"use client";

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  Mic, 
  FilePlus, 
  Settings,
  LogOut
} from 'lucide-react';
import { cn } from '@/lib/utils';

const menuItems = [
  { icon: LayoutDashboard, label: '首页', href: '/' },
  { icon: Mic, label: '课堂分析', href: '/analysis' },
  { icon: FilePlus, label: '教案生成', href: '/lesson-plan' },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 bg-white border-r border-gray-200 flex flex-col h-full">
      <div className="p-8">
        <Link href="/" className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-xl">T</span>
          </div>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            TeachMate
          </h1>
        </Link>
      </div>

      <nav className="flex-1 px-4 space-y-2 mt-4">
        {menuItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200",
                isActive 
                  ? "bg-blue-600 text-white shadow-lg shadow-blue-100 font-medium" 
                  : "text-gray-500 hover:bg-gray-100 hover:text-gray-900"
              )}
            >
              <item.icon size={20} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-gray-100 space-y-2">
        <div className="px-4 py-2">
          <div className="flex items-center justify-between text-[10px] font-black text-gray-400 uppercase tracking-widest">
            <span>Version 1.0.0</span>
            <span className="text-blue-500 bg-blue-50 px-1.5 py-0.5 rounded">MVP</span>
          </div>
        </div>
        <button className="flex items-center space-x-3 w-full px-4 py-3 text-gray-500 hover:bg-gray-50 rounded-xl transition-colors">
          <Settings size={20} />
          <span>设置</span>
        </button>
        <button className="flex items-center space-x-3 w-full px-4 py-3 text-red-500 hover:bg-red-50 rounded-xl transition-colors">
          <LogOut size={20} />
          <span>退出登录</span>
        </button>
      </div>
    </aside>
  );
}

