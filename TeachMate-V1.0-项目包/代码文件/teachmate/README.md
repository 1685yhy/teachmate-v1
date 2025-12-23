# TeachMate 项目说明文档

## 📖 目录

1. [项目简介](#项目简介)
2. [技术栈](#技术栈)
3. [安装与运行](#安装与运行)
4. [项目结构](#项目结构)
5. [核心功能说明](#核心功能说明)
6. [API 接口文档](#api-接口文档)
7. [环境变量配置](#环境变量配置)
8. [常见问题](#常见问题)

---

## 项目简介

TeachMate 是一个基于 Next.js 和 DeepSeek AI 的教师专业发展工具，帮助教师通过 AI 分析改进教学行为，并快速生成高质量教案。

### 核心特性

- 🤖 **AI 驱动**：使用 DeepSeek-R1 和 V3 模型
- 📊 **数据分析**：多维度教学行为分析
- 📝 **智能生成**：一键生成专业教案
- 💾 **本地存储**：数据安全，隐私保护

---

## 技术栈

### 前端
- **Next.js 14.2.3** - React 框架
- **TypeScript** - 类型安全
- **Tailwind CSS** - 样式框架
- **Lucide React** - 图标库

### AI 服务
- **DeepSeek-R1** - 推理模型（教案生成）
- **DeepSeek-V3** - 对话模型（数据分析）

### 工具库
- **docx** - Word 文档生成
- **file-saver** - 文件下载
- **react-markdown** - Markdown 渲染

---

## 安装与运行

### 前置要求

- Node.js 18+ 
- npm 或 yarn

### 安装步骤

```bash
# 1. 克隆或下载项目代码
cd teachmate

# 2. 安装依赖
npm install

# 3. 配置环境变量（可选）
# 创建 .env.local 文件
OPENAI_API_KEY=your_deepseek_api_key
OPENAI_BASE_URL=https://api.deepseek.com

# 4. 启动开发服务器
npm run dev

# 5. 访问应用
# 打开浏览器访问 http://localhost:3000
```

### 构建生产版本

```bash
npm run build
npm start
```

---

## 项目结构

```
teachmate/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── api/                # API 路由
│   │   │   ├── analysis/      # 课堂分析 API
│   │   │   ├── lesson-plan/   # 教案生成 API
│   │   │   └── health/        # 健康检查 API
│   │   ├── analysis/          # 课堂分析页面
│   │   ├── lesson-plan/       # 教案生成页面
│   │   ├── layout.tsx         # 根布局
│   │   ├── page.tsx           # 首页
│   │   ├── globals.css        # 全局样式
│   │   └── markdown.css       # Markdown 样式
│   ├── components/            # React 组件
│   │   ├── Header.tsx         # 顶部导航栏
│   │   └── Sidebar.tsx        # 侧边栏
│   └── lib/                   # 工具函数
│       ├── openai.ts          # AI 服务封装
│       └── utils.ts           # 通用工具函数
├── package.json               # 项目配置
├── tsconfig.json              # TypeScript 配置
├── tailwind.config.ts         # Tailwind 配置
└── README.md                  # 项目说明
```

---

## 核心功能说明

### 1. 智能教案生成

**文件位置**：`src/app/lesson-plan/page.tsx`

**功能流程**：
1. 用户填写学科、年级、主题、课时
2. 调用 `/api/lesson-plan` API
3. 使用 DeepSeek-R1 生成教案
4. 渲染 Markdown 格式的教案内容
5. 支持复制和导出 Word

**AI 提示词**：见 `src/lib/openai.ts` 中的 `generateLessonPlan` 函数

### 2. 课堂音频分析

**文件位置**：`src/app/analysis/page.tsx`

**功能流程**：
1. 用户上传音频文件（MP3/M4A/WAV）
2. 填写基本信息（学科、年级）
3. 调用 `/api/analysis` API
4. 使用 DeepSeek-V3 分析教学行为
5. 展示分析报告和改进建议

**分析指标**：
- 开放式问题比例（≥25% 为良好）
- 教师语速（180-220 字/分钟为适中）
- 积极反馈次数（≥5次/45分钟为良好）

### 3. 数据概览

**文件位置**：`src/app/page.tsx`

**功能**：
- 统计本周分析课时数、生成教案数
- 计算平均开放式问题比例和积极反馈次数
- 展示开放式问题比例趋势图（最近 5 次）
- 显示最近分析记录

**数据存储**：使用浏览器 LocalStorage

---

## API 接口文档

### POST /api/lesson-plan

生成智能教案

**请求体**：
```json
{
  "subject": "math",
  "grade": "middle",
  "theme": "一元一次方程",
  "duration": "45"
}
```

**响应**：
```json
{
  "content": "# 教案内容（Markdown 格式）"
}
```

### POST /api/analysis

分析课堂音频

**请求**：FormData
- `file`: File（音频文件）
- `subject`: string（学科）
- `grade`: string（年级）

**响应**：
```json
{
  "transcript": "转录文本",
  "analysis": {
    "open_question_ratio": 0.15,
    "speech_rate": 210,
    "positive_feedback_count": 3,
    "suggestions": [...]
  },
  "meta": {
    "subject": "数学",
    "grade": "七年级",
    "date": "2024-01-15T16:35:00Z"
  }
}
```

### GET /api/health

健康检查

**响应**：
```json
{
  "status": "ok",
  "message": "TeachMate API is running",
  "timestamp": "2024-01-15T16:35:00Z"
}
```

---

## 环境变量配置

### 必需变量

| 变量名 | 说明 | 示例 |
|--------|------|------|
| `OPENAI_API_KEY` | DeepSeek API Key | `sk-xxx...` |
| `OPENAI_BASE_URL` | DeepSeek API 地址 | `https://api.deepseek.com` |

### 配置方式

**本地开发**：创建 `.env.local` 文件
```bash
OPENAI_API_KEY=your_api_key
OPENAI_BASE_URL=https://api.deepseek.com
```

**Vercel 部署**：在项目 Settings → Environment Variables 中添加

---

## 常见问题

### Q1: 教案生成很慢怎么办？

A: DeepSeek-R1 是推理模型，需要深度思考，通常需要 10-20 秒。这是正常现象，请耐心等待。

### Q2: 音频分析失败？

A: 检查以下几点：
1. 确认 API Key 是否正确配置
2. 检查音频文件格式（支持 MP3/M4A/WAV）
3. 文件大小不超过 500MB
4. 查看浏览器控制台的错误信息

### Q3: 数据丢失了？

A: 当前版本使用 LocalStorage 存储，数据存储在浏览器本地。如果清除浏览器缓存，数据会丢失。建议定期导出重要数据。

### Q4: 如何部署到生产环境？

A: 推荐使用 Vercel：
1. 将代码推送到 GitHub
2. 在 Vercel 导入项目
3. 配置环境变量
4. 一键部署

### Q5: 支持视频分析吗？

A: V1.0 版本暂不支持视频分析，这是 V2.0 的规划功能。

---

## 开发指南

### 添加新功能

1. 在 `src/app/` 下创建新页面
2. 如需 API，在 `src/app/api/` 下创建路由
3. 复用组件放在 `src/components/`
4. 工具函数放在 `src/lib/`

### 代码规范

- 使用 TypeScript 严格模式
- 组件使用函数式组件 + Hooks
- 样式使用 Tailwind CSS
- 遵循 Next.js 14 App Router 规范

### 调试技巧

- 使用浏览器开发者工具查看网络请求
- 查看 Vercel Functions 日志（生产环境）
- 使用 `console.log` 调试（开发环境）

---

## 更新日志

### V1.0 (2024-01-15)
- ✅ 智能教案生成功能
- ✅ 课堂音频分析功能
- ✅ 数据可视化展示
- ✅ Word 文档导出
- ✅ PDF 报告导出

---

## 联系方式

- **项目地址**：https://github.com/1685yhy/teachmate-v1
- **问题反馈**：通过 GitHub Issues

---

**TeachMate - 让 AI 成为您最专业的教学伙伴**
