from http import HTTPStatus


class NotFoundException(Exception):
    def __init__(self, detail: str) -> None:
        self.status_code = HTTPStatus.NOT_FOUND
        self.detail = detail
