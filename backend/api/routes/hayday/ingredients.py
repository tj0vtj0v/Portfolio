from typing import List
from http import HTTPStatus

from fastapi import APIRouter, Depends, HTTPException

from backend.core.database.dao.hayday.ingredient_dao import IngredientDao
from backend.core.database.transaction import DBTransaction
from backend.core.auth.authorisation import get_and_validate_user
from backend.api.schemas.authentication.role_schema import RoleEnum
from backend.api.schemas.hayday.ingredients_schema import IngredientsSchema, IngredientsModifySchema

router = APIRouter()


@router.post("", status_code=HTTPStatus.CREATED, dependencies=[Depends(get_and_validate_user(RoleEnum.Editor))])
async def create_ingredients(
        ingredients: IngredientsModifySchema,
        transaction: DBTransaction,
        ingredient_dao: IngredientDao = Depends()
) -> IngredientsSchema:
    """
    Authorisation: at least 'Editor' is required
    """

    with transaction.start():
        created = ingredient_dao.create(ingredients)

    return IngredientsSchema.from_model(created)


@router.get("", dependencies=[Depends(get_and_validate_user(RoleEnum.User))])
async def get_ingredients(
        ingredient_name_1: str = None,
        ingredient_name_2: str = None,
        ingredient_name_3: str = None,
        ingredient_name_4: str = None,
        ingredient_dao: IngredientDao = Depends()
) -> List[IngredientsSchema]:
    """
    Authorisation: at least 'User' is required
    """

    raw_data = ingredient_dao.get_all_with(ingredient_name_1, ingredient_name_2, ingredient_name_3, ingredient_name_4)

    return [IngredientsSchema.from_model(ingredient) for ingredient in raw_data]


@router.patch("/{id}", dependencies=[Depends(get_and_validate_user(RoleEnum.Editor))])
async def update_ingredients(
        id: int,
        ingredient: IngredientsModifySchema,
        transaction: DBTransaction,
        ingredient_dao: IngredientDao = Depends()
) -> IngredientsSchema:
    """
    Authorisation: at least 'Editor' is required
    """

    try:
        with transaction.start():
            updated = ingredient_dao.update(id, ingredient)
    except IngredientDao.NotFoundException as e:
        raise HTTPException(status_code=e.status_code, detail=e.detail)

    return IngredientsSchema.from_model(updated)


@router.delete("/{id}", status_code=HTTPStatus.NO_CONTENT,
               dependencies=[Depends(get_and_validate_user(RoleEnum.Editor))])
async def delete_ingredients(
        id: int,
        transaction: DBTransaction,
        ingredient_dao: IngredientDao = Depends()
) -> None:
    """
    Authorisation: at least 'Editor' is required
    """

    try:
        with transaction.start():
            ingredient_dao.delete(id)
    except IngredientDao.NotFoundException as e:
        raise HTTPException(status_code=e.status_code, detail=e.detail)
