from pydantic import BaseModel

from backend.api.schemas.role_schema import RoleSchema
from backend.core.database.models import User


class UserBaseModel(BaseModel):
    username: str
    password: str
    first_name: str
    last_name: str
    email: str


class UserSchema(UserBaseModel):
    role: RoleSchema

    @staticmethod
    def from_model(user: User):
        return UserSchema(
            username=user.username,
            password=user.password,
            first_name=user.first_name,
            last_name=user.last_name,
            email=user.email,
            role=RoleSchema.from_model(user.role)
        )


class UserModifySchema(UserBaseModel):
    role_id: int
