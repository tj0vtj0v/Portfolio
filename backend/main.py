import uvicorn
from fastapi import FastAPI
from starlette.middleware.cors import CORSMiddleware

from backend.api.router import router
from backend import __title__, __version__

app = FastAPI(
    title=__title__,
    version=__version__,
    description="portfolio_api_poc",
    docs_url="/",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(router)


def main():
    uvicorn.run("main:app", port=8000, reload=True)


if __name__ == "__main__":
    main()
