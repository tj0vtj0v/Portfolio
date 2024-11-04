from backend.core.database.models.__init__ import *


class Proximity(Base):
    __tablename__ = "t_proximity"
    __table_args__ = {'schema': 'proximity'}

    id: Mapped[serial_pk]
    device: Mapped[str_17]  # TODO refactor in own table
    timestamp: Mapped[datetime]
    responsetime: Mapped[float]
