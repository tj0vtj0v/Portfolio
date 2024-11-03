from typing import Annotated

from fastapi import Depends
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, Session

from backend.settings.config import DATABASE_PATH

__postgres_url = f"postgresql://postgres:postgres@{DATABASE_PATH}/postgres"
__session = sessionmaker(create_engine(__postgres_url), autocommit=False)


def get_db():
    db = __session()
    try:
        yield db
    finally:
        db.close()


DBSession = Annotated[Session, Depends(get_db)]
