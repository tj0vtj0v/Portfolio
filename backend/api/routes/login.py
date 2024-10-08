from datetime import datetime, timedelta
from http import HTTPStatus
from jose import jwt
from hashlib import sha256

from fastapi import APIRouter, Depends, HTTPException
from fastapi.security import OAuth2PasswordRequestForm, OAuth2PasswordBearer

from backend.settings.config import JWT_SECRET
from backend.core.database.dao.user_dao import UserDao

router = APIRouter(
    tags=["login"]
)

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="login")


@router.post("")
async def login(
    data: OAuth2PasswordRequestForm = Depends(),
    user_dao: UserDao = Depends()
):
    if _password_matches(data, user_dao):
        return _build_token(data)

    raise HTTPException(
        status_code=HTTPStatus.UNAUTHORIZED.value,
        detail="Incorrect username or password",
        headers={"WWW-Authenticate": "Bearer"},
    )


def _password_matches(data, user_dao: UserDao):
    target = user_dao.get_by_username(data.username).password
    current = sha256(data.password.encode()).hexdigest()
    print(current)
    return target == current


def _build_token(data: OAuth2PasswordRequestForm):
    payload = {"username": data.username}#, "valid_to": (datetime.now() + timedelta(hours=1))}
    print(type(JWT_SECRET), JWT_SECRET)
    access_token = jwt.encode(payload, key=JWT_SECRET)
    return {"access_token": access_token, "token_type": "bearer"}
