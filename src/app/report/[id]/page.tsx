"use client";

import React, { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { 
  ArrowLeft,
  Download,
  History,
  Calendar,
  BookOpen,
  FileText,
  GitCompare
} from 'lucide-react';
import { Header } from '@/components/Header';
import { cn } from '@/lib/utils';

export default function ReportDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [report, setReport] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 确保在客户端执行
    if (typeof window === 'undefined') return;
    
    const reportId = params?.id;
    if (reportId) {
      try {
        const history = JSON.parse(localStorage.getItem('analysis_history') || '[]');
        const found = history.find((item: any) => String(item.id) === String(reportId));
        if (found) {
          setReport(found);
        } else {
          console.warn('Report not found:', reportId);
        }
      } catch (error) {
        console.error('Error loading report:', error);
      }
    }
    setLoading(false);
  }, [params?.id]);

  if (loading) {
    return (
      <>
        <Header title="加载中..." />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-gray-400">加载中...</div>
        </main>
      </>
    );
  }

  if (!report) {
    return (
      <>
        <Header title="报告不存在" />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="text-gray-400 mb-4">报告不存在或已删除</div>
            <button 
              onClick={() => router.back()}
              className="text-blue-600 hover:text-blue-700 font-bold"
            >
              返回
            </button>
          </div>
        </main>
      </>
    );
  }

  return (
    <>
      <Header title="分析报告详情" />
      <main className="flex-1 overflow-y-auto p-8">
        <div className="max-w-6xl mx-auto">
          <button 
            onClick={() => router.back()}
            className="flex items-center space-x-2 text-gray-500 hover:text-gray-700 mb-6 transition-colors"
          >
            <ArrowLeft size={18} />
            <span className="font-bold">返回</span>
          </button>

          {/* 报告内容 - 复用分析页面的展示逻辑 */}
          <div className="bg-white rounded-3xl border border-gray-100 shadow-xl p-8">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h3 className="text-2xl font-black text-gray-900">分析报告</h3>
                <p className="text-sm text-gray-400">
                  生成时间：{new Date(report.meta?.date || Date.now()).toLocaleString()}
                </p>
              </div>
              <button 
                onClick={() => window.print()}
                className="flex items-center space-x-2 bg-gray-900 text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-gray-800 transition-colors print:hidden"
              >
                <Download size={18} />
                <span>导出 PDF</span>
              </button>
            </div>

            {/* 如果是增强版，显示亮点 */}
            {report.enhanced && report.analysis?.highlights && (
              <div className="mb-8 p-6 rounded-2xl bg-gradient-to-br from-yellow-50 to-orange-50 border-2 border-yellow-200">
                <h4 className="text-xl font-black text-gray-900 mb-4 flex items-center space-x-2">
                  <span>🏆 三大亮点</span>
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {report.analysis.highlights.map((highlight: any, idx: number) => (
                    <div key={idx} className="bg-white p-4 rounded-xl border border-yellow-100">
                      <div className="text-sm font-black text-yellow-600 mb-1">{idx + 1}. {highlight.title}</div>
                      <div className="text-xs text-gray-700 leading-relaxed">{highlight.description}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 指标展示 */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              {[
                { 
                  label: '开放式问题比例', 
                  val: `${((report.analysis?.open_question_ratio ?? 0) * 100).toFixed(0)}%`, 
                  target: '≥25%', 
                  status: (report.analysis?.open_question_ratio ?? 0) >= 0.25 ? 'good' : 'warning'
                },
                { 
                  label: '教师语速', 
                  val: `${report.analysis?.speech_rate ?? 210}字/分`, 
                  target: '180-220', 
                  status: (report.analysis?.speech_rate ?? 210) >= 180 && (report.analysis?.speech_rate ?? 210) <= 220 ? 'good' : 'warning'
                },
                { 
                  label: '积极反馈次数', 
                  val: `${report.analysis?.positive_feedback_count ?? 3} 次`, 
                  target: '≥5次', 
                  status: (report.analysis?.positive_feedback_count ?? 3) >= 5 ? 'good' : 'warning'
                },
              ].map((stat, i) => (
                <div key={i} className="p-6 rounded-2xl border border-gray-100 bg-gray-50/50">
                  <div className="text-sm font-bold text-gray-700 mb-4">{stat.label}</div>
                  <div className="text-3xl font-black text-gray-900 mb-1">{stat.val}</div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-400 font-medium">参考标准: {stat.target}</span>
                    <div className={cn(
                      "px-2 py-0.5 rounded-full text-[10px] font-black uppercase",
                      stat.status === 'good' ? "bg-green-100 text-green-700" : "bg-orange-100 text-orange-700"
                    )}>
                      {stat.status === 'good' ? '优秀' : '待提升'}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* 改进建议 */}
            {report.analysis?.suggestions && report.analysis.suggestions.length > 0 && (
              <div className="space-y-6">
                <h4 className="text-lg font-bold text-gray-900 flex items-center space-x-2">
                  <span>🎯 改进建议</span>
                </h4>
                {report.analysis.suggestions.map((suggestion: any, idx: number) => (
                  <div key={idx} className="p-6 rounded-2xl bg-blue-50/50 border border-blue-100">
                    <h5 className="font-bold text-blue-900 mb-2">{idx + 1}. {suggestion.title}</h5>
                    {suggestion.current_performance && (
                      <p className="text-sm text-blue-800/80 mb-2">
                        <strong>当前表现：</strong>{suggestion.current_performance}
                      </p>
                    )}
                    {suggestion.advice && (
                      <p className="text-sm text-blue-800/80 mb-2">
                        <strong>具体建议：</strong>{suggestion.advice}
                      </p>
                    )}
                    {suggestion.example && (
                      <div className="bg-white rounded-xl p-4 border border-blue-100 mt-3">
                        <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest block mb-2">话术示例</span>
                        <p className="text-sm text-gray-700 italic">"{suggestion.example}"</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </>
  );
}

