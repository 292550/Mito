import classNames from "classnames";
import * as React from "react";
import { CellBar, SwitchableBar } from "../../../input/actionBar";
import { HotkeyButton } from "../HotkeyButton";
import { TileDetails } from "../TileDetails";
import CellBarUI from "./CellBarUI";
import "./SwitchableBarUI.scss";

export interface SwitchableBarUIProps {
  bar: SwitchableBar;
}

export const SwitchableBarUI: React.FC<SwitchableBarUIProps> = ({ bar }) => {
  const { current } = bar;
  const highlightedTile = bar.interactBar.mito.highlightedTile;
  const barElement =
    current instanceof CellBar ? (
      <CellBarUI bar={current} disabled={current.mito.world.player.getBuildError()} />
    ) : highlightedTile != null ? (
      <TileDetails key={highlightedTile.toString()} tile={highlightedTile} />
    ) : null;
  const hudSwitcherHotkeyElement =
    current instanceof CellBar ? (
      <HotkeyButton className="switcher left" hotkey="⬅&nbsp;Space" onClick={() => bar.setToInteract()} />
    ) : (
      <HotkeyButton className="switcher right" hotkey="1...5&nbsp;➡" onClick={() => bar.setToBuild()} />
    );
  const currentClassName = current instanceof CellBar ? "cell" : "interact";
  return (
    <div className={classNames("switchable-bar", currentClassName)}>
      {barElement}
      {hudSwitcherHotkeyElement}
    </div>
  );
};

export default SwitchableBarUI;

export const DoubleBarUI: React.FC<SwitchableBarUIProps> = ({ bar }) => {
  return (
    <div className={classNames("double-bar")}>
      <CellBarUI bar={bar.buildBar} disabled={bar.buildBar.mito.world.player.getBuildError()} />
    </div>
  );
};
