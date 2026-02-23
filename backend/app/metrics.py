"""
Prometheus Metrics for Resume Builder.
"""
import os
from prometheus_client import Counter, Histogram, Gauge, generate_latest, CONTENT_TYPE_LATEST
from fastapi import APIRouter, Request
from fastapi.responses import Response

TOOL_NAME = os.getenv("TOOL_NAME", "resume-builder")

# HTTP Metrics
http_requests = Counter(
    "http_requests_total",
    "Total HTTP requests",
    ["tool", "endpoint", "method", "status"]
)

http_request_duration = Histogram(
    "http_request_duration_seconds",
    "HTTP request duration",
    ["tool", "endpoint", "method"]
)

# Business Metrics
payment_success = Counter(
    "payment_success_total",
    "Successful payments",
    ["tool", "product_sku"]
)

payment_revenue = Counter(
    "payment_revenue_cents_total",
    "Total revenue in cents",
    ["tool"]
)

tokens_consumed = Counter(
    "tokens_consumed_total",
    "Tokens consumed",
    ["tool"]
)

free_trial_used = Counter(
    "free_trial_used_total",
    "Free trial generations used",
    ["tool"]
)

core_function_calls = Counter(
    "core_function_calls_total",
    "Core function calls",
    ["tool", "function"]
)

# SEO Metrics
page_views = Counter(
    "page_views_total",
    "Page views",
    ["tool", "path"]
)

crawler_visits = Counter(
    "crawler_visits_total",
    "Crawler visits",
    ["tool", "bot"]
)

# Metrics endpoint
metrics_router = APIRouter()


@metrics_router.get("/metrics")
async def metrics():
    """Prometheus metrics endpoint."""
    return Response(generate_latest(), media_type=CONTENT_TYPE_LATEST)


# Bot detection patterns
BOT_PATTERNS = ["Googlebot", "bingbot", "Baiduspider", "YandexBot", "DuckDuckBot", "Slurp"]


async def track_request(request: Request, response, duration: float):
    """Track HTTP request metrics."""
    endpoint = request.url.path
    method = request.method
    status = response.status_code
    
    http_requests.labels(
        tool=TOOL_NAME,
        endpoint=endpoint,
        method=method,
        status=status
    ).inc()
    
    http_request_duration.labels(
        tool=TOOL_NAME,
        endpoint=endpoint,
        method=method
    ).observe(duration)
    
    # Track bot visits
    ua = request.headers.get("user-agent", "")
    for bot in BOT_PATTERNS:
        if bot.lower() in ua.lower():
            crawler_visits.labels(tool=TOOL_NAME, bot=bot).inc()
            break
