from http import HTTPStatus

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.exc import IntegrityError

from backend.api.schemas.authentication.role_schema import RoleEnum
from backend.api.schemas.hayday.source_schema import SourceSchema
from backend.core.auth.authorisation import get_and_validate_user
from backend.core.database.dao.hayday.source_dao import SourceDao
from backend.core.database.transaction import DBTransaction

router = APIRouter()


@router.post("", status_code=HTTPStatus.CREATED, dependencies=[Depends(get_and_validate_user(RoleEnum.Editor))])
async def create_source(
        source: SourceSchema,
        transaction: DBTransaction,
        source_dao: SourceDao = Depends()
) -> SourceSchema:
    """
    Authorisation: at least 'Editor' is required
    """

    try:
        with transaction.start():
            created = source_dao.create(source)
    except IntegrityError as e:
        raise HTTPException(status_code=HTTPStatus.CONFLICT, detail=e.detail)

    return SourceSchema.from_model(created)


@router.get("/{name}", dependencies=[Depends(get_and_validate_user(RoleEnum.User))])
async def get_source_by_name(
        name: str,
        source_dao: SourceDao = Depends()
) -> SourceSchema:
    """
    Authorisation: at least 'User' is required
    """

    try:
        source = source_dao.get_by_name(name)
    except SourceDao.NotFoundException as e:
        raise HTTPException(status_code=e.status_code, detail=e.detail)

    return SourceSchema.from_model(source)


@router.patch("/{name}", dependencies=[Depends(get_and_validate_user(RoleEnum.Editor))])
async def update_source(
        name: str,
        source: SourceSchema,
        transaction: DBTransaction,
        source_dao: SourceDao = Depends()
) -> SourceSchema:
    """
    Authorisation: at least 'Editor' is required
    """

    try:
        with transaction.start():
            updated = source_dao.update(name, source)
    except SourceDao.NotFoundException as e:
        raise HTTPException(status_code=e.status_code, detail=e.detail)
    except IntegrityError as e:
        raise HTTPException(status_code=HTTPStatus.CONFLICT, detail=e.detail)

    return SourceSchema.from_model(updated)


@router.delete("/{name}", status_code=HTTPStatus.NO_CONTENT,
               dependencies=[Depends(get_and_validate_user(RoleEnum.Editor))])
async def delete_source(
        name: str,
        transaction: DBTransaction,
        source_dao: SourceDao = Depends()
) -> None:
    """
    Authorisation: at least 'Editor' is required
    """

    try:
        with transaction.start():
            source_dao.delete(name)
    except SourceDao.NotFoundException as e:
        raise HTTPException(status_code=e.status_code, detail=e.detail)
