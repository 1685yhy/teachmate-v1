import { NextResponse } from 'next/server';
import { generateLessonPlan, generateLessonPlanMultiVersion } from '@/lib/openai';

// 请求日志
function logRequest(action: string, details: any) {
  if (process.env.NODE_ENV === 'development') {
    console.log(`[${new Date().toISOString()}] ${action}:`, details);
  }
}

// 输入验证
function validateInput(data: any) {
  const errors: string[] = [];
  
  if (!data.theme || data.theme.trim().length === 0) {
    errors.push('主题不能为空');
  }
  
  if (data.theme && data.theme.length > 200) {
    errors.push('主题长度不能超过200个字符');
  }
  
  if (data.duration && (isNaN(Number(data.duration)) || Number(data.duration) <= 0)) {
    errors.push('课时时长必须是大于0的数字');
  }
  
  if (data.version && !['standard', 'innovative', 'concise'].includes(data.version)) {
    errors.push('版本类型无效');
  }
  
  return errors;
}

export async function POST(req: Request) {
  const startTime = Date.now();
  
  try {
    const body = await req.json();
    const { subject, grade, theme, duration, version, studentLevel, teachingStyle, multiVersion } = body;

    // 输入验证
    const validationErrors = validateInput({ theme, duration, version });
    if (validationErrors.length > 0) {
      logRequest('VALIDATION_ERROR', { errors: validationErrors });
      return NextResponse.json({ 
        error: validationErrors.join('；'),
        code: 'VALIDATION_ERROR',
        errors: validationErrors
      }, { status: 400 });
    }

    logRequest('LESSON_PLAN_START', {
      theme,
      subject,
      grade,
      duration,
      version,
      multiVersion
    });

    // 添加超时保护
    const timeout = multiVersion ? 180000 : 120000; // 多版本需要更长时间
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('请求超时，请稍后重试')), timeout)
    );

    // V1.5 多版本生成
    if (multiVersion === true) {
      const versions = ['standard', 'innovative', 'concise'] as const;
      const resultsPromise = Promise.all(
        versions.map(v => generateLessonPlanMultiVersion({
          subject: subject || '通用',
          grade: grade || '通用',
          theme: theme.trim(),
          duration: duration || '45',
          version: v,
          studentLevel,
          teachingStyle
        }))
      );
      
      const results = await Promise.race([resultsPromise, timeoutPromise]) as any[];
      
      const processingTime = Date.now() - startTime;
      logRequest('LESSON_PLAN_SUCCESS', {
        mode: 'multiVersion',
        duration: `${processingTime}ms`,
        versionsCount: results.length
      });
      
      return NextResponse.json({ 
        versions: results.map(r => ({
          content: r.content,
          version: r.version,
          metadata: r.metadata
        })),
        meta: {
          processingTime
        }
      });
    }

    // 单版本生成
    const resultPromise = version 
      ? generateLessonPlanMultiVersion({ 
          subject: subject || '通用',
          grade: grade || '通用',
          theme: theme.trim(),
          duration: duration || '45',
          version,
          studentLevel,
          teachingStyle
        })
      : generateLessonPlan({ 
          subject: subject || '通用',
          grade: grade || '通用',
          theme: theme.trim(),
          duration: duration || '45'
        });
    
    const result = await Promise.race([resultPromise, timeoutPromise]) as any;
    
    const processingTime = Date.now() - startTime;
    logRequest('LESSON_PLAN_SUCCESS', {
      mode: 'single',
      duration: `${processingTime}ms`,
      version: typeof result === 'object' ? result.version : 'standard'
    });
    
    return NextResponse.json({ 
      content: typeof result === 'string' ? result : result.content,
      version: typeof result === 'object' ? result.version : 'standard',
      metadata: typeof result === 'object' ? result.metadata : undefined,
      meta: {
        processingTime
      }
    });
  } catch (error: any) {
    const processingTime = Date.now() - startTime;
    const errorMessage = error.message || '生成失败';
    
    logRequest('LESSON_PLAN_ERROR', {
      error: errorMessage,
      duration: `${processingTime}ms`,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });

    // 根据错误类型返回不同的状态码
    const statusCode = error.message?.includes('超时') ? 504 : 500;
    
    return NextResponse.json({ 
      error: errorMessage,
      code: error.message?.includes('超时') ? 'TIMEOUT' : 'GENERATION_ERROR',
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    }, { status: statusCode });
  }
}

