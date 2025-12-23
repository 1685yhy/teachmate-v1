"use client";

import React, { useState, useEffect } from 'react';
import { 
  Trophy,
  Award,
  TrendingUp,
  Target,
  BarChart3,
  Star,
  CheckCircle2,
  Clock,
  Users,
  BookOpen,
  Zap,
  Shield
} from 'lucide-react';
import { Header } from '@/components/Header';
import { cn } from '@/lib/utils';

// 三级九维能力模型
const abilityModel = {
  'A': {
    name: '教学设计能力',
    icon: BookOpen,
    color: 'blue',
    dimensions: {
      'A1': { name: '目标设计', metrics: ['课标符合度', '可观测性', '素养体现'] },
      'A2': { name: '活动设计', metrics: ['多样性', '探究性', '学生主体性'] },
      'A3': { name: '评估设计', metrics: ['过程性', '多元性', '发展性'] },
    }
  },
  'B': {
    name: '课堂实施能力',
    icon: Zap,
    color: 'green',
    dimensions: {
      'B1': { name: '语言表达', metrics: ['清晰度', '生动性', '规范性'] },
      'B2': { name: '互动引导', metrics: ['提问质量', '反馈及时性', '等待时间'] },
      'B3': { name: '课堂管理', metrics: ['节奏掌控', '氛围营造', '应变能力'] },
    }
  },
  'C': {
    name: '专业发展能力',
    icon: TrendingUp,
    color: 'purple',
    dimensions: {
      'C1': { name: '反思改进', metrics: ['问题识别', '改进措施', '持续行动'] },
      'C2': { name: '学习创新', metrics: ['新知学习', '方法尝试', '成果转化'] },
      'C3': { name: '协作分享', metrics: ['听课评课', '经验分享', '团队贡献'] },
    }
  }
};

