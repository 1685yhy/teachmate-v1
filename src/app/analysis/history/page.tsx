"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  History,
  ArrowLeft,
  FileText,
  Calendar,
  Search,
  Filter,
  Trash2,
  Download,
  ChevronRight
} from 'lucide-react';
import { Header } from '@/components/Header';
import { cn } from '@/lib/utils';
import Link from 'next/link';

export default function AnalysisHistoryPage() {
  const router = useRouter();
  const [analysisHistory, setAnalysisHistory] = useState<any[]>([]);
  const [filteredHistory, setFilteredHistory] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const history = JSON.parse(localStorage.getItem('analysis_history') || '[]');
    setAnalysisHistory(history);
    setFilteredHistory(history);
  }, []);

  useEffect(() => {
    if (searchTerm) {
      const filtered = analysisHistory.filter((item: any) => 
        item.meta?.subject?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.meta?.grade?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.meta?.date?.includes(searchTerm)
      );
      setFilteredHistory(filtered);
    } else {
      setFilteredHistory(analysisHistory);
    }
  }, [searchTerm, analysisHistory]);

  const handleDelete = (id: string) => {
    if (confirm('确定要删除这条记录吗？')) {
      const updated = analysisHistory.filter((item: any) => item.id !== id);
      localStorage.setItem('analysis_history', JSON.stringify(updated));
      setAnalysisHistory(updated);
      setFilteredHistory(updated.filter((item: any) => 
        !searchTerm || 
        item.meta?.subject?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.meta?.grade?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.meta?.date?.includes(searchTerm)
      ));
    }
  };

  return (
    <>
      <Header title="分析历史记录" />
      <main className="flex-1 overflow-y-auto p-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <button 
              onClick={() => router.back()}
              className="flex items-center space-x-2 text-gray-500 hover:text-gray-700 transition-colors"
            >
              <ArrowLeft size={18} />
              <span className="font-bold">返回</span>
            </button>
          </div>

          {/* 搜索栏 */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 mb-6">
            <div className="flex items-center space-x-3">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="text"
                  placeholder="搜索学科、年级或日期..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-gray-50 border-none rounded-xl pl-10 pr-4 py-2 text-sm focus:ring-2 focus:ring-blue-100 outline-none"
                />
              </div>
            </div>
          </div>

          {/* 历史记录列表 */}
          <div className="space-y-4">
            {filteredHistory.length > 0 ? (
              filteredHistory.map((item: any) => (
                <Link
                  key={item.id}
                  href={`/report/${item.id}`}
                  className="block bg-white rounded-2xl border border-gray-100 shadow-sm p-6 hover:shadow-md hover:border-blue-200 transition-all group"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4 flex-1">
                      <div className={cn(
                        "w-12 h-12 rounded-xl flex items-center justify-center",
                        item.enhanced ? "bg-purple-100 text-purple-600" : "bg-blue-100 text-blue-600"
                      )}>
                        <FileText size={24} />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <h3 className="text-lg font-bold text-gray-900">
                            {item.meta?.subject || '通用'} ({item.meta?.grade || '未定'})
                          </h3>
                          {item.enhanced && (
                            <span className="px-2 py-0.5 bg-purple-100 text-purple-700 text-xs font-bold rounded-full">
                              V1.5
                            </span>
                          )}
                        </div>
                        <div className="flex items-center space-x-4 text-sm text-gray-500">
                          <span className="flex items-center space-x-1">
                            <Calendar size={14} />
                            <span>{new Date(item.meta?.date || Date.now()).toLocaleString()}</span>
                          </span>
                          <span>开放式问题：{((item.analysis?.open_question_ratio ?? 0) * 100).toFixed(0)}%</span>
                          <span>语速：{item.analysis?.speech_rate ?? 210}字/分</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          handleDelete(item.id);
                        }}
                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                      >
                        <Trash2 size={18} />
                      </button>
                      <ChevronRight size={18} className="text-gray-300 group-hover:text-blue-600 transition-colors" />
                    </div>
                  </div>
                </Link>
              ))
            ) : (
              <div className="text-center py-12 bg-white rounded-2xl border border-gray-100">
                <History className="mx-auto text-gray-300 mb-4" size={48} />
                <p className="text-gray-500 mb-2">暂无历史记录</p>
                <Link href="/analysis" className="text-blue-600 hover:text-blue-700 font-bold text-sm">
                  开始新的分析
                </Link>
              </div>
            )}
          </div>
        </div>
      </main>
    </>
  );
}

