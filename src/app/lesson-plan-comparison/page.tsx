"use client";

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import ReactMarkdown from 'react-markdown';
import { 
  FilePlus, 
  Sparkles, 
  Copy, 
  FileDown, 
  Check, 
  BookOpen,
  Target,
  Clock,
  Layout,
  GitCompare,
  CheckCircle2,
  XCircle,
  ChevronRight
} from 'lucide-react';
import Link from 'next/link';
import { Header } from '@/components/Header';
import { cn } from '@/lib/utils';

function LessonPlanComparisonContent() {
  const searchParams = useSearchParams();
  const historyId = searchParams.get('history');
  
  const [isGenerating, setIsGenerating] = useState(false);
  const [versions, setVersions] = useState<any[]>([]);
  const [selectedVersion, setSelectedVersion] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [historyRecords, setHistoryRecords] = useState<any[]>([]);

  // 加载历史记录（仅在客户端）
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const history = JSON.parse(localStorage.getItem('lesson_plan_comparisons') || '[]');
      setHistoryRecords(history);
    }
  }, []);
  
  // 从历史记录加载
  useEffect(() => {
    if (historyId) {
      const comparisons = JSON.parse(localStorage.getItem('lesson_plan_comparisons') || '[]');
      const comparison = comparisons.find((c: any) => c.id === historyId);
      if (comparison && comparison.versions) {
        setVersions(comparison.versions);
        if (comparison.versions.length > 0) {
          setSelectedVersion(comparison.versions[0].version);
        }
        setIsGenerating(true);
      }
    }
  }, [historyId]);

  const [subject, setSubject] = useState('math');
  const [otherSubject, setOtherSubject] = useState('');
  const [grade, setGrade] = useState('middle');
  const [theme, setTheme] = useState('');
  const [duration, setDuration] = useState('45');
  const [studentLevel, setStudentLevel] = useState('');
  const [teachingStyle, setTeachingStyle] = useState('');

  const handleGenerateMultiVersion = async () => {
    if (!theme) return;
    setIsGenerating(true);
    try {
      const response = await fetch('/api/lesson-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subject: subject === 'other' ? otherSubject : subject,
          grade,
          theme,
          duration,
          studentLevel,
          teachingStyle,
          multiVersion: true, // 启用多版本生成
        }),
      });
      const data = await response.json();
      if (data.error) throw new Error(data.error);
      setVersions(data.versions || []);
      if (data.versions && data.versions.length > 0) {
        setSelectedVersion(data.versions[0].version);
        
        // Save to history
        const history = JSON.parse(localStorage.getItem('lesson_plan_comparisons') || '[]');
        const newComparison = {
          id: Date.now().toString(),
          theme,
          subject: subject === 'other' ? otherSubject : subject,
          grade,
          duration,
          versions: data.versions,
          date: new Date().toISOString(),
        };
        const updatedHistory = [newComparison, ...history].slice(0, 10);
        localStorage.setItem('lesson_plan_comparisons', JSON.stringify(updatedHistory));
      }
    } catch (error) {
      console.error(error);
      alert('生成教案失败，请检查 API 配置');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = (content: string) => {
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const versionConfig = {
    '标准版': { color: 'blue', icon: CheckCircle2, desc: '符合常规教学要求，结构严谨' },
    '创新版': { color: 'purple', icon: Sparkles, desc: '融入最新教学理念，活动新颖' },
    '简约版': { color: 'green', icon: Target, desc: '核心环节突出，适合经验丰富教师' },
  };

  return (
    <>
      <Header title="多版本教案生成与对比（V1.5）" />
      <main className="flex-1 overflow-y-auto p-8">
        <div className="max-w-7xl mx-auto">
          {/* 表单区域 */}
          <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-xl mb-8">
            <div className="flex items-center space-x-3 mb-8">
              <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center">
                <FilePlus size={20} />
              </div>
              <h3 className="text-xl font-black text-gray-900">教案参数</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div className="space-y-3">
                <label className="text-sm font-bold text-gray-700 ml-1">学科</label>
                <div className="grid grid-cols-2 gap-2">
                  {['math', 'chinese', 'english', 'science'].map((s) => (
                    <button
                      key={s}
                      onClick={() => setSubject(s)}
                      className={cn(
                        "px-4 py-2 rounded-xl text-sm font-bold transition-all border-2",
                        subject === s 
                          ? "bg-blue-600 border-blue-600 text-white" 
                          : "bg-white border-gray-100 text-gray-400 hover:border-blue-100"
                      )}
                    >
                      {s === 'math' ? '数学' : s === 'chinese' ? '语文' : s === 'english' ? '英语' : '科学'}
                    </button>
                  ))}
                </div>
                <input 
                  type="text" 
                  placeholder="其他学科..." 
                  className="w-full bg-gray-50 border-none rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-blue-100 outline-none"
                  value={otherSubject}
                  onChange={(e) => {
                    setOtherSubject(e.target.value);
                    setSubject('other');
                  }}
                />
              </div>

              <div className="space-y-3">
                <label className="text-sm font-bold text-gray-700 ml-1">年级</label>
                <select 
                  className="w-full bg-gray-50 border-none rounded-xl px-4 py-3 text-sm font-bold text-gray-900 focus:ring-2 focus:ring-blue-100 transition-all outline-none"
                  value={grade}
                  onChange={(e) => setGrade(e.target.value)}
                >
                  <option value="p-low">小学低段 (1-3年级)</option>
                  <option value="p-high">小学高段 (4-6年级)</option>
                  <option value="middle">初中</option>
                  <option value="high">高中</option>
                </select>
              </div>

              <div className="space-y-3">
                <label className="text-sm font-bold text-gray-700 ml-1">教学主题</label>
                <input 
                  type="text" 
                  placeholder="例如：一元一次方程" 
                  className="w-full bg-gray-50 border-none rounded-xl px-4 py-3 text-sm font-bold text-gray-900 focus:ring-2 focus:ring-blue-100 outline-none"
                  value={theme}
                  onChange={(e) => setTheme(e.target.value)}
                />
              </div>

              <div className="space-y-3">
                <label className="text-sm font-bold text-gray-700 ml-1">课时</label>
                <div className="flex space-x-2">
                  {['40', '45', '90'].map((d) => (
                    <button
                      key={d}
                      onClick={() => setDuration(d)}
                      className={cn(
                        "flex-1 py-2 rounded-xl text-xs font-bold transition-all border-2",
                        duration === d 
                          ? "bg-blue-600 border-blue-600 text-white" 
                          : "bg-white border-gray-100 text-gray-400 hover:border-blue-100"
                      )}
                    >
                      {d} 分钟
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-sm font-bold text-gray-700 ml-1">学情分析（可选）</label>
                <input 
                  type="text" 
                  placeholder="例如：学生已有基础、班级特点" 
                  className="w-full bg-gray-50 border-none rounded-xl px-4 py-3 text-sm font-bold text-gray-900 focus:ring-2 focus:ring-blue-100 outline-none"
                  value={studentLevel}
                  onChange={(e) => setStudentLevel(e.target.value)}
                />
              </div>

              <div className="space-y-3">
                <label className="text-sm font-bold text-gray-700 ml-1">教学风格偏好（可选）</label>
                <select 
                  className="w-full bg-gray-50 border-none rounded-xl px-4 py-3 text-sm font-bold text-gray-900 focus:ring-2 focus:ring-blue-100 transition-all outline-none"
                  value={teachingStyle}
                  onChange={(e) => setTeachingStyle(e.target.value)}
                >
                  <option value="">选择风格</option>
                  <option value="讲授型">讲授型</option>
                  <option value="探究型">探究型</option>
                  <option value="活动型">活动型</option>
                  <option value="混合型">混合型</option>
                </select>
              </div>
            </div>

            <button 
              onClick={handleGenerateMultiVersion}
              disabled={!theme || isGenerating}
              className={cn(
                "w-full py-4 rounded-2xl font-black text-lg transition-all flex items-center justify-center space-x-2 shadow-lg",
                !theme || isGenerating 
                  ? "bg-gray-100 text-gray-400 cursor-not-allowed shadow-none" 
                  : "bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 text-white shadow-blue-100 hover:scale-[1.02] active:scale-[0.98]"
              )}
            >
              {isGenerating ? (
                <>
                  <Sparkles className="animate-pulse" size={20} />
                  <span>正在生成三个版本...</span>
                </>
              ) : (
                <>
                  <GitCompare size={20} />
                  <span>生成多版本教案并对比</span>
                </>
              )}
            </button>
          </div>

          {/* 对比视图 */}
          {versions.length > 0 && (
            <div className="mb-8">
              <h3 className="text-xl font-black text-gray-900 mb-6">📊 版本对比</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {versions.map((version) => {
                  const config = versionConfig[version.version as keyof typeof versionConfig] || versionConfig['标准版'];
                  const isSelected = selectedVersion === version.version;
                  return (
                    <div 
                      key={version.version}
                      className={cn(
                        "bg-white rounded-2xl border-2 p-6 cursor-pointer transition-all",
                        isSelected 
                          ? `border-${config.color}-600 shadow-lg` 
                          : "border-gray-100 hover:border-gray-200"
                      )}
                      onClick={() => setSelectedVersion(version.version)}
                    >
                      <div className="flex items-center justify-between mb-4">
                        <div className={cn("flex items-center space-x-2", `text-${config.color}-600`)}>
                          <config.icon size={20} />
                          <span className="font-black">{version.version}</span>
                        </div>
                        {isSelected && <CheckCircle2 className="text-blue-600" size={20} />}
                      </div>
                      <p className="text-xs text-gray-500 mb-4">{config.desc}</p>
                      {version.metadata && (
                        <div className="text-xs text-gray-400 space-y-1">
                          <div>• {version.metadata.style}</div>
                          <div>• 时间：{version.metadata.duration}分钟</div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* 教案预览 */}
          {versions.length > 0 && selectedVersion && (
            <div className="bg-white rounded-3xl border border-gray-100 shadow-xl overflow-hidden flex flex-col min-h-[600px]">
              <div className="h-16 border-b border-gray-50 flex items-center justify-between px-8 bg-gray-50/50">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-xs font-black text-gray-500 uppercase tracking-widest">教案预览 - {selectedVersion}</span>
                </div>
                <div className="flex items-center space-x-4">
                  <button 
                    onClick={() => handleCopy(versions.find(v => v.version === selectedVersion)?.content || '')}
                    className="text-gray-500 hover:text-blue-600 transition-colors flex items-center space-x-1"
                  >
                    {copied ? <Check size={16} className="text-green-500" /> : <Copy size={16} />}
                    <span className="text-xs font-bold">{copied ? '已复制' : '复制全文'}</span>
                  </button>
                  <button className="flex items-center space-x-1 bg-gray-900 text-white px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-gray-800 transition-colors shadow-lg shadow-gray-200">
                    <FileDown size={16} />
                    <span>导出 Word</span>
                  </button>
                </div>
              </div>
              <div className="flex-1 overflow-y-auto p-12 bg-white">
                <article className="max-w-3xl mx-auto prose prose-blue prose-sm markdown-container">
                  <ReactMarkdown>
                    {versions.find(v => v.version === selectedVersion)?.content || ''}
                  </ReactMarkdown>
                </article>
              </div>
            </div>
          )}

          {versions.length === 0 && !isGenerating && (
            <div className="bg-white rounded-3xl border border-gray-100 shadow-xl p-12 text-center text-gray-300">
              <Layout size={64} strokeWidth={1} className="mb-4 mx-auto" />
              <p className="font-bold">填写上方信息并点击生成，将同时生成三个版本的教案</p>
            </div>
          )}
        </div>

        {/* 历史记录板块 */}
        <div className="mt-12 bg-white rounded-3xl border border-gray-100 shadow-xl p-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center text-purple-600">
                <GitCompare size={24} />
              </div>
              <div>
                <h3 className="text-lg font-black text-gray-900">版本对比历史记录</h3>
                <p className="text-sm text-gray-500">查看和管理之前的多版本对比</p>
              </div>
            </div>
            <Link 
              href="/lesson-plan-comparison/history"
              className="flex items-center space-x-2 text-purple-600 hover:text-purple-700 font-bold transition-colors"
            >
              <span>查看全部</span>
              <ChevronRight size={18} />
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {historyRecords.length > 0 ? (
              historyRecords.slice(0, 3).map((item: any, index: number) => (
                <Link
                  key={index}
                  href={`/lesson-plan-comparison?history=${item.id}`}
                  className="p-4 bg-gray-50 rounded-xl border border-gray-200 hover:border-purple-300 hover:bg-purple-50 transition-all group"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-gray-500 uppercase">{item.subject || '通用'}</span>
                    <span className="px-2 py-0.5 bg-purple-100 text-purple-700 text-xs font-bold rounded-full">{item.versions?.length || 0}个版本</span>
                  </div>
                  <div className="text-sm font-bold text-gray-900 mb-1 line-clamp-1">{item.theme || '对比'}</div>
                  <div className="text-xs text-gray-500">{new Date(item.date || Date.now()).toLocaleDateString()}</div>
                </Link>
              ))
            ) : (
              <div className="col-span-3 text-center py-8 text-gray-400">
                <GitCompare className="mx-auto mb-2 opacity-50" size={32} />
                <p className="text-sm">暂无对比记录</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </>
  );
}

export default function LessonPlanComparisonPage() {
  return (
    <Suspense fallback={
      <>
        <Header title="多版本教案生成与对比（V1.5）" />
        <main className="flex-1 overflow-y-auto p-8">
          <div className="max-w-7xl mx-auto flex items-center justify-center h-96">
            <div className="text-center">
              <div className="text-2xl font-black text-gray-400 mb-4">加载中...</div>
            </div>
          </div>
        </main>
      </>
    }>
      <LessonPlanComparisonContent />
    </Suspense>
  );
}

