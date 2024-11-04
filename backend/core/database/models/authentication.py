from typing import Optional, List

from sqlalchemy import ForeignKey
from sqlalchemy.orm import relationship

from backend.core.database.models.__init__ import *


class Role(Base):
    __tablename__ = "t_role"
    __table_args__ = {'schema': 'authentication'}

    id: Mapped[serial_pk]
    priority: Mapped[int]
    name: Mapped[str_16]

    users: Mapped[Optional[List["User"]]] = relationship("User", back_populates="role")


class User(Base):
    __tablename__ = "t_user"
    __table_args__ = {'schema': 'authentication'}

    id: Mapped[serial_pk]
    password: Mapped[str_64]
    first_name: Mapped[str_64]
    last_name: Mapped[str_64]
    email: Mapped[str_64]
    username: Mapped[str_16]
    role_id: Mapped[int] = mapped_column(ForeignKey('authentication.t_role.id'))

    role: Mapped[Optional["Role"]] = relationship("Role", back_populates="users")
