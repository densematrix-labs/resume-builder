import httpx
from app.core.config import get_settings

settings = get_settings()


async def generate_resume_content(
    job_title: str,
    section: str = "experience",
    context: str = "",
    language: str = "en"
) -> str:
    """Generate resume content using LLM proxy."""
    
    prompts = {
        "experience": f"""Generate 3-4 professional bullet points for a {job_title} position.
Focus on achievements, metrics, and impact. Use action verbs.
Language: {language}
{f"Additional context: {context}" if context else ""}

Return only the bullet points, one per line, starting with •""",
        
        "summary": f"""Write a compelling professional summary (2-3 sentences) for a {job_title}.
Highlight key strengths and career goals.
Language: {language}
{f"Additional context: {context}" if context else ""}""",
        
        "skills": f"""List 8-10 relevant technical and soft skills for a {job_title}.
Return as comma-separated list.
Language: {language}""",
        
        "improve": f"""Improve this resume content to be more impactful and professional:
{context}

Make it achievement-focused with metrics where possible.
Language: {language}"""
    }
    
    prompt = prompts.get(section, prompts["experience"])
    
    async with httpx.AsyncClient(timeout=60.0) as client:
        response = await client.post(
            f"{settings.LLM_PROXY_URL}/v1/chat/completions",
            headers={
                "Authorization": f"Bearer {settings.LLM_PROXY_KEY}",
                "Content-Type": "application/json"
            },
            json={
                "model": "gpt-4o-mini",
                "messages": [
                    {"role": "system", "content": "You are a professional resume writer. Be concise and impactful."},
                    {"role": "user", "content": prompt}
                ],
                "temperature": 0.7,
                "max_tokens": 500
            }
        )
        response.raise_for_status()
        data = response.json()
        return data["choices"][0]["message"]["content"]


async def generate_cover_letter(
    job_title: str,
    company: str,
    resume_summary: str,
    language: str = "en"
) -> str:
    """Generate a cover letter using LLM proxy."""
    
    prompt = f"""Write a professional cover letter for a {job_title} position at {company}.

Based on this candidate summary:
{resume_summary}

Requirements:
- 3 paragraphs: intro, body (achievements), closing
- Professional but personable tone
- Mention specific interest in the company
- Language: {language}

Do not include placeholders like [Your Name] - write a complete letter."""
    
    async with httpx.AsyncClient(timeout=60.0) as client:
        response = await client.post(
            f"{settings.LLM_PROXY_URL}/v1/chat/completions",
            headers={
                "Authorization": f"Bearer {settings.LLM_PROXY_KEY}",
                "Content-Type": "application/json"
            },
            json={
                "model": "gpt-4o-mini",
                "messages": [
                    {"role": "system", "content": "You are a professional career consultant specializing in cover letters."},
                    {"role": "user", "content": prompt}
                ],
                "temperature": 0.7,
                "max_tokens": 800
            }
        )
        response.raise_for_status()
        data = response.json()
        return data["choices"][0]["message"]["content"]
