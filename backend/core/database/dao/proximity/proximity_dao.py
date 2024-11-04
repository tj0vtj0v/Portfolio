from datetime import datetime
from typing import List

from sqlalchemy.exc import IntegrityError

from backend.core.database.dao import NotFoundException
from backend.core.database.models.proximity import Proximity
from backend.core.database.session import DBSession
from backend.api.schemas.proximity.proximity_schema import ProximitySchema, ProximityModifySchema


class ProximityDao:
    def __init__(self, db_session: DBSession) -> None:
        self.db_session = db_session

    def exists(self, device_id: int, timestamp: datetime) -> bool:
        entry = (self.db_session
                 .query(Proximity)
                 .where(Proximity.device_id == device_id, Proximity.timestamp == timestamp)
                 .one_or_none())

        return entry is not None

    def create(self, proximity: ProximityModifySchema) -> Proximity:
        if self.exists(proximity.device_id, proximity.timestamp):
            raise IntegrityError(
                f"Device and Timestamp pair #{proximity.device_id}, '{proximity.timestamp}' already exists")

        to_add = Proximity(
            device_id=proximity.device_id,
            timestamp=proximity.timestamp,
            responsetime=proximity.responsetime
        )

        self.db_session.add(to_add)

        return to_add

    def get_all_with(self,
                     device_name: str = None,
                     timestamp: datetime = None,
                     responsetime: float = None
                     ) -> List[Proximity]:
        query = self.db_session.query(Proximity)

        if device_name is not None:
            query.where(Proximity.device.name == device_name)

        if timestamp is not None:
            query.where(Proximity.timestamp == timestamp)

        if responsetime is not None:
            query.where(Proximity.responsetime == responsetime)

        return query.all()

    def get_entry(self, device_id: int, timestamp: datetime) -> Proximity:
        entry = (self.db_session
                 .query(Proximity)
                 .where(Proximity.device_id == device_id, Proximity.timestamp == timestamp)
                 .one_or_none())

        if entry is None:
            raise NotFoundException(f"Entry from device #{device_id} at date '{timestamp}' not found")

        return entry

    def update(self, device_id: int, timestamp: datetime, update: ProximityModifySchema) -> Proximity:
        if self.exists(update.device_id, update.timestamp):
            raise IntegrityError(
                f"Device and timestamp pair #{update.device_id}, '{update.timestamp}' already exists")

        to_update = self.get_entry(device_id, timestamp)

        to_update.device_id = update.device_id
        to_update.timestamp = update.timestamp
        to_update.responsetime = update.responsetime

        return to_update

    def delete(self, device_id: int, timestamp: datetime) -> None:
        to_delete = self.get_entry(device_id, timestamp)
        self.db_session.delete(to_delete)
