from typing import List

from fastapi import APIRouter, Depends

from backend.core.database.dao.authentication.role_dao import RoleDao
from backend.core.auth.authorisation import get_and_validate_user
from backend.api.schemas.authentication.role_schema import RoleSchema, RoleEnum

router = APIRouter()


@router.get("", dependencies=[Depends(get_and_validate_user(RoleEnum.Editor))])
async def get_roles(
        role_dao: RoleDao = Depends()
) -> List[RoleSchema]:
    """
    Authorisation: at least 'Editor' is required
    """

    roles = [RoleSchema.from_model(role) for role in role_dao.get_all_with()]

    return sorted(roles, key=lambda role: role.priority)
