import classNames from "classnames";
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

  const [genomeViewerSpecies, setGenomeViewerSpecies] = useState<Species>();

  const handleStartMutate = useCallback((s: Species) => {
    // TODO fill in
    setGenomeViewerSpecies(s);
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
    setGenomeViewerSpecies(undefined);
  }, []);
  function maybeRenderGenomeViewer() {
    return (
      <ReactModal
        ariaHideApp={false}
        isOpen={genomeViewerSpecies != null}
        shouldCloseOnEsc
        shouldCloseOnOverlayClick
        onRequestClose={closeGenomeViewer}
        className="species-viewer-modal"
      >
        {genomeViewerSpecies != null ? (
          <>
            <button className="close" onClick={closeGenomeViewer}>
              ✖
            </button>
            <SpeciesViewer species={genomeViewerSpecies} />
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

  return (
    <div className="overworld-screen">
      <OverWorldMap focusedHex={focusedHex} />
      {maybeRenderPhylogeneticTreePanel()}
      {maybeRenderGenomeViewer()}
      <EpochUI onNextEpoch={onNextEpoch} onFocusHex={handleFocusHex} />
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
