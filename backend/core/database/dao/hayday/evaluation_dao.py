from typing import List

from backend.core.database.dao.generals import NotFoundException
from backend.core.database.models import Evaluation
from backend.core.database.session import DBSession
from backend.api.schemas.hayday.evaluation_schema import EvaluationModifySchema


class EvaluationDao:
    def __init__(self, db_session: DBSession) -> None:
        self.db_session = db_session

    def create(self, evaluation: EvaluationModifySchema) -> Evaluation:
        to_add = Evaluation(
            item_id=evaluation.item_id,
            complete_time=evaluation.complete_time,
            no_crops_time=evaluation.no_crops_time,
            profit=evaluation.profit,
            complete_experience=evaluation.complete_experience
        )

        self.db_session.add(to_add)

        return to_add

    def get_all_with(self,
                     complete_time: float = None,
                     no_crops_time: float = None,
                     profit: float = None,
                     complete_experience: int = None
                     ) -> List[Evaluation]:
        query = self.db_session.query(Evaluation)

        if complete_time is not None:
            query.where(Evaluation.complete_time == complete_time)

        if no_crops_time is not None:
            query.where(Evaluation.no_crops_time == no_crops_time)

        if profit is not None:
            query.where(Evaluation.profit == profit)

        if complete_experience is not None:
            query.where(Evaluation.complete_experience == complete_experience)

        return query.all()

    def get_by_name(self, name: str) -> Evaluation:
        evaluation = (self.db_session
                      .query(Evaluation)
                      .where(Evaluation.item.name == name)
                      .one_or_none())

        if evaluation is None:
            raise NotFoundException(f"Evaluation with name '{name}' not found")

        return evaluation

    def update(self, name: str, update: EvaluationModifySchema) -> Evaluation:
        to_update = self.get_by_name(name)

        to_update.item_id = update.item_id
        to_update.complete_time = update.complete_time
        to_update.no_crops_time = update.no_crops_time
        to_update.profit = update.profit
        to_update.complete_experience = update.complete_experience

        return to_update

    def delete(self, name: str) -> None:
        to_delete = self.get_by_name(name)
        self.db_session.delete(to_delete)
