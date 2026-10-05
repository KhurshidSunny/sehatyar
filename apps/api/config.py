"""Load API settings from environment (.env)."""

from functools import lru_cache

from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )

    mongo_uri: str = Field(
        default="mongodb://localhost:27017",
        alias="MONGO_URI",
    )
    mongo_db: str = Field(default="sehatyar", alias="MONGO_DB")
    api_host: str = Field(default="0.0.0.0", alias="API_HOST")
    api_port: int = Field(default=8000, alias="API_PORT")
    cors_origins: str = Field(default="http://localhost:3000", alias="CORS_ORIGINS")
    faq_data_dir: str = Field(default="../../data/faqs", alias="FAQ_DATA_DIR")
    medicine_data_dir: str = Field(
        default="../../data/medicines",
        alias="MEDICINE_DATA_DIR",
    )
    tesseract_cmd: str | None = Field(default=None, alias="TESSERACT_CMD")

    @property
    def cors_origin_list(self) -> list[str]:
        return [o.strip() for o in self.cors_origins.split(",") if o.strip()]


@lru_cache
def get_settings() -> Settings:
    return Settings()