export default function GrowthMilestonePage() {
  const [growthData, setGrowthData] = useState({
    overallIndex: 0,
    previousIndex: 0,
    analysisCount: 0,
    weeksActive: 0,
    metrics: {
      open_question_ratio: { current: 0, previous: 0 },
      positive_feedback: { current: 0, previous: 0 },
      speech_rate: { current: 0, previous: 0 },
    },
    achievements: [],
    milestones: []
  });
  const [isLoading, setIsLoading] = useState(true);

  // 从真实分析数据计算成长指标
  useEffect(() => {
    const calculateGrowth = async () => {
      if (typeof window === 'undefined') return;
      
      try {
        const analysisHistory = JSON.parse(localStorage.getItem('analysis_history') || '[]');
        
        if (analysisHistory.length === 0) {
          setIsLoading(false);
          return;
        }

        const response = await fetch('/api/growth/calculate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ analysisHistory })
        });

        const data = await response.json();
        if (data.error) {
          console.error('成长数据计算失败:', data.error);
          setIsLoading(false);
          return;
        }

        // 添加图标到成就和里程碑
        const achievementsWithIcons = data.achievements.map((a: any) => ({
          ...a,
          icon: a.id === 'question-master' ? Target : 
                a.id === 'reflection-expert' ? Shield : Users
        }));

        const milestonesWithIcons = data.milestones.map((m: any) => ({
          ...m,
          icon: CheckCircle2
        }));

        setGrowthData({
          ...data,
          achievements: achievementsWithIcons,
          milestones: milestonesWithIcons
        });
      } catch (error) {
        console.error('加载成长数据失败:', error);
      } finally {
        setIsLoading(false);
      }
    };

    calculateGrowth();
  }, []);

  // 基于真实数据计算雷达图（简化版）
  const radarData = {
    '目标设计': Math.min(5, (growthData.metrics.open_question_ratio.current / 30) * 5),
    '活动设计': Math.min(5, (growthData.metrics.positive_feedback.current / 10) * 5),
    '语言表达': Math.min(5, growthData.metrics.speech_rate.current >= 180 && growthData.metrics.speech_rate.current <= 220 ? 5 : 3),
    '互动引导': Math.min(5, (growthData.metrics.open_question_ratio.current / 30) * 5),
    '课堂管理': Math.min(5, (growthData.overallIndex / 100) * 5),
    '反思改进': Math.min(5, (growthData.analysisCount / 20) * 5),
  };

  if (isLoading) {
    return (
      <>
        <Header title="教师成长追踪系统（V1.5）" />
        <main className="flex-1 overflow-y-auto p-8">
          <div className="max-w-7xl mx-auto flex items-center justify-center h-96">
            <div className="text-center">
              <div className="text-2xl font-black text-gray-400 mb-4">加载成长数据中...</div>
              <div className="text-sm text-gray-500">基于您的真实分析数据计算成长指标</div>
            </div>
          </div>
        </main>
      </>
    );
  }

  return (
    <>
      <Header title="教师成长追踪系统（V1.5）" />
      <main className="flex-1 overflow-y-auto p-8">
        <div className="max-w-7xl mx-auto">
          {/* 个人成长仪表盘 */}
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-3xl border-2 border-blue-100 p-8 mb-8">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-3xl font-black text-gray-900 mb-2">👤 李老师 成长报告</h2>
                <p className="text-gray-600">2024年1月</p>
              </div>
              <div className="text-right">
                <div className="text-sm text-gray-500 mb-1">综合成长指数</div>
                <div className="flex items-baseline space-x-2">
                  <span className="text-4xl font-black text-blue-600">{growthData.overallIndex}</span>
                  <span className="text-xl text-green-600 font-bold">
                    → {growthData.previousIndex} (↑{((growthData.overallIndex - growthData.previousIndex) / growthData.previousIndex * 100).toFixed(1)}%)
                  </span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-white p-4 rounded-xl">
                <div className="text-xs text-gray-500 mb-1">分析课时</div>
                <div className="text-2xl font-black text-gray-900">{growthData.analysisCount}节</div>
              </div>
              <div className="bg-white p-4 rounded-xl">
                <div className="text-xs text-gray-500 mb-1">持续使用</div>
                <div className="text-2xl font-black text-gray-900">{growthData.weeksActive}周</div>
              </div>
              <div className="bg-white p-4 rounded-xl">
                <div className="text-xs text-gray-500 mb-1">获得成就</div>
                <div className="text-2xl font-black text-gray-900">{growthData.achievements.filter(a => a.unlocked).length}个</div>
              </div>
              <div className="bg-white p-4 rounded-xl">
                <div className="text-xs text-gray-500 mb-1">达成里程碑</div>
                <div className="text-2xl font-black text-gray-900">{growthData.milestones.filter(m => m.unlocked).length}个</div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
            {/* 能力雷达图 */}
            <div className="lg:col-span-2 bg-white p-8 rounded-3xl border border-gray-100 shadow-xl">
              <h3 className="text-xl font-black text-gray-900 mb-6 flex items-center space-x-2">
                <BarChart3 className="text-blue-600" size={24} />
                <span>能力雷达图</span>
              </h3>
              <div className="relative h-64 flex items-center justify-center">
                {/* 简化的雷达图展示 */}
                <div className="grid grid-cols-3 gap-4 w-full">
                  {Object.entries(radarData).map(([key, value]) => (
                    <div key={key} className="text-center">
                      <div className="text-xs font-bold text-gray-500 mb-2">{key}</div>
                      <div className="relative h-32 bg-gray-100 rounded-lg overflow-hidden">
                        <div 
                          className="absolute bottom-0 left-0 right-0 bg-blue-600 transition-all"
                          style={{ height: `${(value / 5) * 100}%` }}
                        />
                        <div className="absolute inset-0 flex items-center justify-center">
                          <span className="text-sm font-black text-gray-900 z-10">{value.toFixed(1)}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="mt-4 text-xs text-gray-400 text-center">
                <span className="inline-block w-3 h-3 bg-blue-600 rounded mr-2"></span>
                当前水平
                <span className="inline-block w-3 h-3 bg-gray-300 border border-gray-400 rounded ml-4 mr-2"></span>
                上月水平
              </div>
            </div>

            {/* 关键指标变化 */}
            <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-xl">
              <h3 className="text-xl font-black text-gray-900 mb-6 flex items-center space-x-2">
                <TrendingUp className="text-green-600" size={24} />
                <span>关键指标变化</span>
              </h3>
              <div className="space-y-4">
                {Object.entries(growthData.metrics).map(([key, data]: [string, any]) => {
                  const change = ((data.current - data.previous) / data.previous * 100);
                  const isPositive = change > 0;
                  return (
                    <div key={key} className="p-4 bg-gray-50 rounded-xl">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-bold text-gray-700">
                          {key === 'open_question_ratio' ? '开放式提问比例' :
                           key === 'positive_feedback' ? '积极反馈次数' :
                           key === 'student_activity_time' ? '学生活动时间' :
                           '语速控制'}
                        </span>
                        <span className={cn(
                          "text-xs font-bold px-2 py-1 rounded-full",
                          isPositive ? "bg-green-100 text-green-700" : "bg-blue-100 text-blue-700"
                        )}>
                          {isPositive ? '↑' : '↓'}{Math.abs(change).toFixed(1)}%
                        </span>
                      </div>
                      <div className="flex items-baseline space-x-2">
                        <span className="text-lg font-black text-gray-900">
                          {key === 'open_question_ratio' || key === 'student_activity_time' 
                            ? `${data.current}%` 
                            : key === 'speech_rate'
                            ? `${data.current}字/分`
                            : `${data.current}次`}
                        </span>
                        <span className="text-xs text-gray-400">
                          ({key === 'open_question_ratio' || key === 'student_activity_time'
                            ? `${data.previous}%`
                            : key === 'speech_rate'
                            ? `${data.previous}字/分`
                            : `${data.previous}次`})
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* 成就系统 */}
          <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-xl mb-8">
            <h3 className="text-xl font-black text-gray-900 mb-6 flex items-center space-x-2">
              <Trophy className="text-yellow-600" size={24} />
              <span>🏆 本周成就</span>
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {growthData.achievements.map((achievement) => (
                <div 
                  key={achievement.id}
                  className={cn(
                    "p-6 rounded-2xl border-2 transition-all",
                    achievement.unlocked 
                      ? "bg-gradient-to-br from-yellow-50 to-orange-50 border-yellow-300 shadow-lg" 
                      : "bg-gray-50 border-gray-200 opacity-50"
                  )}
                >
                  <div className="flex items-center space-x-3 mb-3">
                    <div className={cn(
                      "w-12 h-12 rounded-xl flex items-center justify-center",
                      achievement.unlocked ? "bg-yellow-100 text-yellow-600" : "bg-gray-200 text-gray-400"
                    )}>
                      <achievement.icon size={24} />
                    </div>
                    <div>
                      <div className="font-black text-gray-900">{achievement.name}</div>
                      <div className="text-xs text-gray-500">{achievement.desc}</div>
                    </div>
                  </div>
                  {achievement.unlocked && (
                    <div className="flex items-center space-x-1 text-xs text-yellow-600 font-bold">
                      <CheckCircle2 size={14} />
                      <span>已解锁</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* 成长里程碑 */}
          <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-xl">
            <h3 className="text-xl font-black text-gray-900 mb-6 flex items-center space-x-2">
              <Award className="text-purple-600" size={24} />
              <span>🎯 成长里程碑</span>
            </h3>
            <div className="space-y-4">
              {growthData.milestones.map((milestone, idx) => (
                <div 
                  key={milestone.id}
                  className={cn(
                    "flex items-center space-x-4 p-6 rounded-2xl border-2 transition-all",
                    milestone.unlocked 
                      ? "bg-purple-50 border-purple-300" 
                      : "bg-gray-50 border-gray-200"
                  )}
                >
                  <div className={cn(
                    "w-16 h-16 rounded-full flex items-center justify-center font-black text-xl",
                    milestone.unlocked ? "bg-purple-600 text-white" : "bg-gray-300 text-gray-500"
                  )}>
                    {milestone.unlocked ? <CheckCircle2 size={32} /> : idx + 1}
                  </div>
                  <div className="flex-1">
                    <div className="font-black text-gray-900 mb-1">{milestone.name}</div>
                    <div className="text-sm text-gray-600">{milestone.desc}</div>
                    {milestone.unlocked && milestone.date && (
                      <div className="text-xs text-gray-400 mt-1">达成时间：{milestone.date}</div>
                    )}
                  </div>
                  {milestone.unlocked ? (
                    <div className="text-purple-600">
                      <CheckCircle2 size={24} />
                    </div>
                  ) : (
                    <div className="text-gray-400">
                      <Clock size={24} />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* 三级九维能力模型 */}
          <div className="mt-8 bg-white p-8 rounded-3xl border border-gray-100 shadow-xl">
            <h3 className="text-xl font-black text-gray-900 mb-6">📚 三级九维能力模型</h3>
            <div className="space-y-6">
              {Object.entries(abilityModel).map(([key, category]) => (
                <div key={key} className="border-l-4 border-blue-600 pl-6">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center bg-blue-100 text-blue-600")}>
                      <category.icon size={20} />
                    </div>
                    <div>
                      <div className="font-black text-gray-900">{category.name}</div>
                      <div className="text-xs text-gray-500">一级维度</div>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 ml-13">
                    {Object.entries(category.dimensions).map(([dimKey, dimension]) => (
                      <div key={dimKey} className="bg-gray-50 p-4 rounded-xl">
                        <div className="font-bold text-sm text-gray-700 mb-2">{dimension.name}</div>
                        <div className="text-xs text-gray-500 space-y-1">
                          {dimension.metrics.map((metric, idx) => (
                            <div key={idx}>• {metric}</div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </>
  );
}

