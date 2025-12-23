import React from 'react';
import { Bell, Search } from 'lucide-react';

interface HeaderProps {
  title: string;
}

export function Header({ title }: HeaderProps) {
  return (
    <header className="h-20 bg-white/80 backdrop-blur-md border-b border-gray-100 flex items-center justify-between px-8 sticky top-0 z-10">
      <div className="flex items-center space-x-8">
        <h2 className="text-xl font-bold text-gray-800">{title}</h2>
        <div className="relative hidden md:block">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input 
            type="text" 
            placeholder="搜索记录或教案..." 
            className="pl-10 pr-4 py-2 bg-gray-50 border-none rounded-full w-64 text-sm focus:ring-2 focus:ring-blue-100 outline-none transition-all"
          />
        </div>
      </div>
      
      <div className="flex items-center space-x-6">
        <button className="relative text-gray-400 hover:text-gray-600 transition-colors">
          <Bell size={22} />
          <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
        </button>
        <div className="flex items-center space-x-3 cursor-pointer group">
          <div className="text-right hidden sm:block">
            <div className="text-sm font-bold text-gray-800 group-hover:text-blue-600 transition-colors">李老师</div>
            <div className="text-[10px] text-gray-400 uppercase tracking-wider font-bold">高级教师</div>
          </div>
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-bold shadow-lg shadow-blue-100 ring-2 ring-white">
            李
          </div>
        </div>
      </div>
    </header>
  );
}

