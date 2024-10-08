from contextlib import contextmanager
from typing import Annotated

from fastapi import Depends

from backend.core.database.session import DBSession


class Transaction:
    def __init__(self, db_session: DBSession):
        self.db_session = db_session

    @contextmanager
    def start(self):
        try:
            yield
        except Exception:
            self.db_session.rollback()
            raise
        else:
            try:
                self.db_session.commit()
            except Exception:
                self.db_session.rollback()
                raise


DBTransaction = Annotated[Transaction, Depends(Transaction)]
