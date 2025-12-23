import { NextResponse } from 'next/server';
import { transcribeAudio, analyzeAudio, analyzeAudioEnhanced } from '@/lib/openai';

// 文件大小限制：500MB
const MAX_FILE_SIZE = 500 * 1024 * 1024;
// 允许的文件类型
const ALLOWED_FILE_TYPES = [
  'audio/mpeg', 'audio/mp3', 'audio/m4a', 'audio/wav', 'audio/x-wav',
  'video/mp4', 'video/quicktime', 'video/x-msvideo'
];

// 请求日志
function logRequest(action: string, details: any) {
  if (process.env.NODE_ENV === 'development') {
    console.log(`[${new Date().toISOString()}] ${action}:`, details);
  }
}

export async function POST(req: Request) {
  const startTime = Date.now();
  
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File;
    const subject = formData.get('subject') as string || '';
    const grade = formData.get('grade') as string || '';
    const enhanced = formData.get('enhanced') === 'true'; // V1.5 增强模式
    const manualTranscript = formData.get('manualTranscript') as string || ''; // 手动输入的课堂实录

    // 1. 文件验证
    if (!file) {
      logRequest('VALIDATION_ERROR', { error: '没有上传文件' });
      return NextResponse.json({ 
        error: '没有上传文件',
        code: 'NO_FILE'
      }, { status: 400 });
    }

    // 文件大小验证
    if (file.size > MAX_FILE_SIZE) {
      logRequest('VALIDATION_ERROR', { 
        error: '文件过大',
        size: file.size,
        maxSize: MAX_FILE_SIZE
      });
      return NextResponse.json({ 
        error: `文件大小超过限制（最大 ${MAX_FILE_SIZE / 1024 / 1024}MB）`,
        code: 'FILE_TOO_LARGE',
        maxSize: MAX_FILE_SIZE
      }, { status: 400 });
    }

    // 文件类型验证
    if (!ALLOWED_FILE_TYPES.includes(file.type)) {
      logRequest('VALIDATION_ERROR', { 
        error: '不支持的文件类型',
        type: file.type
      });
      return NextResponse.json({ 
        error: `不支持的文件类型：${file.type}。支持的类型：音频（MP3, M4A, WAV）和视频（MP4, MOV）`,
        code: 'INVALID_FILE_TYPE',
        allowedTypes: ALLOWED_FILE_TYPES
      }, { status: 400 });
    }

    logRequest('ANALYSIS_START', {
      fileName: file.name,
      fileSize: file.size,
      fileType: file.type,
      subject,
      grade,
      enhanced
    });

    // 2. 获取转录文本
    let transcript = "";
    let transcriptSource = '';
    
    // 优先使用手动输入的课堂实录
    if (manualTranscript && manualTranscript.trim().length > 50) {
      transcript = manualTranscript.trim();
      transcriptSource = 'manual_input';
      logRequest('TRANSCRIPT_SOURCE', { source: 'manual_input', length: transcript.length });
    } else {
      // 尝试使用真实转录（优先百度，其次 Whisper）
      try {
        logRequest('TRANSCRIPT_START', { fileName: file.name, fileType: file.type });
        const transcriptionResult = await transcribeAudio(file);
        transcript = transcriptionResult.text;
        transcriptSource = transcriptionResult.source;
        logRequest('TRANSCRIPT_SUCCESS', { source: transcriptSource, length: transcript.length });
      } catch (whisperError: any) {
        // Whisper 转录失败，使用模拟转录作为后备方案
        console.warn('Whisper 转录失败，使用模拟转录:', whisperError.message);
        logRequest('TRANSCRIPT_FALLBACK', { error: whisperError.message });
        
        // 使用基于学科和年级的智能模拟
        if (subject && grade) {
          const subjectMap: Record<string, string> = {
            'math': '数学',
            'chinese': '语文',
            'english': '英语',
            'science': '科学'
          };
          const gradeMap: Record<string, string> = {
            'p-low': '小学低段',
            'p-high': '小学高段',
            'middle': '初中',
            'high': '高中'
          };
          const subjectName = subjectMap[subject] || subject;
          const gradeName = gradeMap[grade] || grade;
          
          transcript = `（模拟转录：${gradeName}${subjectName}课堂实录）

老师：同学们好！今天我们要学习的内容是...（根据您上传的视频，系统将基于${subjectName}学科和${gradeName}年级的特点进行教学行为分析）

课堂互动片段：
- 老师提问："谁能告诉我..."
- 学生回答："我觉得..."
- 老师反馈："很好，你观察得很仔细！"
- 老师继续："那么，如果...会怎么样呢？"

（注意：由于 Whisper 转录失败，当前使用模拟转录。如需准确分析，请配置 OPENAI_WHISPER_API_KEY 或手动输入课堂实录文本）`;
          transcriptSource = 'simulated';
          logRequest('TRANSCRIPT_SOURCE', { source: 'simulated', subject: subjectName, grade: gradeName });
        } else {
          transcript = `（模拟转录：老师正在讲解课程核心内容，强调了三个重点，并向学生提出了一个关于为什么的问题...）

（提示：Whisper 转录失败。如需准确分析，请配置 OPENAI_WHISPER_API_KEY 或手动输入课堂实录文本）`;
          transcriptSource = 'default_simulated';
          logRequest('TRANSCRIPT_SOURCE', { source: 'default_simulated' });
        }
      }
    }

    // 3. 根据模式选择分析函数（添加超时保护）
    const timeout = enhanced ? 90000 : 60000; // 增强版需要更长时间
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('分析超时，请稍后重试')), timeout)
    );

    const analysisPromise = enhanced 
      ? analyzeAudioEnhanced(transcript, subject, grade)
      : analyzeAudio(transcript);
    
    const analysisResult = await Promise.race([analysisPromise, timeoutPromise]) as any;
    
    // 标准化返回格式
    const analysis = enhanced ? analysisResult : {
      ...analysisResult,
      // 标准版也包含 highlights，如果没有则使用默认值
      highlights: analysisResult.highlights || [
        { title: "情境导入生动", description: "用生活实例引入，学生兴趣浓厚", evidence: "用'披萨分餐'引入圆的面积" },
        { title: "板书设计清晰", description: "公式推导过程层次分明", evidence: "面积公式推导过程清晰" },
        { title: "练习设计有梯度", description: "基础→变式→挑战三级递进", evidence: "练习设计有层次" }
      ]
    };

    const duration = Date.now() - startTime;
    logRequest('ANALYSIS_SUCCESS', {
      duration: `${duration}ms`,
      enhanced,
      hasHighlights: !!analysis.highlights,
      suggestionsCount: analysis.suggestions?.length || 0,
      transcriptSource
    });

    // 4. 返回结果
    const transcriptMessage = transcriptSource === 'baidu'
      ? `✅ 音频转录完成（使用百度语音识别 API，免费）`
      : transcriptSource === 'whisper' 
      ? `✅ 音频转录完成（使用 Whisper API）`
      : transcriptSource === 'manual_input'
      ? `✅ 使用手动输入的课堂实录`
      : `⚠️ 使用模拟转录（建议配置百度语音识别 API（免费）或手动输入课堂实录以获得更准确的分析）`;
    
    return NextResponse.json({ 
      transcript: transcriptMessage,
      transcriptText: transcript, // 返回实际转录文本
      analysis,
      enhanced,
      meta: {
        subject,
        grade,
        date: new Date().toISOString(),
        processingTime: duration,
        transcriptSource // 标注转录来源
      }
    });
  } catch (error: any) {
    const duration = Date.now() - startTime;
    const errorMessage = error.message || '分析过程中出现错误';
    
    logRequest('ANALYSIS_ERROR', {
      error: errorMessage,
      duration: `${duration}ms`,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });

    // 根据错误类型返回不同的状态码
    const statusCode = error.message?.includes('超时') ? 504 : 500;
    
    return NextResponse.json({ 
      error: errorMessage,
      code: error.message?.includes('超时') ? 'TIMEOUT' : 'ANALYSIS_ERROR',
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    }, { status: statusCode });
  }
}

