from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

    provider_timeout_seconds: float = 10.0
    research_timeout_seconds: float = 30.0
    tavily_api_key: str | None = None
    news_api_key: str | None = None
    host: str = "0.0.0.0"
    port: int = 8000


settings = Settings()
