import { nf } from "common/formatters";
import React, { memo, useRef } from "react";
import { World } from "../game";
import { TIME_PER_SEASON } from "../game/constants";
import { GenePhotosynthesis, GeneSoilAbsorption } from "../game/tile/genes";
import { ResourceIcon } from "./ResourceIcon";

const PlantStats: React.FC<{ world: World; frame: number }> = memo(({ world, frame }) => {
  const lastTotalEnergy = useRef(0);
  let numWater = 0;
  let numSugar = 0;
  let totalEnergy = 0;
  let numCells = 0;
  let totalWaterAbsorbed = 0;
  let totalSugarProduced = 0;
  for (const cell of world.allCells()) {
    numWater += cell.inventory.water;
    numSugar += cell.inventory.sugar;
    totalEnergy += cell.energy;
    numCells++;
    const soilAbsorb = cell.findGene(GeneSoilAbsorption);
    if (soilAbsorb) {
      totalWaterAbsorbed += soilAbsorb.state.totalSucked;
    }
    const photosynthesis = cell.findGene(GenePhotosynthesis);
    if (photosynthesis) {
      totalSugarProduced += photosynthesis.state.totalSugarProduced;
    }
  }
  const energyUsed = lastTotalEnergy.current - totalEnergy;
  const energyUsePerSecond = energyUsed / world.getLastStepStats().dt;
  const energyUsePerSeason = energyUsePerSecond * TIME_PER_SEASON;
  const sugarUsePerSeason = energyUsePerSeason;
  const timeUntilStarvation = totalEnergy / energyUsePerSecond;
  const averageWaterPerSeason = (totalWaterAbsorbed / world.time) * TIME_PER_SEASON;
  const averageSugarPerSeason = (totalSugarProduced / world.time) * TIME_PER_SEASON;

  lastTotalEnergy.current = totalEnergy;

  return (
    <div className="plant-stats" style={{ margin: "10px 0", textAlign: "left" }}>
      <div>
        {nf(numWater, 3)} <ResourceIcon name="water" />,{nf(numSugar, 3)} <ResourceIcon name="sugar" />
      </div>
      <div>Water per season: {nf(averageWaterPerSeason, 3)}</div>
      <div>Sugar per season: {nf(averageSugarPerSeason, 3)}</div>
      <div>Total energy: {nf(totalEnergy, 4)}</div>
      <div>Average energy: {nf((totalEnergy / numCells) * 100, 2)}%</div>
      <div>Sugar use per season: {nf(sugarUsePerSeason, 3)}</div>
      <div>Time until starvation: {nf(timeUntilStarvation, 3)} seconds.</div>
    </div>
  );
});

export default PlantStats;
