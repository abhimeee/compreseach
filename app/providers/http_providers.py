import asyncio
import time

import httpx

from app.config import settings
from app.providers.base import CompetitorHit, ProviderResult, ProviderStatus, ResearchProvider


class WikipediaProvider(ResearchProvider):
    """Uses the free Wikipedia OpenSearch API to find related companies."""

    name = "wikipedia"
    BASE_URL = "https://en.wikipedia.org/w/api.php"

    def __init__(self, timeout: float | None = None) -> None:
        self._timeout = timeout if timeout is not None else settings.provider_timeout_seconds

    async def find_competitors(self, company: str, industry: str | None = None) -> ProviderResult:
        start = time.perf_counter()
        query = f"{company} competitors" if not industry else f"{company} {industry} competitors"

        try:
            async with httpx.AsyncClient(timeout=httpx.Timeout(self._timeout)) as client:
                response = await client.get(
                    self.BASE_URL,
                    params={
                        "action": "opensearch",
                        "search": query,
                        "limit": 5,
                        "format": "json",
                    },
                )
                response.raise_for_status()
                data = response.json()

            titles: list[str] = data[1] if len(data) > 1 else []
            urls: list[str] = data[3] if len(data) > 3 else []

            competitors = [
                CompetitorHit(
                    name=title,
                    description=f"Related result from Wikipedia search for '{query}'",
                    source=self.name,
                    url=url if i < len(urls) else None,
                    confidence=0.6,
                )
                for i, title in enumerate(titles)
                if title.lower() != company.lower()
            ]

            return ProviderResult(
                provider=self.name,
                status=ProviderStatus.SUCCESS,
                competitors=competitors,
                elapsed_ms=(time.perf_counter() - start) * 1000,
            )
        except httpx.TimeoutException:
            return ProviderResult(
                provider=self.name,
                status=ProviderStatus.TIMEOUT,
                error=f"Wikipedia API did not respond within {self._timeout}s",
                elapsed_ms=(time.perf_counter() - start) * 1000,
            )
        except httpx.HTTPError as exc:
            return ProviderResult(
                provider=self.name,
                status=ProviderStatus.ERROR,
                error=str(exc),
                elapsed_ms=(time.perf_counter() - start) * 1000,
            )


class TavilyProvider(ResearchProvider):
    """Web search via Tavily API (requires TAVILY_API_KEY)."""

    name = "tavily"
    BASE_URL = "https://api.tavily.com/search"

    def __init__(self, api_key: str | None = None, timeout: float | None = None) -> None:
        self._api_key = api_key if api_key is not None else settings.tavily_api_key
        self._timeout = timeout if timeout is not None else settings.provider_timeout_seconds

    async def find_competitors(self, company: str, industry: str | None = None) -> ProviderResult:
        if not self._api_key:
            return ProviderResult(
                provider=self.name,
                status=ProviderStatus.SKIPPED,
                error="TAVILY_API_KEY not configured",
            )

        start = time.perf_counter()
        query = f"main competitors of {company}"
        if industry:
            query += f" in {industry} industry"

        try:
            async with httpx.AsyncClient(timeout=httpx.Timeout(self._timeout)) as client:
                response = await client.post(
                    self.BASE_URL,
                    json={
                        "api_key": self._api_key,
                        "query": query,
                        "max_results": 5,
                        "search_depth": "basic",
                    },
                )
                response.raise_for_status()
                data = response.json()

            competitors: list[CompetitorHit] = []
            for result in data.get("results", []):
                title = result.get("title", "")
                content = result.get("content", "")
                url = result.get("url")
                for name in _extract_names_from_text(content, company):
                    competitors.append(
                        CompetitorHit(
                            name=name,
                            description=content[:200] if content else None,
                            source=self.name,
                            url=url,
                            confidence=0.75,
                        )
                    )
                if not competitors and title:
                    competitors.append(
                        CompetitorHit(
                            name=title,
                            description=content[:200] if content else None,
                            source=self.name,
                            url=url,
                            confidence=0.5,
                        )
                    )

            return ProviderResult(
                provider=self.name,
                status=ProviderStatus.SUCCESS,
                competitors=_dedupe_hits(competitors),
                elapsed_ms=(time.perf_counter() - start) * 1000,
            )
        except httpx.TimeoutException:
            return ProviderResult(
                provider=self.name,
                status=ProviderStatus.TIMEOUT,
                error=f"Tavily API did not respond within {self._timeout}s",
                elapsed_ms=(time.perf_counter() - start) * 1000,
            )
        except httpx.HTTPError as exc:
            return ProviderResult(
                provider=self.name,
                status=ProviderStatus.ERROR,
                error=str(exc),
                elapsed_ms=(time.perf_counter() - start) * 1000,
            )


