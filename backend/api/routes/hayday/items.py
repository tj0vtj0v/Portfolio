from typing import List
from http import HTTPStatus

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.exc import IntegrityError

from backend.core.database.dao.hayday.item_dao import ItemDao
from backend.core.database.transaction import DBTransaction
from backend.core.auth.authorisation import get_and_validate_user
from backend.api.schemas.authentication.role_schema import RoleEnum
from backend.api.schemas.hayday.item_schema import ItemSchema, ItemModifySchema

router = APIRouter()


@router.post("", status_code=HTTPStatus.CREATED, dependencies=[Depends(get_and_validate_user(RoleEnum.Editor))])
async def create_item(
        item: ItemModifySchema,
        transaction: DBTransaction,
        item_dao: ItemDao = Depends()
) -> ItemSchema:
    """
    Authorisation: at least 'Editor' is required
    """

    try:
        with transaction.start():
            created = item_dao.create(item)
    except IntegrityError as e:
        raise HTTPException(status_code=HTTPStatus.CONFLICT, detail=e.detail)

    return ItemSchema.from_model(created)


@router.get("", dependencies=[Depends(get_and_validate_user(RoleEnum.User))])
async def get_items(
        level: int = None,
        experience: int = None,
        default_price: int = None,
        maximum_price: int = None,
        source_name: str = None,
        item_dao: ItemDao = Depends()
) -> List[ItemSchema]:
    """
    Authorisation: at least 'User' is required
    """

    raw_data = item_dao.get_all_with(level, experience, default_price, maximum_price, source_name)

    items = [ItemSchema.from_model(item) for item in raw_data]

    return sorted(items, key=lambda item: item.name)


@router.get("/{name}", dependencies=[Depends(get_and_validate_user(RoleEnum.User))])
async def get_item_by_name(
        name: str,
        item_dao: ItemDao = Depends()
) -> ItemSchema:
    """
    Authorisation: at least 'User' is required
    """

    try:
        item = item_dao.get_by_name(name)
        return ItemSchema.from_model(item)
    except ItemDao.NotFoundException as e:
        raise HTTPException(status_code=e.status_code, detail=e.detail)


@router.patch("/{name}", dependencies=[Depends(get_and_validate_user(RoleEnum.Editor))])
async def update_item(
        name: str,
        item: ItemModifySchema,
        transaction: DBTransaction,
        item_dao: ItemDao = Depends()
) -> ItemSchema:
    """
    Authorisation: at least 'Editor' is required
    """

    try:
        with transaction.start():
            updated = item_dao.update(name, item)
            return ItemSchema.from_model(updated)
    except ItemDao.NotFoundException as e:
        raise HTTPException(status_code=e.status_code, detail=e.detail)
    except IntegrityError as e:
        raise HTTPException(status_code=HTTPStatus.CONFLICT, detail=e.detail)


@router.delete("/{name}", status_code=HTTPStatus.NO_CONTENT, dependencies=[Depends(get_and_validate_user(RoleEnum.Editor))])
async def delete_item(
        name: str,
        transaction: DBTransaction,
        item_dao: ItemDao = Depends()
):
    """
    Authorisation: at least 'Editor' is required
    """

    try:
        with transaction.start():
            item_dao.delete(name)
    except ItemDao.NotFoundException as e:
        raise HTTPException(status_code=e.status_code, detail=e.detail)
