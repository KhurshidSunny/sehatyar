"""MongoDB Atlas / local connection via Motor."""

from motor.motor_asyncio import AsyncIOMotorClient, AsyncIOMotorDatabase

from config import get_settings

_client: AsyncIOMotorClient | None = None


def get_client() -> AsyncIOMotorClient:
    global _client
    if _client is None:
        settings = get_settings()
        _client = AsyncIOMotorClient(settings.mongo_uri)
    return _client


def get_db() -> AsyncIOMotorDatabase:
    settings = get_settings()
    return get_client()[settings.mongo_db]


async def ping_db() -> bool:
    await get_client().admin.command("ping")
    return True


async def close_db() -> None:
    global _client
    if _client is not None:
        _client.close()
        _client = None
