from fastapi import FastAPI

from app.api.routes import router

app = FastAPI(
    title="Competitor Research API",
    description=(
        "Researches company competitors by calling multiple external APIs in parallel. "
        "Each provider has an individual timeout; the overall request has a global deadline."
    ),
    version="0.1.0",
)

app.include_router(router)
