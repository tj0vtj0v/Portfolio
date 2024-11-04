from typing import List

from sqlalchemy.exc import IntegrityError

from backend.core.database.dao import NotFoundException
from backend.core.database.models.hayday import AnimalSteps
from backend.core.database.session import DBSession
from backend.api.schemas.hayday.animal_steps_schema import AnimalStepsSchema


class AnimalStepsDao:
    def __init__(self, db_session: DBSession) -> None:
        self.db_session = db_session

    def exists(self, name: str) -> bool:
        entry = (self.db_session
                 .query(AnimalSteps)
                 .where(AnimalSteps.name == name)
                 .one_or_none())

        return entry is not None

    def create(self, animal_step: AnimalStepsSchema) -> AnimalSteps:
        if self.exists(animal_step.name):
            raise IntegrityError(f"Animal step with name '{animal_step.name}' is already exists")

        to_add = AnimalSteps(
            name=animal_step.name,
            level=animal_step.level,
            experience=animal_step.experience,
            cooldown=animal_step.cooldown,
            step_value=animal_step.step_value
        )

        self.db_session.add(to_add)

        return to_add

    def get_all_with(self,
                     level: int = None,
                     experience: int = None,
                     cooldown: float = None,
                     step_value: int = None
                     ) -> List[AnimalSteps]:
        query = self.db_session.query(AnimalSteps)

        if level is not None:
            query.where(AnimalSteps.level == level)

        if experience is not None:
            query.where(AnimalSteps.experience == experience)

        if cooldown is not None:
            query.where(AnimalSteps.cooldown == cooldown)

        if step_value is not None:
            query.where(AnimalSteps.step_value == step_value)

        return query.all()

    def get_by_name(self, name: str) -> AnimalSteps:
        animal_step = (self.db_session
                       .query(AnimalSteps)
                       .where(AnimalSteps.name == name)
                       .one_or_none())

        if animal_step is None:
            raise NotFoundException(f"Animal with name '{name}' not found")

        return animal_step

    def update(self, name: str, update: AnimalStepsSchema) -> AnimalSteps:
        if self.exists(update.name):
            raise IntegrityError(f"Animal step with name '{update.name}' is already exists")

        to_update = self.get_by_name(name)

        to_update.name = update.name
        to_update.level = update.level
        to_update.experience = update.experience
        to_update.cooldown = update.cooldown
        to_update.step_value = update.step_value

        return to_update

    def delete(self, name: str) -> None:
        to_delete = self.get_by_name(name)
        self.db_session.delete(to_delete)
