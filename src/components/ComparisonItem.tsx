"use client";

import React, { useState } from 'react';
import { MessageSquare, Download, Share2, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ComparisonItemProps {
  comparison: any;
  onUpdate: (updated: any) => void;
}

export function ComparisonItem({ comparison, onUpdate }: ComparisonItemProps) {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [teacher1Plan, setTeacher1Plan] = useState(comparison.teacher1Plan || '');
  const [teacher2Plan, setTeacher2Plan] = useState(comparison.teacher2Plan || '');

  const handleAnalyze = async () => {
    if (!teacher1Plan.trim() || !teacher2Plan.trim()) {
      alert('请两位教师分别上传教案内容');
      return;
    }
    
    setIsAnalyzing(true);
    try {
      const response = await fetch('/api/collaboration/compare', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          teacher1Plan: teacher1Plan.trim(),
          teacher2Plan: teacher2Plan.trim(),
          theme: comparison.theme,
          subject: comparison.subject,
          grade: comparison.grade
        })
      });
      
      const data = await response.json();
      if (data.error) throw new Error(data.error);
      
      // 更新对比数据
      const updatedComparison = {
        ...comparison,
        teacher1Plan: teacher1Plan.trim(),
        teacher2Plan: teacher2Plan.trim(),
        comparisons: data.analysis.comparisons || [],
        aiAnalysis: {
          teacher1: data.analysis.teacher1,
          teacher2: data.analysis.teacher2,
          suggestion: data.analysis.suggestion
        },
        status: 'analyzed'
      };
      
      // 更新本地存储
      const history = JSON.parse(localStorage.getItem('comparison_history') || '[]');
      const updatedHistory = history.map((c: any) => c.id === comparison.id ? updatedComparison : c);
      localStorage.setItem('comparison_history', JSON.stringify(updatedHistory));
      
      onUpdate(updatedComparison);
      alert('✅ AI对比分析完成！');
    } catch (error: any) {
      alert('❌ 分析失败：' + error.message);
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="bg-white rounded-3xl border border-gray-100 shadow-xl p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-2xl font-black text-gray-900 mb-2">
            《{comparison.theme}》同课异构分析
          </h3>
          <div className="flex items-center space-x-4 text-sm text-gray-500">
            <span>{comparison.subject} · {comparison.grade}</span>
            <span>{new Date(comparison.date).toLocaleDateString()}</span>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <button className="p-2 text-gray-400 hover:text-blue-600 transition-colors">
            <Share2 size={20} />
          </button>
          <button className="p-2 text-gray-400 hover:text-blue-600 transition-colors">
            <Download size={20} />
          </button>
        </div>
      </div>

      {/* 上传教案区域 */}
      {(!comparison.status || comparison.status === 'waiting_plans') && (
        <div className="mb-6 p-6 bg-blue-50 rounded-2xl border border-blue-200">
          <h4 className="font-black text-gray-900 mb-4">📝 上传教案进行AI对比分析</h4>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-bold text-gray-700 mb-2 block">{comparison.teachers[0]}的教案：</label>
              <textarea
                value={teacher1Plan}
                onChange={(e) => setTeacher1Plan(e.target.value)}
                placeholder="粘贴或输入教案内容..."
                className="w-full bg-white border border-blue-200 rounded-xl px-4 py-3 min-h-[150px] focus:ring-2 focus:ring-blue-100 outline-none resize-none"
              />
            </div>
            <div>
              <label className="text-sm font-bold text-gray-700 mb-2 block">{comparison.teachers[1]}的教案：</label>
              <textarea
                value={teacher2Plan}
                onChange={(e) => setTeacher2Plan(e.target.value)}
                placeholder="粘贴或输入教案内容..."
                className="w-full bg-white border border-blue-200 rounded-xl px-4 py-3 min-h-[150px] focus:ring-2 focus:ring-blue-100 outline-none resize-none"
              />
            </div>
            <button
              onClick={handleAnalyze}
              disabled={isAnalyzing || !teacher1Plan.trim() || !teacher2Plan.trim()}
              className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold hover:bg-blue-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
            >
              {isAnalyzing ? (
                <>
                  <Loader2 size={20} className="animate-spin" />
                  <span>AI分析中...</span>
                </>
              ) : (
                <span>🚀 开始AI对比分析</span>
              )}
            </button>
          </div>
        </div>
      )}

      {/* 对比表格 */}
      {comparison.comparisons && comparison.comparisons.length > 0 && (
        <div className="mb-6 overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b-2 border-gray-200">
                <th className="text-left py-3 px-4 font-black text-gray-700">对比维度</th>
                <th className="text-center py-3 px-4 font-black text-blue-600">{comparison.teachers[0]}</th>
                <th className="text-center py-3 px-4 font-black text-purple-600">{comparison.teachers[1]}</th>
              </tr>
            </thead>
            <tbody>
              {comparison.comparisons.map((comp: any, idx: number) => (
                <tr key={idx} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-4 px-4 font-bold text-gray-700">{comp.dimension}</td>
                  <td className="py-4 px-4 text-sm text-gray-600 text-center">{comp.teacher1}</td>
                  <td className="py-4 px-4 text-sm text-gray-600 text-center">{comp.teacher2}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* AI 分析结论 */}
      {comparison.aiAnalysis && (
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-6 rounded-2xl border border-blue-100">
          <h4 className="font-black text-gray-900 mb-4 flex items-center space-x-2">
            <MessageSquare className="text-blue-600" size={20} />
            <span>AI 分析结论</span>
          </h4>
          <div className="space-y-3">
            <div className="bg-white p-4 rounded-xl">
              <div className="text-sm font-bold text-blue-600 mb-1">{comparison.teachers[0]}：</div>
              <div className="text-sm text-gray-700">{comparison.aiAnalysis.teacher1}</div>
            </div>
            <div className="bg-white p-4 rounded-xl">
              <div className="text-sm font-bold text-purple-600 mb-1">{comparison.teachers[1]}：</div>
              <div className="text-sm text-gray-700">{comparison.aiAnalysis.teacher2}</div>
            </div>
            <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-xl">
              <div className="text-sm font-bold text-yellow-800 mb-1">💡 融合建议：</div>
              <div className="text-sm text-yellow-900">{comparison.aiAnalysis.suggestion}</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

