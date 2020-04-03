import classNames from "classnames";
import { sleep } from "common/promise";
import { lineage, Species } from "core/species";
import { useAppReducer } from "game/app";
import { resetGame, save } from "game/app/saveLoad";
import { mitoOverworld } from "game/audio";
import { Button } from "game/ui/common/Button";
import PhylogeneticTree from "game/ui/overworld/PhylogeneticTree";
import React, { useCallback, useEffect, useState } from "react";
import { GiFamilyTree } from "react-icons/gi";
import ReactModal from "react-modal";
import { HexTile } from "../../core/overworld/hexTile";
import { EpochUI } from "../ui/overworld/EpochUI";
import { OverWorldMap } from "../ui/overworld/map/OverWorldMap";
import "./OverWorldScreen.scss";
import { SpeciesViewer } from "./SpeciesViewer";

export interface OverWorldScreenProps {
  onNextEpoch: () => void;
}

const OverWorldScreen = React.memo(({ onNextEpoch }: OverWorldScreenProps) => {
  useEffect(() => {
    mitoOverworld.play();
    return () => {
      mitoOverworld.stop();
    };
  }, []);

  const [leftPanelOpen, setLeftPanelOpen] = useState(false);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.code === "Tab") {
        setLeftPanelOpen((open) => !open);
        e.preventDefault();
      }
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  const [viewedSpecies, setViewedSpecies] = useState<Species>();

  const handleStartMutate = useCallback((s: Species) => {
    setViewedSpecies(s);
  }, []);

  const [{ rootSpecies }] = useAppReducer();

  function maybeRenderPhylogeneticTreePanel() {
    const unusedPoints = lineage(rootSpecies)
      .map((x) => x.freeMutationPoints)
      .reduce((a, b) => a + b);
    const unusedPointsEl = unusedPoints > 0 ? <div className="unused-points">{unusedPoints}</div> : null;
    return (
      <div className={classNames("panel-left", { open: leftPanelOpen })}>
        {leftPanelOpen ? <PhylogeneticTree onMutate={handleStartMutate} /> : null}
        <button className="panel-left-handle" onClick={() => setLeftPanelOpen((open) => !open)}>
          <GiFamilyTree className="icon" />
          {unusedPointsEl}
        </button>
      </div>
    );
  }

  const closeGenomeViewer = useCallback(() => {
    setViewedSpecies(undefined);
  }, []);
  function maybeRenderSpeciesViewer() {
    return (
      <ReactModal
        ariaHideApp={false}
        isOpen={viewedSpecies != null}
        shouldCloseOnEsc
        shouldCloseOnOverlayClick
        onRequestClose={closeGenomeViewer}
        className="species-viewer-modal"
      >
        {viewedSpecies != null ? (
          <>
            <button className="close" onClick={closeGenomeViewer}>
              ✖
            </button>
            <SpeciesViewer species={viewedSpecies} />
          </>
        ) : null}
      </ReactModal>
    );
  }

  const [focusedHex, setFocusedHex] = useState<HexTile | undefined>(undefined);
  const handleFocusHex = useCallback((hex: HexTile) => {
    setFocusedHex(hex);
  }, []);

  const [appState] = useAppReducer();

  const handleOnNextEpoch = React.useCallback(() => {
    onNextEpoch();
    sleep(4500).then(() => {
      // TODO add a UI to let you mutate multiple species
      const speciesReadyToMutate = lineage(rootSpecies).filter((species) => species.freeMutationPoints > 0);
      setViewedSpecies(speciesReadyToMutate[0]);
    });
  }, [onNextEpoch, rootSpecies]);

  return (
    <div className="overworld-screen">
      <OverWorldMap focusedHex={focusedHex} />
      {maybeRenderPhylogeneticTreePanel()}
      {maybeRenderSpeciesViewer()}
      <EpochUI onNextEpoch={handleOnNextEpoch} onFocusHex={handleFocusHex} />
      <div style={{ position: "absolute", right: "10px", top: "10px" }}>
        <Button onClick={() => save(appState)}>Save</Button>
      </div>
      <div style={{ position: "absolute", right: "10px", top: "60px" }}>
        <Button onClick={() => resetGame()}>Reset Game</Button>
      </div>
    </div>
  );
});

export default OverWorldScreen;
