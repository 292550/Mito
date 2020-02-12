import { Air, Cell, Soil } from "../../sketches/mito/game/tile";
import { HasInventory } from "../inventory";

export function canPullResources(receiver: HasInventory, giver: HasInventory): boolean {
  // allow direct ancestors/child relationships to exchange resources with each other (e.g. Soil and Fountain)
  const hasAncestry = receiver instanceof giver.constructor || giver instanceof receiver.constructor;

  // allow all Cells to give to each other
  const areCells = receiver instanceof Cell && giver instanceof Cell;

  const areSoils = receiver instanceof Soil && giver instanceof Soil;

  // specifically allow air to give to soil
  const isAirToSoil = receiver instanceof Soil && giver instanceof Air;

  return hasAncestry || areSoils || areCells || isAirToSoil;
}