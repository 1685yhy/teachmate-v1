"use client";

import React, { useEffect, useState } from 'react';
import { 
  BarChart3, 
  FileText, 
  History, 
  Mic, 
  PieChart, 
  TrendingUp,
  ChevronRight,
  GitCompare
} from 'lucide-react';
import { Header } from '@/components/Header';
import Link from 'next/link';
import { cn } from '@/lib/utils';

export default function Dashboard() {
  const [analysisHistory, setAnalysisHistory] = useState<any[]>([]);
  const [lessonPlans, setLessonPlans] = useState<any[]>([]);
  const [comparisons, setComparisons] = useState<any[]>([]);

  useEffect(() => {
    const analysis = JSON.parse(localStorage.getItem('analysis_history') || '[]');
    const plans = JSON.parse(localStorage.getItem('lesson_plans') || '[]');
    const comps = JSON.parse(localStorage.getItem('lesson_plan_comparisons') || '[]');
    setAnalysisHistory(analysis);
    setLessonPlans(plans);
    setComparisons(comps);
  }, []);

  const stats = {
    analysisCount: analysisHistory.length,
    planCount: lessonPlans.length,
    avgRatio: analysisHistory.length > 0 
      ? (analysisHistory.reduce((acc, curr) => acc + curr.analysis.open_question_ratio, 0) / analysisHistory.length * 100).toFixed(0) + '%'
      : '0%',
    avgFeedback: analysisHistory.length > 0
      ? (analysisHistory.reduce((acc, curr) => acc + curr.analysis.positive_feedback_count, 0) / analysisHistory.length).toFixed(1)
      : '0',
  };

  return (
    <>
      <Header title="工作台概览" />
      <main className="flex-1 overflow-y-auto p-8">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h2 className="text-3xl font-bold text-gray-900">欢迎回来，李老师！ 👋</h2>
              <p className="text-gray-500 mt-2">这是您本周的教学成长概览，继续保持！</p>
            </div>
            <button 
              onClick={() => {
                const mockAnalysis = [
                  {
                    id: "test-1",
                    meta: { subject: "数学", grade: "七年级", date: new Date().toISOString() },
                    analysis: {
                      open_question_ratio: 0.15,
                      speech_rate: 210,
                      positive_feedback_count: 3,
                      suggestions: [
                        { title: "增加开放式提问", current_performance: "总共12个问题中仅有2个是开放式。", advice: "尝试在讲授新知环节增加'为什么'类提问。", example: "如果是你，你会如何设计这个方程的解法？" },
                        { title: "提升积极反馈质量", current_performance: "反馈多为'嗯'、'好'，缺乏描述性鼓励。", advice: "尝试针对学生的具体思考过程进行表扬。", example: "你观察到了常数项的正负号变化，非常细心！" }
                      ]
                    }
                  },
                  {
                    id: "test-2",
                    meta: { subject: "语文", grade: "八年级", date: new Date(Date.now() - 86400000).toISOString() },
                    analysis: {
                      open_question_ratio: 0.28,
                      speech_rate: 185,
                      positive_feedback_count: 7,
                      suggestions: [
                        { title: "深化文本解读引导", current_performance: "互动频繁，但问题深度有待加强。", advice: "引导学生从修辞手法深入到作者情感。", example: "这个比喻句除了生动，还传达了作者当时怎样的矛盾心理？" }
                      ]
                    }
                  }
                ];
                const mockPlans = [
                  {
                    id: "plan-1",
                    theme: "一元一次方程",
                    subject: "数学",
                    grade: "初中",
                    content: "# 一元一次方程教案\n\n## 一、教学目标\n1. 理解方程的定义...\n2. 掌握解方程的基本步骤...\n\n## 二、教学重难点\n**重点**：移项法则的运用。\n**难点**：去括号时的符号变化。",
                    date: new Date().toISOString()
                  }
                ];
                localStorage.setItem('analysis_history', JSON.stringify(mockAnalysis));
                localStorage.setItem('lesson_plans', JSON.stringify(mockPlans));
                window.location.reload();
              }}
              className="bg-white text-gray-600 px-4 py-2 rounded-xl text-xs font-bold border border-gray-200 hover:bg-gray-50 hover:border-gray-300 transition-all shadow-sm flex items-center space-x-2"
            >
              <span>✨ 导入示例数据</span>
            </button>
          </div>

          {/* Stats Cards */}
          <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {[
              { label: '累计分析课时', value: stats.analysisCount + ' 节', icon: Mic, color: 'text-blue-600', bg: 'bg-blue-100' },
              { label: '累计生成教案', value: stats.planCount + ' 份', icon: FileText, color: 'text-green-600', bg: 'bg-green-100' },
              { label: '平均开放式问题', value: stats.avgRatio, icon: PieChart, color: 'text-purple-600', bg: 'bg-purple-100' },
              { label: '平均积极反馈', value: stats.avgFeedback + ' 次', icon: TrendingUp, color: 'text-orange-600', bg: 'bg-orange-100' },
            ].map((stat, i) => (
              <div key={i} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-4">
                  <div className={`p-2 rounded-xl ${stat.bg} ${stat.color}`}>
                    <stat.icon size={20} />
                  </div>
                  <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">{stat.label}</span>
                </div>
                <div className="text-3xl font-black text-gray-900">{stat.value}</div>
              </div>
            ))}
          </section>

          {/* Trend & History */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Chart Area */}
            <div className="lg:col-span-2 bg-white p-8 rounded-2xl border border-gray-100 shadow-sm">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h3 className="text-lg font-bold text-gray-800">开放式问题比例趋势</h3>
                  <p className="text-sm text-gray-400">最近 5 次课堂数据分析</p>
                </div>
                <div className="flex items-center space-x-2 text-sm font-medium text-green-600 bg-green-50 px-3 py-1 rounded-full">
                  <TrendingUp size={14} />
                  <span>+12% 较上周</span>
                </div>
              </div>
              <div className="h-64 flex items-end space-x-6 pb-4">
                {(analysisHistory.slice(0, 5).reverse().length > 0 ? analysisHistory.slice(0, 5).reverse() : [
                  { meta: { date: '01.11' }, analysis: { open_question_ratio: 0.45 } },
                  { meta: { date: '01.13' }, analysis: { open_question_ratio: 0.55 } },
                  { meta: { date: '01.15' }, analysis: { open_question_ratio: 0.40 } },
                  { meta: { date: '01.17' }, analysis: { open_question_ratio: 0.60 } },
                  { meta: { date: '01.19' }, analysis: { open_question_ratio: 0.50 } },
                ]).map((item, i) => (
                  <div key={i} className="flex-1 flex flex-col items-center group">
                    <div className="w-full relative">
                      <div 
                        className={cn(
                          "w-full rounded-t-xl transition-all duration-500 bg-blue-100 group-hover:bg-blue-200",
                          i === (analysisHistory.length > 0 ? analysisHistory.length - 1 : 2) && "bg-blue-600 shadow-lg shadow-blue-200"
                        )} 
                        style={{ height: `${item.analysis.open_question_ratio * 100}%` }}
                      >
                        <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                          {(item.analysis.open_question_ratio * 100).toFixed(0)}%
                        </div>
                      </div>
                    </div>
                    <span className="text-xs font-bold text-gray-400 mt-4">
                      {item.meta.date.includes('-') ? new Date(item.meta.date).toLocaleDateString(undefined, { month: '2-digit', day: '2-digit' }) : item.meta.date}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent History */}
            <div className="space-y-6">
              {/* 分析记录 */}
              <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-bold text-gray-800">最近分析记录</h3>
                  <Link href="/analysis" className="text-blue-600 text-sm font-bold hover:text-blue-700 transition-colors">查看全部</Link>
                </div>
                <div className="space-y-4">
                  {analysisHistory.length > 0 ? (
                    analysisHistory.slice(0, 3).map((item, index) => (
                    <Link 
                      key={index} 
                      href={`/report/${item.id}`}
                      className="flex items-center justify-between group cursor-pointer p-2 -m-2 rounded-xl hover:bg-gray-50 transition-colors"
                      prefetch={false}
                    >
                        <div className="flex items-center space-x-4">
                          <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center bg-blue-100 text-blue-600")}>
                            <History size={20} />
                          </div>
                          <div>
                            <div className="text-sm font-bold text-gray-800">{item.meta?.subject || '通用'} ({item.meta?.grade || '未定'})</div>
                            <div className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">
                              {new Date(item.meta?.date || Date.now()).toLocaleDateString()} · 开放式 {((item.analysis?.open_question_ratio ?? 0) * 100).toFixed(0)}%
                              {item.enhanced && <span className="ml-2 text-purple-500">V1.5</span>}
                            </div>
                          </div>
                        </div>
                        <ChevronRight size={18} className="text-gray-300 group-hover:text-blue-600 group-hover:translate-x-1 transition-all" />
                      </Link>
                    ))
                  ) : (
                    <div className="text-center py-4 text-gray-400 text-sm italic">暂无记录</div>
                  )}
                </div>
              </div>

              {/* 教案记录 */}
              <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-bold text-gray-800">最近教案</h3>
                  <Link href="/lesson-plan" className="text-green-600 text-sm font-bold hover:text-green-700 transition-colors">查看全部</Link>
                </div>
                <div className="space-y-4">
                  {lessonPlans.length > 0 ? (
                    lessonPlans.slice(0, 3).map((item, index) => (
                      <Link 
                        key={index} 
                        href={`/lesson-plan?history=${item.id}`}
                        className="flex items-center justify-between group cursor-pointer p-2 -m-2 rounded-xl hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex items-center space-x-4">
                          <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center bg-green-100 text-green-600")}>
                            <FileText size={20} />
                          </div>
                          <div>
                            <div className="text-sm font-bold text-gray-800">{item.theme || '教案'}</div>
                            <div className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">
                              {new Date(item.date || Date.now()).toLocaleDateString()} · {item.version || '标准版'}
                            </div>
                          </div>
                        </div>
                        <ChevronRight size={18} className="text-gray-300 group-hover:text-green-600 group-hover:translate-x-1 transition-all" />
                      </Link>
                    ))
                  ) : (
                    <div className="text-center py-4 text-gray-400 text-sm italic">暂无记录</div>
                  )}
                </div>
              </div>

              {/* 多版本对比记录 */}
              <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-bold text-gray-800">版本对比</h3>
                  <Link href="/lesson-plan-comparison" className="text-purple-600 text-sm font-bold hover:text-purple-700 transition-colors">查看全部</Link>
                </div>
                <div className="space-y-4">
                  {comparisons.length > 0 ? (
                    comparisons.slice(0, 3).map((item, index) => (
                      <Link 
                        key={index} 
                        href={`/lesson-plan-comparison?history=${item.id}`}
                        className="flex items-center justify-between group cursor-pointer p-2 -m-2 rounded-xl hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex items-center space-x-4">
                          <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center bg-purple-100 text-purple-600")}>
                            <GitCompare size={20} />
                          </div>
                          <div>
                            <div className="text-sm font-bold text-gray-800">{item.theme || '对比'}</div>
                            <div className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">
                              {new Date(item.date || Date.now()).toLocaleDateString()} · {item.versions?.length || 0}个版本
                            </div>
                          </div>
                        </div>
                        <ChevronRight size={18} className="text-gray-300 group-hover:text-purple-600 group-hover:translate-x-1 transition-all" />
                      </Link>
                    ))
                  ) : (
                    <div className="text-center py-4 text-gray-400 text-sm italic">暂无记录</div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
