# TeachMate - AI 教师专业发展教练 V1.0 (MVP)

恭喜！TeachMate V1.0 已经正式封版。这是一个专为 K-12 教师设计的 AI 工具，旨在通过深度分析课堂行为和智能教案生成，助力教师快速成长。

## 🌟 核心功能
- **智能教案生成 (DeepSeek-R1 驱动)**：利用最新的推理模型，生成具有深度逻辑和启发性的教学设计。
- **课堂音频分析 (DeepSeek-V3 驱动)**：多维度分析提问质量、语速及反馈互动。
- **专业文档导出**：支持教案导出为标准的 Word (.docx) 格式，报告支持 PDF 打印。
- **数据可视化**：直观展示教师教学指标的周度改进趋势。

## 🛠 技术栈
- **前端**：Next.js 14, Tailwind CSS, Lucide Icons
- **AI 大脑**：DeepSeek (R1 & V3) + OpenAI Whisper（音频转文字）
- **存储**：浏览器本地持久化 (LocalStorage)

## 🚀 部署指南 (适合小白)

### 方案一：Vercel 部署 (推荐，免费且最简单)
1.  在 GitHub 上创建一个新仓库，并将本项目代码上传。
2.  登录 [Vercel](https://vercel.com/)。
3.  点击 "Add New" -> "Project"，选择您的仓库。
4.  在 **Environment Variables** (环境变量) 中添加：
    -   `OPENAI_API_KEY`: 您的 DeepSeek API Key（用于教案生成和课堂分析）
    -   `OPENAI_BASE_URL`: `https://api.deepseek.com`
    -   `OPENAI_WHISPER_API_KEY`: 您的 OpenAI API Key（用于音频转文字，可选）
       - 如果不配置，系统会使用模拟转录或手动输入
       - 如需真实音频转录，请前往 [OpenAI](https://platform.openai.com/api-keys) 获取 API Key
5.  点击 "Deploy"。完成后，您将获得一个可以公开访问的网址。

### 方案二：本地运行
1.  确保电脑已安装 [Node.js](https://nodejs.org/)。
2.  在终端执行：`npm install`。
3.  执行：`npm run dev`。
4.  访问：`http://localhost:3000`。

## 📝 V1.0 使用说明
1.  **初次使用**：首页提供了"✨ 导入示例数据"按钮，点击即可瞬间预览产品全貌。
2.  **教案生成**：输入学科和主题后，AI 思考模式大约需要 10-20 秒来推导最优方案，请耐心等待。
3.  **音频转录**：
    - **方式一（推荐）**：配置 `OPENAI_WHISPER_API_KEY` 后，上传音频/视频文件，系统会自动使用 Whisper 进行真实转录
    - **方式二**：在"基本信息"步骤中勾选"手动输入课堂实录"，粘贴或输入课堂对话内容
    - **方式三**：如果未配置 Whisper API，系统会使用基于学科和年级的模拟转录
4.  **隐私保护**：系统不存储您的任何录音原件，所有分析数据仅保留在您的浏览器本地。

## 🔧 音频转录 API 配置说明

系统支持两种音频转文字方案，**推荐使用百度语音识别（免费）**：

### 方案一：百度语音识别（推荐，免费）⭐

#### 为什么选择百度语音识别？
- ✅ **完全免费**：每天 5 万次免费调用额度
- ✅ **中文识别准确**：专为中文优化
- ✅ **配置简单**：只需 API Key 和 Secret Key
- ✅ **支持长音频**：最长支持 60 秒

#### 如何获取百度 API Key？
1. 访问 [百度智能云](https://cloud.baidu.com/)
2. 注册/登录账号
3. 进入"产品服务" → "语音技术" → "短语音识别"
4. 创建应用，获取 `API Key` 和 `Secret Key`

#### 配置方式
**本地开发**：在 `.env.local` 文件中添加：
```bash
BAIDU_SPEECH_API_KEY=your-api-key
BAIDU_SPEECH_SECRET_KEY=your-secret-key
BAIDU_SPEECH_APP_ID=your-app-id（可选）
```

**Vercel 部署**：在项目 Settings → Environment Variables 中添加：
- `BAIDU_SPEECH_API_KEY`: 您的 API Key
- `BAIDU_SPEECH_SECRET_KEY`: 您的 Secret Key
- `BAIDU_SPEECH_APP_ID`: 您的 App ID（可选）

#### 注意事项
- 免费额度：每天 5 万次调用
- 支持格式：MP3、WAV、M4A、AMR、AAC、WMA、FLAC、OPUS
- 音频时长：最长 60 秒（超过会自动分段）

---

### 方案二：OpenAI Whisper（付费）

#### 为什么需要 Whisper API？
- Whisper 是 OpenAI 的语音转文字模型，准确度高，支持多语言
- 配置后可以自动将上传的音频/视频转换为文字，无需手动输入

#### 如何获取 OpenAI API Key？
1. 访问 [OpenAI Platform](https://platform.openai.com/api-keys)
2. 注册/登录账号
3. 点击 "Create new secret key"
4. 复制 API Key（格式：`sk-...`）

#### 配置方式
**本地开发**：在 `.env.local` 文件中添加：
```bash
OPENAI_WHISPER_API_KEY=sk-your-openai-api-key-here
```

**Vercel 部署**：在项目 Settings → Environment Variables 中添加：
- 变量名：`OPENAI_WHISPER_API_KEY`
- 变量值：您的 OpenAI API Key

#### 注意事项
- Whisper API 需要付费（按使用量计费，约 $0.006/分钟）
- 支持的文件格式：MP3、M4A、WAV、MP4、MOV
- 最大文件大小：25MB

---

### 方案三：手动输入（无需配置）

如果未配置任何 API，系统会：
1. 优先使用手动输入的课堂实录
2. 如果没有手动输入，使用基于学科和年级的模拟转录

### 优先级说明

系统按以下优先级选择转录方案：
1. **手动输入的课堂实录**（最高优先级）
2. **百度语音识别**（如果已配置）
3. **OpenAI Whisper**（如果已配置）
4. **模拟转录**（后备方案）

---
*TeachMate - 赋能每一位教师的 AI 助手*

