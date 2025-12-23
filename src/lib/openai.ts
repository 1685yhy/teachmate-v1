import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || 'sk-85a2f65933804eec97edf9f539922794',
  baseURL: process.env.OPENAI_BASE_URL || 'https://api.deepseek.com',
});

/**
 * 智能教案生成 - 使用最新的 DeepSeek-R1 (Reasoner)
 * 擅长逻辑推理、深度思考，生成的教案更具教学深度
 */
export async function generateLessonPlan({
  subject,
  grade,
  theme,
  duration,
}: {
  subject: string;
  grade: string;
  theme: string;
  duration: string;
}) {
  const prompt = `请为${grade}${subject}生成一份关于${theme}的${duration}分钟教案。
请按照以下结构生成：
# [教学主题]教案
## 一、教学目标
... (省略部分结构以节省空间) ...
## 五、课后作业

请用中文回答，内容要具体可操作。`;

  const response = await openai.chat.completions.create({
    model: 'deepseek-reasoner', // 接入最新的 R1 模型
    messages: [
      { role: 'system', content: '你是一位资深的教育专家。' },
      { role: 'user', content: prompt },
    ],
    // 注意：deepseek-reasoner 模型目前不支持 temperature 等参数
  });

  return response.choices[0].message.content;
}

/**
 * 课堂行为分析 - 使用最新的 DeepSeek-V3 (Chat)
 * 擅长结构化数据处理，速度极快
 */
export async function analyzeAudio(transcript: string) {
  const prompt = `你是一位教学督导，请根据以下转录文本分析课堂指标：
1. 开放式问题比例
2. 教师语速
3. 积极反馈次数
...
转录文本："${transcript}"
请以 JSON 格式返回。`;

  const response = await openai.chat.completions.create({
    model: 'deepseek-chat', // 接入最新的 V3 模型
    messages: [
      { role: 'system', content: '你是一位专业的教学分析专家。' },
      { role: 'user', content: prompt },
    ],
    response_format: { type: 'json_object' },
  });

  return JSON.parse(response.choices[0].message.content || '{}');
}

export async function transcribeAudio(file: File) {
  return "（由于 DeepSeek 官方暂无 Whisper 接口，此功能暂由系统模拟转录）";
}
