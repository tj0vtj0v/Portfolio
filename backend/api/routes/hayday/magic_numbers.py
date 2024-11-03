from typing import List
from http import HTTPStatus

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.exc import IntegrityError

from backend.core.database.dao.generals import NotFoundException
from backend.core.database.dao.hayday.magic_number_dao import MagicNumberDao
from backend.core.database.transaction import DBTransaction
from backend.core.auth.authorisation import get_and_validate_user
from backend.api.schemas.authentication.role_schema import RoleEnum
from backend.api.schemas.hayday.magic_number_schema import MagicNumberSchema

router = APIRouter()


@router.post("", status_code=HTTPStatus.CREATED, dependencies=[Depends(get_and_validate_user(RoleEnum.Editor))])
async def create_magic_number(
        magic_number: MagicNumberSchema,
        transaction: DBTransaction,
        magic_number_dao: MagicNumberDao = Depends()
) -> MagicNumberSchema:
    """
    Authorisation: at least 'Editor' is required
    """

    try:
        with transaction.start():
            created = magic_number_dao.create(magic_number)
    except IntegrityError as e:
        raise HTTPException(status_code=HTTPStatus.CONFLICT, detail=e.detail)

    return MagicNumberSchema.from_model(created)


@router.get("", dependencies=[Depends(get_and_validate_user(RoleEnum.User))])
async def get_magic_numbers(
        magic_number_dao: MagicNumberDao = Depends()
) -> List[MagicNumberSchema]:
    """
    Authorisation: at least 'User' is required
    """

    magic_numbers = [MagicNumberSchema.from_model(magic_number) for magic_number in magic_number_dao.get_all()]

    return sorted(magic_numbers, key=lambda magic_number: magic_number.level)


@router.get("/{level}", dependencies=[Depends(get_and_validate_user(RoleEnum.User))])
async def get_magic_number_by_level(
        level: int,
        magic_number_dao: MagicNumberDao = Depends()
) -> MagicNumberSchema:
    """
    Authorisation: at least 'User' is required
    """

    try:
        magic_number = magic_number_dao.get_by_level(level)
    except NotFoundException as e:
        raise HTTPException(status_code=e.status_code, detail=e.detail)

    return MagicNumberSchema.from_model(magic_number)


@router.patch("/{level}", dependencies=[Depends(get_and_validate_user(RoleEnum.Editor))])
async def update_magic_number(
        level: int,
        magic_number: MagicNumberSchema,
        transaction: DBTransaction,
        magic_number_dao: MagicNumberDao = Depends()
) -> MagicNumberSchema:
    """
    Authorisation: at least 'Editor' is required
    """

    if not level == magic_number.level:
        raise HTTPException(status_code=HTTPStatus.CONFLICT,
                            detail=f"Given levels #{level} and #{magic_number.level} have to match")

    try:
        with transaction.start():
            updated = magic_number_dao.update(level, magic_number)
    except NotFoundException as e:
        raise HTTPException(status_code=e.status_code, detail=e.detail)
    except IntegrityError as e:
        raise HTTPException(status_code=HTTPStatus.CONFLICT, detail=e.detail)

    return MagicNumberSchema.from_model(updated)


@router.delete("/{level}", status_code=HTTPStatus.NO_CONTENT,
               dependencies=[Depends(get_and_validate_user(RoleEnum.Editor))])
async def delete_magic_number(
        level: int,
        transaction: DBTransaction,
        magic_number_dao: MagicNumberDao = Depends()
) -> None:
    """
    Authorisation: at least 'Editor' is required
    """

    try:
        with transaction.start():
            magic_number_dao.delete(level)
    except NotFoundException as e:
        raise HTTPException(status_code=e.status_code, detail=e.detail)
