import os
from dotenv import load_dotenv

load_dotenv("../.env")

JWT_SECRET = "test"#os.getenv("JWT_SECRET")
