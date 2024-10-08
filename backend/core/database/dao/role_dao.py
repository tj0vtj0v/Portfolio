from typing import List

from starlette.status import HTTP_404_NOT_FOUND

from backend.core.database.models import Role
from backend.core.database.session import DBSession


class RoleDao:
    def __init__(self, db_session: DBSession):
        self.db_session = db_session

    def get_by_id(self, role_id: int) -> Role:
        role = (self.db_session
                .query(Role)
                .where(Role.id == role_id)
                .one_or_none())

        if not role:
            raise RoleDao.RoleNotFoundException(f"Role with id #{role_id} not found")

        return role

    def get_by_name(self, name: str) -> Role:
        role = (self.db_session
                .query(Role)
                .where(Role.name == name)
                .one_or_none())

        if not role:
            raise RoleDao.RoleNotFoundException(f"Role with name '{name}' not found")

        return role

    def get_by_priority(self, priority: str) -> Role:
        role = (self.db_session
                .query(Role)
                .where(Role.priority == priority)
                .one_or_none())

        if not role:
            raise RoleDao.RoleNotFoundException(f"Role with priority '{priority}' not found")

        return role

    def get_all(self) -> List[Role]:
        roles = (self.db_session
                 .query(Role)
                 .all())

        return roles

    class RoleNotFoundException(Exception):
        def __init__(self, detail: str):
            self.status_code = HTTP_404_NOT_FOUND
            self.detail = detail
