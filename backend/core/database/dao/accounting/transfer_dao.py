from datetime import date
from typing import List

from backend.core.database.models import Transfer
from backend.core.database.session import DBSession
from backend.api.schemas.accounting.transfer_schema import TransferModifySchema


class TransferDao:
    def __init__(self, db_session: DBSession) -> None:
        self.db_session = db_session

    def create(self, transfer: TransferModifySchema) -> Transfer:
        to_add = Transfer(
            amount=transfer.amount,
            date=transfer.date,
            source_id=transfer.source_id,
            target_id=transfer.target_id
        )

        self.db_session.add(to_add)

        return to_add

    def get_all_with(self,
                     amount: float = None,
                     entry_date: date = None,
                     source_name: str = None,
                     target_name: str = None
                     ) -> List[Transfer]:
        query = self.db_session.query(Transfer)

        if amount is not None:
            query = query.where(Transfer.amount == amount)

        if entry_date is not None:
            query = query.where(Transfer.date == entry_date)

        if source_name is not None:
            query = query.where(Transfer.source.name == source_name)

        if target_name is not None:
            query = query.where(Transfer.target.name == target_name)

        return query.all()

    def get_by_id(self, id: int) -> Transfer:
        transfer = (self.db_session
                    .query(Transfer)
                    .where(Transfer.id == id)
                    .one_or_none())

        if transfer is None:
            raise

        return transfer

    def update(self, id: int, transfer: TransferModifySchema) -> Transfer:
        to_update = self.get_by_id(id)

        to_update.amount = transfer.amount
        to_update.date = transfer.date
        to_update.source_id = transfer.source_id
        to_update.target_id = transfer.target_id

        return to_update

    def delete(self, id: int) -> None:
        to_delete = self.get_by_id(id)
        self.db_session.delete(to_delete)
