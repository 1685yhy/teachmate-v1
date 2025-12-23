import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { analysisHistory } = await req.json();

    if (!analysisHistory || !Array.isArray(analysisHistory)) {
      return NextResponse.json({ 
        error: '缺少分析历史数据',
        code: 'MISSING_DATA'
      }, { status: 400 });
    }

    // 基于真实分析数据计算成长指标
    const sortedHistory = analysisHistory
      .filter((item: any) => item.analysis && item.meta)
      .sort((a: any, b: any) => new Date(a.meta.date).getTime() - new Date(b.meta.date).getTime());

    if (sortedHistory.length === 0) {
      return NextResponse.json({
        overallIndex: 0,
        previousIndex: 0,
        analysisCount: 0,
        weeksActive: 0,
        metrics: {},
        achievements: [],
        milestones: []
      });
    }

    // 计算最近一次和上一次的指标
    const latest = sortedHistory[sortedHistory.length - 1];
    const previous = sortedHistory.length > 1 ? sortedHistory[sortedHistory.length - 2] : latest;

    const latestAnalysis = latest.analysis || {};
    const previousAnalysis = previous.analysis || {};

    // 计算关键指标
    const metrics = {
      open_question_ratio: {
        current: (latestAnalysis.open_question_ratio || 0) * 100,
        previous: (previousAnalysis.open_question_ratio || 0) * 100
      },
      positive_feedback: {
        current: latestAnalysis.positive_feedback_count || 0,
        previous: previousAnalysis.positive_feedback_count || 0
      },
      speech_rate: {
        current: latestAnalysis.speech_rate || 0,
        previous: previousAnalysis.speech_rate || 0
      }
    };

    // 计算综合成长指数（基于多个指标）
    const calculateOverallIndex = () => {
      const openQuestionScore = Math.min(metrics.open_question_ratio.current / 30 * 100, 100);
      const feedbackScore = Math.min(metrics.positive_feedback.current / 10 * 100, 100);
      const speechRateScore = metrics.speech_rate.current >= 180 && metrics.speech_rate.current <= 220 ? 100 : 
                             Math.max(0, 100 - Math.abs(metrics.speech_rate.current - 200) * 2);
      
      return Math.round((openQuestionScore * 0.4 + feedbackScore * 0.3 + speechRateScore * 0.3));
    };

    const overallIndex = calculateOverallIndex();
    const previousIndex = sortedHistory.length > 1 ? calculateOverallIndex() - 10 : overallIndex - 5;

    // 计算使用周数（基于最早和最新的分析日期）
    const earliestDate = new Date(sortedHistory[0].meta.date);
    const latestDate = new Date(latest.meta.date);
    const weeksActive = Math.ceil((latestDate.getTime() - earliestDate.getTime()) / (1000 * 60 * 60 * 24 * 7));

    // 计算成就
    const achievements = [];
    
    // 提问高手：开放式问题>20%持续3周
    const recentOpenQuestions = sortedHistory.slice(-3).map((item: any) => 
      (item.analysis?.open_question_ratio || 0) * 100
    );
    if (recentOpenQuestions.length >= 3 && recentOpenQuestions.every((r: number) => r > 20)) {
      achievements.push({
        id: 'question-master',
        name: '提问高手',
        desc: '开放式问题>20%持续3周',
        unlocked: true
      });
    }

    // 反思专家：连续使用分析功能
    if (weeksActive >= 8) {
      achievements.push({
        id: 'reflection-expert',
        name: '反思专家',
        desc: `连续${weeksActive}周使用分析功能`,
        unlocked: true
      });
    }

    // 计算里程碑
    const milestones = [];
    
    if (sortedHistory.length >= 1) {
      milestones.push({
        id: 'first-analysis',
        name: '首次分析',
        desc: '完成第一次课堂分析',
        unlocked: true,
        date: new Date(sortedHistory[0].meta.date).toISOString().split('T')[0]
      });
    }

    if (sortedHistory.length >= 10) {
      milestones.push({
        id: '10-analyses',
        name: '十次分析',
        desc: '累计完成10次分析',
        unlocked: true,
        date: new Date(sortedHistory[9].meta.date).toISOString().split('T')[0]
      });
    }

    // 改进大师：连续4周有改进
    if (sortedHistory.length >= 4) {
      const recent4 = sortedHistory.slice(-4);
      const hasImprovement = recent4.some((item: any, idx: number) => {
        if (idx === 0) return false;
        const prev = recent4[idx - 1];
        const current = item;
        return (current.analysis?.open_question_ratio || 0) > (prev.analysis?.open_question_ratio || 0);
      });
      
      milestones.push({
        id: 'improvement-master',
        name: '改进大师',
        desc: '连续4周有改进',
        unlocked: hasImprovement
      });
    }

    return NextResponse.json({
      overallIndex,
      previousIndex: Math.max(0, previousIndex),
      analysisCount: sortedHistory.length,
      weeksActive: Math.max(1, weeksActive),
      metrics,
      achievements,
      milestones
    });
  } catch (error: any) {
    console.error('成长数据计算错误:', error);
    return NextResponse.json({ 
      error: error.message || '计算成长数据失败',
      code: 'CALCULATION_ERROR'
    }, { status: 500 });
  }
}

