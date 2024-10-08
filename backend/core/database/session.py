from typing import Annotated

from fastapi import Depends
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, Session

__postgres_url = "postgresql://postgres:postgres@localhost:5432/postgres"
__session = sessionmaker(create_engine(__postgres_url, connect_args={'options': f'-csearch_path=portfolio'}), autocommit=False)


def get_db():
    db = __session()
    try:
        yield db
    finally:
        db.close()


DBSession = Annotated[Session, Depends(get_db)]
