from datetime import datetime, timedelta
import time
from http import HTTPStatus
from jose import jwt
from hashlib import sha256

from fastapi import APIRouter, Depends, HTTPException
from fastapi.security import OAuth2PasswordRequestForm, OAuth2PasswordBearer

from backend.settings.config import JWT_SECRET
from backend.core.database.dao.authentication.user_dao import UserDao

router = APIRouter()

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="login")


@router.post("/login")
async def login(
        data: OAuth2PasswordRequestForm = Depends(),
        user_dao: UserDao = Depends()
):
    try:
        if _password_matches(data, user_dao):
            return _build_token(data)
    except UserDao.UserNotFoundException:
        pass

    raise HTTPException(
        status_code=HTTPStatus.UNAUTHORIZED,
        detail="Incorrect username or password",
        headers={"WWW-Authenticate": "Bearer"},
    )


def _password_matches(data, user_dao: UserDao):
    target = user_dao.get_by_username(data.username).password
    current = sha256(data.password.encode()).hexdigest()
    return target == current


def _build_token(data: OAuth2PasswordRequestForm, ttl_in_minutes: int = 60):
    ttl = time.mktime((datetime.now() + timedelta(minutes=ttl_in_minutes)).timetuple())
    payload = {"username": data.username, "TTL": str(ttl)}
    access_token = jwt.encode(payload, key=JWT_SECRET)
    return {"access_token": access_token, "token_type": "bearer"}
