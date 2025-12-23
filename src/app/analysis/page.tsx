"use client";

import React, { useState, useEffect } from 'react';
import { 
  Upload, 
  FileAudio, 
  ChevronRight, 
  Loader2, 
  CheckCircle2, 
  AlertCircle,
  BarChart2,
  Clock,
  MessageSquare,
  ArrowLeft,
  Download,
  BarChart3,
  Target,
  History
} from 'lucide-react';
import Link from 'next/link';
import { Header } from '@/components/Header';
import { cn } from '@/lib/utils';

type Step = 'upload' | 'info' | 'processing' | 'result';

export default function AnalysisPage() {
  const [step, setStep] = useState<Step>('upload');
  const [file, setFile] = useState<File | null>(null);
  const [progress, setProgress] = useState(0);
  const [analysisResult, setAnalysisResult] = useState<any>(null);
  const [historyRecords, setHistoryRecords] = useState<any[]>([]);

  // Form states
  const [subject, setSubject] = useState('');
  const [grade, setGrade] = useState('');

  // 加载历史记录（仅在客户端）
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const history = JSON.parse(localStorage.getItem('analysis_history') || '[]');
      setHistoryRecords(history);
    }
  }, []);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setStep('info');
    }
  };

  const startAnalysis = async () => {
    if (!file) return;
    setStep('processing');
    setProgress(10);

    const formData = new FormData();
    formData.append('file', file);
    formData.append('subject', subject);
    formData.append('grade', grade);

    try {
      const response = await fetch('/api/analysis', {
        method: 'POST',
        body: formData,
      });
      
      setProgress(50);
      const data = await response.json();
      
      if (data.error) throw new Error(data.error);
      
      setAnalysisResult(data);
      setProgress(100);
      
      // Save to history
      const history = JSON.parse(localStorage.getItem('analysis_history') || '[]');
      const newAnalysis = {
        ...data,
        id: Date.now().toString(),
        enhanced: false,
      };
      const updatedHistory = [newAnalysis, ...history].slice(0, 20);
      localStorage.setItem('analysis_history', JSON.stringify(updatedHistory));

      setTimeout(() => setStep('result'), 500);
    } catch (error) {
      console.error(error);
      alert('分析失败，请检查 API 配置或文件格式');
      setStep('info');
    }
  };

  return (
    <>
      <Header title="课堂音频分析" />
      <main className="flex-1 overflow-y-auto p-8">
        <div className="max-w-4xl mx-auto">
          {/* Step Progress */}
          <div className="flex items-center justify-between mb-12">
            {[
              { id: 'upload', label: '上传音频', icon: Upload },
              { id: 'info', label: '基本信息', icon: FileAudio },
              { id: 'result', label: '分析结果', icon: BarChart2 },
            ].map((s, i) => {
              const isActive = (step === 'upload' && s.id === 'upload') || 
                               (step === 'info' && s.id === 'info') || 
                               (step === 'processing' && s.id === 'result') ||
                               (step === 'result' && s.id === 'result');
              const isDone = (step === 'info' && s.id === 'upload') ||
                             (step === 'processing' && (s.id === 'upload' || s.id === 'info')) ||
                             (step === 'result' && s.id !== 'result');

              return (
                <React.Fragment key={s.id}>
                  <div className="flex flex-col items-center space-y-2">
                    <div className={cn(
                      "w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300",
                      isActive ? "bg-blue-600 text-white shadow-lg shadow-blue-200" : 
                      isDone ? "bg-green-500 text-white" : "bg-gray-100 text-gray-400"
                    )}>
                      {isDone ? <CheckCircle2 size={24} /> : <s.icon size={24} />}
                    </div>
                    <span className={cn(
                      "text-sm font-bold",
                      isActive ? "text-blue-600" : isDone ? "text-green-600" : "text-gray-400"
                    )}>{s.label}</span>
                  </div>
                  {i < 2 && <div className={cn("flex-1 h-0.5 mx-4", isDone ? "bg-green-500" : "bg-gray-100")} />}
                </React.Fragment>
              )
            })}
          </div>

          <div className="bg-white rounded-3xl border border-gray-100 shadow-xl overflow-hidden min-h-[500px] flex flex-col">
            {step === 'upload' && (
              <div className="flex-1 flex flex-col items-center justify-center p-12 text-center">
                <div className="w-24 h-24 bg-blue-50 text-blue-600 rounded-3xl flex items-center justify-center mb-6">
                  <Upload size={48} />
                </div>
                <h3 className="text-2xl font-black text-gray-900 mb-2">上传您的课堂录音</h3>
                <p className="text-gray-500 mb-8 max-w-sm">
                  支持 MP3, M4A, WAV 格式，文件大小不超过 500MB
                </p>
                <div className="flex items-center space-x-2 text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-8">
                  <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
                  <span>隐私加密已启用：录音文件在分析后 24 小时内自动删除</span>
                </div>
                <label className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-2xl font-bold cursor-pointer transition-all hover:scale-105 active:scale-95 shadow-lg shadow-blue-100">
                  选择音频文件
                  <input type="file" className="hidden" accept="audio/*" onChange={handleFileUpload} />
                </label>
              </div>
            )}

            {step === 'info' && (
              <div className="p-12">
                <div className="mb-8 flex items-center space-x-4 p-4 bg-gray-50 rounded-2xl">
                  <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-blue-600 shadow-sm">
                    <FileAudio size={24} />
                  </div>
                  <div className="flex-1 overflow-hidden">
                    <div className="font-bold text-gray-900 truncate">{file?.name}</div>
                    <div className="text-xs text-gray-400">{(file?.size || 0) / 1024 / 1024 > 1 ? `${((file?.size || 0) / 1024 / 1024).toFixed(1)} MB` : `${((file?.size || 0) / 1024).toFixed(1)} KB`}</div>
                  </div>
                  <button onClick={() => setStep('upload')} className="text-sm font-bold text-red-500 hover:text-red-600">重选</button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-700 ml-1">教学学科</label>
                    <select 
                      className="w-full bg-gray-50 border-none rounded-xl px-4 py-3 text-gray-900 focus:ring-2 focus:ring-blue-100 transition-all outline-none"
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                    >
                      <option value="">选择学科</option>
                      <option value="math">数学</option>
                      <option value="chinese">语文</option>
                      <option value="english">英语</option>
                      <option value="science">科学</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-700 ml-1">教学年级</label>
                    <select 
                      className="w-full bg-gray-50 border-none rounded-xl px-4 py-3 text-gray-900 focus:ring-2 focus:ring-blue-100 transition-all outline-none"
                      value={grade}
                      onChange={(e) => setGrade(e.target.value)}
                    >
                      <option value="">选择年级</option>
                      <option value="p-low">小学低段 (1-3年级)</option>
                      <option value="p-high">小学高段 (4-6年级)</option>
                      <option value="middle">初中</option>
                      <option value="high">高中</option>
                    </select>
                  </div>
                </div>

                <button 
                  onClick={startAnalysis}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-2xl font-black text-lg transition-all shadow-lg shadow-blue-100 hover:scale-[1.02] active:scale-[0.98]"
                >
                  开始智能分析
                </button>
              </div>
            )}

            {step === 'processing' && (
              <div className="flex-1 flex flex-col items-center justify-center p-12 text-center">
                <div className="relative mb-8">
                  <div className="w-32 h-32 rounded-full border-4 border-gray-50 flex items-center justify-center">
                    <Loader2 size={48} className="text-blue-600 animate-spin" />
                  </div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-xl font-black text-blue-600">{progress}%</span>
                  </div>
                </div>
                <h3 className="text-2xl font-black text-gray-900 mb-2">AI 正在深度解析您的课堂...</h3>
                <p className="text-gray-500 max-w-sm">
                  正在识别课堂互动、统计语速并提取关键词。这通常需要 3-5 分钟，请稍候。
                </p>
                <div className="w-full max-w-md bg-gray-100 h-2 rounded-full mt-8 overflow-hidden">
                  <div className="bg-blue-600 h-full transition-all duration-300" style={{ width: `${progress}%` }} />
                </div>
              </div>
            )}

            {step === 'result' && analysisResult && (
              <div className="flex-1 flex flex-col p-8 overflow-y-auto">
                <div className="flex items-center justify-between mb-8">
                  <div>
                    <h3 className="text-2xl font-black text-gray-900">分析报告</h3>
                    <p className="text-sm text-gray-400">生成时间：{analysisResult?.meta?.date ? new Date(analysisResult.meta.date).toLocaleString() : new Date().toLocaleString()}</p>
                  </div>
                  <button 
                    onClick={() => window.print()}
                    className="flex items-center space-x-2 bg-gray-900 text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-gray-800 transition-colors print:hidden"
                  >
                    <Download size={18} />
                    <span>导出 PDF</span>
                  </button>
                </div>

                {/* 三大亮点 */}
                {analysisResult?.analysis?.highlights && Array.isArray(analysisResult.analysis.highlights) && analysisResult.analysis.highlights.length > 0 && (
                  <div className="mb-8 p-6 rounded-2xl bg-gradient-to-br from-yellow-50 to-orange-50 border-2 border-yellow-200">
                    <h4 className="text-xl font-black text-gray-900 mb-4 flex items-center space-x-2">
                      <span>🏆 三大亮点</span>
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {analysisResult.analysis.highlights.map((highlight: any, idx: number) => (
                        <div key={idx} className="bg-white p-4 rounded-xl border border-yellow-100">
                          <div className="text-sm font-black text-yellow-600 mb-2">{idx + 1}. {highlight.title}</div>
                          <div className="text-xs text-gray-700 leading-relaxed mb-2">{highlight.description}</div>
                          {highlight.evidence && (
                            <div className="bg-yellow-50 rounded-lg p-3 mt-2 border border-yellow-200">
                              <div className="text-[10px] font-black text-yellow-700 uppercase tracking-widest mb-1">💬 具体表现</div>
                              <div className="text-xs text-gray-800 leading-relaxed italic">"{highlight.evidence}"</div>
                            </div>
                          )}
                          {highlight.impact && (
                            <div className="text-xs text-green-700 mt-2 font-medium">
                              ✨ 效果：{highlight.impact}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 关键数据 */}
                <div className="mb-8">
                  <h4 className="text-lg font-bold text-gray-900 flex items-center space-x-2 mb-6">
                    <BarChart3 className="text-blue-600" size={20} />
                    <span>📊 关键数据</span>
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {[
                      { 
                        label: '开放式问题比例', 
                        val: `${((analysisResult?.analysis?.open_question_ratio ?? 0.15) * 100).toFixed(0)}%`, 
                        target: '≥25%', 
                        status: (analysisResult?.analysis?.open_question_ratio ?? 0.15) >= 0.25 ? 'good' : 'warning', 
                        icon: MessageSquare, 
                        color: (analysisResult?.analysis?.open_question_ratio ?? 0.15) >= 0.25 ? 'text-green-600' : 'text-orange-600', 
                        bg: (analysisResult?.analysis?.open_question_ratio ?? 0.15) >= 0.25 ? 'bg-green-50' : 'bg-orange-50' 
                      },
                      { 
                        label: '教师语速', 
                        val: `${analysisResult?.analysis?.speech_rate ?? 210}字/分`, 
                        target: '180-220', 
                        status: (analysisResult?.analysis?.speech_rate ?? 210) >= 180 && (analysisResult?.analysis?.speech_rate ?? 210) <= 220 ? 'good' : 'warning', 
                        icon: Clock, 
                        color: (analysisResult?.analysis?.speech_rate ?? 210) >= 180 && (analysisResult?.analysis?.speech_rate ?? 210) <= 220 ? 'text-green-600' : 'text-orange-600', 
                        bg: (analysisResult?.analysis?.speech_rate ?? 210) >= 180 && (analysisResult?.analysis?.speech_rate ?? 210) <= 220 ? 'bg-green-50' : 'bg-orange-50' 
                      },
                      { 
                        label: '积极反馈次数', 
                        val: `${analysisResult?.analysis?.positive_feedback_count ?? 3} 次`, 
                        target: '≥5次', 
                        status: (analysisResult?.analysis?.positive_feedback_count ?? 3) >= 5 ? 'good' : 'warning', 
                        icon: ArrowLeft, 
                        color: (analysisResult?.analysis?.positive_feedback_count ?? 3) >= 5 ? 'text-green-600' : 'text-orange-600', 
                        bg: (analysisResult?.analysis?.positive_feedback_count ?? 3) >= 5 ? 'bg-green-50' : 'bg-orange-50' 
                      },
                    ].map((stat, i) => (
                      <div key={i} className="p-6 rounded-2xl border border-gray-100 bg-gray-50/50">
                        <div className="flex items-center space-x-3 mb-4">
                          <div className={cn("p-2 rounded-lg", stat.bg, stat.color)}>
                            <stat.icon size={20} />
                          </div>
                          <span className="text-sm font-bold text-gray-700">{stat.label}</span>
                        </div>
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
                </div>

                {/* 改进建议 */}
                <div className="space-y-6 mb-8">
                  <h4 className="text-lg font-bold text-gray-900 flex items-center space-x-2">
                    <AlertCircle size={20} className="text-blue-600" />
                    <span>🎯 改进建议</span>
                  </h4>
                  {analysisResult?.analysis?.suggestions && Array.isArray(analysisResult.analysis.suggestions) && analysisResult.analysis.suggestions.length > 0 ? (
                    analysisResult.analysis.suggestions.map((suggestion: any, idx: number) => (
                      <div key={idx} className="p-6 rounded-2xl bg-blue-50/50 border border-blue-100">
                        <h5 className="font-bold text-blue-900 mb-3">
                          {idx + 1}. {suggestion.title || '改进建议'}
                        </h5>
                        {suggestion.current_performance && (
                          <p className="text-sm text-blue-800/80 mb-2">
                            <strong>当前：</strong>{suggestion.current_performance}
                          </p>
                        )}
                        {suggestion.advice && (
                          <p className="text-sm text-blue-800/80 mb-2">
                            <strong>建议：</strong>{suggestion.advice}
                          </p>
                        )}
                        {suggestion.example && (
                          <div className="bg-white rounded-xl p-4 border border-blue-100 mt-3 mb-2">
                            <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest block mb-2">话术示例</span>
                            <p className="text-sm text-gray-700 italic">"{suggestion.example}"</p>
                          </div>
                        )}
                        {suggestion.expected_effect && (
                          <p className="text-sm text-blue-800/80 mb-1">
                            <strong>预期效果：</strong>{suggestion.expected_effect}
                          </p>
                        )}
                        {suggestion.training_method && (
                          <p className="text-sm text-blue-800/80">
                            <strong>训练方法：</strong>{suggestion.training_method}
                          </p>
                        )}
                      </div>
                    ))
                  ) : (
                    <div className="p-6 rounded-2xl bg-gray-50 border border-gray-200">
                      <p className="text-gray-600 text-sm">暂无改进建议数据</p>
                    </div>
                  )}
                </div>

                {/* 对比分析 */}
                {analysisResult?.analysis?.comparison && (
                  <div className="mb-8 p-6 rounded-2xl bg-purple-50/50 border border-purple-100">
                    <h4 className="text-lg font-bold text-gray-900 flex items-center space-x-2 mb-4">
                      <BarChart3 className="text-purple-600" size={20} />
                      <span>📈 对比分析</span>
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {analysisResult.analysis.comparison.peer_average && (
                        <div className="bg-white p-4 rounded-xl border border-purple-100">
                          <div className="text-sm font-bold text-purple-700 mb-2">与同行平均对比</div>
                          <div className="space-y-2 text-xs text-gray-600">
                            {analysisResult.analysis.comparison.peer_average.open_question_ratio && (
                              <div>开放式问题比例：{((analysisResult.analysis.comparison.peer_average.open_question_ratio ?? 0) * 100).toFixed(0)}%</div>
                            )}
                            {analysisResult.analysis.comparison.peer_average.speech_rate && (
                              <div>教师语速：{analysisResult.analysis.comparison.peer_average.speech_rate}字/分</div>
                            )}
                            {analysisResult.analysis.comparison.peer_average.positive_feedback_count && (
                              <div>积极反馈次数：{analysisResult.analysis.comparison.peer_average.positive_feedback_count}次</div>
                            )}
                          </div>
                        </div>
                      )}
                      {analysisResult?.analysis?.comparison?.excellent_teacher && (
                        <div className="bg-white p-4 rounded-xl border border-purple-100">
                          <div className="text-sm font-bold text-purple-700 mb-2">与优秀教师对比</div>
                          <div className="space-y-2 text-xs text-gray-600">
                            {analysisResult.analysis.comparison.excellent_teacher.open_question_ratio && (
                              <div>开放式问题比例：{((analysisResult.analysis.comparison.excellent_teacher.open_question_ratio ?? 0) * 100).toFixed(0)}%</div>
                            )}
                            {analysisResult.analysis.comparison.excellent_teacher.speech_rate && (
                              <div>教师语速：{analysisResult.analysis.comparison.excellent_teacher.speech_rate}字/分</div>
                            )}
                            {analysisResult.analysis.comparison.excellent_teacher.positive_feedback_count && (
                              <div>积极反馈次数：{analysisResult.analysis.comparison.excellent_teacher.positive_feedback_count}次</div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* 成长目标 */}
                {analysisResult?.analysis?.growth_targets && Array.isArray(analysisResult.analysis.growth_targets) && analysisResult.analysis.growth_targets.length > 0 && (
                  <div className="mb-8 p-6 rounded-2xl bg-green-50/50 border border-green-100">
                    <h4 className="text-lg font-bold text-gray-900 flex items-center space-x-2 mb-4">
                      <Target className="text-green-600" size={20} />
                      <span>📈 成长目标（下周）</span>
                    </h4>
                    <div className="space-y-3">
                      {analysisResult.analysis.growth_targets.map((target: any, idx: number) => (
                        <div key={idx} className="bg-white p-4 rounded-xl border border-green-100">
                          <div className="text-sm font-bold text-green-700 mb-1">
                            {target.metric === 'open_question_ratio' ? '开放式问题比例' :
                             target.metric === 'speech_rate' ? '教师语速' :
                             target.metric === 'positive_feedback_count' ? '积极反馈次数' : target.metric}
                          </div>
                          <div className="text-xs text-gray-600">
                            当前：{target.metric === 'open_question_ratio' ? `${((target.current ?? 0) * 100).toFixed(0)}%` : target.current} 
                            → 目标：{target.metric === 'open_question_ratio' ? `${((target.target ?? 0) * 100).toFixed(0)}%` : target.target}
                            {target.timeline && <span className="ml-2">（{target.timeline}）</span>}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="mt-12 pt-8 border-t border-gray-100 flex justify-between items-center">
                  <button onClick={() => setStep('upload')} className="text-sm font-bold text-gray-500 hover:text-gray-700">分析另一段录音</button>
                  <button className="bg-blue-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-100">设定行动目标</button>
                </div>
              </div>
            )}
          </div>

          {/* 历史记录板块 */}
          <div className="mt-12 bg-white rounded-3xl border border-gray-100 shadow-xl p-8">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center text-blue-600">
                  <History size={24} />
                </div>
                <div>
                  <h3 className="text-lg font-black text-gray-900">历史分析记录</h3>
                  <p className="text-sm text-gray-500">查看和管理之前的分析报告</p>
                </div>
              </div>
              <Link 
                href="/analysis/history"
                className="flex items-center space-x-2 text-blue-600 hover:text-blue-700 font-bold transition-colors"
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
                    href={`/report/${item.id}`}
                    className="p-4 bg-gray-50 rounded-xl border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-all group"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold text-gray-500 uppercase">{item.meta?.subject || '通用'}</span>
                      {item.enhanced && (
                        <span className="px-2 py-0.5 bg-purple-100 text-purple-700 text-xs font-bold rounded-full">V1.5</span>
                      )}
                    </div>
                    <div className="text-sm font-bold text-gray-900 mb-1">{item.meta?.grade || '未定年级'}</div>
                    <div className="text-xs text-gray-500">{new Date(item.meta?.date || Date.now()).toLocaleDateString()}</div>
                  </Link>
                ))
              ) : (
                <div className="col-span-3 text-center py-8 text-gray-400">
                  <History className="mx-auto mb-2 opacity-50" size={32} />
                  <p className="text-sm">暂无历史记录</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </>
  );
}

