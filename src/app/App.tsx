import { MousePositionContext } from "common/useMousePosition";
import OverWorldScreen from "overworld/OverWorldScreen";
import React from "react";
import { createSelector } from "reselect";
import { Species } from "../evolution/species";
import { HexTile } from "../overworld/hexTile";
import { FullPageSketch } from "../sketches/fullPageSketch";
import Mito, { GameResult } from "../sketches/mito";
import GameResultsScreen from "../sketches/mito/ui/GameResultsScreen";
import AppStateProvider from "./AppStateProvider";
import { AppReducerContext } from "./reducer";
import { AppState, PopulationAttempt } from "./state";

interface AppComponentState {
  mousePosition: { x: number, y: number };
}

class AppComponent extends React.PureComponent<{}, AppComponentState> {
  static contextType = AppReducerContext;
  context!: React.ContextType<typeof AppReducerContext>;

  constructor(props: {}, context: any) {
    super(props, context);
    this.state = {
      mousePosition: { x: window.innerWidth / 2, y: window.innerHeight / 2 },
    };
  }

  handleMousePosition = (e: MouseEvent) => {
    this.setState({
      mousePosition: { x: e.clientX, y: e.clientY },
    });
  }

  componentDidMount() {
    document.addEventListener("mousemove", this.handleMousePosition);

    const [state, dispatch] = this.context;
    // test give first level for free
    dispatch({
      type: "AAPopulationAttemptSuccess",
      attempt: {
        settlingSpecies: state.rootSpecies,
        targetHex: state.overWorld.getStartTile(),
      },
      results: {
        status: "won", mutationPointsPerEpoch: 1, fruits: [], world: null!
      }
    });
  }

  componentWillUnmount() {
    document.removeEventListener("mousemove", this.handleMousePosition);
  }

  handlePopulationAttempt = (targetHex: HexTile, settlingSpecies: Species, sourceHex?: HexTile) => {
    const populationAttempt: PopulationAttempt = {
      settlingSpecies,
      sourceHex,
      targetHex,
    };
    const [, dispatch] = this.context;
    dispatch({
      type: "AAStartPopulationAttempt",
      populationAttempt,
    });
  };

  handleNextEpoch = () => {
    const [, dispatch] = this.context;
    dispatch({ type: "AANextEpoch" });
  }

  handleWinLoss = (result: GameResult) => {
    const [, dispatch] = this.context;
    dispatch({
      type: "AAGetGameResult",
      result,
    });
  };

  handleResultsDone = () => {
    const [, dispatch] = this.context;
    dispatch({
      type: "AAGameResultDone",
    });
  };

  render() {
    return (
      <MousePositionContext.Provider value={this.state.mousePosition}>
        <div className="App">
          {this.maybeRenderOverWorld()}
          {this.maybeRenderInGame()}
          {this.maybeRenderGameResult()}
        </div>
      </MousePositionContext.Provider>
    );
  }

  maybeRenderOverWorld() {
    const [state,] = this.context;
    if (state.activePopulationAttempt == null) {
      return (
        <OverWorldScreen
          epoch={state.epoch}
          overWorld={state.overWorld}
          rootSpecies={state.rootSpecies}
          onPopulationAttempt={this.handlePopulationAttempt}
          onNextEpoch={this.handleNextEpoch}
        />
      );
    }
  }

  private otherArgsSelector = createSelector(
    (s: AppState) => s.activePopulationAttempt,
    (activePopulationAttempt) => [activePopulationAttempt, this.handleWinLoss]
  );

  maybeRenderInGame() {
    const [state,] = this.context;
    if (state.activePopulationAttempt != null && state.activeGameResult == null) {
      return <FullPageSketch sketchClass={Mito} otherArgs={this.otherArgsSelector(state)} />;
    }
  }

  maybeRenderGameResult() {
    const [state,] = this.context;
    if (state.activeGameResult != null) {
      return <GameResultsScreen results={state.activeGameResult} onDone={this.handleResultsDone} />;
    }
  }
}

const App = () => (
  <AppStateProvider>
    <AppComponent />
  </AppStateProvider>
);

export default App;
