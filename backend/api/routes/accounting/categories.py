from typing import List
from http import HTTPStatus

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.exc import IntegrityError

from backend.api.schemas.authentication.role_schema import RoleEnum
from backend.core.database.dao.accounting.category_dao import CategoryDao
from backend.core.database.dao import NotFoundException
from backend.core.database.transaction import DBTransaction
from backend.core.auth.authorisation import get_and_validate_user
from backend.api.schemas.accounting.category_schema import CategorySchema

router = APIRouter()


@router.post("", status_code=HTTPStatus.CREATED, dependencies=[Depends(get_and_validate_user(RoleEnum.Editor))])
async def create_category(
        category: CategorySchema,
        transaction: DBTransaction,
        category_dao: CategoryDao = Depends()
) -> CategorySchema:
    """
    Authorisation: at least 'Editor' is required
    """

    try:
        with transaction.start():
            created = category_dao.create(category)
    except IntegrityError as e:
        raise HTTPException(status_code=HTTPStatus.CONFLICT, detail=e.detail)

    return CategorySchema.from_model(created)


@router.get("", dependencies=[Depends(get_and_validate_user(RoleEnum.Viewer))])
async def get_categories(
        category_dao: CategoryDao = Depends()
) -> List[CategorySchema]:
    """
    Authorisation: at least 'Viewer' is required
    """

    categories = [CategorySchema.from_model(category) for category in category_dao.get_all()]

    return sorted(categories, key=lambda category: category.name)


@router.get("/{name}", dependencies=[Depends(get_and_validate_user(RoleEnum.Viewer))])
async def get_category_by_name(
        name: str,
        category_dao: CategoryDao = Depends()
) -> CategorySchema:
    """
    Authorisation: at least 'Viewer' is required
    """

    try:
        category = category_dao.get_by_name(name)
    except NotFoundException as e:
        raise HTTPException(status_code=e.status_code, detail=e.detail)

    return CategorySchema.from_model(category)


@router.patch("/{name}", dependencies=[Depends(get_and_validate_user(RoleEnum.Editor))])
async def update_category(
        name: str,
        category: CategorySchema,
        transaction: DBTransaction,
        category_dao: CategoryDao = Depends()
) -> CategorySchema:
    """
    Authorisation: at least 'Editor' is required
    """

    try:
        with transaction.start():
            updated = category_dao.update(name, category)
    except NotFoundException as e:
        raise HTTPException(status_code=e.status_code, detail=e.detail)
    except IntegrityError as e:
        raise HTTPException(status_code=HTTPStatus.CONFLICT, detail=e.detail)

    return CategorySchema.from_model(updated)


@router.delete("/{name}", status_code=HTTPStatus.NO_CONTENT,
               dependencies=[Depends(get_and_validate_user(RoleEnum.Editor))])
async def delete_category(
        name: str,
        transaction: DBTransaction,
        category_dao: CategoryDao = Depends()
) -> None:
    """
    Authorisation: at least 'Editor' is required
    """

    try:
        with transaction.start():
            category_dao.delete(name)
    except NotFoundException as e:
        raise HTTPException(status_code=e.status_code, detail=e.detail)
