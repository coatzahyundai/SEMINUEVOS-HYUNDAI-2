/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { AppProvider, useAppContext } from "./store";
import Login from "./components/Login";
import Home from "./components/Home";
import Section1 from "./components/Section1";
import Section2 from "./components/Section2";
import Section3 from "./components/Section3";

function MainRouter() {
  const { user, currentSection } = useAppContext();

  if (!user) {
    return <Login />;
  }

  switch (currentSection) {
    case 1:
      return <Section1 />;
    case 2:
      return <Section2 />;
    case 3:
      return <Section3 />;
    case 0:
    default:
      return <Home />;
  }
}

export default function App() {
  return (
    <AppProvider>
      <MainRouter />
    </AppProvider>
  );
}
