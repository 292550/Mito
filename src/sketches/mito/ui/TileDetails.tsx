/* eslint-disable jsx-a11y/accessible-emoji */
import * as React from "react";
import { Constructor } from "../constructor";
import { Air, Cell, CellEffect, Fountain, FreezeEffect, GrowingCell, Soil, Tile } from "../game/tile";
import { GeneSoilAbsorption, SoilAbsorptionState } from "../game/tile/genes";
import { GenePhotosynthesis, PhotosynthesisState } from "../game/tile/genes/GenePhotosynthesis";
import { InventoryBar } from "./InventoryBar";
import TemperatureInfo from "./TemperatureInfo";
import "./TileDetails.scss";

interface TileDetailsProps {
  tile?: Tile;
}

function formatSeconds(seconds: number, fractionDigits = 1) {
  return `${Math.max(0, seconds).toFixed(fractionDigits)}s`;
}

export class TileDetails extends React.Component<TileDetailsProps> {
  public render() {
    const { tile } = this.props;
    if (!tile) {
      return null;
    }
    return (
      <div className="tile-details">
        {this.tileInfo(tile)}
        {this.cellInfo(tile)}
        {this.growingCellInfo(tile)}
        {this.airInfo(tile)}
        {this.soilInfo(tile)}
        {this.fountainInfo(tile)}
        {this.interactInfo(tile)}
      </div>
    );
  }
  private interactInfo(tile: Tile) {
    if (tile instanceof Cell) {
      return (
        <>
          <div className="interact-info f">Left click - interact.</div>
          <div className="interact-info">Right click - deconstruct.</div>
        </>
      );
    }
  }

  private cellInfo(tile: Tile) {
    if (tile instanceof Cell) {
      return (
        <>
          {tile.droopY * 200 > 1 ? <div className="info-cell">{(tile.droopY * 200).toFixed(0)}% droop</div> : null}
          {this.cellEffects(tile)}
          {this.geneInfos(tile)}
        </>
      );
    }
  }

  private geneInfos(cell: Cell) {
    return (
      <>
        {cell.geneInstances.map((gene) => {
          if (gene.isType(GeneSoilAbsorption)) {
            return this.soilAbsorptionInfo(gene.state);
          } else if (gene.isType(GenePhotosynthesis)) {
            return this.photosynthesisInfo(gene.state);
          } else {
            return null;
          }
        })}
      </>
    );
  }

  private soilAbsorptionInfo(state: SoilAbsorptionState) {
    return (
      <div className="info-root">
        <div>Absorbs in {formatSeconds(state.cooldown)}.</div>
        <div>{state.totalSucked.toFixed(1)} total water absorbed so far.</div>
      </div>
    );
  }
  private photosynthesisInfo(state: PhotosynthesisState) {
    return (
      <div className="info-leaf">
        <div>{(state.averageChancePerSecond * 100).toFixed(1)}% chance to photosynthesize per second.</div>
        <div>{(1 / state.averageConversionRate).toFixed(2)} water per sugar.</div>
        <div>{state.totalSugarProduced.toFixed(2)} total sugar produced so far.</div>
      </div>
    );
  }
  private airInfo(tile: Tile) {
    if (tile instanceof Air) {
      return (
        <div className="info-air">
          <div>☀️ {(tile.sunlight() * 100).toFixed(0)}%</div>
          <div>Co2 {(tile.co2() * 100).toFixed(0)}%</div>
        </div>
      );
    }
  }

  private soilInfo(tile: Tile) {
    if (tile instanceof Soil) {
      return (
        <div className="info-soil">
          <div>Depth {tile.depth}.</div>
        </div>
      );
    }
  }

  private fountainInfo(tile: Tile) {
    if (tile instanceof Fountain) {
      return (
        <div className="info-fountain">
          <div>{formatSeconds(tile.cooldown)} until next water.</div>
          <div>{tile.waterRemaining} water left.</div>
        </div>
      );
    }
  }

  private tileInfo(tile: Tile) {
    const energyInfo =
      tile instanceof Cell ? <span className="info-energy">💚&nbsp;{(tile.energy * 100).toFixed(0)}%</span> : null;
    return (
      <div className="info-tile">
        <div className="info-tile-row">
          <div className="info-tile-name">{(tile.constructor as Constructor<Tile>).displayName}</div>
          {energyInfo}
          <TemperatureInfo tile={tile} />
          <InventoryBar
            water={tile.inventory.water}
            sugar={tile.inventory.sugar}
            capacity={tile.inventory.capacity}
            format="icons"
            colored={false}
            capacityBasedWidth
          />
        </div>
      </div>
    );
  }

  private cellEffects(cell: Cell) {
    const { effects } = cell;
    if (effects.length > 0) {
      const descriptors = effects
        .map((e) => {
          const name = (e.constructor as Constructor<CellEffect>).displayName;
          if (e instanceof FreezeEffect) {
            return `${(e.percentFrozen * 100).toFixed(0)}% ${name}`;
          } else {
            return name;
          }
        })
        .join(", ");
      return <div className="info-cell">{descriptors}</div>;
    } else {
      return null;
    }
  }

  private growingCellInfo(tile: Tile) {
    if (tile instanceof GrowingCell) {
      return (
        <div className="info-growing-cell">
          {(100 - (tile.timeRemaining / tile.timeToBuild) * 100).toFixed(0)}% mature
        </div>
      );
    }
  }
}
