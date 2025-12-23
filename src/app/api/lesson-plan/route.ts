import { NextResponse } from 'next/server';
import { generateLessonPlan } from '@/lib/openai';

export async function POST(req: Request) {
  try {
    const { subject, grade, theme, duration } = await req.json();

    if (!theme) {
      return NextResponse.json({ error: '主题不能为空' }, { status: 400 });
    }

    // 添加超时保护
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('请求超时')), 60000)
    );

    const contentPromise = generateLessonPlan({ subject, grade, theme, duration });
    
    const content = await Promise.race([contentPromise, timeoutPromise]) as string;
    
    return NextResponse.json({ content });
  } catch (error: any) {
    console.error('Lesson Plan Generation Error:', error);
    return NextResponse.json({ 
      error: error.message || '生成失败',
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    }, { status: 500 });
  }
}

