/**
 * 百度语音识别 API（免费方案）
 * 免费额度：每天 5 万次调用
 * 文档：https://ai.baidu.com/ai-doc/SPEECH/Vk38lxily
 */

// 百度语音识别配置
const BAIDU_API_KEY = process.env.BAIDU_SPEECH_API_KEY || '';
const BAIDU_SECRET_KEY = process.env.BAIDU_SPEECH_SECRET_KEY || '';
const BAIDU_APP_ID = process.env.BAIDU_SPEECH_APP_ID || '';

// 获取 Access Token
async function getBaiduAccessToken(): Promise<string> {
  if (!BAIDU_API_KEY || !BAIDU_SECRET_KEY) {
    throw new Error('百度语音识别 API Key 或 Secret Key 未配置');
  }

  const url = `https://aip.baidubce.com/oauth/2.0/token?grant_type=client_credentials&client_id=${BAIDU_API_KEY}&client_secret=${BAIDU_SECRET_KEY}`;
  
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`获取百度 Access Token 失败: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();
  
  if (data.error) {
    throw new Error(`百度 API 错误: ${data.error_description || data.error}`);
  }

  return data.access_token;
}

/**
 * 使用百度语音识别 API 进行音频转文字
 * @param file 音频文件
 * @returns 转录文本
 */
export async function transcribeAudioWithBaidu(file: File): Promise<string> {
  // 检查配置
  if (!BAIDU_API_KEY || !BAIDU_SECRET_KEY) {
    throw new Error('百度语音识别未配置。请设置 BAIDU_SPEECH_API_KEY 和 BAIDU_SPEECH_SECRET_KEY 环境变量');
  }

  try {
    // 1. 获取 Access Token
    const accessToken = await getBaiduAccessToken();

    // 2. 将文件转换为 Base64
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const base64Audio = buffer.toString('base64');

    // 3. 调用百度语音识别 API
    // 使用短语音识别 API（免费额度：每天5万次）
    const apiUrl = `https://vop.baidu.com/server_api?access_token=${accessToken}`;
    
    // 百度API需要JSON格式的请求体
    const requestBody = {
      format: getFileFormat(file.name), // 音频格式
      rate: 16000, // 采样率（16000 或 8000）
      channel: 1, // 声道数（1=单声道，2=双声道）
      cuid: BAIDU_APP_ID || 'teachmate', // 用户唯一标识
      len: buffer.length, // 音频文件大小（字节数）
      speech: base64Audio, // Base64 编码的音频数据
      dev_pid: 80001, // 语言模型（80001=中文普通话，1537=中文普通话（纯中文识别））
    };

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`百度语音识别 API 错误: ${response.status} ${errorText}`);
    }

    const result = await response.json();

    // 4. 处理返回结果
    if (result.err_no !== 0) {
      // 错误码说明
      const errorMessages: Record<number, string> = {
        3300: '输入参数不正确',
        3301: '音频质量过差',
        3302: '鉴权失败',
        3303: '语音服务器后端问题',
        3304: '用户的请求QPS超限',
        3305: '用户的日调用量超限',
        3306: '用户的月调用量超限',
        3307: '语音服务器后端识别出错问题',
        3308: '音频过长',
        3309: '音频数据问题',
        3310: '输入的音频文件过大',
        3311: '采样率rate参数不在选项里',
        3312: '音频格式format参数不在选项里',
        3313: '音频时长过长',
        3314: '音频时长过短',
      };

      const errorMsg = errorMessages[result.err_no] || `错误码: ${result.err_no}`;
      throw new Error(`百度语音识别失败: ${errorMsg}`);
    }

    // 5. 提取识别结果
    if (result.result && result.result.length > 0) {
      return result.result.join(' '); // 多个结果用空格连接
    }

    return '识别结果为空';

  } catch (error: any) {
    console.error('百度语音识别错误:', error);
    
    // 如果是配置错误，提供明确提示
    if (error.message?.includes('未配置')) {
      throw error;
    }
    
    // 其他错误
    throw new Error(`百度语音识别失败: ${error.message || '未知错误'}`);
  }
}

/**
 * 根据文件名获取音频格式
 */
function getFileFormat(filename: string): string {
  const ext = filename.toLowerCase().split('.').pop();
  const formatMap: Record<string, string> = {
    'mp3': 'mp3',
    'wav': 'wav',
    'm4a': 'm4a',
    'amr': 'amr',
    'aac': 'aac',
    'wma': 'wma',
    'flac': 'flac',
    'opus': 'opus',
  };
  return formatMap[ext || ''] || 'wav';
}

/**
 * 检查百度语音识别是否已配置
 */
export function isBaiduSpeechConfigured(): boolean {
  return !!(BAIDU_API_KEY && BAIDU_SECRET_KEY);
}

