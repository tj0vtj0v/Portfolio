from typing import List
from http import HTTPStatus

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.exc import IntegrityError

from backend.api.schemas.authentication.role_schema import RoleEnum
from backend.core.database.dao.accounting.account_dao import AccountDao
from backend.core.database.dao import NotFoundException
from backend.core.database.transaction import DBTransaction
from backend.core.auth.authorisation import get_and_validate_user
from backend.api.schemas.accounting.account_schema import AccountSchema

router = APIRouter()


@router.post("", status_code=HTTPStatus.CREATED, dependencies=[Depends(get_and_validate_user(RoleEnum.Editor))])
async def create_account(
        account: AccountSchema,
        transaction: DBTransaction,
        account_dao: AccountDao = Depends()
) -> AccountSchema:
    """
    Authorisation: at least 'Editor' is required
    """

    try:
        with transaction.start():
            created = account_dao.create(account)
    except IntegrityError as e:
        raise HTTPException(status_code=HTTPStatus.CONFLICT, detail=e.detail)

    return AccountSchema.from_model(created)


@router.get("/accounts", dependencies=[Depends(get_and_validate_user(RoleEnum.Viewer))])
async def get_accounts(
        account_dao: AccountDao = Depends()
) -> List[str]:
    """
    Authorisation: at least 'Viewer' is required
    """

    accounts = account_dao.get_accounts()

    return sorted(accounts)


@router.get("/{name}", dependencies=[Depends(get_and_validate_user(RoleEnum.Viewer))])
async def get_account_by_name(
        name: str,
        account_dao: AccountDao = Depends()
) -> AccountSchema:
    """
    Authorisation: at least 'Viewer' is required
    """

    try:
        account = account_dao.get_by_name(name)
    except NotFoundException as e:
        raise HTTPException(status_code=e.status_code, detail=e.detail)

    return AccountSchema.from_model(account)


@router.patch("/{name}", dependencies=[Depends(get_and_validate_user(RoleEnum.Editor))])
async def update_account(
        name: str,
        account: AccountSchema,
        transaction: DBTransaction,
        account_dao: AccountDao = Depends()
) -> AccountSchema:
    """
    Authorisation: at least 'Editor' is required
    """

    try:
        with transaction.start():
            updated = account_dao.update(name, account)
    except NotFoundException as e:
        raise HTTPException(status_code=e.status_code, detail=e.detail)
    except IntegrityError as e:
        raise HTTPException(status_code=HTTPStatus.CONFLICT, detail=e.detail)

    return AccountSchema.from_model(updated)


@router.delete("/{name}", status_code=HTTPStatus.NO_CONTENT,
               dependencies=[Depends(get_and_validate_user(RoleEnum.Editor))])
async def delete_account(
        name: str,
        transaction: DBTransaction,
        account_dao: AccountDao = Depends()
) -> None:
    """
    Authorisation: at least 'Editor' is required
    """

    try:
        with transaction.start():
            account_dao.delete(name)
    except NotFoundException as e:
        raise HTTPException(status_code=e.status_code, detail=e.detail)
