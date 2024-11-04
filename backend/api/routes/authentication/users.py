from typing import List
from http import HTTPStatus

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.exc import IntegrityError

from backend.core.auth.token import Token
from backend.core.database.dao.authentication.user_dao import UserDao
from backend.core.database.dao import NotFoundException
from backend.core.database.transaction import DBTransaction
from backend.core.auth.authorisation import get_and_validate_user
from backend.api.schemas.authentication.user_schema import UserSchema, UserModifySchema, RestrictedUserModifySchema
from backend.api.schemas.authentication.role_schema import RoleSchema, RoleEnum

router = APIRouter()


@router.post("", status_code=HTTPStatus.CREATED)
async def create_restricted_user(
        user: RestrictedUserModifySchema,
        transaction: DBTransaction,
        user_dao: UserDao = Depends()
) -> UserSchema:
    """
    Authorisation: none
    """

    if user_dao.exists(user.username):
        raise HTTPException(
            status_code=HTTPStatus.CONFLICT,
            detail=f"Username {user.username} already exists"
        )

    try:
        with transaction.start():
            created = user_dao.restricted_create(user)
    except IntegrityError:
        raise HTTPException(status_code=HTTPStatus.CONFLICT,
                            detail=f"E-Mail '{user.email}' are already existing")

    return UserSchema.from_model(created)


@router.post("/{username}", status_code=HTTPStatus.CREATED,
             dependencies=[Depends(get_and_validate_user(RoleEnum.Administrator))])
async def create_user(
        username: str,
        user: UserModifySchema,
        transaction: DBTransaction,
        user_dao: UserDao = Depends()
) -> UserSchema:
    """
    Authorisation: at least 'Administrator' is required
    """

    if not username == user.username:
        raise HTTPException(status_code=HTTPStatus.CONFLICT,
                            detail=f"Given usernames '{username}' and '{user.username}' have to match")

    if not RoleSchema.validate_role_id(user.role_id):
        raise HTTPException(status_code=HTTPStatus.BAD_REQUEST, detail=f"Role id #{user.role_id} does not exist")

    if user_dao.exists(user.username):
        raise HTTPException(
            status_code=HTTPStatus.CONFLICT,
            detail=f"Username {user.username} already exists"
        )

    try:
        with transaction.start():
            created = user_dao.create(user)
    except IntegrityError:
        raise HTTPException(status_code=HTTPStatus.CONFLICT,
                            detail=f"E-Mail '{user.email}' are already existing")

    return UserSchema.from_model(created)


@router.get("/me", dependencies=[Depends(get_and_validate_user(RoleEnum.User))])
async def get_your_user(
        token: Token = Depends(),
        user_dao: UserDao = Depends()
) -> UserSchema:
    """
    Authorisation: at least 'User' is required
    """

    try:
        user = user_dao.get_by_username(token.username)
    except NotFoundException as e:
        raise HTTPException(status_code=e.status_code, detail=e.detail)

    return UserSchema.from_model(user)


@router.get("", dependencies=[Depends(get_and_validate_user(RoleEnum.Editor))])
async def get_users(
        user_dao: UserDao = Depends()
) -> List[UserSchema]:
    """
    Authorisation: at least 'Editor' is required
    """

    users = [UserSchema.from_model(user) for user in user_dao.get_all_with()]

    return sorted(users, key=lambda user: user.username)


@router.get("/{username}", dependencies=[Depends(get_and_validate_user(RoleEnum.Viewer))])
async def get_user_by_username(
        username: str,
        user_dao: UserDao = Depends()
) -> UserSchema:
    """
    Authorisation: at least 'Viewer' is required
    """

    try:
        user = user_dao.get_by_username(username)
    except NotFoundException as e:
        raise HTTPException(status_code=e.status_code, detail=e.detail)

    return UserSchema.from_model(user)


@router.patch("/me", dependencies=[Depends(get_and_validate_user(RoleEnum.User))])
async def update_your_user(
        user: RestrictedUserModifySchema,
        transaction: DBTransaction,
        token: Token = Depends(),
        user_dao: UserDao = Depends()
) -> UserSchema:
    """
    Authorisation: at least 'User' is required
    """

    if not token.username == user.username:
        raise HTTPException(status_code=HTTPStatus.CONFLICT,
                            detail=f"Given usernames '{token.username}' and '{user.username}' have to match")

    try:
        with transaction.start():
            updated = user_dao.restricted_update(token.username, user)
    except NotFoundException as e:
        raise HTTPException(status_code=e.status_code, detail=e.detail)
    except IntegrityError as e:
        raise HTTPException(status_code=HTTPStatus.CONFLICT, detail=e.detail)

    return UserSchema.from_model(updated)


@router.patch("/{username}", dependencies=[Depends(get_and_validate_user(RoleEnum.Administrator))])
async def update_user(
        username: str,
        user: UserModifySchema,
        transaction: DBTransaction,
        user_dao: UserDao = Depends()
) -> UserSchema:
    """
    Authorisation: at least 'Administrator' is required
    """

    if not username == user.username:
        raise HTTPException(status_code=HTTPStatus.CONFLICT,
                            detail=f"Given usernames '{username}' and '{user.username}' have to match")

    if not RoleSchema.validate_role_id(user.role_id):
        raise HTTPException(status_code=HTTPStatus.BAD_REQUEST, detail=f"Role id #{user.role_id} does not exist")

    try:
        with transaction.start():
            updated = user_dao.update(username, user)
    except NotFoundException as e:
        raise HTTPException(status_code=e.status_code, detail=e.detail)
    except IntegrityError as e:
        raise HTTPException(status_code=HTTPStatus.CONFLICT, detail=e.detail)

    return UserSchema.from_model(updated)


@router.delete("/me", status_code=HTTPStatus.NO_CONTENT,
               dependencies=[Depends(get_and_validate_user(RoleEnum.User))])
async def delete_your_user(
        transaction: DBTransaction,
        token: Token = Depends(),
        user_dao: UserDao = Depends()
) -> None:
    """
    Authorisation: at least 'User' is required
    """

    try:
        with transaction.start():
            user_dao.delete(token.username)
    except NotFoundException as e:
        raise HTTPException(status_code=e.status_code, detail=e.detail)


@router.delete("/{username}", status_code=HTTPStatus.NO_CONTENT,
               dependencies=[Depends(get_and_validate_user(RoleEnum.Administrator))])
async def delete_user(
        username: str,
        transaction: DBTransaction,
        user_dao: UserDao = Depends()
) -> None:
    """
    Authorisation: at least 'Administrator' is required
    """

    try:
        with transaction.start():
            user_dao.delete(username)
    except NotFoundException as e:
        raise HTTPException(status_code=e.status_code, detail=e.detail)
