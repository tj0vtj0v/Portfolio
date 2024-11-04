from pydantic import BaseModel

from backend.core.database.models.proximity import Device


class DeviceSchema(BaseModel):
    name: str

    @staticmethod
    def from_model(device: Device) -> "DeviceSchema":
        return DeviceSchema(
            name=device.name
        )
