from pydantic import BaseModel
from datetime import datetime

from backend.core.database.models import Proximity


class ProximitySchema(BaseModel):
    device: str
    timestamp: datetime
    responsetime: float

    @staticmethod
    def from_model(proximity: Proximity):
        return ProximitySchema(
            device=proximity.device,
            timestamp=proximity.timestamp,
            responsetime=proximity.responsetime
        )
