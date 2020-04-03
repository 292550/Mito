import classNames from "classnames";
import { lineage } from "core/species";
import { useAppReducer } from "game/app";
import DynamicNumber from "game/ui/common/DynamicNumber";
import Tooltip from "rc-tooltip";
import React, { useState } from "react";
import { GiSandsOfTime } from "react-icons/gi";
import { HexTile } from "../../../core/overworld/hexTile";
import MP from "../common/MP";
import "./EpochUI.scss";

export function EpochUI({ onNextEpoch, onFocusHex }: EpochUIProps) {
  const [{ epoch, overWorld, rootSpecies }] = useAppReducer();
  const [transitioning, setTransitioning] = useState(false);
  const handleNextEpoch = React.useCallback(() => {
    setTransitioning(true);
    setTimeout(() => setTransitioning(false), 5000);
    onNextEpoch();
  }, [onNextEpoch]);

  const speciesProductionEls: JSX.Element[] = [];
  const allSpecies = lineage(rootSpecies);
  for (const species of allSpecies) {
    // const hexes = overWorld.getHexesPopulatedBy(species);
    const pointsPerEpoch = overWorld.getMaxGenePool(species);
    speciesProductionEls.push(
      <div key={species.id}>
        <span className="species-name">{species.name}</span> +<MP amount={pointsPerEpoch} />
        {/* over{" "} {hexes.length} hexes. */}
      </div>
    );
  }

  const epochButtonTooltipContent = (
    <>
      <div>Refill mutation points on all species and re-roll mutations.</div>
      <div>Each species will get MP equal to their total production across all hexes they are habiting.</div>
    </>
  );
  return (
    <div className={classNames("epoch-display", { "ready-to-advance": false, transitioning })}>
      <h1 className="number">
        Epoch <DynamicNumber sigFigs={6} value={epoch} speed={0.08} />
      </h1>
      <div className="production-overview">{speciesProductionEls}</div>

      <Tooltip placement="left" trigger="hover" overlay={epochButtonTooltipContent}>
        <button className="button-next-epoch" onClick={handleNextEpoch} disabled={transitioning}>
          <GiSandsOfTime className="icon" />
        </button>
      </Tooltip>
    </div>
  );
}
export interface EpochUIProps {
  onNextEpoch: () => void;
  onFocusHex: (hex: HexTile) => void;
}
