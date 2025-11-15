import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "../styles/global.css";
import RootApp from "./RootApp.tsx";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <RootApp />
  </StrictMode>
);
