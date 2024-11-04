from pydantic import BaseModel

from backend.core.database.models.hayday import AnimalSteps


class AnimalStepsSchema(BaseModel):
    name: str
    level: int
    experience: int
    cooldown: float
    step_value: int

    @staticmethod
    def from_model(animal_step: AnimalSteps) -> "AnimalStepsSchema":
        return AnimalStepsSchema(
            name=animal_step.name,
            level=animal_step.level,
            experience=animal_step.experience,
            cooldown=animal_step.cooldown,
            step_value=animal_step.step_value
        )
