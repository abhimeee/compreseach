import asyncio
import time
from dataclasses import asdict

from app.config import settings
from app.providers.base import (
    CompetitorHit,
    ProviderResult,
    ProviderStatus,
    ResearchProvider,
)


class ResearchTimeoutError(Exception):
    """Raised when the overall research operation exceeds its deadline."""


class CompetitorResearchService:
    def __init__(
        self,
        providers: list[ResearchProvider],
        provider_timeout: float | None = None,
        research_timeout: float | None = None,
    ) -> None:
        self._providers = providers
        self._provider_timeout = (
            provider_timeout
            if provider_timeout is not None
            else settings.provider_timeout_seconds
        )
        self._research_timeout = (
            research_timeout
            if research_timeout is not None
            else settings.research_timeout_seconds
        )

    async def research(
        self,
        company: str,
        industry: str | None = None,
    ) -> dict:
        start = time.perf_counter()

        provider_tasks = [
            self._call_provider_with_timeout(provider, company, industry)
            for provider in self._providers
        ]

        try:
            provider_results: list[ProviderResult | BaseException] = await asyncio.wait_for(
                asyncio.gather(*provider_tasks, return_exceptions=True),
                timeout=self._research_timeout,
            )
        except asyncio.TimeoutError as exc:
            raise ResearchTimeoutError(
                f"Research did not complete within {self._research_timeout}s"
            ) from exc

        results: list[ProviderResult] = []
        for result in provider_results:
            if isinstance(result, BaseException):
                results.append(
                    ProviderResult(
                        provider="unknown",
                        status=ProviderStatus.ERROR,
                        error=str(result),
                    )
                )
            else:
                results.append(result)

        competitors = self._merge_competitors(results)
        elapsed_ms = (time.perf_counter() - start) * 1000

        return {
            "company": company,
            "industry": industry,
            "competitors": [asdict(c) for c in competitors],
            "providers": [asdict(r) for r in results],
            "summary": {
                "total_providers": len(results),
                "successful": sum(1 for r in results if r.status == ProviderStatus.SUCCESS),
                "timed_out": sum(1 for r in results if r.status == ProviderStatus.TIMEOUT),
                "errors": sum(1 for r in results if r.status == ProviderStatus.ERROR),
                "skipped": sum(1 for r in results if r.status == ProviderStatus.SKIPPED),
                "elapsed_ms": round(elapsed_ms, 2),
                "research_timeout_seconds": self._research_timeout,
                "provider_timeout_seconds": self._provider_timeout,
            },
        }

    async def _call_provider_with_timeout(
        self,
        provider: ResearchProvider,
        company: str,
        industry: str | None,
    ) -> ProviderResult:
        try:
            return await asyncio.wait_for(
                provider.find_competitors(company, industry),
                timeout=self._provider_timeout,
            )
        except asyncio.TimeoutError:
            return ProviderResult(
                provider=provider.name,
                status=ProviderStatus.TIMEOUT,
                error=f"Provider exceeded {self._provider_timeout}s deadline",
            )

    def _merge_competitors(self, results: list[ProviderResult]) -> list[CompetitorHit]:
        by_name: dict[str, CompetitorHit] = {}

        for result in results:
            if result.status != ProviderStatus.SUCCESS:
                continue
            for hit in result.competitors:
                key = hit.name.lower()
                existing = by_name.get(key)
                if existing is None or hit.confidence > existing.confidence:
                    by_name[key] = hit
                elif existing and hit.source and existing.source != hit.source:
                    existing.description = existing.description or hit.description

        merged = sorted(by_name.values(), key=lambda h: h.confidence, reverse=True)
        return merged
