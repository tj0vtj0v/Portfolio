from pydantic import BaseModel
from datetime import datetime

from backend.core.database.models.proximity import Proximity
from backend.api.schemas.proximity.device_schema import DeviceSchema


class _ProximityBaseSchema(BaseModel):
    timestamp: datetime
    responsetime: float


class ProximitySchema(_ProximityBaseSchema):
    device: DeviceSchema

    @staticmethod
    def from_model(proximity: Proximity) -> "ProximitySchema":
        return ProximitySchema(
            device=DeviceSchema.from_model(proximity.device),
            timestamp=proximity.timestamp,
            responsetime=proximity.responsetime
        )


class ProximityModifySchema(_ProximityBaseSchema):
    device_id: int
