# TeachMate - AI 教师专业发展教练 V1.0 (MVP)

恭喜！TeachMate V1.0 已经正式封版。这是一个专为 K-12 教师设计的 AI 工具，旨在通过深度分析课堂行为和智能教案生成，助力教师快速成长。

## 🌟 核心功能
- **智能教案生成 (DeepSeek-R1 驱动)**：利用最新的推理模型，生成具有深度逻辑和启发性的教学设计。
- **课堂音频分析 (DeepSeek-V3 驱动)**：多维度分析提问质量、语速及反馈互动。
- **专业文档导出**：支持教案导出为标准的 Word (.docx) 格式，报告支持 PDF 打印。
- **数据可视化**：直观展示教师教学指标的周度改进趋势。

## 🛠 技术栈
- **前端**：Next.js 14, Tailwind CSS, Lucide Icons
- **AI 大脑**：DeepSeek (R1 & V3)
- **存储**：浏览器本地持久化 (LocalStorage)

## 🚀 部署指南 (适合小白)

### 方案一：Vercel 部署 (推荐，免费且最简单)
1.  在 GitHub 上创建一个新仓库，并将本项目代码上传。
2.  登录 [Vercel](https://vercel.com/)。
3.  点击 "Add New" -> "Project"，选择您的仓库。
4.  在 **Environment Variables** (环境变量) 中添加：
    -   `OPENAI_API_KEY`: 您的 DeepSeek API Key。
    -   `OPENAI_BASE_URL`: `https://api.deepseek.com`
5.  点击 "Deploy"。完成后，您将获得一个可以公开访问的网址。

### 方案二：本地运行
1.  确保电脑已安装 [Node.js](https://nodejs.org/)。
2.  在终端执行：`npm install`。
3.  执行：`npm run dev`。
4.  访问：`http://localhost:3000`。

## 📝 V1.0 使用说明
1.  **初次使用**：首页提供了“✨ 导入示例数据”按钮，点击即可瞬间预览产品全貌。
2.  **教案生成**：输入学科和主题后，AI 思考模式大约需要 10-20 秒来推导最优方案，请耐心等待。
3.  **隐私保护**：系统不存储您的任何录音原件，所有分析数据仅保留在您的浏览器本地。

---
*TeachMate - 赋能每一位教师的 AI 助手*

