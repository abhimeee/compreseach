from abc import ABC, abstractmethod
from dataclasses import dataclass, field
from enum import Enum


class ProviderStatus(str, Enum):
    SUCCESS = "success"
    TIMEOUT = "timeout"
    ERROR = "error"
    SKIPPED = "skipped"


@dataclass
class CompetitorHit:
    name: str
    description: str | None = None
    source: str | None = None
    url: str | None = None
    confidence: float = 0.5


@dataclass
class ProviderResult:
    provider: str
    status: ProviderStatus
    competitors: list[CompetitorHit] = field(default_factory=list)
    error: str | None = None
    elapsed_ms: float | None = None


class ResearchProvider(ABC):
    name: str

    @abstractmethod
    async def find_competitors(self, company: str, industry: str | None = None) -> ProviderResult:
        """Query an external API for competitors of the given company."""
