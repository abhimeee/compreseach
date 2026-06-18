import asyncio

import pytest

from app.providers.base import CompetitorHit, ProviderResult, ProviderStatus, ResearchProvider
from app.providers.http_providers import MockSlowProvider
from app.services.research import CompetitorResearchService, ResearchTimeoutError


class MockFastProvider(ResearchProvider):
    name = "mock_fast"

    def __init__(self, competitors: list[CompetitorHit] | None = None, delay: float = 0.01) -> None:
        self._competitors = competitors or [
            CompetitorHit(name="RivalCo", source=self.name, confidence=0.9),
        ]
        self._delay = delay

    async def find_competitors(self, company: str, industry: str | None = None) -> ProviderResult:
        await asyncio.sleep(self._delay)
        return ProviderResult(
            provider=self.name,
            status=ProviderStatus.SUCCESS,
            competitors=self._competitors,
        )


class MockErrorProvider(ResearchProvider):
    name = "mock_error"

    async def find_competitors(self, company: str, industry: str | None = None) -> ProviderResult:
        return ProviderResult(
            provider=self.name,
            status=ProviderStatus.ERROR,
            error="upstream failure",
        )


@pytest.mark.asyncio
async def test_research_merges_results_from_multiple_providers():
    service = CompetitorResearchService(
        providers=[
            MockFastProvider([CompetitorHit(name="Alpha", source="mock_fast", confidence=0.8)]),
            MockFastProvider([CompetitorHit(name="Beta", source="mock_fast", confidence=0.7)]),
        ],
        provider_timeout=5.0,
        research_timeout=10.0,
    )

    result = await service.research("Acme Corp")

    assert result["company"] == "Acme Corp"
    assert len(result["competitors"]) == 2
    assert result["summary"]["successful"] == 2


@pytest.mark.asyncio
async def test_provider_timeout_returns_timeout_status():
    service = CompetitorResearchService(
        providers=[MockSlowProvider(delay_seconds=2.0)],
        provider_timeout=0.1,
        research_timeout=5.0,
    )

    result = await service.research("Acme Corp")

    assert result["providers"][0]["status"] == ProviderStatus.TIMEOUT
    assert result["summary"]["timed_out"] == 1
    assert result["competitors"] == []


@pytest.mark.asyncio
async def test_research_timeout_raises_when_overall_deadline_exceeded():
    service = CompetitorResearchService(
        providers=[MockSlowProvider(delay_seconds=5.0)],
        provider_timeout=10.0,
        research_timeout=0.2,
    )

    with pytest.raises(ResearchTimeoutError):
        await service.research("Acme Corp")


@pytest.mark.asyncio
async def test_partial_results_when_one_provider_errors():
    service = CompetitorResearchService(
        providers=[
            MockFastProvider(),
            MockErrorProvider(),
        ],
        provider_timeout=5.0,
        research_timeout=10.0,
    )

    result = await service.research("Acme Corp")

    assert result["summary"]["successful"] == 1
    assert result["summary"]["errors"] == 1
    assert len(result["competitors"]) == 1


@pytest.mark.asyncio
async def test_deduplicates_competitors_by_name():
    service = CompetitorResearchService(
        providers=[
            MockFastProvider([CompetitorHit(name="RivalCo", source="a", confidence=0.6)]),
            MockFastProvider([CompetitorHit(name="RivalCo", source="b", confidence=0.9)]),
        ],
        provider_timeout=5.0,
        research_timeout=10.0,
    )

    result = await service.research("Acme Corp")

    assert len(result["competitors"]) == 1
    assert result["competitors"][0]["confidence"] == 0.9
