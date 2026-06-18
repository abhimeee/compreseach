from app.providers.base import ResearchProvider
from app.providers.http_providers import NewsProvider, TavilyProvider, WikipediaProvider


def get_default_providers() -> list[ResearchProvider]:
    return [
        WikipediaProvider(),
        TavilyProvider(),
        NewsProvider(),
    ]
