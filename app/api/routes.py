from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel, Field

from app.providers import get_default_providers
from app.services.research import CompetitorResearchService, ResearchTimeoutError

router = APIRouter(prefix="/api/v1", tags=["research"])


class ResearchRequest(BaseModel):
    company: str = Field(..., min_length=1, max_length=200, examples=["Stripe"])
    industry: str | None = Field(default=None, max_length=200, examples=["fintech payments"])


class ResearchResponse(BaseModel):
    company: str
    industry: str | None
    competitors: list[dict]
    providers: list[dict]
    summary: dict


@router.get("/health")
async def health() -> dict[str, str]:
    return {"status": "ok"}


@router.post("/research", response_model=ResearchResponse)
async def research_competitors(body: ResearchRequest) -> dict:
    service = CompetitorResearchService(providers=get_default_providers())
    try:
        return await service.research(body.company, body.industry)
    except ResearchTimeoutError as exc:
        raise HTTPException(status_code=504, detail=str(exc)) from exc


@router.get("/research/{company}", response_model=ResearchResponse)
async def research_competitors_get(
    company: str,
    industry: str | None = Query(default=None),
) -> dict:
    service = CompetitorResearchService(providers=get_default_providers())
    try:
        return await service.research(company, industry)
    except ResearchTimeoutError as exc:
        raise HTTPException(status_code=504, detail=str(exc)) from exc
