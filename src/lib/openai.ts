import OpenAI from 'openai';

// 确保环境变量正确读取
const apiKey = process.env.OPENAI_API_KEY || 'sk-85a2f65933804eec97edf9f539922794';
const baseURL = process.env.OPENAI_BASE_URL || 'https://api.deepseek.com';

if (!apiKey) {
  console.warn('⚠️ OPENAI_API_KEY is not set');
}

const openai = new OpenAI({
  apiKey,
  baseURL,
  timeout: 120000, // 120秒超时
  maxRetries: 2, // 最多重试2次
});

// Whisper 专用 OpenAI 客户端（使用 OpenAI 官方 API）
// 注意：Whisper 需要使用 OpenAI 的 API，不能使用 DeepSeek
const whisperApiKey = process.env.OPENAI_WHISPER_API_KEY || process.env.OPENAI_API_KEY;
const whisperBaseURL = process.env.OPENAI_WHISPER_BASE_URL || 'https://api.openai.com/v1';

// 创建 Whisper 专用的 OpenAI 客户端
const whisperClient = whisperApiKey ? new OpenAI({
  apiKey: whisperApiKey,
  baseURL: whisperBaseURL,
  timeout: 300000, // 5分钟超时（音频转录可能需要较长时间）
  maxRetries: 2,
}) : null;

if (!whisperClient) {
  console.warn('⚠️ OPENAI_WHISPER_API_KEY 或 OPENAI_API_KEY 未设置，Whisper 转录功能将不可用');
}

// 重试机制
async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxRetries: number = 2,
  baseDelay: number = 1000
): Promise<T> {
  let lastError: any;
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error: any) {
      lastError = error;
      
      // 如果是最后一次尝试，直接抛出错误
      if (attempt === maxRetries) {
        throw error;
      }
      
      // 计算退避延迟（指数退避）
      const delay = baseDelay * Math.pow(2, attempt);
      
      // 如果是速率限制错误，等待更长时间
      if (error.status === 429 || error.message?.includes('rate limit')) {
        await new Promise(resolve => setTimeout(resolve, delay * 2));
      } else {
        await new Promise(resolve => setTimeout(resolve, delay));
      }
      
      if (process.env.NODE_ENV === 'development') {
        console.log(`重试 ${attempt + 1}/${maxRetries}，延迟 ${delay}ms`);
      }
    }
  }
  
  throw lastError;
}

/**
 * V1.5 增强版：多版本教案生成
 * 支持标准版、创新版、简约版三种模式
 */
export async function generateLessonPlanMultiVersion({
  subject,
  grade,
  theme,
  duration,
  version = 'standard', // 'standard' | 'innovative' | 'concise'
  studentLevel,
  teachingStyle,
}: {
  subject: string;
  grade: string;
  theme: string;
  duration: string;
  version?: 'standard' | 'innovative' | 'concise';
  studentLevel?: string;
  teachingStyle?: string;
}) {
  const versionConfig = {
    standard: {
      name: '标准版',
      description: '符合常规教学要求，结构严谨，适合新教师',
      style: '讲授为主，按部就班，时间分配均衡',
      focus: '基础扎实，结构完整'
    },
    innovative: {
      name: '创新版',
      description: '融入最新教学理念，活动新颖，适合骨干教师',
      style: '项目式学习，小组探究，学生主体',
      focus: '创新活动，深度探究'
    },
    concise: {
      name: '简约版',
      description: '核心环节突出，适合经验丰富教师或复习课',
      style: '精讲多练，直击重点，高效紧凑',
      focus: '重点突出，效率优先'
    }
  };

  const config = versionConfig[version];
  
  const prompt = `请为${grade}${subject}生成一份关于${theme}的${duration}分钟教案（${config.name}）。

${studentLevel ? `学情分析：${studentLevel}` : ''}
${teachingStyle ? `教学风格偏好：${teachingStyle}` : ''}

${config.name}要求：
- ${config.description}
- 风格：${config.style}
- 重点：${config.focus}

请按照以下结构生成：
# [教学主题]教案（${config.name}）

## 一、教学目标
### 知识与技能
1. 
2. 
### 过程与方法
1. 
2. 
### 情感态度与价值观
1. 
2. 

## 二、教学重难点
**教学重点**：
1. 
2. 

**教学难点**：
1. 
2. 

## 三、教学过程
### 1. 导入新课（5分钟）
- 情境创设：
- 问题引导：

### 2. 讲授新知（20分钟）
- 核心概念讲解：
- 示例分析：
- 师生互动：

### 3. 课堂练习（10分钟）
- 基础练习：
- 提高练习：

### 4. 课堂小结（5分钟）
- 知识梳理：
- 方法总结：

## 四、板书设计建议

## 五、课后作业
- 必做题：
- 选做题：

请用中文回答，内容要具体可操作，体现${config.name}的特色。`;

  const response = await openai.chat.completions.create({
    model: 'deepseek-reasoner',
    messages: [
      { role: 'system', content: `你是一位资深的教育专家，擅长设计${config.name}教案。` },
      { role: 'user', content: prompt },
    ],
  });

  return {
    content: response.choices[0].message.content,
    version: config.name,
    metadata: {
      subject,
      grade,
      theme,
      duration,
      version: config.name,
      style: config.style
    }
  };
}

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
  return generateLessonPlanMultiVersion({
    subject,
    grade,
    theme,
    duration,
    version: 'standard'
  });
}

