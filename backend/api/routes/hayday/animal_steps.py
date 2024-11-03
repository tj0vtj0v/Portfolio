from typing import List
from http import HTTPStatus

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.exc import IntegrityError

from backend.core.database.dao.generals import NotFoundException
from backend.core.database.dao.hayday.animal_steps_dao import AnimalStepsDao
from backend.core.database.transaction import DBTransaction
from backend.core.auth.authorisation import get_and_validate_user
from backend.api.schemas.authentication.role_schema import RoleEnum
from backend.api.schemas.hayday.animal_steps_schema import AnimalStepsSchema

router = APIRouter()


@router.post("", status_code=HTTPStatus.CREATED, dependencies=[Depends(get_and_validate_user(RoleEnum.Editor))])
async def create_animal_step(
        animal_step: AnimalStepsSchema,
        transaction: DBTransaction,
        animal_steps_dao: AnimalStepsDao = Depends()
) -> AnimalStepsSchema:
    """
    Authorisation: at least 'Editor' is required
    """

    try:
        with transaction.start():
            created = animal_steps_dao.create(animal_step)
    except IntegrityError as e:
        raise HTTPException(status_code=HTTPStatus.CONFLICT, detail=e.detail)

    return AnimalStepsSchema.from_model(created)


@router.get("", dependencies=[Depends(get_and_validate_user(RoleEnum.User))])
async def get_animal_steps(
        level: int,
        experience: int,
        cooldown: float,
        step_value: int,
        animal_steps_dao: AnimalStepsDao = Depends()
) -> List[AnimalStepsSchema]:
    """
    Authorisation: at least 'User' is required
    """

    raw_data = animal_steps_dao.get_all_with(level, experience, cooldown, step_value)

    animal_steps = [AnimalStepsSchema.from_model(animal_step) for animal_step in raw_data]

    return sorted(animal_steps, key=lambda animal_step: (animal_step.level, animal_step.name))


@router.get("/{name}", dependencies=[Depends(get_and_validate_user(RoleEnum.User))])
async def get_animal_step_by_name(
        name: str,
        animal_steps_dao: AnimalStepsDao = Depends()
) -> AnimalStepsSchema:
    """
    Authorisation: at least 'User' is required
    """

    try:
        animal_step = animal_steps_dao.get_by_name(name)
    except NotFoundException as e:
        raise HTTPException(status_code=e.status_code, detail=e.detail)

    return AnimalStepsSchema.from_model(animal_step)


@router.patch("/{name}", dependencies=[Depends(get_and_validate_user(RoleEnum.Editor))])
async def update_animal_step(
        name: str,
        animal_step: AnimalStepsSchema,
        transaction: DBTransaction,
        animal_steps_dao: AnimalStepsDao = Depends()
) -> AnimalStepsSchema:
    """
    Authorisation: at least 'Editor' is required
    """

    try:
        with transaction.start():
            updated = animal_steps_dao.update(name, animal_step)
    except NotFoundException as e:
        raise HTTPException(status_code=e.status_code, detail=e.detail)
    except IntegrityError as e:
        raise HTTPException(status_code=HTTPStatus.CONFLICT, detail=e.detail)

    return AnimalStepsSchema.from_model(updated)


@router.delete("/{name}", status_code=HTTPStatus.NO_CONTENT,
               dependencies=[Depends(get_and_validate_user(RoleEnum.Editor))])
async def delete_animal_step(
        name: str,
        transaction: DBTransaction,
        animal_steps_dao: AnimalStepsDao = Depends()
) -> None:
    """
    Authorisation: at least 'Editor' is required
    """

    try:
        with transaction.start():
            animal_steps_dao.delete(name)
    except NotFoundException as e:
        raise HTTPException(status_code=e.status_code, detail=e.detail)
