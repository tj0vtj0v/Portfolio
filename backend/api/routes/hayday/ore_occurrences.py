from typing import List
from http import HTTPStatus

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.exc import IntegrityError

from backend.core.database.dao.hayday.ore_occurence_dao import OreOccurrenceDao
from backend.core.database.transaction import DBTransaction
from backend.core.auth.authorisation import get_and_validate_user
from backend.api.schemas.authentication.role_schema import RoleEnum
from backend.api.schemas.hayday.ore_occurrence_schema import OreOccurrenceSchema

router = APIRouter()


@router.post("", status_code=HTTPStatus.CREATED, dependencies=[Depends(get_and_validate_user(RoleEnum.Editor))])
async def create_ore_occurrence(
        ore_occurrence: OreOccurrenceSchema,
        transaction: DBTransaction,
        ore_occurrence_dao: OreOccurrenceDao = Depends()
) -> OreOccurrenceSchema:
    """
    Authorisation: at least 'Editor' is required
    """

    try:
        with transaction.start():
            created = ore_occurrence_dao.create(ore_occurrence)
    except IntegrityError as e:
        raise HTTPException(status_code=HTTPStatus.CONFLICT, detail=e.detail)

    return OreOccurrenceSchema.from_model(created)


@router.get("", dependencies=[Depends(get_and_validate_user(RoleEnum.User))])
async def get_ore_occurrences(
        ore_occurrence_dao: OreOccurrenceDao = Depends()
) -> List[OreOccurrenceSchema]:
    """
    Authorisation: at least 'User' is required
    """

    ore_occurrences = [OreOccurrenceSchema.from_model(ore_occurrence) for ore_occurrence in
                       ore_occurrence_dao.get_all()]

    return sorted(ore_occurrences, key=lambda ore_occurrence: ore_occurrence.tool)


@router.get("/{tool}", dependencies=[Depends(get_and_validate_user(RoleEnum.User))])
async def get_ore_occurrence_by_tool(
        tool: str,
        ore_occurrence_dao: OreOccurrenceDao = Depends()
) -> OreOccurrenceSchema:
    """
    Authorisation: at least 'User' is required
    """

    try:
        ore_occurrence = ore_occurrence_dao.get_by_tool(tool)
    except OreOccurrenceDao.NotFoundException as e:
        raise HTTPException(status_code=e.status_code, detail=e.detail)

    return OreOccurrenceSchema.from_model(ore_occurrence)


@router.patch("/{tool}", dependencies=[Depends(get_and_validate_user(RoleEnum.Editor))])
async def update_ore_occurrence(
        tool: str,
        ore_occurrence: OreOccurrenceSchema,
        transaction: DBTransaction,
        ore_occurrence_dao: OreOccurrenceDao = Depends()
) -> OreOccurrenceSchema:
    """
    Authorisation: at least 'Editor' is required
    """

    try:
        with transaction.start():
            updated = ore_occurrence_dao.update(tool, ore_occurrence)
    except OreOccurrenceDao.NotFoundException as e:
        raise HTTPException(status_code=e.status_code, detail=e.detail)
    except IntegrityError as e:
        raise HTTPException(status_code=HTTPStatus.CONFLICT, detail=e.detail)

    return OreOccurrenceSchema.from_model(updated)


@router.delete("/{tool}", status_code=HTTPStatus.NO_CONTENT,
               dependencies=[Depends(get_and_validate_user(RoleEnum.Editor))])
async def delete_ore_occurrence(
        tool: str,
        transaction: DBTransaction,
        ore_occurrence_dao: OreOccurrenceDao = Depends()
) -> None:
    """
    Authorisation: at least 'Editor' is required
    """

    try:
        with transaction.start():
            ore_occurrence_dao.delete(tool)
    except OreOccurrenceDao.NotFoundException as e:
        raise HTTPException(status_code=e.status_code, detail=e.detail)
