from typing import List

from starlette.status import HTTP_404_NOT_FOUND

from backend.core.database.models import Role
from backend.core.database.session import DBSession


class RoleDao:
    def __init__(self, db_session: DBSession) -> None:
        self.db_session = db_session

    def get_all_with(self,
                     name: str = None,
                     priority: int = None
                     ) -> List[Role]:
        query = self.db_session.query(Role)

        if name is not None:
            query = query.where(Role.name == name)

        if priority is not None:
            query = query.where(Role.priority == priority)

        return query.all()

    def get_by_id(self, role_id: int) -> Role:
        role = (self.db_session
                .query(Role)
                .where(Role.id == role_id)
                .one_or_none())

        if not role:
            raise RoleDao.NotFoundException(f"Role with id #{role_id} not found")

        return role

    class NotFoundException(Exception):
        def __init__(self, detail: str):
            self.status_code = HTTP_404_NOT_FOUND
            self.detail = detail