class NewsProvider(ResearchProvider):
    """News search via NewsAPI (requires NEWS_API_KEY)."""

    name = "news"
    BASE_URL = "https://newsapi.org/v2/everything"

    def __init__(self, api_key: str | None = None, timeout: float | None = None) -> None:
        self._api_key = api_key if api_key is not None else settings.news_api_key
        self._timeout = timeout if timeout is not None else settings.provider_timeout_seconds

    async def find_competitors(self, company: str, industry: str | None = None) -> ProviderResult:
        if not self._api_key:
            return ProviderResult(
                provider=self.name,
                status=ProviderStatus.SKIPPED,
                error="NEWS_API_KEY not configured",
            )

        start = time.perf_counter()
        query = f'"{company}" AND (competitor OR rivals OR "market share")'
        if industry:
            query += f" AND {industry}"

        try:
            async with httpx.AsyncClient(timeout=httpx.Timeout(self._timeout)) as client:
                response = await client.get(
                    self.BASE_URL,
                    params={"q": query, "pageSize": 5, "sortBy": "relevancy"},
                    headers={"X-Api-Key": self._api_key},
                )
                response.raise_for_status()
                data = response.json()

            competitors: list[CompetitorHit] = []
            for article in data.get("articles", []):
                title = article.get("title", "")
                description = article.get("description") or article.get("content", "")
                url = article.get("url")
                for name in _extract_names_from_text(f"{title} {description}", company):
                    competitors.append(
                        CompetitorHit(
                            name=name,
                            description=description[:200] if description else None,
                            source=self.name,
                            url=url,
                            confidence=0.65,
                        )
                    )

            return ProviderResult(
                provider=self.name,
                status=ProviderStatus.SUCCESS,
                competitors=_dedupe_hits(competitors),
                elapsed_ms=(time.perf_counter() - start) * 1000,
            )
        except httpx.TimeoutException:
            return ProviderResult(
                provider=self.name,
                status=ProviderStatus.TIMEOUT,
                error=f"News API did not respond within {self._timeout}s",
                elapsed_ms=(time.perf_counter() - start) * 1000,
            )
        except httpx.HTTPError as exc:
            return ProviderResult(
                provider=self.name,
                status=ProviderStatus.ERROR,
                error=str(exc),
                elapsed_ms=(time.perf_counter() - start) * 1000,
            )


class MockSlowProvider(ResearchProvider):
    """Test provider that simulates a slow API for timeout testing."""

    name = "mock_slow"

    def __init__(self, delay_seconds: float = 60.0) -> None:
        self._delay = delay_seconds

    async def find_competitors(self, company: str, industry: str | None = None) -> ProviderResult:
        await asyncio.sleep(self._delay)
        return ProviderResult(
            provider=self.name,
            status=ProviderStatus.SUCCESS,
            competitors=[CompetitorHit(name="SlowCorp", source=self.name)],
        )


def _extract_names_from_text(text: str, exclude: str) -> list[str]:
    """Heuristic: pull capitalized multi-word phrases that look like company names."""
    import re

    if not text:
        return []

    pattern = r"\b([A-Z][a-zA-Z0-9&]+(?:\s+[A-Z][a-zA-Z0-9&]+){0,2})\b"
    candidates = re.findall(pattern, text)
    exclude_lower = exclude.lower()
    seen: set[str] = set()
    names: list[str] = []

    for candidate in candidates:
        normalized = candidate.strip()
        if len(normalized) < 3:
            continue
        if normalized.lower() == exclude_lower:
            continue
        key = normalized.lower()
        if key in seen:
            continue
        seen.add(key)
        names.append(normalized)
        if len(names) >= 3:
            break

    return names


def _dedupe_hits(hits: list[CompetitorHit]) -> list[CompetitorHit]:
    seen: set[str] = set()
    result: list[CompetitorHit] = []
    for hit in hits:
        key = hit.name.lower()
        if key in seen:
            continue
        seen.add(key)
        result.append(hit)
    return result
