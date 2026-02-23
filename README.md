# ResumeForge — Free AI Resume Builder

A modern, AI-powered resume builder. The best free alternative to Kickresume.

![ResumeForge](https://resume-builder.demo.densematrix.ai/og-image.png)

## Features

- 🤖 **AI Resume Writer** — Generate professional bullet points with GPT-4
- 📄 **Beautiful Templates** — 10+ ATS-friendly templates
- 📧 **Cover Letter Generator** — Auto-generate personalized cover letters
- 🌍 **Multi-language** — Support for 7 languages
- 📱 **Mobile Friendly** — Build resumes on any device
- 💰 **Free Tier** — 5 AI generations per day, no watermark

## Tech Stack

- **Frontend**: React + Vite + TypeScript + TailwindCSS
- **Backend**: Python FastAPI
- **AI**: GPT-4 via LLM Proxy
- **Database**: SQLite
- **Payment**: Creem MoR

## Quick Start

```bash
# Clone the repo
git clone https://github.com/densematrix-labs/resume-builder.git
cd resume-builder

# Copy environment variables
cp .env.example .env

# Start with Docker
docker compose up -d
```

Visit http://localhost:30105

## Development

### Backend

```bash
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

## Testing

```bash
# Backend tests
cd backend
pytest --cov=app --cov-report=term-missing

# Frontend tests
cd frontend
npm run test:coverage
```

## Deployment

The application is deployed to `resume-builder.demo.densematrix.ai` via Docker.

## License

MIT
