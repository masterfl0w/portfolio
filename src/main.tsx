import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import EnergizerPage from "./pages/EnergizerPage";
import "./index.css";

const isEnergizer = /^\/projects\/energizer\/?$/.test(window.location.pathname);

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    {isEnergizer ? <EnergizerPage /> : <App />}
  </React.StrictMode>,
);
