from hashlib import sha256
from typing import List

from backend.api.schemas.authentication.role_schema import RoleEnum
from backend.core.database.dao.generals import NotFoundException
from backend.core.database.models import User
from backend.core.database.session import DBSession
from backend.api.schemas.authentication.user_schema import UserModifySchema, RestrictedUserModifySchema


class UserDao:
    def __init__(self, db_session: DBSession) -> None:
        self.db_session = db_session

    def exists(self, username: str) -> bool:
        user = (self.db_session
                .query(User)
                .where(User.username == username)
                .one_or_none())

        return user is not None

    def restricted_create(self, user: RestrictedUserModifySchema) -> User:
        to_add = User(
            username=user.username,
            password=sha256(user.password.encode()).hexdigest(),
            last_name=user.last_name,
            first_name=user.first_name,
            email=user.email,
            role_id=RoleEnum.User.value[1]
        )

        self.db_session.add(to_add)

        return to_add

    def create(self, user: UserModifySchema) -> User:
        to_add = User(
            username=user.username,
            password=sha256(user.password.encode()).hexdigest(),
            last_name=user.last_name,
            first_name=user.first_name,
            email=user.email,
            role_id=user.role_id
        )

        self.db_session.add(to_add)

        return to_add

    def get_all_with(self,
                     first_name: str = None,
                     last_name: str = None,
                     email: str = None,
                     role_name: str = None
                     ) -> List[User]:
        query = self.db_session.query(User)

        if first_name is not None:
            query = query.where(User.first_name == first_name)

        if last_name is not None:
            query = query.where(User.last_name == last_name)

        if email is not None:
            query = query.where(User.email == email)

        if role_name is not None:
            query = query.where(User.role.name == role_name)

        return query.all()

    def get_by_username(self, username: str) -> User:
        user = (self.db_session
                .query(User)
                .where(User.username == username)
                .one_or_none())

        if user is None:
            raise NotFoundException(f"User with username '{username}' not found")

        return user

    def restricted_update(self, username: str, update: RestrictedUserModifySchema) -> User:
        to_update = self.get_by_username(username)

        to_update.username = update.username
        to_update.password = sha256(update.password.encode()).hexdigest()
        to_update.first_name = update.first_name
        to_update.last_name = update.last_name
        to_update.email = update.email

        return to_update

    def update(self, username: str, update: UserModifySchema) -> User:
        to_update = self.restricted_update(username, update)

        to_update.role_id = update.role_id

        return to_update

    def delete(self, username: str) -> None:
        to_delete = self.get_by_username(username)
        self.db_session.delete(to_delete)
