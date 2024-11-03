from typing import List
from http import HTTPStatus

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.exc import IntegrityError

from backend.core.database.dao.generals import NotFoundException
from backend.core.database.dao.hayday.evaluation_dao import EvaluationDao
from backend.core.database.transaction import DBTransaction
from backend.core.auth.authorisation import get_and_validate_user
from backend.api.schemas.authentication.role_schema import RoleEnum
from backend.api.schemas.hayday.evaluation_schema import EvaluationSchema, EvaluationModifySchema

router = APIRouter()


@router.post("", status_code=HTTPStatus.CREATED, dependencies=[Depends(get_and_validate_user(RoleEnum.Editor))])
async def create_evaluation(
        evaluation: EvaluationModifySchema,
        transaction: DBTransaction,
        evaluation_dao: EvaluationDao = Depends()
) -> EvaluationSchema:
    """
    Authorisation: at least 'Editor' is required
    """

    try:
        with transaction.start():
            created = evaluation_dao.create(evaluation)
    except IntegrityError as e:
        raise HTTPException(status_code=HTTPStatus.CONFLICT, detail=e.detail)

    return EvaluationSchema.from_model(created)


@router.get("", dependencies=[Depends(get_and_validate_user(RoleEnum.User))])
async def get_evaluations(
        complete_time: float = None,
        no_crops_time: float = None,
        profit: float = None,
        complete_experience: int = None,
        evaluation_dao: EvaluationDao = Depends()
) -> List[EvaluationSchema]:
    """
    Authorisation: at least 'User' is required
    """

    raw_data = evaluation_dao.get_all_with(complete_time, no_crops_time, profit, complete_experience)

    evaluations = [EvaluationSchema.from_model(evaluation) for evaluation in raw_data]

    return sorted(evaluations, key=lambda evaluation: (evaluation.complete_time, evaluation.profit))


@router.patch("/{name}", dependencies=[Depends(get_and_validate_user(RoleEnum.Editor))])
async def update_evaluation(
        name: str,
        evaluation: EvaluationModifySchema,
        transaction: DBTransaction,
        evaluation_dao: EvaluationDao = Depends()
) -> EvaluationSchema:
    """
    Authorisation: at least 'Editor' is required
    """

    try:
        with transaction.start():
            updated = evaluation_dao.update(name, evaluation)
    except NotFoundException as e:
        raise HTTPException(status_code=e.status_code, detail=e.detail)
    except IntegrityError as e:
        raise HTTPException(status_code=HTTPStatus.CONFLICT, detail=e.detail)

    return EvaluationSchema.from_model(updated)


@router.delete("/{name}", status_code=HTTPStatus.NO_CONTENT,
               dependencies=[Depends(get_and_validate_user(RoleEnum.Editor))])
async def delete_evaluation(
        name: str,
        transaction: DBTransaction,
        evaluation_dao: EvaluationDao = Depends()
) -> None:
    """
    Authorisation: at least 'Editor' is required
    """

    try:
        with transaction.start():
            evaluation_dao.delete(name)
    except NotFoundException as e:
        raise HTTPException(status_code=e.status_code, detail=e.detail)
