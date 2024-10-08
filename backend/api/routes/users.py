from typing import List
from http import HTTPStatus

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.exc import IntegrityError

from backend.core.auth.token import Token
from backend.core.database.dao.user_dao import UserDao
from backend.core.database.transaction import DBTransaction
from backend.core.auth.authorisation import get_and_validate_user
from backend.api.schemas.user_schema import UserSchema, UserModifySchema
from backend.api.schemas.role_schema import RoleSchema, RoleEnum

router = APIRouter(
    tags=["users"]
)


@router.get("", dependencies=[Depends(get_and_validate_user(RoleEnum.Editor))])
async def get_all_users(
    user_dao: UserDao = Depends()
) -> List[UserSchema]:
    """
    Authorisation: at least 'Editor' is required
    """

    users = [UserSchema.from_model(user) for user in user_dao.get_all()]

    return sorted(users, key=lambda user: user.username)


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
        return UserSchema.from_model(user)
    except UserDao.UserNotFoundException as e:
        raise HTTPException(status_code=e.status_code, detail=e.detail)


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
        return UserSchema.from_model(user)
    except UserDao.UserNotFoundException as e:
        raise HTTPException(status_code=e.status_code, detail=e.detail)


@router.patch("/{username}", dependencies=[Depends(get_and_validate_user(RoleEnum.Developer))])
async def update_user(
    username: str,
    user: UserModifySchema,
    transaction: DBTransaction,
    user_dao: UserDao = Depends()
) -> UserSchema:
    """
    Authorisation: at least 'Developer' is required
    """

    if not RoleSchema.validate_role_id(user.role_id):
        raise HTTPException(status_code=HTTPStatus.BAD_REQUEST.value, detail=f"role id #{user.role_id} does not exist")

    try:
        with transaction.start():
            updated = user_dao.update(username, user)
    except UserDao.UserNotFoundException as e:
        raise HTTPException(status_code=e.status_code, detail=e)

    return UserSchema.from_model(updated)


@router.patch("/me", dependencies=[Depends(get_and_validate_user(RoleEnum.User))])
async def update_your_user(
    user: UserModifySchema,
    transaction: DBTransaction,
    token: Token = Depends(),
    user_dao: UserDao = Depends()
) -> UserSchema:
    """
    Authorisation: at least 'User' is required
    """

    if not RoleSchema.validate_role_id(user.role_id):
        raise HTTPException(status_code=HTTPStatus.BAD_REQUEST.value, detail=f"role id #{user.role_id} does not exist")

    try:
        with transaction.start():
            updated = user_dao.update(token.username, user)  # TODO: Errorhandling
    except UserDao.UserNotFoundException as e:
        raise HTTPException(status_code=e.status_code, detail=e)

    return UserSchema.from_model(updated)


@router.post("", status_code=HTTPStatus.CREATED.value)
async def create_user(
    user: UserModifySchema,
    transaction: DBTransaction,
    user_dao: UserDao = Depends()
) -> UserSchema:
    """
    Authorisation: none
    """

    if not RoleSchema.validate_role_id(user.role_id):
        raise HTTPException(status_code=HTTPStatus.BAD_REQUEST.value, detail=f"role id #{user.role_id} does not exist")

    if user_dao.exists(user.username):
        raise HTTPException(
            status_code=HTTPStatus.BAD_REQUEST.value,
            detail=f"Username {user.username} already exists"
        )

    try:
        with transaction.start():
            created = user_dao.add(user)
    except IntegrityError:
        raise HTTPException(status_code=HTTPStatus.BAD_REQUEST.value,
                            detail=f"E-Mail '{user.email}' are already existing")

    return UserSchema.from_model(created)


@router.delete("/{username}", status_code=HTTPStatus.NO_CONTENT.value,
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
    except UserDao.UserNotFoundException as e:
        raise HTTPException(status_code=e.status_code, detail=e.detail)


@router.delete("/me", status_code=HTTPStatus.NO_CONTENT.value,
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
    except UserDao.UserNotFoundException as e:
        raise HTTPException(status_code=e.status_code, detail=e.detail)
