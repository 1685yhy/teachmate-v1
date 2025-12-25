"use client";

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import ReactMarkdown from 'react-markdown';
import { saveAs } from 'file-saver';
import { Document, Packer, Paragraph, TextRun, HeadingLevel } from 'docx';
import { 
  FilePlus, 
  Sparkles, 
  Copy, 
  FileDown, 
  Check, 
  ChevronRight,
  BookOpen,
  Target,
  Clock,
  Layout,
  Pencil,
  AlertCircle,
  FileText
} from 'lucide-react';
import { Header } from '@/components/Header';
import { cn } from '@/lib/utils';

function LessonPlanContent() {
  const searchParams = useSearchParams();
  const historyId = searchParams.get('history');
  
  const [isGenerating, setIsGenerating] = useState(false);
  const [isGenerated, setIsGenerated] = useState(false);
  const [copied, setCopied] = useState(false);
  const [content, setContent] = useState('');
  const [historyRecords, setHistoryRecords] = useState<any[]>([]);

  // 加载历史记录（仅在客户端）
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const history = JSON.parse(localStorage.getItem('lesson_plans') || '[]');
      setHistoryRecords(history);
    }
  }, []);
  
  // 从历史记录加载
  useEffect(() => {
    if (historyId) {
      const plans = JSON.parse(localStorage.getItem('lesson_plans') || '[]');
      const plan = plans.find((p: any) => p.id === historyId);
      if (plan) {
        setContent(plan.content);
        setIsGenerated(true);
        // 设置表单值
        const themeInput = document.querySelector('input[placeholder*="课题"]') as HTMLInputElement;
        const subjectSelect = document.querySelector('select') as HTMLSelectElement;
        if (themeInput) themeInput.value = plan.theme || '';
        if (subjectSelect) subjectSelect.value = plan.subject || '';
      }
    }
  }, [historyId]);

  // Form states
  const [subject, setSubject] = useState('math');
  const [otherSubject, setOtherSubject] = useState('');
  const [grade, setGrade] = useState('middle');
  const [theme, setTheme] = useState('');
  const [duration, setDuration] = useState('45');

  const handleGenerate = async () => {
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
        }),
      });
      const data = await response.json();
      if (data.error) throw new Error(data.error);
      setContent(data.content);
      setIsGenerated(true);

      // Save to history
      const history = JSON.parse(localStorage.getItem('lesson_plans') || '[]');
      const newPlan = {
        id: Date.now().toString(),
        theme,
        subject: subject === 'other' ? otherSubject : subject,
        grade,
        duration,
        content: data.content,
        version: data.version || 'standard',
        metadata: data.metadata,
        date: new Date().toISOString(),
      };
      const updatedHistory = [newPlan, ...history].slice(0, 20);
      localStorage.setItem('lesson_plans', JSON.stringify(updatedHistory));
    } catch (error) {
      console.error(error);
      alert('生成教案失败，请检查 API 配置');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = async () => {
    // 创建一个简单的 Word 文档逻辑
    const doc = new Document({
      sections: [{
        properties: {},
        children: [
          new Paragraph({
            text: `${theme || '教学主题'}教案`,
            heading: HeadingLevel.HEADING_1,
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: `生成时间：${new Date().toLocaleString()}`,
                italics: true,
                size: 20,
              }),
            ],
          }),
          ...content.split('\n').map(line => {
            if (line.startsWith('# ')) return new Paragraph({ text: line.replace('# ', ''), heading: HeadingLevel.HEADING_1, spacing: { before: 400 } });
            if (line.startsWith('## ')) return new Paragraph({ text: line.replace('## ', ''), heading: HeadingLevel.HEADING_2, spacing: { before: 300 } });
            if (line.startsWith('### ')) return new Paragraph({ text: line.replace('### ', ''), heading: HeadingLevel.HEADING_3, spacing: { before: 200 } });
            return new Paragraph({
              children: [new TextRun(line)],
              spacing: { before: 100 }
            });
          })
        ],
      }],
    });

    const blob = await Packer.toBlob(doc);
    saveAs(blob, `${theme || '教案'}.docx`);
  };

  return (
    <>
      <Header title="智能教案生成" />
      <main className="flex-1 overflow-y-auto p-8">
        <div className="max-w-6xl mx-auto flex flex-col lg:flex-row gap-8">
          {/* Form Side */}
          <div className="w-full lg:w-1/3 space-y-8">
            <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-xl">
              <div className="flex items-center space-x-3 mb-8">
                <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center">
                  <FilePlus size={20} />
                </div>
                <h3 className="text-xl font-black text-gray-900">教案参数</h3>
              </div>

              <div className="space-y-6">
                {/* Subject */}
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
                    <div className="col-span-2 mt-1">
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
                  </div>
                </div>

                {/* Grade */}
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

                {/* Theme */}
                <div className="space-y-3">
                  <label className="text-sm font-bold text-gray-700 ml-1">教学主题</label>
                  <input 
                    type="text" 
                    placeholder="例如：一元一次方程" 
                    className="w-full bg-gray-50 border-none rounded-xl px-4 py-3 text-sm font-bold text-gray-900 focus:ring-2 focus:ring-blue-100 outline-none"
                    value={theme}
                    onChange={(e) => setTheme(e.target.value)}
                  />
                  <p className="text-[10px] text-gray-400 ml-1 font-bold uppercase tracking-widest">限制 2-50 个字符</p>
                </div>

                {/* Duration */}
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

                <button 
                  onClick={handleGenerate}
                  disabled={!theme || isGenerating}
                  className={cn(
                    "w-full py-4 rounded-2xl font-black text-lg transition-all flex items-center justify-center space-x-2 shadow-lg",
                    !theme || isGenerating 
                      ? "bg-gray-100 text-gray-400 cursor-not-allowed shadow-none" 
                      : "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-blue-100 hover:scale-[1.02] active:scale-[0.98]"
                  )}
                >
                  {isGenerating ? (
                    <>
                      <Sparkles className="animate-pulse" size={20} />
                      <span>正在构建教案...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles size={20} />
                      <span>生成教案</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            <div className="bg-blue-50 p-6 rounded-3xl border border-blue-100">
              <h4 className="text-sm font-black text-blue-900 mb-2 flex items-center space-x-2">
                <BookOpen size={16} />
                <span>生成提示</span>
              </h4>
              <p className="text-xs text-blue-800/70 leading-relaxed font-medium">
                AI 将根据您提供的主题、学科和年级，自动生成包含教学目标、重难点、详细过程、板书及作业的完整教案。
              </p>
            </div>
          </div>

          {/* Preview Side */}
          <div className="flex-1 min-h-[600px] bg-white rounded-3xl border border-gray-100 shadow-xl overflow-hidden flex flex-col relative">
            {!isGenerated && !isGenerating ? (
              <div className="flex-1 flex flex-col items-center justify-center p-12 text-center text-gray-300">
                <Layout size={64} strokeWidth={1} className="mb-4" />
                <p className="font-bold">填写左侧信息并点击生成</p>
              </div>
            ) : isGenerating ? (
              <div className="flex-1 flex flex-col items-center justify-center p-12 text-center">
                <div className="relative mb-8">
                  <div className="w-24 h-24 bg-blue-50 rounded-full animate-ping absolute inset-0"></div>
                  <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center relative">
                    <Sparkles className="text-blue-600" size={40} />
                  </div>
                </div>
                <h4 className="text-xl font-black text-gray-900 mb-2">正在通过 AI 创作您的教案</h4>
                <p className="text-sm text-gray-400 max-w-xs mx-auto">
                  TeachMate 正在根据教学大纲和最佳实践为您定制内容...
                </p>
              </div>
            ) : (
              <>
                <div className="h-16 border-b border-gray-50 flex items-center justify-between px-8 bg-gray-50/50">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-xs font-black text-gray-500 uppercase tracking-widest">教案预览</span>
                  </div>
                  <div className="flex items-center space-x-4">
                    <button 
                      onClick={handleCopy}
                      className="text-gray-500 hover:text-blue-600 transition-colors flex items-center space-x-1"
                    >
                      {copied ? <Check size={16} className="text-green-500" /> : <Copy size={16} />}
                      <span className="text-xs font-bold">{copied ? '已复制' : '复制全文'}</span>
                    </button>
                    <button 
                      onClick={handleDownload}
                      className="flex items-center space-x-1 bg-gray-900 text-white px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-gray-800 transition-colors shadow-lg shadow-gray-200"
                    >
                      <FileDown size={16} />
                      <span>导出 Word</span>
                    </button>
                  </div>
                </div>
                <div className="flex-1 overflow-y-auto p-12 bg-white">
                  <article className="max-w-3xl mx-auto prose prose-blue prose-sm markdown-container">
                    <ReactMarkdown>{content}</ReactMarkdown>
                  </article>
                </div>
              </>
            )}
          </div>
        </div>

        {/* 历史记录板块 */}
        <div className="mt-12 bg-white rounded-3xl border border-gray-100 shadow-xl p-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center text-green-600">
                <FileText size={24} />
              </div>
              <div>
                <h3 className="text-lg font-black text-gray-900">教案历史记录</h3>
                <p className="text-sm text-gray-500">查看和管理之前生成的教案</p>
              </div>
            </div>
            <Link 
              href="/lesson-plan/history"
              className="flex items-center space-x-2 text-green-600 hover:text-green-700 font-bold transition-colors"
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
                  href={`/lesson-plan?history=${item.id}`}
                  className="p-4 bg-gray-50 rounded-xl border border-gray-200 hover:border-green-300 hover:bg-green-50 transition-all group"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-gray-500 uppercase">{item.subject || '通用'}</span>
                    <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs font-bold rounded-full">{item.version || '标准版'}</span>
                  </div>
                  <div className="text-sm font-bold text-gray-900 mb-1 line-clamp-1">{item.theme || '教案'}</div>
                  <div className="text-xs text-gray-500">{new Date(item.date || Date.now()).toLocaleDateString()}</div>
                </Link>
              ))
            ) : (
              <div className="col-span-3 text-center py-8 text-gray-400">
                <FileText className="mx-auto mb-2 opacity-50" size={32} />
                <p className="text-sm">暂无教案记录</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </>
  );
}

export default function LessonPlanPage() {
  return (
    <Suspense fallback={
      <>
        <Header title="智能教案生成" />
        <main className="flex-1 overflow-y-auto p-8">
          <div className="max-w-6xl mx-auto flex items-center justify-center h-96">
            <div className="text-center">
              <div className="text-2xl font-black text-gray-400 mb-4">加载中...</div>
            </div>
          </div>
        </main>
      </>
    }>
      <LessonPlanContent />
    </Suspense>
  );
}

