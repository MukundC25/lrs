"""Database models for user feedback."""

from datetime import datetime
from typing import Optional

from sqlmodel import Field, SQLModel, create_engine, Session
from core.config import settings


class FeedbackBase(SQLModel):
    """Base feedback model."""
    item_id: str = Field(index=True)
    domain: str = Field(index=True)  # workout, recipe, course
    action: str = Field(index=True)  # like, dislike
    user_session: Optional[str] = Field(default=None, index=True)
    created_at: datetime = Field(default_factory=datetime.utcnow)


class Feedback(FeedbackBase, table=True):
    """Feedback table model."""
    id: Optional[int] = Field(default=None, primary_key=True)


class FeedbackCreate(FeedbackBase):
    """Model for creating feedback."""
    pass


class FeedbackRead(FeedbackBase):
    """Model for reading feedback."""
    id: int


# Database setup
engine = create_engine(settings.database_url, echo=False)


def create_db_and_tables():
    """Create database and tables."""
    SQLModel.metadata.create_all(engine)


def get_session():
    """Get database session."""
    with Session(engine) as session:
        yield session


# Initialize database
create_db_and_tables()
