from datetime import date
from typing import List
from http import HTTPStatus

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.exc import IntegrityError

from backend.api.schemas.authentication.role_schema import RoleEnum
from backend.core.database.dao.accounting.monthly_closing_dao import MonthlyClosingDao
from backend.core.database.dao.generals import NotFoundException
from backend.core.database.transaction import DBTransaction
from backend.core.auth.authorisation import get_and_validate_user
from backend.api.schemas.accounting.monthly_closing_schema import MonthlyClosingSchema

router = APIRouter()


@router.post("", status_code=HTTPStatus.CREATED, dependencies=[Depends(get_and_validate_user(RoleEnum.Editor))])
async def create_monthly_closing(
        monthly_closing: MonthlyClosingSchema,
        transaction: DBTransaction,
        monthly_closing_dao: MonthlyClosingDao = Depends()
) -> MonthlyClosingSchema:
    """
    Authorisation: at least 'Editor' is required
    """

    try:
        with transaction.start():
            created = monthly_closing_dao.create(monthly_closing)
    except IntegrityError as e:
        raise HTTPException(status_code=HTTPStatus.CONFLICT, detail=e.detail)

    return MonthlyClosingSchema.from_model(created)


@router.get("", dependencies=[Depends(get_and_validate_user(RoleEnum.Viewer))])
async def get_monthly_closings(
        monthly_closing_dao: MonthlyClosingDao = Depends()
) -> List[MonthlyClosingSchema]:
    """
    Authorisation: at least 'Viewer' is required
    """

    monthly_closings = [MonthlyClosingSchema.from_model(monthly_closing) for monthly_closing in
                        monthly_closing_dao.get_all()]

    return sorted(monthly_closings, key=lambda monthly_closing: monthly_closing.date)


@router.patch("/{entry_date}", dependencies=[Depends(get_and_validate_user(RoleEnum.Editor))])
async def update_monthly_closing(
        entry_date: date,
        monthly_closing: MonthlyClosingSchema,
        transaction: DBTransaction,
        monthly_closing_dao: MonthlyClosingDao = Depends()
) -> MonthlyClosingSchema:
    """
    Authorisation: at least 'Editor' is required
    """

    if not entry_date == monthly_closing.date:
        raise HTTPException(status_code=HTTPStatus.CONFLICT,
                            detail=f"Given dates '{entry_date}' and '{monthly_closing.date}' have to match")

    try:
        with transaction.start():
            updated = monthly_closing_dao.update(entry_date, monthly_closing)
    except NotFoundException as e:
        raise HTTPException(status_code=e.status_code, detail=e.detail)
    except IntegrityError as e:
        raise HTTPException(status_code=HTTPStatus.CONFLICT, detail=e.detail)

    return MonthlyClosingSchema.from_model(updated)


@router.delete("/{entry_date}", status_code=HTTPStatus.NO_CONTENT,
               dependencies=[Depends(get_and_validate_user(RoleEnum.Editor))])
async def delete_monthly_closing(
        entry_date: date,
        transaction: DBTransaction,
        monthly_closing_dao: MonthlyClosingDao = Depends()
) -> None:
    """
    Authorisation: at least 'Editor' is required
    """

    try:
        with transaction.start():
            monthly_closing_dao.delete(entry_date)
    except NotFoundException as e:
        raise HTTPException(status_code=e.status_code, detail=e.detail)
