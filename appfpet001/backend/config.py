import os
from dataclasses import dataclass, field


@dataclass
class Config:
    """Default configuration for the Flask backend."""

    DB_HOST: str = field(
        default_factory=lambda: os.getenv(
            "DB_HOST", "node246727-env-6102514.sp1.br.saveincloud.net.br/"
        )
    )
    DB_PORT: int = field(default_factory=lambda: int(os.getenv("DB_PORT", "12804")))
    DB_USER: str = field(default_factory=lambda: os.getenv("DB_USER", "amm"))
    DB_PASSWORD: str = field(default_factory=lambda: os.getenv("DB_PASSWORD", "carol+211012"))
    DB_NAME: str = field(default_factory=lambda: os.getenv("DB_NAME", "dbfpet"))
    DB_AUTOCOMMIT: bool = field(default_factory=lambda: bool(int(os.getenv("DB_AUTOCOMMIT", "0"))))
    CORS_ORIGINS: list[str] = field(default_factory=lambda: os.getenv("CORS_ORIGINS", "*").split(","))

    def __post_init__(self) -> None:
        """Allow host to include port or trailing slash, e.g. host:port/."""
        host_value = self.DB_HOST.strip().rstrip("/")

        if "/" in host_value:
            host_value = host_value.split("/", 1)[0]

        if ":" in host_value:
            host_part, port_part = host_value.rsplit(":", 1)
            if port_part.isdigit():
                host_value = host_part
                self.DB_PORT = int(port_part)

        self.DB_HOST = host_value
