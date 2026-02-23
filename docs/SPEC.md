# ResumeForge — Kickresume Alternative

Free AI Resume Builder with beautiful templates and powerful AI assistance.

## 竞品信息

| 项目 | 值 |
|------|-----|
| 对标竞品 | Kickresume |
| 竞品 URL | https://www.kickresume.com |
| 预估月流量 | 8M+ users |
| 定价模式 | Freemium, $7-8/month Premium |

## 核心功能（必做）

1. **AI Resume Writer** — GPT-powered resume content generation
   - Generate professional work experience descriptions
   - Suggest skills based on job title
   - Improve existing bullet points
   
2. **Resume Templates** — 10+ ATS-friendly templates
   - Modern, Creative, Professional, Minimalist styles
   - Real-time preview
   - Export to PDF
   
3. **AI Cover Letter Generator** — Auto-generate cover letters
   - Based on resume and job description
   - Customizable tone and length

4. **Resume Sections Editor**
   - Personal Info, Work Experience, Education
   - Skills, Languages, Certifications
   - Drag and drop reordering

## 差异化定位

- ✅ 免费版功能更多（5次/天 AI生成，无水印导出）
- ✅ 无需注册即可预览模板
- ✅ 更快的AI响应（无排队）
- ✅ 更现代的UI/UX

## 痛点解决

| Kickresume痛点 | 我们的方案 |
|---------------|-----------|
| AI功能限制太严 | 免费5次/天，付费无限 |
| 模板千篇一律 | 独特设计风格 |
| 导出要付费 | 免费PDF导出（带水印），付费无水印 |

## 截流关键词（🔴 SEO 必用）

### Primary（首页 Title/H1）
- `kickresume alternative`
- `kickresume free`
- `free resume builder ai`

### Secondary（独立页面）
- `kickresume vs resumeforge`
- `best kickresume alternatives 2026`
- `free ai resume builder`

### Long-tail（Programmatic SEO）
- `kickresume alternative no watermark`
- `kickresume alternative for software engineer`
- `kickresume alternative for nurse`
- `free resume builder for [job title]`

## 技术方案

- 前端：React + Vite (TypeScript) + TailwindCSS
- 后端：Python FastAPI
- AI：通过 llm-proxy.densematrix.ai (GPT-4)
- PDF生成：react-pdf
- 部署：Docker → langsheng
- 端口：Frontend 30105, Backend 30106

## 完成标准

- [ ] 核心功能可用（模板选择、编辑、AI生成、PDF导出）
- [ ] 部署到 resume-builder.demo.densematrix.ai
- [ ] SEO 截流关键词已覆盖
- [ ] Health check 通过
- [ ] 支付集成（Creem）
- [ ] i18n（7种语言）
