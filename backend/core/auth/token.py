from datetime import datetime

from fastapi import Depends
from jose import jwt

from backend.api.routes.authentication.login import oauth2_scheme
from backend.settings.config import JWT_SECRET


class Token:
    username: str
    ttl: datetime

    def __init__(self, data=Depends(oauth2_scheme)):
        decoded_data = jwt.decode(data, key=JWT_SECRET)

        self.username = decoded_data["username"]
        self.ttl = datetime.fromtimestamp(float(decoded_data["TTL"]))
