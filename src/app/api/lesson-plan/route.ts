import { NextResponse } from 'next/server';
import { generateLessonPlan } from '@/lib/openai';

export async function POST(req: Request) {
  try {
    const { subject, grade, theme, duration } = await req.json();

    if (!theme) {
      return NextResponse.json({ error: '主题不能为空' }, { status: 400 });
    }

    const content = await generateLessonPlan({ subject, grade, theme, duration });
    
    return NextResponse.json({ content });
  } catch (error: any) {
    console.error('Lesson Plan Generation Error:', error);
    return NextResponse.json({ error: error.message || '生成失败' }, { status: 500 });
  }
}

