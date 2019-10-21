import React from "react";
import ReactDOM from "react-dom";
import { Switch, Route, Redirect, HashRouter } from "react-router-dom";

import App from "./App";
import * as serviceWorker from "./serviceWorker";

import 'react-dropdown/style.css'

import "./index.scss";
import { TestWinScreen } from "./tests/TestWinScreen";
import TestStats from "./tests/TestStats";

ReactDOM.render(
  <HashRouter>
    <Switch>
      <Route path="/test-win">
        <TestWinScreen />
      </Route>
      <Route path="/test-stats">
        <TestStats />
      </Route>
      <Route exact path="/">
        <App />
      </Route>
      <Route path="*">
        <Redirect to="/" />
      </Route>
    </Switch>
  </HashRouter>,

  document.getElementById("root")
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();