import os
from dotenv import load_dotenv

load_dotenv(".env")

JWT_SECRET = os.getenv("JWT_SECRET")
DATABASE_PATH = "raspi:5432"
DATABASE_SCHEMA = "portfolio"
