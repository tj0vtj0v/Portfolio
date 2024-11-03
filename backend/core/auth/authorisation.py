from datetime import datetime
from http import HTTPStatus

from fastapi import Depends, HTTPException

from backend.api.schemas.authentication.role_schema import RoleEnum
from backend.core.auth.token import Token
from backend.core.database.dao.authentication.user_dao import UserDao


def get_and_validate_user(
        role: RoleEnum
):
    def check_function(
            token: Token = Depends(),
            user_dao: UserDao = Depends()
    ) -> None:
        user_role = user_dao.get_by_username(token.username).role

        if user_role.priority < role.value[1]:
            raise HTTPException(
                status_code=HTTPStatus.UNAUTHORIZED.value,
                detail="Insufficient permission")

        if token.ttl < datetime.now():
            raise HTTPException(
                status_code=HTTPStatus.UNAUTHORIZED.value,
                detail="Authorisation token expired"
            )

    return check_function
