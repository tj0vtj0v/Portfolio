from typing import List

from backend.core.database.dao.generals import NotFoundException
from backend.core.database.models import OreOccurrence
from backend.core.database.session import DBSession
from backend.api.schemas.hayday.ore_occurrence_schema import OreOccurrenceSchema


class OreOccurrenceDao:
    def __init__(self, db_session: DBSession) -> None:
        self.db_session = db_session

    def create(self, ore_occurrence: OreOccurrenceSchema) -> OreOccurrence:
        to_add = OreOccurrence(
            tool=ore_occurrence.tool,
            silver=ore_occurrence.silver,
            gold=ore_occurrence.gold,
            platinum=ore_occurrence.platinum,
            iron=ore_occurrence.iron,
            coal=ore_occurrence.coal,
            diamond=ore_occurrence.diamond
        )

        self.db_session.add(to_add)

        return to_add

    def get_all(self) -> List[OreOccurrence]:
        return (self.db_session
                .query(OreOccurrence)
                .all())

    def get_by_tool(self, tool: str) -> OreOccurrence:
        ore_occurrence = (self.db_session
                          .query(OreOccurrence)
                          .where(OreOccurrence.tool == tool)
                          .one_or_none())

        if ore_occurrence is None:
            raise NotFoundException(f"Ore occurrence for tool '{tool}' not found")

        return ore_occurrence

    def update(self, tool: str, update: OreOccurrenceSchema) -> OreOccurrence:
        to_update = self.get_by_tool(tool)

        to_update.tool = update.tool
        to_update.silver = update.silver
        to_update.gold = update.gold
        to_update.platinum = update.platinum
        to_update.iron = update.iron
        to_update.coal = update.coal
        to_update.diamond = update.diamond

        return to_update

    def delete(self, tool: str) -> None:
        to_delete = self.get_by_tool(tool)
        self.db_session.delete(to_delete)
