from enum import Enum

from pydantic import BaseModel

from backend.core.database.models import Role


class RoleNames(Enum):
    User = "User"
    Viewer = "Viewer"
    Editor = "Editor"
    Developer = "Developer"
    Administrator = "Administrator"


class RoleEnum(Enum):
    User = "User", 1
    Viewer = "Viewer", 2
    Editor = "Editor", 3
    Developer = "Developer", 4
    Administrator = "Administrator", 5


class RoleSchema(BaseModel):
    priority: int
    name: RoleNames

    @staticmethod
    def from_model(role: Role):
        return RoleSchema(
            priority=role.priority,
            name=role.name
        )

    @staticmethod
    def validate_role_id(role_id: int):
        return role_id in range(1, len(RoleNames.__members__) + 1)