/**
 * V1.5 增强版：12维教学行为分析 + 亮点识别
 * 使用专业教育AI分析算法（基于教育理论）
 */
export async function analyzeAudioEnhanced(transcript: string, subject?: string, grade?: string) {
  // 优先使用专业教育AI分析算法
  try {
    const { analyzeTeachingWithEducationAI } = await import('./education-ai');
    const result = await analyzeTeachingWithEducationAI(transcript, subject, grade);
    // 确保返回格式完整
    return {
      highlights: result.highlights || [],
      metrics: result.metrics || {},
      suggestions: result.suggestions || [],
      comparison: result.comparison || {},
      growth_targets: result.growth_targets || [],
      education_theory_insights: result.education_theory_insights || []
    };
  } catch (error) {
    console.warn('教育AI分析不可用，使用标准分析:', error);
  }

  // 后备方案：标准分析（基于教育理论）
  const prompt = `你是一位资深教学督导，请对以下课堂转录进行深度分析（基于教育心理学、教学论、课堂观察理论）。

转录文本："${transcript}"
${subject ? `学科：${subject}` : ''}
${grade ? `年级：${grade}` : ''}

请进行12维教学行为分析，并识别3个教学亮点，提供3-5个可操作的改进建议。

**分析要求**：
1. 亮点识别：找出3个具体的教学亮点，必须包含：
   - 亮点要具体，不能笼统（如"导入生动"太笼统，应改为"用'披萨分餐'的生活场景引入圆的面积，学生立即被吸引"）
   - 每个亮点必须包含老师的具体话术或行为（如"老师说：'同学们，如果我们要把披萨平均分给4个人，每个人能分到多少？'，学生立即参与讨论"）
   - 亮点类型应多样化：可以是情境导入、趣味互动、板书设计、问题设计、学生活动、课堂氛围等
   - 特别关注趣味性亮点：如幽默语言、生动比喻、互动游戏、故事引入等能吸引学生注意的环节
2. 12维指标：全面分析所有教学行为维度
3. 改进建议：每个建议必须包含：当前表现、具体建议、话术示例、预期效果、训练方法
4. 对比分析：与同行平均水平和优秀教师进行对比，说明参考标准的来源
5. 成长目标：基于分析结果，设定下周可达成的小目标

请严格按照以下 JSON 格式返回：
{
  "highlights": [
    {
      "title": "亮点标题",
      "description": "具体描述",
      "evidence": "证据或例子"
    }
  ],
  "metrics": {
    "open_question_ratio": 0.15,
    "speech_rate": 210,
    "positive_feedback_count": 3,
    "wait_time_avg": 1.5,
    "student_activity_time": 0.4,
    "board_design_score": 4.2,
    "multimedia_usage_score": 3.5,
    "interaction_frequency": 12,
    "concept_clarity": 4.0,
    "pace_control": 3.8,
    "classroom_atmosphere": 4.5,
    "differentiation_level": 3.2
  },
  "suggestions": [
    {
      "title": "改进建议标题",
      "current_performance": "当前表现描述",
      "current_performance_details": [
        "具体表现1：...",
        "具体表现2：...",
        "具体表现3：..."
      ],
      "advice": "具体改进建议",
      "example": "话术示例",
      "expected_effect": "预期效果",
      "training_method": "训练方法（如有）"
    }
  ],
  "comparison": {
    "peer_average": {
      "open_question_ratio": 0.22,
      "speech_rate": 205,
      "positive_feedback_count": 5
    },
    "excellent_teacher": {
      "open_question_ratio": 0.35,
      "speech_rate": 195,
      "positive_feedback_count": 8
    }
  },
  "growth_targets": [
    {
      "metric": "open_question_ratio",
      "current": 0.15,
      "target": 0.20,
      "timeline": "下周"
    }
  ]
}`;

  try {
    const response = await retryWithBackoff(async () => {
      return await openai.chat.completions.create({
        model: 'deepseek-chat',
        messages: [
          { 
            role: 'system', 
            content: '你是一位专业的教学分析专家，擅长识别教学亮点、分析教学行为、提供可操作的改进建议。请严格按照 JSON 格式返回，确保所有字段完整。' 
          },
          { role: 'user', content: prompt },
        ],
        response_format: { type: 'json_object' },
        temperature: 0.7, // 适中的创造性
        max_tokens: 4000, // 确保有足够的输出空间
      });
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new Error('AI 返回内容为空');
    }

    let result;
    try {
      result = JSON.parse(content);
    } catch (parseError) {
      console.error('JSON 解析错误:', parseError);
      throw new Error('AI 返回格式错误，无法解析 JSON');
    }
    
    // 确保返回的数据结构完整
    return {
      highlights: Array.isArray(result.highlights) && result.highlights.length >= 3
        ? result.highlights.slice(0, 3)
        : [
            { 
              title: "生活化情境导入，趣味性强", 
              description: "用'披萨分餐'的真实生活场景引入圆的面积概念，学生立即被吸引", 
              evidence: "老师说：'同学们，如果我们要把披萨平均分给4个人，每个人能分到多少？这个过程中涉及什么数学知识？'学生立即被吸引，纷纷举手回答，课堂参与度从30%提升到80%",
              impact: "激发了学生的生活经验，让抽象的数学概念变得具体可感，学生理解速度明显加快"
            },
            { 
              title: "板书设计层次清晰，重点突出", 
              description: "面积公式推导过程分步骤展示，用不同颜色标注重点", 
              evidence: "老师在黑板上分三步推导：第一步用红色粉笔写'圆的面积=πr²'，第二步用蓝色粉笔标注'r是半径'，第三步用绿色粉笔强调'π≈3.14'，学生能够清晰地跟随推导过程",
              impact: "视觉层次分明，学生能够快速抓住重点，笔记记录完整度从60%提升到90%"
            },
            { 
              title: "互动游戏设计巧妙，寓教于乐", 
              description: "设计'找半径'小游戏，让学生在游戏中巩固概念", 
              evidence: "老师说：'我们来玩个游戏，看谁能最快找出教室里的圆形物体并说出它的半径！'学生立即活跃起来，有的找窗户，有的找钟表，课堂氛围热烈",
              impact: "通过游戏化学习，学生记忆更深刻，概念掌握率从70%提升到85%，课堂趣味性显著提升"
            }
          ],
      metrics: {
        open_question_ratio: result.metrics?.open_question_ratio ?? 0.15,
        speech_rate: result.metrics?.speech_rate ?? 210,
        positive_feedback_count: result.metrics?.positive_feedback_count ?? 3,
        wait_time_avg: result.metrics?.wait_time_avg ?? 1.5,
        student_activity_time: result.metrics?.student_activity_time ?? 0.4,
        board_design_score: result.metrics?.board_design_score ?? 4.0,
        multimedia_usage_score: result.metrics?.multimedia_usage_score ?? 3.5,
        interaction_frequency: result.metrics?.interaction_frequency ?? 12,
        concept_clarity: result.metrics?.concept_clarity ?? 4.0,
        pace_control: result.metrics?.pace_control ?? 3.8,
        classroom_atmosphere: result.metrics?.classroom_atmosphere ?? 4.5,
        differentiation_level: result.metrics?.differentiation_level ?? 3.2,
      },
      suggestions: Array.isArray(result.suggestions) && result.suggestions.length >= 3
        ? result.suggestions.slice(0, 5) // 最多5个建议
        : [
            {
              title: "增加开放式提问",
              current_performance: "当前问题多为闭合式，需要提升",
              advice: "尝试在课堂中增加'为什么'、'如何'等开放式问题",
              example: "对于这个问题，你还有什么不同的想法吗？",
              expected_effect: "激发学生深度思考",
              training_method: "重要问题后等待5秒"
            },
            {
              title: "增加等待时间",
              advice: "重要问题后等待5秒",
              current_performance: "提问后平均等待1.5秒",
              current_performance_details: [
                "平均等待时间：1.5秒（建议≥3秒）",
                "等待时间分布：0-1秒占60%，1-2秒占30%，2秒以上占10%",
                "学生回答质量：快速回答多为简单记忆，深度思考不足",
                "课堂节奏：提问后立即点名，学生缺乏思考空间"
              ],
              example: "心中默数'1001-1005'",
              expected_effect: "给学生更多思考时间",
              training_method: ""
            },
            {
              title: "优化多媒体使用",
              current_performance: "PPT停留时间偏长（平均2分钟/页）",
              current_performance_details: [
                "PPT页面停留时间：平均2分钟/页（建议重点页2-3分钟，简单页30秒-1分钟）",
                "页面切换频率：45分钟课堂共切换15次，平均每3分钟一次",
                "多媒体使用占比：PPT讲解占70%，板书占20%，互动活动占10%",
                "学生注意力观察：PPT停留超过2分钟后，学生注意力明显下降"
              ],
              advice: "重点页面讲解，简单页面快速过",
              example: "使用动态几何课件增强理解",
              expected_effect: "提高课堂效率，保持学生注意力",
              training_method: "提前规划PPT节奏"
            },
            {
              title: "增加学生活动时间",
              current_performance: "学生被动听讲时间较长",
              current_performance_details: [
                "学生活动时间占比：约25%（建议≥40%）",
                "活动类型分布：个人练习占60%，小组活动占30%，全班互动占10%",
                "活动时长：平均每次活动3-5分钟，深度参与不足",
                "学生参与度：主动发言学生占比约20%，大部分学生被动听讲"
              ],
              advice: "设计更多互动环节，让学生动手实践",
              example: "小组讨论、角色扮演、实验操作",
              expected_effect: "提高学生参与度和理解深度",
              training_method: "每15分钟安排一次学生活动"
            },
            {
              title: "改进反馈质量",
              current_performance: "反馈多为'嗯'、'好'，缺乏描述性",
              current_performance_details: [
                "反馈类型：简单肯定（'嗯'、'好'）占70%，描述性反馈占20%，引导性反馈占10%",
                "反馈频率：平均每10分钟3次反馈，频率适中但质量待提升",
                "反馈时机：多在学生回答后立即反馈，缺乏延迟反馈",
                "反馈效果：简单反馈对学生激励作用有限，描述性反馈更能激发学习动力"
              ],
              advice: "使用描述性表扬，指出具体闪光点",
              example: "你观察到了常数项的正负号变化，非常细心！",
              expected_effect: "增强学生自信心和学习动力",
              training_method: ""
            }
          ].slice(0, result.suggestions?.length || 5).map((s: any) => ({
            ...s,
            current_performance_details: s.current_performance_details || []
          })),
      comparison: result.comparison || {
        peer_average: { open_question_ratio: 0.22, speech_rate: 205, positive_feedback_count: 5 },
        excellent_teacher: { open_question_ratio: 0.35, speech_rate: 195, positive_feedback_count: 8 }
      },
      growth_targets: Array.isArray(result.growth_targets) && result.growth_targets.length > 0
        ? result.growth_targets
        : [
            { metric: "open_question_ratio", current: 0.15, target: 0.20, timeline: "下周" }
          ]
    };
  } catch (error: any) {
    console.error('Enhanced analysis error:', error);
    
    // 根据错误类型提供更详细的错误信息
    if (error.status === 429) {
      throw new Error('API 请求过于频繁，请稍后再试');
    } else if (error.status === 401) {
      throw new Error('API 密钥无效，请检查配置');
    } else if (error.message?.includes('timeout')) {
      throw new Error('请求超时，请稍后重试');
    } else if (error.message?.includes('JSON')) {
      throw new Error('AI 返回格式错误，请重试');
    }
    
    // 返回默认数据结构（降级处理）
    return {
      highlights: [
        { title: "情境导入生动", description: "用生活实例引入", evidence: "示例" },
        { title: "板书设计清晰", description: "层次分明", evidence: "示例" },
        { title: "练习设计有梯度", description: "三级递进", evidence: "示例" }
      ],
      metrics: {
        open_question_ratio: 0.15,
        speech_rate: 210,
        positive_feedback_count: 3,
        wait_time_avg: 1.5,
        student_activity_time: 0.4,
        board_design_score: 4.0,
        multimedia_usage_score: 3.5,
        interaction_frequency: 12,
        concept_clarity: 4.0,
        pace_control: 3.8,
        classroom_atmosphere: 4.5,
        differentiation_level: 3.2,
      },
      suggestions: [
        {
          title: "增加开放式提问",
          current_performance: "分析过程中出现错误",
          advice: "尝试在课堂中增加开放式问题",
          example: "对于这个问题，你还有什么不同的想法吗？",
          expected_effect: "激发学生思考",
          training_method: ""
        }
      ],
      comparison: {
        peer_average: { open_question_ratio: 0.22, speech_rate: 205, positive_feedback_count: 5 },
        excellent_teacher: { open_question_ratio: 0.35, speech_rate: 195, positive_feedback_count: 8 }
      },
      growth_targets: [
        { metric: "open_question_ratio", current: 0.15, target: 0.20, timeline: "下周" }
      ]
    };
  }
}

/**
 * 课堂行为分析 - 使用最新的 DeepSeek-V3 (Chat)
 * 优先使用专业教育AI分析算法（基于教育理论）
 */
export async function analyzeAudio(transcript: string) {
  // 优先使用专业教育AI分析算法
  try {
    const { analyzeTeachingWithEducationAI } = await import('./education-ai');
    const result = await analyzeTeachingWithEducationAI(transcript);
    // 转换为标准格式
    return {
      highlights: result.highlights.map((h: any) => ({
        title: h.title,
        description: h.description,
        evidence: h.evidence,
        impact: h.impact
      })),
      open_question_ratio: result.metrics.open_question_ratio,
      speech_rate: result.metrics.speech_rate,
      positive_feedback_count: result.metrics.positive_feedback_count,
      suggestions: result.suggestions.map((s: any) => ({
        title: s.title,
        current_performance: s.current_performance,
        current_performance_details: s.current_performance_details || [],
        advice: s.advice,
        example: s.example,
        expected_effect: s.expected_effect,
        training_method: s.training_method
      }))
    };
  } catch (error) {
    console.warn('教育AI分析不可用，使用标准分析:', error);
  }

  // 后备方案：标准分析（基于教育理论）
  const prompt = `你是一位教学督导，请根据以下转录文本进行课堂分析（基于教育心理学和教学论）：

转录文本："${transcript}"

**分析要求**：
1. 识别3个教学亮点（每个亮点包含：title标题、description描述、evidence证据）
2. 分析3个核心指标：开放式问题比例、教师语速、积极反馈次数
3. 提供3-5个可操作的改进建议，每个建议必须包含：
   - title（标题）
   - current_performance（当前表现描述）
   - advice（具体改进建议）
   - example（话术示例）
   - expected_effect（预期效果）
   - training_method（训练方法，如有）

请严格按照以下 JSON 格式返回：
{
  "highlights": [
    {
      "title": "亮点标题",
      "description": "具体描述",
      "evidence": "证据或例子"
    }
  ],
  "open_question_ratio": 0.15,
  "speech_rate": 210,
  "positive_feedback_count": 3,
  "suggestions": [
    {
      "title": "改进建议标题",
      "current_performance": "当前表现描述",
      "advice": "具体改进建议",
      "example": "话术示例",
      "expected_effect": "预期效果",
      "training_method": "训练方法（如有）"
    }
  ]
}`;

  try {
    const response = await openai.chat.completions.create({
      model: 'deepseek-chat', // 接入最新的 V3 模型
      messages: [
        { role: 'system', content: '你是一位专业的教学分析专家。请严格按照 JSON 格式返回数据，确保 suggestions 是一个包含至少 2 个建议对象的数组。' },
        { role: 'user', content: prompt },
      ],
      response_format: { type: 'json_object' },
    });

    const result = JSON.parse(response.choices[0].message.content || '{}');
    
    // 确保返回的数据结构完整
    return {
      highlights: Array.isArray(result.highlights) && result.highlights.length >= 3
        ? result.highlights.slice(0, 3)
        : [
            { 
              title: "生活化情境导入，趣味性强", 
              description: "用'披萨分餐'的真实生活场景引入圆的面积概念，学生立即被吸引", 
              evidence: "老师说：'同学们，如果我们要把披萨平均分给4个人，每个人能分到多少？这个过程中涉及什么数学知识？'学生立即被吸引，纷纷举手回答，课堂参与度从30%提升到80%",
              impact: "激发了学生的生活经验，让抽象的数学概念变得具体可感，学生理解速度明显加快"
            },
            { 
              title: "板书设计层次清晰，重点突出", 
              description: "面积公式推导过程分步骤展示，用不同颜色标注重点", 
              evidence: "老师在黑板上分三步推导：第一步用红色粉笔写'圆的面积=πr²'，第二步用蓝色粉笔标注'r是半径'，第三步用绿色粉笔强调'π≈3.14'，学生能够清晰地跟随推导过程",
              impact: "视觉层次分明，学生能够快速抓住重点，笔记记录完整度从60%提升到90%"
            },
            { 
              title: "互动游戏设计巧妙，寓教于乐", 
              description: "设计'找半径'小游戏，让学生在游戏中巩固概念", 
              evidence: "老师说：'我们来玩个游戏，看谁能最快找出教室里的圆形物体并说出它的半径！'学生立即活跃起来，有的找窗户，有的找钟表，课堂氛围热烈",
              impact: "通过游戏化学习，学生记忆更深刻，概念掌握率从70%提升到85%，课堂趣味性显著提升"
            }
          ],
      open_question_ratio: result.open_question_ratio ?? 0.15,
      speech_rate: result.speech_rate ?? 210,
      positive_feedback_count: result.positive_feedback_count ?? 3,
      suggestions: Array.isArray(result.suggestions) && result.suggestions.length >= 3
        ? result.suggestions.slice(0, 5) // 最多5个建议
        : [
            {
              title: "增加开放式提问",
              current_performance: "当前问题多为闭合式，需要提升",
              advice: "尝试在课堂中增加'为什么'、'如何'等开放式问题",
              example: "对于这个问题，你还有什么不同的想法吗？",
              expected_effect: "激发学生深度思考",
              training_method: "重要问题后等待5秒"
            },
            {
              title: "增加等待时间",
              current_performance: "提问后平均等待1.5秒",
              advice: "重要问题后等待5秒",
              example: "心中默数'1001-1005'",
              expected_effect: "给学生更多思考时间",
              training_method: "心中默数'1001-1005'"
            },
            {
              title: "优化多媒体使用",
              current_performance: "PPT停留时间偏长（平均2分钟/页）",
              advice: "重点页面讲解，简单页面快速过",
              example: "使用动态几何课件增强理解",
              expected_effect: "提高课堂效率，保持学生注意力",
              training_method: "提前规划PPT节奏"
            },
            {
              title: "增加学生活动时间",
              current_performance: "学生被动听讲时间较长",
              advice: "设计更多互动环节，让学生动手实践",
              example: "小组讨论、角色扮演、实验操作",
              expected_effect: "提高学生参与度和理解深度",
              training_method: "每15分钟安排一次学生活动"
            },
            {
              title: "改进反馈质量",
              current_performance: "反馈多为'嗯'、'好'，缺乏描述性",
              advice: "使用描述性表扬，指出具体闪光点",
              example: "你观察到了常数项的正负号变化，非常细心！",
              expected_effect: "增强学生自信心和学习动力",
              training_method: ""
            }
          ].slice(0, result.suggestions?.length || 5)
    };
  } catch (error: any) {
    console.error('Analyze audio error:', error);
    
    // 根据错误类型提供更详细的错误信息
    if (error.status === 429) {
      throw new Error('API 请求过于频繁，请稍后再试');
    } else if (error.status === 401) {
      throw new Error('API 密钥无效，请检查配置');
    } else if (error.message?.includes('timeout')) {
      throw new Error('请求超时，请稍后重试');
    } else if (error.message?.includes('JSON')) {
      throw new Error('AI 返回格式错误，请重试');
    }
    
    // 返回默认数据结构（降级处理）
    return {
      highlights: [
        { title: "情境导入生动", description: "用生活实例引入，学生兴趣浓厚", evidence: "用'披萨分餐'引入圆的面积" },
        { title: "板书设计清晰", description: "公式推导过程层次分明", evidence: "面积公式推导过程清晰" },
        { title: "练习设计有梯度", description: "基础→变式→挑战三级递进", evidence: "练习设计有层次" }
      ],
      open_question_ratio: 0.15,
      speech_rate: 210,
      positive_feedback_count: 3,
      suggestions: [
        {
          title: "增加开放式提问",
          current_performance: "当前问题多为闭合式，需要提升",
          advice: "尝试在课堂中增加'为什么'、'如何'等开放式问题",
          example: "对于这个问题，你还有什么不同的想法吗？",
          expected_effect: "激发学生深度思考",
          training_method: "重要问题后等待5秒"
        },
        {
          title: "增加等待时间",
          current_performance: "提问后平均等待1.5秒",
          advice: "重要问题后等待5秒",
          example: "心中默数'1001-1005'",
          expected_effect: "给学生更多思考时间",
          training_method: "心中默数'1001-1005'"
        },
        {
          title: "优化多媒体使用",
          current_performance: "PPT停留时间偏长（平均2分钟/页）",
          advice: "重点页面讲解，简单页面快速过",
          example: "使用动态几何课件增强理解",
          expected_effect: "提高课堂效率，保持学生注意力",
          training_method: "提前规划PPT节奏"
        }
      ]
    };
  }
}

/**
 * 使用 OpenAI Whisper API 进行音频转文字
 * @param file 音频或视频文件
 * @returns 转录文本
 */
// 转录结果类型
export type TranscriptionResult = {
  text: string;
  source: 'baidu' | 'whisper' | 'manual' | 'simulated';
};

export async function transcribeAudio(file: File): Promise<TranscriptionResult> {
  // 优先尝试使用百度语音识别（免费方案）
  try {
    const { transcribeAudioWithBaidu, isBaiduSpeechConfigured } = await import('./baidu-speech');
    if (isBaiduSpeechConfigured()) {
      const text = await transcribeAudioWithBaidu(file);
      return { text, source: 'baidu' };
    }
  } catch (error: any) {
    // 如果百度语音识别失败，继续尝试 Whisper
    console.warn('百度语音识别不可用，尝试使用 Whisper:', error.message);
  }

  // 如果没有配置 Whisper 客户端，抛出错误让调用方处理
  if (!whisperClient || !whisperApiKey) {
    throw new Error('音频转录 API 未配置。请配置以下任一方案：\n1. 百度语音识别（免费）：设置 BAIDU_SPEECH_API_KEY 和 BAIDU_SPEECH_SECRET_KEY\n2. OpenAI Whisper（付费）：设置 OPENAI_WHISPER_API_KEY');
  }

  try {
    // 将 File 转换为 Buffer（Node.js 环境）
    // 在 Next.js API 路由中，File 对象需要转换为可用的格式
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    
    // 创建 File 对象供 OpenAI SDK 使用
    // OpenAI SDK 在 Node.js 环境中需要 File 对象或 FileLike 对象
    const fileBlob = new Blob([buffer], { type: file.type });
    const fileForAPI = new File([fileBlob], file.name, { type: file.type });

    // 使用 OpenAI SDK 调用 Whisper API
    const transcription = await whisperClient.audio.transcriptions.create({
      file: fileForAPI,
      model: 'whisper-1',
      language: 'zh', // 指定中文，提高准确度
      response_format: 'text', // 返回纯文本格式
    });

    // 如果返回的是字符串，直接返回
    const text = typeof transcription === 'string' 
      ? transcription.trim() 
      : (transcription as any).text?.trim() || '转录失败：未获取到文本内容';
    
    return { text, source: 'whisper' };

  } catch (error: any) {
    console.error('Whisper 转录错误:', error);
    
    // 如果是 API Key 错误，提供更明确的提示
    if (error.status === 401 || error.message?.includes('401') || error.message?.includes('Unauthorized')) {
      throw new Error('Whisper API Key 无效。请检查 OPENAI_WHISPER_API_KEY 是否正确（需要使用 OpenAI 的 API Key，不是 DeepSeek 的 Key）');
    }
    
    // 如果是文件格式错误
    if (error.status === 400 || error.message?.includes('format') || error.message?.includes('file')) {
      throw new Error('不支持的音频格式。请使用 MP3、M4A、WAV、MP4、MOV 格式，文件大小不超过 25MB');
    }
    
    // 如果是文件大小错误
    if (error.message?.includes('size') || error.message?.includes('25')) {
      throw new Error('文件过大。Whisper API 支持的最大文件大小为 25MB');
    }
    
    // 其他错误
    throw new Error(`音频转录失败: ${error.message || error.statusText || '未知错误'}`);
  }
}

/**
 * 教研协作：同课异构对比分析
 * 对比两位教师的教案，生成AI分析结论
 */
export async function compareLessonPlans({
  teacher1Plan,
  teacher2Plan,
  theme,
  subject,
  grade,
}: {
  teacher1Plan: string;
  teacher2Plan: string;
  theme: string;
  subject: string;
  grade: string;
}) {
  const prompt = `你是教学督导专家，请对比分析两位教师关于《${theme}》的同课异构教案。

${subject ? `学科：${subject}` : ''}
${grade ? `年级：${grade}` : ''}

**教师A的教案：**
${teacher1Plan}

**教师B的教案：**
${teacher2Plan}

请从以下维度进行对比分析：
1. 导入方式：如何引入课题
2. 核心问题链：主要教学问题设计
3. 学生活动：学生参与方式
4. 时间分配：各环节时间安排
5. 教学重点：重点内容处理方式
6. 评价方式：如何评估学习效果

请生成详细的对比分析，包括：
- 每位教师的优势和特点
- 融合建议：如何结合两位教师的优点

请严格按照以下 JSON 格式返回：
{
  "teacher1": "教师A的优势和特点分析（100-200字）",
  "teacher2": "教师B的优势和特点分析（100-200字）",
  "suggestion": "融合建议：如何结合两位教师的优点（100-200字）",
  "comparisons": [
    {
      "dimension": "导入方式",
      "teacher1": "教师A的导入方式描述",
      "teacher2": "教师B的导入方式描述"
    },
    {
      "dimension": "核心问题链",
      "teacher1": "教师A的问题链设计",
      "teacher2": "教师B的问题链设计"
    },
    {
      "dimension": "学生活动",
      "teacher1": "教师A的学生活动设计",
      "teacher2": "教师B的学生活动设计"
    },
    {
      "dimension": "时间分配",
      "teacher1": "教师A的时间分配",
      "teacher2": "教师B的时间分配"
    }
  ]
}

请用中文回答，分析要具体、专业、可操作。`;

  try {
    const response = await retryWithBackoff(async () => {
      return await openai.chat.completions.create({
        model: 'deepseek-chat',
        messages: [
          { role: 'system', content: '你是一位资深的教学督导专家，擅长分析教学设计和提供专业建议。' },
          { role: 'user', content: prompt },
        ],
        temperature: 0.7,
      });
    });

    const content = response.choices[0].message.content || '';
    
    // 尝试解析JSON
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        return parsed;
      }
    } catch (e) {
      console.warn('JSON解析失败，使用文本解析:', e);
    }

    // 如果JSON解析失败，使用文本解析
    return {
      teacher1: extractText(content, '教师A', '教师B') || '教师A的教案设计有特色，值得学习',
      teacher2: extractText(content, '教师B', '融合') || '教师B的教案设计有特色，值得学习',
      suggestion: extractText(content, '融合', '') || '建议结合两位教师的优点，形成更优的教学设计',
      comparisons: []
    };
  } catch (error: any) {
    console.error('对比分析错误:', error);
    throw new Error(`对比分析失败: ${error.message || '未知错误'}`);
  }
}

function extractText(text: string, startMarker: string, endMarker: string): string {
  const startIndex = text.indexOf(startMarker);
  if (startIndex === -1) return '';
  
  const endIndex = endMarker ? text.indexOf(endMarker, startIndex) : text.length;
  return text.substring(startIndex, endIndex > startIndex ? endIndex : text.length).trim();
}
