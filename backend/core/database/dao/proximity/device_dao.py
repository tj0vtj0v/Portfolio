from typing import List

from backend.core.database.dao import NotFoundException
from backend.core.database.models.proximity import Device
from backend.core.database.session import DBSession
from backend.api.schemas.proximity.device_schema import DeviceSchema


class DeviceDao:
    def __init__(self, db_session: DBSession) -> None:
        self.db_session = db_session

    def create(self, device: DeviceSchema) -> Device:
        to_add = Device(
            name=device.name
        )

        self.db_session.add(to_add)

        return to_add

    def get_all(self) -> List[Device]:
        return (self.db_session
                .query(Device)
                .all())

    def get_by_name(self, name: str) -> Device:
        device = (self.db_session
                  .query(Device)
                  .where(Device.name == name)
                  .one_or_none())

        if device is None:
            raise NotFoundException(f"Device with name '{name}' not found")

        return device

    def update(self, name: str, device: DeviceSchema) -> Device:
        to_update = self.get_by_name(name)

        to_update.name = device.name

        return to_update

    def delete(self, name: str) -> None:
        to_delete = self.get_by_name(name)
        self.db_session.delete(to_delete)
