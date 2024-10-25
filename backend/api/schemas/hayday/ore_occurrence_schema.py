from pydantic import BaseModel

from backend.core.database.models import OreOccurrence


class OreOccurrenceSchema(BaseModel):
    tool: str
    silver: int
    gold: int
    platinum: int
    iron: int
    coal: int
    diamond: int

    @staticmethod
    def from_model(ore_probability: OreOccurrence) -> "OreOccurrenceSchema":
        return OreOccurrenceSchema(
            tool=ore_probability.tool,
            silver=ore_probability.silver,
            gold=ore_probability.gold,
            platinum=ore_probability.platinum,
            iron=ore_probability.iron,
            coal=ore_probability.coal,
            diamond=ore_probability.diamond
        )
