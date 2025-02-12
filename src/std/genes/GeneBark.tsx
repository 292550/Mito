import { TIME_PER_DAY } from "core/constants";
import { Air, DeadCell } from "core/tile";
import React from "react";
import { Gene } from "../../core/cell/gene";
import RI from "./RI";

export const GeneBark = Gene.make(
  {
    name: "Bark",
    levelCosts: [0],
    levelProps: {
      timeBeforeGrowth: TIME_PER_DAY,
    },
    static: {
      costSugar: 1,
      costWater: 1,
    },
    description: ({ timeBeforeGrowth }) => (
      <>
        <p>
          Cell costs 1<RI w />1<RI s /> more to grow.
        </p>
        <p>
          <b>{timeBeforeGrowth} seconds</b> after growth, this cell emits a Dead Cell on each directly neighboring Air.
        </p>
      </>
    ),
  },
  () => ({
    tried: false,
  }),
  (dt, { cell, state, props }) => {
    if (!state.tried && cell.age > props.timeBeforeGrowth) {
      const neighbors = cell.world.tileNeighbors(cell.pos);
      for (const tile of neighbors.array) {
        if (tile.pos.manhattanDistanceTo(cell.pos) <= 1 && Air.is(tile)) {
          const deadCell = new DeadCell(tile.pos, tile.world);
          tile.world.setTileAt(deadCell.pos, deadCell);
        }
      }
      state.tried = true;
    }
  }
);
export type GeneBark = typeof GeneBark;
