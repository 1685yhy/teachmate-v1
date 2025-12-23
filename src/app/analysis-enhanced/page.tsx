"use client";

import React, { useState } from 'react';
import { 
  Upload, 
  FileAudio, 
  Video,
  ChevronRight, 
  ChevronDown,
  ChevronUp,
  Loader2, 
  CheckCircle2, 
  AlertCircle,
  BarChart2,
  Clock,
  MessageSquare,
  ArrowLeft,
  Download,
  Trophy,
  TrendingUp,
  Users,
  Target,
  Award,
  History
} from 'lucide-react';
import Link from 'next/link';
import { Header } from '@/components/Header';
import { cn } from '@/lib/utils';

type Step = 'upload' | 'info' | 'processing' | 'result';

export default function EnhancedAnalysisPage() {
  const [step, setStep] = useState<Step>('upload');
  const [file, setFile] = useState<File | null>(null);
  const [progress, setProgress] = useState(0);
  const [analysisResult, setAnalysisResult] = useState<any>(null);
  const [historyRecords, setHistoryRecords] = useState<any[]>([]);
  const [expandedSuggestions, setExpandedSuggestions] = useState<Record<number, boolean>>({});
  const [manualTranscript, setManualTranscript] = useState('');
  const [useManualTranscript, setUseManualTranscript] = useState(false);

  // 加载历史记录（仅在客户端）
  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      const history = JSON.parse(localStorage.getItem('analysis_history') || '[]').filter((item: any) => item.enhanced);
      setHistoryRecords(history);
    }
  }, []);

  const toggleSuggestion = (idx: number) => {
    setExpandedSuggestions(prev => ({
      ...prev,
      [idx]: !prev[idx]
    }));
  };
  const [fileType, setFileType] = useState<'audio' | 'video'>('audio');

  const [subject, setSubject] = useState('');
  const [grade, setGrade] = useState('');

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      const isVideo = selectedFile.type.startsWith('video/');
      setFileType(isVideo ? 'video' : 'audio');
      setStep('info');
    }
  };

  const startAnalysis = async () => {
    if (!file) return;
    
    // 如果使用手动输入，需要验证文本长度
    if (useManualTranscript && (!manualTranscript || manualTranscript.trim().length < 50)) {
      alert('请输入至少50字的课堂实录文本，以便AI进行准确分析');
      return;
    }
    
    setStep('processing');
    setProgress(10);

    const formData = new FormData();
    formData.append('file', file);
    formData.append('subject', subject);
    formData.append('grade', grade);
    formData.append('enhanced', 'true'); // 启用增强模式
    if (useManualTranscript && manualTranscript.trim()) {
      formData.append('manualTranscript', manualTranscript.trim());
    }

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
        enhanced: true,
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
      <Header title="AI课堂观察与诊断引擎（V1.5增强版）" />
      <main className="flex-1 overflow-y-auto p-8">
        <div className="max-w-6xl mx-auto">
          {/* Step Progress */}
          <div className="flex items-center justify-between mb-12">
            {[
              { id: 'upload', label: '上传文件', icon: Upload },
              { id: 'info', label: '基本信息', icon: FileAudio },
              { id: 'result', label: '深度分析', icon: BarChart2 },
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

          <div className="bg-white rounded-3xl border border-gray-100 shadow-xl overflow-hidden min-h-[600px] flex flex-col">
            {step === 'upload' && (
              <div className="flex-1 flex flex-col items-center justify-center p-12 text-center">
                <div className="flex items-center space-x-4 mb-6">
                  <div className="w-24 h-24 bg-blue-50 text-blue-600 rounded-3xl flex items-center justify-center">
                    <Upload size={48} />
                  </div>
                  <div className="w-24 h-24 bg-purple-50 text-purple-600 rounded-3xl flex items-center justify-center">
                    <Video size={48} />
                  </div>
                </div>
                <h3 className="text-2xl font-black text-gray-900 mb-2">上传课堂录音或视频</h3>
                <p className="text-gray-500 mb-8 max-w-sm">
                  支持音频（MP3, M4A, WAV）和视频（MP4, MOV）格式<br />
                  文件大小不超过 500MB
                </p>
                <label className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-2xl font-bold cursor-pointer transition-all hover:scale-105 active:scale-95 shadow-lg shadow-blue-100">
                  选择文件
                  <input type="file" className="hidden" accept="audio/*,video/*" onChange={handleFileUpload} />
                </label>
              </div>
            )}

            {step === 'info' && (
              <div className="p-12">
                <div className="mb-8 flex items-center space-x-4 p-4 bg-gray-50 rounded-2xl">
                  <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-blue-600 shadow-sm">
                    {fileType === 'video' ? <Video size={24} /> : <FileAudio size={24} />}
                  </div>
                  <div className="flex-1 overflow-hidden">
                    <div className="font-bold text-gray-900 truncate">{file?.name}</div>
                    <div className="text-xs text-gray-400">
                      {fileType === 'video' ? '视频文件' : '音频文件'} · 
                      {(file?.size || 0) / 1024 / 1024 > 1 
                        ? `${((file?.size || 0) / 1024 / 1024).toFixed(1)} MB` 
                        : `${((file?.size || 0) / 1024).toFixed(1)} KB`}
                    </div>
                  </div>
                  <button onClick={() => setStep('upload')} className="text-sm font-bold text-red-500 hover:text-red-600">重选</button>
                </div>

                {/* 手动输入课堂实录选项 */}
                <div className="mb-6 p-4 bg-blue-50 rounded-xl border border-blue-200">
                  <div className="flex items-center space-x-3 mb-3">
                    <input
                      type="checkbox"
                      id="useManualTranscript"
                      checked={useManualTranscript}
                      onChange={(e) => setUseManualTranscript(e.target.checked)}
                      className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                    />
                    <label htmlFor="useManualTranscript" className="text-sm font-bold text-gray-900 cursor-pointer">
                      ✨ 手动输入课堂实录（推荐，可获得更准确的分析）
                    </label>
                  </div>
                  {useManualTranscript && (
                    <div className="mt-3">
                      <textarea
                        value={manualTranscript}
                        onChange={(e) => setManualTranscript(e.target.value)}
                        placeholder="请粘贴或输入课堂实录文本，例如：&#10;老师：同学们好！今天我们要学习一元一次方程...&#10;学生：老师，什么是方程？&#10;老师：好问题！方程就是含有未知数的等式...&#10;&#10;（输入完整的课堂对话内容，AI 将基于实际内容进行深度分析）"
                        className="w-full bg-white border border-blue-200 rounded-xl px-4 py-3 text-sm min-h-[200px] focus:ring-2 focus:ring-blue-100 outline-none resize-none"
                      />
                      <p className="text-xs text-gray-500 mt-2">
                        💡 提示：输入至少50字的课堂对话内容，AI 将基于实际内容进行深度分析，而不是使用模拟数据
                      </p>
                    </div>
                  )}
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
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white py-4 rounded-2xl font-black text-lg transition-all shadow-lg shadow-blue-100 hover:scale-[1.02] active:scale-[0.98]"
                >
                  🚀 开始12维深度分析
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
                  正在识别教学亮点、分析12维教学行为指标、生成对比分析...这通常需要 3-5 分钟，请稍候。
                </p>
                <div className="w-full max-w-md bg-gray-100 h-2 rounded-full mt-8 overflow-hidden">
                  <div className="bg-gradient-to-r from-blue-600 to-purple-600 h-full transition-all duration-300" style={{ width: `${progress}%` }} />
                </div>
              </div>
            )}

            {step === 'result' && analysisResult?.analysis && (
              <div className="flex-1 flex flex-col p-8 overflow-y-auto">
                <div className="flex items-center justify-between mb-8">
                  <div>
                    <h3 className="text-2xl font-black text-gray-900">深度分析报告</h3>
                    <p className="text-sm text-gray-400">生成时间：{new Date(analysisResult.meta?.date || Date.now()).toLocaleString()}</p>
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
                {analysisResult.analysis.highlights && analysisResult.analysis.highlights.length > 0 && (
                  <div className="mb-8 p-6 rounded-2xl bg-gradient-to-br from-yellow-50 to-orange-50 border-2 border-yellow-200">
                    <div className="flex items-center space-x-2 mb-4">
                      <Trophy className="text-yellow-600" size={24} />
                      <h4 className="text-xl font-black text-gray-900">🏆 三大亮点</h4>
                    </div>
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

                {/* 改进建议 - 优先展示 */}
                {analysisResult.analysis.suggestions && analysisResult.analysis.suggestions.length > 0 && (
                  <div className="mb-8">
                    <h4 className="text-xl font-black text-gray-900 flex items-center space-x-2 mb-6">
                      <Target className="text-blue-600" size={24} />
                      <span>🎯 改进建议（优先关注）</span>
                    </h4>
                    <div className="space-y-4">
                      {analysisResult.analysis.suggestions.map((suggestion: any, idx: number) => {
                        const isExpanded = expandedSuggestions[idx] || false;
                        const hasDetails = suggestion.current_performance_details && Array.isArray(suggestion.current_performance_details) && suggestion.current_performance_details.length > 0;
                        
                        return (
                          <div key={idx} className="p-6 rounded-2xl bg-blue-50/50 border-2 border-blue-200">
                            <h5 className="text-lg font-black text-blue-900 mb-3">{idx + 1}. {suggestion.title}</h5>
                            
                            {/* 当前表现 - 可展开查看明细 */}
                            {suggestion.current_performance && (
                              <div className="mb-3">
                                <button
                                  onClick={() => toggleSuggestion(idx)}
                                  className="w-full flex items-center justify-between text-left p-3 bg-white rounded-xl border border-blue-200 hover:bg-blue-50 transition-colors group"
                                >
                                  <div className="flex items-center space-x-2 flex-1">
                                    <span className="text-sm font-bold text-blue-900">当前表现：</span>
                                    <span className="text-sm text-blue-800/90 flex-1">{suggestion.current_performance}</span>
                                  </div>
                                  {hasDetails && (
                                    <div className="flex items-center space-x-2 text-blue-600 ml-3 flex-shrink-0">
                                      <span className="text-xs font-bold">{isExpanded ? '收起明细' : '查看明细'}</span>
                                      {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                                    </div>
                                  )}
                                </button>
                                
                                {/* 当前表现明细 - 展开状态 */}
                                {isExpanded && hasDetails && (
                                  <div className="mt-3 p-4 bg-white rounded-xl border border-blue-200">
                                    <div className="text-xs font-black text-blue-600 uppercase tracking-widest mb-3">📊 当前表现明细</div>
                                    <div className="space-y-3">
                                      {suggestion.current_performance_details.map((detail: any, detailIdx: number) => (
                                        <div key={detailIdx} className="flex items-start space-x-3">
                                          <div className="w-1.5 h-1.5 bg-blue-400 rounded-full mt-1.5 flex-shrink-0"></div>
                                          <div className="flex-1">
                                            {typeof detail === 'string' ? (
                                              <p className="text-sm text-gray-700 leading-relaxed">{detail}</p>
                                            ) : (
                                              <>
                                                {detail.label && (
                                                  <p className="text-sm font-bold text-gray-900 mb-1">{detail.label}</p>
                                                )}
                                                {detail.value && (
                                                  <p className="text-sm text-gray-700 leading-relaxed">{detail.value}</p>
                                                )}
                                                {detail.observation && (
                                                  <p className="text-xs text-gray-600 mt-1 italic">观察：{detail.observation}</p>
                                                )}
                                              </>
                                            )}
                                          </div>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                )}
                              </div>
                            )}
                            
                            {suggestion.advice && (
                              <p className="text-sm text-blue-800/90 mb-3 leading-relaxed">
                                <strong className="text-blue-900">具体建议：</strong>{suggestion.advice}
                              </p>
                            )}
                            {suggestion.example && (
                              <div className="bg-white rounded-xl p-4 border-2 border-blue-200 mt-3 mb-3">
                                <span className="text-xs font-black text-blue-600 uppercase tracking-widest block mb-2">💬 话术示例</span>
                                <p className="text-sm text-gray-800 italic leading-relaxed">"{suggestion.example}"</p>
                              </div>
                            )}
                            {suggestion.expected_effect && (
                              <p className="text-sm text-blue-700/80 mt-2 mb-1">
                                <strong>预期效果：</strong>{suggestion.expected_effect}
                              </p>
                            )}
                            {suggestion.training_method && (
                              <p className="text-sm text-blue-700/80 mt-1">
                                <strong>训练方法：</strong>{suggestion.training_method}
                              </p>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* 12维关键数据 - 用于量化衡量 */}
                {analysisResult.analysis.metrics && (
                  <div className="mb-8">
                    <h4 className="text-lg font-bold text-gray-900 flex items-center space-x-2 mb-4">
                      <BarChart2 className="text-gray-600" size={20} />
                      <span>📊 量化指标（用于衡量改进效果）</span>
                    </h4>
                    <p className="text-sm text-gray-500 mb-4">以下指标可以帮助您量化评估改进建议的实施效果</p>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {[
                        { key: 'open_question_ratio', label: '开放式问题比例', format: (v: number) => `${(v * 100).toFixed(0)}%`, target: '≥25%', desc: '衡量提问质量' },
                        { key: 'speech_rate', label: '教师语速', format: (v: number) => `${v}字/分`, target: '180-220', desc: '衡量表达节奏' },
                        { key: 'positive_feedback_count', label: '积极反馈次数', format: (v: number) => `${v}次`, target: '≥5次', desc: '衡量鼓励频率' },
                        { key: 'wait_time_avg', label: '平均等待时间', format: (v: number) => `${v}秒`, target: '≥3秒', desc: '衡量思考时间' },
                        { key: 'student_activity_time', label: '学生活动时间', format: (v: number) => `${(v * 100).toFixed(0)}%`, target: '≥40%', desc: '衡量参与度' },
                        { key: 'board_design_score', label: '板书设计', format: (v: number) => `${v}/5`, target: '≥4.0', desc: '衡量板书质量' },
                        { key: 'multimedia_usage_score', label: '多媒体使用', format: (v: number) => `${v}/5`, target: '≥3.5', desc: '衡量媒体运用' },
                        { key: 'interaction_frequency', label: '互动频率', format: (v: number) => `${v}次`, target: '≥10次', desc: '衡量互动次数' },
                        { key: 'concept_clarity', label: '概念清晰度', format: (v: number) => `${v}/5`, target: '≥4.0', desc: '衡量讲解清晰' },
                        { key: 'pace_control', label: '节奏掌控', format: (v: number) => `${v}/5`, target: '≥3.5', desc: '衡量时间管理' },
                        { key: 'classroom_atmosphere', label: '课堂氛围', format: (v: number) => `${v}/5`, target: '≥4.0', desc: '衡量氛围营造' },
                        { key: 'differentiation_level', label: '差异化程度', format: (v: number) => `${v}/5`, target: '≥3.5', desc: '衡量因材施教' },
                      ].map((metric) => {
                        const value = analysisResult.analysis.metrics[metric.key];
                        return (
                          <div key={metric.key} className="p-4 rounded-xl border border-gray-200 bg-white hover:shadow-md transition-shadow">
                            <div className="text-xs font-bold text-gray-600 mb-1">{metric.label}</div>
                            <div className="text-xl font-black text-gray-900 mb-1">{metric.format(value)}</div>
                            <div className="text-[10px] text-gray-400 mb-1">参考: {metric.target}</div>
                            <div className="text-[10px] text-gray-500 italic">{metric.desc}</div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* 对比分析 */}
                {analysisResult.analysis.comparison && (
                  <div className="mb-8 p-6 rounded-2xl bg-purple-50/50 border border-purple-100">
                    <h4 className="text-lg font-bold text-gray-900 flex items-center space-x-2 mb-4">
                      <Users className="text-purple-600" size={20} />
                      <span>📈 对比分析</span>
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="bg-white p-4 rounded-xl">
                        <div className="text-xs font-bold text-gray-500 mb-2">您的数据</div>
                        <div className="space-y-1 text-sm">
                          <div>开放式问题：{(analysisResult.analysis.metrics?.open_question_ratio * 100).toFixed(0)}%</div>
                          <div>语速：{analysisResult.analysis.metrics?.speech_rate}字/分</div>
                          <div>反馈次数：{analysisResult.analysis.metrics?.positive_feedback_count}次</div>
                        </div>
                      </div>
                      <div className="bg-white p-4 rounded-xl">
                        <div className="text-xs font-bold text-gray-500 mb-2">同行平均</div>
                        <div className="space-y-1 text-sm">
                          <div>开放式问题：{(analysisResult.analysis.comparison.peer_average?.open_question_ratio * 100).toFixed(0)}%</div>
                          <div>语速：{analysisResult.analysis.comparison.peer_average?.speech_rate}字/分</div>
                          <div>反馈次数：{analysisResult.analysis.comparison.peer_average?.positive_feedback_count}次</div>
                        </div>
                      </div>
                      <div className="bg-white p-4 rounded-xl">
                        <div className="text-xs font-bold text-gray-500 mb-2">优秀教师</div>
                        <div className="space-y-1 text-sm">
                          <div>开放式问题：{(analysisResult.analysis.comparison.excellent_teacher?.open_question_ratio * 100).toFixed(0)}%</div>
                          <div>语速：{analysisResult.analysis.comparison.excellent_teacher?.speech_rate}字/分</div>
                          <div>反馈次数：{analysisResult.analysis.comparison.excellent_teacher?.positive_feedback_count}次</div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* 成长目标 */}
                {analysisResult.analysis.growth_targets && analysisResult.analysis.growth_targets.length > 0 && (
                  <div className="p-6 rounded-2xl bg-green-50/50 border border-green-100">
                    <h4 className="text-lg font-bold text-gray-900 flex items-center space-x-2 mb-4">
                      <TrendingUp className="text-green-600" size={20} />
                      <span>🎯 成长目标（下周）</span>
                    </h4>
                    <div className="space-y-3">
                      {analysisResult.analysis.growth_targets.map((target: any, idx: number) => (
                        <div key={idx} className="bg-white p-4 rounded-xl flex items-center justify-between">
                          <div>
                            <div className="font-bold text-gray-900">{target.metric === 'open_question_ratio' ? '开放式问题比例' : target.metric}</div>
                            <div className="text-sm text-gray-500">
                              当前：{target.current} → 目标：{target.target}
                            </div>
                          </div>
                          <div className="text-xs font-bold text-green-600 bg-green-100 px-3 py-1 rounded-full">
                            {target.timeline}
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
                <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center text-purple-600">
                  <History size={24} />
                </div>
                <div>
                  <h3 className="text-lg font-black text-gray-900">深度分析历史记录</h3>
                  <p className="text-sm text-gray-500">查看和管理之前的深度分析报告</p>
                </div>
              </div>
              <Link 
                href="/analysis/history"
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
                    href={`/report/${item.id}`}
                    className="p-4 bg-gray-50 rounded-xl border border-gray-200 hover:border-purple-300 hover:bg-purple-50 transition-all group"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold text-gray-500 uppercase">{item.meta?.subject || '通用'}</span>
                      <span className="px-2 py-0.5 bg-purple-100 text-purple-700 text-xs font-bold rounded-full">V1.5</span>
                    </div>
                    <div className="text-sm font-bold text-gray-900 mb-1">{item.meta?.grade || '未定年级'}</div>
                    <div className="text-xs text-gray-500">{new Date(item.meta?.date || Date.now()).toLocaleDateString()}</div>
                  </Link>
                ))
              ) : (
                <div className="col-span-3 text-center py-8 text-gray-400">
                  <History className="mx-auto mb-2 opacity-50" size={32} />
                  <p className="text-sm">暂无深度分析记录</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </>
  );
}

