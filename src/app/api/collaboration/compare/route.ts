import { NextResponse } from 'next/server';
import { compareLessonPlans } from '@/lib/openai';

export async function POST(req: Request) {
  try {
    const { teacher1Plan, teacher2Plan, theme, subject, grade } = await req.json();

    if (!teacher1Plan || !teacher2Plan || !theme) {
      return NextResponse.json({ 
        error: '缺少必要参数：需要两位教师的教案和课题名称',
        code: 'MISSING_PARAMS'
      }, { status: 400 });
    }

    // 调用AI进行对比分析
    const analysis = await compareLessonPlans({
      teacher1Plan,
      teacher2Plan,
      theme,
      subject: subject || '',
      grade: grade || ''
    });

    return NextResponse.json({ 
      analysis,
      meta: {
        theme,
        subject,
        grade,
        date: new Date().toISOString()
      }
    });
  } catch (error: any) {
    console.error('对比分析错误:', error);
    return NextResponse.json({ 
      error: error.message || '对比分析失败，请稍后重试',
      code: 'COMPARISON_ERROR'
    }, { status: 500 });
  }
}

