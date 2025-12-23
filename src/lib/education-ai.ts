/**
 * 教育AI分析算法库
 * 基于教育心理学、教学论、课堂观察理论的专业分析算法
 */

import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || 'sk-85a2f65933804eec97edf9f539922794',
  baseURL: process.env.OPENAI_BASE_URL || 'https://api.deepseek.com',
  timeout: 120000,
  maxRetries: 2,
});

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
      
      if (attempt === maxRetries) {
        throw error;
      }
      
      const delay = baseDelay * Math.pow(2, attempt);
      if (error.status === 429 || error.message?.includes('rate limit')) {
        await new Promise(resolve => setTimeout(resolve, delay * 2));
      } else {
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }
  
  throw lastError;
}

/**
 * 教育专业分析：基于布鲁姆教育目标分类、建构主义理论、多元智能理论
 */
export async function analyzeTeachingWithEducationAI(
  transcript: string,
  subject?: string,
  grade?: string
) {
  const educationPrompt = `你是一位拥有20年教学经验的教育专家，精通教育心理学、教学论、课堂观察理论。请基于以下教育理论对课堂进行专业分析：

**理论基础**：
1. 布鲁姆教育目标分类（认知、情感、动作技能）
2. 建构主义学习理论（学生主动建构知识）
3. 多元智能理论（语言、逻辑、空间、音乐等）
4. 维果茨基最近发展区理论
5. 加德纳多元智能理论
6. 皮亚杰认知发展理论

**转录文本**："${transcript}"
${subject ? `学科：${subject}` : ''}
${grade ? `年级：${grade}` : ''}

**专业分析要求**：

### 1. 教学亮点识别（基于教育理论）
从以下维度识别3个具体亮点：
- **认知维度**：是否促进学生高阶思维（分析、评价、创造）？
- **情感维度**：是否激发学习兴趣、培养学习动机？
- **建构维度**：是否引导学生主动建构知识？
- **多元智能**：是否调动多种智能（语言、逻辑、空间、音乐、身体运动等）？
- **最近发展区**：是否在学生最近发展区内设计任务？

每个亮点必须包含：
- 理论依据（基于哪个教育理论）
- 具体表现（教师的具体话术或行为）
- 教育价值（对学生发展的促进作用）
- 量化证据（如参与度提升、理解速度等）

### 2. 12维教学行为分析（教育专业指标）
基于教育测量学，分析以下维度：

**认知发展维度**：
- open_question_ratio: 开放式问题比例（布鲁姆高阶思维指标）
- concept_clarity: 概念清晰度（皮亚杰认知发展）
- scaffolding_level: 支架式教学水平（维果茨基最近发展区）

**情感动机维度**：
- learning_interest: 学习兴趣激发度（马斯洛需求层次）
- positive_feedback_count: 积极反馈次数（强化理论）
- classroom_atmosphere: 课堂氛围（人本主义教育）

**互动参与维度**：
- student_activity_time: 学生活动时间比例（建构主义）
- interaction_frequency: 互动频率（社会建构主义）
- wait_time_avg: 等待时间（认知负荷理论）

**教学技能维度**：
- speech_rate: 语速（信息加工理论）
- board_design_score: 板书设计（视觉学习理论）
- multimedia_usage_score: 多媒体使用（多媒体学习理论）
- differentiation_level: 差异化教学（多元智能理论）

### 3. 改进建议（基于教育研究）
每个建议必须：
- 基于教育理论（说明理论依据）
- 提供具体策略（可操作的教学方法）
- 给出话术示例（实际可用的语言）
- 预期效果（基于教育研究的预期结果）
- 训练方法（如何提升该能力）

### 4. 对比分析（教育基准）
- 与课程标准要求对比
- 与同年级优秀教师对比
- 与教育研究数据对比
- 说明参考标准的来源（如：基于《义务教育课程标准》、XX教育研究等）

### 5. 成长目标（SMART原则）
- Specific（具体）
- Measurable（可测量）
- Achievable（可达成）
- Relevant（相关）
- Time-bound（有时限）

请严格按照以下 JSON 格式返回：
{
  "highlights": [
    {
      "title": "亮点标题（体现教育理论）",
      "description": "具体描述（包含理论依据）",
      "evidence": "教师的具体话术或行为",
      "theory": "基于的教育理论",
      "impact": "对学生发展的促进作用（量化）"
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
    "differentiation_level": 3.2,
    "scaffolding_level": 3.8,
    "learning_interest": 4.2
  },
  "suggestions": [
    {
      "title": "改进建议标题",
      "theory_basis": "基于的教育理论",
      "current_performance": "当前表现描述（基于观察）",
      "current_performance_details": [
        "具体表现1：...",
        "具体表现2：...",
        "具体表现3：..."
      ],
      "advice": "具体改进建议（基于教育研究）",
      "strategy": "教学策略（可操作的方法）",
      "example": "话术示例（实际可用）",
      "expected_effect": "预期效果（基于教育研究）",
      "training_method": "训练方法（如何提升）",
      "research_reference": "相关教育研究（如有）"
    }
  ],
  "comparison": {
    "curriculum_standard": {
      "source": "《义务教育课程标准（2022年版）》",
      "open_question_ratio": "建议>25%",
      "student_activity_time": "建议>40%"
    },
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
      "timeline": "下周",
      "strategy": "具体策略",
      "measurement": "如何测量"
    }
  ],
  "education_theory_insights": [
    {
      "theory": "建构主义学习理论",
      "observation": "观察到的教学行为",
      "evaluation": "是否符合理论要求",
      "suggestion": "如何更好地应用该理论"
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
            content: '你是一位拥有20年教学经验的教育专家，精通教育心理学、教学论、课堂观察理论。请基于教育理论进行专业分析，确保所有建议都有理论依据。' 
          },
          { role: 'user', content: educationPrompt },
        ],
        response_format: { type: 'json_object' },
        temperature: 0.7,
        max_tokens: 5000,
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
        : [],
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
        scaffolding_level: result.metrics?.scaffolding_level ?? 3.8,
        learning_interest: result.metrics?.learning_interest ?? 4.2,
      },
      suggestions: Array.isArray(result.suggestions) && result.suggestions.length >= 3
        ? result.suggestions.slice(0, 5)
        : [],
      comparison: result.comparison || {
        curriculum_standard: {
          source: "《义务教育课程标准（2022年版）》",
          open_question_ratio: "建议>25%",
          student_activity_time: "建议>40%"
        },
        peer_average: { open_question_ratio: 0.22, speech_rate: 205, positive_feedback_count: 5 },
        excellent_teacher: { open_question_ratio: 0.35, speech_rate: 195, positive_feedback_count: 8 }
      },
      growth_targets: Array.isArray(result.growth_targets) ? result.growth_targets : [],
      education_theory_insights: Array.isArray(result.education_theory_insights) 
        ? result.education_theory_insights 
        : []
    };
  } catch (error: any) {
    console.error('教育AI分析错误:', error);
    throw new Error(`教育AI分析失败: ${error.message || '未知错误'}`);
  }
}

/**
 * 教案质量评估（基于教育目标分类、教学设计理论）
 */
export async function evaluateLessonPlanQuality(lessonPlan: string, subject: string, grade: string) {
  const evaluationPrompt = `你是教学评估专家，请基于以下理论评估教案质量：

**评估理论**：
1. 布鲁姆教育目标分类（认知、情感、动作技能）
2. 加涅教学设计理论（九大教学事件）
3. 建构主义教学设计原则
4. 多元智能教学设计

**教案内容**：
${lessonPlan}

**学科**：${subject}
**年级**：${grade}

请评估教案的：
1. 目标设计（是否符合布鲁姆分类，是否可观测）
2. 活动设计（是否促进学生主动建构）
3. 评估设计（是否多元化、过程性）
4. 差异化设计（是否考虑多元智能）

返回 JSON 格式：
{
  "overall_score": 4.2,
  "dimensions": {
    "goal_design": { "score": 4.5, "comment": "..." },
    "activity_design": { "score": 4.0, "comment": "..." },
    "assessment_design": { "score": 4.2, "comment": "..." },
    "differentiation_design": { "score": 3.8, "comment": "..." }
  },
  "strengths": ["优势1", "优势2"],
  "improvements": ["改进1", "改进2"]
}`;

  try {
    const response = await retryWithBackoff(async () => {
      return await openai.chat.completions.create({
        model: 'deepseek-chat',
        messages: [
          { role: 'system', content: '你是教学评估专家，基于教育理论评估教案质量。' },
          { role: 'user', content: evaluationPrompt },
        ],
        response_format: { type: 'json_object' },
        temperature: 0.7,
        max_tokens: 2000,
      });
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new Error('AI 返回内容为空');
    }

    return JSON.parse(content);
  } catch (error: any) {
    console.error('教案评估错误:', error);
    throw new Error(`教案评估失败: ${error.message || '未知错误'}`);
  }
}

