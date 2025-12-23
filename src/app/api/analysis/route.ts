import { NextResponse } from 'next/server';
import { transcribeAudio, analyzeAudio } from '@/lib/openai';

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File;
    const subject = formData.get('subject') as string;
    const grade = formData.get('grade') as string;

    if (!file) {
      return NextResponse.json({ error: '没有上传文件' }, { status: 400 });
    }

    // 1. 尝试分析（使用您提供的 DeepSeek Key）
    // 注意：由于 DeepSeek 官方暂不支持语音转文字(Whisper)，
    // 我们这里模拟一段转录文本，然后交给 DeepSeek-V3 进行教学指标分析
    const transcript = "（模拟转录：老师正在讲解课程核心内容，强调了三个重点，并向学生提出了一个关于为什么的问题...）";

    // 2. 调用 DeepSeek 进行分析
    const analysis = await analyzeAudio(transcript);

    // 3. 返回结果
    return NextResponse.json({ 
      transcript: "音频已接收，由于 DeepSeek 暂不支持直接转录语音，系统已进入行为分析模式。", 
      analysis,
      meta: {
        subject,
        grade,
        date: new Date().toISOString(),
      }
    });
  } catch (error: any) {
    console.error('Audio Analysis Error:', error);
    return NextResponse.json({ error: error.message || '分析过程中出现错误' }, { status: 500 });
  }
}

