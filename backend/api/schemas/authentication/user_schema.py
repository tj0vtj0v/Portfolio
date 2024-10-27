from pydantic import BaseModel

from backend.core.database.models import User
from backend.api.schemas.authentication.role_schema import RoleSchema


class RestrictedUserModifySchema(BaseModel):
    username: str
    password: str
    first_name: str
    last_name: str
    email: str


class UserSchema(RestrictedUserModifySchema):
    role: RoleSchema

    @staticmethod
    def from_model(user: User) -> "UserSchema":
        return UserSchema(
            username=user.username,
            password=user.password,
            first_name=user.first_name,
            last_name=user.last_name,
            email=user.email,
            role=RoleSchema.from_model(user.role)
        )


class UserModifySchema(RestrictedUserModifySchema):
    role_id: int
