import * as React from "react";

import { Action } from "../action";
import { Air, Leaf, Root, Soil, Tissue } from "../game/tile";
import TileHighlight from "./tileHighlight";
import { Tutorial } from "./tutorial";
import { findBuildCandidateTiles } from "../game/worldUtils";

export class TutorialBuildTissue extends Tutorial {
  state = {
    counter: 0,
  };
  render() {
    const buildCandidateHighlights: JSX.Element[] = [];
    for (const candidate of findBuildCandidateTiles(this.props.mito.world)) {
      buildCandidateHighlights.push(
        <TileHighlight
          key={candidate.pos.x + "," + candidate.pos.y}
          x={candidate.pos.x}
          y={candidate.pos.y}
          scene={this.props.scene}
        />
      );
    }

    return (
      <>
        {buildCandidateHighlights}

        <div className="tutorial-build tutorial-build-tissue">
          Build <b>Tissue (T) to grow</b>.
        </div>
      </>
    );
  }

  onActionPerformed(action: Action) {
    if (action.type === "build" && action.cellType === Tissue) {
      this.setState({ counter: this.state.counter + 1 });
    }
  }

  isFulfilled() {
    return this.state.counter >= 3;
  }
}

export class TutorialBuildRoot extends Tutorial {
  state = {
    counter: 0,
  };
  constructor(props: any) {
    super(props);
    // BUILD_HOTKEYS.r = Root;
  }
  render() {
    const buildCandidateHighlights: JSX.Element[] = [];
    for (const candidate of findBuildCandidateTiles(this.props.mito.world, (t) => t instanceof Soil)) {
      buildCandidateHighlights.push(
        <TileHighlight
          key={candidate.pos.x + "," + candidate.pos.y}
          x={candidate.pos.x}
          y={candidate.pos.y}
          scene={this.props.scene}
        />
      );
    }

    return (
      <>
        {buildCandidateHighlights}

        <div className="tutorial-build tutorial-build-root">
          Great job! Now, build <b>Roots (R) to gather water</b>.
        </div>
      </>
    );
  }

  onActionPerformed(action: Action) {
    if (action.type === "build" && action.cellType === Root) {
      this.setState({ counter: this.state.counter + 1 });
    }
  }

  isFulfilled() {
    return this.state.counter >= 3;
  }
}

export class TutorialBuildLeaf extends Tutorial {
  state = {
    counter: 0,
  };
  constructor(props: any) {
    super(props);
    // BUILD_HOTKEYS.f = Leaf;
  }
  render() {
    const buildCandidateHighlights: JSX.Element[] = [];
    for (const candidate of findBuildCandidateTiles(this.props.mito.world, (t) => t instanceof Air)) {
      buildCandidateHighlights.push(
        <TileHighlight
          key={candidate.pos.x + "," + candidate.pos.y}
          x={candidate.pos.x}
          y={candidate.pos.y}
          scene={this.props.scene}
        />
      );
    }

    return (
      <>
        {buildCandidateHighlights}

        <div className="tutorial-build tutorial-build-leaf">
          Fantastic. build <b>Leaf (F) to convert Water to Sugar</b>.
        </div>
      </>
    );
  }

  onActionPerformed(action: Action) {
    if (action.type === "build" && action.cellType === Leaf) {
      this.setState({ counter: this.state.counter + 1 });
    }
  }

  isFulfilled() {
    return this.state.counter >= 3;
  }
}