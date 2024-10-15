from hashlib import sha256
from typing import List

from http import HTTPStatus

from backend.core.database.models import User
from backend.core.database.session import DBSession
from backend.api.schemas.authentication.user_schema import UserModifySchema


class UserDao:
    def __init__(self, db_session: DBSession):
        self.db_session = db_session

    def exists(self, username: str) -> bool:
        user = (self.db_session
                .query(User)
                .where(User.username == username)
                .one_or_none())

        return user is not None

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

    def get_by_id(self, user_id: int) -> User:
        user = (self.db_session
                .query(User)
                .where(User.id == user_id)
                .one_or_none())

        if user is None:
            raise UserDao.UserNotFoundException(f"User with id #{user_id} not found")

        return user

    def get_by_email(self, email: str) -> User:
        user = (self.db_session
                .query(User)
                .where(User.email == email)
                .one_or_none())

        if user is None:
            raise UserDao.UserNotFoundException(f"User with email '{email}' not found")

        return user

    def get_by_username(self, username: str) -> User:
        user = (self.db_session
                .query(User)
                .where(User.username == username)
                .one_or_none())

        if user is None:
            raise UserDao.UserNotFoundException(f"User with username '{username}' not found")

        return user

    def get_by_role_name(self, role_name: str) -> List[User]:
        users = (self.db_session
                 .query(User)
                 # .join(Role, Role.id == User.role_id)
                 # .where(Role.name == role_name)
                 .where(User.role.name == role_name)
                 .all())

        return users

    def get_all(self) -> List[User]:
        return (self.db_session
                .query(User)
                .all())

    def update(self, username: str, update: UserModifySchema) -> User:
        to_update: User = self.get_by_username(username)

        to_update.username = update.username
        to_update.password = sha256(update.password.encode()).hexdigest()
        to_update.first_name = update.first_name
        to_update.last_name = update.last_name
        to_update.email = update.email
        to_update.role_id = update.role_id

        return to_update

    def delete(self, username: str) -> None:
        to_delete: User = self.get_by_username(username)
        self.db_session.delete(to_delete)

    class UserNotFoundException(Exception):
        def __init__(self, detail: str):
            self.status_code = HTTPStatus.NOT_FOUND
            self.detail = detail
