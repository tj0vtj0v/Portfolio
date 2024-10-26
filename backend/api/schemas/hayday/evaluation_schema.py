from pydantic import BaseModel

from backend.core.database.models import Evaluation
from backend.api.schemas.hayday.item_ingredient_schema import ItemSchema


class _EvaluationBaseSchema(BaseModel):
    complete_time: float
    no_crops_time: float
    profit: float
    complete_experience: int


class EvaluationSchema(_EvaluationBaseSchema):
    item: ItemSchema

    @staticmethod
    def from_model(evaluation: Evaluation) -> "EvaluationSchema":
        return EvaluationSchema(
            item=ItemSchema.from_model(evaluation.item),
            complete_time=evaluation.complete_time,
            no_crops_time=evaluation.no_crops_time,
            profit=evaluation.profit,
            complete_experience=evaluation.complete_experience
        )


class EvaluationModifySchema(_EvaluationBaseSchema):
    item_id: int
