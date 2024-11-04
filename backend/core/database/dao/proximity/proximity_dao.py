from datetime import datetime
from typing import List

from sqlalchemy.exc import IntegrityError

from backend.core.database.dao import NotFoundException
from backend.core.database.models.proximity import Proximity
from backend.core.database.session import DBSession
from backend.api.schemas.proximity.proximity_schema import ProximitySchema


class ProximityDao:
    def __init__(self, db_session: DBSession) -> None:
        self.db_session = db_session

    def exists(self, device: str, timestamp: datetime) -> bool:
        entry = (self.db_session
                 .query(Proximity)
                 .where(Proximity.device == device, Proximity.timestamp == timestamp)
                 .one_or_none())

        return entry is not None

    def create(self, proximity: ProximitySchema) -> Proximity:
        if self.exists(proximity.device, proximity.timestamp):
            raise IntegrityError(
                f"Device and Timestamp pair '{proximity.device}, {proximity.timestamp}' already exists")

        to_add = Proximity(
            device=proximity.device,
            timestamp=proximity.timestamp,
            responsetime=proximity.responsetime
        )

        self.db_session.add(to_add)

        return to_add

    def get_devices(self) -> List[str]:
        return (self.db_session
                .query(Proximity.device)
                .distinct(Proximity.device)
                .all())

    def get_all_with(self,
                     device: str = None,
                     timestamp: datetime = None,
                     responsetime: float = None
                     ) -> List[Proximity]:
        query = self.db_session.query(Proximity)

        if device is not None:
            query.where(Proximity.device == device)

        if timestamp is not None:
            query.where(Proximity.timestamp == timestamp)

        if responsetime is not None:
            query.where(Proximity.responsetime == responsetime)

        return query.all()

    def get_entry(self, device: str, timestamp: datetime) -> Proximity:
        entry = (self.db_session
                 .query(Proximity)
                 .where(Proximity.device == device, Proximity.timestamp == timestamp)
                 .one_or_none())

        if entry is None:
            raise NotFoundException(f"Entry from device '{device}' at date '{timestamp}' not found")

        return entry

    def update(self, device: str, timestamp: datetime, update: ProximitySchema) -> Proximity:
        if self.exists(update.device, update.timestamp):
            raise IntegrityError(
                f"Device and timestamp pair '{update.device}, {update.timestamp}' already exists")

        to_update = self.get_entry(device, timestamp)

        to_update.device = update.device
        to_update.timestamp = update.timestamp
        to_update.responsetime = update.responsetime

        return to_update

    def delete(self, device: str, timestamp: datetime) -> None:
        to_delete = self.get_entry(device, timestamp)
        self.db_session.delete(to_delete)
